/**
 * @graphify:node exercises_met_b2_b2plus_homework_vocabulary_bank
 * @graphify:edge -> exercises_met_b2_b2plus_homework_vocabulary_bank references EXTRACTED
 */
import { Homework } from '../entities/homework.entity';
import { IHomeworkRepository } from '../repositories/homework.repository';

export class HomeworkScheduler {
  constructor(private homeworkRepository: IHomeworkRepository) {}

  async getDueSoon(studentId: string, days: number = 7): Promise<Homework[]> {
    const all = await this.homeworkRepository.findByStudentId(studentId);
    const now = Date.now();
    const cutoff = now + days * 24 * 60 * 60 * 1000;

    return all.filter(h => 
      h.dueDate && 
      h.dueDate.getTime() > now && 
      h.dueDate.getTime() <= cutoff &&
      !h.status.isCompleted() &&
      !h.status.isCorrected()
    );
  }

  async getOverdue(studentId: string): Promise<Homework[]> {
    return this.homeworkRepository.findOverdue(studentId);
  }

  async getNextDue(studentId: string): Promise<Homework | null> {
    const dueSoon = await this.getDueSoon(studentId, 30);
    if (dueSoon.length === 0) return null;
    
    return dueSoon.sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0];
  }

  async getUpcomingSchedule(studentId: string): Promise<Array<{ homework: Homework; daysUntilDue: number }>> {
    const dueSoon = await this.getDueSoon(studentId, 30);
    return dueSoon.map(homework => ({
      homework,
      daysUntilDue: Math.ceil((homework.dueDate!.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    })).sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }
}