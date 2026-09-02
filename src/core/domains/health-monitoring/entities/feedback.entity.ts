import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { FeedbackId } from '../value-objects/feedback-id.vo';

interface FeedbackProps {
  id: FeedbackId;
  studentId: string;
  diagnosisId: string | null;
  content: string;
  status: 'draft' | 'sent' | 'acknowledged';
  createdAt: Date;
  updatedAt: Date;
}

export class Feedback extends AggregateRoot<FeedbackId> {
  private props: FeedbackProps;

  private constructor(props: FeedbackProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string,
    diagnosisId: string | null,
    content: string
  ): Feedback {
    const now = new Date();
    return new Feedback({
      id: FeedbackId.create(),
      studentId,
      diagnosisId,
      content,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: FeedbackProps): Feedback {
    return new Feedback(props);
  }

  send(): void {
    if (this.props.status !== 'draft') {
      throw new Error('Can only send draft feedback');
    }
    this.props.status = 'sent';
    this.props.updatedAt = new Date();
  }

  acknowledge(): void {
    if (this.props.status !== 'sent') {
      throw new Error('Can only acknowledge sent feedback');
    }
    this.props.status = 'acknowledged';
    this.props.updatedAt = new Date();
  }

  updateContent(content: string): void {
    if (this.props.status !== 'draft') {
      throw new Error('Can only update draft feedback');
    }
    this.props.content = content;
    this.props.updatedAt = new Date();
  }

  get studentId(): string { return this.props.studentId; }
  get diagnosisId(): string | null { return this.props.diagnosisId; }
  get content(): string { return this.props.content; }
  get status(): 'draft' | 'sent' | 'acknowledged' { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}