import { useState, useEffect, useCallback } from 'react';
import { Icon, SectionHeader, Pill, Avatar, FilterChip } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ConfirmModal, BulkActionModal } from '../components/ui/ConfirmModal.jsx';
import { getAllSubmissions, getHomework, getReviews, deleteSubmission, deleteReview } from '../lib/workflow.js';

export default function SubmissionsPage({ students, onNavigate, "data-testid": testId }) {
  const [submissions, setSubmissions] = useState([]);
  const [homework, setHomework] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [subs, hw, revs] = await Promise.all([getAllSubmissions(), getHomework(), getReviews()]);
      setSubmissions(subs || []);
      setHomework(hw || []);
      setReviews(revs || []);
    } catch (e) {
      window.toast?.(`Failed to load submissions: ${e.message}`, 'warn');
    }
  }

  const reviewedIds = new Set(reviews.map(r => r.submissionId));
  const filtered = submissions.filter(s => {
    if (filter === 'pending') return s.status === 'submitted' && !reviewedIds.has(s.id);
    if (filter === 'reviewed') return reviewedIds.has(s.id);
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'submitted' && !reviewedIds.has(s.id)).length;

  const toggleSelection = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  }, [filtered, selectedIds]);

  const handleDeleteSubmission = useCallback(async (id) => {
    await deleteSubmission(id);
    load();
  }, []);

  const handleDeleteReview = useCallback(async (id) => {
    await deleteReview(id);
    load();
  }, []);

  const handleBulkAction = useCallback(async (actionId) => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      if (actionId === 'delete') await deleteSubmission(id);
      else if (actionId === 'mark-reviewed') {
        // Would need a separate API for this
      }
    }
    setSelectedIds(new Set());
    load();
    setBulkActionOpen(false);
  }, [selectedIds]);

  const showConfirm = useCallback((config) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  }, []);

  return (
    <div className="page-shell" data-testid={testId}>
      <SectionHeader
        title="Submissions"
        sub={`${pendingCount} pending review · ${submissions.length} total`}
      />

      <div className="page-filters">
        {['pending', 'reviewed', 'all'].map(f => (
          <FilterChip key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} count={f === 'pending' ? pendingCount : undefined} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="bulk-action-bar" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-soft)', borderRadius: 'var(--radius-md)', marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--accent)' }}>
            {selectedIds.size} selected
          </span>
          <Button size="sm" variant="primary" onClick={() => setBulkActionOpen(true)}>
            <Icon.check size={12} /> Bulk Actions
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="page-empty-state">
          <p className="text-muted">{filter === 'pending' ? 'No submissions awaiting review.' : 'No submissions found.'}</p>
        </Card>
      ) : (
        <div className="grid-square">
          {filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginBottom: 8, borderBottom: '1px solid var(--border)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  indeterminate={selectedIds.size > 0 && selectedIds.size < filtered.length}
                  onChange={toggleAll}
                />
                <span>Select all ({filtered.length})</span>
              </label>
            </div>
          )}
          {filtered.map(sub => {
            const student = students.find(s => s.id === sub.studentId);
            const hw = homework.find(h => h.id === sub.homeworkId);
            const review = reviews.find(r => r.submissionId === sub.id);
            const reviewed = !!review;
            const isSelected = selectedIds.has(sub.id);
            return (
              <Card key={sub.id} className={`square-card${!reviewed ? ' square-card--warning' : ''} ${isSelected ? ' square-card--selected' : ''}`} style={{ ...(!reviewed ? { borderColor: 'var(--warning-soft)' } : undefined), ...(isSelected ? { borderColor: 'var(--accent)', background: 'var(--accent-subtle)' } : {}) }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(sub.id)}
                    style={{ marginTop: 4, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Avatar name={student?.name || '?'} size={40} />
                    <div className="text-sm font-ui" style={{ fontWeight: 600, textAlign: 'center', marginTop: 8 }}>{student?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted" style={{ textAlign: 'center', marginBottom: 8 }}>
                      {hw?.title || 'Homework submission'}
                    </div>
                    <Pill tone={reviewed ? 'success' : 'warning'} className="mb-2">{reviewed ? 'Reviewed' : 'Needs Review'}</Pill>
                    <div className="flex justify-center" style={{ marginTop: 'auto', width: '100%', gap: 4 }}>
                      <Button variant={reviewed ? 'ghost' : 'primary'} size="sm" onClick={() => onNavigate('submissions:review', { submissionId: sub.id })}>
                        {reviewed ? 'View Review' : 'Review'}
                      </Button>
                      {reviewed && (
                        <Button variant="ghost" size="sm" className="text-warning" onClick={() => showConfirm({
                          title: 'Delete Review',
                          message: 'Delete this teacher review? The submission will return to Needs Review.',
                          onConfirm: () => { handleDeleteReview(review.id); setConfirmOpen(false); }
                        })}>
                          Del
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-danger" onClick={() => showConfirm({
                        title: 'Delete Submission',
                        message: 'Delete this submission and its review? This cannot be undone.',
                        onConfirm: () => { handleDeleteSubmission(sub.id); setConfirmOpen(false); }
                      })}>
                        <Icon.trash size={12} />
                      </Button>
                    </div>
                  </div>
                </label>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmConfig(null); }}
        onConfirm={() => { confirmConfig?.onConfirm?.(); setConfirmOpen(false); setConfirmConfig(null); }}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        confirmLabel={confirmConfig?.confirmLabel}
        confirmVariant={confirmConfig?.confirmVariant}
      />

      <BulkActionModal
        open={bulkActionOpen}
        onClose={() => setBulkActionOpen(false)}
        onConfirm={handleBulkAction}
        selectedCount={selectedIds.size}
        itemLabel="submission"
        actions={[
          { id: 'mark-reviewed', label: 'Mark as reviewed', variant: 'primary', icon: <Icon.check size={14} /> },
          { id: 'delete', label: 'Delete selected', variant: 'danger', icon: <Icon.trash size={14} /> },
        ]}
      />
    </div>
  );
}

