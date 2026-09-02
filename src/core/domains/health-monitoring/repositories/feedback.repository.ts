import { Feedback } from '../entities/feedback.entity';
import { FeedbackId } from '../value-objects/feedback-id.vo';

export interface IFeedbackRepository {
  save(feedback: Feedback): Promise<void>;
  findById(id: FeedbackId): Promise<Feedback | null>;
  findByStudentId(studentId: string): Promise<Feedback[]>;
  findByDiagnosisId(diagnosisId: string): Promise<Feedback[]>;
  findByStatus(studentId: string, status: string): Promise<Feedback[]>;
  delete(id: FeedbackId): Promise<void>;
}