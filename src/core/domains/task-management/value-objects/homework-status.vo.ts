import { ValueObject } from '../../../../shared/domain/value-object';

type HomeworkStatusType = 'not_started' | 'in_progress' | 'submitted' | 'completed' | 'reviewed';

export class HomeworkStatus extends ValueObject<HomeworkStatusType> {
  private constructor(status: HomeworkStatusType) {
    super({ value: status });
  }

  static notStarted(): HomeworkStatus { return new HomeworkStatus('not_started'); }
  static inProgress(): HomeworkStatus { return new HomeworkStatus('in_progress'); }
  static submitted(): HomeworkStatus { return new HomeworkStatus('submitted'); }
  static completed(): HomeworkStatus { return new HomeworkStatus('completed'); }
  static reviewed(): HomeworkStatus { return new HomeworkStatus('reviewed'); }

  get value(): HomeworkStatusType {
    return this.props.value;
  }

  public isNotStarted(): boolean { return this.value === 'not_started'; }
  public isInProgress(): boolean { return this.value === 'in_progress'; }
  public isSubmitted(): boolean { return this.value === 'submitted'; }
  public isCompleted(): boolean { return this.value === 'completed'; }
  public isReviewed(): boolean { return this.value === 'reviewed'; }
  public isTerminal(): boolean { return this.value === 'completed' || this.value === 'reviewed'; }
}