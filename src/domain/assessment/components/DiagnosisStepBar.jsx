import { useState } from 'react';
import { Icon, SectionHeader } from '../../../components/shared.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';

const DIAGNOSIS_STEPS = [
  { id: 'prereq',     label: 'Set up' },
  { id: 'generating', label: 'Save feedback' },
  { id: 'review',     label: 'Build in phases' },
  { id: 'saved',      label: 'Done' },
];
const STEP_ORDER = DIAGNOSIS_STEPS.map(s => s.id);

export function DiagnosisStepBar({ step }) {
  const current = STEP_ORDER.indexOf(step);
  return (
    <div className="step-bar">
      {DIAGNOSIS_STEPS.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={s.id} className="step-bar-item">
            {i > 0 && (
              <div className={`step-bar-connector${done ? ' step-bar-connector--done' : ''}`} />
            )}
            <div className={`step-bar-dot${done ? ' step-bar-dot--done' : ''}${active ? ' step-bar-dot--active' : ''}`}>
              {done && <Icon.check size={10} color="#fff" />}
              {active && <div className="step-bar-dot-inner" />}
            </div>
            <span className={`step-bar-label${done ? ' step-bar-label--done' : ''}${active ? ' step-bar-label--active' : ''}`}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DiagnosisGeneratingProgress({ generatingStatus }) {
  const currentSubstep = /Saving feedback/i.test(generatingStatus) ? 1 : 0;
  const substeps = ['Save feedback draft'];

  return (
    <div className="page-empty-state" style={{ minHeight: 320 }}>
      <div className="diagnosis-gen-progress">
        {substeps.map((label, i) => {
          const n = i + 1;
          const done = currentSubstep > n;
          const active = currentSubstep === n;
          return (
            <div key={label} className={`diagnosis-gen-step${done ? ' done' : ''}${active ? ' active' : ''}`}>
              <div className="diagnosis-gen-dot">
                {done ? <Icon.check size={12} color="#fff" /> : active ? <div className="diagnosis-gen-dot-inner" /> : null}
              </div>
              <span className="diagnosis-gen-step-label">{label}</span>
              {n < substeps.length && <div className={`diagnosis-gen-connector${done ? ' done' : ''}`} />}
            </div>
          );
        })}
      </div>
      <p className="card-row-meta text-center" style={{ maxWidth: 340 }}>{generatingStatus}</p>
    </div>
  );
}

export function DiagnosisSavedActions({ onBack, onSaveErrors, onSaveVocab, onSaveProgressNote, onCreateHomework, onDoneViewAll, zoomUrl }) {
  const [copied, setCopied] = useState(false);

  function copyZoomLink() {
    if (!zoomUrl) return;
    navigator.clipboard.writeText(zoomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="page-container page-container--sm">
      <button className="back-link" onClick={onBack}><Icon.arrowL size={14} /> Back to Review</button>
      <SectionHeader title="Post-Approval Actions" subtitle="Sync this diagnosis to other parts of the platform." />
      <Card className="card-p-5">
        <div className="stack-list gap-3">
          {zoomUrl && (
            <div className="zoom-section">
              <div className="flex-row-gap3">
                <Icon.globe size={14} color="var(--accent-text)" />
                <span className="font-semibold text-sm">Diagnosis Follow-up Zoom</span>
              </div>
              <p className="card-row-meta text-xs" style={{ marginTop: 4 }}>Ready for student feedback session</p>
              <div className="flex-row-gap2 mt-2">
                <Button variant="primary" size="sm" onClick={copyZoomLink}>
                  {copied ? <><Icon.check size={12} /> Link copied!</> : 'Copy Zoom Link'}
                </Button>
                <a href={zoomUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  Open Zoom <Icon.arrowR size={12} />
                </a>
              </div>
            </div>
          )}
          <Button variant="ghost" onClick={onSaveErrors}><Icon.warning size={14} /> Save Errors to Error Bank</Button>
          <Button variant="ghost" onClick={onSaveVocab}><Icon.book size={14} /> Save Vocabulary to Vocab Bank</Button>
          <Button variant="ghost" onClick={onSaveProgressNote}><Icon.doc size={14} /> Save Progress Note</Button>
          <Button variant="ghost" onClick={onCreateHomework}><Icon.homework size={14} /> Create Homework from Diagnosis</Button>
        </div>
      </Card>
      <Button variant="primary" onClick={onDoneViewAll}>
        <Icon.check size={14} /> Done. View All Diagnoses
      </Button>
    </div>
  );
}
