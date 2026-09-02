import { PracticeAssignment } from '../entities/practice-assignment.entity';
import { PracticeAssignmentId } from '../value-objects/practice-assignment-id.vo';
import { IPracticeAssignmentRepository } from './practice-assignment.repository';
import { K, load, save, dbReady, listVia, saveVia, removeVia } from '../../../../../lib/workflow-core.js';

export class LocalPracticeAssignmentRepository implements IPracticeAssignmentRepository {
  async save(assignment: PracticeAssignment): Promise<void> {
    const data = {
      id: assignment.id.value,
      studentId: assignment.studentId,
      diagnosisId: assignment.diagnosisId,
      resourceIds: assignment.resourceIds,
      skillFocus: assignment.skillFocus,
      status: assignment.status,
      assignedAt: assignment.assignedAt.toISOString(),
      completedAt: assignment.completedAt?.toISOString() || null,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString()
    };

    await saveVia('practiceAssignments', K.practiceAssignments, data, {
      studentId: null, diagnosisId: null, resourceIds: [], skillFocus: '',
      status: 'assigned', assignedAt: new Date().toISOString()
    });
  }

  async findById(id: PracticeAssignmentId): Promise<PracticeAssignment | null> {
    const all = await listVia('practiceAssignments', K.practiceAssignments, null);
    const data = all.find(a => a.id === id.value);
    if (!data) return null;
    return this.toEntity(data);
  }

  async findByStudentId(studentId: string): Promise<PracticeAssignment[]> {
    const all = await listVia('practiceAssignments', K.practiceAssignments, a => a.studentId === studentId);
    return all.map(d => this.toEntity(d));
  }

  async findByDiagnosisId(diagnosisId: string): Promise<PracticeAssignment[]> {
    const all = await listVia('practiceAssignments', K.practiceAssignments, a => a.diagnosisId === diagnosisId);
    return all.map(d => this.toEntity(d));
  }

  async findActive(studentId: string): Promise<PracticeAssignment[]> {
    const all = await listVia('practiceAssignments', K.practiceAssignments, 
      a => a.studentId === studentId && (a.status === 'assigned' || a.status === 'in-progress'));
    return all.map(d => this.toEntity(d));
  }

  async delete(id: PracticeAssignmentId): Promise<void> {
    await removeVia('practiceAssignments', K.practiceAssignments, id.value);
  }

  private toEntity(data: any): PracticeAssignment {
    return PracticeAssignment.reconstitute({
      id: PracticeAssignmentId.fromString(data.id),
      studentId: data.studentId,
      diagnosisId: data.diagnosisId,
      resourceIds: data.resourceIds || [],
      skillFocus: data.skillFocus,
      status: data.status,
      assignedAt: new Date(data.assignedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }
}