import { Session } from '../entities/session.entity';
import { SessionId } from '../value-objects/session-id.vo';
import { ISessionRepository } from './session.repository';
import { K, load, save, dbReady, listVia, saveVia, removeVia } from '../../../../../../lib/workflow-core.js';

export class LocalSessionRepository implements ISessionRepository {
  async save(session: Session): Promise<void> {
    const data = {
      id: session.id.value,
      studentId: session.studentId,
      teacherId: session.teacherId,
      date: session.date.toISOString().slice(0, 10),
      startTime: session.startTime,
      endTime: session.endTime,
      title: session.title,
      focus: session.focus,
      metSkillFocus: session.metSkillFocus,
      timezone: session.timezone,
      status: session.status.value,
      diagnosticStatus: session.diagnosticStatus,
      homeworkStatus: session.homeworkStatus,
      notes: session.notes,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString()
    };

    await saveVia('sessions', K.sessions, data, {
      studentId: null, teacherId: null, date: new Date().toISOString().slice(0, 10),
      startTime: '', endTime: null, title: '', focus: '', metSkillFocus: '',
      timezone: 'America/Sao_Paulo', status: 'scheduled', diagnosticStatus: 'not-started',
      homeworkStatus: 'not-generated', notes: ''
    });
  }

  async findById(id: SessionId): Promise<Session | null> {
    const all = await listVia('sessions', K.sessions, null);
    const data = all.find(s => s.id === id.value);
    if (!data) return null;
    return this.toEntity(data);
  }

  async findByStudentId(studentId: string): Promise<Session[]> {
    const all = await listVia('sessions', K.sessions, s => s.studentId === studentId);
    return all.map(d => this.toEntity(d));
  }

  async findByDateRange(studentId: string, startDate: Date, endDate: Date): Promise<Session[]> {
    const all = await this.findByStudentId(studentId);
    const start = startDate.getTime();
    const end = endDate.getTime();
    return all.filter(s => s.date.getTime() >= start && s.date.getTime() <= end);
  }

  async findUpcoming(studentId: string): Promise<Session[]> {
    const all = await this.findByStudentId(studentId);
    const now = Date.now();
    return all.filter(s => s.date.getTime() >= now && s.status.isScheduled());
  }

  async findByStatus(studentId: string, status: string): Promise<Session[]> {
    const all = await this.findByStudentId(studentId);
    return all.filter(s => s.status.value === status);
  }

  async delete(id: SessionId): Promise<void> {
    await removeVia('sessions', K.sessions, id.value);
  }

  private toEntity(data: any): Session {
    return Session.reconstitute({
      id: SessionId.fromString(data.id),
      studentId: data.studentId,
      teacherId: data.teacherId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title,
      focus: data.focus,
      metSkillFocus: data.metSkillFocus,
      timezone: data.timezone,
      status: data.status,
      diagnosticStatus: data.diagnosticStatus,
      homeworkStatus: data.homeworkStatus,
      notes: data.notes || '',
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }
}