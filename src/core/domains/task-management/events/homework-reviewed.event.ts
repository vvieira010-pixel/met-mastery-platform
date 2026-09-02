import { DomainEvent } from '../../../shared/types/plugin';

export class HomeworkReviewedEvent implements DomainEvent {
  eventId = crypto.randomUUID();
  eventType = 'HomeworkReviewed';
  aggregateId: string;
  occurredOn = new Date();
  version = 1;
  payload: Record<string, any>;

  constructor(
    homeworkId: string,
    public readonly studentId: string,
    public readonly teacherId: string,
    public readonly corrections: any[],
    public readonly overallNote: string,
    public readonly score: number | null
  ) {
    this.aggregateId = homeworkId;
    this.payload = { homeworkId, studentId, teacherId, corrections, overallNote, score };
  }
}