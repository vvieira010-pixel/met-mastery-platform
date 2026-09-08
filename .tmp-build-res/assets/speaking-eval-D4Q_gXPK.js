import{r as o,j as e}from"./vendor-react-_P-FXV2G.js";import{I as k}from"./index-muOe086A.js";import{B as z}from"./Button-DdDnEr67.js";import{C as t}from"./Card-wrqTb42I.js";import{S as O}from"./SectionHeader-R_wqrk2J.js";const y=[{id:"mock-test-1",label:"Mock Test 1",tasks:[{id:"spk1",label:"Task 1 — Describe the Picture",prompt:"Describe the photo. Talk about what you see, the people, the setting, and what might be happening. You have 15 seconds to prepare and 60 seconds to speak.",type:"describe",time:"60s"},{id:"spk2",label:"Task 2 — Experience",prompt:"Talk about a time when you had to make a difficult decision. What was the situation? What did you decide? How did it turn out? You have 15 seconds to prepare and 60 seconds to speak.",type:"narrative",time:"60s"},{id:"spk3",label:"Task 3 — Opinion",prompt:"Some people believe that university education should be free for all students. Others think students should pay tuition fees. Which view do you support? Explain why. You have 15 seconds to prepare and 60 seconds to speak.",type:"opinion",time:"60s"},{id:"spk4",label:"Task 4 — Advantages and Disadvantages",prompt:"Our city is planning to ban private cars from the city center to reduce pollution and traffic. What are the advantages and disadvantages of this plan? You have 20 seconds to prepare and 90 seconds to speak.",type:"discuss",time:"90s"},{id:"spk5",label:"Task 5 — Persuade",prompt:"Your school is considering replacing traditional textbooks with tablets and digital materials entirely. I am the school principal. Convince me that this is or is not a good idea for our students. You have 20 seconds to prepare and 90 seconds to speak.",type:"persuade",time:"90s"}]},{id:"mock-test-2",label:"Mock Test 2",tasks:[{id:"spk1",label:"Task 1 — Personal Experience",prompt:"Describe a memorable celebration you attended. What was the occasion? Who was there? What made it special?",type:"narrative",time:"60s"},{id:"spk2",label:"Task 2 — Picture Description",prompt:"Look at the picture. Describe what you see in as much detail as possible. What are the people doing? What is the setting?",type:"describe",time:"60s"},{id:"spk3",label:"Task 3 — Opinion",prompt:"Some people think that schools should teach practical life skills like cooking and budgeting. Others believe schools should focus only on academic subjects. What is your opinion? Give reasons and examples.",type:"opinion",time:"60s"},{id:"spk4",label:"Task 4 — Problem Solving",prompt:"Your friend wants to study abroad but is worried about the cost and being far from family. What advice would you give? Explain your reasoning.",type:"discuss",time:"60s"},{id:"spk5",label:"Task 5 — Advantages and Disadvantages",prompt:"Many companies now allow employees to work from home. What are the advantages and disadvantages of remote work? Which do you think is better?",type:"discuss",time:"60s"}]}],w=[{id:"task",label:"Task Completion",desc:"Relevance to task, quantity of language, elaboration with supporting detail",max:4},{id:"language",label:"Language Resources",desc:"Vocabulary range/appropriacy, grammar accuracy and complexity, fluency",max:4},{id:"delivery",label:"Intelligibility / Delivery",desc:"Pronunciation, rhythm, hesitation, clarity",max:4}];function j(c){return{describe:"Picture Description",narrative:"Personal Narrative",opinion:"Opinion",discuss:"Discussion",persuade:"Persuasion"}[c]||c}function W({"data-testid":c}){const[d,N]=o.useState("mock-test-1"),[r,v]=o.useState(null),[l,T]=o.useState(""),[a,p]=o.useState(null),[n,b]=o.useState(!1),[x,f]=o.useState(null),m=y.find(s=>s.id===d)?.tasks||[],E=o.useCallback(async()=>{if(!(!r||!l.trim())){b(!0),f(null),p(null);try{const s=m.find(g=>g.id===r),i=`You are a MET (Michigan English Test) speaking examiner. Evaluate the following student response to a MET speaking task.

## Task Information
- Task type: ${j(s.type)}
- Time limit: ${s.time}
- Prompt: "${s.prompt}"

## Student Response (transcript)
"${l.trim()}"

## Evaluation Criteria (MET Speaking Rating Scale)

Score each criterion 0–4 using the MET official rubric:

### 1. Task Completion (0–4)
- 4: fully relevant, extensive supporting detail
- 3: relevant, completes task, general detail only
- 2: mostly relevant, some difficulty completing task
- 1: short/simple, difficulty completing task
- 0: no response or completely irrelevant

### 2. Language Resources (0–4)
- 4: complex grammar controlled, broad appropriate vocab, errors infrequent and not distracting
- 3: some complex structures, appropriate vocab, no errors causing misunderstanding
- 2: simple patterns generally controlled, noticeable errors but intended meaning clear
- 1: simple/short sentences, basic grammar/vocab errors, limited range
- 0: insufficient language to produce meaningful response

### 3. Intelligibility / Delivery (0–4)
- 4: smooth delivery, minimal hesitation, clear and easy to understand
- 3: some hesitation, generally clear, only a few individual words unclear
- 2: sometimes hesitant, pauses/reformulations, listener effort required in stretches
- 1: frequent pauses, false starts, reformulations, speech requires significant listener effort
- 0: not comprehensible even to a sympathetic listener

## Output Format

Return ONLY valid JSON with this structure (no markdown, no code fences):
{
  "scores": { "task": 0, "language": 0, "delivery": 0 },
  "overallScore": 0,
  "cefrEstimate": "B1/B2/C1",
  "rationale": { "task": "...", "language": "...", "delivery": "..." },
  "corrections": [
    { "original": "what student said wrong", "corrected": "correction", "explanation": "why this is an error" }
  ],
  "feedback": "Overall feedback for the student (2-3 sentences)",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}

IMPORTANT: overallScore is the sum of all three criterion scores (out of 12). BE HONEST and accurate in your assessment.`,u=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:i,system:"You are a MET speaking examiner. Evaluate student responses strictly against the official MET rubric. Return only valid JSON.",temperature:.3,max_tokens:2048})});if(!u.ok){const g=await u.json().catch(()=>({}));throw new Error(g?.error?.message||`API error (${u.status})`)}const h=await u.json(),S=h?.content?.[0]?.text||h?.text||h?.response||"",_=JSON.parse(S.replace(/```(?:json)?\s*|\s*```/g,"").trim());p(_)}catch(s){f(s.message)}finally{b(!1)}}},[r,d,l,m]);return e.jsxs("div",{className:"page-shell","data-testid":c,children:[e.jsx(O,{title:"MET Speaking Evaluator",sub:"Select a speaking task, paste a student transcript, and get AI evaluation against MET rubrics"}),e.jsxs("div",{className:"se-layout",children:[e.jsxs("div",{className:"se-left",children:[e.jsx(t,{className:"mb-4",children:e.jsxs("div",{style:{padding:"var(--space-4)"},children:[e.jsx("h3",{className:"section-title",style:{marginBottom:12},children:"1. Select Test & Task"}),e.jsx("div",{style:{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"},children:y.map(s=>e.jsx("button",{className:`se-tab${d===s.id?" se-tab--active":""}`,onClick:()=>{N(s.id),v(null),p(null)},children:s.label},s.id))}),e.jsx("div",{className:"se-task-list",children:m.map(s=>e.jsxs("button",{className:`se-task-row${r===s.id?" se-task-row--selected":""}`,onClick:()=>{v(s.id),p(null)},children:[e.jsxs("div",{className:"se-task-row__head",children:[e.jsx("span",{className:"se-task-row__label",children:s.label}),e.jsxs("span",{className:"se-task-row__meta",children:[e.jsx("span",{className:"pill pill--accent",children:j(s.type)}),e.jsx("span",{className:"pill pill--time",children:s.time})]})]}),e.jsx("p",{className:"se-task-row__prompt",children:s.prompt})]},s.id))})]})}),e.jsx(t,{children:e.jsxs("div",{style:{padding:"var(--space-4)"},children:[e.jsx("h3",{className:"section-title",style:{marginBottom:12},children:"2. Student Transcript"}),e.jsx("textarea",{className:"input se-textarea",rows:8,value:l,onChange:s=>T(s.target.value),placeholder:"Paste the student's spoken response as a transcript...",disabled:n}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12},children:[e.jsx("span",{className:"text-xs text-muted",children:r?`Evaluating: ${m.find(s=>s.id===r)?.label}`:"Select a task first"}),e.jsx(z,{variant:"primary",onClick:E,disabled:!r||!l.trim()||n,children:n?"Evaluating...":"Evaluate Response"})]})]})})]}),e.jsxs("div",{className:"se-right",children:[!a&&!n&&!x&&e.jsx(t,{children:e.jsxs("div",{className:"se-empty",children:[e.jsx("div",{className:"se-empty-icon",children:e.jsx(k.mic,{size:32})}),e.jsx("h3",{children:"No evaluation yet"}),e.jsx("p",{children:'Select a task, paste a student transcript, and click "Evaluate Response"'}),e.jsxs("div",{className:"se-rubric-preview",children:[e.jsx("strong",{children:"MET Speaking Rubric"}),w.map(s=>e.jsxs("div",{className:"se-rubric-item",children:[e.jsx("span",{className:"se-rubric-label",children:s.label}),e.jsx("span",{className:"se-rubric-desc",children:s.desc}),e.jsxs("span",{className:"se-rubric-max",children:[s.max,"/4"]})]},s.id))]})]})}),n&&e.jsx(t,{children:e.jsxs("div",{className:"se-loading",children:[e.jsx("span",{className:"spinner"}),e.jsx("span",{children:"Evaluating against MET rubric..."})]})}),x&&e.jsx(t,{children:e.jsxs("div",{className:"se-error",children:[e.jsx(k.warning,{size:16}),"Evaluation failed: ",x]})}),a&&!n&&e.jsxs("div",{className:"se-results",children:[e.jsx(t,{className:"mb-4",style:{border:"2px solid var(--accent)"},children:e.jsxs("div",{style:{padding:"var(--space-4)"},children:[e.jsxs("div",{className:"flex items-center gap-2",style:{marginBottom:16},children:[e.jsx("div",{className:"se-badge",children:"AI EVALUATION"}),e.jsx("h3",{className:"section-title",style:{margin:0},children:"Speaking Scores"})]}),e.jsxs("div",{className:"se-score-grid",children:[e.jsxs("div",{className:"se-score-card se-score-card--total",children:[e.jsxs("span",{className:"se-score-value",children:[a.overallScore,"/12"]}),e.jsx("span",{className:"se-score-label",children:"Overall"}),a.cefrEstimate&&e.jsx("span",{className:"se-cefr",children:a.cefrEstimate})]}),w.map(s=>e.jsxs("div",{className:"se-score-card",children:[e.jsxs("span",{className:"se-score-value",children:[a.scores?.[s.id]??"?","/4"]}),e.jsx("span",{className:"se-score-label",children:s.label}),e.jsx("p",{className:"se-rationale",children:a.rationale?.[s.id]||""})]},s.id))]})]})}),a.strengths?.length>0&&e.jsx(t,{className:"mb-4",children:e.jsxs("div",{style:{padding:"var(--space-4)"},children:[e.jsx("h4",{className:"section-title",style:{marginBottom:8,color:"var(--success)"},children:"Strengths"}),e.jsx("ul",{className:"se-list",children:a.strengths.map((s,i)=>e.jsx("li",{className:"se-list-item se-list-item--success",children:s},i))})]})}),a.weaknesses?.length>0&&e.jsx(t,{className:"mb-4",children:e.jsxs("div",{style:{padding:"var(--space-4)"},children:[e.jsx("h4",{className:"section-title",style:{marginBottom:8,color:"var(--error)"},children:"Areas to Improve"}),e.jsx("ul",{className:"se-list",children:a.weaknesses.map((s,i)=>e.jsx("li",{className:"se-list-item se-list-item--warning",children:s},i))})]})}),a.corrections?.length>0&&e.jsx(t,{className:"mb-4",children:e.jsxs("div",{style:{padding:"var(--space-4)"},children:[e.jsx("h4",{className:"section-title",style:{marginBottom:8},children:"Corrections"}),a.corrections.map((s,i)=>e.jsxs("div",{className:"se-correction",children:[e.jsx("span",{className:"se-correction__original",children:s.original}),e.jsx("span",{className:"se-correction__arrow",children:"→"}),e.jsx("span",{className:"se-correction__corrected",children:s.corrected}),e.jsx("span",{className:"se-correction__explanation",children:s.explanation})]},i))]})}),a.feedback&&e.jsx(t,{children:e.jsxs("div",{style:{padding:"var(--space-4)"},children:[e.jsx("h4",{className:"section-title",style:{marginBottom:8},children:"Feedback"}),e.jsx("p",{className:"se-feedback",children:a.feedback})]})})]})]})]}),e.jsx("style",{children:`
        .se-layout { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); align-items: start; margin-top: var(--space-4); }
        @media (max-width: 900px) { .se-layout { grid-template-columns: 1fr; } }
        .se-left { display: flex; flex-direction: column; gap: var(--space-4); }
        .se-right { position: sticky; top: var(--space-4); }
        .se-tab { padding: 6px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); cursor: pointer; font-size: var(--text-xs); font-weight: 700; color: var(--text); transition: background-color 0.15s, border-color 0.15s, color 0.15s; }
        .se-tab:hover { border-color: var(--accent); }
        .se-tab--active { background: var(--accent); color: #fff; border-color: var(--accent); }
        .se-task-list { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
        .se-task-row { display: block; width: 100%; text-align: left; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); cursor: pointer; transition: background-color 0.15s, border-color 0.15s, color 0.15s; font: inherit; color: var(--text); }
        .se-task-row:hover { border-color: var(--accent); background: var(--accent-subtle); }
        .se-task-row--selected { border-color: var(--accent); background: var(--accent-subtle); }
        .se-task-row__head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
        .se-task-row__label { font-size: var(--text-sm); font-weight: 700; }
        .se-task-row__meta { display: flex; gap: 4px; flex-wrap: wrap; }
        .se-task-row__prompt { margin: 0; font-size: var(--text-xs); color: var(--text-2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pill--time { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); padding: 1px 7px; border-radius: 999px; font-size: 10px; font-weight: 700; }
        .se-textarea { width: 100%; min-height: 160px; resize: vertical; font-family: inherit; font-size: var(--text-sm); line-height: 1.7; }
        .se-empty { padding: 40px 24px; text-align: center; color: var(--text-muted); }
        .se-empty-icon { color: var(--text-muted); opacity: 0.4; margin-bottom: 12px; }
        .se-empty h3 { margin: 0 0 8px; font-size: var(--text-base); }
        .se-empty p { margin: 0 0 24px; font-size: var(--text-sm); }
        .se-rubric-preview { text-align: left; background: var(--bg); border-radius: var(--radius-sm); padding: 16px; border: 1px solid var(--border); }
        .se-rubric-preview strong { display: block; font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; }
        .se-rubric-item { display: flex; gap: 8px; align-items: baseline; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: var(--text-sm); }
        .se-rubric-item:last-child { border-bottom: none; }
        .se-rubric-label { font-weight: 700; min-width: 130px; color: var(--text); }
        .se-rubric-desc { flex: 1; color: var(--text-2); font-size: var(--text-xs); }
        .se-rubric-max { font-weight: 700; color: var(--accent); min-width: 24px; text-align: right; }
        .se-loading { display: flex; align-items: center; gap: 10px; padding: 40px 24px; color: var(--text-muted); justify-content: center; }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: se-spin 0.6s linear infinite; }
        @keyframes se-spin { to { transform: rotate(360deg); } }
        .se-error { padding: 16px 20px; color: var(--error); background: var(--error-bg, #fef2f2); border-radius: var(--radius-sm); display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); }
        .se-badge { background: var(--accent); color: white; padding: 2px 8px; border-radius: var(--radius-pill); font-size: var(--text-xs); font-weight: 700; }
        .se-score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
        .se-score-card { text-align: center; padding: 16px; background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--border); }
        .se-score-card--total { border-color: var(--accent); background: var(--accent-subtle); }
        .se-score-value { display: block; font-size: 28px; font-weight: 800; color: var(--text); }
        .se-score-card--total .se-score-value { color: var(--accent); }
        .se-score-label { display: block; font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-top: 2px; letter-spacing: 0.04em; }
        .se-cefr { display: inline-block; margin-top: 6px; padding: 2px 10px; border-radius: 999px; background: var(--accent); color: #fff; font-weight: 700; font-size: 12px; }
        .se-rationale { font-size: var(--text-xs); color: var(--text-2); margin: 8px 0 0; line-height: 1.5; }
        .se-list { list-style: none; padding: 0; margin: 0; }
        .se-list-item { padding: 6px 0 6px 20px; position: relative; font-size: var(--text-sm); line-height: 1.5; }
        .se-list-item::before { content: ''; position: absolute; left: 0; top: 12px; width: 8px; height: 8px; border-radius: 50%; }
        .se-list-item--success::before { background: var(--success); }
        .se-list-item--warning::before { background: var(--warning); }
        .se-correction { display: flex; flex-wrap: wrap; gap: 4px 8px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: var(--text-sm); align-items: center; }
        .se-correction:last-child { border-bottom: none; }
        .se-correction__original { color: var(--error); text-decoration: line-through; }
        .se-correction__arrow { color: var(--text-muted); }
        .se-correction__corrected { color: var(--success); font-weight: 600; }
        .se-correction__explanation { width: 100%; color: var(--text-muted); font-size: var(--text-xs); }
        .se-feedback { font-size: var(--text-sm); line-height: 1.7; color: var(--text); white-space: pre-wrap; margin: 0; padding: 12px; background: var(--bg); border-radius: var(--radius-sm); }
      `})]})}export{W as default};
