import { ValueObject } from '../../../../shared/domain/value-object';

type SessionStatusType = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export class SessionStatus extends ValueObject<SessionStatusType> {
  private constructor(status: SessionStatusType) {
    super({ value: status });
  }

  static scheduled(): SessionStatus { return new SessionStatus('scheduled'); }
  static inProgress(): SessionStatus { return new SessionStatus('in-progress'); }
  static completed(): SessionStatus { return new SessionStatus('completed'); }
  static cancelled(): SessionStatus { return new SessionStatus('cancelled'); }

  get value(): SessionStatusType {
    return this.props.value;
  }

  public isScheduled(): boolean { return this.value === 'scheduled'; }
  public isInProgress(): boolean { return this.value === 'in-progress'; }
  public isCompleted(): boolean { return this.value === 'completed'; }
  public isCancelled(): boolean { return this.value === 'cancelled'; }
}