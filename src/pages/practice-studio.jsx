import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Icon } from '../components/shared.jsx';
import ExercisePlayer from '../components/exercises/ExercisePlayer.jsx';
import FadingBanner from '../components/FadingBanner.jsx';
import { getGrammarExercises, getTopicList, getVocabExercises, getPracticeStudioSpeakingExercises, getPracticeStudioSpeakingTopics, getWritingExercises, getPracticeStudioListeningExercises, getPracticeStudioListeningGroups, getReadingExercises } from '../lib/vocab-homework-bank.js';
import { savePracticeSession } from '../lib/workflow.js';
import { getExamMode, getDaysUntilExam, MODE_SPRINT } from '../lib/exam-window.js';
import { LISTENING_FORMATS } from '../lib/exercise-types.js';
import { getScaffoldLevel, setScaffoldLevel, classifyRetrieval, evaluateFading, logSession } from '../lib/fading-manager.js';

const MODE_LABELS = { grammar:'Grammar Sprint', vocab:'Vocab Deep-Dive', reading:'Reading Lab', speaking:'Speaking Mirror', writing:'Writing Studio', listening:'Listening Lab' };
const MODE_SUBTITLES = { grammar:'Tenses to inversion — 21 topics', vocab:'Work to media — 11 topics', reading:'51 passages · 102 questions', speaking:'Picture to persuasion — 11 topics', writing:'Short answer to essay — 138 tasks', listening:'Practice Studio set — 63 clips' };
const MODE_ICONS = { grammar:Icon.spark, vocab:Icon.star, reading:Icon.book, speaking:Icon.mic, writing:Icon.edit, listening:Icon.headset };

export default function PracticeStudio({ studentId, onBack, "data-testid": testId }){
  const [selectedTopic,setSelectedTopic]=useState(null); const [selectedKind,setSelectedKind]=useState(null);
  const [selectedListeningFormat,setSelectedListeningFormat]=useState('all'); const [listeningSearch,setListeningSearch]=useState('');
  const [sessionKey,setSessionKey]=useState(0); const [exercises,setExercises]=useState([]); const [loading,setLoading]=useState(false);
  const [loadError, setLoadError] = useState(false); const [sessionComplete, setSessionComplete] = useState(null);
  const daysLeft=getDaysUntilExam(); const examMode=getExamMode(); const [topics,setTopics]=useState([]);
  const [scaffoldLevel,setScaffoldLevelState]=useState(4); const [fadingVerdict,setFadingVerdict]=useState(null);
  const heroRef=useRef(null);

  useGSAP(()=>{
    if(!heroRef.current) return;
    gsap.from('.hero-title span',{y:48, opacity:0, duration:0.9, stagger:0.06, ease:'power3.out'});
    gsap.from('.hero-cta',{y:16, opacity:0, duration:0.7, delay:0.5, ease:'power2.out'});
  },{scope:heroRef});

  useEffect(()=>{ if(!selectedKind) return; (async()=>{ if(selectedKind==='listening'){ setTopics(await getPracticeStudioListeningGroups()); } else if(selectedKind==='speaking'){ setTopics([...getPracticeStudioSpeakingTopics(), ...getTopicList(selectedKind)]); } else setTopics(getTopicList(selectedKind)); })(); },[selectedKind]);
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

  const showTopicPicker = selectedKind && !selectedTopic;
  const selectedTopicTitle = topics.find(t=>t.id===selectedTopic)?.title||'';
  const showLanding = !selectedKind;
  const handleSelectMode=k=>{setSelectedKind(k); setSelectedTopic(null); setSelectedListeningFormat('all'); setListeningSearch(''); setSessionKey(v=>v+1); setFadingVerdict(null); setSessionComplete(null);};
  const handleBackToLanding=()=>{setSelectedKind(null); setSelectedTopic(null); setSelectedListeningFormat('all'); setListeningSearch(''); setExercises([]); setFadingVerdict(null); setSessionComplete(null);};
  const retryExerciseLoad=()=>setSessionKey(value=>value+1);
  const filteredTopics = topics.filter(topic=>{
    const query=listeningSearch.trim().toLowerCase();
    return !query || `${topic.title||''} ${topic.subtitle||''} ${topic.id||''}`.toLowerCase().includes(query);
  });
  const handleSessionComplete=summary=>{
    const {score,maxHintLevel,hintUsed,results,confidenceBefore}=summary;
    if(score!==null&&studentId){
      const quality=classifyRetrieval(maxHintLevel||0,hintUsed||false,score);
      const correctCount=results?.filter(r=>r?.correct===true).length||0;
      logSession(selectedKind,selectedTopic,{score,maxHintLevel:maxHintLevel||0,hintUsed:hintUsed||false,quality,unassisted:!hintUsed,exerciseCount:exercises.length,correctCount,totalScored:results?.filter(r=>r?.correct!==null&&r?.correct!==undefined).length||0,confidenceBefore:confidenceBefore??null});
      savePracticeSession(studentId,{mode:selectedKind,topicId:selectedTopic,topicTitle:selectedTopicTitle,score,maxHintLevel:maxHintLevel||0,hintUsed:hintUsed||false,quality,exerciseCount:exercises.length,correctCount,results,confidenceBefore:confidenceBefore??null,errorCategories:results?.filter(r=>r?.errorCategory).map(r=>r.errorCategory)||null});
      const result=evaluateFading(selectedKind,selectedTopic); setFadingVerdict(result);
      if(result.verdict==='reduce'||result.verdict==='restore'){ setScaffoldLevel(selectedKind,selectedTopic,result.newLevel); setScaffoldLevelState(result.newLevel); }
      const totalScored=results?.filter(r=>r?.correct!==null&&r?.correct!==undefined).length||0;
      setSessionComplete({ score, correctCount, totalScored, exerciseCount: exercises.length, verdict: result.verdict, newLevel: result.newLevel });
    }
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
              <span className="section-subtitle">218 Grammar · 128 Vocab · 102 Reading · 254 Speaking · 138 Writing · 63 Listening</span>
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
            <button onClick={handleBackToLanding} className="student-page-back">← All skills</button>
            <h1 className="student-page-title">{MODE_LABELS[selectedKind]}</h1>
            <span className="student-page-subtitle">{MODE_SUBTITLES[selectedKind]}</span>
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
                <button key={t.id} onClick={()=>setSelectedTopic(t.id)} className="topic-card">
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
            <button onClick={()=>setSelectedTopic(null)} className="student-page-back">← {MODE_LABELS[selectedKind]}</button>
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
              <h2>Nice work — session complete</h2>
              <p className="score-line">{sessionComplete.correctCount}/{sessionComplete.totalScored} correct</p>
              {sessionComplete.verdict==='maintain'&&<p className="fading-note">You're on track — keep practicing at this level.</p>}
              {sessionComplete.verdict==='reduce'&&<p className="fading-note">We've adjusted the difficulty to help you build confidence.</p>}
              {sessionComplete.verdict==='restore'&&<p className="fading-note">You're improving — we've moved you to harder questions.</p>}
              <div style={{display:'flex',justifyContent:'center',gap:'var(--space-3)',marginTop:'var(--space-4)'}}>
                <button onClick={()=>{setSelectedTopic(null); setSessionComplete(null);}} className="btn btn-primary">Choose another topic</button>
                <button onClick={handleBackToLanding} className="btn btn-outline">All skills</button>
              </div>
            </section>
           ) : (
           <>
           <FadingBanner level={scaffoldLevel} verdict={fadingVerdict?.verdict} reason={fadingVerdict?.reason} />
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
          ) : (
            <ExercisePlayer exercises={exercises} onSessionComplete={handleSessionComplete} scaffoldLevel={scaffoldLevel} />
          )}
          </>
          )}
        </div>
      )}
    </main>
  );
}
