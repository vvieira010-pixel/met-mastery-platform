export const studentsCrud = {
  table: 'students',
  key: 'local_id',
  refEntity: true,
  async toRow(record, ctx) {
    const { password, ...safe } = record;
    return {
      teacher_id: ctx.teacherId,
      local_id: record.id,
      name: record.name || '',
      first_name: record.firstName || '',
      email: record.email || '',
      current_level: record.currentLevel || record.band || '',
      target_level: record.targetLevel || record.bandTarget || '',
      focus_skill: record.focusSkill || record.skillFocus || '',
      metadata: safe,
    };
  },
  fromRow(row) {
    const metadata = row.metadata || {};
    const name = row.name || metadata.name || '';
    const firstName = row.first_name || metadata.firstName || name.trim().split(/\s+/)[0] || '';
    return { ...metadata, id: row.local_id || row.id, email: row.email, name, firstName };
  },
};
