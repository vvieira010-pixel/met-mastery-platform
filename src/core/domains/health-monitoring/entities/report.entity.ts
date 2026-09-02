import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { ReportId } from '../value-objects/report-id.vo';

interface ReportProps {
  id: ReportId;
  studentId: string;
  diagnosisIds: string[];
  feedbackIds: string[];
  homeworkIds: string[];
  content: string | null;
  type: 'progress' | 'diagnostic' | 'session-summary' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

export class Report extends AggregateRoot<ReportId> {
  private props: ReportProps;

  private constructor(props: ReportProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string,
    type: 'progress' | 'diagnostic' | 'session-summary' | 'custom',
    diagnosisIds: string[] = [],
    feedbackIds: string[] = [],
    homeworkIds: string[] = [],
    content: string | null = null
  ): Report {
    const now = new Date();
    return new Report({
      id: ReportId.create(),
      studentId,
      diagnosisIds,
      feedbackIds,
      homeworkIds,
      content,
      type,
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: ReportProps): Report {
    return new Report(props);
  }

  addDiagnosisId(diagnosisId: string): void {
    if (!this.props.diagnosisIds.includes(diagnosisId)) {
      this.props.diagnosisIds.push(diagnosisId);
      this.props.updatedAt = new Date();
    }
  }

  addFeedbackId(feedbackId: string): void {
    if (!this.props.feedbackIds.includes(feedbackId)) {
      this.props.feedbackIds.push(feedbackId);
      this.props.updatedAt = new Date();
    }
  }

  addHomeworkId(homeworkId: string): void {
    if (!this.props.homeworkIds.includes(homeworkId)) {
      this.props.homeworkIds.push(homeworkId);
      this.props.updatedAt = new Date();
    }
  }

  setContent(content: string): void {
    this.props.content = content;
    this.props.updatedAt = new Date();
  }

  get studentId(): string { return this.props.studentId; }
  get diagnosisIds(): string[] { return this.props.diagnosisIds; }
  get feedbackIds(): string[] { return this.props.feedbackIds; }
  get homeworkIds(): string[] { return this.props.homeworkIds; }
  get content(): string | null { return this.props.content; }
  get type(): 'progress' | 'diagnostic' | 'session-summary' | 'custom' { return this.props.type; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}