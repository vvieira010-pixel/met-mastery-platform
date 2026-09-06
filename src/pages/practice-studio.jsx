import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Icon } from '../components/shared.jsx';
import ExercisePlayer from '../components/exercises/ExercisePlayer.jsx';
import FadingBanner from '../components/FadingBanner.jsx';
import { getGrammarExercises, getTopicList, getVocabExercises, getPracticeStudioSpeakingExercises, getPracticeStudioSpeakingTopics, getWritingExercises, getPracticeStudioListeningExercises, getPracticeStudioListeningParts, getPracticeStudioListeningTopics, getReadingExercises } from '../lib/vocab-homework-bank.js';
import { createPracticeStudioSessionKey, getPracticeStudioSubmission, submitPracticeStudioSession } from '../lib/workflow.js';
import { getExamMode, getDaysUntilExam, MODE_SPRINT } from '../lib/exam-window.js';
import { LISTENING_FORMATS } from '../lib/exercise-types.js';
import { getScaffoldLevel, setScaffoldLevel, classifyRetrieval, evaluateFading, logSession } from '../lib/fading-manager.js';

const MODE_LABELS = { grammar:'Grammar Sprint', vocab:'Vocab Deep-Dive', reading:'Reading Lab', speaking:'Speaking Mirror', writing:'Writing Studio', listening:'Listening Lab' };
const MODE_SUBTITLES = { grammar:'Tenses to inversion — 21 topics', vocab:'Work to media — 11 topics', reading:'51 passages · 102 questions', speaking:'Five MET question formats · topic paths', writing:'Short answer to essay — 138 tasks', listening:'MET-style drills — 63 clips' };
const MODE_ICONS = { grammar:Icon.spark, vocab:Icon.star, reading:Icon.book, speaking:Icon.mic, writing:Icon.edit, listening:Icon.headset };

export default function PracticeStudio({ studentId, onBack: _onBack, "data-testid": testId }){
  const [selectedTopic,setSelectedTopic]=useState(null); const [selectedKind,setSelectedKind]=useState(null);
  const [selectedListeningPart,setSelectedListeningPart]=useState(null);
  const [selectedSpeakingQuestion,setSelectedSpeakingQuestion]=useState(null);
  const [selectedListeningFormat,setSelectedListeningFormat]=useState('all'); const [listeningSearch,setListeningSearch]=useState('');
  const [sessionKey,setSessionKey]=useState(0); const [exercises,setExercises]=useState([]); const [loading,setLoading]=useState(false);
  const [loadError, setLoadError] = useState(false); const [sessionComplete, setSessionComplete] = useState(null);
  const [submissionState, setSubmissionState] = useState({ status: 'idle', record: null, error: '' });
  const daysLeft=getDaysUntilExam(); const examMode=getExamMode(); const [topics,setTopics]=useState([]);
  const [scaffoldLevel,setScaffoldLevelState]=useState(4); const [fadingVerdict,setFadingVerdict]=useState(null);
  const heroRef=useRef(null);

  useGSAP(()=>{
    const hero = heroRef.current;
    if(!hero) return;
    const title = hero.querySelector('.hero-title');
    const cta = hero.querySelector('.hero-cta');
    if (title) gsap.from(title,{y:48, opacity:0, duration:0.9, ease:'power3.out'});
    if (cta) gsap.from(cta,{y:16, opacity:0, duration:0.7, delay:0.5, ease:'power2.out'});
  },{scope:heroRef});

  useEffect(()=>{ if(!selectedKind) return; (async()=>{ if(selectedKind==='listening'){ setTopics(selectedListeningPart ? await getPracticeStudioListeningTopics(selectedListeningPart) : await getPracticeStudioListeningParts()); } else if(selectedKind==='speaking'){ setTopics(await getPracticeStudioSpeakingTopics(selectedSpeakingQuestion)); } else setTopics(getTopicList(selectedKind)); })(); },[selectedKind,selectedListeningPart,selectedSpeakingQuestion]);
  useEffect(()=>{ if(!selectedKind) return; setScaffoldLevelState(getScaffoldLevel(selectedKind,selectedTopic)); },[selectedKind,selectedTopic]);
  useEffect(()=>{
    if(!selectedKind) return; let c=false; setLoading(true); setLoadError(false); setFadingVerdict(null);
    (async()=>{
      let ex=[]; try{
        if(selectedKind==='grammar'&&selectedTopic) ex=await getGrammarExercises(selectedTopic);
        else if(selectedKind==='reading'&&selectedTopic) ex=await getReadingExercises(selectedTopic);
        else if(selectedKind==='vocab'&&selectedTopic) ex=await getVocabExercises(selectedTopic);
        else if(selectedKind==='speaking'&&selectedTopic) ex=await getPracticeStudioSpeakingExercises(selectedTopic);
        else if(selectedKind==='writing'&&selectedTopic) ex=await getWritingExercises(selectedTopic);
        else if(selectedKind==='listening') { ex=await getPracticeStudioListeningExercises(selectedTopic); if(selectedListeningFormat!=='all') ex=ex.filter(i=>(i.listeningFormat||'multiple_choice')===selectedListeningFormat); }
      }catch{ if(!c) setLoadError(true); }
      if(!c){ setExercises(ex); setLoading(false); }
    })(); return()=>{c=true};
  },[selectedKind,selectedTopic,selectedListeningFormat,sessionKey]);

  const showListeningPartPicker = selectedKind==='listening' && !selectedListeningPart;
  const showSpeakingQuestionPicker = selectedKind==='speaking' && !selectedSpeakingQuestion;
  const showTopicPicker = selectedKind && (showListeningPartPicker || showSpeakingQuestionPicker || !selectedTopic);
  const selectedTopicTitle = topics.find(t=>t.id===selectedTopic)?.title||'';
  const showLanding = !selectedKind;
  const resetSubmissionState=()=>setSubmissionState({ status: 'idle', record: null, error: '' });
  const handleSelectMode=k=>{setSelectedKind(k); setSelectedTopic(null); setSelectedListeningPart(null); setSelectedSpeakingQuestion(null); setSelectedListeningFormat('all'); setListeningSearch(''); setSessionKey(v=>v+1); setFadingVerdict(null); setSessionComplete(null); resetSubmissionState();};
  const handleBackToLanding=()=>{setSelectedKind(null); setSelectedTopic(null); setSelectedListeningPart(null); setSelectedSpeakingQuestion(null); setSelectedListeningFormat('all'); setListeningSearch(''); setExercises([]); setFadingVerdict(null); setSessionComplete(null); resetSubmissionState();};
  const handleListeningPartSelect=partId=>{setSelectedListeningPart(partId); setSelectedTopic(null); setListeningSearch(''); setSessionComplete(null); resetSubmissionState();};
  const handleSpeakingQuestionSelect=questionId=>{setSelectedSpeakingQuestion(questionId); setSelectedTopic(null); setListeningSearch(''); setSessionComplete(null); resetSubmissionState();};
  const retryExerciseLoad=()=>setSessionKey(value=>value+1);
  const filteredTopics = topics.filter(topic=>{
    const query=listeningSearch.trim().toLowerCase();
    return !query || `${topic.title||''} ${topic.subtitle||''} ${topic.id||''}`.toLowerCase().includes(query);
  });
  const practiceSessionKey = selectedKind && selectedTopic ? createPracticeStudioSessionKey({ mode: selectedKind, topicId: selectedTopic, listeningPart: selectedListeningPart, speakingQuestion: selectedSpeakingQuestion }) : null;

  useEffect(()=>{
    let cancelled=false;
    if(!studentId || !practiceSessionKey || loading || loadError || exercises.length===0){
      setSubmissionState({ status: 'idle', record: null, error: '' });
      return()=>{cancelled=true};
    }
    setSubmissionState({ status: 'checking', record: null, error: '' });
    getPracticeStudioSubmission(studentId,practiceSessionKey)
      .then(record=>{ if(!cancelled) setSubmissionState(record ? { status: 'locked', record, error: '' } : { status: 'ready', record: null, error: '' }); })
      .catch(error=>{ if(!cancelled) setSubmissionState({ status: 'unavailable', record: null, error: error?.message || 'Practice Studio could not reach Supabase.' }); });
    return()=>{cancelled=true};
  },[studentId,practiceSessionKey,loading,loadError,exercises]);

  const handleSessionComplete=async summary=>{
    const {score,maxHintLevel,hintUsed,results,confidenceBefore}=summary;
    if(!studentId || !practiceSessionKey) throw new Error('Sign in before submitting this Practice Studio attempt.');
    setSubmissionState(current=>({ ...current, status:'submitting', error:'' }));
    let saved;
    try{
      saved=await submitPracticeStudioSession(studentId,{sessionKey:practiceSessionKey,mode:selectedKind,topicId:selectedTopic,topicTitle:selectedTopicTitle,listeningPart:selectedListeningPart,speakingQuestion:selectedSpeakingQuestion,score,maxHintLevel:maxHintLevel||0,hintUsed:hintUsed||false,exerciseCount:exercises.length,correctCount:results?.filter(r=>r?.correct===true).length||0,results,confidenceBefore:confidenceBefore??null,errorCategories:results?.filter(r=>r?.errorCategory).map(r=>r.errorCategory)||null});
    }catch(error){
      setSubmissionState({ status:'ready', record:null, error:error?.message||'We could not save this attempt to Supabase. Please try again.' });
      throw error;
    }
    if(saved.alreadySubmitted){
      setSubmissionState({ status:'locked', record:saved.record, error:'' });
      return;
    }
    if(score!==null){
      const quality=classifyRetrieval(maxHintLevel||0,hintUsed||false,score);
      const correctCount=results?.filter(r=>r?.correct===true).length||0;
      logSession(selectedKind,selectedTopic,{score,maxHintLevel:maxHintLevel||0,hintUsed:hintUsed||false,quality,unassisted:!hintUsed,exerciseCount:exercises.length,correctCount,totalScored:results?.filter(r=>r?.correct!==null&&r?.correct!==undefined).length||0,confidenceBefore:confidenceBefore??null});
      const result=evaluateFading(selectedKind,selectedTopic); setFadingVerdict(result);
      if(result.verdict==='reduce'||result.verdict==='restore'){ setScaffoldLevel(selectedKind,selectedTopic,result.newLevel); setScaffoldLevelState(result.newLevel); }
      const totalScored=results?.filter(r=>r?.correct!==null&&r?.correct!==undefined).length||0;
      setSessionComplete({ score, correctCount, totalScored, exerciseCount: exercises.length, verdict: result.verdict, newLevel: result.newLevel });
    }else{
      setSessionComplete({ score:null, correctCount:0, totalScored:0, exerciseCount:exercises.length, verdict:'maintain', newLevel:scaffoldLevel });
    }
    setSubmissionState({ status:'locked', record:saved.record, error:'' });
  };

  return(
    <main className="student-page" data-testid={testId}>
      {showLanding ? (
        <>
          <header ref={heroRef} className="practice-studio-hero">
            <p className="hero-kicker">PRACTICE STUDIO</p>
            <h1 className="hero-title">Practice that fits your shift, not the other way around</h1>
            <p className="hero-sub">One calm rep at a time — pick a skill, pick a topic, do one question. No catalogue fatigue.</p>
            <div className="hero-cta">
              <button onClick={()=>handleSelectMode('listening')} className="btn btn-primary">Start Today's Set</button>
              <button onClick={()=>handleSelectMode('grammar')} className="btn btn-outline">Browse Library</button>
            </div>
            {examMode===MODE_SPRINT&&<span className="badge badge-warning">{daysLeft}d to exam</span>}
          </header>

          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Six skills, zero clutter</h2>
              <span className="section-subtitle">218 Grammar · 128 Vocab · 102 Reading · 179 Speaking prompts · 138 Writing · 63 Listening clips</span>
            </div>
            <div className="practice-studio-grid">
              {Object.keys(MODE_LABELS).map(k=>{
                const I=MODE_ICONS[k];
                return(
                  <button key={k} onClick={()=>handleSelectMode(k)} className="practice-studio-card" data-tour-target={k==='grammar' ? 'practice-skill-grammar' : `practice-skill-${k}`}>
                    <span className="practice-studio-card-icon"><I size={18}/></span>
                    <span className="practice-studio-card-body">
                      <h3>{MODE_LABELS[k]}</h3>
                      <p>{MODE_SUBTITLES[k]}</p>
                    </span>
                    <span className="practice-studio-card-arrow">→</span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      ) : showTopicPicker ? (
        <div className="section">
          <header className="student-page-header">
            <button onClick={()=>{
              if(showListeningPartPicker||showSpeakingQuestionPicker) handleBackToLanding();
              else if(selectedKind==='listening') setSelectedListeningPart(null);
              else if(selectedKind==='speaking') setSelectedSpeakingQuestion(null);
              else handleBackToLanding();
            }} className="student-page-back">← {showListeningPartPicker||showSpeakingQuestionPicker ? 'All skills' : selectedKind==='listening' ? 'Listening parts' : selectedKind==='speaking' ? 'Speaking questions' : 'All skills'}</button>
            <h1 className="student-page-title">{showListeningPartPicker ? 'MET-style Listening Practice' : showSpeakingQuestionPicker ? 'MET-style Speaking Practice' : MODE_LABELS[selectedKind]}</h1>
            <span className="student-page-subtitle">{showListeningPartPicker ? 'Choose a part-style drill, then choose a topic. These are extra practice, not a timed full MET form.' : showSpeakingQuestionPicker ? 'Choose the MET Speaking question format first, then choose a topic.' : selectedKind==='listening' ? 'Choose a topic within this listening part.' : selectedKind==='speaking' ? 'Choose a topic for this speaking question.' : MODE_SUBTITLES[selectedKind]}</span>
          </header>
          <div className="practice-studio-topics">
            {topics.length>8&&(
              <div className="practice-studio-filter-bar">
                <input value={listeningSearch} onChange={e=>setListeningSearch(e.target.value)} placeholder="Search topics…" className="search-input" aria-label="Search topics"/>
                <span style={{fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{filteredTopics.length} of {topics.length} topics</span>
              </div>
            )}
            <div className="topic-grid">
              {filteredTopics.map(t=>(
                <button key={t.id} onClick={()=>{
                  if(showListeningPartPicker) handleListeningPartSelect(t.id);
                  else if(showSpeakingQuestionPicker) handleSpeakingQuestionSelect(t.id);
                  else { setSelectedTopic(t.id); setSessionComplete(null); resetSubmissionState(); }
                }} className="topic-card">
                  <h4 className="topic-card-title">{t.title}</h4>
                  {t.subtitle&&<p className="topic-card-desc">{t.subtitle}</p>}
                </button>
              ))}
            </div>
            {filteredTopics.length===0&&(
              <div className="empty-state">
                <h3 className="empty-state-title">No matching topics</h3>
                <p className="empty-state-text">Try a different search, or clear the search to see every topic.</p>
                <button onClick={()=>setListeningSearch('')} className="btn btn-primary">Clear search</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="section practice-studio-exercise-shell" data-tour-target="practice-session">
          <header className="student-page-header">
            <button onClick={()=>{setSelectedTopic(null); setSessionComplete(null); resetSubmissionState();}} className="student-page-back">← {selectedKind==='listening'||selectedKind==='speaking' ? 'Topics' : MODE_LABELS[selectedKind]}</button>
            {selectedTopicTitle&&<h1 className="student-page-title">{selectedTopicTitle}</h1>}
          </header>
          {selectedKind==='listening'&&(
            <label className="practice-studio-listening-label">
              Listening format
              <select value={selectedListeningFormat} onChange={e=>setSelectedListeningFormat(e.target.value)}>
                <option value="all">All formats</option>
                {LISTENING_FORMATS.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </label>
          )}
          {sessionComplete?(
            <section className="card practice-studio-completion">
              <h2>Submitted — this attempt is now locked</h2>
              {sessionComplete.totalScored>0&&<p className="score-line">{sessionComplete.correctCount}/{sessionComplete.totalScored} correct</p>}
              <p className="fading-note">Your final responses are saved in Supabase and available in your teacher record. This topic cannot be submitted again.</p>
              {sessionComplete.verdict==='maintain'&&<p className="fading-note">You're on track — keep practicing at this level.</p>}
              {sessionComplete.verdict==='reduce'&&<p className="fading-note">We've adjusted the difficulty to help you build confidence.</p>}
              {sessionComplete.verdict==='restore'&&<p className="fading-note">You're improving — we've moved you to harder questions.</p>}
              <div style={{display:'flex',justifyContent:'center',gap:'var(--space-3)',marginTop:'var(--space-4)'}}>
                 <button onClick={()=>{setSelectedTopic(null); setSessionComplete(null); resetSubmissionState();}} className="btn btn-primary">Choose another topic</button>
                <button onClick={handleBackToLanding} className="btn btn-outline">All skills</button>
              </div>
            </section>
           ) : (
           <>
            {loading ? (
             <section className="card" style={{textAlign:'center',padding:'var(--space-8) var(--space-6)'}} aria-live="polite">
              <p style={{fontSize:'var(--text-sm)',fontWeight:600}}>Loading your exercises…</p>
              <p style={{marginTop:'var(--space-2)',fontSize:'var(--text-sm)',color:'var(--text-muted)'}}>Preparing this practice set.</p>
            </section>
          ) : loadError ? (
            <section className="card" style={{textAlign:'center',padding:'var(--space-8) var(--space-6)'}} title="Exercises unavailable" aria-live="polite">
              <h2 style={{fontSize:'var(--text-lg)',fontWeight:600}}>Exercises unavailable</h2>
              <p style={{marginTop:'var(--space-2)',fontSize:'var(--text-sm)',color:'var(--text-muted)'}}>We could not load this practice set. Please try again.</p>
              <div style={{display:'flex',justifyContent:'center',gap:'var(--space-3)',marginTop:'var(--space-5)'}}>
                <button onClick={retryExerciseLoad} className="btn btn-primary">Try again</button>
                <button onClick={()=>setSelectedTopic(null)} className="btn btn-outline">Choose another topic</button>
              </div>
            </section>
          ) : exercises.length === 0 ? (
            <section className="card" style={{textAlign:'center',padding:'var(--space-8) var(--space-6)'}} title="No exercises available">
              <h2 style={{fontSize:'var(--text-lg)',fontWeight:600}}>No exercises available</h2>
              <p style={{marginTop:'var(--space-2)',fontSize:'var(--text-sm)',color:'var(--text-muted)'}}>There are no exercises in this set yet. Choose another topic or skill.</p>
              <div style={{display:'flex',justifyContent:'center',gap:'var(--space-3)',marginTop:'var(--space-5)'}}>
                <button onClick={()=>setSelectedTopic(null)} className="btn btn-primary">Choose another topic</button>
                <button onClick={handleBackToLanding} className="btn btn-outline">All skills</button>
              </div>
            </section>
          ) : submissionState.status==='checking' ? (
            <section className="card" style={{textAlign:'center',padding:'var(--space-8) var(--space-6)'}} aria-live="polite">
              <h2 style={{fontSize:'var(--text-lg)',fontWeight:600}}>Checking your submitted work…</h2>
              <p style={{marginTop:'var(--space-2)',fontSize:'var(--text-sm)',color:'var(--text-muted)'}}>We check Supabase before opening the set, so each topic can be submitted only once.</p>
            </section>
          ) : submissionState.status==='unavailable' ? (
            <section className="card" style={{textAlign:'center',padding:'var(--space-8) var(--space-6)'}} aria-live="assertive" data-testid="practice-studio-supabase-unavailable">
              <h2 style={{fontSize:'var(--text-lg)',fontWeight:600}}>Supabase submission is unavailable</h2>
              <p style={{marginTop:'var(--space-2)',fontSize:'var(--text-sm)',color:'var(--text-muted)'}}>{submissionState.error} Your final work is not saved in this browser; sign in again before starting this set.</p>
              <div style={{display:'flex',justifyContent:'center',gap:'var(--space-3)',marginTop:'var(--space-5)'}}>
                <button onClick={()=>setSelectedTopic(null)} className="btn btn-primary">Choose another topic</button>
                <button onClick={handleBackToLanding} className="btn btn-outline">All skills</button>
              </div>
            </section>
          ) : submissionState.status==='locked' ? (
            <section className="card practice-studio-completion" data-testid="practice-studio-submission-locked">
              <h2>This topic has already been submitted</h2>
              <p className="fading-note">Submitted {submissionState.record?.submittedAt ? new Date(submissionState.record.submittedAt).toLocaleString() : 'previously'}. It is locked to keep one final attempt in your teacher record.</p>
              <div style={{display:'flex',justifyContent:'center',gap:'var(--space-3)',marginTop:'var(--space-4)'}}>
                <button onClick={()=>{setSelectedTopic(null); resetSubmissionState();}} className="btn btn-primary">Choose another topic</button>
                <button onClick={handleBackToLanding} className="btn btn-outline">All skills</button>
              </div>
            </section>
          ) : (
            <>
              <FadingBanner level={scaffoldLevel} verdict={fadingVerdict?.verdict} reason={fadingVerdict?.reason} />
              {submissionState.error&&<p role="alert" style={{margin:'0 0 var(--space-3)',color:'var(--ex-wrong-text)',fontSize:'var(--text-sm)'}}>{submissionState.error}</p>}
              <ExercisePlayer exercises={exercises} onSessionComplete={handleSessionComplete} scaffoldLevel={scaffoldLevel} requireFinalSubmission finalSubmissionLabel="Submit this practice once" />
            </>
          )}
          </>
          )}
        </div>
      )}
    </main>
  );
}
