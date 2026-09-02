import { Student } from '../entities/student.entity';
import { StudentId } from '../value-objects/student-id.vo';

export interface IStudentRepository {
  save(student: Student): Promise<void>;
  findById(id: StudentId): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  findAll(): Promise<Student[]>;
  findByCohort(cohort: string): Promise<Student[]>;
  findByTrack(track: string): Promise<Student[]>;
  findByCurrentLevel(level: string): Promise<Student[]>;
  delete(id: StudentId): Promise<void>;
}