import { getSupabaseConfig, buildSupabaseHeaders } from '../../../lib/supabase-storage.js';

export class SupabaseRepository {
  constructor() {
    const cfg = getSupabaseConfig();
    this.url = cfg.url;
    this.anonKey = cfg.anonKey;
    this.tableName = 'mock_test_results';
  }

  async load(studentId) {
    // In a real app, we might want to load the LATEST result for this student
    // or maybe a specific test session. For now, let's just try to find one.
    try {
      const headers = buildSupabaseHeaders(this.anonKey);
      const res = await fetch(`${this.url}/rest/v1/${this.tableName}?student_id=eq.${studentId}&order=created_at.desc&limit=1`, {
        method: 'GET',
        headers
      });
      
      if (!res.ok) throw new Error(`Failed to fetch from Supabase: ${res.status}`);
      
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          completedSections: data[0].content.completedSections || {},
          answers: data[0].content.answers || {}
        };
      }
      return null;
    } catch (e) {
      console.error('Failed to load from Supabase', e);
      return null;
    }
  }

  async save(studentId, data) {
    try {
      const headers = buildSupabaseHeaders(this.anonKey);
      
      // Upsert: try to find existing record for this student to update, otherwise insert.
      // Since we don't have a unique constraint on student_id in the table (based on the schema shown),
      // we might end up with multiple records. For simplicity in this exercise, let's just insert.
      // A better way would be to have a unique constraint or use an ID.
      
      // Let's try to update if it exists, otherwise insert.
      // But since we don't have the ID of the record, we'll just insert a new one.
      // In a real production environment, we would handle this more carefully.

      const body = {
        student_id: String(studentId),
        content: data
      };

      const res = await fetch(`${this.url}/rest/v1/${this.tableName}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`Failed to save to Supabase: ${res.status}`);
    } catch (e) {
      console.error('Failed to save to Supabase', e);
    }
  }
}
