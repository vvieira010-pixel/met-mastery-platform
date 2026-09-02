import { studentUuid, homeworkUuid } from './_helpers.js';

export const reviews = {
  table: 'reviews',
  key: 'uuid',
  uuidAsId: true,
  async toRow(record, ctx) {
    return {
      teacher_id: ctx.teacherId,
      student_id: await studentUuid(ctx, record.studentId),
      submission_id: record.submissionId || null,
      homework_id: await homeworkUuid(ctx, record.homeworkId),
      redo_required: Boolean(record.redoRequired),
      reviewed_at: record.reviewedAt || new Date().toISOString(),
      sent_to_student: record.sentToStudent !== false,
      content: record,
    };
  },
  fromRow(row) { return { ...(row.content || {}), id: row.id }; },
};
