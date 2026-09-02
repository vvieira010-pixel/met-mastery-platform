import { DomainEvent } from '../../../shared/domain/domain-event';

export class MockTestStartedEvent implements DomainEvent {
  readonly timestamp: Date;

  constructor(
    public readonly mockTestId: string,
    public readonly studentId: string,
    public readonly testType: string
  ) {
    this.timestamp = new Date();
  }
}