import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

const ToastContext = createContext(null);

const TOAST_GLYPHS = { ok: '+', info: 'i', warn: '!', go: '→' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef([]);

  const toast = useCallback((msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(arr => [...arr, { id, msg, kind }]);
    const t = setTimeout(() => setToasts(arr => arr.filter(x => x.id !== id)), 3200);
    timers.current.push(t);
  }, []);

  useEffect(() => {
    const onToast = (e) => toast(e.detail.msg, e.detail.kind);
    window.addEventListener('vv-toast', onToast);
    window.toast = toast;
    return () => {
      window.removeEventListener('vv-toast', onToast);
      delete window.toast;
      timers.current.forEach(clearTimeout);
    };
  }, [toast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be within ToastProvider');
  return ctx;
}

function ToastHost({ toasts }) {
  return (
    <div className="toast-host" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.kind || 'ok'}`}>
          <span className="toast-glyph">{TOAST_GLYPHS[t.kind] || '+'}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
