import { useState } from 'react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { dbUpsert } from '../../lib/supabase-db.js';

export default function AssignMockTestModal({ isOpen, onClose, students }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTest, setSelectedTest] = useState('mock-test-1');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      await dbUpsert('assignments', {
        student_id: selectedStudent,
        mock_test_id: selectedTest,
        created_at: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to assign mock test:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Assign Mock Test">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label>
          Student:
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
            <option value="">Select a student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label>
          Mock Test:
          <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)}>
            <option value="mock-test-1">MET Mock Test 1</option>
            <option value="mock-test-2">MET Mock Test 2</option>
          </select>
        </label>
        <Button onClick={handleAssign} disabled={loading || !selectedStudent}>
          {loading ? 'Assigning...' : 'Assign Mock Test'}
        </Button>
      </div>
    </Modal>
  );
}
