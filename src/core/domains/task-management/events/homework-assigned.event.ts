import { DomainEvent } from '../../../shared/types/plugin';

export class HomeworkAssignedEvent implements DomainEvent {
  eventId = crypto.randomUUID();
  eventType = 'HomeworkAssigned';
  aggregateId: string;
  occurredOn = new Date();
  version = 1;
  payload: Record<string, any>;

  constructor(
    homeworkId: string,
    public readonly studentId: string,
    public readonly diagnosisId: string | null,
    public readonly title: string
  ) {
    this.aggregateId = homeworkId;
    this.payload = { homeworkId, studentId, diagnosisId, title };
  }
}