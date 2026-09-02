import { DomainEvent } from '../../../shared/domain/domain-event';

export class MockTestCompletedEvent implements DomainEvent {
  readonly timestamp: Date;

  constructor(
    public readonly mockTestId: string,
    public readonly studentId: string,
    public readonly scores: Record<string, any>,
    public readonly cefr?: string
  ) {
    this.timestamp = new Date();
  }
}