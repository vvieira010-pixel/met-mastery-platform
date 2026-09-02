import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { ClassEventId } from '../value-objects/class-event-id.vo';

interface ClassEventProps {
  id: ClassEventId;
  studentId: string;
  date: Date;
  startTime: string;
  endTime: string | null;
  title: string;
  classFocus: string;
  metSkillFocus: string;
  timezone: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  diagnosticStatus: 'not-started' | 'in-progress' | 'completed';
  homeworkStatus: 'not-generated' | 'generated' | 'assigned' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export class ClassEvent extends AggregateRoot<ClassEventId> {
  private props: ClassEventProps;

  private constructor(props: ClassEventProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string,
    date: Date,
    startTime: string,
    endTime: string | null,
    title: string,
    classFocus: string,
    metSkillFocus: string,
    timezone: string = 'America/Sao_Paulo'
  ): ClassEvent {
    const now = new Date();
    return new ClassEvent({
      id: ClassEventId.create(),
      studentId,
      date,
      startTime,
      endTime,
      title,
      classFocus,
      metSkillFocus,
      timezone,
      status: 'scheduled',
      diagnosticStatus: 'not-started',
      homeworkStatus: 'not-generated',
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: ClassEventProps): ClassEvent {
    return new ClassEvent(props);
  }

  complete(): void {
    if (this.props.status === 'completed') {
      throw new Error('Class event already completed');
    }
    this.props.status = 'completed';
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status === 'completed') {
      throw new Error('Cannot cancel completed class event');
    }
    this.props.status = 'cancelled';
    this.props.updatedAt = new Date();
  }

  setDiagnosticStatus(status: 'not-started' | 'in-progress' | 'completed'): void {
    this.props.diagnosticStatus = status;
    this.props.updatedAt = new Date();
  }

  setHomeworkStatus(status: 'not-generated' | 'generated' | 'assigned' | 'completed'): void {
    this.props.homeworkStatus = status;
    this.props.updatedAt = new Date();
  }

  get studentId(): string { return this.props.studentId; }
  get date(): Date { return this.props.date; }
  get startTime(): string { return this.props.startTime; }
  get endTime(): string | null { return this.props.endTime; }
  get title(): string { return this.props.title; }
  get classFocus(): string { return this.props.classFocus; }
  get metSkillFocus(): string { return this.props.metSkillFocus; }
  get timezone(): string { return this.props.timezone; }
  get status(): 'scheduled' | 'completed' | 'cancelled' { return this.props.status; }
  get diagnosticStatus(): 'not-started' | 'in-progress' | 'completed' { return this.props.diagnosticStatus; }
  get homeworkStatus(): 'not-generated' | 'generated' | 'assigned' | 'completed' { return this.props.homeworkStatus; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}