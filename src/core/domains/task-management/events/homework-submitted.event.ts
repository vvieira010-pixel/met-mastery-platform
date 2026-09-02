import { DomainEvent } from '../../../shared/types/plugin';

export class HomeworkSubmittedEvent implements DomainEvent {
  eventId = crypto.randomUUID();
  eventType = 'HomeworkSubmitted';
  aggregateId: string;
  occurredOn = new Date();
  version = 1;
  payload: Record<string, any>;

  constructor(
    homeworkId: string,
    public readonly submissionId: string,
    public readonly studentId: string,
    public readonly content: string,
    public readonly responses: any,
    public readonly confidence: number | null
  ) {
    this.aggregateId = homeworkId;
    this.payload = { homeworkId, submissionId, studentId, content, responses, confidence };
  }
}