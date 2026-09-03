import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Icon } from '../components/shared.jsx';
import ExercisePlayer from '../components/exercises/ExercisePlayer.jsx';
import FadingBanner from '../components/FadingBanner.jsx';
import { getGrammarExercises, getTopicList, getVocabExercises, getSpeakingExercises, getWritingExercises, getListeningExercises, getListeningAudioGroups, getReadingExercises } from '../lib/vocab-homework-bank.js';
import { savePracticeSession } from '../lib/workflow.js';
import { getExamMode, getDaysUntilExam, MODE_SPRINT } from '../lib/exam-window.js';
import { LISTENING_FORMATS } from '../lib/exercise-types.js';
import { getScaffoldLevel, setScaffoldLevel, classifyRetrieval, evaluateFading, logSession } from '../lib/fading-manager.js';
gsap.registerPlugin(ScrollTrigger);

const MODE_LABELS = { grammar:'Grammar Sprint', vocab:'Vocab Deep-Dive', reading:'Reading Lab', speaking:'Speaking Mirror', writing:'Writing Studio', listening:'Listening Lab' };
const MODE_SUBTITLES = { grammar:'Tenses to inversion — 21 topics', vocab:'Work to media — 11 topics', reading:'Two passages — 5 Q each', speaking:'Picture to persuasion — 11 topics', writing:'Short answer to essay — 11 topics', listening:'26 MET 26 + B2 76–100 — 86 groups' };
const MODE_ICONS = { grammar:Icon.edit, vocab:Icon.star, reading:Icon.book, speaking:Icon.mic, writing:Icon.edit, listening:Icon.headset };
export default function PracticeStudio({ studentId, onBack, "data-testid": testId }){
  const [selectedTopic,setSelectedTopic]=useState(null); const [selectedKind,setSelectedKind]=useState(null);
  const [selectedListeningFormat,setSelectedListeningFormat]=useState('all'); const [listeningSearch,setListeningSearch]=useState('');
  const [sessionKey,setSessionKey]=useState(0); const [exercises,setExercises]=useState([]); const [loading,setLoading]=useState(false);
  const [loadError, setLoadError] = useState(false);
  const daysLeft=getDaysUntilExam(); const examMode=getExamMode(); const [topics,setTopics]=useState([]);
  const [scaffoldLevel,setScaffoldLevelState]=useState(4); const [fadingVerdict,setFadingVerdict]=useState(null);
  const heroRef=useRef(null); const pinRef=useRef(null); const galleryRef=useRef(null); const marqueeRef=useRef(null);

  useGSAP(()=>{
    if(!heroRef.current) return;
    gsap.from('.hero-title span',{y:48, opacity:0, duration:0.9, stagger:0.06, ease:'power3.out'});
    gsap.from('.hero-cta',{y:16, opacity:0, duration:0.7, delay:0.5, ease:'power2.out'});
    if(pinRef.current && galleryRef.current){
      ScrollTrigger.create({ trigger: pinRef.current, start:'top top', end:'bottom bottom', pin:'.pin-left', pinSpacing:false });
      gsap.utils.toArray('.gallery-card').forEach(card=>{
        gsap.fromTo(card,{scale:0.88, opacity:0.7},{scale:1, opacity:1, scrollTrigger:{trigger:card, start:'top 85%', end:'top 50%', scrub:1}});
      });
    }
    if(marqueeRef.current){
      gsap.to(marqueeRef.current,{xPercent:-50, duration:18, ease:'none', repeat:-1});
    }
  },{scope:heroRef});

  useEffect(()=>{ if(!selectedKind) return; (async()=>{ if(selectedKind==='listening'){ setTopics(await getListeningAudioGroups()); } else setTopics(getTopicList(selectedKind)); })(); },[selectedKind]);
  useEffect(()=>{ if(!selectedKind) return; setScaffoldLevelState(getScaffoldLevel(selectedKind,selectedTopic)); },[selectedKind,selectedTopic]);
  useEffect(()=>{
    if(!selectedKind) return; let c=false; setLoading(true); setLoadError(false); setFadingVerdict(null);
    (async()=>{
      let ex=[]; try{
        if(selectedKind==='grammar'&&selectedTopic) ex=await getGrammarExercises(selectedTopic);
        else if(selectedKind==='reading'&&selectedTopic) ex=await getReadingExercises(selectedTopic);
        else if(selectedKind==='vocab'&&selectedTopic) ex=await getVocabExercises(selectedTopic);
        else if(selectedKind==='speaking'&&selectedTopic) ex=await getSpeakingExercises(selectedTopic);
        else if(selectedKind==='writing'&&selectedTopic) ex=await getWritingExercises(selectedTopic);
        else if(selectedKind==='listening') { ex=await getListeningExercises(selectedTopic); if(selectedListeningFormat!=='all') ex=ex.filter(i=>(i.listeningFormat||'multiple_choice')===selectedListeningFormat); }
      }catch{ if(!c) setLoadError(true); }
      if(!c){ setExercises(ex); setLoading(false); }
    })(); return()=>{c=true};
  },[selectedKind,selectedTopic,selectedListeningFormat,sessionKey]);

  const showTopicPicker = selectedKind && !selectedTopic;
  const selectedTopicTitle = topics.find(t=>t.id===selectedTopic)?.title||'';
  const showLanding = !selectedKind;
  const handleSelectMode=k=>{setSelectedKind(k); setSelectedTopic(null); setSelectedListeningFormat('all'); setListeningSearch(''); setSessionKey(v=>v+1); setFadingVerdict(null);};
  const handleBackToLanding=()=>{setSelectedKind(null); setSelectedTopic(null); setSelectedListeningFormat('all'); setListeningSearch(''); setExercises([]); setFadingVerdict(null);};
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
    }
  };

  return(
    <main className="overflow-x-hidden w-full max-w-full bg-[#FCFCF9] text-[#0a0a0a]" style={{fontFamily:'"Cabinet Grotesk", system-ui, -apple-system, sans-serif'}} data-testid={testId}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@500;700;800&display=swap');`}</style>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-2 py-2 rounded-full bg-white/80 backdrop-blur-2xl border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <button onClick={onBack} className="px-4 py-2 rounded-full bg-[#0a0a0a] text-white text-sm font-medium tracking-tight">Home</button>
        <span className="hidden sm:block text-xs font-medium tracking-wide text-black/50 px-3">PRACTICE STUDIO — 6 SKILLS • 86 LISTENING GROUPS</span>
        {examMode===MODE_SPRINT&&<span className="px-3 py-1.5 rounded-full bg-[#0a0a0a] text-white text-xs font-bold">{daysLeft}d to exam</span>}
      </nav>

      {showLanding ? (
        <>
          <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center px-6 py-32 md:py-48 overflow-hidden bg-[#0a0a0a]">
            <div className="absolute inset-0 bg-cover bg-center opacity-90 grayscale contrast-125" style={{backgroundImage:'url(https://picsum.photos/seed/ward-1/1920/1080)'}}/>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_85%)]" />
            <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=0 0 256 256 xmlns=%3Csvg%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")'}}/>
            <div className="relative w-full max-w-6xl mx-auto text-center">
              <h1 className="hero-title text-white font-black tracking-[-0.04em] leading-[0.9] text-[clamp(3rem,5vw,5.5rem)]">
                <span className="inline-block">Practice that</span>{' '}
                <span className="inline-block align-middle w-24 h-10 md:w-36 md:h-14 rounded-full bg-cover bg-center mx-2 overflow-hidden border border-white/20" style={{backgroundImage:'url(https://picsum.photos/seed/nurse-2/400/200)'}} aria-hidden="true"/>
                <span className="inline-block">fits your</span><br/>
                <span className="inline-block font-light tracking-[-0.03em] text-white/90">shift, not the</span>{' '}
                <span className="inline-block underline decoration-white/30 underline-offset-8">other way</span>
              </h1>
              <p className="mt-8 max-w-2xl mx-auto text-white/70 text-lg leading-relaxed">One calm rep at a time — pick a skill, pick a topic, do one question. No catalogue fatigue.</p>
              <div className="hero-cta mt-10 flex flex-wrap justify-center gap-4">
                <button onClick={()=>handleSelectMode('listening')} className="px-8 py-4 rounded-full bg-white text-[#0a0a0a] font-semibold text-sm tracking-tight shadow-xl">Start Today’s Set</button>
                <button onClick={()=>handleSelectMode('grammar')} className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-medium text-sm backdrop-blur">Browse Library</button>
              </div>
            </div>
          </section>

          <section className="px-6 py-32 md:py-48 max-w-[1280px] mx-auto">
            <div className="flex items-end justify-between mb-10">
              <h2 className="text-4xl font-bold tracking-tight">Six skills, zero clutter</h2>
              <span className="hidden md:block text-sm text-black/40">218 Grammar • 128 Vocab • 102 Reading • 254 Speaking • 138 Writing • 86 Listening</span>
            </div>
            <div className="grid grid-cols-12 auto-rows-[minmax(280px,auto)] gap-4 grid-flow-dense">
              {[
                {k:'listening', span:'col-span-12 md:col-span-7 row-span-2', img:'seed/headset'},
                {k:'grammar', span:'col-span-12 md:col-span-5', img:'seed/grammar'},
                {k:'reading', span:'col-span-12 md:col-span-5', img:'seed/reading'},
                {k:'vocab', span:'col-span-12 md:col-span-4', img:'seed/vocab'},
                {k:'speaking', span:'col-span-12 md:col-span-8', img:'seed/speaking'},
              ].map(card=>{
                const I=MODE_ICONS[card.k]; return(
                <button key={card.k} onClick={()=>handleSelectMode(card.k)} className={`${card.span} group relative overflow-hidden rounded-[28px] bg-white border border-black/5 text-left p-8 flex flex-col justify-between hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-700`}>
                  <div className="absolute inset-0 bg-cover bg-center opacity-[0.06] group-hover:opacity-[0.10] transition-opacity duration-700" style={{backgroundImage:`url(https://picsum.photos/seed/${card.img}/800/600)`}}/>
                  <div className="relative">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0a0a0a] text-white"><I size={18} /></span>
                    <h3 className="mt-6 text-2xl font-bold tracking-tight">{MODE_LABELS[card.k]}</h3>
                    <p className="mt-2 text-sm text-black/50 leading-relaxed max-w-[32ch]">{MODE_SUBTITLES[card.k]}</p>
                  </div>
                  <span className="relative mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-widest">EXPLORE <span className="w-6 h-6 rounded-full bg-black text-white grid place-items-center group-hover:translate-x-1 transition-transform">→</span></span>
                </button>);
              })}
              <div className="col-span-12 md:col-span-12 flex items-center justify-center py-4">
                <button onClick={()=>handleSelectMode('writing')} className="px-6 py-3 rounded-full border border-black/10 text-sm font-medium hover:bg-black hover:text-white transition-colors">Writing Studio — 11 topics →</button>
              </div>
            </div>
          </section>

          <section ref={pinRef} className="px-6 py-32 md:py-48 max-w-[1280px] mx-auto grid grid-cols-12 gap-8">
            <div className="pin-left col-span-12 md:col-span-5 md:sticky md:top-32 h-fit">
              <p className="text-xs tracking-[0.2em] text-black/40 mb-4">DESIRE — ONE REP AT A TIME</p>
              <h2 className="text-4xl font-bold leading-[0.9] tracking-tight">One question.<br/>Full focus.<br/><span className="font-light text-black/40">No catalogue.</span></h2>
              <p className="mt-6 text-black/60 leading-relaxed max-w-[36ch]">We pin the promise while topics scroll. You choose once, then do one calm rep — the only way a shift nurse builds streaks.</p>
            </div>
            <div ref={galleryRef} className="col-span-12 md:col-span-7 space-y-6">
              {['MET 26 — Conversation 14','B2 89 — Cautious Forecast','Inversion — Never, Seldom','Study Abroad & Work — Passage A'].map((t,i)=>(
                <div key={i} className="gallery-card group relative overflow-hidden rounded-[24px] bg-white border border-black/5 p-6 flex gap-6 items-center">
                  <div className="w-28 h-28 rounded-2xl bg-cover bg-center shrink-0 overflow-hidden" style={{backgroundImage:`url(https://picsum.photos/seed/card-${i}/300/300)`}}><div className="w-full h-full bg-black/0 group-hover:bg-black/5 transition-colors"/></div>
                  <div><p className="text-xs tracking-widest text-black/30">TOPIC 0{i+1}</p><h4 className="text-lg font-semibold tracking-tight mt-1">{t}</h4><p className="text-sm text-black/50 mt-1">B2 · 3 Q · 2 min</p></div>
                </div>
              ))}
            </div>
          </section>

          <div className="border-y border-black/5 bg-white overflow-hidden py-6">
            <div ref={marqueeRef} className="flex gap-12 whitespace-nowrap will-change-transform" style={{width:'max-content'}}>
              {Array(8).fill(0).map((_,i)=>(<span key={i} className="text-3xl font-black tracking-tighter opacity-10">MET MASTERY — CLINICAL CONSULT ROOM —</span>))}
            </div>
          </div>

          <section className="px-6 py-32 md:py-48 bg-[#0a0a0a] text-white text-center">
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter leading-none">Ready for<br/>one calm rep?</h2>
            <div className="mt-10 flex justify-center gap-4">
              <button onClick={()=>handleSelectMode('listening')} className="px-10 py-5 rounded-full bg-white text-[#0a0a0a] font-bold">Start Listening Lab</button>
              <button onClick={onBack} className="px-8 py-5 rounded-full border border-white/15 text-white/80">Back to Home</button>
            </div>
          </section>
        </>
      ) : showTopicPicker ? (
        <div className="px-6 py-12 max-w-[1100px] mx-auto">
          <button onClick={handleBackToLanding} className="text-sm text-black/50 hover:text-black mb-6">← All skills</button>
          <div className="flex flex-wrap gap-3 mb-8">
            <input value={listeningSearch} onChange={e=>setListeningSearch(e.target.value)} placeholder="Search topics…" className="flex-1 min-w-[260px] max-w-[420px] px-4 py-3 rounded-full border border-black/10 bg-white text-sm" aria-label="Search topics"/>
            <span className="text-xs text-black/40 self-center">{filteredTopics.length} of {topics.length} topics</span>
          </div>
          <div className="grid grid-cols-12 gap-4 auto-rows-[minmax(140px,auto)] grid-flow-dense">
            {filteredTopics.map(t=>(
              <button key={t.id} onClick={()=>setSelectedTopic(t.id)} className="col-span-12 md:col-span-4 lg:col-span-3 p-6 rounded-2xl bg-white border border-black/5 text-left hover:shadow-xl transition-all group overflow-hidden">
                <h4 className="font-semibold tracking-tight group-hover:translate-x-1 transition-transform">{t.title}</h4>
                {t.subtitle&&<p className="text-xs text-black/50 mt-1 line-clamp-2">{t.subtitle}</p>}
              </button>
            ))}
          </div>
          {filteredTopics.length===0&&<div className="rounded-2xl border border-dashed border-black/15 bg-white px-6 py-12 text-center"><h3 className="font-semibold">No matching topics</h3><p className="mt-2 text-sm text-black/50">Try a different search, or clear the search to see every topic.</p><button onClick={()=>setListeningSearch('')} className="mt-5 rounded-full bg-black px-4 py-2 text-sm font-medium text-white">Clear search</button></div>}
        </div>
      ) : (
        <div className="px-6 py-12 max-w-[720px] mx-auto">
          {selectedTopicTitle&&<p className="text-xs tracking-widest text-black/30 mb-3">{selectedTopicTitle}</p>}
          {selectedKind==='listening'&&<label className="flex items-center gap-3 mb-4 text-sm text-black/50">Listening format<select className="px-3 py-2 rounded-full border border-black/10 bg-white text-sm" value={selectedListeningFormat} onChange={e=>setSelectedListeningFormat(e.target.value)}><option value="all">All formats</option>{LISTENING_FORMATS.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}</select></label>}
          <FadingBanner level={scaffoldLevel} verdict={fadingVerdict?.verdict} reason={fadingVerdict?.reason} />
          {loading ? (
            <section className="rounded-2xl border border-black/10 bg-white px-6 py-12 text-center" aria-live="polite">
              <p className="text-sm font-semibold">Loading your exercises…</p>
              <p className="mt-2 text-sm text-black/50">Preparing this practice set.</p>
            </section>
          ) : loadError ? (
            <section className="rounded-2xl border border-black/10 bg-white px-6 py-12 text-center" title="Exercises unavailable" aria-live="polite">
              <h2 className="text-lg font-semibold">Exercises unavailable</h2>
              <p className="mt-2 text-sm text-black/55">We could not load this practice set. Please try again.</p>
              <div className="mt-6 flex justify-center gap-3"><button onClick={retryExerciseLoad} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">Try again</button><button onClick={()=>setSelectedTopic(null)} className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium">Choose another topic</button></div>
            </section>
          ) : exercises.length === 0 ? (
            <section className="rounded-2xl border border-black/10 bg-white px-6 py-12 text-center" title="No exercises available">
              <h2 className="text-lg font-semibold">No exercises available</h2>
              <p className="mt-2 text-sm text-black/55">There are no exercises in this set yet. Choose another topic or skill.</p>
              <div className="mt-6 flex justify-center gap-3"><button onClick={()=>setSelectedTopic(null)} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">Choose another topic</button><button onClick={handleBackToLanding} className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium">All skills</button></div>
            </section>
          ) : (
            <ExercisePlayer exercises={exercises} onSessionComplete={handleSessionComplete} scaffoldLevel={scaffoldLevel} />
          )}
        </div>
      )}
    </main>
  );
}
