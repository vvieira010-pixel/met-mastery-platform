import { ValueObject } from '../../../shared/domain/value-object';

type MockTestStatusType = 'not_started' | 'in_progress' | 'completed';

export class MockTestStatus extends ValueObject<MockTestStatusType> {
  private constructor(status: MockTestStatusType) {
    super({ value: status });
  }

  static notStarted(): MockTestStatus { return new MockTestStatus('not_started'); }
  static inProgress(): MockTestStatus { return new MockTestStatus('in_progress'); }
  static completed(): MockTestStatus { return new MockTestStatus('completed'); }

  get value(): MockTestStatusType {
    return this.props.value;
  }

  public isNotStarted(): boolean { return this.value === 'not_started'; }
  public isInProgress(): boolean { return this.value === 'in_progress'; }
  public isCompleted(): boolean { return this.value === 'completed'; }
}