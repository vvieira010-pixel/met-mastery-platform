import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { ProgressNoteId } from '../value-objects/progress-note-id.vo';

interface ProgressNoteProps {
  id: ProgressNoteId;
  studentId: string;
  sourceType: 'teacher' | 'student' | 'system' | 'parent';
  sourceId: string | null;
  note: string;
  createdAt: Date;
}

export class ProgressNote extends AggregateRoot<ProgressNoteId> {
  private props: ProgressNoteProps;

  private constructor(props: ProgressNoteProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string,
    sourceType: 'teacher' | 'student' | 'system' | 'parent',
    sourceId: string | null,
    note: string
  ): ProgressNote {
    return new ProgressNote({
      id: ProgressNoteId.create(),
      studentId,
      sourceType,
      sourceId,
      note,
      createdAt: new Date()
    });
  }

  static reconstitute(props: ProgressNoteProps): ProgressNote {
    return new ProgressNote(props);
  }

  updateNote(note: string): void {
    this.props.note = note;
  }

  get studentId(): string { return this.props.studentId; }
  get sourceType(): 'teacher' | 'student' | 'system' | 'parent' { return this.props.sourceType; }
  get sourceId(): string | null { return this.props.sourceId; }
  get note(): string { return this.props.note; }
  get createdAt(): Date { return this.props.createdAt; }
}