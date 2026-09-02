import { useState, useEffect, useRef } from 'react';
import { Icon } from '/src/components/shared.jsx';
import { HELP_CONTENT } from './HelpContent.js';

function HelpCard({ topic, onClose }) {
  const data = HELP_CONTENT[topic];
  if (!data) return null;

  return (
    <div className="help-card-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div className="help-card" onClick={e => e.stopPropagation()}>
        <header>
          <h2 id="help-title">{data.title}</h2>
          <p className="help-summary">{data.summary}</p>
          <button className="help-close" onClick={onClose} aria-label="Close help">
            <Icon.close size={18} />
          </button>
        </header>

        <section className="help-section">
          <h3>Workflow</h3>
          <ol>
            {data.steps.map((s, i) => (
              <li key={i}>
                <strong>{s.label}</strong> — {s.detail}
              </li>
            ))}
          </ol>
        </section>

        <section className="help-section">
          <h3>Pro Tips</h3>
          <ul>
            {data.tips.map((t, i) => (
              <li key={i}><Icon.spark size={12} /> {t}</li>
            ))}
          </ul>
        </section>

        <section className="help-section">
          <h3>Shortcuts</h3>
          <div className="help-shortcuts">
            {data.shortcuts.map((s, i) => (
              <kbd key={i}>{s}</kbd>
            ))}
          </div>
        </section>

        <section className="help-section">
          <h3>Related</h3>
          <div className="help-related">
            {data.related.map(r => (
              <button key={r} className="help-related-btn" onClick={() => window.dispatchEvent(new CustomEvent('help:open', { detail: r }))}>
                {r}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function HelpTrigger({ topic, children }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (triggerRef.current?.contains(e.target) || cardRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const content = typeof children === 'function' ? children({ open, setOpen }) : children;

  return (
    <div className="help-trigger" ref={triggerRef}>
      {content}
      <button
        ref={triggerRef}
        className="help-trigger-btn"
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        aria-label={`Help for ${HELP_CONTENT[topic]?.title || topic}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Icon.help size={14} />
      </button>
      {open && <HelpCard topic={topic} onClose={() => setOpen(false)} ref={cardRef} />}
    </div>
  );
}

export function HelpPaletteSection() {
  const topics = Object.keys(HELP_CONTENT);
  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <Icon.help size={14} />
        <span>Contextual Help</span>
      </div>
      <div className="cp-help-grid">
        {topics.map(topic => {
          const data = HELP_CONTENT[topic];
          return (
            <button
              key={topic}
              className="cp-help-item"
              onClick={() => window.dispatchEvent(new CustomEvent('help:open', { detail: topic }))}
            >
              <span className="cp-help-item-icon">{data.shortcuts[0]?.length ? data.shortcuts[0] : '?'}</span>
              <span className="cp-help-item-label">{data.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HelpTrigger;