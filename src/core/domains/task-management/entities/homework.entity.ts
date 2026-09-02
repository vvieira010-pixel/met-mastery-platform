import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { HomeworkId } from '../value-objects/homework-id.vo';
import { HomeworkStatus } from '../value-objects/homework-status.vo';
import { HomeworkAssignedEvent } from '../events/homework-assigned.event';
import { HomeworkSubmittedEvent } from '../events/homework-submitted.event';
import { HomeworkReviewedEvent } from '../events/homework-reviewed.event';

interface HomeworkProps {
  id: HomeworkId;
  studentId: string;
  diagnosisId: string | null;
  assignedAt: Date;
  dueDate: Date | null;
  activities: any[];
  attachments: any[];
  status: HomeworkStatus;
  completedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Homework extends AggregateRoot<HomeworkId> {
  private props: HomeworkProps;

  private constructor(props: HomeworkProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string,
    diagnosisId: string | null,
    activities: any[],
    attachments: any[],
    dueDate: Date | null = null
  ): Homework {
    const now = new Date();
    return new Homework({
      id: HomeworkId.create(),
      studentId,
      diagnosisId,
      assignedAt: now,
      dueDate,
      activities,
      attachments,
      status: HomeworkStatus.notStarted(),
      completedAt: null,
      reviewedAt: null,
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: HomeworkProps): Homework {
    return new Homework(props);
  }

  submit(submittedAt: Date = new Date()): void {
    if (this.props.status.equals(HomeworkStatus.completed()) || this.props.status.equals(HomeworkStatus.reviewed())) {
      throw new Error('Cannot submit already completed or reviewed homework');
    }

    this.props.status = HomeworkStatus.submitted();
    this.props.completedAt = submittedAt;
    this.props.updatedAt = new Date();

    this.applyEvent(new HomeworkSubmittedEvent(
      this.id.value,
      this.props.studentId,
      submittedAt
    ));
  }

  review(reviewedAt: Date = new Date()): void {
    if (!this.props.status.equals(HomeworkStatus.submitted())) {
      throw new Error('Can only review submitted homework');
    }

    this.props.status = HomeworkStatus.reviewed();
    this.props.reviewedAt = reviewedAt;
    this.props.updatedAt = new Date();

    this.applyEvent(new HomeworkReviewedEvent(
      this.id.value,
      this.props.studentId,
      reviewedAt
    ));
  }

  markAsInProgress(): void {
    if (!this.props.status.equals(HomeworkStatus.notStarted())) {
      throw new Error('Can only start not-started homework');
    }
    this.props.status = HomeworkStatus.inProgress();
    this.props.updatedAt = new Date();
  }

  isOverdue(): boolean {
    if (!this.props.dueDate) return false;
    if (this.props.status.equals(HomeworkStatus.completed()) || this.props.status.equals(HomeworkStatus.reviewed())) {
      return false;
    }
    return new Date() > this.props.dueDate;
  }

  get studentId(): string { return this.props.studentId; }
  get diagnosisId(): string | null { return this.props.diagnosisId; }
  get assignedAt(): Date { return this.props.assignedAt; }
  get dueDate(): Date | null { return this.props.dueDate; }
  get activities(): any[] { return this.props.activities; }
  get attachments(): any[] { return this.props.attachments; }
  get status(): HomeworkStatus { return this.props.status; }
  get completedAt(): Date | null { return this.props.completedAt; }
  get reviewedAt(): Date | null { return this.props.reviewedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}