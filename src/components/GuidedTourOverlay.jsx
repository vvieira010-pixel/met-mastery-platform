import { useEffect, useState } from 'react';

export default function GuidedTourOverlay({ highlight, onDismiss, onNext, totalSteps }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!highlight) return undefined;
    const update = () => {
      const target = [...document.querySelectorAll(`[data-tour-target="${highlight.id}"]`)].find(node => {
        const bounds = node.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.right > 0 && bounds.top < window.innerHeight && bounds.left < window.innerWidth;
      });
      if (!target) return setRect(null);
      const next = target.getBoundingClientRect();
      setRect(next.width > 0 && next.height > 0 ? next : null);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer.disconnect();
    };
  }, [highlight]);

  if (!highlight) return null;

  return (
    <div aria-live="polite" aria-label="Guided tour highlight" style={{ position: 'fixed', inset: 0, zIndex: 1200, pointerEvents: 'none' }}>
      {rect && <div aria-hidden="true" style={{ position: 'fixed', top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, border: '3px solid var(--accent)', borderRadius: 'var(--radius-md)', boxShadow: '0 0 0 9999px rgba(7, 28, 42, .42)', transition: 'all 160ms ease' }} />}
      <section style={{ position: 'fixed', pointerEvents: 'auto', top: rect ? Math.min(rect.bottom + 14, window.innerHeight - 180) : 24, left: rect ? Math.min(Math.max(rect.left, 16), window.innerWidth - 336) : 16, width: 'min(320px, calc(100vw - 32px))', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface-raised)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', color: 'var(--text)' }}>
        <p style={{ margin: 0, color: 'var(--primary)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Guided practice · Step {highlight.step}{totalSteps ? ` of ${totalSteps}` : ''}</p>
        <h2 style={{ margin: 'var(--space-1) 0', fontSize: 'var(--text-base)' }}>{highlight.label}</h2>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 'var(--text-sm)', lineHeight: 1.45 }}>{rect ? highlight.description : 'This target is not visible yet. Complete the current step, then ask Codex to check again.'}</p>
        {onNext ? (
          <button type="button" onClick={onNext} style={{ marginTop: 'var(--space-3)', minHeight: 44, padding: '8px 14px', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', background: 'var(--primary)', color: '#fff', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>{highlight.step >= totalSteps ? 'Done' : 'Next'}</button>
        ) : (
          <button type="button" onClick={onDismiss} style={{ marginTop: 'var(--space-3)', minHeight: 44, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text)', font: 'inherit', cursor: 'pointer' }}>Dismiss highlight</button>
        )}
      </section>
    </div>
  );
}
