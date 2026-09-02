import { useEffect, useRef, useState } from 'react';
import { StudioEditor } from '@grapesjs/studio-sdk';
import '@grapesjs/studio-sdk/dist/style.css';
import { SectionHeader } from '../components/shared.jsx';

const LICENSE_KEY = 'YOUR_LICENSE_KEY_HERE';

const PROJECT_TYPES = [
  { id: 'web', label: 'Landing Page', desc: 'Marketing pages, lead capture, course sales' },
  { id: 'email', label: 'Email Template', desc: 'Newsletters, notifications, drip campaigns' },
  { id: 'document', label: 'Document', desc: 'Printable worksheets, certificates, PDFs' },
];

export default function VisualEditorPage({ _onNavigate, "data-testid": testId }) {
  const [projectType, setProjectType] = useState('web');
  const [editor, setEditor] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || editor) return;

    const instance = new StudioEditor({
      container: containerRef.current,
      licenseKey: LICENSE_KEY,
      projectType: projectType,
      project: {
        _id: `met-${projectType}-${Date.now()}`,
        _name: `MET ${projectType.charAt(0).toUpperCase() + projectType.slice(1)} Project`,
      },
      onReady: () => setIsReady(true),
      onProjectChange: (_project) => {
        // Project saved - could persist to backend here
      },
      onError: (err) => {
        console.error('[VisualEditor] Error:', err);
      },
    });

    setEditor(instance);

    return () => {
      instance.destroy();
    };
  }, [projectType, editor]);

  const handleProjectTypeChange = (newType) => {
    if (editor) {
      editor.destroy();
      setEditor(null);
    }
    setProjectType(newType);
    setIsReady(false);
  };

  return (
    <div className="page-shell" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }} data-testid={testId}>
      <div className="ve-header" style={{
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}>
        <SectionHeader
          title="Visual Content Builder"
          sub="Create landing pages, email templates, or printable documents visually"
        />
        <div className="ve-type-selector" style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {PROJECT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => handleProjectTypeChange(t.id)}
              className={`ve-type-btn ${projectType === t.id ? 'active' : ''}`}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${projectType === t.id ? 'var(--primary)' : 'var(--border)'}`,
                background: projectType === t.id ? 'var(--primary)' : 'var(--surface)',
                color: projectType === t.id ? 'var(--on-primary)' : 'var(--text)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
              title={t.desc}
            >
              {t.label}
              <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 400 }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="ve-container"
        style={{
          flex: 1,
          overflow: 'hidden',
          background: 'var(--bg)',
          position: 'relative',
        }}
      >
        {!isReady && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-lg)',
          }}>
            Loading {projectType} editor...
          </div>
        )}
      </div>

      <style>{`
        .ve-type-btn:hover {
          border-color: var(--primary) !important;
        }
        .ve-type-btn.active {
          box.active {
            border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}