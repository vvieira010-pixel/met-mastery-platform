import { Session } from '../entities/session.entity';
import { ISessionRepository } from '../repositories/session.repository';

export class SessionScheduler {
  constructor(private sessionRepository: ISessionRepository) {}

  async getUpcomingSessions(studentId: string, limit: number = 10): Promise<Session[]> {
    const sessions = await this.sessionRepository.findByStudentId(studentId);
    const now = Date.now();
    return sessions
      .filter(s => s.date.getTime() >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  }

  async getSessionsForWeek(studentId: string, weekStart: Date): Promise<Session[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return this.sessionRepository.findByDateRange(weekStart, weekEnd).then(all =>
      all.filter(s => s.studentId === studentId)
    );
  }

  async getSessionCountByStatus(studentId: string): Promise<Record<string, number>> {
    const all = await this.sessionRepository.findByStudentId(studentId);
    const counts: Record<string, number> = {};
    for (const session of all) {
      const key = String(session.status);
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }
}
