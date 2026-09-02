import { BaseDomain } from '../../../kernel/domain';
import { DependencyContainer } from '../../../shared/types/plugin';
import { NotificationService } from './services/notification.service';
import { MessageSentEvent, MessageReadEvent } from './events/event-coordination.events';

export class EventCoordinationDomain extends BaseDomain {
  name = 'event-coordination';

  private notificationService: NotificationService | null = null;

  async initialize(container: DependencyContainer): Promise<void> {
    await super.initialize(container);

    this.notificationService = new NotificationService(
      container.resolve(Symbol.for('IMessageRepository'))
    );

    console.log('[EventCoordinationDomain] Initialized');
  }

  getNotificationService(): NotificationService | null {
    return this.notificationService;
  }

  protected async registerDependencies(container: DependencyContainer): Promise<void> {
    container.register(Symbol.for('NotificationService'), NotificationService);
  }

  eventHandlers = {
    'MessageSentEvent': [this.handleMessageSent.bind(this)],
    'MessageReadEvent': [this.handleMessageRead.bind(this)]
  };

  private async handleMessageSent(event: any): Promise<void> {
    console.log(`[EventCoordinationDomain] Message sent: ${event.payload.subject} to ${event.payload.toId}`);
  }

  private async handleMessageRead(event: any): Promise<void> {
    console.log(`[EventCoordinationDomain] Message read by student ${event.payload.studentId}`);
  }

  async shutdown(): Promise<void> {
    console.log('[EventCoordinationDomain] Shutting down');
    this.notificationService = null;
  }
}

export const eventCoordinationDomain = new EventCoordinationDomain();