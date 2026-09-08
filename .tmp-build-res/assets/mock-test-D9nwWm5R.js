import{j as e,r as i}from"./vendor-react-_P-FXV2G.js";import{I,af as Ae,ag as Ee,ah as Re,B as Ce}from"./index-muOe086A.js";import{B as L}from"./Button-DdDnEr67.js";import{C as de}from"./Card-wrqTb42I.js";import{S as me}from"./SectionHeader-R_wqrk2J.js";import{A as Ie,m as F}from"./vendor-motion-CzNB6gBA.js";import{s as X,a as Z,b as Pe,c as ze,M as _e,S as Me,L as Le,d as $e,e as Oe,R as De,f as Be,g as Ue}from"./speaking-DK2e2ePj.js";import{R as qe,a as Fe,b as Ge,S as U,L as We,c as Ke,d as Je,M as be,g as se,C as Ye,e as Ve}from"./index-aYO6x_d-.js";import{c as we}from"./callAI-zULIfRJA.js";import{S as He,W as Qe}from"./writing-CvfQg0nO.js";class ae{_id;_domainEvents=[];constructor(t){this._id=t}get id(){return this._id}equals(t){return t==null||t==null?!1:this===t?!0:t instanceof ae?this._id===t._id:!1}addDomainEvent(t){this._domainEvents.push(t)}getUncommittedEvents(){return this._domainEvents}markEventsAsCommitted(){this._domainEvents=[]}}class Xe extends ae{_version=0;get version(){return this._version}incrementVersion(){this._version++}applyEvent(t){this.addDomainEvent(t),this.incrementVersion()}}class re{props;constructor(t){this.props=Object.freeze(t)}equals(t){return t==null||t==null?!1:this===t?!0:JSON.stringify(this.props)===JSON.stringify(t.props)}get value(){return this.props.value}}class G extends re{constructor(t){super({value:t})}static create(){return new G(crypto.randomUUID())}static fromString(t){if(!t||t.length===0)throw new Error("MockTestId cannot be empty");return new G(t)}get value(){return this.props.value}}class B extends re{constructor(t){super({value:t})}static notStarted(){return new B("not_started")}static inProgress(){return new B("in_progress")}static completed(){return new B("completed")}get value(){return this.props.value}isNotStarted(){return this.value==="not_started"}isInProgress(){return this.value==="in_progress"}isCompleted(){return this.value==="completed"}}class Ze{constructor(t,r,s){this.mockTestId=t,this.studentId=r,this.testType=s,this.timestamp=new Date}timestamp}class et{constructor(t,r,s,n){this.mockTestId=t,this.studentId=r,this.scores=s,this.cefr=n,this.timestamp=new Date}timestamp}class V extends Xe{props;constructor(t){super(t.id),this.props=t}static create(t,r){return new V({id:G.create(),studentId:t,type:r,status:B.notStarted(),createdAt:new Date,updatedAt:new Date})}static reconstitute(t){return new V(t)}start(){if(this.props.status.equals(B.completed()))throw new Error("Cannot start completed mock test");this.props.status=B.inProgress(),this.props.startedAt=new Date,this.props.updatedAt=new Date,this.applyEvent(new Ze(this.id.value,this.props.studentId,this.props.type.value))}submit(t,r,s){if(!this.props.startedAt)throw new Error("Cannot submit unstarted mock test");this.props.answers=t,this.props.scores=r,this.props.cefr=s,this.props.status=B.completed(),this.props.completedAt=new Date,this.props.updatedAt=new Date,this.applyEvent(new et(this.id.value,this.props.studentId,r,s))}get studentId(){return this.props.studentId}get type(){return this.props.type}get status(){return this.props.status}get answers(){return this.props.answers}get scores(){return this.props.scores}get cefr(){return this.props.cefr}get startedAt(){return this.props.startedAt}get completedAt(){return this.props.completedAt}get createdAt(){return this.props.createdAt}get updatedAt(){return this.props.updatedAt}}class q extends re{constructor(t){super({value:t})}static mockTest1(){return new q("mock-test-1")}static mockTest2(){return new q("mock-test-2")}static mockTest3(){return new q("mock-test-3")}get value(){return this.props.value}isMockTest1(){return this.value==="mock-test-1"}isMockTest2(){return this.value==="mock-test-2"}isMockTest3(){return this.value==="mock-test-3"}}class tt{constructor(t){this.mockTestRepository=t}async execute(t,r){if(!t)throw new Error("Student ID is required");let s;switch(r){case"mock-test-1":s=q.mockTest1();break;case"mock-test-2":s=q.mockTest2();break;case"mock-test-3":s=q.mockTest3();break;default:throw new Error("Invalid mock test type")}const n=V.create(t,s);return n.start(),await this.mockTestRepository.save(n),n}}class st{constructor(t,r){this.mockTestRepository=t,this.scoringService=r}async execute(t,r){if(!t)throw new Error("Mock test ID is required");if(!r)throw new Error("Answers are required");const s=G.fromString(t),n=await this.mockTestRepository.findById(s);if(!n)throw new Error(`Mock test with ID ${t} not found`);const l=this.scoringService.calculateScores(r),c=this.scoringService.calculateCefr(l);return n.submit(r,l,c),await this.mockTestRepository.save(n),n}}class at{store=new Map;async save(t){this.store.set(t.id.value,t)}async findById(t){return this.store.get(t.value)||null}async findByStudentId(t){const r=[];for(const s of this.store.values())s.studentId===t&&r.push(s);return r}async findCompletedTestsByStudentId(t){const r=[];for(const s of this.store.values())s.studentId===t&&s.status.isCompleted()&&r.push(s);return r}async delete(t){this.store.delete(t.value)}}const ee=[{min:0,max:39,level:"A2",label:"A2 (Elementary)",description:"Can understand basic phrases and familiar topics. Needs foundational work to reach B1."},{min:40,max:52,level:"B1",label:"B1 (Intermediate)",description:"Can understand the main points of clear standard input on familiar matters. Ready to push toward B2."},{min:53,max:63,level:"B2",label:"B2 (Upper-Intermediate)",description:"Can understand the main ideas of complex text on both concrete and abstract topics. Strong foundation for C1."},{min:64,max:80,level:"C1",label:"C1 (Advanced)",description:"Can understand a wide range of demanding, longer texts. Excellent progress toward mastery."}];function ye(a){const t=Math.max(0,Math.min(100,a));return Math.round(t/100*80)}function W(a,t){if(t<=0)return 0;const r=a/t*100;return ye(r)}function rt(a){const t=Math.max(0,Math.min(80,a));return ee.find(s=>t>=s.min&&t<=s.max)?.level??"A2"}function nt(a){const t=Math.max(0,Math.min(80,a)),r=ee.find(s=>t>=s.min&&t<=s.max)??ee[0];return{level:r.level,label:r.label,description:r.description}}function te(a){const t=a.listening?W(a.listening.total,a.listening.max):void 0,r=a.reading?W(a.reading.total,a.reading.max):void 0,s=a.writing?W(a.writing.total,a.writing.max):void 0,n=a.speaking?W(a.speaking.total,a.speaking.max):void 0,l=[t,r,s,n].filter(o=>o!==void 0),c=l.length>0?Math.round(l.reduce((o,p)=>o+p,0)/l.length):0,{level:b,label:h,description:x}=nt(c);return{listening:t??0,reading:r??0,writing:s??0,speaking:n??0,overall:c,cefr:b,cefrLabel:h,cefrDescription:x}}function K(a){return rt(ye(a))}const ke=58,je=59;function it(a){return{overall:a.overall-ke,speaking:(a.speaking||0)-je}}function ot(a){const{overall:t,speaking:r}=it(a),s=[];return t<0?s.push(`${Math.abs(t)} points from overall target (${ke})`):s.push(`Overall target met (+${t})`),r<0?s.push(`${Math.abs(r)} points from speaking target (${je})`):s.push(`Speaking target met (+${r})`),s.join(" · ")}class ct{calculateScores(t){const r=X(t),s=Z(t);return{reading:r,listening:s,total:r.total+s.total,max:r.max+s.max}}calculateScaledScores(t){const r=X(t),s=Z(t);return te({reading:r,listening:s})}calculateCefr(t){const r=t.total,s=t.max,n=s>0?r/s*100:0;return n>=85?"C2":n>=75?"C1":n>=65?"B2":n>=55?"B1":n>=45?"A2":"A1"}}class lt{constructor(){const t=new at,r=new ct;this.startUseCase=new tt(t),this.submitUseCase=new st(t,r)}async startMockTest(t,r){try{const s=await this.startUseCase.execute(t,r);return{id:s.id.value,studentId:s.studentId,testType:s.type.value,status:s.status.value,startedAt:s.startedAt}}catch(s){throw console.error("Failed to start mock test:",s),s}}async submitMockTest(t,r){try{const s=await this.submitUseCase.execute(t,r);return{id:s.id.value,scores:s.scores,cefr:s.cefr,completedAt:s.completedAt}}catch(s){throw console.error("Failed to submit mock test:",s),s}}}const dt={task1:{id:"mt2_task1",title:"Task 1: Short Answer Responses",instructions:"Answer each of the three questions below with 1 to 3 complete sentences.",questions:[{id:"mt2_t1_q1",prompt:"Explain one method that healthcare facilities use to prevent hospital-acquired infections."},{id:"mt2_t1_q2",prompt:"Why is active listening crucial when taking a medical history from an anxious patient?"},{id:"mt2_t1_q3",prompt:"How do electronic health record systems contribute to interprofessional healthcare collaboration?"}]},task2:{id:"mt2_task2",title:"Task 2: Essay",instructions:"Write a formal argumentative essay of at least 200 words addressing the prompt below.",prompt:`Many healthcare systems are transitioning towards value-based healthcare models that tie provider reimbursement to patient health outcomes rather than the quantity of services delivered. Proponents claim this incentivizes preventive care, whereas critics argue it unfairly penalizes providers serving patients with complex chronic co-morbidities.

Evaluate both arguments and provide your perspective on the effectiveness of outcome-based healthcare models.`}};function mt({label:a,onBack:t,timer:r}){return e.jsxs("header",{className:"shdr",children:[e.jsxs("div",{className:"shdr__left",children:[e.jsxs(L,{variant:"ghost",size:"sm",onClick:t,className:"shdr__back-btn","aria-label":"Back to section selection",children:[e.jsx(I.arrowLeft,{size:14})," Back"]}),e.jsx("span",{className:"shdr__label",children:a})]}),e.jsx("div",{className:"shdr__right",children:r})]})}function ne({total:a,currentIdx:t,answered:r,onJump:s,partBoundaries:n=[],partLabels:l={1:"Part 1",2:"Part 2",3:"Part 3"},sectionName:c="section",ariaLabel:b="Question navigation"}){const h=i.useRef(null);i.useEffect(()=>{h.current?.querySelector(`[data-index="${t}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest"})},[t]);const x=(o,p)=>{let w=null;switch(o.key){case"ArrowDown":o.preventDefault(),w=Math.min(p+2,a-1);break;case"ArrowUp":o.preventDefault(),w=Math.max(p-2,0);break;case"ArrowRight":o.preventDefault(),w=Math.min(p+1,a-1);break;case"ArrowLeft":o.preventDefault(),w=Math.max(p-1,0);break;case"Home":o.preventDefault(),w=0;break;case"End":o.preventDefault(),w=a-1;break;case"Enter":case" ":o.preventDefault(),s?.(p);break}w!==null&&h.current?.querySelector(`[data-index="${w}"]`)?.focus()};return e.jsxs("nav",{className:"qnav","aria-label":b,ref:h,children:[e.jsxs("div",{className:"qnav__header",children:[e.jsx("span",{children:c}),e.jsxs("span",{className:"qnav__count",children:[t+1," / ",a]})]}),e.jsx("div",{className:"qnav__grid",role:"listbox","aria-orientation":"vertical",children:Array.from({length:a},(o,p)=>{const w=n?.find(k=>k.startIdx===p);return e.jsxs("div",{className:"qnav__item",children:[w&&e.jsx("div",{className:"qnav__part-label","aria-hidden":"true",children:l[w.part]||`Part ${w.part}`}),e.jsx("button",{"data-index":p,className:`qnav__btn ${p===t?"qnav__btn--current":""} ${r[p]?"qnav__btn--answered":""}`,onClick:()=>s?.(p),onKeyDown:k=>x(k,p),role:"option","aria-selected":p===t,"aria-label":`Question ${p+1}${r[p]?", answered":""}${p===t?", current":""}`,tabIndex:p===t?0:-1,children:p+1})]},p)})}),e.jsx("style",{children:`
        .qnav { width: 64px; background: var(--bg); border-right: 1px solid var(--border); padding: var(--space-3) var(--space-2); overflow-y: auto; flex-shrink: 0; }
        .qnav__header { display: flex; justify-content: space-between; align-items: center; font-size: var(--text-2xs); font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--space-2); letter-spacing: 0.05em; }
        .qnav__count { font-variant-numeric: tabular-nums; font-family: var(--font-mono); }
        .qnav__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-1); }
        .qnav__item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .qnav__part-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); text-align: center; padding: var(--space-1) 0 2px; width: 100%; }
        .qnav__btn { width: 100%; height: 44px; min-height: 44px; min-width: 44px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); cursor: pointer; font-size: var(--text-2xs); font-weight: 600; color: var(--text); display: flex; align-items: center; justify-content: center; transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast); }
        .qnav__btn:hover:not(:disabled) { border-color: var(--primary); }
        .qnav__btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .qnav__btn--current { border-color: var(--primary); background: var(--primary); color: #fff; }
        .qnav__btn--answered { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
        .qnav__btn--current.qnav__btn--answered { background: var(--primary); color: #fff; }
        @media (prefers-reduced-motion: reduce) { .qnav__btn { transition: none; } }
        @media (max-width: 420px) {
          .qnav { width: 100%; border-right: none; border-bottom: 1px solid var(--border); padding: var(--space-2); }
          .qnav__grid { grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); }
        }
      `})]})}function pt({totalSeconds:a,onTimeUp:t,running:r=!0,initialRemaining:s,onTimeChange:n,sectionName:l="section"}){const[c,b]=i.useState(s??a),h=i.useRef(null),x=i.useRef(t),o=i.useRef(c);i.useEffect(()=>{x.current=t},[t]),i.useEffect(()=>{s!==void 0&&b(s)},[s]),i.useEffect(()=>{if(!r){h.current&&clearInterval(h.current);return}return h.current=setInterval(()=>{b(g=>g<=1?(clearInterval(h.current),x.current?.(),0):g-1)},1e3),()=>clearInterval(h.current)},[r]),i.useEffect(()=>{n?.(c)},[c,n]),i.useEffect(()=>{c<=60&&c>0&&o.current>60,c<=30&&o.current>30,c===0&&o.current>0,o.current=c},[c]);const p=Math.floor(c/3600),w=Math.floor(c%3600/60),k=c%60,j=`${p>0?String(p).padStart(2,"0")+":":""}${String(w).padStart(2,"0")}:${String(k).padStart(2,"0")}`,R=a>0?c/a*100:0,C=c<=60&&c>0,u=c<=30&&c>0,m=`${l}: ${j} remaining`;return e.jsxs("div",{className:"mtt",role:"timer","aria-live":"polite","aria-label":m,"aria-atomic":"true",children:[e.jsx("div",{className:"mtt__bar-wrapper",children:e.jsx("div",{className:"mtt__bar-bg","aria-hidden":"true",children:e.jsx("div",{className:`mtt__bar-fill ${C?"mtt__bar-fill--warn":""} ${u?"mtt__bar-fill--critical":""}`,style:{transform:`scaleX(${Math.max(0,R/100)})`}})})}),e.jsx("span",{className:`mtt__time ${C?"mtt__time--warn":""} ${u?"mtt__time--critical":""}`,children:j}),e.jsx("style",{children:`
        .mtt { display: flex; align-items: center; gap: var(--space-3); min-width: 180px; }
        .mtt__bar-wrapper { flex: 1; min-width: 80px; }
        .mtt__bar-bg { height: 6px; background: var(--border); border-radius: var(--radius-full); overflow: hidden; }
        .mtt__bar-fill { height: 100%; width: 100%; background: var(--primary); border-radius: var(--radius-full); transition: transform 1s linear, background-color var(--transition-base); transform-origin: left; }
        .mtt__bar-fill--warn { background: var(--warning); }
        .mtt__bar-fill--critical { background: var(--danger); }
        .mtt__time { font-variant-numeric: tabular-nums; font-weight: 700; font-size: var(--text-base); color: var(--text); min-width: 5.5ch; text-align: right; font-family: var(--font-mono); }
        .mtt__time--warn { color: var(--warning); }
        .mtt__time--critical { color: var(--danger); }
        @media (prefers-reduced-motion: reduce) { .mtt__bar-fill { transition: none; } }
      `})]})}function ut({section:a,children:t,timerRunning:r,onTimeUp:s,onBack:n,_student:l,_currentIdx:c,_total:b,_answered:h,_onJump:x,_onPrevious:o,_onNext:p,_onFinish:w,_answeredCount:k,_disabled:j=!1}){return e.jsxs("div",{className:"mts-shell",children:[e.jsx(mt,{label:a.label,onBack:n,timer:e.jsx(pt,{totalSeconds:a.time,onTimeUp:s,running:r,ariaLabel:`Time remaining for ${a.label}`})}),e.jsx("div",{className:"mts-shell__body",children:e.jsxs("div",{className:"mts-shell__grid",children:[e.jsx(ne,{total:b,currentIdx:c,answered:h,onJump:x}),e.jsx("main",{className:"mts-shell__main",role:"main",children:t})]})}),e.jsx("style",{children:`
        .mts-shell { display: flex; flex-direction: column; height: 100%; min-height: 100vh; }
        .mts-shell__body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
        .mts-shell__grid { display: flex; flex: 1; overflow: hidden; min-height: 0; }
        .mts-shell__main { flex: 1; overflow-y: auto; padding: var(--space-6); background: var(--bg); min-width: 0; }
        @media (max-width: 768px) {
          .mts-shell__grid { flex-direction: column; }
          .mts-shell__main { padding: var(--space-4); }
        }
      `})]})}function Se({letter:a,children:t,selected:r,onClick:s,disabled:n=!1,className:l="",...c}){return e.jsxs("button",{type:"button",className:`opt-btn ${r?"opt-btn--selected":""} ${n?"opt-btn--disabled":""} ${l}`,onClick:s,disabled:n,"aria-pressed":r,...c,children:[e.jsx("span",{className:"opt-btn__letter","aria-hidden":"true",children:a}),e.jsx("span",{className:"opt-btn__text",children:t}),e.jsx("style",{children:`
        .opt-btn {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          font: inherit;
          font-size: var(--text-base);
          color: var(--text);
          transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .opt-btn:hover:not(.opt-btn--disabled) { border-color: var(--primary); }
        .opt-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .opt-btn--disabled { opacity: 0.5; cursor: not-allowed; }
        .opt-btn--selected { 
          border-color: var(--primary); 
          background: var(--primary-light); 
          color: var(--text);
        }
        .opt-btn__letter { 
          width: 28px; 
          height: 28px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border-radius: 50%; 
          background: var(--bg); 
          font-weight: 700; 
          font-size: var(--text-sm); 
          flex-shrink: 0; 
          border: 1.5px solid var(--border);
          transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
        }
        .opt-btn--selected .opt-btn__letter { 
          background: var(--primary); 
          color: #fff; 
          border-color: var(--primary);
        }
        .opt-btn__text { flex: 1; line-height: 1.5; }
        @media (prefers-reduced-motion: reduce) { .opt-btn, .opt-btn__letter { transition: none; } }
      `})]})}function ie({currentIdx:a,total:t,answeredCount:r,onPrevious:s,onNext:n,onFinish:l,disabled:c=!1,sectionName:b="section",previousLabel:h,nextLabel:x,finishLabel:o}){const p=a>=t-1,w="Previous question",k="Next question",j=`Finish ${b}`;return e.jsxs("div",{className:"nbtn",children:[e.jsx(L,{variant:"outline",size:"sm",onClick:s,disabled:a===0||c,className:"nbtn__btn","aria-label":h||w,children:h||w}),e.jsxs("div",{className:"nbtn__progress","aria-live":"polite","aria-atomic":"true",children:[r," of ",t," questions answered"]}),p?e.jsx(L,{variant:"accent",size:"sm",onClick:l,disabled:c,className:"nbtn__btn nbtn__btn--finish","aria-label":o||j,children:o||j}):e.jsx(L,{variant:"primary",size:"sm",onClick:n,disabled:c,className:"nbtn__btn nbtn__btn--next","aria-label":x||k,children:x||k}),e.jsx("style",{children:`
        .nbtn { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding-top: var(--space-4); border-top: 1px solid var(--border); margin-top: auto; }
        .nbtn__progress { flex: 1; text-align: center; font-size: var(--text-sm); color: var(--text-muted); font-variant-numeric: tabular-nums; }
        .nbtn__btn { white-space: nowrap; }
        @media (max-width: 860px) {
          .nbtn { flex-wrap: wrap; gap: var(--space-2); }
          .nbtn__progress { order: -1; flex: 1 0 100%; text-align: left; font-size: var(--text-xs); }
          .nbtn__btn { flex: 1 1 calc(50% - var(--space-1)); min-height: 44px; min-width: 44px; }
        }
        @media (max-width: 420px) {
          .nbtn { flex-direction: column; align-items: stretch; }
          .nbtn__btn { flex: 1 1 100%; width: 100%; }
        }
      `})]})}function ht({onComplete:a,readingData:t}){const r=t?.PART1||qe,s=t?.PART2||Fe,n=t?.PART3||Ge,{questions:l,partBoundaries:c}=i.useMemo(()=>{const d=[];r.questions.forEach(v=>d.push({...v,part:1})),s.passages.forEach(v=>v.questions.forEach(S=>d.push({...S,part:2}))),n.textSets?.length>0&&n.textSets.forEach(v=>v.questions.forEach(S=>d.push({...S,part:3})));const f=[];return d.forEach((v,S)=>{(S===0||v.part!==d[S-1].part)&&f.push({part:v.part,startIdx:S})}),{questions:d,partBoundaries:f}},[r,s,n]),b=i.useMemo(()=>{const d={};return r.questions.length>0&&(d[1]="Part 1"),s.passages.length>0&&(d[2]="Part 2"),n.textSets?.length>0&&(d[3]="Part 3"),d},[r,s,n]),[h,x]=i.useState(0),[o,p]=i.useState({}),[w,k]=i.useState({}),j=l[h],R=l.length,C=Object.keys(w).length,u=i.useCallback((d,f)=>{p(v=>({...v,[d]:f})),k(v=>({...v,[d]:!0}));try{const v=JSON.parse(sessionStorage.getItem(U.SECTION_ANSWERS("reading"))||"{}");v[d]=f,sessionStorage.setItem(U.SECTION_ANSWERS("reading"),JSON.stringify(v))}catch{}},[]);i.useEffect(()=>{try{const d=JSON.parse(sessionStorage.getItem(U.SECTION_ANSWERS("reading"))||"{}"),f=Object.keys(d);if(f.length>0){const v={},S={};f.forEach(N=>{v[N]=d[N],S[N]=!0}),p(v),k(S)}}catch{}},[]);const m=i.useCallback(()=>{const d={};l.forEach(f=>{o[f.id]!==void 0&&(d[f.id]=o[f.id])}),a(d)},[o,a]),g=()=>{if(j.part===1)return null;if(j.part===2){const d=s.passages.find(f=>f.questions.some(v=>v.id===j.id));return d?e.jsxs("div",{className:"rs__passage card",children:[e.jsx("h4",{className:"rs__passage-title",children:d.title}),e.jsx("p",{className:"rs__passage-text",children:d.text})]}):null}if(j.part===3){const d=n.textSets?.find(f=>f.questions.some(v=>v.id===j.id));return d?e.jsx("div",{className:"rs__passage card",children:d.texts.map((f,v)=>e.jsxs("div",{className:"rs__passage-text-block",children:[e.jsxs("h4",{className:"rs__passage-title",children:[f.label,": ",f.title]}),e.jsx("p",{className:"rs__passage-text",children:f.text})]},v))}):null}return null};return e.jsxs("div",{className:"rs",children:[e.jsx(ne,{total:R,currentIdx:h,answered:w,onJump:x,partBoundaries:c,partLabels:b,sectionName:"Reading & Grammar",ariaLabel:"Reading section questions"}),e.jsxs("div",{className:"rs__main",children:[g(),e.jsxs("div",{className:"rs__question",children:[e.jsxs("div",{className:"rs__q-label",children:["Question ",h+1," of ",R]}),e.jsx("p",{className:"rs__q-text",children:j.text}),e.jsx("div",{className:"rs__options",role:"radiogroup","aria-label":`Question ${h+1} options`,children:j.options.map((d,f)=>e.jsx(Se,{letter:"ABCD"[f],selected:o[j.id]===f,onSelect:()=>u(j.id,f),children:d},f))})]}),e.jsx(ie,{currentIdx:h,total:R,answeredCount:C,sectionName:"Reading & Grammar section",onPrevious:()=>x(d=>d-1),onNext:()=>x(d=>d+1),onFinish:m})]}),e.jsx("style",{children:`
        .rs { display: flex; min-height: 100%; }
        .rs__main { flex: 1; min-width: 0; padding: var(--space-6) var(--space-5); display: flex; flex-direction: column; gap: var(--space-5); max-width: 960px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .rs__passage { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-4) var(--space-5); margin: 0; }
        .rs__passage-title { margin: 0 0 var(--space-2); font-size: var(--text-lg); font-weight: 700; color: var(--text); }
        .rs__passage-text { margin: 0; font-size: var(--text-base); line-height: 1.65; color: var(--text); white-space: pre-wrap; }
        .rs__passage-text-block + .rs__passage-text-block { margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px dashed var(--border); }
        .rs__question { display: flex; flex-direction: column; gap: var(--space-3); }
        .rs__q-label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
        .rs__q-text { margin: 0; font-size: var(--text-base); line-height: 1.6; color: var(--text); }
        .rs__options { display: flex; flex-direction: column; gap: var(--space-2); }
        @media (max-width: 860px) {
          .rs__main { padding: var(--space-4) var(--space-3); gap: var(--space-4); }
          .rs__passage { padding: var(--space-3) var(--space-4); }
          .rs__passage-title { font-size: var(--text-base); }
          .rs__passage-text { font-size: var(--text-sm); }
        }
        @media (max-width: 420px) {
          .rs__main { padding: var(--space-3) var(--space-2); gap: var(--space-3); }
          .rs__passage { padding: var(--space-2) var(--space-3); }
        }
      `})]})}function gt(a){try{return localStorage.getItem(a)||""}catch{return""}}const oe=()=>gt("vv:piper_server_url");function ft(){try{const a=localStorage.getItem("vv:supabase_session");return a&&JSON.parse(a)?.access_token||""}catch{return""}}async function ce(a,t="female"){const r=ft(),s=await fetch("/api/tts",{method:"POST",headers:{"Content-Type":"application/json",...r?{Authorization:`Bearer ${r}`}:{}},body:JSON.stringify({text:a,gender:t})});if(!s.ok){const k=await s.json().catch(()=>({}));throw new Error(k?.error?.message||`Server TTS error ${s.status}`)}const l=(await s.json())?.audioB64;if(!l)throw new Error("Server returned no audio data");const[c,b]=l.split(","),h=/data:(.*?);/.exec(c||""),x=h?h[1]:"audio/mpeg",o=atob(b),p=new Array(o.length);for(let k=0;k<o.length;k++)p[k]=o.charCodeAt(k);const w=new Blob([new Uint8Array(p)],{type:x});return URL.createObjectURL(w)}async function le(a,t,r){const s=await fetch(`${t.replace(/\/$/,"")}/synthesize`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:a,gender:r||"female"})});if(!s.ok){const n=await s.json().catch(()=>({}));throw new Error(n.detail||`Piper TTS error ${s.status}`)}return URL.createObjectURL(await s.blob())}async function xt(a){const t=oe();if(t)try{return await le(a,t)}catch(r){console.warn("[tts] Piper failed:",r.message)}try{return await ce(a)}catch(r){console.warn("[tts] Server proxy failed:",r.message)}return null}async function vt(a,t="female"){const r=oe();if(r)try{return await le(a,r,t)}catch(s){console.warn("[tts] Piper failed:",s.message)}try{return await ce(a,t)}catch(s){console.warn("[tts] Server proxy failed:",s.message)}return null}async function _t(a){const t=oe();if(t)try{const r=await Promise.all(a.map(s=>le(s.text,t,s.gender)));return pe(r)}catch(r){console.warn("[tts] Piper conversation failed:",r.message)}try{const r=await Promise.all(a.map(s=>ce(s.text,s.gender)));return pe(r)}catch(r){console.warn("[tts] Server conversation failed:",r.message)}return null}async function pe(a){if(typeof window>"u"||!window.AudioContext)return console.warn("[tts] AudioContext not available, returning first blob"),a[0];try{const t=await Promise.all(a.map(async x=>{const p=await(await fetch(x)).arrayBuffer();return await new(window.AudioContext||window.webkitAudioContext)().decodeAudioData(p)})),r=t.reduce((x,o)=>x+o.length,0),s=t[0].sampleRate,n=t[0].numberOfChannels,l=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(n,r,s);let c=0;t.forEach(x=>{const o=l.createBufferSource();o.buffer=x,o.connect(l.destination),o.start(c),c+=x.duration});const b=await l.startRendering(),h=bt(b);return URL.createObjectURL(new Blob([h],{type:"audio/wav"}))}catch(t){return console.error("[tts] concatenateAudioBlobs failed:",t),a[0]}}function bt(a){const t=a.length,r=a.numberOfChannels,s=a.sampleRate,n=16,l=n/8,c=r*l,b=s*c,h=t*c,x=new ArrayBuffer(44+h),o=new DataView(x);J(o,0,"RIFF"),o.setUint32(4,36+h,!0),J(o,8,"WAVE"),J(o,12,"fmt "),o.setUint32(16,16,!0),o.setUint16(20,1,!0),o.setUint16(22,r,!0),o.setUint32(24,s,!0),o.setUint32(28,b,!0),o.setUint16(32,c,!0),o.setUint16(34,n,!0),J(o,36,"data"),o.setUint32(40,h,!0);const p=a.getChannelData(0);let w=44;for(let k=0;k<t;k++){const j=Math.max(-1,Math.min(1,p[k]));o.setInt16(w,j<0?j*32768:j*32767,!0),w+=2}return x}function J(a,t,r){for(let s=0;s<r.length;s++)a.setUint8(t+s,r.charCodeAt(s))}const wt={0:"female",1:"male",2:"female",3:"male"},ue="met:listening:audio:";async function yt(a){const t=`Write a very short, natural English conversation (2-4 lines) between two speakers for a listening test. Use "A:" and "B:" prefixes. The conversation should relate to this context: ${a}. Keep each line under 15 words. Output ONLY the script lines, one per line.`,r=await we(t,{system:"You write short natural English conversation scripts for language tests. Output only the script lines.",temperature:.5,max_tokens:500});return(r?.content?.[0]?.text||r?.text||"").split(`
`).filter(n=>n.trim()).map(n=>{const l=n.trim().match(/^([AB]):\s*(.+)/i);return l?{speaker:l[1].toUpperCase(),text:l[2]}:null}).filter(Boolean)}function kt(a){return a.map(t=>({text:t.text,gender:t.speaker==="A"?"female":"male"}))}async function jt(a,t){const r=`Write a short English monologue (3-5 sentences) for a listening test. Topic context: ${a}. Keep it natural and under 60 words.`,s=await we(r,{system:"You write short natural English monologues for language tests. Output only the monologue text.",temperature:.5,max_tokens:500}),l=(s?.content?.[0]?.text||s?.text||"").replace(/^["']|["']$/g,"").trim();return vt(l,t)}function St({onComplete:a,listeningData:t}){const r=t?.PART1||We,s=t?.PART2||Ke,n=t?.PART3||Je,{questions:l,partBoundaries:c}=i.useMemo(()=>{const _=[];r.questions.forEach(y=>_.push({...y,audio:y.audio,isConversation:!0,conversationId:`part1_${y.id}`,scriptContext:y.text+" "+y.options.join(" "),part:1,partLabel:r.label,partInstructions:r.instructions})),s.conversations.forEach(y=>{const T=(y.questions||[]).map(M=>M.text+" "+M.options.join(" ")).join(" ");y.questions.forEach(M=>_.push({...M,audio:y.audio,isConversation:!0,conversationId:y.title,scriptContext:T,part:2,partLabel:s.label,partInstructions:s.instructions}))}),n.talks.forEach((y,T)=>{const M=(y.questions||[]).map(P=>P.text+" "+P.options.join(" ")).join(" ");y.questions.forEach(P=>_.push({...P,audio:y.audio,isConversation:!1,conversationId:y.title,scriptContext:M,talkVoice:wt[T]||"female",part:3,partLabel:n.label,partInstructions:n.instructions}))});const A=[];return _.forEach((y,T)=>{(T===0||y.part!==_[T-1].part)&&A.push({part:y.part,label:y.partLabel,startIdx:T})}),{questions:_,partBoundaries:A}},[r,s,n]),b=i.useMemo(()=>{const _={};return r.questions.length>0&&(_[1]="Part 1"),s.conversations.length>0&&(_[2]="Part 2"),n.talks.length>0&&(_[3]="Part 3"),_},[r,s,n]),[h,x]=i.useState(0),[o,p]=i.useState({}),[w,k]=i.useState({}),[j,R]=i.useState(null),[C,u]=i.useState(null),m=i.useRef(null),g=l[h],d=l.length,f=Object.keys(w).length;i.useEffect(()=>{try{const _=JSON.parse(sessionStorage.getItem(U.SECTION_ANSWERS("listening"))||"{}"),A=Object.keys(_);if(A.length>0){const y={},T={};A.forEach(M=>{y[M]=_[M],T[M]=!0}),p(y),k(T)}}catch{}},[]),i.useEffect(()=>()=>{m.current&&(m.current.pause(),m.current=null)},[]);const v=i.useCallback((_,A)=>{p(y=>({...y,[_]:A})),k(y=>({...y,[_]:!0}));try{const y=JSON.parse(sessionStorage.getItem(U.SECTION_ANSWERS("listening"))||"{}");y[_]=A,sessionStorage.setItem(U.SECTION_ANSWERS("listening"),JSON.stringify(y))}catch{}},[]),S=i.useCallback(async _=>{m.current&&(m.current.pause(),m.current=null),R(_);try{const A=new Audio(_);m.current=A,await A.play(),A.addEventListener("ended",()=>R(null))}catch{R(null)}},[]),N=i.useCallback(async _=>{m.current&&(m.current.pause(),m.current=null);const A=ue+_.id;let y=null;try{y=sessionStorage.getItem(A)}catch{}if(y){await S(y);return}u(_.id);try{let T=null;if(_.isConversation){const M=ue+"script:"+_.conversationId;let P=null;try{const E=sessionStorage.getItem(M);E&&(P=JSON.parse(E))}catch{}if(!P&&(P=await yt(_.scriptContext),P&&P.length>0))try{sessionStorage.setItem(M,JSON.stringify(P))}catch{}if(P&&P.length>0){const E=kt(P);T=await _t(E)}}else T=await jt(_.scriptContext,_.talkVoice||"female");if(T){try{sessionStorage.setItem(A,T)}catch{}await S(T)}else await S(_.audio)}catch{await S(_.audio)}u(null)},[S]),$=i.useCallback(()=>{const _={};l.forEach(A=>{o[A.id]!==void 0&&(_[A.id]=o[A.id])}),a(_)},[o,a]),O=_=>{m.current&&(m.current.pause(),m.current=null,R(null)),x(A=>Math.max(0,Math.min(d-1,A+_)))};return e.jsxs("div",{className:"ls",children:[e.jsx(ne,{total:d,currentIdx:h,answered:w,onJump:_=>O(_-h),partBoundaries:c,partLabels:b,sectionName:"Listening",ariaLabel:"Listening section questions"}),e.jsxs("div",{className:"ls__main",children:[e.jsxs("div",{className:"ls__q-label",children:["Question ",h+1," of ",d," ",e.jsx("span",{className:"pill pill-accent",children:g.partLabel})]}),e.jsxs("div",{className:"card ls__part-header",children:[e.jsx("span",{className:"ls__part-header-label",children:g.partLabel}),e.jsx("span",{className:"ls__part-header-instructions",children:g.partInstructions})]}),e.jsxs("div",{className:"ls__audio-row",children:[e.jsx("button",{className:`btn btn-primary ${j?"btn--playing":""}`,onClick:()=>N(g),disabled:C===g.id,"aria-label":C===g.id?"Generating audio...":j?"Stop audio":"Play audio",children:C===g.id?e.jsx(e.Fragment,{children:"⏳ Generating..."}):j?e.jsx(e.Fragment,{children:"⏹ Stop"}):e.jsx(e.Fragment,{children:"▶ Play Audio"})}),g.isConversation&&e.jsx("span",{className:"pill pill-info",children:"Multi-voice"})]}),e.jsx("p",{className:"ls__q-text",children:g.text}),e.jsx("div",{className:"ls__options",role:"radiogroup","aria-label":`Question ${h+1} options`,children:g.options.map((_,A)=>e.jsx(Se,{letter:"ABCD"[A],selected:o[g.id]===A,onSelect:()=>v(g.id,A),children:_},A))}),e.jsx(ie,{currentIdx:h,total:d,answeredCount:f,sectionName:"Listening section",onPrevious:()=>O(-1),onNext:()=>O(1),onFinish:$})]}),e.jsx("style",{children:`
        .ls { display: flex; min-height: 100%; }
        .ls__main { flex: 1; min-width: 0; padding: var(--space-6) var(--space-5); display: flex; flex-direction: column; gap: var(--space-5); max-width: 960px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .ls__q-label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
        .ls__part-header { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-4) var(--space-5); display: flex; flex-direction: column; gap: var(--space-2); }
        .ls__part-header-label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); }
        .ls__part-header-instructions { font-size: var(--text-sm); color: var(--text-muted); line-height: 1.5; }
        .ls__audio-row { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
        .ls__audio-row audio { flex: 1; min-width: 0; }
        .ls__audio-status { font-size: var(--text-sm); color: var(--text-muted); }
        .ls__q-text { margin: 0; font-size: var(--text-base); line-height: 1.6; color: var(--text); }
        .ls__options { display: flex; flex-direction: column; gap: var(--space-2); }
        @media (max-width: 860px) {
          .ls__main { padding: var(--space-4) var(--space-3); gap: var(--space-4); }
          .ls__part-header { padding: var(--space-3) var(--space-4); }
          .ls__audio-row audio { width: 100%; }
          .ls__audio-row .btn { width: 100%; justify-content: center; min-height: 44px; }
        }
        @media (max-width: 420px) {
          .ls__main { padding: var(--space-3) var(--space-2); gap: var(--space-3); }
          .ls__audio-row { flex-direction: column; align-items: stretch; }
          .ls__audio-row audio { width: 100%; }
        }
      `})]})}function Nt({onComplete:a,speakingData:t}){const r=t?.TASKS||He,[s,n]=i.useState(0),[l,c]=i.useState("intro"),[b,h]=i.useState(0),[x,o]=i.useState(0),[p,w]=i.useState({}),[k,j]=i.useState(!1),[R,C]=i.useState(!1),[u,m]=i.useState(!1),g=i.useRef(null),d=i.useRef([]),f=i.useRef(null),v=i.useRef(null),S=i.useRef(null),N=r[s],$=r.length,O=i.useCallback(()=>{v.current&&clearInterval(v.current),g.current&&g.current.state!=="inactive"&&g.current.stop(),f.current&&(f.current.getTracks().forEach(E=>E.stop()),f.current=null)},[]);i.useEffect(()=>O,[O]);const _=i.useCallback(()=>{c("prep"),h(N.prepSeconds),v.current=setInterval(()=>{h(E=>E<=1?(clearInterval(v.current),S.current?.(),0):E-1)},1e3)},[N.prepSeconds]),A=i.useCallback(async()=>{if(c("speak"),o(N.speakSeconds),!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){const E="Your browser does not support audio recording. Please use a modern browser and ensure you are using HTTPS.";window.toast?.(E,"warn")||window.alert(E),c("done");return}try{const E=await navigator.mediaDevices.getUserMedia({audio:!0});f.current=E,d.current=[];const z=new MediaRecorder(E);g.current=z,z.ondataavailable=(D=>{D.data.size>0&&d.current.push(D.data)}),z.onstop=()=>{const D=new Blob(d.current,{type:"audio/webm"});w(H=>({...H,[s]:URL.createObjectURL(D)}))},z.start(),j(!0),v.current=setInterval(()=>{o(D=>D<=1?(clearInterval(v.current),z.state!=="inactive"&&z.stop(),j(!1),f.current&&f.current.getTracks().forEach(H=>H.stop()),0):D-1)},1e3)}catch(E){console.error("[SpeakingSection] startSpeaking failed:",E);const z="Microphone access denied or not available. Please check your browser permissions.";window.toast?.(z,"warn")||window.alert(z),c("done")}},[s,N.speakSeconds]);i.useEffect(()=>{S.current=A},[A]);const y=i.useCallback(async()=>{if(u)return;m(!0);const E=z=>{const D=new Audio(z);D.addEventListener("ended",()=>_()),D.play().then(()=>C(!0)).catch(()=>{C(!1)})};try{const z=await xt(N.prompt);z?E(z):N.audio?E(N.audio):(C(!0),_())}catch(z){console.warn("[speaking] Deepgram narration failed:",z),N.audio?E(N.audio):(C(!0),_())}finally{m(!1)}},[u,N.prompt,N.audio,_]),T=i.useRef(-1);i.useEffect(()=>{l==="intro"&&T.current!==s&&(T.current=s,y())},[l,s,y]);const M=i.useCallback(()=>{O(),C(!1),s<$-1?(n(E=>E+1),c("intro")):a(p)},[s,$,p,a,O]),P=window.matchMedia("(prefers-reduced-motion: reduce)").matches;return e.jsxs("div",{className:"ss",children:[e.jsxs("div",{className:"ss__content",children:[e.jsxs("div",{className:"ss__task-label",children:["Task ",N.id," of ",$]}),e.jsx("h3",{className:"ss__task-title",children:N.label}),l==="intro"&&e.jsxs("div",{className:"ss__phase",children:[e.jsx("p",{className:"ss__prompt",children:N.prompt}),R?e.jsx("div",{className:"ss__prep-count","aria-live":"polite",children:"Getting ready..."}):e.jsxs(L,{variant:"primary",onClick:y,className:"ss__btn",disabled:u,children:[e.jsx(I.play,{size:16})," ",u?"Generating narration…":"Play Prompt & Start Preparation"]})]}),l==="prep"&&e.jsx("div",{className:"ss__phase",children:e.jsxs("div",{className:`ss__countdown ${P?"":"ss__countdown--animated"}`,children:[e.jsx("div",{className:"ss__countdown-label",children:"Preparation Time"}),e.jsxs("div",{className:"ss__countdown-time","aria-live":"polite",children:[b,"s remaining"]}),e.jsx("div",{className:"ss__countdown-bar",role:"progressbar","aria-valuenow":b,"aria-valuemin":0,"aria-valuemax":N.prepSeconds,"aria-label":"Preparation time remaining",children:e.jsx("div",{className:"ss__countdown-fill",style:{transform:`scaleX(${b/N.prepSeconds})`}})})]})}),l==="speak"&&e.jsxs("div",{className:"ss__phase",children:[e.jsxs("div",{className:`ss__countdown ${P?"":"ss__countdown--animated"}`,children:[e.jsx("div",{className:"ss__countdown-label",children:k?"Recording Time":"Speaking Time"}),e.jsxs("div",{className:"ss__countdown-time","aria-live":"polite",children:[x,"s remaining"]}),e.jsx("div",{className:"ss__countdown-bar",role:"progressbar","aria-valuenow":x,"aria-valuemin":0,"aria-valuemax":N.speakSeconds,"aria-label":"Speaking time remaining",children:e.jsx("div",{className:"ss__countdown-fill",style:{transform:`scaleX(${x/N.speakSeconds})`}})})]}),e.jsxs("div",{className:"ss__waveform","aria-live":"polite",children:[e.jsx(I.mic,{size:20,className:k?"ss__mic--recording":""}),k?"Recording in progress...":"Preparing microphone..."]})]}),l==="done"&&e.jsxs("div",{className:"ss__phase",children:[e.jsxs("div",{className:"ss__done-msg",role:"status",children:[p[s]?e.jsx(I.check,{size:20,className:"ss__icon--success"}):e.jsx(I.warning,{size:20,className:"ss__icon--warning"}),"Task ",N.id," ",p[s]?"completed":"skipped"]}),e.jsx(L,{variant:"primary",onClick:M,className:"ss__btn",children:s<$-1?e.jsxs(e.Fragment,{children:["Continue to Next Task ",e.jsx(I.arrowRight,{size:14})]}):"Finish Speaking Section"})]})]}),e.jsx("style",{children:`
        .ss { display: flex; justify-content: center; padding: var(--space-8) var(--space-5); }
        .ss__content { max-width: 600px; width: 100%; }
        .ss__task-label { font-size: var(--text-xs); font-weight: 700; color: var(--primary); margin-bottom: var(--space-1); }
        .ss__task-title { font-size: var(--text-xl); font-weight: 700; color: var(--text); margin: 0 0 var(--space-5); }
        .ss__phase { display: flex; flex-direction: column; gap: var(--space-5); }
        .ss__prompt { font-size: var(--text-base); line-height: 1.7; color: var(--text); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-4); }
        .ss__btn { align-self: flex-start; }
        .ss__countdown { text-align: center; padding: var(--space-5); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); }
        .ss__countdown--prep { border-color: var(--accent); }
        .ss__countdown--speak { border-color: var(--primary); }
        .ss__countdown-label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--space-1); letter-spacing: 0.05em; }
        .ss__countdown-time { font-size: 36px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; font-family: var(--font-mono); }
        .ss__countdown-bar { height: 6px; background: var(--bg); border-radius: var(--radius-full); margin-top: var(--space-2); overflow: hidden; }
        .ss__countdown-fill { height: 100%; width: 100%; border-radius: var(--radius-full); transform-origin: left; background: var(--primary); transition: transform 1s linear; }
        .ss__countdown--prep .ss__countdown-fill { background: var(--accent); }
        .ss__countdown--animated .ss__countdown-fill { transition: transform 1s linear; }
        @media (prefers-reduced-motion: reduce) { .ss__countdown-fill { transition: none; } }
        .ss__waveform { text-align: center; font-size: var(--text-sm); color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-top: var(--space-4); }
        .ss__mic--recording { color: var(--danger); animation: ss-pulse 1s ease-in-out infinite; }
        @keyframes ss-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (prefers-reduced-motion: reduce) { .ss__mic--recording { animation: none; } }
        .ss__done-msg { font-size: var(--text-base); font-weight: 600; color: var(--text); text-align: center; padding: var(--space-5); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; gap: var(--space-2); }
        .ss__icon--success { color: var(--success); }
        .ss__icon--warning { color: var(--warning); }
        .ss__prep-count { color: var(--text-muted); font-size: var(--text-sm); }
        @media (max-width: 860px) {
          .ss { padding: var(--space-4) var(--space-3); }
          .ss__content { max-width: 100%; }
          .ss__prompt { padding: var(--space-3); font-size: var(--text-sm); }
          .ss__countdown-time { font-size: 28px; }
          .ss__btn { align-self: stretch; min-height: 44px; width: 100%; justify-content: center; }
        }
        @media (max-width: 420px) {
          .ss { padding: var(--space-3) var(--space-2); }
          .ss__prompt { padding: var(--space-2); }
          .ss__countdown { padding: var(--space-3); }
        }
      `})]})}function Tt({onComplete:a,writingData:t}){const r=t?.TASKS||Qe,[s,n]=i.useState(0),[l,c]=i.useState({}),{task1:b,task2:h}=r,x=[...b.questions.map((m,g)=>({type:"short",...m,pageIdx:g})),{type:"essay",...h,pageIdx:b.questions.length}],o=x.length,p=x[s];i.useEffect(()=>{try{const m=JSON.parse(sessionStorage.getItem(U.SECTION_ANSWERS("writing"))||"{}");Object.keys(m).length>0&&c(m)}catch{}},[]);const w=i.useCallback(m=>{try{sessionStorage.setItem(U.SECTION_ANSWERS("writing"),JSON.stringify(m))}catch{}},[]),k=i.useCallback((m,g)=>{c(d=>{const f={...d,[m]:g};return w(f),f})},[w]),j=m=>{const g=l[m]||"";return g.trim()===""?0:g.trim().split(/\s+/).length},R=i.useCallback(()=>{a(l)},[l,a]),u=p.type==="essay"?"Task 2 — Formal Essay":`Task 1 — Short Response (${p.pageIdx+1} of 3)`;return e.jsxs("div",{className:"ws",children:[e.jsxs("div",{className:"ws__main",children:[e.jsx("div",{className:"ws__header",children:e.jsx("span",{className:"pill pill-primary ws__label",children:u})}),e.jsx("p",{className:"ws__prompt",children:p.text||p.prompt}),e.jsx("textarea",{className:"input ws__textarea",rows:p.rows||10,value:l[p.id]||"",onChange:m=>k(p.id,m.target.value),placeholder:"Write your answer here...","aria-label":u}),e.jsxs("div",{className:"ws__wordcount","aria-live":"polite",children:[j(p.id)," words"]}),e.jsx(ie,{currentIdx:s,total:o,answeredCount:Object.keys(l).length,sectionName:"Writing section",onPrevious:()=>n(m=>m-1),onNext:()=>n(m=>m+1),onFinish:R})]}),e.jsx("style",{children:`
        .ws { display: flex; justify-content: center; padding: var(--space-6) var(--space-5); }
        .ws__main { max-width: 720px; width: 100%; display: flex; flex-direction: column; gap: var(--space-4); }
        .ws__label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .ws__prompt { font-size: var(--text-base); line-height: 1.7; color: var(--text); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-4); margin: 0; }
        .ws__textarea { min-height: 200px; }
        .ws__wordcount { font-size: var(--text-sm); color: var(--text-muted); text-align: right; }
        @media (max-width: 860px) {
          .ws { padding: var(--space-4) var(--space-3); }
          .ws__main { max-width: 100%; }
          .ws__prompt { padding: var(--space-3); font-size: var(--text-sm); }
          .ws__textarea { min-height: 160px; font-size: 16px; }
        }
        @media (max-width: 420px) {
          .ws { padding: var(--space-3) var(--space-2); }
          .ws__prompt { padding: var(--space-2); }
        }
      `})]})}const he={"mock-test-1":{data:be,scoreReading:X,scoreListening:Z},"mock-test-2":{data:_e,scoreReading:ze,scoreListening:Pe}};function ge({answers:a,student:t,onBack:r,testId:s="mock-test-1"}){const n=he[s]||he["mock-test-1"],[l,c]=i.useState("saving"),[b,h]=i.useState(null),[x,o]=i.useState(null),[p,w]=i.useState(null),[k,j]=i.useState(null);if(i.useEffect(()=>{let v=!1;return(async()=>{try{c("saving");const S=n.scoreReading(a),N=n.scoreListening(a);v||(h(S),o(N));const $=te({reading:S,listening:N}),O=$.cefr,_={},A=a&&Object.keys(a).filter(T=>!isNaN(Number(T))&&typeof a[T]=="string"&&a[T].startsWith("blob:"));for(const T of A)try{const P=await(await fetch(a[T])).blob(),E=`${s}/${t?.email||"anon"}/speaking_task${T}_${Date.now()}.webm`,z=await Ae(P,E);_[T]=z}catch{_[T]=null}const y={studentId:t?.local_id||t?.id||"",studentName:t?.name||t?.firstName||"",studentEmail:t?.email||"",testId:s,testTitle:n.data.title,answers:a,scores:{reading:{total:S.total,max:S.max,details:S.details,scaled:$.reading,cefr:K(S.max>0?Math.round(S.total/S.max*100):0)},listening:{total:N.total,max:N.max,details:N.details,scaled:$.listening,cefr:K(N.max>0?Math.round(N.total/N.max*100):0)},overall:{scaled:$.overall,cefr:$.cefr,cefrLabel:$.cefrLabel,cefrDescription:$.cefrDescription}},cefr:O,speakingRecordings:_,submittedAt:new Date().toISOString()};try{await Ee(y)}catch(T){console.warn("[MockTestThanks] Supabase save failed, keeping localStorage:",T.message)}try{localStorage.setItem(`met:${s}:submission`,JSON.stringify(y))}catch{}n.data.sections.forEach(T=>{try{localStorage.removeItem(`met:timer:${T.id}`)}catch{}try{sessionStorage.removeItem(`met:section:${T.id}:answers`)}catch{}}),v||(j(y),c("done"))}catch(S){v||(w(S.message),c("error"))}})(),()=>{v=!0}},[a,t,s]),l!=="done"){const v=l==="saving",S=l==="error";return e.jsx("div",{className:"mtr-container",children:e.jsxs("div",{className:"card mtr__loading",role:S?"alert":"status","aria-live":S?"assertive":"polite",children:[v&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"mtr__loading-spinner","aria-hidden":"true",children:e.jsx("div",{className:"spinner"})}),e.jsx("h3",{className:"mtr__loading-title",children:"Saving Your Results"}),e.jsx("p",{className:"mtr__loading-text",children:"We're calculating your scores and saving your test submission. This usually takes a few seconds."})]}),S&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"mtr__error-icon","aria-hidden":"true",children:e.jsx(I.warning,{size:32})}),e.jsx("h3",{className:"mtr__error-title",children:"Something Went Wrong"}),e.jsxs("p",{className:"mtr__error-text",children:["We couldn't save your test results: ",p]}),e.jsx("p",{className:"mtr__error-hint",children:"Your answers are saved locally. Try refreshing the page or contact support if this continues."}),e.jsx(L,{variant:"primary",onClick:()=>window.location.reload(),children:"Refresh Page"})]})]})})}const R=b?.max>0?Math.round(b.total/b.max*100):0,C=x?.max>0?Math.round(x.total/x.max*100):0,u=te({reading:b,listening:x}),m=u.cefr,g=se(m),d=(b?.total||0)+(x?.total||0),f=(b?.max||0)+(x?.max||0);return e.jsxs("div",{className:"mtr-container",children:[e.jsxs("article",{className:"mtr card",children:[e.jsxs("header",{className:"mtr__header",children:[e.jsx("h1",{className:"mtr__title",children:"Mock Test Results"}),e.jsx("p",{className:"mtr__subtitle",children:n.data.title}),e.jsx("div",{className:"mtr__badge",style:{background:g},children:m}),e.jsxs("div",{className:"mtr__score",children:[u.overall," / 80 ",e.jsxs("span",{className:"mtr__score-raw",children:["(",d," / ",f," raw)"]})]}),e.jsx("p",{className:"mtr__label",children:u.cefrLabel}),e.jsx("p",{className:"mtr__label-desc",children:u.cefrDescription}),e.jsx("div",{className:"mtr__bar",role:"img","aria-label":`CEFR level progression, current level: ${m}`,children:Ye.LEVELS.map(v=>e.jsxs("div",{className:`mtr__bar-level ${v.id===m?"mtr__bar-level--active":""}`,style:{background:v.color},children:[e.jsx("span",{className:"mtr__bar-label",children:v.label}),e.jsx("span",{className:"mtr__bar-desc",children:v.desc})]},v.id))}),e.jsxs("div",{className:"mtr__target",style:{marginTop:"var(--space-4)",padding:"var(--space-3)",background:"var(--primary-light)",borderRadius:"var(--radius-md)",textAlign:"center"},children:[e.jsx("span",{className:"text-sm font-medium text-primary",children:"🎯 Nursing Target: 58 Overall / 59 Speaking"}),e.jsx("div",{className:"text-xs text-ink-muted mt-1",children:ot(u)})]})]}),e.jsx("div",{className:"mtr__message alert-box",style:{background:"var(--info-bg)",borderColor:"var(--info-soft)"},children:"You've completed your mock test. Your score is a starting point, not a final judgment. This result shows us exactly where to focus next. Together, we'll analyse your performance by skill area, identify the gaps, and build a targeted plan to close them before exam day. Every mistake here is a mistake you won't make in the real test."}),e.jsxs("div",{className:"mtr__skills",children:[e.jsx(fe,{label:"Listening",score:x,scaled:u.listening,pct:C,cefr:K(C)}),e.jsx(fe,{label:"Reading & Grammar",score:b,scaled:u.reading,pct:R,cefr:K(R)})]}),e.jsxs("div",{className:"mtr__actions",children:[e.jsx("h2",{className:"mtr__actions-title",children:"Next Steps"}),e.jsxs(Q,{priority:"high",label:"HIGH",children:[e.jsx("strong",{children:"Review your mistakes"}),"Look at the questions you got wrong and understand why. Each incorrect answer reveals a specific gap to work on."]}),e.jsxs(Q,{priority:"medium",label:"MEDIUM",children:[e.jsx("strong",{children:"Focus on your weaker skill"}),m==="Below B1"||m==="B1"?"Prioritise building foundational vocabulary and grammar through daily practice exercises.":"Practise with authentic materials at or slightly above your current level to push toward the next band."]}),e.jsxs(Q,{priority:"low",label:"NEXT",children:[e.jsx("strong",{children:"Take another mock test"}),"Track your progress over time. Aim to move up one CEFR band with each practice cycle."]})]}),e.jsx(L,{variant:"primary",size:"lg",className:"mtr__btn",onClick:r,children:"Return to Dashboard"})]}),e.jsx("style",{children:`
        .mtr-container { max-width: 800px; margin: 0 auto; padding: var(--space-5) var(--space-4); }
        .mtr { overflow: hidden; }
        .mtr__header { padding: var(--space-8) var(--space-6) var(--space-5); text-align: center; }
        .mtr__title { font-size: var(--text-3xl); margin: 0 0 var(--space-1); font-weight: 800; }
        .mtr__subtitle { color: var(--text-muted); font-size: var(--text-base); margin: 0 0 var(--space-5); }
        .mtr__badge { display: inline-block; padding: var(--space-3) var(--space-8); border-radius: var(--radius-pill); font-size: var(--text-3xl); font-weight: 800; color: var(--on-dark); }
        .mtr__score { font-size: var(--text-4xl); font-weight: 800; margin-top: var(--space-2); }
        .mtr__score-raw { font-size: var(--text-lg); font-weight: 400; color: var(--text-muted); margin-left: var(--space-2); }
        .mtr__label { font-size: var(--text-sm); color: var(--text-muted); margin-top: var(--space-2); }
        .mtr__label-desc { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1); }
        .mtr__bar { display: flex; gap: var(--space-1); margin-top: var(--space-5); border-radius: var(--radius-md); overflow: hidden; }
        .mtr__bar-level { flex: 1; padding: var(--space-2) var(--space-1); text-align: center; font-size: var(--text-2xs); font-weight: 700; color: var(--on-dark); position: relative; transition: transform var(--transition-base); }
        .mtr__bar-level--active { transform: scaleY(1.15); box-shadow: 0 -2px 8px rgba(0,0,0,0.2); z-index: 1; }
        .mtr__bar-label { display: block; font-size: var(--text-xs); }
        .mtr__bar-desc { display: block; font-size: 0.55rem; opacity: 0.85; margin-top: 2px; }
        .mtr__target { margin-top: var(--space-4); padding: var(--space-3); background: var(--primary-light); border-radius: var(--radius-md); text-align: center; }
        .mtr__message { border-radius: var(--radius-md); padding: var(--space-4) var(--space-5); margin: 0 var(--space-6) var(--space-5); font-size: var(--text-sm); line-height: 1.6; }
        .mtr__skills { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); padding: 0 var(--space-6) var(--space-5); }
        .mtr__actions { padding: 0 var(--space-6) var(--space-5); }
        .mtr__actions-title { font-size: var(--text-xl); margin: 0 0 var(--space-4); font-weight: 700; }
        .mtr__btn { display: block; width: calc(100% - var(--space-12)); margin: 0 var(--space-6) var(--space-6); }
        @media (max-width: 600px) {
          .mtr__skills { grid-template-columns: 1fr; }
          .mtr__badge { font-size: var(--text-2xl); padding: var(--space-2) var(--space-6); }
          .mtr__bar-desc { display: none; }
        }
      `})]})}function fe({label:a,score:t,scaled:r,pct:s,cefr:n}){if(!t)return null;const l=se(n);return e.jsxs("div",{className:"mtr__skill card",children:[e.jsxs("div",{className:"mtr__skill-header",children:[e.jsx("span",{children:a}),e.jsx("span",{className:"pill mtr__skill-badge",style:{background:l},children:n})]}),e.jsxs("div",{className:"mtr__skill-score",children:[r," / 80 ",e.jsxs("span",{className:"mtr__score-raw",children:["(",t.total," / ",t.max," raw)"]})]}),e.jsx("div",{className:"progress-bar mtr__skill-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${s}%`,background:l}})}),e.jsx("p",{className:"mtr__skill-desc",children:Ve(n)||""})]})}function Q({priority:a,label:t,children:r}){const s={high:"pill-danger",medium:"pill-warning",low:"pill-success"};return e.jsxs("div",{className:"mtr__action-item",children:[e.jsx("span",{className:`pill ${s[a]||"pill-default"} mtr__action-priority`,children:t}),e.jsx("div",{className:"mtr__action-text",children:r})]})}const xe={"mock-test-1":{data:be,storagePrefix:"met:mock1"},"mock-test-2":{data:_e,storagePrefix:"met:mock2"}},Y={reading:{PART1:Ue,PART2:Be,PART3:De},listening:{PART1:Oe,PART2:$e,PART3:Le},speaking:{TASKS:Me},writing:{TASKS:dt}};function At({sections:a,completedSections:t,onStart:r,onBack:s,title:n}){const l={book:e.jsx(I.book,{size:28}),headphones:e.jsx(I.headphones,{size:28}),mic:e.jsx(I.mic,{size:28}),edit:e.jsx(I.edit,{size:28})};return e.jsxs(F.div,{className:"mte-home",initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.4,ease:[.22,1,.36,1]},children:[e.jsxs("div",{className:"mte-home__header",children:[e.jsxs(L,{variant:"ghost",size:"sm",onClick:s,className:"mte-home__back",children:[e.jsx(I.arrowLeft,{size:14})," Back to Dashboard"]}),e.jsx("h2",{className:"mte-home__title",children:n}),e.jsx("p",{className:"mte-home__sub",children:"Complete all sections to finalize your mock exam. Each section is timed separately."})]}),e.jsx("div",{className:"mte-home__grid",children:a.map((c,b)=>{const h=t[c.id];return e.jsxs(F.button,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:b*.1,duration:.4,ease:[.22,1,.36,1]},className:`mte-home__card ${h?"mte-home__card--done":""}`,onClick:()=>!h&&r(c.id),disabled:h,whileHover:h?{}:{scale:1.02,y:-4},whileTap:h?{}:{scale:.98},children:[e.jsx("div",{className:"mte-home__card-icon","aria-hidden":"true",children:l[c.icon]||e.jsx(I.book,{size:28})}),e.jsx("div",{className:"mte-home__card-name",children:c.label}),e.jsxs("div",{className:"mte-home__card-time",children:[Math.floor(c.time/60)," min"]}),h&&e.jsx("div",{className:"mte-home__card-check","aria-label":"Completed",children:e.jsx(I.check,{size:20})})]},c.id)})})]})}function Et({student:a,onBack:t,testId:r="mock-test-1"}){const s=xe[r]||xe["mock-test-1"],{data:n,storagePrefix:l}=s,[c,b]=i.useState("home"),[h,x]=i.useState(null),[o,p]=i.useState(null),[w,k]=i.useState(!0),j=i.useMemo(()=>new lt,[]);i.useEffect(()=>{let m=!0;async function g(){try{const d=await j.startMockTest(a.id,r);m&&p({sections:n.sections,completedSections:{},answers:{},mockTestId:d.id,isAllDone:()=>!1,startSection:f=>n.sections.find(v=>v.id===f)})}catch(d){console.error("Failed to initialize mock test engine",d)}finally{m&&k(!1)}}return g(),()=>{m=!1}},[a.id,j,r]);const R=i.useCallback(m=>{const g=o.startSection(m);x(g),b("section")},[o]),C=i.useCallback(async(m,g)=>{try{const d=n.sections[n.sections.length-1];if(m===d.id){const f={...o.answers,...g},v=await j.submitMockTest(o.mockTestId,f);p(S=>({...S,answers:f,completedSections:{...S.completedSections,[m]:!0},isAllDone:()=>!0})),b("thanks")}else p(f=>({...f,completedSections:{...f.completedSections,[m]:!0},answers:{...f.answers,...g}})),b("home"),x(null)}catch(d){console.error("Failed to complete section",d)}},[o,j,n]);if(w)return e.jsxs("div",{className:"mte-loading",role:"status","aria-label":"Loading test",children:[e.jsx("div",{className:"skeleton-card"}),e.jsx("div",{className:"skeleton-text-short"}),e.jsx("div",{className:"skeleton-text-short",style:{width:"40%"}}),e.jsx("p",{className:"mte-loading__text","aria-live":"polite",children:"Loading your mock test..."})]});if(!o)return e.jsxs("div",{className:"mte-error",role:"alert",children:[e.jsx("div",{className:"mte-error__icon","aria-hidden":"true",children:e.jsx(I.warning,{size:32})}),e.jsx("h3",{className:"mte-error__title",children:"Unable to Load Test"}),e.jsx("p",{className:"mte-error__message",children:"We couldn't load your mock test session. This might be a temporary connection issue."}),e.jsx(L,{variant:"primary",onClick:()=>window.location.reload(),children:"Reload Page"})]});const u=m=>{const g=r==="mock-test-2",d=f=>C(m.id,f);switch(m.id){case"reading":return e.jsx(ht,{onComplete:d,readingData:g?Y.reading:void 0});case"listening":return e.jsx(St,{onComplete:d,listeningData:g?Y.listening:void 0});case"speaking":return e.jsx(Nt,{student:a,onComplete:d,speakingData:g?Y.speaking:void 0});case"writing":return e.jsx(Tt,{onComplete:d,writingData:g?Y.writing:void 0});default:return null}};return e.jsxs("div",{className:"mte",children:[e.jsx("style",{children:`
        .mte-home {
          max-width: 880px;
          margin: 0 auto;
          padding: var(--space-7) var(--space-5);
        }
        .mte-home__header {
          margin-bottom: var(--space-7);
        }
        .mte-home__back {
          margin-bottom: var(--space-4);
        }
        .mte-home__title {
          margin: 0 0 var(--space-2);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.01em;
        }
        .mte-home__sub {
          margin: 0;
          color: var(--text-2);
          font-size: var(--text-base);
          line-height: 1.6;
          max-width: 540px;
        }
        .mte-home__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--space-4);
        }
        .mte-home__card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-7) var(--space-4);
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          color: var(--text);
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          text-align: center;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
          min-height: 44px;
          position: relative;
        }
        .mte-home__card:hover:not(:disabled):not(.mte-home__card--done) {
          border-color: var(--accent);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .mte-home__card:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          border-color: var(--accent);
        }
        .mte-home__card--done {
          cursor: default;
          opacity: 0.7;
          background: var(--bg);
          border-style: dashed;
        }
        .mte-home__card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--accent-subtle);
          color: var(--accent);
          flex-shrink: 0;
        }
        .mte-home__card--done .mte-home__card-icon {
          background: var(--success-subtle);
          color: var(--success);
        }
        .mte-home__card-name {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text);
        }
        .mte-home__card-time {
          font-size: var(--text-xs);
          color: var(--muted);
          font-weight: 500;
        }
        .mte-home__card-check {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--success);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mte-loading,
        .mte-error {
          max-width: 420px;
          margin: var(--space-12) auto;
          padding: var(--space-7) var(--space-5);
          text-align: center;
        }
        .mte-error {
          color: var(--text-2);
        }
        .mte-error__icon {
          color: var(--danger);
          margin-bottom: var(--space-4);
          display: flex;
          justify-content: center;
        }
        .mte-error__title {
          margin: 0 0 var(--space-2);
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--primary);
        }
        .mte-error__message {
          margin: 0 0 var(--space-5);
          line-height: 1.6;
          font-size: var(--text-sm);
        }
        .mte-loading__text {
          margin-top: var(--space-4);
          color: var(--muted);
          font-size: var(--text-sm);
        }
        @media (max-width: 640px) {
          .mte-home {
            padding: var(--space-5) var(--space-4);
          }
          .mte-home__title {
            font-size: var(--text-2xl);
          }
          .mte-home__grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-2);
          }
          .mte-home__card {
            padding: var(--space-5) var(--space-3);
          }
          .mte-home__card-name {
            font-size: var(--text-sm);
          }
        }
        @media (max-width: 380px) {
          .mte-home__grid {
            grid-template-columns: 1fr;
          }
        }
      `}),e.jsxs(Ie,{mode:"wait",children:[c==="home"&&!o.isAllDone()&&e.jsx(F.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:e.jsx(At,{sections:n.sections,completedSections:o.completedSections,onStart:R,onBack:t,title:n.title})},"home"),c==="home"&&o.isAllDone()&&e.jsx(F.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:e.jsx(ge,{answers:o.answers,student:a,onBack:t,testId:r})},"thanks-home"),c==="section"&&h&&e.jsx(F.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:e.jsx(ut,{section:h,timerRunning:c==="section",onComplete:C,onBack:()=>b("home"),student:a,children:u(h)})},"section"),c==="thanks"&&e.jsx(F.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:e.jsx(ge,{answers:o.answers,student:a,onBack:t,testId:r})},"thanks")]})]})}const Ne="vv:mock_test_1_unlocked",Te="vv:mock_test_2_unlocked";function Rt(){try{localStorage.setItem("met:spa:origin",window.location.origin)}catch{}window.open("/mock-test-2/sections/mock-home.html","_blank")}function ve(a){try{return localStorage.getItem(a)==="1"}catch{return!1}}function Ct(a,t){try{t&&localStorage.setItem(a,"1")}catch{}}const It=[{id:"mock-test-1",title:"MET Mock Test 1",subtitle:"Full-length practice exam · ~2 h 35 min",sections:[{label:"Reading & Grammar",time:"65 min"},{label:"Listening",time:"35 min"},{label:"Speaking",time:"10 min"},{label:"Writing",time:"45 min"}],description:"Complete MET practice exam covering all four competencies.",unlockKey:Ne},{id:"mock-test-2",title:"MET Mock Test 2",subtitle:"Full-length practice exam · ~2 h 35 min",sections:[{label:"Reading & Grammar",time:"65 min"},{label:"Listening",time:"35 min"},{label:"Speaking",time:"10 min"},{label:"Writing",time:"45 min"}],description:"Second full-length MET practice exam with updated content and new question sets.",unlockKey:Te}];function Ft({student:a,students:t,onNavigate:r,auth:s,"data-testid":n}){const[l,c]=i.useState(a||null),[b,h]=i.useState(null),[x,o]=i.useState([]),[p,w]=i.useState(ve(Ne)),[k,j]=i.useState(()=>ve(Te)||s?.role==="teacher"),R=!!s&&s.role==="teacher",C=b&&(b.id==="mock-test-1"?p:k);return i.useEffect(()=>{const u=l?.id||l?.local_id;u&&Re(u).then(o).catch(m=>console.warn("[mock-test] failed to load results:",m))},[l]),i.useEffect(()=>{const u=l?.id||l?.local_id;!u||R||Ce("assignments").then(m=>{const g=(m||[]).filter(d=>d.student_id===u);g.some(d=>d.mock_test_id==="mock-test-1")&&w(!0),g.some(d=>d.mock_test_id==="mock-test-2")&&j(!0)}).catch(m=>console.warn("[mock-test] failed to check assignments:",m))},[l,R]),!l&&Array.isArray(t)&&t.length>0?e.jsxs("div",{className:"page-shell","data-testid":n,children:[e.jsx(me,{title:"Mock Tests",sub:"Select a student to take or review a mock test"}),e.jsx("div",{className:"stack-list",style:{marginTop:"var(--space-4)"},children:t.map(u=>e.jsx(de,{style:{cursor:"pointer"},onClick:()=>c(u),children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"var(--space-3)"},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:"50%",background:"var(--primary)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0},children:(u.name||"?")[0].toUpperCase()}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:600,fontSize:"var(--text-sm)"},children:u.name}),e.jsxs("div",{style:{fontSize:"var(--text-xs)",color:"var(--muted)"},children:[u.currentLevel," → ",u.targetLevel]})]})]})},u.id))})]}):C?e.jsx(Et,{student:l,onBack:()=>h(null),testId:b.id}):e.jsxs("div",{className:"page-shell",children:[e.jsxs("div",{className:"flex-between",style:{marginBottom:"var(--space-3)"},children:[e.jsxs(L,{variant:"ghost",size:"sm",onClick:()=>c(null),children:[e.jsx(I.chevronLeft,{size:14})," Back to students"]}),r&&e.jsx(L,{variant:"ghost",size:"sm",onClick:()=>r("mock-test-results"),children:"All results"})]}),e.jsx("div",{className:"hero-section",style:{marginBottom:"var(--space-5)"},children:e.jsx(me,{title:"Mock Tests",subtitle:`Full-length MET practice exams · ${l?.name||""}`})}),e.jsx("div",{className:"split-grid",style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:"var(--space-4)"},children:It.map(u=>{const m=u.id==="mock-test-1"?p:k,g=u.id==="mock-test-1"?w:j;return e.jsxs(de,{className:"card-p-5 mock-test-card",style:{display:"flex",flexDirection:"column",gap:"var(--space-3)"},children:[e.jsxs("div",{style:{display:"flex",gap:"var(--space-2)"},children:[e.jsx(I.practice,{size:24}),e.jsxs("div",{children:[e.jsx("div",{className:"row-title",children:u.title}),e.jsx("div",{className:"row-sub",children:u.subtitle})]})]}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"var(--space-1)"},children:u.sections.map((d,f)=>e.jsxs("span",{className:"pill pill--accent",children:[d.label," (",d.time,")"]},f))}),e.jsx("p",{className:"text-sm text-muted",style:{lineHeight:1.6},children:u.description}),m?e.jsxs("div",{style:{display:"flex",gap:"var(--space-2)"},children:[e.jsxs(L,{variant:"primary",onClick:()=>h(u),children:[e.jsx(I.practice,{size:14})," Start ",u.title]}),u.id==="mock-test-2"&&e.jsxs(L,{variant:"ghost",size:"sm",onClick:Rt,title:"Opens in a new window",children:[e.jsx(I.arrowL,{size:14})," Open standalone"]})]}):e.jsxs("div",{className:"mock-locked",children:[e.jsxs("div",{className:"mock-locked__head",children:[e.jsx("span",{className:"mock-locked__icon","aria-hidden":"true",children:e.jsx(I.lock,{size:18,color:"var(--warning)"})}),e.jsx("div",{className:"mock-locked__title",children:"Locked"})]}),e.jsxs("p",{className:"text-sm text-muted mock-locked__body",children:[u.title," is locked by default. ",R?"You can unlock it for your students from this page.":"Ask your teacher to unlock it before you start."]}),e.jsx("div",{className:"mock-locked__actions",children:R?e.jsxs(L,{variant:"primary",size:"sm",onClick:()=>{Ct(u.unlockKey,!0),g(!0),window.toast?.(`${u.title} unlocked.`,"ok")},children:[e.jsx(I.lock,{size:14})," Unlock ",u.title]}):e.jsx("span",{className:"pill pill--warning",children:"Locked — teacher access required"})})]})]},u.id)})}),x.length>0&&e.jsxs("div",{className:"mtr-student",style:{maxWidth:720,margin:"24px auto 0",padding:"0 20px"},children:[e.jsx("h3",{className:"mtr-student__title",children:"Past Results"}),e.jsx("div",{className:"mtr-student__list",children:x.map(u=>{const m=u.scores?.reading?.total+u.scores?.listening?.total||0,g=u.scores?.reading?.max+u.scores?.listening?.max||0,d=g>0?Math.round(m/g*100):0;return e.jsxs("div",{className:"mtr-student__row",children:[e.jsx("span",{className:"mtr-student__date",children:new Date(u.submittedAt).toLocaleDateString()}),e.jsxs("span",{className:"mtr-student__score",children:[m,"/",g," (",d,"%)"]}),u.cefr&&e.jsx("span",{className:"mtr-student__cefr",style:{background:se(u.cefr)},children:u.cefr})]},u.id)})})]}),e.jsx("style",{children:`
        .mtr-student__title { font-size: 16px; font-weight: 700; color: var(--text); margin: 0 0 12px; }
        .mtr-student__list { display: flex; flex-direction: column; gap: 6px; }
        .mtr-student__row { display: flex; align-items: center; gap: 16px; padding: 10px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 14px; }
        .mtr-student__date { color: var(--text-muted); min-width: 90px; }
        .mtr-student__score { font-weight: 600; color: var(--text); flex: 1; }
        .mtr-student__cefr { padding: 2px 10px; border-radius: 999px; color: #fff; font-weight: 700; font-size: 11px; }
      `})]})}export{Ft as default};
