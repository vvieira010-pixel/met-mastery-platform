import { Session } from '../entities/session.entity';
import { SessionId } from '../value-objects/session-id.vo';

export interface ISessionRepository {
  save(session: Session): Promise<void>;
  findById(id: SessionId): Promise<Session | null>;
  findByStudentId(studentId: string): Promise<Session[]>;
  findByTeacherId(teacherId: string): Promise<Session[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Session[]>;
  findByStatus(studentId: string, status: string): Promise<Session[]>;
  delete(id: SessionId): Promise<void>;
}