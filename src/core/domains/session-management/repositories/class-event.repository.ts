import { ClassEvent } from '../entities/class-event.entity';
import { ClassEventId } from '../value-objects/class-event-id.vo';

export interface IClassEventRepository {
  save(event: ClassEvent): Promise<void>;
  findById(id: ClassEventId): Promise<ClassEvent | null>;
  findByStudentId(studentId: string): Promise<ClassEvent[]>;
  findByDateRange(studentId: string, startDate: Date, endDate: Date): Promise<ClassEvent[]>;
  findUpcoming(studentId: string): Promise<ClassEvent[]>;
  findByStatus(studentId: string, status: string): Promise<ClassEvent[]>;
  delete(id: ClassEventId): Promise<void>;
}