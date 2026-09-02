import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { PracticeAssignmentId } from '../value-objects/practice-assignment-id.vo';

interface PracticeAssignmentProps {
  id: PracticeAssignmentId;
  studentId: string;
  diagnosisId: string | null;
  resourceIds: string[];
  skillFocus: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PracticeAssignment extends AggregateRoot<PracticeAssignmentId> {
  private props: PracticeAssignmentProps;

  private constructor(props: PracticeAssignmentProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string,
    diagnosisId: string | null,
    resourceIds: string[],
    skillFocus: string
  ): PracticeAssignment {
    const now = new Date();
    return new PracticeAssignment({
      id: PracticeAssignmentId.create(),
      studentId,
      diagnosisId,
      resourceIds,
      skillFocus,
      status: 'assigned',
      assignedAt: now,
      startedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: PracticeAssignmentProps): PracticeAssignment {
    return new PracticeAssignment(props);
  }

  start(): void {
    if (this.props.status !== 'assigned') {
      throw new Error('Can only start assigned practice assignment');
    }
    this.props.status = 'in-progress';
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  complete(): void {
    if (this.props.status !== 'in-progress') {
      throw new Error('Can only complete in-progress practice assignment');
    }
    this.props.status = 'completed';
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status === 'completed') {
      throw new Error('Cannot cancel completed practice assignment');
    }
    this.props.status = 'cancelled';
    this.props.updatedAt = new Date();
  }

  addResource(resourceId: string): void {
    if (!this.props.resourceIds.includes(resourceId)) {
      this.props.resourceIds.push(resourceId);
      this.props.updatedAt = new Date();
    }
  }

  removeResource(resourceId: string): void {
    this.props.resourceIds = this.props.resourceIds.filter(id => id !== resourceId);
    this.props.updatedAt = new Date();
  }

  get studentId(): string { return this.props.studentId; }
  get diagnosisId(): string | null { return this.props.diagnosisId; }
  get resourceIds(): string[] { return this.props.resourceIds; }
  get skillFocus(): string { return this.props.skillFocus; }
  get status(): 'assigned' | 'in-progress' | 'completed' | 'cancelled' { return this.props.status; }
  get assignedAt(): Date { return this.props.assignedAt; }
  get startedAt(): Date | null { return this.props.startedAt; }
  get completedAt(): Date | null { return this.props.completedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}