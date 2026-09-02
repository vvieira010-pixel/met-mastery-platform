import { Homework } from '../entities/homework.entity';
import { HomeworkId } from '../value-objects/homework-id.vo';
import { IHomeworkRepository } from '../repositories/homework.repository';
import { HomeworkStatus } from '../value-objects/homework-status.vo';

export class HomeworkScheduler {
  constructor(
    private homeworkRepository: IHomeworkRepository
  ) {}

  async getOverdueHomework(studentId: string): Promise<Homework[]> {
    return this.homeworkRepository.findOverdue(studentId);
  }

  async getUpcomingHomework(studentId: string, days: number = 7): Promise<Homework[]> {
    const all = await this.homeworkRepository.findByStudentId(studentId);
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return all.filter(h => 
      h.dueDate && 
      h.dueDate >= now && 
      h.dueDate <= future &&
      !h.status.isTerminal()
    );
  }

  async getHomeworkByStatus(studentId: string, status: HomeworkStatus): Promise<Homework[]> {
    return this.homeworkRepository.findByStatus(studentId, status.value);
  }

  async markOverdueHomework(homeworkId: HomeworkId): Promise<Homework | null> {
    const homework = await this.homeworkRepository.findById(homeworkId);
    if (!homework || !homework.isOverdue()) {
      return null;
    }
    return homework;
  }
}

export class HomeworkValidator {
  static validateHomeworkCreation(
    studentId: string,
    diagnosisId: string | null,
    activities: any[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!studentId) {
      errors.push('Student ID is required');
    }

    if (!Array.isArray(activities) || activities.length === 0) {
      errors.push('At least one activity is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateSubmission(
    homework: Homework,
    content: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (homework.status.isTerminal()) {
      errors.push('Cannot submit completed or reviewed homework');
    }

    if (!content) {
      errors.push('Submission content is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}