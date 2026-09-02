import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { CohortId } from '../value-objects/cohort-id.vo';

interface CohortProps {
  id: CohortId;
  name: string;
  teacherId: string;
  track: string;
  startDate: Date;
  endDate: Date | null;
  schedule: {
    dayOfWeek: number; // 0-6
    startTime: string;
    endTime: string;
    timezone: string;
  };
  students: string[];
  maxStudents: number;
  status: 'planning' | 'active' | 'completed' | 'archived';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Cohort extends AggregateRoot<CohortId> {
  private props: CohortProps;

  private constructor(props: CohortProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    name: string,
    teacherId: string,
    track: string,
    startDate: Date,
    schedule: { dayOfWeek: number; startTime: string; endTime: string; timezone: string },
    maxStudents: number = 20,
    endDate: Date | null = null
  ): Cohort {
    const now = new Date();
    return new Cohort({
      id: CohortId.create(),
      name,
      teacherId,
      track,
      startDate,
      endDate,
      schedule,
      students: [],
      maxStudents,
      status: 'planning',
      notes: '',
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: CohortProps): Cohort {
    return new Cohort(props);
  }

  addStudent(studentId: string): void {
    if (this.props.students.length >= this.props.maxStudents) {
      throw new Error('Cohort is full');
    }
    if (!this.props.students.includes(studentId)) {
      this.props.students.push(studentId);
      this.props.updatedAt = new Date();
    }
  }

  removeStudent(studentId: string): void {
    this.props.students = this.props.students.filter(id => id !== studentId);
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.status !== 'planning') {
      throw new Error('Can only activate planning cohorts');
    }
    this.props.status = 'active';
    this.props.updatedAt = new Date();
  }

  complete(): void {
    if (this.props.status !== 'active') {
      throw new Error('Can only complete active cohorts');
    }
    this.props.status = 'completed';
    this.props.updatedAt = new Date();
  }

  archive(): void {
    if (this.props.status !== 'completed') {
      throw new Error('Can only archive completed cohorts');
    }
    this.props.status = 'archived';
    this.props.updatedAt = new Date();
  }

  updateSchedule(schedule: { dayOfWeek: number; startTime: string; endTime: string; timezone: string }): void {
    this.props.schedule = schedule;
    this.props.updatedAt = new Date();
  }

  addNotes(notes: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  get teacherId(): string { return this.props.teacherId; }
  get name(): string { return this.props.name; }
  get track(): string { return this.props.track; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date | null { return this.props.endDate; }
  get schedule(): { dayOfWeek: number; startTime: string; endTime: string; timezone: string } { return this.props.schedule; }
  get students(): string[] { return this.props.students; }
  get maxStudents(): number { return this.props.maxStudents; }
  get status(): 'planning' | 'active' | 'completed' | 'archived' { return this.props.status; }
  get notes(): string { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}