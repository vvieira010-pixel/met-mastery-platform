import { ProgressNote } from '../entities/progress-note.entity';
import { ProgressNoteId } from '../value-objects/progress-note-id.vo';

export interface IProgressNoteRepository {
  save(note: ProgressNote): Promise<void>;
  findById(id: ProgressNoteId): Promise<ProgressNote | null>;
  findByStudentId(studentId: string): Promise<ProgressNote[]>;
  findBySource(studentId: string, sourceType: string, sourceId: string | null): Promise<ProgressNote[]>;
  delete(id: ProgressNoteId): Promise<void>;
}