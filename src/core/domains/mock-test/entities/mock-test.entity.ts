/**
 * @graphify:node met_test_basics_task_breakdown_met_exam_structure
 * @graphify:edge -> met_test_basics_task_breakdown_met_exam_structure implements EXTRACTED
 */
import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { MockTestId } from '../value-objects/mock-test-id.vo';
import { MockTestStatus } from '../value-objects/mock-test-status.vo';
import { MockTestType } from '../value-objects/mock-test-type.vo';
import { MockTestStartedEvent } from '../events/mock-test-started.event';
import { MockTestCompletedEvent } from '../events/mock-test-completed.event';

interface MockTestProps {
  id: MockTestId;
  studentId: string;
  type: MockTestType;
  status: MockTestStatus;
  answers?: Record<string, any>;
  scores?: Record<string, any>;
  cefr?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class MockTest extends AggregateRoot<MockTestId> {
  private props: MockTestProps;

  private constructor(props: MockTestProps) {
    super(props.id);
    this.props = props;
  }

  static create(studentId: string, type: MockTestType): MockTest {
    const mockTest = new MockTest({
      id: MockTestId.create(),
      studentId,
      type,
      status: MockTestStatus.notStarted(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return mockTest;
  }

  static reconstitute(props: MockTestProps): MockTest {
    return new MockTest(props);
  }

  public start(): void {
    if (this.props.status.equals(MockTestStatus.completed())) {
      throw new Error('Cannot start completed mock test');
    }

    this.props.status = MockTestStatus.inProgress();
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();

    this.applyEvent(new MockTestStartedEvent(
      this.id.value,
      this.props.studentId,
      this.props.type.value
    ));
  }

  public submit(answers: Record<string, any>, scores: Record<string, any>, cefr?: string): void {
    if (!this.props.startedAt) {
      throw new Error('Cannot submit unstarted mock test');
    }

    this.props.answers = answers;
    this.props.scores = scores;
    this.props.cefr = cefr;
    this.props.status = MockTestStatus.completed();
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();

    this.applyEvent(new MockTestCompletedEvent(
      this.id.value,
      this.props.studentId,
      scores,
      cefr
    ));
  }

  // Getters
  get studentId(): string { return this.props.studentId; }
  get type(): MockTestType { return this.props.type; }
  get status(): MockTestStatus { return this.props.status; }
  get answers(): Record<string, any> | undefined { return this.props.answers; }
  get scores(): Record<string, any> | undefined { return this.props.scores; }
  get cefr(): string | undefined { return this.props.cefr; }
  get startedAt(): Date | undefined { return this.props.startedAt; }
  get completedAt(): Date | undefined { return this.props.completedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}