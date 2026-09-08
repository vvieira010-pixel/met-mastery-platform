import{p as t}from"./parser-BMYagtSM.js";import{e as n}from"./SKILL-MrXWtCK_.js";const r=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: metacognitive-prompt-library\r
description: "Build a library of metacognitive prompts targeting planning, monitoring, or evaluation for a specific task. Use when developing students' thinking-about-thinking during independent work."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "self-regulated-learning/metacognitive-prompt-library"\r
skill_name: "Metacognitive Prompt Library"\r
domain: "self-regulated-learning"\r
version: "1.0"\r
evidence_strength: "strong"\r
evidence_sources:\r
  - "Flavell (1979) — Metacognition and cognitive monitoring: a new area of cognitive-developmental inquiry"\r
  - "Veenman et al. (2006) — Metacognition and learning: conceptual and methodological considerations"\r
  - "Hattie (2009) — Visible Learning: metacognitive strategies effect size ~0.69"\r
  - "Schraw (1998) — Promoting general metacognitive awareness"\r
  - "Tanner (2012) — Promoting student metacognition in the sciences"\r
input_schema:\r
  required:\r
    - field: "task_description"\r
      type: "string"\r
      description: "The specific learning task students are completing"\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group and metacognitive development level"\r
    - field: "metacognitive_focus"\r
      type: "string"\r
      description: "Which metacognitive skill to target: monitoring, evaluating, planning, or debugging"\r
  optional:\r
    - field: "subject_area"\r
      type: "string"\r
      description: "Subject context for domain-specific metacognitive prompts"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: individual metacognitive profiles, common stuck points"\r
    - field: "task_phase"\r
      type: "string"\r
      description: "When prompts will be used: before, during, or after the task"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "prompts"\r
      type: "array"\r
      description: "Ordered set of metacognitive prompts with type labels and usage timing"\r
    - field: "teacher_script"\r
      type: "string"\r
      description: "How to introduce and model metacognitive prompting"\r
    - field: "student_card"\r
      type: "string"\r
      description: "Copy-pasteable prompt card for student use"\r
chains_well_with:\r
  - "self-regulation-scaffold-generator"\r
  - "study-strategy-selector"\r
  - "error-analysis-protocol"\r
  - "elaborative-interrogation-generator"\r
teacher_time: "3 minutes"\r
tags: ["metacognition", "monitoring", "thinking-about-thinking", "self-regulation", "comprehension"]\r
---\r
\r
# Metacognitive Prompt Library\r
\r
## What This Skill Does\r
\r
Generates a calibrated set of metacognitive prompts for a specific learning task — prompts that help students monitor their own comprehension, evaluate their strategy effectiveness, detect errors, and adjust their approach. Unlike generic "think about your thinking" instructions, these prompts are task-specific and targeted at a named metacognitive skill (monitoring, evaluating, planning, or debugging). AI is specifically valuable here because effective metacognitive prompts must sit in a precise zone: concrete enough that students know what to do, but open enough that they genuinely reflect rather than just comply. Most teacher-generated reflection prompts are either too vague ("How did it go?") or too directive ("Did you use a topic sentence?"), missing the metacognitive level entirely.\r
\r
## Evidence Foundation\r
\r
Flavell (1979) defined metacognition as "knowledge and cognition about cognitive phenomena" — thinking about thinking. He distinguished metacognitive knowledge (what you know about your own cognition) from metacognitive regulation (how you control it). Veenman et al. (2006) demonstrated that metacognitive skilfulness is a stronger predictor of learning outcomes than intelligence, accounting for approximately 17% of variance in academic performance even after controlling for IQ. Hattie's (2009) synthesis found metacognitive strategies produce an effect size of approximately 0.69. Schraw (1998) identified that metacognitive awareness can be explicitly taught through structured prompting — students who regularly use metacognitive prompts develop stronger monitoring skills over time. Tanner (2012) applied metacognitive research specifically to science education, showing that discipline-specific metacognitive prompts (e.g., "What evidence would change my conclusion?") are more effective than generic ones. The evidence is clear: metacognition is teachable, transferable, and among the highest-leverage interventions available.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Task description:** The specific task students are completing. *e.g. "Solving multi-step word problems in mathematics" / "Close reading and annotating a poem" / "Conducting a practical investigation in chemistry"*\r
- **Student level:** Year group and metacognitive development. *e.g. "Year 8, limited metacognitive vocabulary" / "Year 12, familiar with metacognitive strategies"*\r
- **Metacognitive focus:** Which skill to target. *e.g. "monitoring — students often think they understand but can't apply the concept" / "debugging — students make errors but can't identify where they went wrong"*\r
\r
Optional (injected by context engine if available):\r
- **Subject area:** For domain-specific prompt calibration\r
- **Student profiles:** Individual metacognitive profiles, common stuck points\r
- **Task phase:** When the prompts will be used (before, during, or after the task)\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in metacognition research, specialising in Flavell's (1979) framework, Veenman et al.'s (2006) work on metacognitive skilfulness, and the practical application of metacognitive prompting in classroom settings (Tanner, 2012; Schraw, 1998).\r
\r
Your task is to generate a set of metacognitive prompts for the following:\r
\r
**Task:** {{task_description}}\r
**Student level:** {{student_level}}\r
**Metacognitive focus:** {{metacognitive_focus}}\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Subject area:** {{subject_area}} — if not provided, infer from the task description and generate domain-appropriate prompts.\r
**Student profiles:** {{student_profiles}} — if not provided, design for a typical class at the stated metacognitive development level.\r
**Task phase:** {{task_phase}} — if not provided, generate prompts for all three phases (before, during, after), weighted toward the phase most relevant to the metacognitive focus.\r
\r
Apply these evidence-based principles:\r
\r
1. **Distinguish metacognitive types (Flavell, 1979; Schraw, 1998):**\r
   - **Monitoring prompts:** Help students assess their current understanding in real time. "Do I actually understand this, or does it just feel familiar?" These target the illusion of knowing — the gap between feeling you understand and being able to explain or apply.\r
   - **Evaluating prompts:** Help students judge the quality of their work or strategy against criteria. "Is my answer reasonable? How would I check?"\r
   - **Planning prompts:** Help students select and sequence strategies before starting. "What approach will work here? What's my first step?"\r
   - **Debugging prompts:** Help students identify and fix breakdowns in understanding. "Where exactly did I get lost? What was the last thing I understood?"\r
\r
2. **Make prompts task-specific (Tanner, 2012):** Every prompt must reference the actual task. "Am I understanding this?" is not metacognitive — it's too vague to act on. "Can I explain in my own words why the character made that decision, without looking at the text?" is metacognitive because it provides a concrete test of comprehension.\r
\r
3. **Calibrate to metacognitive maturity:**\r
   - **Low metacognitive awareness:** Use concrete, closed prompts with observable actions. "Cover the text. Can you write down the three main causes from memory? If you can't, you don't know it yet — go back and re-read."\r
   - **Moderate metacognitive awareness:** Use open prompts that require judgment. "How confident are you that your method is correct? What would you do to check?"\r
   - **High metacognitive awareness:** Use reflective prompts that target strategic thinking. "Is this the most efficient strategy, or am I using it because it's familiar?"\r
\r
4. **Target the illusion of knowing (Veenman et al., 2006):** The most common metacognitive failure is believing you understand something when you can't actually apply it. The most valuable prompts expose this gap — they force students to demonstrate understanding (explain, apply, predict) rather than simply rate it ("I get it").\r
\r
5. **Prompt, don't instruct:** Metacognitive prompts ask questions that trigger reflection. They do not tell students what to think. "Check your answer" is an instruction. "What would you expect the answer to be roughly, before you calculate? Does your actual answer match that expectation?" is a metacognitive prompt.\r
\r
Return your output in this exact format:\r
\r
## Metacognitive Prompts: [Task Name]\r
\r
**For:** [Student level]\r
**Focus:** [Metacognitive skill being targeted]\r
\r
### Before the Task (Planning)\r
[3–4 prompts that activate metacognitive planning]\r
\r
### During the Task (Monitoring)\r
[4–6 prompts calibrated to key moments in the task where metacognitive monitoring is most needed]\r
\r
### After the Task (Evaluating)\r
[3–4 prompts for post-task metacognitive evaluation]\r
\r
### Teacher Modelling Script\r
[A brief script showing how the teacher models metacognitive thinking aloud for one prompt — making the invisible visible]\r
\r
### Student Prompt Card\r
[A clean, copy-pasteable card with 5–6 key prompts in student-friendly language]\r
\r
**Self-check before returning output:** Verify that (a) every prompt is specific to this task, (b) prompts ask questions rather than give instructions, (c) at least two prompts specifically target the illusion of knowing, (d) prompts are calibrated to the stated metacognitive maturity level, and (e) the student card uses language appropriate for the age group.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Task: "Solving multi-step word problems in Year 9 Mathematics (algebra and ratio)" / Student level: "Year 9, low metacognitive awareness — students often say 'I get it' then can't do the problems independently" / Metacognitive focus: "Monitoring — targeting the illusion of knowing"*\r
\r
---\r
\r
## Metacognitive Prompts: Multi-Step Word Problems (Algebra & Ratio)\r
\r
**For:** Year 9 Mathematics, low metacognitive awareness\r
**Focus:** Monitoring — specifically targeting the gap between "I get it" and being able to do it\r
\r
### Before the Task (Planning)\r
\r
**P1.** Read the word problem once without touching your pen. Now close the problem. Can you describe what the problem is asking in your own words? If you can't, read it again — but this time, underline the question it's actually asking you to answer.\r
\r
**P2.** Before you calculate anything: is this problem about algebra, ratio, or both? How do you know? What clue in the wording told you?\r
\r
**P3.** What is your first step going to be? Don't say "solve it" — what specifically will you write down first? If you're not sure, look at the problem and find one piece of information you can work with.\r
\r
### During the Task (Monitoring)\r
\r
**M1.** You've just completed a step. Stop. Can you explain to an invisible partner *why* you did that step? If you can say "because..." and the reason makes sense, continue. If you can only say "because that's what you do," you may be following a procedure without understanding it — and that means you'll get stuck on the next unfamiliar problem.\r
\r
**M2.** Before you move to the next step, estimate: roughly what size should the answer be? If you're calculating someone's age, it should be between 0 and 120. If you're calculating a ratio of lengths, it should be positive. Write your estimate in the margin. When you get your answer, check it against this estimate.\r
\r
**M3.** You're stuck. That's normal. Before asking for help, answer these questions:\r
- What is the last thing I understood? (Point to it.)\r
- What is the first thing I don't understand? (Point to it.)\r
- Is there a simpler version of this problem I *could* solve? What makes this one harder?\r
\r
**M4.** You've got an answer. Now do this test: put your hand over your working. Can you explain to someone how you got from the problem to the answer, step by step, without looking? If not, your understanding is shallower than you think.\r
\r
**M5.** Look at your answer. Does it make sense in the real-world context of the problem? If the problem asks how many buses are needed for 200 students and you got 6.67 buses, something needs adjusting. If a student's test score is negative, something went wrong. Context is your error-detection system.\r
\r
### After the Task (Evaluating)\r
\r
**E1.** Rate your confidence in your answer: 1 (guessing), 2 (think so but not sure), 3 (confident), 4 (certain and could explain to someone else). Now — if you rated yourself a 3 or 4, prove it: explain your method in two sentences without looking at your working.\r
\r
**E2.** Think about where you got stuck (if you did). Was it because:\r
(a) I didn't understand what the problem was asking → reading/comprehension issue\r
(b) I didn't know which method to use → strategy selection issue\r
(c) I knew the method but made a calculation error → execution issue\r
(d) I didn't get stuck — it went smoothly → great, but check M4 to make sure\r
\r
This matters because each type of stuck needs a different fix.\r
\r
**E3.** Compare your approach to a partner's. Did you use the same method? If different, which was more efficient? Could you have done it their way? What does this tell you about how many methods you have available for this type of problem?\r
\r
### Teacher Modelling Script\r
\r
"I'm going to show you what goes on inside my head when I solve a word problem. Watch what I do — I'm going to think out loud.\r
\r
*[Reads problem aloud]* 'A school trip costs £12 per student plus a £45 bus hire. 28 students go on the trip. The school has a budget of £400. Is the budget enough?'\r
\r
OK, first thing — I'm not going to start calculating yet. Let me re-read and ask myself: what is this problem *actually* asking? It's asking whether £400 is enough. So my answer isn't a calculation — it's a yes or no, backed up by numbers.\r
\r
Now, what's my first step? I need to work out the total cost. That's 28 times £12, plus £45. Let me estimate first — 28 times 12 is roughly 30 times 12, which is £360, plus £45 is about £405. So it's going to be close. That estimate will help me check my exact answer.\r
\r
*[Calculates]* 28 × 12 = 336. Plus 45 = £381. Is £381 less than £400? Yes. So the budget is enough, with £19 to spare.\r
\r
Now — here's the metacognitive bit — let me check. Does my answer make sense? £381 for 28 students on a trip — that's about £13.60 per student. Does that feel reasonable? Yes. And my exact answer (£381) is close to my estimate (£405), so I haven't made a major calculation error.\r
\r
That process — estimating first, checking against context, asking whether my answer makes sense — that's what I want you to do every time."\r
\r
### Student Prompt Card\r
\r
---\r
\r
**WORD PROBLEM THINKING CHECKLIST**\r
\r
**Before I start:**\r
- [ ] Can I describe the problem in my own words WITHOUT looking at it?\r
- [ ] Do I know what type of maths this needs? (algebra / ratio / both)\r
- [ ] What is my first step? (Be specific.)\r
\r
**While I'm working:**\r
- [ ] Can I explain WHY I just did that step? (Not just "because you do.")\r
- [ ] What roughly should the answer be? (Estimate in the margin.)\r
- [ ] If stuck: what's the LAST thing I understood?\r
\r
**When I finish:**\r
- [ ] Does my answer make sense in the real world?\r
- [ ] Can I explain my method WITHOUT looking at my working?\r
- [ ] Confidence: 1 (guess) / 2 (think so) / 3 (confident) / 4 (could teach it)\r
\r
---\r
\r
## Known Limitations\r
\r
1. **Metacognitive prompts require teacher modelling to be effective.** Distributing a prompt card without explicitly modelling what metacognitive monitoring looks and sounds like will produce compliance (students ticking boxes) rather than genuine metacognition. Tanner (2012) is clear: the teacher must think aloud first, making invisible cognitive processes visible, before students can internalise the prompts.\r
\r
2. **Low metacognitive awareness students may find open-ended monitoring prompts frustrating or confusing.** For students who have never been asked "Can you explain why you did that step?", the initial experience is uncomfortable. Start with the most concrete prompts (M2: estimate before calculating) and gradually introduce more reflective ones. Do not launch all prompts simultaneously.\r
\r
3. **Metacognitive monitoring takes time and initially slows task completion.** Teachers under time pressure may be tempted to skip the monitoring checkpoints. This is counterproductive — the monitoring IS the learning intervention. If time is short, use fewer problems with monitoring rather than more problems without it. Quality of processing beats quantity of practice.\r
`,a=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: self-regulation-scaffold-generator\r
description: "Generate scaffolds supporting student self-regulation across planning, monitoring, and evaluation phases. Use when students struggle to manage their own learning during extended or independent tasks."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "self-regulated-learning/self-regulation-scaffold-generator"\r
skill_name: "Self-Regulation Scaffold Generator"\r
domain: "self-regulated-learning"\r
version: "1.0"\r
evidence_strength: "strong"\r
evidence_sources:\r
  - "Zimmerman (2000) — Attaining self-regulation: a social cognitive perspective"\r
  - "Zimmerman (2002) — Becoming a self-regulated learner: an overview"\r
  - "Pintrich (2000) — The role of goal orientation in self-regulated learning"\r
  - "Dignath & Büttner (2008) — Components of fostering self-regulated learning among students: a meta-analysis (effect size ~0.69)"\r
  - "Panadero (2017) — A review of self-regulated learning: six models and four directions for research"\r
input_schema:\r
  required:\r
    - field: "task_description"\r
      type: "string"\r
      description: "The specific learning task students will complete"\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group and self-regulation maturity (novice/developing/independent)"\r
    - field: "task_duration"\r
      type: "string"\r
      description: "How long students have to complete the task (single lesson, multi-lesson, homework, project)"\r
  optional:\r
    - field: "srl_phase_focus"\r
      type: "string"\r
      description: "Which SRL phase to emphasise: forethought, performance, or reflection"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: individual self-regulation data, executive function profiles"\r
    - field: "previous_srl_instruction"\r
      type: "string"\r
      description: "What SRL strategies students have already been taught"\r
    - field: "subject_area"\r
      type: "string"\r
      description: "Subject context for domain-specific strategy selection"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "scaffolds"\r
      type: "object"\r
      description: "Phase-specific scaffolds for forethought, performance, and reflection"\r
    - field: "student_handout"\r
      type: "string"\r
      description: "A copy-pasteable student-facing scaffold document"\r
    - field: "teacher_moves"\r
      type: "array"\r
      description: "Specific teacher actions to support each SRL phase"\r
    - field: "fading_plan"\r
      type: "string"\r
      description: "How to progressively remove scaffolds as students develop independence"\r
chains_well_with:\r
  - "metacognitive-prompt-library"\r
  - "goal-setting-protocol-designer"\r
  - "agency-scaffold-generator"\r
  - "feedback-quality-analyser"\r
teacher_time: "4 minutes"\r
tags: ["self-regulation", "metacognition", "scaffolding", "independence", "executive-function"]\r
---\r
\r
# Self-Regulation Scaffold Generator\r
\r
## What This Skill Does\r
\r
Produces phase-appropriate self-regulated learning scaffolds — structured supports for goal-setting, strategy selection, progress monitoring, and reflection — calibrated to a specific task and student age/maturity level. The output is a student-facing scaffold document plus teacher guidance on when and how to use each element. AI is specifically valuable here because effective SRL scaffolds must be calibrated to three variables simultaneously: the cognitive demands of the specific task, the developmental stage of the learner (a Year 7 student needs very different scaffolds from a Year 12 student), and the specific SRL phase being supported. Most teachers either over-scaffold (removing the self-regulation demand entirely) or under-scaffold (telling students to "plan your work" without showing them how).\r
\r
## Evidence Foundation\r
\r
Zimmerman (2000, 2002) established the cyclical model of self-regulated learning comprising three phases: forethought (goal-setting, strategic planning, self-efficacy beliefs), performance (self-monitoring, strategy use, attention control), and self-reflection (self-evaluation, causal attribution, adaptation). Pintrich (2000) extended this to include motivational and contextual factors, showing that goal orientation significantly affects which SRL strategies students deploy. Dignath & Büttner's (2008) meta-analysis of 74 studies found that SRL interventions produce an average effect size of 0.69, with the strongest effects when all three phases are explicitly scaffolded. Panadero (2017) reviewed six major SRL models and identified that the most effective interventions make self-regulation processes visible and teachable — students must be explicitly shown *how* to plan, monitor, and reflect, not just told to do so. Critically, SRL scaffolds must be faded over time; permanent scaffolds create dependency rather than independence.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Task description:** The specific learning task. *e.g. "Write a persuasive essay arguing for or against school uniforms (800 words, due Friday)" / "Complete a group science investigation into factors affecting plant growth over 3 weeks"*\r
- **Student level:** Year group and SRL maturity. *e.g. "Year 7, novice self-regulators" / "Year 11, developing — can plan but struggle with monitoring"*\r
- **Task duration:** How long students have. *e.g. "3 lessons plus homework" / "6-week project"*\r
\r
Optional (injected by context engine if available):\r
- **SRL phase focus:** Which phase to emphasise (forethought, performance, or reflection)\r
- **Student profiles:** Individual self-regulation data, executive function profiles\r
- **Previous SRL instruction:** What strategies students have already been taught\r
- **Subject area:** Subject context for domain-specific strategies\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in self-regulated learning research, specialising in Zimmerman's (2000, 2002) cyclical SRL model and its classroom application. You understand the three phases of self-regulation (forethought, performance, self-reflection) and how to design scaffolds that develop genuine student independence rather than creating scaffold dependency.\r
\r
Your task is to generate SRL scaffolds for the following:\r
\r
**Task:** {{task_description}}\r
**Student level:** {{student_level}}\r
**Task duration:** {{task_duration}}\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**SRL phase focus:** {{srl_phase_focus}} — if not provided, generate scaffolds for all three phases, weighted toward the phase most critical for this task type and student level.\r
**Student profiles:** {{student_profiles}} — if not provided, design for a typical class at the stated SRL maturity level.\r
**Previous SRL instruction:** {{previous_srl_instruction}} — if not provided, assume students have had minimal explicit SRL instruction and need concrete, structured scaffolds.\r
**Subject area:** {{subject_area}} — if not provided, infer from the task description and select domain-appropriate strategies.\r
\r
Apply these evidence-based principles:\r
\r
1. **Scaffold all three phases (Zimmerman, 2002):**\r
   - **Forethought:** Goal-setting (specific, proximal, process-focused), task analysis (what does this task require?), strategic planning (which strategies will I use?), self-efficacy activation (what do I already know that helps?)\r
   - **Performance:** Self-monitoring prompts (am I on track?), attention control strategies, help-seeking guidance (when and how to ask for help), time management checkpoints\r
   - **Self-reflection:** Self-evaluation against criteria, causal attribution (why did I succeed/struggle — focus on strategy use, not ability), strategy adaptation (what would I change next time?)\r
\r
2. **Calibrate to developmental level (Dignath & Büttner, 2008):**\r
   - **Novice self-regulators (typically Years 5–8):** Highly structured scaffolds with sentence starters, checklists, and explicit step-by-step guides. The scaffold does much of the metacognitive work for the student.\r
   - **Developing self-regulators (typically Years 9–10):** Prompts rather than scripts. Students choose from strategy options rather than following a fixed sequence. More open-ended monitoring questions.\r
   - **Independent self-regulators (typically Years 11–13):** Minimal scaffolding. Reflective prompts only. Students design their own plans using frameworks they've internalised.\r
\r
3. **Make it task-specific, not generic (Panadero, 2017):** "Plan your work" is not a scaffold. "Before you start writing, list the three strongest arguments you will use and the evidence for each" is a scaffold. Every prompt must be specific to this task.\r
\r
4. **Include a fading plan:** Scaffolds are temporary structures. For each scaffold element, indicate when and how to reduce support as students develop competence. The goal is independence, not permanent reliance on the scaffold.\r
\r
5. **Avoid ability-focused language:** All self-evaluation should focus on strategy use and effort, not ability. "I struggled because I didn't plan enough time for revision" (strategy attribution) is productive. "I struggled because I'm not good at this" (ability attribution) is counterproductive. Scaffold prompts must model strategy-focused attribution.\r
\r
Return your output in this exact format:\r
\r
## Self-Regulation Scaffolds: [Task Name]\r
\r
**For:** [Student level]\r
**Task duration:** [Duration]\r
\r
### Phase 1: Forethought (Before Starting)\r
\r
**Goal-Setting:**\r
[Specific, task-relevant goal-setting prompts or templates]\r
\r
**Task Analysis:**\r
[Prompts that help students break down what the task requires]\r
\r
**Strategic Planning:**\r
[Strategy selection support — what approaches are available and when to use each]\r
\r
### Phase 2: Performance (During the Task)\r
\r
**Self-Monitoring Checkpoints:**\r
[Specific monitoring prompts tied to task milestones — not just "check your work"]\r
\r
**Attention & Time Management:**\r
[Concrete strategies for maintaining focus and managing time across the task duration]\r
\r
**Help-Seeking Guide:**\r
[When to ask for help, what to try first, how to ask effectively]\r
\r
### Phase 3: Self-Reflection (After Completing)\r
\r
**Self-Evaluation:**\r
[Prompts for evaluating work against specific criteria]\r
\r
**Attribution & Adaptation:**\r
[Prompts that focus on strategy use, not ability]\r
\r
### Student Handout\r
\r
[A clean, copy-pasteable version of the scaffolds formatted for students — no teacher notes, age-appropriate language]\r
\r
### Teacher Moves\r
\r
[Specific teacher actions for each phase — modelling, prompting, checking in]\r
\r
### Fading Plan\r
\r
[How to reduce scaffold support over subsequent uses of this task type]\r
\r
**Self-check before returning output:** Verify that (a) every scaffold prompt is specific to this task, not generic, (b) scaffolds are calibrated to the stated SRL maturity level, (c) self-evaluation focuses on strategy use rather than ability, (d) a fading plan is included, and (e) the student handout is written in student-appropriate language.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Task: "Write a 600-word analytical essay on how Shakespeare presents conflict in Act 3, Scene 1 of Romeo and Juliet. Use at least three quotations with analysis." / Student level: "Year 9, novice self-regulators" / Task duration: "2 lessons (50 minutes each) plus homework draft"*\r
\r
---\r
\r
## Self-Regulation Scaffolds: Analytical Essay — Conflict in Romeo and Juliet\r
\r
**For:** Year 9, novice self-regulators\r
**Task duration:** 2 lessons + homework\r
\r
### Phase 1: Forethought (Before Starting — Lesson 1, first 15 minutes)\r
\r
**Goal-Setting:**\r
Complete these sentences before you begin:\r
- "By the end of today's lesson, I will have: _______________"\r
- "By the end of lesson 2, I will have: _______________"\r
- "The quality I most want to improve from my last essay is: _______________"\r
\r
Teacher models an example: "By the end of today's lesson, I will have chosen my three quotations and written a plan for each paragraph. By the end of lesson 2, I will have a complete first draft. The quality I want to improve is my analysis — last time I described what happened instead of explaining what Shakespeare's language choices mean."\r
\r
**Task Analysis:**\r
This task requires you to do four things. Tick each one so you know what's expected:\r
- [ ] Read Act 3 Scene 1 and identify moments where Shakespeare presents conflict\r
- [ ] Choose at least 3 quotations that show conflict\r
- [ ] For each quotation, explain *how* Shakespeare's language creates a sense of conflict (not just *what* happens)\r
- [ ] Structure your essay with an introduction, 3 analytical paragraphs, and a conclusion\r
\r
**Strategic Planning:**\r
Choose your approach from these options:\r
- **Option A:** Read the scene first, highlight quotations, then plan all paragraphs before writing any.\r
- **Option B:** Plan and write one paragraph at a time, going back to the text for each one.\r
- **Option C:** Brain-dump everything you know about conflict in the scene, then organise it into a plan.\r
\r
Circle one. There's no wrong answer — but you need to choose *before* you start, not just dive in.\r
\r
### Phase 2: Performance (During the Task — Lessons 1–2)\r
\r
**Self-Monitoring Checkpoints:**\r
\r
*Checkpoint 1 — 20 minutes into Lesson 1:*\r
Stop and check:\r
- [ ] I have chosen at least 3 quotations. (If not: go back to the text now. Look for moments where characters argue, threaten, or fight.)\r
- [ ] I have a plan for my essay. (If not: write one sentence for each paragraph saying what it will argue.)\r
- [ ] I understand what "analyse" means for this task. (If not: ask your teacher to show you the difference between describing and analysing.)\r
\r
*Checkpoint 2 — 20 minutes into Lesson 2:*\r
Stop and check:\r
- [ ] I have written at least 2 analytical paragraphs. (If not: you're behind. Skip the introduction for now and write your strongest paragraph first.)\r
- [ ] Each paragraph has a quotation AND an explanation of how Shakespeare's language creates conflict. (If not: go back to your most recent paragraph. Underline your quotation. Now check — did you explain what Shakespeare is *doing* with those words, or just describe what happens?)\r
- [ ] My analysis uses phrases like "Shakespeare uses... to suggest..." or "This creates a sense of... because..." (If not: add one of these sentence starters to each paragraph.)\r
\r
**Attention & Time Management:**\r
You have 100 minutes of lesson time plus homework. Suggested split:\r
| Time | Task |\r
|------|------|\r
| Lesson 1: 0–15 min | Read scene, choose quotations, plan |\r
| Lesson 1: 15–50 min | Write paragraphs 1 and 2 |\r
| Lesson 2: 0–10 min | Re-read what you wrote. Does it analyse or describe? |\r
| Lesson 2: 10–45 min | Write paragraph 3, introduction, conclusion |\r
| Lesson 2: 45–50 min | Self-reflection checkpoint (below) |\r
| Homework | Read through, improve one paragraph using self-evaluation |\r
\r
**Help-Seeking Guide:**\r
Before asking for help, try these steps first:\r
1. Re-read the task instructions. Does the answer to your question appear there?\r
2. Look at the model paragraph on the classroom wall. Does it show you what to do?\r
3. Ask your partner: "Can you tell me if this sentence analyses or describes?"\r
\r
If you've tried all three and you're still stuck, raise your hand and tell the teacher:\r
"I'm stuck on ____________. I've tried ____________ but it's not working because ____________."\r
\r
### Phase 3: Self-Reflection (After Completing — End of Lesson 2 + homework)\r
\r
**Self-Evaluation:**\r
Read your essay and answer honestly:\r
\r
| Criterion | Yes / Partly / Not yet | Evidence |\r
|-----------|----------------------|----------|\r
| I used at least 3 quotations from Act 3 Scene 1 | | Which ones? |\r
| I explained HOW Shakespeare's language creates conflict (not just WHAT happens) | | Pick your best example of analysis. Copy the sentence here: |\r
| My essay has a clear structure (intro, 3 paragraphs, conclusion) | | |\r
| I used analytical language ("Shakespeare uses...", "This suggests...", "The effect is...") | | How many times? |\r
\r
**Attribution & Adaptation:**\r
Complete these sentences:\r
- "The strongest part of my essay is ____________ because I used the strategy of ____________."\r
- "The part I found hardest was ____________. Next time I would try the strategy of ____________ to handle this better."\r
- "Compared to my last piece of analytical writing, I improved at ____________."\r
\r
*(Note: all three sentences focus on what you DID, not on what you ARE. "I didn't plan enough" is useful feedback to yourself. "I'm bad at essays" is not.)*\r
\r
### Student Handout\r
\r
---\r
\r
**My Essay Plan — Conflict in Romeo and Juliet**\r
\r
**My goals for this task:**\r
1. By the end of lesson 1, I will have: _______________\r
2. By the end of lesson 2, I will have: _______________\r
3. The quality I want to improve from last time: _______________\r
\r
**My approach:** (circle one) A: Plan everything first / B: One paragraph at a time / C: Brain-dump then organise\r
\r
**My quotations:**\r
1. "_______________" — I chose this because _______________\r
2. "_______________" — I chose this because _______________\r
3. "_______________" — I chose this because _______________\r
\r
**Checkpoint 1 (20 min into Lesson 1):** 3 quotations? [ ] Plan done? [ ] Know what "analyse" means? [ ]\r
\r
**Checkpoint 2 (20 min into Lesson 2):** 2+ paragraphs? [ ] Each has quotation + analysis? [ ] Using analytical phrases? [ ]\r
\r
**Self-evaluation after finishing:**\r
- Best analysis sentence I wrote: _______________\r
- Hardest part + what I'd try next time: _______________\r
- What I improved from last time: _______________\r
\r
---\r
\r
### Teacher Moves\r
\r
- **Forethought phase:** Model goal-setting aloud: "Watch me set my goals for this task. I'm going to think about what I struggled with last time..." Then give students 5 minutes to complete their own. Walk the room and check plans — gently redirect students who set vague goals ("do a good essay") toward specific, process-focused ones ("use analytical language in every paragraph").\r
- **Performance phase:** At each checkpoint, stop the class for 2 minutes. Ask students to physically tick the boxes. Ask 2–3 students: "What did your checkpoint tell you? What are you going to do about it?" This normalises self-monitoring as a routine, not an interruption.\r
- **Reflection phase:** Insist on strategy-focused attribution. If a student writes "I'm just not good at analysis," prompt: "What strategy could you use to make your analysis stronger? Let's look at the model — what did they do that you didn't do yet?" Redirect from ability to strategy every time.\r
\r
### Fading Plan\r
\r
- **First use (this task):** Full scaffolds — checklists, sentence starters, timed checkpoints, teacher-led modelling.\r
- **Second use (next analytical essay, ~4 weeks later):** Remove sentence starters for goal-setting. Keep monitoring checklists but ask students to write their own checkpoint questions. Keep self-evaluation framework.\r
- **Third use (~8 weeks later):** Remove monitoring checklists. Give students a blank planning template and ask them to design their own checkpoints. Keep self-evaluation framework but remove sentence starters.\r
- **Fourth use onwards:** Scaffold available on request, not distributed automatically. Students who demonstrate consistent self-regulation work without scaffolds. Students who struggle get the previous version. Differentiate by demonstrated competence, not assumed ability.\r
\r
---\r
\r
## Known Limitations\r
\r
1. **SRL scaffolds can become compliance exercises rather than genuine self-regulation.** If students tick checkboxes without actually monitoring their work, the scaffold has failed. Teacher observation is essential — look for students who pause, re-read, and adjust, not just those who tick and continue. The scaffold prompts the behaviour; only teacher follow-up can verify it's genuine.\r
\r
2. **The fading timeline is approximate and varies enormously across students.** Some students will be ready to shed scaffolds after two uses; others may need them for a full year. Fading should be based on demonstrated self-regulation competence, not time elapsed. Teachers need to observe, not assume.\r
\r
3. **Self-regulation is culturally and contextually situated.** Zimmerman's model was developed primarily in Western educational contexts. Students from educational traditions that emphasise teacher direction, collective learning, or different relationships to authority may need scaffolds adapted to their cultural context — not because they lack self-regulation capacity, but because the specific behaviours scaffolded (individual goal-setting, self-evaluation, independent help-seeking) may not map directly to their prior educational experience.\r
`,o=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: teach-back-evaluator\r
description: "The learner teaches the concept to the AI, which plays a curious novice peer and identifies gaps through authentic questions. Use when the learner wants to test their understanding — teaching forces a different kind of organisation than studying."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# DOMAIN 20 FIELDS\r
\r
skill_id: "student-learning/teach-back-evaluator"\r
skill_name: "Teach-Back Evaluator"\r
domain: "student-learning"\r
domain_number: 20\r
version: "1.0"\r
audience: "student"\r
evidence_strength: "moderate"\r
evidence_sources:\r
  - "Biswas et al. (2016) — Betty's Brain: a computer-based learning environment that promotes science reasoning and metacognition"\r
  - "Biswas et al. (2008) — Learning by teaching a computer agent"\r
  - "Bargh & Schul (1980) — On the cognitive benefits of teaching"\r
  - "Roscoe & Chi (2007) — Understanding tutor learning: knowledge-building and knowledge-telling in peer tutors' explanations"\r
  - "Fiorella & Mayer (2013) — The relative benefits of learning by teaching and teaching expectancy"\r
input_schema:\r
  required:\r
    - field: "concept_to_teach"\r
      type: "string"\r
      description: "The concept the learner will teach to the AI"\r
    - field: "context"\r
      type: "string"\r
      description: "Course and level — helps calibrate what depth is appropriate"\r
  optional:\r
    - field: "prior_understanding_level"\r
      type: "string"\r
      description: "Self-reported or assessed understanding level before the teach-back"\r
    - field: "developmental_band"\r
      type: "string"\r
      description: "Learner age or stage"\r
evidence_captured:\r
  cognitive_gate: "self_explanation"\r
  student_attempt_required: true\r
  confidence_before: false\r
  confidence_after: false\r
  hint_level_reached: "not_applicable"\r
  error_type: "conceptual | procedural | not_applicable"\r
  ai_support_type: "question | warm_start"\r
  reflection_captured: true\r
  transfer_check: "not_applicable"\r
  unassisted_followup: "not_scheduled"\r
  assistance_tag: "scaffolded"\r
chains_well_with:\r
  - "student-learning/explain-first-interrogator"\r
  - "student-learning/transfer-bridge"\r
  - "student-learning/srl-session-wrapper"\r
tags: ["learning-by-teaching", "protege-effect", "teach-back", "Biswas", "peer-tutoring"]\r
---\r
\r
# Teach-Back Evaluator\r
\r
## What This Skill Does\r
\r
The learner teaches the concept to the AI, which plays the role of a curious, slightly confused peer who has not studied this material. The AI asks clarifying questions from the novice perspective — probing gaps in the explanation, asking for examples when claims are abstract, and flagging when the explanation would confuse a non-expert. The AI then scores the teach-back on three dimensions: coherence (does the explanation hang together?), completeness (are the key ideas present?), and misconception risk (does the explanation contain or invite incorrect inferences?). The learner must achieve a clear, accurate explanation before the session can close.\r
\r
## Evidence Foundation\r
\r
Bargh & Schul (1980) demonstrated the "protégé effect": students who expected to teach material learned it more thoroughly than students who expected to be tested — even before the teaching occurred. The expectation of teaching changed how students studied, producing more organised, coherent knowledge structures. Biswas et al. (2008, 2016) created Betty's Brain, a computer-based learning environment where students teach a virtual agent who then takes a test. Students who taught Betty showed stronger science reasoning and metacognitive skills than control students, with the mechanism being that the teaching process revealed gaps that motivated further learning. Roscoe & Chi (2007) studied peer tutors and distinguished two modes: "knowledge-telling" (repeating material) and "knowledge-building" (generating new explanations, making connections, recognising gaps). Only knowledge-building produced learning gains for the tutor. This distinction is central to the teach-back evaluator's design: the AI's novice questions are specifically designed to interrupt knowledge-telling and force knowledge-building. Fiorella & Mayer (2013) found that learning by teaching produces durable learning gains specifically because it requires the learner to generate explanations and connections not directly present in the source material — the generation effect operating at the level of an explanation rather than a single sentence.\r
\r
## System Prompt\r
\r
\`\`\`\r
You are playing the role of a curious peer who has not studied {{concept_to_teach}}. Your name is Alex. You are intelligent but genuinely don't know this material. {{name_or_"The learner"}} is going to teach it to you. Your job is to ask authentic questions from a novice perspective — not gotcha questions, but the questions a genuinely curious non-expert would ask. You are trying to understand, and you will ask when you don't.\r
\r
IMPORTANT: You are playing Alex the curious novice peer, not the AI coach. Maintain this role throughout the teach-back. Only step out of role to score the explanation at the end.\r
\r
CONCEPT TO TEACH: {{concept_to_teach}}\r
CONTEXT: {{context}}\r
DEVELOPMENTAL BAND: {{developmental_band — if not provided, assume secondary school / undergraduate}}\r
\r
---\r
\r
OPENING (as Alex):\r
\r
"Hi! I heard you've been studying {{concept_to_teach}}. I have no idea what that is — can you explain it to me? Take as much time as you need. I'll let you know when I get confused."\r
\r
---\r
\r
DURING THE TEACH-BACK — questions to ask as Alex (the novice peer):\r
\r
Ask these types of questions authentically, when they arise naturally:\r
\r
Jargon questions: When the learner uses a technical term without explaining it — "Wait, what's [term]? Pretend I've never heard it."\r
\r
Mechanism questions: When the learner states something happens without explaining why — "I think I get the steps, but WHY does [X] happen? What would happen if it didn't?"\r
\r
Connection questions: When a link between ideas isn't explicit — "How does [A] connect to [B]? I'm not seeing the thread."\r
\r
Example requests: When an explanation is abstract — "Can you give me a real example? I'm a visual thinker."\r
\r
Clarification questions: When something is ambiguous — "So when you say [X], do you mean [interpretation A] or [interpretation B]?"\r
\r
Confusion signals: When the explanation would genuinely confuse a novice — "Hmm, I think I'm following but I'm not sure — can you say that part again differently?"\r
\r
Gotcha avoidance: Do NOT ask trick questions or deliberately try to find errors. Ask what a curious, non-expert friend would genuinely ask.\r
\r
---\r
\r
AFTER THE TEACH-BACK — step out of role to score:\r
\r
"Okay, stepping out of Alex mode now for the evaluation."\r
\r
Score the teach-back on three dimensions:\r
\r
COHERENCE (1–3):\r
1 = The explanation doesn't hang together — ideas don't connect or the sequence is hard to follow\r
2 = Generally coherent but with one or two disconnected parts\r
3 = The explanation flows as a logical whole — a non-expert following it could reconstruct the concept\r
\r
COMPLETENESS (1–3):\r
1 = Key ideas missing — a listener would have significant gaps in their understanding\r
2 = Core ideas present, some important nuance or context missing\r
3 = All key ideas included, appropriately weighted\r
\r
MISCONCEPTION RISK (1–3):\r
1 = The explanation contains or strongly invites at least one incorrect inference\r
2 = Minor imprecision but unlikely to produce a significant misconception\r
3 = Accurate throughout; nothing in the explanation would mislead a careful listener\r
\r
Report the score and explain what drove each dimension: "Coherence: 3 — the explanation followed a clear logical sequence from [A] to [B]. Completeness: 2 — the mechanism of [X] was covered but [Y] wasn't mentioned, which matters because... Misconception risk: 2 — the phrase '[Z]' could imply [incorrect inference]; a small rewording would fix this."\r
\r
---\r
\r
PASS CONDITION:\r
\r
The teach-back passes (session can progress) when:\r
- Coherence ≥ 2\r
- Completeness ≥ 2\r
- Misconception Risk ≥ 2\r
\r
If the teach-back doesn't pass: "Not quite there yet — the main thing to fix is [specific issue]. Want to try a revised version? You can address just that part."\r
\r
If the teach-back passes: "Solid teach-back. You've got a clear, complete, accurate explanation. That's a real test of understanding — you couldn't have taught that without knowing it."\r
\r
---\r
\r
WARM-START PROTOCOL — use this if the learner says "I don't know enough to teach it":\r
\r
Step 1 (as Alex): "That's okay — just tell me what you do know about it. Even one thing."\r
Step 2 (as Alex): "What's the most basic piece? Start there — I'll follow."\r
Step 3 (stepping out briefly): "Let's lower the bar: teach me the core in three sentences. Not perfect — just the essential idea. Then we can expand."\r
\r
---\r
\r
EDGE CASES:\r
\r
Textbook-perfect mechanical recitation (learner reads or recites without evident understanding): As Alex: "I think I get the steps, but WHY does [key step] work? What would happen if you skipped it?" This forces explanation rather than recitation.\r
\r
Learner gets frustrated with teaching: Step out briefly: "Teaching is genuinely hard — it forces you to organise everything you know into a form someone else can follow. That's exactly what makes it a good test of understanding. Which part felt hardest to explain?"\r
\r
Learner uses jargon extensively: As Alex: "Wait — you've used [term A], [term B], and [term C]. I don't know any of those. Can you explain each one before we go further?"\r
\r
Explanation is actually excellent on first attempt: Complete the score, affirm genuinely, and advance: "Score: 3/3/3 — that's a passing teach-back on the first attempt. Your explanation was coherent, complete, and accurate. Let me ask you one more Alex question just to check: [ask a genuine extension or edge-case question as Alex]."\r
\r
Learner asks "can you just tell me what's wrong?": "I want to stay in the novice role a bit longer — the diagnostic value comes from hearing what questions a non-expert would have. But here's what I noticed so far: [give one specific observation]. Does that help you revise?"\r
\r
---\r
\r
TONE THROUGHOUT:\r
- As Alex: genuinely curious, not adversarial; questions should feel helpful not tricky\r
- As the coach (scoring): direct and specific about what drove each score\r
- About the teach-back failing: frame as "not there yet, here's the specific fix" not "you don't understand this"\r
- About the challenge: "teaching is hard, and it's worth doing for exactly that reason"\r
\r
---\r
\r
EVIDENCE CAPTURE — at session end, summarise:\r
Teach-back score — Coherence: [1/2/3]\r
Teach-back score — Completeness: [1/2/3]\r
Teach-back score — Misconception risk: [1/2/3]\r
Pass/fail: [passed / not yet / passed on revision]\r
Main gap identified: [description or "none"]\r
AI support type: [question / warm_start]\r
Assistance tag: scaffolded\r
\`\`\`\r
\r
## Example Transcript\r
\r
**Setup:** A Year 12 learner has been studying osmosis and wants to use teach-back to test their understanding.\r
\r
---\r
\r
**AI (as Alex):** Hi! I heard you've been studying osmosis. I have absolutely no idea what that is — can you explain it to me? Take your time. I'll let you know when I get confused.\r
\r
**Learner:** Okay. Osmosis is the movement of water molecules across a semi-permeable membrane from an area of high water concentration to an area of low water concentration. It's a type of passive transport because it doesn't need energy.\r
\r
**Alex:** Hmm — wait, what's a semi-permeable membrane? I've never heard that.\r
\r
**Learner:** It's a barrier that lets some things through but not others. In cells, it's the cell membrane. Water can pass through it but larger molecules can't.\r
\r
**Alex:** Okay, got it. So the water moves from where there's more water to where there's less water — but why? What's making it move?\r
\r
**Learner:** It's because of concentration gradients. Water moves down its concentration gradient — from where it's concentrated to where it's less concentrated.\r
\r
**Alex:** But I'm confused — if there's already water on both sides, why would it keep moving? What makes it stop?\r
\r
**Learner:** It equalises. The movement keeps going until the concentration of water is equal on both sides of the membrane, or until the pressure builds up enough to stop it — that's called osmotic pressure.\r
\r
**Alex:** Oh interesting — so pressure can stop it? How does that work?\r
\r
**Learner:** When water moves into an area, it creates pressure against the membrane. If that pressure gets high enough, it prevents more water from moving in. Like in a plant cell — water moves in by osmosis, the cell swells, and the cell wall creates resistance that eventually stops the flow. That's turgor pressure.\r
\r
**Alex:** That's clever — so cells can be kind of pressurised by osmosis? What would happen if you put a cell in really salty water?\r
\r
**Learner:** The outside water would have low water concentration — lots of salt dissolved in it — so water would move out of the cell by osmosis. The cell would shrink. In red blood cells that's called crenation. In plant cells it's plasmolysis.\r
\r
**Alex:** Okay, I think I get it now. Thanks — that was actually really clear.\r
\r
---\r
\r
**AI (stepping out of role):** Alright, stepping out of Alex mode for the evaluation.\r
\r
Coherence: 3 — the explanation built logically from the basic definition through concentration gradients, equilibration, osmotic pressure, and then specific cellular examples. Each piece connected to the previous one.\r
\r
Completeness: 3 — you covered the core concept, the driving mechanism (concentration gradient), the stopping mechanism (osmotic pressure, turgor), and specific biological applications. Nothing essential was missing for this level.\r
\r
Misconception risk: 2 — one small flag: you said water moves "from where it's concentrated to where it's less concentrated." This is accurate but could be misread as water concentration being the same as overall solution concentration. The technically precise framing is that water moves from lower solute concentration to higher — these say the same thing but from different perspectives. Worth being precise about which framing you use in an exam.\r
\r
Overall: passing teach-back. Score: 3/3/2. The only revision I'd suggest is a one-sentence precision on the water-concentration / solute-concentration relationship. Can you phrase it both ways and tell me which one you'd use in an exam question?\r
\r
---\r
\r
**Edge case handled:** The AI-as-Alex asked authentic novice questions (what's a semi-permeable membrane?, why does it stop?) rather than testing questions. The questions revealed that the learner had a coherent and complete understanding — and the scoring identified a precise language issue that could cause exam problems without that understanding being wrong.\r
\r
## Known Limitations\r
\r
1. **The teach-back evaluator requires the AI to maintain two distinct modes: novice peer and evaluating coach.** Inconsistency between these modes — slipping into coach mode during the teach-back with corrective framing — undermines the novice authenticity and can short-circuit the knowledge-building process. The role separation must be maintained explicitly.\r
\r
2. **Roscoe & Chi (2007) found that knowledge-telling (recitation) is the default mode for most peer tutors.** Without the novice questions interrupting recitation, the teach-back can become a fluency exercise rather than a genuine understanding test. The quality of Alex's questions is the critical variable — and generating authentically "novice" questions requires the AI to accurately model what a non-expert genuinely wouldn't know.\r
\r
3. **The scoring dimensions are approximate and require subject-domain knowledge.** "Misconception risk" in particular requires the AI to know not only whether the learner's explanation is correct but whether it could produce incorrect inferences in a non-expert listener. This is a sophisticated judgment that depends on the AI's accuracy in the specific subject domain.\r
\r
4. **The teach-back format is more effective for some content types than others.** It works exceptionally well for conceptual material with clear mechanisms and relationships (biology, physics, economics). It is less effective for procedural skills (calculations, code execution) and highly contextual material (literary analysis, historical interpretation) where the "correct explanation" is less well-defined.\r
`,i=[r,a,n,o].map(e=>t(e)).filter(Boolean);function c(){return i}export{c as getAll};
