import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { DiagnosisId } from '../value-objects/diagnosis-id.vo';

interface DiagnosisProps {
  id: DiagnosisId;
  studentId: string;
  sessionId: string | null;
  strengths: string[];
  weaknesses: string[];
  grammarIssues: string[];
  vocabularyIssues: string[];
  skillIssues: string[];
  metConnections: string[];
  nextSteps: string[];
  content: any | null;
  isBaseline: boolean;
  interventionNote: string;
  inquiryHypothesis: string;
  cycleStage: string;
  classEventId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Diagnosis extends AggregateRoot<DiagnosisId> {
  private props: DiagnosisProps;

  private constructor(props: DiagnosisProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string,
    sessionId: string | null,
    strengths: string[],
    weaknesses: string[],
    grammarIssues: string[],
    vocabularyIssues: string[],
    skillIssues: string[],
    metConnections: string[],
    nextSteps: string[],
    content: any | null = null,
    isBaseline: boolean = false,
    interventionNote: string = '',
    inquiryHypothesis: string = '',
    classEventId: string | null = null
  ): Diagnosis {
    const now = new Date();
    return new Diagnosis({
      id: DiagnosisId.create(),
      studentId,
      sessionId,
      strengths,
      weaknesses,
      grammarIssues,
      vocabularyIssues,
      skillIssues,
      metConnections,
      nextSteps,
      content,
      isBaseline,
      interventionNote,
      inquiryHypothesis,
      cycleStage: 'diagnosed',
      classEventId,
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: DiagnosisProps): Diagnosis {
    return new Diagnosis(props);
  }

  addStrength(strength: string): void {
    if (!this.props.strengths.includes(strength)) {
      this.props.strengths.push(strength);
      this.props.updatedAt = new Date();
    }
  }

  addWeakness(weakness: string): void {
    if (!this.props.weaknesses.includes(weakness)) {
      this.props.weaknesses.push(weakness);
      this.props.updatedAt = new Date();
    }
  }

  addGrammarIssue(issue: string): void {
    if (!this.props.grammarIssues.includes(issue)) {
      this.props.grammarIssues.push(issue);
      this.props.updatedAt = new Date();
    }
  }

  addVocabularyIssue(issue: string): void {
    if (!this.props.vocabularyIssues.includes(issue)) {
      this.props.vocabularyIssues.push(issue);
      this.props.updatedAt = new Date();
    }
  }

  addSkillIssue(issue: string): void {
    if (!this.props.skillIssues.includes(issue)) {
      this.props.skillIssues.push(issue);
      this.props.updatedAt = new Date();
    }
  }

  addMetConnection(connection: string): void {
    if (!this.props.metConnections.includes(connection)) {
      this.props.metConnections.push(connection);
      this.props.updatedAt = new Date();
    }
  }

  addNextStep(step: string): void {
    if (!this.props.nextSteps.includes(step)) {
      this.props.nextSteps.push(step);
      this.props.updatedAt = new Date();
    }
  }

  setInterventionNote(note: string): void {
    this.props.interventionNote = note;
    this.props.updatedAt = new Date();
  }

  setInquiryHypothesis(hypothesis: string): void {
    this.props.inquiryHypothesis = hypothesis;
    this.props.updatedAt = new Date();
  }

  updateCycleStage(stage: string): void {
    this.props.cycleStage = stage;
    this.props.updatedAt = new Date();
  }

  get studentId(): string { return this.props.studentId; }
  get sessionId(): string | null { return this.props.sessionId; }
  get strengths(): string[] { return this.props.strengths; }
  get weaknesses(): string[] { return this.props.weaknesses; }
  get grammarIssues(): string[] { return this.props.grammarIssues; }
  get vocabularyIssues(): string[] { return this.props.vocabularyIssues; }
  get skillIssues(): string[] { return this.props.skillIssues; }
  get metConnections(): string[] { return this.props.metConnections; }
  get nextSteps(): string[] { return this.props.nextSteps; }
  get content(): any | null { return this.props.content; }
  get isBaseline(): boolean { return this.props.isBaseline; }
  get interventionNote(): string { return this.props.interventionNote; }
  get inquiryHypothesis(): string { return this.props.inquiryHypothesis; }
  get cycleStage(): string { return this.props.cycleStage; }
  get classEventId(): string | null { return this.props.classEventId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}