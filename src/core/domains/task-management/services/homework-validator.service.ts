import { Homework } from '../entities/homework.entity';

export class HomeworkValidator {
  validateForSubmission(homework: Homework): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (homework.status.isCompleted() || homework.status.isCorrected()) {
      errors.push('Cannot submit completed or corrected homework');
    }

    if (!homework.activities || homework.activities.length === 0) {
      errors.push('Homework has no activities');
    }

    return { valid: errors.length === 0, errors };
  }

  validateForReview(homework: Homework): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!homework.status.isSubmitted()) {
      errors.push('Can only review submitted homework');
    }

    return { valid: errors.length === 0, errors };
  }

  validateForAssignment(homework: Homework): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!homework.title || homework.title.trim().length === 0) {
      errors.push('Homework must have a title');
    }

    if (!homework.studentId) {
      errors.push('Homework must be assigned to a student');
    }

    if (!homework.activities || homework.activities.length === 0) {
      errors.push('Homework must have at least one activity');
    }

    if (homework.dueDate && homework.dueDate < homework.assignedAt) {
      errors.push('Due date cannot be before assignment date');
    }

    return { valid: errors.length === 0, errors };
  }
}