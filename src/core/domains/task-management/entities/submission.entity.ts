import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { SubmissionId } from '../value-objects/submission-id.vo';
import { HomeworkId } from '../value-objects/homework-id.vo';

interface SubmissionProps {
  id: SubmissionId;
  homeworkId: HomeworkId;
  studentId: string;
  attempt: number;
  content: string;
  responses: any | null;
  confidence: number | null;
  aiFeedback: any | null;
  teacherFeedback: any | null;
  score: number | null;
  xpAwarded: number;
  errorsObserved: string[];
  strengthsObserved: string[];
  status: 'draft' | 'submitted' | 'reviewed';
  submittedAt: Date;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Submission extends AggregateRoot<SubmissionId> {
  private props: SubmissionProps;

  private constructor(props: SubmissionProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    homeworkId: HomeworkId,
    studentId: string,
    attempt: number,
    content: string,
    responses: any = null,
    confidence: number | null = null
  ): Submission {
    const now = new Date();
    return new Submission({
      id: SubmissionId.create(),
      homeworkId,
      studentId,
      attempt,
      content,
      responses,
      confidence,
      aiFeedback: null,
      teacherFeedback: null,
      score: null,
      xpAwarded: 0,
      errorsObserved: [],
      strengthsObserved: [],
      status: 'submitted',
      submittedAt: now,
      reviewedAt: null,
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: SubmissionProps): Submission {
    return new Submission(props);
  }

  addAiFeedback(feedback: any): void {
    this.props.aiFeedback = feedback;
    this.props.updatedAt = new Date();
  }

  addTeacherFeedback(feedback: any, score: number | null): void {
    this.props.teacherFeedback = feedback;
    this.props.score = score;
    this.props.status = 'reviewed';
    this.props.reviewedAt = new Date();
    this.props.updatedAt = new Date();
  }

  awardXp(amount: number): void {
    this.props.xpAwarded = amount;
    this.props.updatedAt = new Date();
  }

  recordErrors(errors: string[]): void {
    this.props.errorsObserved = errors;
    this.props.updatedAt = new Date();
  }

  recordStrengths(strengths: string[]): void {
    this.props.strengthsObserved = strengths;
    this.props.updatedAt = new Date();
  }

  get homeworkId(): HomeworkId { return this.props.homeworkId; }
  get studentId(): string { return this.props.studentId; }
  get attempt(): number { return this.props.attempt; }
  get content(): string { return this.props.content; }
  get responses(): any | null { return this.props.responses; }
  get confidence(): number | null { return this.props.confidence; }
  get aiFeedback(): any | null { return this.props.aiFeedback; }
  get teacherFeedback(): any | null { return this.props.teacherFeedback; }
  get score(): number | null { return this.props.score; }
  get xpAwarded(): number { return this.props.xpAwarded; }
  get errorsObserved(): string[] { return this.props.errorsObserved; }
  get strengthsObserved(): string[] { return this.props.strengthsObserved; }
  get status(): 'draft' | 'submitted' | 'reviewed' { return this.props.status; }
  get submittedAt(): Date { return this.props.submittedAt; }
  get reviewedAt(): Date | null { return this.props.reviewedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}