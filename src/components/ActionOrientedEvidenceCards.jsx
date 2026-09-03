import { useState, useRef, useEffect } from 'react';
import { Icon } from './shared.jsx';
import { submitHomework, saveHomework, getHomework, getSubmissions } from '../lib/workflow.js';

export default function ActionOrientedEvidenceCards({
  student,
  nextClass,
  onEvidenceSubmitted,
  className = '',
  'data-testid': testId = 'action-evidence-cards',
}) {
  const [activeTab, setActiveTab] = useState('speaking'); // 'speaking' | 'writing'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [speakingNotes, setSpeakingNotes] = useState('');
  const [writingContent, setWritingContent] = useState('');
  const [writingFile, setWritingFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedHistory, setSubmittedHistory] = useState([]);
  const [recordError, setRecordError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Load past evidence submissions
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [hwList, subsList] = await Promise.all([
          getHomework(student.id).catch(() => []),
          getSubmissions(student.id).catch(() => []),
        ]);
        if (!active) return;
        const evidenceSubs = (subsList || [])
          .filter(s => s.content?.isPreSessionEvidence || s.content?.type === 'speaking-sample' || s.content?.type === 'writing-sample')
          .map(s => {
            const hw = (hwList || []).find(h => h.id === s.homeworkId);
            return {
              id: s.id,
              type: s.content?.type || 'speaking-sample',
              title: hw?.title || 'Pre-session Evidence',
              submittedAt: s.submittedAt,
              status: s.status || 'submitted',
              notes: s.content?.notes || s.content?.text || '',
              hasAudio: !!s.content?.hasAudio,
            };
          })
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setSubmittedHistory(evidenceSubs);
      } catch (err) {
        console.warn('[ActionEvidenceCards] failed loading history:', err);
      }
    })();
    return () => {
      active = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [student.id]);

  const startRecording = async () => {
    setRecordError(null);
    setAudioBlobUrl(null);
    setAudioFile(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser environment. You can upload an audio file instead.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 45) {
            // Auto stop at 45 seconds (standard MET speaking length)
            stopRecording();
            return 45;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('[ActionEvidenceCards] recording error:', err);
      setRecordError(err.message || 'Could not access microphone.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'audio') {
      setAudioFile(file);
      setAudioBlobUrl(URL.createObjectURL(file));
    } else {
      setWritingFile(file);
    }
  };

  const handleSubmitSpeakingEvidence = async () => {
    if (!audioBlobUrl && !audioFile && !speakingNotes.trim()) {
      window.toast?.('Please record audio, upload a file, or enter speaking notes first.', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create or associate with a homework evidence record
      const hwTitle = `Speaking Sample: 45s MET Task (for ${nextClass?.date || 'Upcoming Class'})`;
      const hw = await saveHomework({
        studentId: student.id,
        title: hwTitle,
        skill: 'speaking',
        type: 'speaking-sample',
        status: 'submitted',
        instructions: 'Pre-session speaking sample submitted for teacher review queue.',
        classEventId: nextClass?.id || null,
        assignedAt: new Date().toISOString(),
      });

      // 2. Submit evidence content
      const submissionContent = {
        isPreSessionEvidence: true,
        type: 'speaking-sample',
        hasAudio: !!(audioBlobUrl || audioFile),
        audioFileName: audioFile ? audioFile.name : (audioBlobUrl ? 'recorded-speaking-sample.webm' : null),
        durationSeconds: recordingTime || 45,
        notes: speakingNotes.trim(),
        prompt: 'Describe a situation where you resolved an unexpected challenge. Speak for 45 seconds with one clear example.',
        submittedForClassId: nextClass?.id || null,
      };

      const sub = await submitHomework(
        hw.id,
        student.id,
        submissionContent,
        null,
        3
      );

      window.toast?.('Speaking sample submitted directly to teacher review queue!', 'ok');

      // Update local history
      setSubmittedHistory(prev => [
        {
          id: sub.id,
          type: 'speaking-sample',
          title: hwTitle,
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          notes: speakingNotes.trim(),
          hasAudio: true,
        },
        ...prev,
      ]);

      // Reset form
      setAudioBlobUrl(null);
      setAudioFile(null);
      setSpeakingNotes('');
      setRecordingTime(0);

      if (onEvidenceSubmitted) onEvidenceSubmitted(sub);
    } catch (err) {
      console.error('[ActionEvidenceCards] speaking submit failed:', err);
      window.toast?.('Failed to submit speaking sample. Please retry.', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWritingEvidence = async () => {
    if (!writingContent.trim() && !writingFile) {
      window.toast?.('Please enter your writing sample or attach a text file.', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      const hwTitle = `Writing Evidence: MET B2 Task (for ${nextClass?.date || 'Upcoming Class'})`;
      const hw = await saveHomework({
        studentId: student.id,
        title: hwTitle,
        skill: 'writing',
        type: 'writing-sample',
        status: 'submitted',
        instructions: 'Pre-session writing evidence submitted for teacher review queue.',
        classEventId: nextClass?.id || null,
        assignedAt: new Date().toISOString(),
      });

      const submissionContent = {
        isPreSessionEvidence: true,
        type: 'writing-sample',
        hasFile: !!writingFile,
        fileName: writingFile?.name || null,
        text: writingContent.trim(),
        submittedForClassId: nextClass?.id || null,
      };

      const sub = await submitHomework(
        hw.id,
        student.id,
        submissionContent,
        null,
        3
      );

      window.toast?.('Writing draft submitted to teacher review queue!', 'ok');

      setSubmittedHistory(prev => [
        {
          id: sub.id,
          type: 'writing-sample',
          title: hwTitle,
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          notes: writingContent.trim().substring(0, 80) + '...',
          hasAudio: false,
        },
        ...prev,
      ]);

      setWritingContent('');
      setWritingFile(null);

      if (onEvidenceSubmitted) onEvidenceSubmitted(sub);
    } catch (err) {
      console.error('[ActionEvidenceCards] writing submit failed:', err);
      window.toast?.('Failed to submit writing draft. Please retry.', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`action-oriented-evidence-module ${className}`}
      data-testid={testId}
      style={{
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #F6F4EE)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--primary, #2D7A8C)',
              }}
            >
              Action-Oriented Evidence Cards
            </span>
            {nextClass && (
              <span style={{ fontSize: '0.72rem', color: 'var(--muted, #6B7C80)' }}>
                for Class on {nextClass.date || 'Next Session'}
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text, #1A2E35)' }}>
            Submit Practice Samples Directly to Teacher Review Queue
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted, #6B7C80)' }}>
            Short recordings or writing notes submitted here are routed straight into your teacher's grading workspace.
          </p>
        </div>

        {/* Skill Type Switcher */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg, #FDFCF8)', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('speaking')}
            style={{
              border: 'none',
              background: activeTab === 'speaking' ? 'var(--surface, #ffffff)' : 'transparent',
              color: activeTab === 'speaking' ? 'var(--text, #1A2E35)' : 'var(--muted, #6B7C80)',
              fontWeight: activeTab === 'speaking' ? 700 : 500,
              fontSize: '0.78rem',
              padding: '5px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: activeTab === 'speaking' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <Icon.chat size={14} /> Speaking Sample (45s)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('writing')}
            style={{
              border: 'none',
              background: activeTab === 'writing' ? 'var(--surface, #ffffff)' : 'transparent',
              color: activeTab === 'writing' ? 'var(--text, #1A2E35)' : 'var(--muted, #6B7C80)',
              fontWeight: activeTab === 'writing' ? 700 : 500,
              fontSize: '0.78rem',
              padding: '5px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: activeTab === 'writing' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <Icon.write size={14} /> Writing Draft
          </button>
        </div>
      </div>

      {/* Speaking Sample Card */}
      {activeTab === 'speaking' && (
        <div
          style={{
            background: 'var(--bg, #FDFCF8)',
            border: '1px solid var(--border, #F6F4EE)',
            borderRadius: 10,
            padding: 16,
          }}
          data-testid="speaking-evidence-card"
        >
          {/* Authentic MET Prompt Box */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text, #1A2E35)' }}>
                Target Task: 45-Second Oral Response with One Concrete Example
              </strong>
              <span style={{ fontSize: '0.7rem', color: '#3D8C65', fontWeight: 600, background: 'rgba(22, 163, 74, 0.1)', padding: '1px 6px', borderRadius: 4 }}>
                MET Stage 3–5
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-2, #2B454E)', lineHeight: 1.5 }}>
              <em>"Describe a challenging decision you faced recently. Explain the situation, what choice you made, and what the final outcome was. Aim for continuous flow with clear discourse linkers."</em>
            </p>
          </div>

          {/* Recorder Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: 'var(--surface, #ffffff)',
              border: '1px solid var(--border, #F6F4EE)',
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#A34E48',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
                data-testid="start-record-btn"
              >
                <Icon.video size={15} /> Start 45s Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#2B454E',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  animation: 'pulse 1.5s infinite',
                }}
                data-testid="stop-record-btn"
              >
                <Icon.close size={15} /> Stop Recording ({45 - recordingTime}s left)
              </button>
            )}

            {/* Timer Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 700, color: isRecording ? '#A34E48' : 'var(--text, #1A2E35)' }}>
              <Icon.clock size={15} />
              <span>{Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')} / 0:45</span>
            </div>

            {/* Audio Preview if recorded */}
            {audioBlobUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <audio controls src={audioBlobUrl} style={{ height: 32, maxWidth: 220 }} />
                <button
                  type="button"
                  onClick={() => { setAudioBlobUrl(null); setAudioFile(null); }}
                  title="Clear recording"
                  style={{ background: 'none', border: 'none', color: '#6B7C80', cursor: 'pointer', padding: 4 }}
                >
                  <Icon.trash size={15} />
                </button>
              </div>
            )}
          </div>

          {recordError && (
            <div style={{ fontSize: '0.76rem', color: '#b91c1c', marginBottom: 10 }}>
              {recordError}
            </div>
          )}

          {/* Alternative File Upload or Speaking Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted, #6B7C80)', marginBottom: 4 }}>
                Or Upload Recorded Audio (.mp3, .wav, .m4a):
              </label>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm"
                onChange={(e) => handleFileUpload(e, 'audio')}
                style={{ fontSize: '0.78rem', width: '100%' }}
                data-testid="upload-audio-input"
              />
              {audioFile && (
                <span style={{ fontSize: '0.72rem', color: '#3D8C65', display: 'block', marginTop: 2 }}>
                  Selected: {audioFile.name}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted, #6B7C80)', marginBottom: 4 }}>
                Speaking Outline or Transcript Notes:
              </label>
              <input
                type="text"
                placeholder="e.g., Mentioned 3 points: timeline, team discussion, final decision..."
                value={speakingNotes}
                onChange={(e) => setSpeakingNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border, #E8E5DF)',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6 }}>
            <button
              type="button"
              onClick={handleSubmitSpeakingEvidence}
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--primary, #2D7A8C)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '9px 18px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: submitting ? 'wait' : 'pointer',
              }}
              data-testid="submit-speaking-sample-btn"
            >
              <Icon.upload size={15} />
              {submitting ? 'Submitting to Queue...' : 'Submit to Teacher Review Queue'}
            </button>
          </div>
        </div>
      )}

      {/* Writing Draft Card */}
      {activeTab === 'writing' && (
        <div
          style={{
            background: 'var(--bg, #FDFCF8)',
            border: '1px solid var(--border, #F6F4EE)',
            borderRadius: 10,
            padding: 16,
          }}
          data-testid="writing-evidence-card"
        >
          <div style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text, #1A2E35)' }}>
              Target Task: Short Academic Argument / Response
            </strong>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--muted, #6B7C80)' }}>
              Type your draft below or upload your text/document file for pre-class teacher review.
            </p>
          </div>

          <textarea
            rows={4}
            value={writingContent}
            onChange={(e) => setWritingContent(e.target.value)}
            placeholder="Type your response draft here (aim for clear topic sentences, varied connectives, and B2 vocabulary)..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border, #E8E5DF)',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              fontFamily: 'inherit',
              marginBottom: 10,
            }}
            data-testid="writing-evidence-textarea"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--muted, #6B7C80)', marginRight: 6 }}>
                Or attach file (.txt, .pdf, .docx):
              </label>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e, 'writing')}
                style={{ fontSize: '0.76rem' }}
              />
              {writingFile && (
                <span style={{ fontSize: '0.72rem', color: '#3D8C65', display: 'block', marginTop: 2 }}>
                  Attached: {writingFile.name}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmitWritingEvidence}
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--primary, #2D7A8C)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '9px 18px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: submitting ? 'wait' : 'pointer',
              }}
              data-testid="submit-writing-sample-btn"
            >
              <Icon.upload size={15} />
              {submitting ? 'Submitting to Queue...' : 'Submit to Teacher Review Queue'}
            </button>
          </div>
        </div>
      )}

      {/* Submitted Queue Status List */}
      {submittedHistory.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border, #F6F4EE)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted, #6B7C80)', textTransform: 'uppercase' }}>
              Your Submissions in Review Queue ({submittedHistory.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {submittedHistory.slice(0, 3).map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg, #FDFCF8)',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.type === 'speaking-sample' ? <Icon.chat size={14} style={{ color: '#E08E45' }} /> : <Icon.write size={14} style={{ color: '#8b5cf6' }} />}
                  <span style={{ fontWeight: 600, color: 'var(--text, #1A2E35)' }}>{item.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted, #6B7C80)' }}>
                    {new Date(item.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: 'var(--primary, #2D7A8C)',
                    }}
                  >
                    In Review Queue
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
