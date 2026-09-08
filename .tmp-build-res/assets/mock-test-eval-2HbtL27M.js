import{r as x,j as t}from"./vendor-react-_P-FXV2G.js";import{c as I}from"./callAI-zULIfRJA.js";import{R as j,a as C,b as E,L as S,c as W,d as A,h as P}from"./index-aYO6x_d-.js";import{S as z,W as m}from"./writing-CvfQg0nO.js";const R=[{id:"reading",label:"Reading & Grammar",color:"var(--section-reading)"},{id:"listening",label:"Listening",color:"var(--section-listening)"},{id:"speaking",label:"Speaking",color:"var(--section-speaking)"},{id:"writing",label:"Writing",color:"var(--section-writing)"}];function y(s){if(s==="reading"){const e=[];return e.push({part:"Part 1 — Grammar",questions:j.questions,data:j}),C.passages.forEach((a,i)=>{e.push({part:`Part 2 — ${a.title}`,questions:a.questions,data:{passage:a.text,title:a.title}})}),E.textSets.forEach((a,i)=>{e.push({part:`Part 3 — ${a.title}`,questions:a.questions,data:{texts:a.texts,title:a.title}})}),e}if(s==="listening"){const e=[];return e.push({part:"Part 1 — Short Conversations",questions:S.questions,data:S}),W.conversations.forEach((a,i)=>{e.push({part:`Part 2 — ${a.title}`,questions:a.questions,data:{audio:a.audio,title:a.title}})}),A.talks.forEach((a,i)=>{e.push({part:`Part 3 — ${a.title}`,questions:a.questions,data:{audio:a.audio,title:a.title}})}),e}if(s==="speaking")return z.map(e=>({part:`Task ${e.id} — ${e.label.replace(/^Task \d+ — /,"")}`,questions:[e],data:e}));if(s==="writing"){const e=[];return e.push({part:m.task1.label,questions:m.task1.questions.map(a=>({...a,instruction:m.task1.instructions})),data:m.task1}),e.push({part:m.task2.label,questions:[{id:"w4",prompt:m.task2.prompt,instruction:m.task2.instructions,rows:m.task2.rows}],data:m.task2}),e}return[]}function B(s){return s.text?s.text:s.prompt?s.prompt:s.id?.startsWith("w")&&(s.prompt||s.text)||""}function _(s,e,a){const i=s==="reading"||s==="listening"?P(e.type,e.level):"—",l=e.answer!==void 0?String.fromCharCode(65+e.answer):"—",n=e.options?.[e.answer]||"—";return[`You are a MET assessment expert. Analyze this ${s} test question for a teacher to discuss in class.`,"","## Question Metadata",`- ID: ${e.id}`,e.type?`- Type: ${e.type}`:null,e.level?`- Level: ${e.level}`:null,i!=="—"?`- Points: ${i}`:null,e.options?`- Correct answer: ${l}. ${n}`:null,"",e.options?`## Options
${e.options.map((d,h)=>`${String.fromCharCode(65+h)}. ${d}`).join(`
`)}`:null,"",a||"","","## Required Analysis","1. **What it tests** — What specific skill, concept, or ability does this question measure?",e.type==="grammar"?"2. **Grammar concept** — Which grammatical structure is being tested? Is this B1 or B2 appropriate?":null,e.type==="main_idea"?"2. **Gist identification** — How does this test the ability to identify main ideas vs. supporting details?":null,e.type==="detail"?"2. **Detail retrieval** — Is this a straightforward retrieval or does it require careful reading/listening?":null,e.type==="inference"?"2. **Inference demand** — What must the student infer? Is this genuinely inferential or could a student answer from surface-level comprehension?":null,e.options?"3. **Distractor quality** — Rate each distractor: (a) plausible but wrong, (b) too easy to eliminate, (c) ambiguous or problematic.":null,e.options?"4. **Distractor analysis table** — Create a table with columns: Option | Label (Plausible/Too Easy/Ambiguous) | Why":null,e.options?`5. **Correct answer justification** — Why is ${l} correct? What reasoning should a student use to arrive at the right answer?`:null,"6. **Difficulty assessment** — Is this question appropriately leveled? Would you classify it as B1, B2, or C1? Why?","7. **Classroom discussion point** — What would be an interesting question to ask students about this item in class?","8. **Common misconception** — What error might students make on this question? What would lead them to pick a wrong distractor?"].filter(Boolean).join(`
`)}function $(){return t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"24px 0",color:"var(--text-muted)"},children:[t.jsx("span",{className:"spinner"}),t.jsx("span",{children:"Generating evaluation..."})]})}function G({type:s,level:e}){const a={grammar:"var(--type-grammar)",main_idea:"var(--type-main-idea)",detail:"var(--purple)",inference:"var(--error)"},i={b1:"var(--level-b1)",b2:"var(--level-b2)"};return t.jsxs("span",{style:{display:"inline-flex",gap:4,alignItems:"center"},children:[s&&t.jsx("span",{style:{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",padding:"1px 7px",borderRadius:99,background:`${a[s]||"#6B7C80"}1a`,color:a[s]||"#6B7C80",border:`1px solid ${a[s]||"#6B7C80"}33`},children:s}),e&&t.jsx("span",{style:{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",padding:"1px 7px",borderRadius:99,background:`${i[e]||"#6B7C80"}1a`,color:i[e]||"#6B7C80",border:`1px solid ${i[e]||"#6B7C80"}33`},children:e})]})}function D(s){if(!s)return null;const a=(typeof s=="string"?s:s.text||s.content?.[0]?.text||"").split(`
`).filter(n=>n.trim()),i=[];let l=null;for(const n of a)/^\*\*/.test(n)||/^\d+\./.test(n)||/^###/.test(n)?(l&&i.push(l),l={heading:n.replace(/^\*+|\*+$/g,"").replace(/^###\s*/,"").trim(),body:[]}):l?l.body.push(n):i.push({heading:"",body:[n]});return l&&i.push(l),t.jsx("div",{style:{lineHeight:1.7,fontSize:"var(--text-sm)"},children:i.map((n,f)=>t.jsxs("div",{style:{marginBottom:12},children:[n.heading&&t.jsx("h4",{style:{fontSize:"var(--text-sm)",fontWeight:700,margin:"0 0 4px 0",color:"var(--text)"},children:n.heading}),n.body.map((d,h)=>d.startsWith("|")&&d.endsWith("|")?t.jsx("code",{style:{display:"block",fontSize:11,whiteSpace:"pre",overflow:"auto",padding:"2px 0"},children:d},h):t.jsx("p",{style:{margin:"2px 0"},children:d},h))]},f))})}function O({"data-testid":s}){const[e,a]=x.useState("reading"),[i,l]=x.useState(null),[n,f]=x.useState({}),[d,h]=x.useState(null),b=x.useRef(null),w=y(e);x.useEffect(()=>{l(null),f({})},[e]),x.useEffect(()=>{b.current&&b.current.scrollIntoView({behavior:"smooth",block:"start"})},[n]);const k=x.useCallback(async r=>{if(l(r.id),n[r.id])return;h(r.id);let c="";if(e==="reading")for(const o of y("reading")){const g=o.questions.find(u=>u.id===r.id);g&&o.data?.passage?c=`## Context Passage
> ${o.data.passage}`:g&&o.data?.texts&&(c=`## Context Texts
${o.data.texts.map(u=>`> **${u.label}:** ${u.title}
> ${u.text}`).join(`

`)}`)}if(e==="listening")for(const o of y("listening"))o.questions.find(u=>u.id===r.id)&&o.data?.audio&&(c=`- Audio source: ${o.data.audio}
- This is part of "${o.data.title}"`);e==="speaking"&&(c=`- Preparation time: ${r.prepSeconds}s
- Speaking time: ${r.speakSeconds}s
- Task type: ${r.type}
- Part: ${r.part}`),e==="writing"&&(c=r.instruction?`- Instructions: ${r.instruction}`:"");const p=_(e,r,c),v="You are a MET (Michigan English Test) assessment specialist and teacher trainer. Your task is to analyze individual test questions for a teacher who will discuss them in class. Be specific, reference the actual content of the question, and avoid generic statements. Write in clear, professional English. Format the response with markdown section headers (no code blocks — just plain markdown). Include a distractor analysis table where applicable. Keep it under 500 words.";try{const o=await I(p,{system:v,temperature:.4,max_tokens:2048}),g=o?.content?.[0]?.text||o?.text||"";f(u=>({...u,[r.id]:g}))}catch(o){f(g=>({...g,[r.id]:`⚠️ Evaluation failed: ${o.message}`}))}h(null)},[e,n]),N=w.reduce((r,c)=>r+c.questions.length,0),T=Object.keys(n).length;return t.jsxs("div",{className:"mte-page","data-testid":s,children:[t.jsx("style",{children:`
        .mte-page {
          padding: var(--space-4);
          max-width: 1280px;
          margin: 0 auto;
        }
        .mte-header {
          margin-bottom: var(--space-4);
        }
        .mte-header h1 {
          font-size: var(--text-2xl);
          font-weight: 800;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }
        .mte-header p {
          margin: 0;
          color: var(--text-muted);
          font-size: var(--text-sm);
        }
        .mte-section-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }
        .mte-section-tab {
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: 600;
           transition: background-color, border-color, color, opacity, transform 0.15s;
        }
        .mte-section-tab:hover {
          border-color: var(--accent);
          background: var(--accent-subtle);
        }
        .mte-section-tab--active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }
        .mte-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          align-items: start;
        }
        .mte-questions-panel {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          overflow: hidden;
        }
        .mte-panel-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mte-eval-panel {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          overflow: hidden;
          position: sticky;
          top: var(--space-4);
        }
        .mte-eval-empty {
          padding: 40px 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: var(--text-sm);
        }
        .mte-eval-empty-icon {
          font-size: 2rem;
          margin-bottom: 8px;
          opacity: 0.4;
        }
        .mte-eval-content {
          padding: 16px 20px;
          max-height: 70vh;
          overflow-y: auto;
        }
        .mte-part-group {
          border-bottom: 1px solid var(--border);
        }
        .mte-part-group:last-child {
          border-bottom: none;
        }
        .mte-part-header {
          padding: 10px 16px;
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }
        .mte-question-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 16px;
          cursor: pointer;
          transition: background 0.1s;
          border-bottom: 1px solid var(--border);
        }
        .mte-question-row:last-child {
          border-bottom: none;
        }
        .mte-question-row:hover {
          background: var(--accent-subtle);
        }
        .mte-question-row--selected {
          background: var(--accent-subtle);
           border: 1px solid var(--accent);
        }
        .mte-question-id {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-muted);
          min-width: 44px;
          flex-shrink: 0;
          padding-top: 1px;
        }
        .mte-question-body {
          flex: 1;
          min-width: 0;
        }
        .mte-question-text {
          font-size: var(--text-sm);
          line-height: 1.5;
          color: var(--text);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .mte-question-meta {
          display: flex;
          gap: 6px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .mte-eval-loading {
          padding: 24px;
        }
        .mte-progress {
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-weight: 400;
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 860px) {
          .mte-layout {
            grid-template-columns: 1fr;
          }
          .mte-eval-panel {
            position: static;
          }
        }
      `}),t.jsxs("div",{className:"mte-header",children:[t.jsx("h1",{children:"Mock Test Question Evaluator"}),t.jsx("p",{children:"Select a question to get AI-powered analysis for classroom discussion"})]}),t.jsx("div",{className:"mte-section-tabs",children:R.map(r=>t.jsx("button",{className:`mte-section-tab${e===r.id?" mte-section-tab--active":""}`,onClick:()=>a(r.id),children:r.label},r.id))}),t.jsxs("div",{className:"mte-layout",children:[t.jsxs("div",{className:"mte-questions-panel",children:[t.jsxs("div",{className:"mte-panel-header",children:[t.jsxs("span",{children:["Questions (",N,")"]}),t.jsxs("span",{className:"mte-progress",children:[T," evaluated"]})]}),w.map((r,c)=>t.jsxs("div",{className:"mte-part-group",children:[t.jsx("div",{className:"mte-part-header",children:r.part}),r.questions.map(p=>t.jsxs("div",{className:`mte-question-row${i===p.id?" mte-question-row--selected":""}`,onClick:()=>k(p),role:"button",tabIndex:0,onKeyDown:v=>(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),k(p)),children:[t.jsx("div",{className:"mte-question-id",children:p.id}),t.jsxs("div",{className:"mte-question-body",children:[t.jsx("div",{className:"mte-question-text",children:B(p)}),t.jsx("div",{className:"mte-question-meta",children:t.jsx(G,{type:p.type,level:p.level})})]})]},p.id))]},c))]}),t.jsxs("div",{className:"mte-eval-panel",ref:b,children:[!i&&t.jsxs("div",{className:"mte-eval-empty",children:[t.jsx("div",{className:"mte-eval-empty-icon",children:"🔍"}),t.jsx("div",{children:"Select a question to see AI evaluation"})]}),i&&d===i&&t.jsx("div",{className:"mte-eval-loading",children:t.jsx($,{})}),i&&d!==i&&n[i]&&t.jsxs("div",{className:"mte-eval-content",children:[t.jsxs("div",{style:{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsx("h3",{style:{margin:0,fontSize:"var(--text-base)",fontWeight:700},children:i}),t.jsx("span",{style:{fontSize:10,color:"var(--text-muted)",opacity:.6},children:"AI · MET Specialist"})]}),D(n[i])]}),i&&d!==i&&!n[i]&&t.jsx("div",{className:"mte-eval-loading",children:t.jsx($,{})})]})]})]})}export{O as default};
