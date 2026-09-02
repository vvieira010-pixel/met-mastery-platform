import { ClassEvent } from '../entities/class-event.entity';
import { IClassEventRepository } from '../repositories/class-event.repository';

export class ClassEventScheduler {
  constructor(private classEventRepository: IClassEventRepository) {}

  async getUpcomingClasses(studentId: string, limit: number = 10): Promise<ClassEvent[]> {
    const upcoming = await this.classEventRepository.findUpcoming(studentId);
    return upcoming
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  }

  async getClassesForWeek(studentId: string, weekStart: Date): Promise<ClassEvent[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return this.classEventRepository.findByDateRange(studentId, weekStart, weekEnd);
  }

  async getClassesForMonth(studentId: string, monthStart: Date): Promise<ClassEvent[]> {
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    return this.classEventRepository.findByDateRange(studentId, monthStart, monthEnd);
  }

  async getClassEventCountByStatus(studentId: string): Promise<Record<string, number>> {
    const all = await this.classEventRepository.findByStudentId(studentId);
    const counts: Record<string, number> = {};
    for (const event of all) {
      counts[event.status] = (counts[event.status] || 0) + 1;
    }
    return counts;
  }
}

export class ClassEventValidator {
  static validateCreation(
    studentId: string,
    date: Date,
    startTime: string,
    title: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!studentId) {
      errors.push('Student ID is required');
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

  static validateDiagnosticStatus(
    event: ClassEvent,
    newStatus: 'not-started' | 'in-progress' | 'completed'
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (event.status === 'cancelled') {
      errors.push('Cannot update diagnostic status of cancelled class');
    }

    if (event.diagnosticStatus === 'completed' && newStatus !== 'completed') {
      errors.push('Cannot revert completed diagnostic status');
    }

    return { valid: errors.length === 0, errors };
  }
}