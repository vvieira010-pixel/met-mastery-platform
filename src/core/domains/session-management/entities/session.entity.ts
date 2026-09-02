import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { SessionId } from '../value-objects/session-id.vo';
import { SessionStatus } from '../value-objects/session-status.vo';

interface SessionProps {
  id: SessionId;
  studentId: string;
  teacherId: string;
  date: Date;
  startTime: string;
  endTime: string | null;
  title: string;
  focus: string;
  metSkillFocus: string;
  timezone: string;
  status: SessionStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Session extends AggregateRoot<SessionId> {
  private props: SessionProps;

  private constructor(props: SessionProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string,
    teacherId: string,
    date: Date,
    startTime: string,
    endTime: string | null,
    title: string,
    focus: string,
    metSkillFocus: string,
    timezone: string = 'America/Sao_Paulo'
  ): Session {
    const now = new Date();
    return new Session({
      id: SessionId.create(),
      studentId,
      teacherId,
      date,
      startTime,
      endTime,
      title,
      focus,
      metSkillFocus,
      timezone,
      status: SessionStatus.scheduled(),
      notes: '',
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: SessionProps): Session {
    return new Session(props);
  }

  start(): void {
    if (!this.props.status.equals(SessionStatus.scheduled())) {
      throw new Error('Can only start scheduled sessions');
    }
    this.props.status = SessionStatus.inProgress();
    this.props.updatedAt = new Date();
  }

  complete(notes?: string): void {
    if (!this.props.status.equals(SessionStatus.inProgress())) {
      throw new Error('Can only complete in-progress sessions');
    }
    this.props.status = SessionStatus.completed();
    if (notes) this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status.equals(SessionStatus.completed())) {
      throw new Error('Cannot cancel completed session');
    }
    this.props.status = SessionStatus.cancelled();
    this.props.updatedAt = new Date();
  }

  addNotes(notes: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  get studentId(): string { return this.props.studentId; }
  get teacherId(): string { return this.props.teacherId; }
  get date(): Date { return this.props.date; }
  get startTime(): string { return this.props.startTime; }
  get endTime(): string | null { return this.props.endTime; }
  get title(): string { return this.props.title; }
  get focus(): string { return this.props.focus; }
  get metSkillFocus(): string { return this.props.metSkillFocus; }
  get timezone(): string { return this.props.timezone; }
  get status(): SessionStatus { return this.props.status; }
  get notes(): string { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}