import { Homework } from '../entities/homework.entity';
import { HomeworkId } from '../value-objects/homework-id.vo';

export interface IHomeworkRepository {
  save(homework: Homework): Promise<void>;
  findById(id: HomeworkId): Promise<Homework | null>;
  findByStudentId(studentId: string): Promise<Homework[]>;
  findByStudentIdAndStatus(studentId: string, status: string): Promise<Homework[]>;
  findByDiagnosisId(diagnosisId: string): Promise<Homework[]>;
  findOverdue(studentId?: string): Promise<Homework[]>;
  delete(id: HomeworkId): Promise<void>;
}