import { studentUuid, homeworkUuid, studentLocal, homeworkLocal } from './_helpers.js';

export const submissions = {
  table: 'submissions',
  key: 'uuid',
  uuidAsId: true,
  async toRow(record, ctx) {
    return {
      teacher_id: ctx.teacherId,
      homework_id: await homeworkUuid(ctx, record.homeworkId),
      student_id: await studentUuid(ctx, record.studentId),
      status: record.status || 'submitted',
      content: record.content || null,
      responses: record.responses || null,
      submitted_at: record.submittedAt || new Date().toISOString(),
    };
  },
  fromRow(row, refs) {
    return {
      id: row.id,
      homeworkId: homeworkLocal(refs, row.homework_id),
      studentId: studentLocal(refs, row.student_id),
      content: row.content || '',
      responses: row.responses || null,
      status: row.status,
      submittedAt: row.submitted_at,
      reviewedAt: row.status === 'reviewed' ? row.updated_at : undefined,
    };
  },
};
