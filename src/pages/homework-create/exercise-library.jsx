import { useState } from 'react';
import { motion } from 'motion/react';
import { Icon, Button, Modal } from '../../components/shared.jsx';
import { EX_TYPES, getExType, exercisePreview } from '../../lib/exercise-types.js';
import { ExTypeBadge } from '../../components/exercise-editor.jsx';
import { ExercisePlayer } from '../../components/exercise-player.jsx';

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const k = keyFn(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}

export function ExerciseLibrary({
  libraryExercises,
  addFromLibrary,
  diagnosis,
}) {
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [previewEx, setPreviewEx] = useState(null);

  const priorityItems = diagnosis ? getPriorityItems(diagnosis) : [];
  const priorityAreas = [...new Set(priorityItems.map(p => (p.area || '').toLowerCase()))];
  const allMetSkills = [...new Set(EX_TYPES.flatMap(t => t.metSkill.split(',').map(s => s.trim()).filter(Boolean)))];
  const allLevels = [...new Set(libraryExercises.map(ex => ex.level).filter(Boolean))].sort();
  const typeOrder = EX_TYPES.map(t => t.id);
  const lowerQuery = query.toLowerCase();

  const filtered = libraryExercises.filter(ex => {
    const typeMeta = getExType(ex.type);
    if (!typeMeta) return false;
    if (typeFilter && ex.type !== typeFilter) return false;
    if (levelFilter && ex.level !== levelFilter) return false;
    if (skillFilter) {
      const exSkills = typeMeta.metSkill.split(',').map(s => s.trim());
      if (!exSkills.includes(skillFilter)) return false;
    }
    if (!lowerQuery) return true;
    const typeLabel = typeMeta.label.toLowerCase();
    const tags = Array.isArray(ex.tags) ? ex.tags.join(' ').toLowerCase() : '';
    return (ex.title || '').toLowerCase().includes(lowerQuery)
      || typeLabel.includes(lowerQuery)
      || tags.includes(lowerQuery)
      || (ex.level || '').toLowerCase().includes(lowerQuery)
      || (exercisePreview(ex) || '').toLowerCase().includes(lowerQuery);
  });

  const grouped = groupBy(filtered, ex => ex.type);
  const sortedKeys = [...grouped.keys()].sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));

  return (
    <div className="homework-library-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Your Exercise Library</span>
        <Button variant="ghost" size="sm" onClick={() => { setQuery(''); setLevelFilter(''); setTypeFilter(''); setSkillFilter(''); setPreviewEx(null); }} aria-label="Close library panel"><Icon.close size={12} /> Close</Button>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
        <select className="homework-lib-select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
          <option value="">All Levels</option>
          {allLevels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="homework-lib-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {EX_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select className="homework-lib-select" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
          <option value="">All Skills</option>
          {allMetSkills.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div className="search-input-wrap" style={{ marginBottom: 'var(--space-3)' }}>
        <Icon.search size={15} />
        <input type="text" className="search-input" placeholder="Search by title, type, tags, or level…"
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            <Icon.close size={15} />
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="card-row-meta" style={{ padding: 'var(--space-2) 0' }}>
          {libraryExercises.length === 0
            ? 'No saved exercises. In the homework builder, tap ☆ on any exercise to save it here.'
            : 'No exercises match the current filters.'}
        </p>
      ) : (
        <div>
          {sortedKeys.map(typeId => {
            const exType = EX_TYPES.find(t => t.id === typeId);
            const items = grouped.get(typeId);
            return (
              <div key={typeId} style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', padding: 'var(--space-1) 0' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-2)' }}>
                    {exType?.label || typeId}
                  </span>
                  <span className="card-row-meta">{items.length}</span>
                </div>
                {items.map(ex => {
                  const typeMeta = getExType(ex.type);
                  const isRecommended = typeMeta && priorityAreas.some(area => area && typeMeta.metSkill.split(',').includes(area));
                  return (
                    <div key={ex.id} className="exercise-item" style={{ padding: 'var(--space-1) 0' }}>
                      <ExTypeBadge typeId={ex.type} />
                      {ex.title && (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                          {ex.title}
                        </span>
                      )}
                      <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exercisePreview(ex)}
                      </span>
                      {ex.level && <span className="card-row-meta">{ex.level}</span>}
                      {ex.usageCount > 0 && <span className="card-row-meta">Used {ex.usageCount}×</span>}
                      {isRecommended && (
                        <span className="dx-match-badge" title="Matches a diagnosis priority area">Diagnosis</span>
                      )}
                      <div className="homework-lib-actions">
                        <button className="homework-lib-preview-btn" onClick={() => setPreviewEx(ex)} title="Preview full exercise">
                          <Icon.eye size={13} />
                        </button>
                        <Button variant="ghost" size="sm" onClick={() => addFromLibrary(ex)} style={{ flexShrink: 0 }}>Add</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      {previewEx && (
        <Modal open={!!previewEx} onClose={() => setPreviewEx(null)} title="Exercise Preview" maxWidth={680}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--divider)' }}>
              <ExTypeBadge typeId={previewEx.type} />
              {previewEx.level && <span className="card-row-meta" style={{ fontSize: 'var(--text-xs)' }}>{previewEx.level}</span>}
              {previewEx.title && (
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{previewEx.title}</span>
              )}
            </div>
            <div style={{
              padding: 'var(--space-4)',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-2)',
              border: '1px solid var(--divider)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              minHeight: '200px'
            }}>
              <ExercisePlayer exercise={previewEx} readOnly={true} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
              <Button variant="ghost" size="sm" onClick={() => setPreviewEx(null)}>Close</Button>
              <Button variant="primary" size="sm" onClick={() => { addFromLibrary(previewEx); setPreviewEx(null); }}>
                <Icon.plus size={13} /> Add to Homework
              </Button>
            </div>
          </motion.div>
        </Modal>
      )}
    </div>
  );
}

function getPriorityItems(dx) {
  return Array.isArray(dx?.priorityDiagnosis)
    ? dx.priorityDiagnosis
    : Array.isArray(dx?.sections?.priorityDiagnosis?.content)
      ? dx.sections.priorityDiagnosis.content
      : [];
}
