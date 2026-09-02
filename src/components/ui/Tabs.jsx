import { useId } from 'react';

export function Tabs({ tabs, active, onChange, renderPanel, label = 'Tabs' }) {
  const idPrefix = useId().replace(/:/g, '');

  function handleKeyDown(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    const nextTab = document.getElementById(`${idPrefix}-tab-${tabs[nextIndex].id}`);
    nextTab?.focus();
    onChange(tabs[nextIndex].id);
  }

  return (
    <div>
      <div className="pill-nav" role="tablist" aria-label={label}>
        {tabs.map(t => {
          const tabId = `${idPrefix}-tab-${t.id}`;
          const panelId = `tabpanel-${t.id}`;
          return (
          <button
            key={t.id}
            id={tabId}
            role="tab"
            aria-selected={active === t.id}
            aria-controls={panelId}
            tabIndex={active === t.id ? 0 : -1}
            className={`pill-nav-btn ${active === t.id ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
            onKeyDown={event => handleKeyDown(event, tabs.findIndex(tab => tab.id === t.id))}
          >
            {t.label}
          </button>
          );
        })}
      </div>
      {tabs.map(t => {
        const panelId = `tabpanel-${t.id}`;
        const tabId = `${idPrefix}-tab-${t.id}`;
        return (
          <div key={t.id} id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={0} hidden={active !== t.id}>
            {renderPanel ? renderPanel(t) : t.children}
          </div>
        );
      })}
    </div>
  );
}
