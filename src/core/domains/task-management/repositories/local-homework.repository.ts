import { Homework } from '../entities/homework.entity';
import { HomeworkId } from '../value-objects/homework-id.vo';
import { IHomeworkRepository } from './homework.repository';
import { K, load, save, dbReady, listVia, saveVia, removeVia } from '../../../../../lib/workflow-core.js';

export class LocalHomeworkRepository implements IHomeworkRepository {
  async save(homework: Homework): Promise<void> {
    const data = {
      id: homework.id.value,
      studentId: homework.studentId,
      diagnosisId: homework.diagnosisId,
      assignedAt: homework.assignedAt.toISOString(),
      dueDate: homework.dueDate?.toISOString() || null,
      activities: homework.activities,
      attachments: homework.attachments,
      status: homework.status.value,
      completedAt: homework.completedAt?.toISOString() || null,
      reviewedAt: homework.reviewedAt?.toISOString() || null,
      createdAt: homework.createdAt.toISOString(),
      updatedAt: homework.updatedAt.toISOString()
    };

    await saveVia('homework', K.homework, data, {
      studentId: null, diagnosisId: null, assignedAt: new Date().toISOString(),
      activities: [], attachments: [], status: 'not-started'
    });
  }

  async findById(id: HomeworkId): Promise<Homework | null> {
    const all = await listVia('homework', K.homework, null);
    const data = all.find(h => h.id === id.value);
    if (!data) return null;
    return this.toEntity(data);
  }

  async findByStudentId(studentId: string): Promise<Homework[]> {
    const all = await listVia('homework', K.homework, h => h.studentId === studentId);
    return all.map(d => this.toEntity(d));
  }

  async findByStatus(studentId: string, status: string): Promise<Homework[]> {
    const all = await listVia('homework', K.homework, h => h.studentId === studentId && h.status === status);
    return all.map(d => this.toEntity(d));
  }

  async findOverdue(studentId: string): Promise<Homework[]> {
    const all = await this.findByStudentId(studentId);
    return all.filter(h => h.isOverdue());
  }

  async delete(id: HomeworkId): Promise<void> {
    await removeVia('homework', K.homework, id.value);
  }

  private toEntity(data: any): Homework {
    return Homework.reconstitute({
      id: HomeworkId.fromString(data.id),
      studentId: data.studentId,
      diagnosisId: data.diagnosisId,
      assignedAt: new Date(data.assignedAt),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      activities: data.activities || [],
      attachments: data.attachments || [],
      status: data.status,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : null,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }
}