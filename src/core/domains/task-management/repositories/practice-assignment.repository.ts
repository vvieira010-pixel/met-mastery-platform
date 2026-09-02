import { PracticeAssignment } from '../entities/practice-assignment.entity';
import { PracticeAssignmentId } from '../value-objects/practice-assignment-id.vo';

export interface IPracticeAssignmentRepository {
  save(assignment: PracticeAssignment): Promise<void>;
  findById(id: PracticeAssignmentId): Promise<PracticeAssignment | null>;
  findByStudentId(studentId: string): Promise<PracticeAssignment[]>;
  findByDiagnosisId(diagnosisId: string): Promise<PracticeAssignment[]>;
  findActive(studentId: string): Promise<PracticeAssignment[]>;
  delete(id: PracticeAssignmentId): Promise<void>;
}