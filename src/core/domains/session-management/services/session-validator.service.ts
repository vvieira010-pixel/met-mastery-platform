import { Session } from '../entities/session.entity';

export class SessionValidator {
  static validateCreation(
    studentId: string,
    teacherId: string,
    date: Date,
    startTime: string,
    title: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!studentId) {
      errors.push('Student ID is required');
    }

    if (!teacherId) {
      errors.push('Teacher ID is required');
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      errors.push('Valid date is required');
    }

    if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
      errors.push('Valid start time (HH:MM) is required');
    }

    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateSessionExists(
    session: Session | null
  ): { valid: boolean; errors: string[] } {
    if (!session) {
      return { valid: false, errors: ['Session not found'] };
    }
    return { valid: true, errors: [] };
  }
}
