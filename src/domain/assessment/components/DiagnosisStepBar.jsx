import { Icon, SectionHeader } from '../../../components/shared.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';

const DIAGNOSIS_STEPS = [
  { id: 'prereq',     label: 'Set up' },
  { id: 'generating', label: 'Analyzing' },
  { id: 'write',      label: 'Write' },
  { id: 'review',     label: 'Review' },
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
  const substepMatch = generatingStatus.match(/Step (\d+)\/4/);
  const currentSubstep = substepMatch ? parseInt(substepMatch[1]) : 0;
  const substeps = ['Skill diagnosis', 'Error & vocab analysis', 'Student feedback', 'Homework recommendation'];

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
              {n < 4 && <div className={`diagnosis-gen-connector${done ? ' done' : ''}`} />}
            </div>
          );
        })}
      </div>
      <p className="card-row-meta text-center" style={{ maxWidth: 340 }}>{generatingStatus}</p>
    </div>
  );
}

export function DiagnosisSavedActions({ onBack, onSaveErrors, onSaveVocab, onSaveProgressNote, onCreateHomework, onDoneViewAll }) {
  return (
    <div className="page-container page-container--sm">
      <button className="back-link" onClick={onBack}><Icon.arrowL size={14} /> Back to Review</button>
      <SectionHeader title="Post-Approval Actions" subtitle="Sync this diagnosis to other parts of the platform." />
      <Card className="card-p-5">
        <div className="stack-list gap-3">
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
