import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { StudentId } from '../value-objects/student-id.vo';
import { BandLevel } from '../value-objects/band-level.vo';

interface StudentProps {
  id: StudentId;
  name: string;
  firstName: string;
  email: string;
  currentLevel: BandLevel;
  targetLevel: BandLevel;
  examGoal: string;
  professionalContext: string;
  notes: string;
  activeTargetProfileId: string | null;
  cohort: string;
  track: string;
  timezone: string;
  session: number;
  totalSessions: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Student extends AggregateRoot<StudentId> {
  private props: StudentProps;

  private constructor(props: StudentProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    name: string,
    email: string,
    currentLevel: BandLevel,
    targetLevel: BandLevel,
    examGoal: string,
    professionalContext: string = '',
    notes: string = '',
    cohort: string = '',
    track: string = 'MET',
    timezone: string = 'America/Sao_Paulo',
    session: number = 1,
    totalSessions: number = 24
  ): Student {
    const now = new Date();
    const firstName = name.split(' ')[0] || name;
    
    return new Student({
      id: StudentId.create(),
      name,
      firstName,
      email,
      currentLevel,
      targetLevel,
      examGoal,
      professionalContext,
      notes,
      activeTargetProfileId: null,
      cohort,
      track,
      timezone,
      session,
      totalSessions,
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: StudentProps): Student {
    return new Student(props);
  }

  updateProfile(
    name?: string,
    email?: string,
    currentLevel?: BandLevel,
    targetLevel?: BandLevel,
    examGoal?: string,
    professionalContext?: string,
    notes?: string,
    timezone?: string
  ): void {
    if (name) {
      this.props.name = name;
      this.props.firstName = name.split(' ')[0] || name;
    }
    if (email) this.props.email = email;
    if (currentLevel) this.props.currentLevel = currentLevel;
    if (targetLevel) this.props.targetLevel = targetLevel;
    if (examGoal) this.props.examGoal = examGoal;
    if (professionalContext !== undefined) this.props.professionalContext = professionalContext;
    if (notes !== undefined) this.props.notes = notes;
    if (timezone) this.props.timezone = timezone;
    this.props.updatedAt = new Date();
  }

  setCohort(cohort: string): void {
    this.props.cohort = cohort;
    this.props.updatedAt = new Date();
  }

  setTrack(track: string): void {
    this.props.track = track;
    this.props.updatedAt = new Date();
  }

  setActiveTargetProfile(profileId: string | null): void {
    this.props.activeTargetProfileId = profileId;
    this.props.updatedAt = new Date();
  }

  incrementSession(): void {
    if (this.props.session < this.props.totalSessions) {
      this.props.session++;
      this.props.updatedAt = new Date();
    }
  }

  updateProgress(currentLevel?: BandLevel, session?: number): void {
    if (currentLevel) this.props.currentLevel = currentLevel;
    if (session !== undefined && session <= this.props.totalSessions) {
      this.props.session = session;
    }
    this.props.updatedAt = new Date();
  }

  get name(): string { return this.props.name; }
  get firstName(): string { return this.props.firstName; }
  get email(): string { return this.props.email; }
  get currentLevel(): BandLevel { return this.props.currentLevel; }
  get targetLevel(): BandLevel { return this.props.targetLevel; }
  get examGoal(): string { return this.props.examGoal; }
  get professionalContext(): string { return this.props.professionalContext; }
  get notes(): string { return this.props.notes; }
  get activeTargetProfileId(): string | null { return this.props.activeTargetProfileId; }
  get cohort(): string { return this.props.cohort; }
  get track(): string { return this.props.track; }
  get timezone(): string { return this.props.timezone; }
  get session(): number { return this.props.session; }
  get totalSessions(): number { return this.props.totalSessions; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}