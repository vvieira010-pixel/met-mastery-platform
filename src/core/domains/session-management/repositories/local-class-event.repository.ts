import { ClassEvent } from '../entities/class-event.entity';
import { ClassEventId } from '../value-objects/class-event-id.vo';
import { IClassEventRepository } from './class-event.repository';
import { K, load, save, dbReady, listVia, saveVia, removeVia } from '../../../../../../lib/workflow-core.js';

export class LocalClassEventRepository implements IClassEventRepository {
  async save(event: ClassEvent): Promise<void> {
    const data = {
      id: event.id.value,
      studentId: event.studentId,
      date: event.date.toISOString().slice(0, 10),
      startTime: event.startTime,
      endTime: event.endTime,
      title: event.title,
      classFocus: event.classFocus,
      metSkillFocus: event.metSkillFocus,
      timezone: event.timezone,
      status: event.status,
      diagnosticStatus: event.diagnosticStatus,
      homeworkStatus: event.homeworkStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    };

    await saveVia('classEvents', K.classEvents, data, {
      studentId: null, date: new Date().toISOString().slice(0, 10),
      startTime: '', endTime: null, title: '', classFocus: '', metSkillFocus: '',
      timezone: 'America/Sao_Paulo', status: 'scheduled', diagnosticStatus: 'not-started',
      homeworkStatus: 'not-generated'
    });
  }

  async findById(id: ClassEventId): Promise<ClassEvent | null> {
    const all = await listVia('classEvents', K.classEvents, null);
    const data = all.find(e => e.id === id.value);
    if (!data) return null;
    return this.toEntity(data);
  }

  async findByStudentId(studentId: string): Promise<ClassEvent[]> {
    const all = await listVia('classEvents', K.classEvents, e => e.studentId === studentId);
    return all.map(d => this.toEntity(d));
  }

  async findByDateRange(studentId: string, startDate: Date, endDate: Date): Promise<ClassEvent[]> {
    const all = await this.findByStudentId(studentId);
    const start = startDate.getTime();
    const end = endDate.getTime();
    return all.filter(e => e.date.getTime() >= start && e.date.getTime() <= end);
  }

  async findUpcoming(studentId: string): Promise<ClassEvent[]> {
    const all = await this.findByStudentId(studentId);
    const now = Date.now();
    return all.filter(e => e.date.getTime() >= now && e.status === 'scheduled');
  }

  async findByStatus(studentId: string, status: string): Promise<ClassEvent[]> {
    const all = await this.findByStudentId(studentId);
    return all.filter(e => e.status === status);
  }

  async delete(id: ClassEventId): Promise<void> {
    await removeVia('classEvents', K.classEvents, id.value);
  }

  private toEntity(data: any): ClassEvent {
    return ClassEvent.reconstitute({
      id: ClassEventId.fromString(data.id),
      studentId: data.studentId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title,
      classFocus: data.classFocus,
      metSkillFocus: data.metSkillFocus,
      timezone: data.timezone,
      status: data.status,
      diagnosticStatus: data.diagnosticStatus,
      homeworkStatus: data.homeworkStatus,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }
}