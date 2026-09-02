import { useState, useMemo, useEffect } from 'react';
import { Icon } from '../components/shared.jsx';
import RESOURCES, { CATEGORIES, RESOURCE_TYPES } from '../data/student-resources.js';

const TYPE_META = {
  cheatsheet: { emoji: '📋', label: 'Cheat Sheet', color: 'var(--primary)', bg: 'var(--primary-light)' },
  article: { emoji: '📄', label: 'Guide & Article', color: 'var(--info)', bg: 'var(--info-bg)' },
  video: { emoji: '🎬', label: 'Video & Audio', color: 'var(--warning-text)', bg: 'var(--warning-bg)' },
  template: { emoji: '📝', label: 'Template', color: 'var(--success)', bg: 'var(--success-bg)' },
  link: { emoji: '🔗', label: 'Official Doc', color: 'var(--ink-muted)', bg: 'var(--ink-light)' },
};

export default function StudentResources({ 'data-testid': testId }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalResource, setActiveModalResource] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('met_student_saved_resources');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('met_student_saved_resources', JSON.stringify(bookmarkedIds));
    } catch {
      // ignore localstorage errors
    }
  }, [bookmarkedIds]);

  const toggleBookmark = (id, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCopyContent = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  const filtered = useMemo(() => {
    return RESOURCES.filter(r => {
      // Category filter
      if (selectedCategory !== 'all' && r.category !== selectedCategory) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && r.type !== selectedType) {
        return false;
      }
      // Bookmark filter
      if (showOnlyBookmarked && !bookmarkedIds.includes(r.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = r.title.toLowerCase().includes(query);
        const inDesc = r.description.toLowerCase().includes(query);
        const inTags = r.tags && r.tags.some(t => t.toLowerCase().includes(query));
        const inSource = r.source && r.source.toLowerCase().includes(query);
        const inWhy = r.why && r.why.toLowerCase().includes(query);
        return inTitle || inDesc || inTags || inSource || inWhy;
      }
      return true;
    });
  }, [selectedCategory, selectedType, showOnlyBookmarked, bookmarkedIds, searchQuery]);

  // Featured high-yield resources
  const featuredResources = useMemo(() => {
    return RESOURCES.filter(r => ['res-spk-1', 'res-wri-1', 'res-read-1', 'res-strat-1'].includes(r.id));
  }, []);

  return (
    <div style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: 1040, margin: '0 auto' }} data-testid={testId}>
      {/* Header Banner */}
      <div style={{
        marginBottom: 28,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 20,
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 'var(--text-2xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: '4px 10px',
            borderRadius: 999,
            marginBottom: 8,
          }}>
            <Icon.spark size={12} /> Student Study Vault
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            MET Mastery Resource Library
          </h1>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink-muted)', maxWidth: 620, lineHeight: 1.5 }}>
            Comprehensive Michigan English Test (MET) blueprints, formulas, vocabulary banks, and official strategy guides.
          </p>
        </div>

        {/* Saved Count Badge Toggle */}
        <button
          type="button"
          onClick={() => setShowOnlyBookmarked(prev => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: showOnlyBookmarked ? '2px solid var(--accent)' : '1px solid var(--border)',
            background: showOnlyBookmarked ? 'var(--accent-light)' : 'var(--surface)',
            color: showOnlyBookmarked ? 'var(--accent-text)' : 'var(--ink)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all .15s ease',
          }}
        >
          <Icon.star size={15} fill={showOnlyBookmarked ? 'currentColor' : 'none'} color={showOnlyBookmarked ? 'var(--accent)' : 'var(--ink-muted)'} />
          {showOnlyBookmarked ? 'Showing Saved' : 'Saved Items'} ({bookmarkedIds.length})
        </button>
      </div>

      {/* Featured Quick-Access Kits */}
      {!searchQuery && selectedCategory === 'all' && selectedType === 'all' && !showOnlyBookmarked && (
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)' }}>
              ⚡ High-Yield Exam Toolkits
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Click to read in-app</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {featuredResources.map(feat => (
              <div
                key={feat.id}
                onClick={() => setActiveModalResource(feat)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all .18s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{TYPE_META[feat.type]?.emoji || '📄'}</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                    }}>
                      {feat.level}
                    </span>
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--ink)', marginBottom: 4, lineHeight: 1.35 }}>
                    {feat.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                    {feat.duration} · {feat.source}
                  </p>
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span>Open Cheat Sheet</span>
                  <Icon.arrowR size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px',
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ink-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <Icon.search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by topic, skill, grammar rule, or keyword (e.g. Inversions, Speaking, Task 2, Collocations)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 38px 10px 38px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--ink)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color .15s ease',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
                padding: 4,
              }}
              title="Clear search"
            >
              <Icon.close size={14} />
            </button>
          )}
        </div>

        {/* Skill Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid',
              borderColor: selectedCategory === 'all' ? 'var(--primary)' : 'var(--border)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: selectedCategory === 'all' ? 'var(--primary)' : 'var(--surface)',
              color: selectedCategory === 'all' ? '#fff' : 'var(--ink)',
              transition: 'all .15s ease',
            }}
          >
            All Skills ({RESOURCES.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = RESOURCES.filter(r => r.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--primary)' : 'var(--surface)',
                  color: isSelected ? '#fff' : 'var(--ink)',
                  transition: 'all .15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span style={{
                  fontSize: '0.68rem',
                  opacity: 0.8,
                  marginLeft: 2,
                }}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Format Selector Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
          borderTop: '1px dashed var(--border)',
          paddingTop: 10,
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-muted)', marginRight: 4 }}>
            Format:
          </span>
          {RESOURCE_TYPES.map(t => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--ink-2)' : 'var(--bg)',
                  color: isSelected ? '#fff' : 'var(--ink-muted)',
                  transition: 'all .15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {t.icon && <span>{t.icon}</span>}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        padding: '0 4px',
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
          Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'resource' : 'resources'}
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          {showOnlyBookmarked && <span> in your Saved list</span>}
        </div>
        {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all' || showOnlyBookmarked) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedType('all');
              setShowOnlyBookmarked(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Resources Grid / List */}
      <div style={{ display: 'grid', gap: 14 }}>
        {filtered.map(r => {
          const tm = TYPE_META[r.type] || TYPE_META.link;
          const isSaved = bookmarkedIds.includes(r.id);
          const hasContent = Boolean(r.content);

          return (
            <div
              key={r.id}
              style={{
                display: 'block',
                padding: '18px 20px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                transition: 'all .15s ease',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* Emoji / Icon Box */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-sm)',
                  background: tm.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {tm.emoji}
                </div>

                {/* Content Container */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--ink)', fontWeight: 700 }}>
                        {r.title}
                      </strong>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: tm.bg,
                        color: tm.color,
                      }}>
                        {tm.label}
                      </span>
                      {r.level && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--bg-deep)',
                          color: 'var(--ink)',
                        }}>
                          {r.level}
                        </span>
                      )}
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(r.id, e)}
                      title={isSaved ? 'Remove from saved' : 'Save for later'}
                      style={{
                        background: isSaved ? 'var(--accent-light)' : 'transparent',
                        border: '1px solid',
                        borderColor: isSaved ? 'var(--accent)' : 'var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isSaved ? 'var(--accent-text)' : 'var(--ink-muted)',
                        transition: 'all .12s ease',
                      }}
                    >
                      <Icon.star size={13} fill={isSaved ? 'currentColor' : 'none'} color={isSaved ? 'var(--accent)' : 'var(--ink-muted)'} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: '0.84rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                    {r.description}
                  </p>

                  {/* Metadata & Tag Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: 12, alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon.doc size={12} /> {r.source}
                    </span>
                    {r.duration && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon.timer size={12} /> {r.duration}
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 500 }}>
                      <Icon.bulb size={12} /> {r.why}
                    </span>
                  </div>

                  {/* Tags & Action Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {r.tags && r.tags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSearchQuery(tag)}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--ink-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {hasContent && (
                        <button
                          type="button"
                          onClick={() => setActiveModalResource(r)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            transition: 'background .15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                        >
                          <Icon.eye size={13} /> Read Cheat Sheet
                        </button>
                      )}

                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg)',
                            color: 'var(--ink)',
                            border: '1px solid var(--border)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            transition: 'all .15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <span>Source</span>
                          <Icon.arrowR size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginTop: 16,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--ink)' }}>No study resources found</h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
            Try broadening your search query or switching the category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedType('all');
              setShowOnlyBookmarked(false);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Show All Resources
          </button>
        </div>
      )}

      {/* Interactive Reader / Quick View Modal */}
      {activeModalResource && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(26, 46, 53, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setActiveModalResource(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              width: '100%',
              maxWidth: 760,
              maxHeight: '88vh',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-modal)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{TYPE_META[activeModalResource.type]?.emoji || '📋'}</span>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                    {activeModalResource.category.toUpperCase()} · {activeModalResource.level || 'MET B2'}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--ink)', fontWeight: 700 }}>
                    {activeModalResource.title}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => toggleBookmark(activeModalResource.id)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    color: bookmarkedIds.includes(activeModalResource.id) ? 'var(--accent)' : 'var(--ink-muted)',
                  }}
                  title="Bookmark"
                >
                  <Icon.star size={14} fill={bookmarkedIds.includes(activeModalResource.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalResource(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-muted)',
                    cursor: 'pointer',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Close (Esc)"
                >
                  <Icon.close size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body / Markdown Reader */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1,
              color: 'var(--ink)',
              fontSize: '0.92rem',
              lineHeight: 1.65,
            }}>
              <div style={{
                background: 'var(--bg)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 20,
                borderLeft: '4px solid var(--primary)',
                fontSize: '0.84rem',
                color: 'var(--ink-muted)',
              }}>
                <strong>Why this matters:</strong> {activeModalResource.why} · <em>Source: {activeModalResource.source}</em>
              </div>

              {/* Render formatted content */}
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {activeModalResource.content}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <button
                type="button"
                onClick={() => handleCopyContent(activeModalResource.content || activeModalResource.description)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: copySuccess ? 'var(--success-bg)' : 'var(--surface)',
                  color: copySuccess ? 'var(--success)' : 'var(--ink)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all .15s ease',
                }}
              >
                {copySuccess ? <Icon.check size={14} /> : <Icon.copy size={14} />}
                {copySuccess ? 'Copied Guide to Clipboard!' : 'Copy Guide Text'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {activeModalResource.url && (
                  <a
                    href={activeModalResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>Visit Michigan Assessment Source</span>
                    <Icon.arrowR size={13} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveModalResource(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
