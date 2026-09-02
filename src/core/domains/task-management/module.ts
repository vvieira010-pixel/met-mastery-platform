import { BaseDomain } from '../../../kernel/domain';
import { DependencyContainer } from '../../../shared/types/plugin';
import { Homework } from './entities/homework.entity';
import { PracticeAssignment } from './entities/practice-assignment.entity';
import { HomeworkId } from './value-objects/homework-id.vo';
import { HomeworkStatus } from './value-objects/homework-status.vo';
import { PracticeAssignmentId } from './value-objects/practice-assignment-id.vo';
import { HomeworkScheduler, HomeworkValidator } from './services/homework.service';
import { IHomeworkRepository } from './repositories/homework.repository';
import { IPracticeAssignmentRepository } from './repositories/practice-assignment.repository';
import { LocalHomeworkRepository } from './repositories/local-homework.repository';
import { LocalPracticeAssignmentRepository } from './repositories/local-practice-assignment.repository';

export class TaskManagementDomain extends BaseDomain {
  name = 'task-management';

  async registerDependencies(container: DependencyContainer): Promise<void> {
    container.registerInstance(Symbol.for('IHomeworkRepository'), new LocalHomeworkRepository());
    container.registerInstance(Symbol.for('IPracticeAssignmentRepository'), new LocalPracticeAssignmentRepository());
    container.registerInstance(Symbol.for('HomeworkScheduler'), new HomeworkScheduler(
      container.resolve(Symbol.for('IHomeworkRepository'))
    ));
    container.registerInstance(Symbol.for('HomeworkValidator'), new HomeworkValidator());
  }

  async shutdown(): Promise<void> {
    console.log('[TaskManagementDomain] Shutting down');
  }
}

export const taskManagementDomain = new TaskManagementDomain();