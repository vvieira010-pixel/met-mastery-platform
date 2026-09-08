import{p as t}from"./parser-BMYagtSM.js";import{e as n}from"./SKILL-MrXWtCK_.js";const r=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: learning-progression-builder\r
description: "Build a learning progression showing prerequisite-to-mastery steps for a target skill or understanding. Use when sequencing content, designing diagnostics, or mapping prerequisite gaps."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "curriculum-assessment/learning-progression-builder"\r
skill_name: "Learning Progression Builder"\r
domain: "curriculum-assessment"\r
version: "1.0"\r
evidence_strength: "moderate"\r
evidence_sources:\r
  - "Heritage (2008) — Learning progressions: supporting instruction and formative assessment"\r
  - "Popham (2007) — The lowdown on learning progressions"\r
  - "Daro et al. (2011) — Learning trajectories in mathematics: a foundation for standards, curriculum, assessment, and instruction"\r
  - "Wilson & Bertenthal (2005) — Systems for state science assessment"\r
  - "Hattie & Donoghue (2016) — Learning strategies: a synthesis and conceptual model"\r
input_schema:\r
  required:\r
    - field: "target_skill"\r
      type: "string"\r
      description: "The skill or understanding at the end of the progression — what students should be able to do"\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group range the progression covers"\r
  optional:\r
    - field: "subject_area"\r
      type: "string"\r
      description: "The curriculum subject"\r
    - field: "starting_point"\r
      type: "string"\r
      description: "Where students typically begin — their existing knowledge"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: class data showing where different students currently sit on the progression"\r
    - field: "curriculum_framework"\r
      type: "string"\r
      description: "From context engine: relevant curriculum standards or progression documents"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "progression_map"\r
      type: "array"\r
      description: "Ordered sequence of stages from novice to target, with observable indicators at each stage"\r
    - field: "prerequisite_relationships"\r
      type: "object"\r
      description: "Which stages depend on which — the prerequisite structure"\r
    - field: "common_stuck_points"\r
      type: "array"\r
      description: "Where students commonly stall and why"\r
    - field: "diagnostic_tasks"\r
      type: "array"\r
      description: "Quick tasks that reveal which stage a student is at"\r
chains_well_with:\r
  - "competency-unpacker"\r
  - "formative-assessment-technique-selector"\r
  - "practice-problem-sequence-designer"\r
  - "backwards-design-unit-planner"\r
  - "curriculum-knowledge-architecture-designer"\r
  - "scope-and-sequence-designer"\r
teacher_time: "4 minutes"\r
tags: ["learning-progressions", "trajectories", "prerequisites", "diagnostic", "curriculum-mapping"]\r
---\r
\r
# Learning Progression Builder\r
\r
## What This Skill Does\r
\r
Maps the learning progression from novice to target proficiency for a specific skill domain, identifying the sequential stages of understanding, the prerequisite relationships between them (what must come before what), common stuck points (where students typically stall and why), and diagnostic tasks that reveal which stage a student is currently at. The output is a progression map that teachers can use for three purposes: planning instruction (teaching in the right sequence), formative assessment (diagnosing where a student is), and differentiation (providing the right support for each student's current stage). AI is specifically valuable here because constructing a valid learning progression requires both deep content knowledge (understanding the logical structure of the domain) and pedagogical knowledge (knowing where students actually get stuck, which is not always where the content logic would predict).\r
\r
## Evidence Foundation\r
\r
Heritage (2008) defined learning progressions as "descriptions of the successively more sophisticated ways of thinking about a topic that can follow one another as children learn." She emphasised that progressions are hypothesised pathways, not rigid tracks — students may skip stages, revisit earlier stages, or take alternative routes. Popham (2007) argued that learning progressions are essential for formative assessment because they provide the "map" that makes it possible to locate a student's current understanding and identify the next step. Without a progression, a teacher knows a student is "struggling" but not WHERE in the learning pathway the difficulty lies. Daro et al. (2011) demonstrated that mathematics learning trajectories — empirically validated progressions — provide the foundation for coherent curriculum, assessment, and instruction. Wilson & Bertenthal (2005) applied learning progressions to science assessment, showing that progression-based assessment is more informative than standards-based assessment because it reveals the developmental pathway, not just whether a binary standard is met. Hattie & Donoghue (2016) showed that different learning strategies are effective at different stages of learning — surface strategies (memorisation, rehearsal) are effective early; deep strategies (elaboration, organisation) are effective later — which means the teaching approach should match the student's position on the progression.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Target skill:** What students should be able to do at the end. *e.g. "Solve multi-step equations with the unknown on both sides" / "Write a developed analytical paragraph about a text" / "Design and evaluate a fair scientific experiment"*\r
- **Student level:** Year group range. *e.g. "Year 7–9" / "KS3" / "Middle school"*\r
\r
Optional (injected by context engine if available):\r
- **Subject area:** The curriculum subject\r
- **Starting point:** Where students begin\r
- **Student profiles:** Class data showing current positions\r
- **Curriculum framework:** Relevant standards or progression documents\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in learning progressions and curriculum coherence, with deep knowledge of Heritage's (2008) framework for learning progressions, Popham's (2007) work on progression-based assessment, and Hattie & Donoghue's (2016) research on stage-appropriate learning strategies. You understand that learning progressions are hypothesised pathways — they describe the typical developmental sequence but acknowledge that individual students may follow different routes.\r
\r
Your task is to build a learning progression for:\r
\r
**Target skill:** {{target_skill}}\r
**Student level:** {{student_level}}\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Subject area:** {{subject_area}} — if not provided, infer from the target skill.\r
**Starting point:** {{starting_point}} — if not provided, identify the typical entry point for students at the beginning of the stated level range.\r
**Student profiles:** {{student_profiles}} — if not provided, design for a typical class where students are at various points along the progression.\r
**Curriculum framework:** {{curriculum_framework}} — if not provided, build on general curriculum expectations.\r
\r
Apply these evidence-based principles:\r
\r
1. **Identify sequential stages (Heritage, 2008):**\r
   - Define 5–7 stages from novice to target proficiency.\r
   - Each stage should describe a qualitatively different level of understanding or capability — not just "more" of the same thing.\r
   - Each stage should be OBSERVABLE — described in terms of what the student can DO, not what they "understand" internally.\r
   - Stages should be ordered by typical developmental sequence, acknowledging that some students may not follow this exact order.\r
\r
2. **Map prerequisite relationships (Daro et al., 2011):**\r
   - Which stages MUST come before which? (Not just which usually do, but which logically must.)\r
   - Identify both linear prerequisites (A must come before B) and parallel prerequisites (both C and D must be in place before E).\r
   - Distinguish hard prerequisites (the stage cannot be attempted without the prior) from soft prerequisites (the stage is easier with the prior but possible without it).\r
\r
3. **Identify common stuck points (Popham, 2007):**\r
   - Where do students typically stall? These are the diagnostic priorities.\r
   - For each stuck point: what does "stuck" look like, and what is usually causing it?\r
   - Stuck points often occur at transitions between qualitatively different types of thinking (e.g., from procedural to conceptual, from concrete to abstract).\r
\r
4. **Design diagnostic tasks (Heritage, 2008; Popham, 2007):**\r
   - For each stage, provide a quick task (2–5 minutes) that reveals whether a student has reached that stage.\r
   - Diagnostic tasks should be efficient — they test the KEY indicator of each stage, not everything a student at that stage can do.\r
   - The task should distinguish between adjacent stages — a student at Stage 3 should pass the Stage 3 diagnostic but fail the Stage 4 diagnostic.\r
\r
5. **Stage-appropriate teaching approaches (Hattie & Donoghue, 2016):**\r
   - Early stages: surface strategies — explicit instruction, modelling, practice with feedback.\r
   - Middle stages: deep strategies — elaboration, connection-making, explaining reasoning.\r
   - Later stages: transfer strategies — application to new contexts, evaluation, independent problem-solving.\r
\r
Return your output in this exact format:\r
\r
## Learning Progression: [Target Skill]\r
\r
**From:** [Starting point]\r
**To:** [Target proficiency]\r
**For:** [Student level range]\r
\r
### Progression Map\r
\r
For each stage:\r
**Stage [N]: [Name]**\r
- **What the student can do:** [Observable indicators]\r
- **Key shift from previous stage:** [What's qualitatively different]\r
- **Prerequisite:** [What must be in place first]\r
- **Diagnostic task:** [Quick task that reveals whether the student is at this stage]\r
\r
### Prerequisite Diagram\r
\r
[Visual or textual representation of which stages depend on which]\r
\r
### Common Stuck Points\r
\r
For each stuck point:\r
**Stuck between Stage [X] and Stage [Y]**\r
- **What "stuck" looks like:** [Observable signs]\r
- **What usually causes it:** [The underlying difficulty]\r
- **How to unstick:** [Targeted teaching intervention]\r
\r
### Teaching Implications\r
\r
[How the progression should inform instruction — what to teach first, where to invest time, when to use which teaching strategies]\r
\r
**Self-check before returning output:** Verify that (a) stages are qualitatively distinct, (b) each stage has observable indicators, (c) prerequisite relationships are explicit, (d) diagnostic tasks distinguish between adjacent stages, (e) stuck points are based on common patterns, and (f) the progression represents a developmental pathway, not just a list of topics.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Target skill: "Write a developed analytical paragraph about a literary text, using embedded quotations and explaining the effect of language on the reader" / Student level: "Year 7–9" / Subject area: "English Literature"*\r
\r
---\r
\r
## Learning Progression: Analytical Writing About Literature\r
\r
**From:** Can retell what happens in a text (narrative summary)\r
**To:** Can write a developed analytical paragraph using embedded quotations and explaining the effect of language choices on the reader\r
**For:** Year 7–9 English Literature\r
\r
### Progression Map\r
\r
**Stage 1: Retelling**\r
- **What the student can do:** Summarises what happens in the text in chronological order. "Scrooge is a mean old man who doesn't like Christmas. Then three ghosts visit him and he becomes nice."\r
- **Key shift from previous stage:** Entry point — no prior stage required.\r
- **Prerequisite:** Basic reading comprehension (can understand the events of the text).\r
- **Diagnostic task:** "Tell me what happens in Chapter 1." If the student can retell accurately, they're at Stage 1. If they can ONLY retell (and cannot do Stage 2), they need to progress.\r
\r
**Stage 2: Identifying Features**\r
- **What the student can do:** Points out language features without analysis. "The writer uses a simile." "There is alliteration in this sentence." Can name techniques when they see them.\r
- **Key shift from previous stage:** Moves from "what happens" to "how it's written" — a fundamental shift from content to craft.\r
- **Prerequisite:** Stage 1 (must understand the text before analysing it). Must know the names of at least 5 techniques.\r
- **Diagnostic task:** "Highlight and label any language techniques you can find in this paragraph." If the student can identify 2+ techniques correctly, they're at Stage 2.\r
\r
**Stage 3: Quotation + Comment**\r
- **What the student can do:** Selects a quotation and makes a comment about it: "The writer says 'dark and stormy night' which shows it was scary." The comment is relevant but undeveloped — it's a single statement, not an explanation.\r
- **Key shift from previous stage:** Moves from just naming techniques to selecting evidence and making a claim about it.\r
- **Prerequisite:** Stage 2 (must be able to identify features). Must understand that quotations serve as evidence.\r
- **Diagnostic task:** "Choose a quotation from the text and explain what it shows." If the student selects a relevant quotation and makes one relevant comment (even if brief), they're at Stage 3.\r
\r
**Stage 4: Explaining Effect**\r
- **What the student can do:** Explains what the language does to the reader: "The word 'raging' suggests the sea is violent and out of control, which makes the reader feel afraid for the character." The explanation is specific — it names a feeling, image, or thought the reader experiences.\r
- **Key shift from previous stage:** Moves from commenting on what the text says to explaining what the text DOES — from content to effect. This is the critical analytical shift.\r
- **Prerequisite:** Stage 3 (must be able to select evidence and comment). Must understand that writers make choices to create effects on readers.\r
- **Diagnostic task:** "What effect does the word 'raging' have on the reader? What does it make you think or feel?" If the student can name a specific effect (not "it's effective" or "it makes you want to read on"), they're at Stage 4.\r
\r
**Stage 5: Developed Analytical Paragraph**\r
- **What the student can do:** Writes a paragraph that follows a coherent structure: point → embedded quotation → analysis of specific words → explanation of effect → link to wider meaning. Each part connects logically to the next.\r
- **Key shift from previous stage:** Moves from isolated comments to sustained, structured analysis — multiple sentences that build on each other.\r
- **Prerequisite:** Stage 4 (must be able to explain effect). Must understand paragraph structure and cohesion.\r
- **Diagnostic task:** "Write one paragraph analysing how the writer creates tension in this extract." If the paragraph has a clear point, embedded evidence, specific word-level analysis, and explained effect, the student is at Stage 5.\r
\r
**Stage 6: Evaluative and Comparative Analysis (Target)**\r
- **What the student can do:** Writes analytical paragraphs that consider multiple possible interpretations, compare techniques, evaluate which is most effective, and connect analysis to the writer's wider purpose and themes. Uses evaluative and comparative language: "While the metaphor creates visual power, it is the sentence structure that truly conveys the character's distress."\r
- **Key shift from previous stage:** Moves from single-interpretation analysis to evaluative, comparative, multi-layered analysis — the student considers WHY the writer made this choice over alternatives.\r
- **Prerequisite:** Stage 5 (must be able to write a developed analytical paragraph). Must have sufficient knowledge of the wider text and context.\r
- **Diagnostic task:** "Analyse how the writer creates [effect] in this extract. Consider at least two techniques and evaluate which is more effective." If the student compares techniques and evaluates with reasoning, they're at Stage 6.\r
\r
### Prerequisite Diagram\r
\r
\`\`\`\r
Stage 1 (Retelling)\r
    ↓\r
Stage 2 (Identifying Features) ← [requires: knowledge of technique names]\r
    ↓\r
Stage 3 (Quotation + Comment)\r
    ↓\r
Stage 4 (Explaining Effect) ← [critical shift: content → effect]\r
    ↓\r
Stage 5 (Developed Paragraph) ← [requires: paragraph structure skills]\r
    ↓\r
Stage 6 (Evaluative Analysis) ← [requires: wider text knowledge]\r
\`\`\`\r
\r
Linear progression with lateral prerequisites at Stages 2, 5, and 6.\r
\r
### Common Stuck Points\r
\r
**Stuck between Stage 2 and Stage 3: Can identify techniques but can't select evidence**\r
- **What "stuck" looks like:** The student highlights and labels techniques enthusiastically but freezes when asked to "choose a quotation and explain it." They can spot features but can't select the BEST one for analysis.\r
- **What usually causes it:** The student has been trained to identify ALL techniques (feature-spotting) but not to evaluate which quotation is worth writing about. They see techniques as things to find, not things to analyse.\r
- **How to unstick:** Teach quotation selection: "Here are three quotations. Which one gives you the most to write about? Why?" Practise choosing between quotations before asking students to find their own.\r
\r
**Stuck between Stage 3 and Stage 4: Can comment but can't explain effect (THE MOST COMMON STUCK POINT)**\r
- **What "stuck" looks like:** The student writes "This shows that..." and makes a relevant comment, but the comment describes the content, not the effect. "The metaphor shows the sea is dangerous" (content) vs. "The metaphor makes the reader feel afraid" (effect). Or the student defaults to generic effect claims: "This is effective and makes the reader want to read on."\r
- **What usually causes it:** The student doesn't distinguish between what the text SAYS and what it DOES. They have been taught to find meaning in the text but not to consider the reader's experience. This is a conceptual barrier — they need to understand that analysis is about the EFFECT of language, not just its meaning.\r
- **How to unstick:** Two-question technique: after every quotation, ask "What does this make you SEE?" and "What does this make you FEEL?" These questions force attention toward the reader's experience. Model extensively: show the difference between content comments and effect analysis side by side.\r
\r
**Stuck between Stage 5 and Stage 6: Can write a paragraph but can't evaluate or compare**\r
- **What "stuck" looks like:** The student writes competent PEEL paragraphs that analyse one technique at a time, but cannot compare techniques, consider alternative interpretations, or evaluate relative effectiveness. Their paragraphs are solid but independent — they don't build toward a larger analytical argument.\r
- **What usually causes it:** The student has mastered the procedural skill (writing an analytical paragraph) but hasn't developed the evaluative thinking to go beyond it. Comparison and evaluation are higher-order skills that require the student to hold multiple analyses in mind simultaneously.\r
- **How to unstick:** Teach comparison explicitly: "You've written about the metaphor. Now write about the sentence structure. Now — which technique is MORE effective at creating tension, and why?" Provide a comparison frame: "While [technique 1] creates [effect], [technique 2] is arguably more effective because..."\r
\r
### Teaching Implications\r
\r
1. **Invest the most time at the Stage 3→4 transition.** This is where most students stall and where the critical analytical shift occurs. A student who can explain effect is ready for rapid progress through Stages 5 and 6; a student who can't explain effect will plateau regardless of how much they write.\r
\r
2. **Don't skip stages.** A student who can't yet identify techniques (Stage 2) should not be asked to write an analytical paragraph (Stage 5). The stages build on each other — skipping to the end task without building the foundation produces overwhelm, not learning.\r
\r
3. **Use diagnostic tasks to differentiate.** In any Year 8 class, students will be spread across Stages 2–5. Use the diagnostic tasks to locate each student, then provide stage-appropriate instruction: Stage 2 students practise identification, Stage 3 students practise quotation selection, Stage 4 students practise effect explanation, Stage 5 students practise paragraph construction.\r
\r
4. **Match teaching approach to stage.** Stages 1–3: explicit instruction, modelling, guided practice (surface strategies). Stage 4: think-alouds, worked examples, peer discussion (deep strategies). Stages 5–6: independent practice, self-assessment against criteria, comparative writing tasks (transfer strategies).\r
\r
---\r
\r
## Known Limitations\r
\r
1. **Learning progressions are hypothesised pathways, not fixed tracks.** Individual students may skip stages, regress temporarily, or develop skills in a different order. The progression describes the TYPICAL developmental sequence — the teacher must use professional judgment when students don't follow the expected path.\r
\r
2. **The progression describes skill development in ONE domain.** A student may be at Stage 5 for poetry analysis but Stage 3 for prose analysis, because the underlying texts present different challenges. Progressions are domain-specific — the teacher should assess each domain separately.\r
\r
3. **Diagnostic tasks provide a snapshot, not a comprehensive assessment.** A student who passes the Stage 4 diagnostic task on one occasion may not consistently perform at Stage 4. The diagnostic locates the student's approximate position — ongoing formative assessment provides the more complete picture.\r
`,a=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: goal-setting-protocol-designer\r
description: "Design a structured goal-setting protocol using SMART or implementation-intention frameworks for students. Use when launching units, projects, or developing student self-direction habits."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "self-regulated-learning/goal-setting-protocol-designer"\r
skill_name: "Goal-Setting Protocol Designer"\r
domain: "self-regulated-learning"\r
version: "1.0"\r
evidence_strength: "strong"\r
evidence_sources:\r
  - "Locke & Latham (1990) — A Theory of Goal Setting and Task Performance"\r
  - "Locke & Latham (2002) — Building a practically useful theory of goal setting and task motivation"\r
  - "Zimmerman & Bandura (1994) — Impact of self-regulatory influences on writing course attainment"\r
  - "Schunk (1990) — Goal setting and self-efficacy during self-regulated learning"\r
  - "Morisano et al. (2010) — Setting, elaborating, and reflecting on personal goals improves academic performance"\r
input_schema:\r
  required:\r
    - field: "learning_context"\r
      type: "string"\r
      description: "The unit, project, or task students are setting goals for"\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group and goal-setting experience level"\r
    - field: "timeframe"\r
      type: "string"\r
      description: "Duration over which goals will be pursued"\r
  optional:\r
    - field: "goal_type"\r
      type: "string"\r
      description: "Process goals, outcome goals, or both"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: self-efficacy levels, previous goal-setting data"\r
    - field: "success_criteria"\r
      type: "string"\r
      description: "From context engine: rubric or assessment criteria for the task"\r
    - field: "subject_area"\r
      type: "string"\r
      description: "Subject context"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "protocol"\r
      type: "object"\r
      description: "Step-by-step goal-setting protocol with teacher script and student templates"\r
    - field: "goal_examples"\r
      type: "array"\r
      description: "Modelled examples of weak vs. strong goals for this context"\r
    - field: "monitoring_checkpoints"\r
      type: "array"\r
      description: "Scheduled check-in points for goal progress review"\r
    - field: "student_template"\r
      type: "string"\r
      description: "Copy-pasteable goal-setting template for students"\r
chains_well_with:\r
  - "self-regulation-scaffold-generator"\r
  - "metacognitive-prompt-library"\r
  - "agency-scaffold-generator"\r
  - "self-efficacy-builder-sequence"\r
teacher_time: "4 minutes"\r
tags: ["goal-setting", "motivation", "self-regulation", "planning", "self-efficacy"]\r
---\r
\r
# Goal-Setting Protocol Designer\r
\r
## What This Skill Does\r
\r
Generates a structured goal-setting protocol that guides students through setting specific, proximal, process-focused goals for a unit, project, or task — including teacher modelling scripts, weak-vs-strong goal examples, monitoring checkpoints, and a student template. The protocol is calibrated to developmental level and timeframe. AI is specifically valuable here because effective goal-setting requires understanding three overlapping bodies of research (Locke & Latham's goal-setting theory, Zimmerman's self-regulation model, Bandura's self-efficacy theory) and translating them into age-appropriate, task-specific scaffolds. Most school goal-setting exercises produce vague aspirations ("do my best," "get better at maths") that research shows have no motivational effect.\r
\r
## Evidence Foundation\r
\r
Locke & Latham (1990, 2002) established that goals improve performance through four mechanisms: directing attention, energising effort, increasing persistence, and promoting strategy development — but only when goals are specific (not vague), challenging (not easy), and accepted by the learner. Vague goals ("do your best") are no better than no goals at all. Zimmerman & Bandura (1994) demonstrated that self-set goals combined with self-monitoring produce stronger academic outcomes than externally assigned goals, because self-set goals enhance both self-efficacy and commitment. Schunk (1990) showed that proximal goals (short-term, achievable within days) are more effective than distal goals (long-term) for building self-efficacy in younger learners, because they provide more frequent success experiences. Morisano et al. (2010) found that a structured goal-setting and reflection intervention significantly improved academic performance in struggling university students. Critically, process goals ("I will use the PEEL structure in every paragraph") outperform outcome goals ("I will get an A") because students can control their process but not always their outcome — and process goals build transferable strategies.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Learning context:** What students are setting goals for. *e.g. "A 4-week persuasive writing unit" / "End-of-year science exam preparation" / "A design technology project: building a working circuit"*\r
- **Student level:** Year group and goal-setting experience. *e.g. "Year 7, first time doing structured goal-setting" / "Year 10, have done goal-setting before but goals tend to be vague"*\r
- **Timeframe:** Duration. *e.g. "4 weeks" / "one lesson" / "Term 2"*\r
\r
Optional (injected by context engine if available):\r
- **Goal type:** Whether to focus on process, outcome, or both\r
- **Student profiles:** Self-efficacy levels, previous goal data\r
- **Success criteria:** Rubric or assessment criteria to anchor goals to\r
- **Subject area:** Subject context\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in motivation and goal-setting research, specialising in Locke & Latham's (1990, 2002) goal-setting theory, Zimmerman's self-regulation framework, and Bandura's self-efficacy theory. You understand why most school goal-setting fails (goals are vague, distal, and outcome-focused) and how to design protocols that produce goals students can actually pursue.\r
\r
Your task is to design a goal-setting protocol for the following:\r
\r
**Learning context:** {{learning_context}}\r
**Student level:** {{student_level}}\r
**Timeframe:** {{timeframe}}\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Goal type:** {{goal_type}} — if not provided, default to process goals for younger/novice students and a mix of process and outcome goals for older/experienced students. Process goals are always the priority.\r
**Student profiles:** {{student_profiles}} — if not provided, design for a typical class at the stated experience level.\r
**Success criteria:** {{success_criteria}} — if provided, anchor goal options to specific criteria from the rubric. If not provided, generate appropriate criteria based on the learning context.\r
**Subject area:** {{subject_area}} — if not provided, infer from the learning context.\r
\r
Apply these evidence-based principles:\r
\r
1. **Specific over vague (Locke & Latham, 2002):** Every goal must be specific enough that both the student and teacher can unambiguously determine whether it has been met. "Improve my writing" fails. "Use at least two pieces of evidence in every analytical paragraph" passes.\r
\r
2. **Process over outcome (Zimmerman & Bandura, 1994):** Prioritise goals about what students will DO (strategies, behaviours, effort allocation) over what they will ACHIEVE (grades, scores). Students control their process; they don't fully control their outcomes. Process goals also build transferable strategies.\r
\r
3. **Proximal over distal (Schunk, 1990):** For younger students especially, break long-term goals into weekly or even daily sub-goals. Proximal goals provide frequent success experiences that build self-efficacy. A Year 7 student with a term-long goal will lose track; a Year 7 student with a weekly goal can see progress.\r
\r
4. **Challenging but achievable:** Goals that are too easy don't motivate. Goals that are too hard undermine self-efficacy. Pitch goals at the "stretch zone" — requires effort but is achievable with good strategy use. For mixed-ability classes, differentiate the challenge level of goals.\r
\r
5. **Self-set with guidance (Zimmerman & Bandura, 1994):** Students should choose their own goals from a structured set of options, not have goals imposed. Self-set goals produce stronger commitment. But unguided goal-setting produces vague goals — so provide a menu or framework.\r
\r
6. **Built-in monitoring and revision:** Goals without check-in points decay. Build scheduled monitoring moments (at least weekly for multi-week timeframes) where students evaluate progress and adjust.\r
\r
7. **Model weak vs. strong goals:** Students need to see the contrast between an ineffective goal and an effective one, with explicit explanation of why the strong goal is better.\r
\r
Return your output in this exact format:\r
\r
## Goal-Setting Protocol: [Learning Context]\r
\r
**For:** [Student level]\r
**Timeframe:** [Duration]\r
\r
### Step 1: Teacher Modelling\r
[A script showing the teacher modelling their own goal-setting process, including thinking aloud about why vague goals don't work]\r
\r
### Step 2: Weak vs. Strong Goal Examples\r
[3 pairs of weak/strong goals specific to this learning context, with explanation of what makes each strong]\r
\r
### Step 3: Goal-Setting Framework\r
[The framework students use to set their goals — structured choices, sentence stems, or menu options depending on developmental level]\r
\r
### Step 4: Monitoring Checkpoints\r
[Scheduled check-in points with specific progress-review prompts]\r
\r
### Step 5: Reflection and Revision\r
[End-of-cycle reflection protocol — evaluate goal attainment and set revised goals]\r
\r
### Student Template\r
[Copy-pasteable goal-setting document for students]\r
\r
**Self-check before returning output:** Verify that (a) all example goals are specific and measurable, (b) process goals outnumber outcome goals, (c) the protocol includes monitoring checkpoints, (d) goals are calibrated to be challenging but achievable for the stated level, (e) students choose their own goals within a structured framework rather than being assigned them, and (f) weak-vs-strong examples clearly explain what distinguishes them.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Learning context: "Year 8 History — 5-week unit on the Industrial Revolution, culminating in an assessed source-analysis essay" / Student level: "Year 8, have done basic goal-setting before but goals are typically vague ('do well in the essay')" / Timeframe: "5 weeks"*\r
\r
---\r
\r
## Goal-Setting Protocol: Year 8 History — Industrial Revolution Unit\r
\r
**For:** Year 8, developing goal-setters\r
**Timeframe:** 5 weeks (15 lessons)\r
\r
### Step 1: Teacher Modelling (5 minutes, Lesson 1)\r
\r
"I'm going to set a goal for this unit too, and I want you to watch how I think about it.\r
\r
My first instinct is to say: 'My goal is for you all to do well in the essay.' But let me think about why that's not a useful goal. Can I measure 'do well'? Not really — it means different things to different people. Can I control it? Not entirely — your marks depend on what you write, not just what I teach. Is it specific? No.\r
\r
Let me try again. What do I actually want to improve this unit? Last unit, I noticed that when we did source analysis, lots of you described what the source *said* but didn't explain what it *tells us* — you weren't making inferences. So here's my goal:\r
\r
*'In every source analysis this unit, I will model how to make an inference — not just what the source says, but what it suggests about life during the Industrial Revolution. I will do at least one live example per lesson.'*\r
\r
That's specific — I can check it at the end of each lesson. It's about process — what I will DO, not what the result will be. And it's challenging — I sometimes rush past the modelling. That's my goal. Now you're going to set yours."\r
\r
### Step 2: Weak vs. Strong Goal Examples\r
\r
| Weak Goal | Strong Goal | Why the strong goal is better |\r
|-----------|------------|------------------------------|\r
| "Do well in the essay" | "In my essay, I will explain what each source *suggests* about the Industrial Revolution, not just describe what it says — I will use the phrase 'This suggests that...' at least 3 times" | Specific (exactly what to do and how many times), process-focused (a strategy the student can practise), measurable (count the phrases) |\r
| "Learn about the Industrial Revolution" | "Each week, I will write a 3-sentence summary of the key cause and effect we studied, without looking at my notes, to test whether I actually remember it" | Process-focused (retrieval practice strategy), proximal (weekly), builds genuine understanding rather than assuming it will happen |\r
| "Try harder in History" | "I will complete the source analysis homework on time every week, and when I get feedback, I will re-do one paragraph using the teacher's comments before moving on" | Specific behaviours (on-time homework + responding to feedback), within the student's control, directly addresses a common obstacle |\r
\r
### Step 3: Goal-Setting Framework\r
\r
Students choose **one process goal** and **one knowledge goal** from the menus below, or write their own following the same structure.\r
\r
**Process Goal Menu** (choose or adapt one):\r
- "In every source analysis, I will use the phrase 'This suggests that...' to make at least one inference beyond what the source literally says."\r
- "Each week, I will test myself by writing what I remember about the week's lesson without notes — if I can't remember, I'll re-read before the next lesson."\r
- "When I get feedback on my writing, I will re-do one paragraph using the feedback before moving on, instead of just reading the comment."\r
- "In class discussions, I will contribute at least one idea per lesson — even if I'm not sure it's right."\r
- "Write my own:" _______________ (Must include: what I will do + how often + how I'll know I've done it)\r
\r
**Knowledge Goal Menu** (choose or adapt one):\r
- "By the end of this unit, I will be able to explain three ways the Industrial Revolution changed working people's lives, with a specific example for each."\r
- "By the end of this unit, I will be able to analyse a source I've never seen before and make two inferences about what it suggests."\r
- "By the end of this unit, I will understand why historians disagree about whether the Industrial Revolution was mostly positive or mostly negative."\r
- "Write my own:" _______________ (Must include: what I'll know or be able to do + how I'd prove it)\r
\r
### Step 4: Monitoring Checkpoints\r
\r
| Week | Checkpoint | Prompt |\r
|------|-----------|--------|\r
| End of Week 1 | In-class (3 min) | "Look at your process goal. Have you done the thing you said you'd do this week? If yes, tick. If no, what got in the way? What will you change this week to make it happen?" |\r
| End of Week 2 | Written (5 min) | "Give yourself a score: 1 (haven't started), 2 (tried once), 3 (doing it regularly), 4 (it's becoming automatic). For your knowledge goal: can you pass the test right now? Try writing your answer without notes and see." |\r
| End of Week 3 | Partner check (5 min) | "Explain your goals to a partner. Ask them: 'Have you seen me doing this in class?' Their observation matters because we're often bad judges of our own habits." |\r
| End of Week 4 | Teacher conference (2 min per student, during independent work) | Teacher asks: "Show me evidence you've worked toward your goal. What's one thing you've improved? What would you change for the essay?" |\r
\r
### Step 5: Reflection and Revision (Week 5, after essay submission)\r
\r
**Post-essay reflection (10 minutes):**\r
\r
1. "Read your process goal from Week 1. Did you do it? Score yourself honestly: 1 (didn't do it), 2 (sometimes), 3 (mostly), 4 (consistently)."\r
2. "Read your knowledge goal. Can you do the thing you set out to do? Prove it — write 2–3 sentences demonstrating it right now."\r
3. "Complete this sentence: 'The strategy that helped me most this unit was _____________, and I know it helped because _____________.'"\r
4. "Complete this sentence: 'Next unit, I would set a different/better goal because _____________.'"\r
5. "If you scored yourself a 3 or 4 on your process goal, set a harder version for next unit. If you scored 1 or 2, either revise the goal to make it more realistic OR identify what blocked you and address that first."\r
\r
### Student Template\r
\r
---\r
\r
**MY GOALS — Industrial Revolution Unit**\r
\r
**Name:** _______________ **Date:** _______________\r
\r
**My process goal** (what I will DO):\r
_______________________________________________________________\r
How often: _______________ How I'll know I've done it: _______________\r
\r
**My knowledge goal** (what I'll KNOW or be able to DO):\r
_______________________________________________________________\r
How I'd prove it: _______________\r
\r
**Weekly check-ins:**\r
| Week | Did I do my process goal this week? (Y/N) | Score (1–4) | What helped or got in the way? |\r
|------|------------------------------------------|-------------|-------------------------------|\r
| 1 | | | |\r
| 2 | | | |\r
| 3 | | | |\r
| 4 | | | |\r
\r
**After the essay:**\r
- Did I meet my process goal? Score: ___\r
- Can I demonstrate my knowledge goal right now? ___\r
- Strategy that helped most: _______________\r
- Goal I'd set next time: _______________\r
\r
---\r
\r
## Known Limitations\r
\r
1. **Goal-setting is motivating for students with moderate-to-high self-efficacy but can backfire for students with very low self-efficacy.** A student who has repeatedly failed at a subject may experience structured goal-setting as another opportunity for documented failure. For these students, begin with extremely proximal, low-stakes goals (daily, easily achievable) to build early success experiences before increasing challenge. Schunk (1990) emphasises that goal difficulty must be calibrated to current self-efficacy.\r
\r
2. **Process goals require teachers to value process, not just outcomes.** If the classroom culture only celebrates grades and rankings, students will set outcome goals regardless of the protocol because that's what's actually rewarded. The protocol works best in classrooms where effort, strategy use, and improvement are visibly valued.\r
\r
3. **Students need to see the goal-setting protocol used consistently across multiple units to develop the habit.** A one-off goal-setting activity in one unit will not produce lasting self-regulation. The research shows that SRL interventions need sustained implementation — Dignath & Büttner (2008) found the strongest effects in interventions lasting 8+ weeks. Teachers should use a consistent goal-setting framework across the year, adapting the content but keeping the structure.\r
`,s=[r,a,n].map(e=>t(e)).filter(Boolean);function l(){return s}export{l as getAll};
