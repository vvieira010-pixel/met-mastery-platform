import { studentUuid } from './_helpers.js';

export const homework = {
  table: 'homework',
  key: 'local_id',
  refEntity: true,
  async toRow(record, ctx) {
    return {
      teacher_id: ctx.teacherId,
      student_id: await studentUuid(ctx, record.studentId),
      student_local_id: record.studentId || null,
      diagnosis_local_id: record.diagnosisId || null,
      local_id: record.id,
      title: record.title || '',
      status: record.status || 'not-started',
      assigned_at: record.assignedAt || new Date().toISOString(),
      due_at: record.dueDate || null,
      activities: record.activities || record.tasks || [],
      content: record,
    };
  },
  fromRow(row) { return { ...(row.content || {}), id: row.local_id || row.content?.id || row.id }; },
};
