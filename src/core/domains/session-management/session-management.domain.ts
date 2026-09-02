import { BaseDomain } from '../../../kernel/domain';
import { DependencyContainer } from '../../../shared/types/plugin';
import { SessionScheduler } from './services/session-scheduler.service';
import { SessionValidator } from './services/session-validator.service';
import { SessionCreatedEvent, SessionStartedEvent, SessionCompletedEvent } from './events/session.events';

export class SessionManagementDomain extends BaseDomain {
  name = 'session-management';

  private sessionScheduler: SessionScheduler | null = null;
  private sessionValidator: SessionValidator | null = null;

  async initialize(container: DependencyContainer): Promise<void> {
    await super.initialize(container);

    this.sessionScheduler = new SessionScheduler(
      container.resolve(Symbol.for('ISessionRepository'))
    );

    this.sessionValidator = new SessionValidator();

    console.log('[SessionManagementDomain] Initialized');
  }

  getSessionScheduler(): SessionScheduler | null {
    return this.sessionScheduler;
  }

  getSessionValidator(): SessionValidator | null {
    return this.sessionValidator;
  }

  protected async registerDependencies(container: DependencyContainer): Promise<void> {
    container.register(Symbol.for('SessionScheduler'), SessionScheduler);
    container.register(Symbol.for('SessionValidator'), SessionValidator);
  }

  eventHandlers = {
    'SessionCreatedEvent': [this.handleSessionCreated.bind(this)],
    'SessionStartedEvent': [this.handleSessionStarted.bind(this)],
    'SessionCompletedEvent': [this.handleSessionCompleted.bind(this)]
  };

  private async handleSessionCreated(event: any): Promise<void> {
    console.log(`[SessionManagementDomain] Session created: ${event.payload.title} for student ${event.payload.studentId}`);
  }

  private async handleSessionStarted(event: any): Promise<void> {
    console.log(`[SessionManagementDomain] Session started for student ${event.payload.studentId}`);
  }

  private async handleSessionCompleted(event: any): Promise<void> {
    console.log(`[SessionManagementDomain] Session completed for student ${event.payload.studentId}`);
  }

  async shutdown(): Promise<void> {
    console.log('[SessionManagementDomain] Shutting down');
    this.sessionScheduler = null;
    this.sessionValidator = null;
  }
}

export const sessionManagementDomain = new SessionManagementDomain();