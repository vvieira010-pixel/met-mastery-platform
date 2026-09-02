import { BaseDomain } from '../../../kernel/domain';
import { DependencyContainer } from '../../../shared/types/plugin';
import { StudentCreatedEvent, StudentUpdatedEvent } from './events/lifecycle.events';

export class LifecycleManagementDomain extends BaseDomain {
  name = 'lifecycle-management';

  async initialize(container: DependencyContainer): Promise<void> {
    await super.initialize(container);

    console.log('[LifecycleManagementDomain] Initialized');
  }

  protected async registerDependencies(container: DependencyContainer): Promise<void> {
    // Register repositories, services here
  }

  eventHandlers = {
    'StudentCreatedEvent': [this.handleStudentCreated.bind(this)],
    'StudentUpdatedEvent': [this.handleStudentUpdated.bind(this)]
  };

  private async handleStudentCreated(event: any): Promise<void> {
    console.log(`[LifecycleManagementDomain] Student created: ${event.payload.email}`);
  }

  private async handleStudentUpdated(event: any): Promise<void> {
    console.log(`[LifecycleManagementDomain] Student updated: ${Object.keys(event.payload.changes).join(', ')}`);
  }

  async shutdown(): Promise<void> {
    console.log('[LifecycleManagementDomain] Shutting down');
  }
}

export const lifecycleManagementDomain = new LifecycleManagementDomain();