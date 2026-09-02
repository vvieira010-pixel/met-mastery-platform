import { BaseDomain } from '../../../kernel/domain';
import { DependencyContainer } from '../../../shared/types/plugin';
import { HomeworkScheduler } from './services/homework-scheduler.service';
import { HomeworkValidator } from './services/homework-validator.service';
import { HomeworkAssignedEvent, HomeworkSubmittedEvent, HomeworkReviewedEvent } from './events/homework.events';

export class TaskManagementDomain extends BaseDomain {
  name = 'task-management';

  private homeworkScheduler: HomeworkScheduler | null = null;
  private homeworkValidator: HomeworkValidator | null = null;

  async initialize(container: DependencyContainer): Promise<void> {
    await super.initialize(container);

    this.homeworkScheduler = new HomeworkScheduler(
      container.resolve(Symbol.for('IHomeworkRepository'))
    );

    this.homeworkValidator = new HomeworkValidator();

    console.log('[TaskManagementDomain] Initialized');
  }

  getHomeworkScheduler(): HomeworkScheduler | null {
    return this.homeworkScheduler;
  }

  getHomeworkValidator(): HomeworkValidator | null {
    return this.homeworkValidator;
  }

  protected async registerDependencies(container: DependencyContainer): Promise<void> {
    container.register(Symbol.for('HomeworkScheduler'), HomeworkScheduler);
    container.register(Symbol.for('HomeworkValidator'), HomeworkValidator);
  }

  eventHandlers = {
    'HomeworkAssignedEvent': [this.handleHomeworkAssigned.bind(this)],
    'HomeworkSubmittedEvent': [this.handleHomeworkSubmitted.bind(this)],
    'HomeworkReviewedEvent': [this.handleHomeworkReviewed.bind(this)]
  };

  private async handleHomeworkAssigned(event: HomeworkAssignedEvent): Promise<void> {
    console.log(`[TaskManagementDomain] Homework assigned: ${event.payload.title} for student ${event.payload.studentId}`);
  }

  private async handleHomeworkSubmitted(event: HomeworkSubmittedEvent): Promise<void> {
    console.log(`[TaskManagementDomain] Homework submitted by student ${event.payload.studentId}`);
  }

  private async handleHomeworkReviewed(event: HomeworkReviewedEvent): Promise<void> {
    console.log(`[TaskManagementDomain] Homework reviewed for student ${event.payload.studentId}`);
  }

  async shutdown(): Promise<void> {
    console.log('[TaskManagementDomain] Shutting down');
    this.homeworkScheduler = null;
    this.homeworkValidator = null;
  }
}