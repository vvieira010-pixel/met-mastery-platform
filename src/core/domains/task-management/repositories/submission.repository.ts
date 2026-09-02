import { Submission } from '../entities/submission.entity';
import { SubmissionId } from '../value-objects/submission-id.vo';
import { HomeworkId } from '../value-objects/homework-id.vo';

export interface ISubmissionRepository {
  save(submission: Submission): Promise<void>;
  findById(id: SubmissionId): Promise<Submission | null>;
  findByHomeworkId(homeworkId: HomeworkId): Promise<Submission[]>;
  findByStudentId(studentId: string): Promise<Submission[]>;
  findLatestByHomeworkId(homeworkId: HomeworkId): Promise<Submission | null>;
  delete(id: SubmissionId): Promise<void>;
}