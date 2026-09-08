import{p as n}from"./parser-BMYagtSM.js";import{r as t}from"./SKILL-CkyYM-d3.js";const r=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: differentiation-adapter\r
description: "Adapt a classroom task for specific learner needs while preserving the core learning objective intact. Use when differentiating for SEND, EAL, gifted, ADHD, dyslexia, or anxiety."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "curriculum-assessment/differentiation-adapter"\r
skill_name: "Differentiation Adapter"\r
domain: "curriculum-assessment"\r
version: "1.0"\r
evidence_strength: "moderate"\r
evidence_sources:\r
  - "Tomlinson (2001, 2014) — How to Differentiate Instruction in Academically Diverse Classrooms"\r
  - "Rose & Meyer (2002) — Teaching Every Student in the Digital Age: Universal Design for Learning"\r
  - "Vygotsky (1978) — Mind in Society: the zone of proximal development"\r
  - "Hattie (2009) — Visible Learning: differentiation and responsive teaching"\r
  - "CAST (2018) — Universal Design for Learning Guidelines version 2.2"\r
input_schema:\r
  required:\r
    - field: "original_task"\r
      type: "string"\r
      description: "The task as designed for the class"\r
    - field: "learner_profile"\r
      type: "string"\r
      description: "The specific learner need — e.g. extension, support, EAL, ADHD, dyslexia, anxiety, gifted"\r
    - field: "learning_objective"\r
      type: "string"\r
      description: "The learning objective — must remain the same across all differentiated versions"\r
  optional:\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group"\r
    - field: "subject_area"\r
      type: "string"\r
      description: "The curriculum subject"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: specific diagnoses, support plans, prior attainment"\r
    - field: "available_support"\r
      type: "string"\r
      description: "TA availability, technology, specialist resources"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "adapted_task"\r
      type: "object"\r
      description: "The differentiated version with specific modifications"\r
    - field: "what_changed"\r
      type: "string"\r
      description: "Explicit statement of what was modified and what was maintained"\r
    - field: "objective_check"\r
      type: "string"\r
      description: "Verification that the learning objective is maintained"\r
    - field: "implementation_notes"\r
      type: "string"\r
      description: "Practical notes for the teacher on implementing the adaptation"\r
chains_well_with:\r
  - "scaffolded-task-modifier"\r
  - "cognitive-load-analyser"\r
  - "formative-assessment-technique-selector"\r
  - "practice-problem-sequence-designer"\r
teacher_time: "3 minutes"\r
tags: ["differentiation", "UDL", "inclusion", "SEND", "adaptation"]\r
---\r
\r
# Differentiation Adapter\r
\r
## What This Skill Does\r
\r
Adapts a task for a specific learner profile — extension, support, EAL, ADHD, dyslexia, anxiety, visual impairment, autism, gifted and talented — while explicitly maintaining the same learning objective. The critical principle is that differentiation modifies the ROUTE to learning, not the DESTINATION. A student with dyslexia attempting the same learning objective as their peers may need different input formats, different response formats, and different scaffolding — but they should be working toward the same understanding. The output includes the adapted task, an explicit statement of what changed and what stayed the same, a verification that the learning objective is maintained, and implementation notes. AI is specifically valuable here because effective differentiation requires knowledge of both the learner profile (what barriers does this profile create?) and the task (which elements of this task create those barriers?) — a two-way analysis that must be done for each combination of task and learner need.\r
\r
## Evidence Foundation\r
\r
Tomlinson (2001, 2014) established the framework for differentiated instruction, identifying three dimensions of differentiation: content (what students learn), process (how they learn it), and product (how they demonstrate learning). She emphasised that differentiation should be by readiness, interest, and learning profile — NOT by learning style (which is excluded from this library as debunked). Rose & Meyer (2002) developed Universal Design for Learning (UDL), arguing that curricula should be designed from the outset to be accessible to all learners through three principles: multiple means of engagement (the "why" of learning), multiple means of representation (the "what"), and multiple means of action and expression (the "how"). Vygotsky (1978) established that instruction should target the Zone of Proximal Development — what the learner can do with appropriate support but not yet independently. Hattie (2009) found that differentiation has moderate effect sizes overall but varies significantly by implementation quality — poorly implemented differentiation (giving weaker students easier work) can actually reduce achievement by lowering expectations. CAST (2018) provided the most current UDL guidelines with specific implementation strategies.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Original task:** The task as designed. *e.g. "Read the extract from 'A Christmas Carol' and write a paragraph analysing how Dickens presents Scrooge's transformation, using quotations as evidence."*\r
- **Learner profile:** The specific need. *e.g. "Extension — student who finishes quickly and needs deeper challenge" / "Support — student with dyslexia who struggles with reading-heavy tasks" / "ADHD — student who struggles with sustained focus on extended writing"*\r
- **Learning objective:** What all students should learn. *e.g. "Analyse how Dickens presents character change using textual evidence."*\r
\r
Optional (injected by context engine if available):\r
- **Student level:** Year group\r
- **Subject area:** The curriculum subject\r
- **Student profiles:** Specific diagnoses, support plans, prior attainment\r
- **Available support:** TA, technology, specialist resources\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in differentiated instruction and inclusive education, with deep knowledge of Tomlinson's (2001, 2014) differentiation framework, Rose & Meyer's (2002) Universal Design for Learning principles, and CAST's (2018) UDL guidelines. You understand that effective differentiation modifies the ROUTE to learning, not the DESTINATION — all students work toward the same learning objective, but the pathway is adapted to remove barriers specific to each learner's profile.\r
\r
IMPORTANT: Differentiation by learning style (visual/auditory/kinaesthetic preferences) is NOT supported — this is excluded from this library as debunked (Pashler et al., 2008). Differentiation by readiness, specific learning needs, and learner profile IS supported.\r
\r
Your task is to adapt:\r
\r
**Original task:** {{original_task}}\r
**Learner profile:** {{learner_profile}}\r
**Learning objective:** {{learning_objective}}\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Student level:** {{student_level}} — if not provided, infer from the task.\r
**Subject area:** {{subject_area}} — if not provided, infer from the task.\r
**Student profiles:** {{student_profiles}} — if not provided, base adaptations on general research about the stated learner profile.\r
**Available support:** {{available_support}} — if not provided, assume standard classroom resources with no specialist TA.\r
\r
Apply these evidence-based principles:\r
\r
1. **Same objective, different route (Tomlinson, 2001):**\r
   - The learning objective must be identical for the adapted and original task.\r
   - Modify HOW the student engages with the content or demonstrates their learning, not WHAT they learn.\r
   - If the adaptation reduces cognitive demand, it has gone too far — it should reduce barriers, not reduce thinking.\r
\r
2. **Profile-specific adaptations (UDL, CAST 2018):**\r
   Adapt based on what the research says about each learner profile:\r
   - **Extension/Gifted:** Increase depth and complexity — not more of the same, but qualitatively different challenge. Abstract thinking, multiple perspectives, evaluation, creation.\r
   - **Support/Below expected level:** Additional scaffolding — sentence frames, graphic organisers, reduced volume (not reduced difficulty), worked examples to reference.\r
   - **Dyslexia:** Reduce reading load without reducing thinking. Larger font, coloured overlay, audio version of text, key quotations pre-selected, scribe option for writing. Focus on demonstrating UNDERSTANDING, not reading fluency.\r
   - **ADHD:** Break task into shorter chunks with check-in points. Reduce unnecessary information. Provide movement breaks. Use timers for focused bursts. Minimise distractions in the task presentation.\r
   - **EAL:** Language scaffolds (sentence frames, word banks, glossary, bilingual support) — see the EAL domain skills for detailed approaches.\r
   - **Anxiety:** Reduce performance pressure. Allow draft attempts. Provide clear structure. Offer choice of response format. Avoid cold-calling or public demonstration of work-in-progress.\r
   - **Autism:** Provide explicit, unambiguous instructions. Avoid figurative language in task instructions (or gloss it). Provide predictable structure. Allow additional processing time.\r
   - **Visual impairment:** Enlarged text, high contrast, audio alternatives, tactile resources where appropriate.\r
\r
3. **UDL multiple means (Rose & Meyer, 2002):**\r
   - **Multiple means of representation:** Can the content be presented differently? (Audio, visual, simplified text alongside original, graphic organiser)\r
   - **Multiple means of action and expression:** Can the student demonstrate learning differently? (Verbal instead of written, diagram instead of essay, recorded instead of live)\r
   - **Multiple means of engagement:** Can the task be connected to the student's interests or motivations?\r
\r
4. **Avoid common differentiation errors (Hattie, 2009):**\r
   - Do NOT give a simpler version of the task to struggling students — this lowers expectations and reduces learning.\r
   - Do NOT give "more work" to extension students — depth, not volume.\r
   - Do NOT assume that the adapted version is inherently "lower" — it should be equally demanding but differently accessible.\r
\r
Return your output in this exact format:\r
\r
## Adapted Task: [Learner Profile]\r
\r
**Original task:** [Brief description]\r
**Adapted for:** [Learner profile]\r
**Learning objective:** [Must be identical to original]\r
\r
### The Adapted Task\r
\r
[Complete adapted version of the task with all modifications in place]\r
\r
### What Changed and What Stayed the Same\r
\r
**Changed:** [Specific modifications — what was adapted and why]\r
**Maintained:** [What was deliberately kept the same — especially cognitive demand and learning objective]\r
\r
### Objective Check\r
\r
[Explicit verification: "The adapted task still requires the student to [learning objective] because..."]\r
\r
### Implementation Notes\r
\r
[Practical advice for the teacher: how to introduce the adaptation, how to avoid singling the student out, what to watch for]\r
\r
**Self-check before returning output:** Verify that (a) the learning objective is identical, (b) adaptations address the specific barriers of the stated learner profile, (c) cognitive demand is maintained — the adapted task is not easier, just more accessible, (d) the adaptation is based on research about the learner profile, not on learning style preferences, and (e) the implementation notes address how to manage the adaptation in a classroom without stigmatising the student.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Original task: "Read the extract from 'A Christmas Carol' and write a paragraph analysing how Dickens presents Scrooge's transformation, using quotations as evidence." / Learner profile: "Dyslexia — student has a reading age approximately 2 years below chronological age, struggles with decoding longer texts, avoids reading tasks, but demonstrates strong verbal analytical skills in class discussion" / Learning objective: "Analyse how Dickens presents character change using textual evidence" / Student level: "Year 9" / Subject area: "English Literature"*\r
\r
---\r
\r
## Adapted Task: Dyslexia\r
\r
**Original task:** Read the extract from 'A Christmas Carol' and write a paragraph analysing how Dickens presents Scrooge's transformation, using quotations as evidence.\r
**Adapted for:** Dyslexia — strong verbal analysis, reading age ~2 years below chronological age\r
**Learning objective:** Analyse how Dickens presents character change using textual evidence\r
\r
### The Adapted Task\r
\r
**Reading the extract:**\r
- Provide the extract printed on cream/buff paper (reduces visual contrast stress) in a minimum 14pt font with 1.5 line spacing.\r
- Pre-highlight 4 key quotations that show Scrooge's transformation — these are the quotations the student should focus on. This removes the barrier of scanning dense text to find evidence (a reading-fluency task) while maintaining the requirement to ANALYSE the evidence (the actual learning objective).\r
- If audio is available, provide an audio recording of the extract that the student can listen to while following the text. This supports decoding without removing the text entirely.\r
\r
**Analysing and writing:**\r
- Provide a PEEL paragraph frame:\r
  - **Point:** "Dickens presents Scrooge's transformation by..."\r
  - **Evidence:** "This is shown when Dickens writes '___' (one of the highlighted quotations)"\r
  - **Explain:** "This quotation suggests that Scrooge has changed because..."\r
  - **Link:** "This shows the reader that..."\r
- The student must supply their own analytical thinking at each stage — the frame structures the writing, not the analysis.\r
- **Alternative response option:** If writing is the primary barrier (not analysis), offer the student the choice to record their paragraph verbally (voice recording or dictation to a scribe) instead of writing it. The analytical demand is identical; only the output format changes.\r
\r
### What Changed and What Stayed the Same\r
\r
**Changed:**\r
- Text presentation: larger font, cream paper, increased spacing — reduces decoding load\r
- Quotations pre-highlighted: removes the need to scan the full text for evidence — a reading-fluency task, not an analytical task\r
- Audio support: optional listening alongside reading\r
- Writing scaffold: PEEL frame provided to structure the paragraph\r
- Alternative output: verbal response option available\r
\r
**Maintained:**\r
- The learning objective: analyse how Dickens presents character change using textual evidence\r
- The requirement to use specific quotations as evidence\r
- The analytical demand: the student must explain WHAT the quotation shows and WHY it's significant\r
- The quality expectation: the analysis should be just as perceptive as any other student's\r
- The text itself: the same extract, not a simplified version\r
\r
### Objective Check\r
\r
The adapted task still requires the student to **analyse how Dickens presents character change using textual evidence** because:\r
- The student must still READ the extract (with support, but the same text)\r
- The student must still SELECT a quotation and explain its significance\r
- The student must still ANALYSE — explain what the quotation reveals about Scrooge's transformation and why Dickens chose to present it this way\r
- The pre-highlighting removes a reading-fluency barrier, not an analytical barrier — the student still chooses which highlighted quotation to use and must explain its significance independently\r
- The PEEL frame structures the writing but does not supply the analytical content — every "Explain" and "Link" section requires the student's own thinking\r
\r
### Implementation Notes\r
\r
1. **Introduce the adaptation discreetly.** Don't announce "This is the dyslexia version." Instead, make some adaptations available to all students: print the extract on cream paper for everyone (it helps all readers). Make the audio version available to the whole class. Differentiate the highlighted quotations individually — hand them out rather than projecting.\r
\r
2. **Monitor the analysis, not the writing.** This student's strength is verbal analysis. If the written response is weaker than expected, check whether the barrier is writing-mechanics (spelling, handwriting, sentence construction) or analysis. If the student can explain their analysis verbally but not in writing, the barrier is writing production, not understanding — and the voice-recording option should be offered.\r
\r
3. **Don't lower expectations for analytical quality.** The student with dyslexia has strong verbal analytical skills. Their analysis should be held to the same standard as any other student's. The adaptation removes a barrier; it does not lower the bar. If the student's written paragraph is thin, the response is "Can you tell me more about what this quotation shows?" — pushing for depth — not "Well done for trying."\r
\r
4. **Revisit the pre-highlighting over time.** Pre-selecting quotations is a scaffold that should be reduced as the student develops reading stamina and confidence. Next time, highlight 6 quotations and ask the student to choose the best 2. Eventually, provide the text without highlighting and see if the student can identify evidence independently (perhaps with more time).\r
\r
---\r
\r
## Known Limitations\r
\r
1. **The adaptation is based on general research about the learner profile, not on the individual student.** Dyslexia manifests differently in different students — some struggle primarily with decoding, others with reading speed, others with working memory. The teacher's knowledge of the specific student is essential for refining the adaptation. If the student's dyslexia primarily affects spelling rather than reading, the adaptations should be different.\r
\r
2. **Differentiation by learning style is explicitly excluded.** This skill does not adapt tasks based on "visual," "auditory," or "kinaesthetic" preferences — the evidence does not support this approach (Pashler et al., 2008). Adaptations are based on researched barriers associated with specific learning needs, not on preferences.\r
\r
3. **Adapted tasks can inadvertently signal low expectations.** If a student consistently receives "different" work, they may internalise the message that they are less capable. The implementation notes address this, but the teacher must be vigilant about framing adaptations as access support (like glasses for someone who needs them), not as reduced expectations. The goal is equity — the same learning, differently accessed — not a lower track.\r
`,i=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: scaffolded-task-modifier\r
description: "Modify a classroom task with language scaffolds that preserve cognitive demand for EAL learners. Use when adapting existing tasks for students at different English proficiency levels."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "eal-language-development/scaffolded-task-modifier"\r
skill_name: "Scaffolded Task Modifier"\r
domain: "eal-language-development"\r
version: "1.0"\r
evidence_strength: "strong"\r
evidence_sources:\r
  - "Gibbons (2002, 2015) — Scaffolding Language, Scaffolding Learning: scaffolding that challenges rather than simplifies"\r
  - "Cummins (2000) — Language, Power and Pedagogy: the BICS/CALP and quadrant frameworks"\r
  - "Hammond & Gibbons (2005) — Putting scaffolding to work: the contribution of scaffolding in articulating ESL education"\r
  - "Vygotsky (1978) — Mind in Society: the zone of proximal development"\r
  - "Walqui (2006) — Scaffolding instruction for English language learners: a conceptual framework"\r
input_schema:\r
  required:\r
    - field: "original_task"\r
      type: "string"\r
      description: "The task as originally designed for the class"\r
    - field: "target_proficiency"\r
      type: "string"\r
      description: "The language proficiency level of the students being scaffolded for — e.g. New to English, Early Acquisition, Developing, Consolidating"\r
    - field: "subject_area"\r
      type: "string"\r
      description: "The curriculum subject"\r
  optional:\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: first languages, specific language needs, cognitive ability"\r
    - field: "learning_objective"\r
      type: "string"\r
      description: "The learning objective — what ALL students should understand, regardless of language level"\r
    - field: "task_materials"\r
      type: "string"\r
      description: "Description of texts, worksheets, or resources used in the original task"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "modified_task"\r
      type: "object"\r
      description: "The scaffolded version of the task with language supports added and cognitive demand maintained"\r
    - field: "cognitive_demand_check"\r
      type: "string"\r
      description: "Explicit verification that the modification maintains cognitive challenge"\r
    - field: "scaffold_types_used"\r
      type: "array"\r
      description: "List of scaffolding strategies applied, with rationale for each"\r
    - field: "removal_plan"\r
      type: "string"\r
      description: "How and when to remove scaffolds as proficiency increases"\r
chains_well_with:\r
  - "language-demand-analyser"\r
  - "vocabulary-tiering-tool"\r
  - "academic-language-sentence-frame-generator"\r
  - "cognitive-load-analyser"\r
teacher_time: "4 minutes"\r
tags: ["scaffolding", "EAL", "differentiation", "cognitive-demand", "task-modification"]\r
---\r
\r
# Scaffolded Task Modifier\r
\r
## What This Skill Does\r
\r
Adapts a classroom task for a specific language proficiency level while explicitly maintaining cognitive demand — ensuring that EAL students engage with the same thinking as their peers, even when they need language support to do so. The critical design principle is that scaffolding should reduce LANGUAGE barriers, not reduce THINKING. Many well-intentioned task modifications inadvertently lower cognitive demand: giving EAL students a simpler version, removing the analytical component, or replacing an open question with a multiple-choice one. This skill guards against that by producing a modified task alongside an explicit cognitive demand check, verifying that the modification changes the linguistic access route but not the intellectual destination. AI is specifically valuable here because maintaining cognitive demand during scaffolding requires simultaneously understanding the task's intellectual purpose, the student's language level, and the specific scaffolding strategies that support access without reducing challenge — a three-way analysis most teachers don't have time to do.\r
\r
## Evidence Foundation\r
\r
Gibbons (2002, 2015) established the fundamental principle that scaffolding for EAL students must challenge rather than simplify — the goal is to support students in doing MORE than they could alone, not to reduce what they're asked to do. Cummins (2000) provided the quadrant model showing that tasks vary along two dimensions: cognitive demand (high/low) and contextual support (embedded/reduced). Effective EAL scaffolding moves a task from quadrant D (high demand, reduced context — inaccessible) to quadrant B (high demand, embedded context — challenging but accessible) — NOT from quadrant D to quadrant A (low demand, embedded context — accessible but unchallenging). Hammond & Gibbons (2005) identified two levels of scaffolding: designed-in scaffolding (planned before the lesson — graphic organisers, sentence frames, pre-teaching vocabulary) and interactional scaffolding (contingent teacher support during the lesson — recasting, elaborating, guiding). Vygotsky (1978) established that learning occurs in the Zone of Proximal Development — what the learner can do with support but not yet independently. Walqui (2006) identified six scaffolding strategies for EAL learners: modelling, bridging, contextualising, building schema, representing text, and developing metacognition.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Original task:** The task as designed for the class. *e.g. "Write a balanced argument essay on whether school uniforms should be compulsory" / "Analyse the data in the table and explain what it shows about population growth" / "Read the extract and answer the inference questions"*\r
- **Target proficiency:** The language level to scaffold for. *e.g. "Early Acquisition" / "Developing" / "New to English"*\r
- **Subject area:** The subject. *e.g. "English" / "Geography" / "Science"*\r
\r
Optional (injected by context engine if available):\r
- **Student level:** Year group\r
- **Student profiles:** First languages, cognitive ability, specific needs\r
- **Learning objective:** What all students should learn\r
- **Task materials:** Resources used in the original task\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in EAL scaffolding and differentiation, with deep knowledge of Gibbons' (2002, 2015) principle that scaffolding must challenge rather than simplify, Cummins' (2000) quadrant model of cognitive demand and contextual support, and Walqui's (2006) scaffolding strategies for English language learners. You understand that the most common error in EAL differentiation is reducing cognitive demand — giving students an easier task instead of the same task with better support.\r
\r
Your task is to scaffold:\r
\r
**Original task:** {{original_task}}\r
**Target proficiency:** {{target_proficiency}}\r
**Subject area:** {{subject_area}}\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Student level:** {{student_level}} — if not provided, assume a secondary school student.\r
**Student profiles:** {{student_profiles}} — if not provided, assume the student has age-appropriate cognitive ability but limited academic English proficiency, with conversational fluency.\r
**Learning objective:** {{learning_objective}} — if not provided, infer the learning objective from the original task. This is critical — the modified task must achieve the SAME objective.\r
**Task materials:** {{task_materials}} — if not provided, infer typical materials for this task type.\r
\r
Apply these evidence-based principles:\r
\r
1. **Maintain cognitive demand (Gibbons, 2002; Cummins, 2000):**\r
   - The modified task must require the SAME level of thinking as the original.\r
   - If the original task requires analysis, the modified task must also require analysis — not description.\r
   - If the original task requires evaluation, the modified task must also require evaluation — not recall.\r
   - If the original task requires an extended written response, the scaffolded version may provide language support (sentence frames, word banks, graphic organisers) but must still require the student to construct meaning, not just fill blanks.\r
   - EXPLICITLY check and state: "The original task requires [thinking type]. The modified task also requires [same thinking type] because..."\r
\r
2. **Scaffold language, not thinking (Gibbons, 2015):**\r
   - Identify the LANGUAGE barriers in the original task (vocabulary, grammar, text structure, reading load).\r
   - Add language supports that address these specific barriers.\r
   - Do NOT: simplify the question, reduce the number of steps, provide the answer in the scaffold, remove the requirement for original thinking, or substitute a lower-order task.\r
\r
3. **Use appropriate scaffold types (Walqui, 2006; Hammond & Gibbons, 2005):**\r
   - **Modelling:** Provide a worked example or annotated model showing what a good response looks like.\r
   - **Bridging:** Connect to the student's existing knowledge or first language.\r
   - **Contextualising:** Add visual support, diagrams, or concrete examples that make abstract content accessible.\r
   - **Sentence frames:** Provide the linguistic structure while requiring the student to supply the content and thinking.\r
   - **Graphic organisers:** Provide a visual structure for organising ideas before writing.\r
   - **Word banks:** Supply key vocabulary, but require the student to select and use words meaningfully.\r
   - **Glossary/bilingual support:** Define key terms, ideally with first-language equivalents.\r
\r
4. **Match scaffold intensity to proficiency level:**\r
   - **New to English:** Heavy scaffolding — visual support, bilingual resources, adapted text with glossary, sentence frames with minimal gaps, graphic organisers that structure the entire response. The student may respond partially in their first language. The thinking demand remains.\r
   - **Early Acquisition:** Substantial scaffolding — adapted text, sentence starters (not complete frames), word banks, graphic organisers, models. The student produces English with significant support.\r
   - **Developing:** Moderate scaffolding — original text with glossary, sentence starters for complex constructions only, optional word bank. The student produces mostly independent English with targeted support.\r
   - **Consolidating:** Light scaffolding — original text, a few sentence starters for the most complex academic constructions, no word bank (student should be building independence). Nearly independent.\r
\r
5. **Plan for scaffold removal:**\r
   - Scaffolds are temporary. Every scaffold should include a note about when and how to remove it.\r
   - The goal is independence — if the scaffold becomes permanent, it has become a crutch.\r
\r
Return your output in this exact format:\r
\r
## Scaffolded Task: [Brief description]\r
\r
**Original task:** [The original task]\r
**Scaffolded for:** [Target proficiency level]\r
**Subject:** [Subject area]\r
**Learning objective:** [Stated or inferred — must be the SAME for both versions]\r
\r
### Modified Task\r
\r
[The complete scaffolded version of the task — including all language supports, visual organisers, sentence frames, word banks, etc.]\r
\r
### Cognitive Demand Check\r
\r
**Original task requires:** [Type of thinking — analysis, evaluation, synthesis, application, etc.]\r
**Modified task requires:** [SAME type of thinking]\r
**How cognitive demand is maintained:** [Specific explanation of why the scaffolded version still requires the same thinking]\r
**What was changed:** [Only language access — not intellectual demand]\r
**What was NOT changed:** [The thinking, the learning objective, the analytical requirement]\r
\r
### Scaffold Types Used\r
\r
For each scaffold:\r
- **[Scaffold type]:** [What was added and why — connected to a specific language barrier]\r
\r
### Scaffold Removal Plan\r
\r
[How to progressively remove each scaffold as the student's proficiency increases — specific, practical steps]\r
\r
**Self-check before returning output:** Verify that (a) the learning objective is the same for both versions, (b) the modified task requires the same TYPE of thinking as the original, (c) scaffolds address language barriers specifically, (d) no scaffold inadvertently provides the answer or removes the need for original thinking, (e) the scaffold intensity matches the stated proficiency level, and (f) the scaffold removal plan is included.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Original task: "Read the extract from 'An Inspector Calls' (Act 1, Mr Birling's speech about the Titanic). Analyse how Priestley uses dramatic irony to undermine Mr Birling's authority. In your response, explain what dramatic irony is, identify specific examples from the extract, and explain the effect on the audience." / Target proficiency: "Developing" / Subject area: "English Literature" / Student level: "Year 10"*\r
\r
---\r
\r
## Scaffolded Task: Dramatic Irony in 'An Inspector Calls'\r
\r
**Original task:** Analyse how Priestley uses dramatic irony to undermine Mr Birling's authority in the Titanic speech (Act 1). Explain what dramatic irony is, identify examples, and explain the effect on the audience.\r
**Scaffolded for:** Developing proficiency\r
**Subject:** English Literature\r
**Learning objective:** Students analyse how Priestley uses dramatic irony as a technique to shape the audience's view of Mr Birling.\r
\r
### Modified Task\r
\r
**Step 1: Understanding the concept (with visual support)**\r
\r
**Dramatic irony** = when the AUDIENCE knows something that a CHARACTER does not.\r
\r
| What Mr Birling says (1912) | What the AUDIENCE knows (watching in 1945+) |\r
|---|---|\r
| "The Titanic... unsinkable, absolutely unsinkable" | The Titanic sank on its maiden voyage in 1912 — over 1,500 people died |\r
| "I say there isn't a chance of war" | World War I started in 1914 and World War II started in 1939 |\r
\r
**This is dramatic irony:** Mr Birling is completely WRONG, and the audience KNOWS he is wrong while he speaks confidently.\r
\r
**Step 2: Analyse — WHY does Priestley do this?**\r
\r
Read the extract again. Use the questions below to build your analysis. You must explain your thinking — a one-word answer is not enough.\r
\r
1. When the audience hears Mr Birling say the Titanic is "unsinkable," what do they think about Mr Birling? Do they trust his judgement?\r
\r
2. Mr Birling says these wrong predictions with great confidence ("I say there isn't a chance of war"). What effect does his confidence have? Is a confident person who is wrong MORE or LESS ridiculous than an unsure person who is wrong?\r
\r
3. Mr Birling also makes predictions about business and social responsibility — he says people should only look after themselves. Priestley wants the audience to disagree with this view. How does the dramatic irony about the Titanic and the war HELP Priestley make the audience disagree with Mr Birling's other views too?\r
\r
**Step 3: Write your response**\r
\r
Use this structure. Each section requires YOUR thinking — the sentence starters give you the academic language, but you must supply the analysis.\r
\r
**Paragraph 1 — What dramatic irony is and how Priestley uses it:**\r
\r
Dramatic irony is when ___. In Mr Birling's speech, Priestley uses dramatic irony when Birling says "___" (quote from the extract). The audience in 1945 would know that ___, which means Birling is ___.\r
\r
**Paragraph 2 — The effect on the audience:**\r
\r
This dramatic irony affects the audience because ___. When they hear Birling speak so confidently about something they KNOW is wrong, they begin to ___. Priestley's purpose in doing this is to ___ because ___.\r
\r
**Paragraph 3 — How this connects to Priestley's wider message:**\r
\r
Priestley uses the dramatic irony to undermine Birling's authority so that when Birling argues that people should only look after themselves, the audience ___. If the audience already knows Birling is wrong about the Titanic, they are more likely to think he is also wrong about ___. This supports Priestley's message that ___.\r
\r
**Word bank for analytical language:**\r
\r
| To describe Birling | To describe the audience's response | To describe Priestley's purpose |\r
|---|---|---|\r
| arrogant, overconfident, foolish, misguided, short-sighted | sceptical, distrustful, critical, amused, aware | undermines, discredits, challenges, exposes, reveals |\r
\r
### Cognitive Demand Check\r
\r
**Original task requires:** Analysis — students must explain HOW a technique (dramatic irony) creates a specific effect (undermining authority), requiring them to identify examples, explain the mechanism of the technique, and connect it to authorial purpose.\r
\r
**Modified task requires:** The same analysis. Students must still explain HOW dramatic irony undermines Birling, identify specific examples, explain the effect on the audience, and connect to Priestley's purpose. The guiding questions and sentence starters provide linguistic scaffolding but each one requires the student to supply their OWN analytical thinking.\r
\r
**How cognitive demand is maintained:**\r
- Question 2 asks students to evaluate the relationship between confidence and being wrong — this is genuine analysis, not recall.\r
- Question 3 asks students to explain how dramatic irony about factual predictions transfers to undermine Birling's political views — this is the hardest analytical step and is NOT answered by the scaffold.\r
- The sentence frames require students to complete the analysis: "Priestley's purpose in doing this is to ___ because ___" — the "because" forces reasoning, not just identification.\r
\r
**What was changed:** The reading is supported with a summary table. The writing structure is scaffolded with sentence starters. Analytical vocabulary is provided in a word bank. The task is broken into guided steps.\r
\r
**What was NOT changed:** The requirement to analyse (not describe). The requirement to explain effect on the audience. The requirement to connect technique to authorial purpose. The requirement to use evidence from the text.\r
\r
### Scaffold Types Used\r
\r
- **Contextualising (table):** The summary table makes the historical knowledge required for dramatic irony visible — EAL students may not have the cultural background knowledge to recognise why Birling's predictions are ironic. The table provides this context without doing the analysis.\r
- **Sentence frames:** Provide the grammatical structure of analytical writing (complex sentences with embedded clauses) while requiring the student to supply the content. "Dramatic irony is when ___" requires a definition. "Priestley's purpose in doing this is to ___ because ___" requires reasoning.\r
- **Guiding questions:** Break the analysis into sequential steps rather than expecting the student to produce a holistic analytical response from a single open prompt. Each question targets one component of the analysis.\r
- **Word bank:** Provides the evaluative vocabulary (arrogant, sceptical, undermines) that EAL students at Developing level are unlikely to have but need for analytical writing. The student must SELECT the appropriate word — the bank provides options, not answers.\r
\r
### Scaffold Removal Plan\r
\r
| Current scaffold | Remove when... | Replace with... |\r
|---|---|---|\r
| Summary table (historical context) | Student demonstrates awareness of the historical context independently in class discussion | No replacement — the knowledge should be internalised |\r
| Sentence frames (full structure) | Student can produce analytical paragraphs with sentence starters only | Sentence starters only: "Priestley uses..." "This suggests..." "The effect on the audience is..." |\r
| Sentence starters | Student produces analytical writing with appropriate structure independently | No starters — student writes independently, with post-writing feedback on structure |\r
| Guiding questions | Student can identify the analytical steps independently when given an open prompt | Single open prompt: "Analyse how Priestley uses [technique] to [effect]" |\r
| Word bank | Student uses 3+ analytical terms independently without the bank | No word bank — but continue to teach new analytical vocabulary as it arises |\r
\r
**Target timeline:** For a Developing student, aim to remove the sentence frames within 4–6 weeks (with regular analytical writing practice). The word bank can be reduced gradually — remove words the student has used correctly 3+ times. The guiding questions can be reduced to 1–2 prompts within 2–3 months.\r
\r
---\r
\r
## Known Limitations\r
\r
1. **The modification cannot account for students' cognitive ability independently of language proficiency.** A student who is at Developing proficiency in English but has strong analytical ability in their first language needs different scaffolding from a student at the same proficiency level who also finds analysis challenging. The teacher's knowledge of the individual student is essential for adjusting the scaffold.\r
\r
2. **Scaffold removal requires consistent, longitudinal planning.** This skill designs scaffolds for a single task, but effective scaffold removal happens across weeks and months. A teacher who uses this skill for every task will get well-scaffolded individual tasks, but the progressive removal across tasks requires the teacher to plan the trajectory. Chain with a spaced-practice approach to scaffold reduction.\r
\r
3. **The modification assumes the original task is well-designed.** If the original task is poorly structured, unclear, or misaligned with the learning objective, scaffolding it will not help — the original task needs redesigning first. Scaffolding is not a fix for bad task design; it's a way to make a good task accessible to students at different language proficiency levels.\r
`,a=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: practice-problem-sequence-designer\r
description: "Generate a scaffolded sequence of practice problems with graduated difficulty and strategic variability. Use when creating worksheets, homework sets, or independent practice materials."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "explicit-instruction/practice-problem-sequence-designer"\r
skill_name: "Practice Problem Sequence Designer"\r
domain: "explicit-instruction"\r
version: "1.0"\r
evidence_strength: "strong"\r
evidence_sources:\r
  - "Rosenshine (2012) — Principles of Instruction, Principles 5 & 8: guide student practice, provide scaffolds"\r
  - "Rohrer (2009) — The effects of spacing and mixing practice problems"\r
  - "Sweller et al. (2019) — Cognitive load theory: variability and worked example effects"\r
  - "Atkinson et al. (2000) — Learning from examples: varied practice promotes transfer"\r
  - "Bjork & Bjork (2011) — Making things hard on yourself, but in a good way: desirable difficulties"\r
input_schema:\r
  required:\r
    - field: "skill_to_practise"\r
      type: "string"\r
      description: "The specific skill students are practising"\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group and current competence level"\r
    - field: "problem_count"\r
      type: "integer"\r
      description: "Number of practice problems to generate"\r
  optional:\r
    - field: "common_errors"\r
      type: "array"\r
      description: "Known errors to design problems around"\r
    - field: "prior_examples"\r
      type: "string"\r
      description: "The worked example or model students have already seen"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: ability range, specific needs"\r
    - field: "assessment_format"\r
      type: "string"\r
      description: "How students will be assessed — informs problem format variation"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "problem_sequence"\r
      type: "array"\r
      description: "Ordered sequence of problems with difficulty progression and design rationale"\r
    - field: "scaffold_reduction_plan"\r
      type: "string"\r
      description: "How scaffolding is reduced across the sequence"\r
    - field: "differentiation_options"\r
      type: "object"\r
      description: "Support and extension modifications"\r
    - field: "monitoring_guide"\r
      type: "string"\r
      description: "What to look for as students work and when to intervene"\r
chains_well_with:\r
  - "explicit-instruction-sequence-builder"\r
  - "worked-example-fading-designer"\r
  - "interleaving-unit-planner"\r
  - "cognitive-load-analyser"\r
teacher_time: "4 minutes"\r
tags: ["practice", "problem-design", "scaffolding", "variability", "desirable-difficulty"]\r
---\r
\r
# Practice Problem Sequence Designer\r
\r
## What This Skill Does\r
\r
Designs a sequenced set of practice problems that follows principles of distributed difficulty, progressive scaffold reduction, and surface feature variation — moving students from near-transfer (problems very similar to the taught example) through to far-transfer (problems that look different but require the same underlying skill). The output includes the problems, the design rationale for each, scaffold reduction notes, and a monitoring guide for the teacher. AI is specifically valuable here because effective practice sequences require deliberate manipulation of difficulty, surface features, and scaffold levels — most teacher-designed practice sets are either randomly ordered (no progression) or uniformly difficult (no variation), both of which reduce learning.\r
\r
## Evidence Foundation\r
\r
Rosenshine (2012) identified guided and independent practice as Principles 5 and 8, emphasising that practice must be scaffolded (beginning with teacher support and gradually reducing it) and that students should achieve a high success rate (80%+) before scaffolds are removed. Rohrer (2009) demonstrated that mixing practice problem types (interleaving) and spacing practice across sessions produces substantially better retention than blocked, massed practice. Sweller et al. (2019) established the variability effect — practising with varied problem types promotes schema abstraction and transfer, while practising with identical problems promotes rigid, context-bound knowledge. Atkinson et al. (2000) showed that surface feature variation (changing the context, numbers, or presentation while keeping the underlying structure the same) is critical for transfer — students who only practise problems that look like the taught example fail when problems look different. Bjork & Bjork (2011) frame this as a "desirable difficulty" — practice that feels harder (because problems vary) produces better long-term learning than practice that feels easy (because problems are identical).\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Skill to practise:** The specific skill. *e.g. "Solving linear equations with the unknown on both sides" / "Writing a paragraph using the PEEL structure" / "Drawing and interpreting box plots"*\r
- **Student level:** Year group and current level. *e.g. "Year 9, have just seen two worked examples — novice with this specific skill"*\r
- **Problem count:** How many problems. *e.g. 10*\r
\r
Optional (injected by context engine if available):\r
- **Common errors:** Known errors to design problems around\r
- **Prior examples:** The worked example or model already shown\r
- **Student profiles:** Ability range, specific needs\r
- **Assessment format:** How students will be assessed\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in practice design and instructional sequencing, with deep knowledge of Rosenshine's (2012) practice principles, Rohrer's (2009) research on practice spacing and mixing, Sweller et al.'s (2019) variability effect, and Bjork & Bjork's (2011) concept of desirable difficulties. You understand that the sequence and structure of practice problems affects learning as much as the number of problems.\r
\r
Your task is to design a practice problem sequence for:\r
\r
**Skill:** {{skill_to_practise}}\r
**Student level:** {{student_level}}\r
**Number of problems:** {{problem_count}}\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Common errors:** {{common_errors}} — if not provided, identify the 2–3 most common errors for this skill and include problems specifically designed to surface them.\r
**Prior examples:** {{prior_examples}} — if not provided, assume students have seen a standard worked example and design the first 2 problems to closely match it.\r
**Student profiles:** {{student_profiles}} — if not provided, design for a mixed-ability class and include differentiation notes.\r
**Assessment format:** {{assessment_format}} — if not provided, include at least one problem in the format students are likely to encounter in assessments.\r
\r
Apply these evidence-based principles:\r
\r
1. **Near-to-far transfer progression (Atkinson et al., 2000):**\r
   - Problems 1–2: Nearly identical to the worked example (same structure, similar numbers, same context). Success rate should be 90%+. These build confidence and confirm basic understanding.\r
   - Problems 3–5: Same underlying skill, different surface features (different context, different numbers, different presentation). The student must recognise the same skill in a new wrapper.\r
   - Problems 6–8: Increased difficulty — additional steps, missing information to infer, or combining this skill with a previously learned skill.\r
   - Problems 9+: Far transfer — the problem looks substantially different from the worked example but requires the same underlying skill, possibly embedded in a larger problem or applied to a novel context.\r
\r
2. **Surface feature variation (Sweller et al., 2019):**\r
   - Vary the context, numbers, format, and presentation while keeping the underlying structure constant.\r
   - If the worked example used a word problem about buying apples, practice problems should include different contexts (temperature, distance, money) — students who only practise apple problems can't solve temperature problems because they've learned "the apple procedure," not the underlying mathematics.\r
\r
3. **Scaffold reduction (Rosenshine, 2012):**\r
   - Early problems may include partial scaffolds: a hint, a first step, or a reminder of the formula.\r
   - Middle problems remove these scaffolds.\r
   - Later problems require students to determine the method independently.\r
\r
4. **Error-targeting problems:**\r
   - Include at least 2 problems specifically designed to surface common errors.\r
   - If students commonly confuse operation X with operation Y, include a problem where the wrong operation gives a plausible-looking answer — forcing students to think carefully about which approach is correct.\r
\r
5. **One "twist" problem:**\r
   - Include at least one problem that looks like it requires this skill but actually doesn't — or that requires the student to explain why the skill doesn't apply. This tests whether students are thinking or just applying a procedure mechanically.\r
\r
Return your output in this exact format:\r
\r
## Practice Problem Sequence: [Skill]\r
\r
**For:** [Student level]\r
**Total problems:** [Count]\r
**Scaffold reduction:** [Brief overview of how scaffolding reduces across the sequence]\r
\r
### Problem Sequence\r
\r
For each problem:\r
- **Problem [N]:** [The problem text]\r
- **Design intent:** [Why this problem is at this position — what it tests that previous problems didn't]\r
- **Difficulty level:** [Near transfer / Developing / Far transfer]\r
- **Common error to watch for:** [If applicable]\r
\r
### Scaffold Reduction Plan\r
\r
[How scaffolding decreases across the sequence — what support is provided early and removed later]\r
\r
### Differentiation\r
\r
**Support:** [How to modify for students who struggle — which problems to prioritise, what scaffolds to add back]\r
**Extension:** [How to challenge students who finish quickly — which problems to add]\r
\r
### Monitoring Guide\r
\r
[What the teacher should look for while students work: which problems are diagnostic, what errors signal which misunderstanding, when to intervene vs. let students struggle]\r
\r
**Self-check before returning output:** Verify that (a) problems progress from near to far transfer, (b) surface features vary across the sequence, (c) at least 2 problems target common errors, (d) scaffolding decreases progressively, (e) one problem tests whether students can discriminate when the skill does/doesn't apply, and (f) the first 2 problems are accessible enough for 90%+ success rate.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Skill: "Calculating percentage increase and decrease" / Student level: "Year 9, have just seen a worked example of 'find 15% of £240 and add it to the original'" / Problem count: 10 / Common errors: ["Finding the percentage but forgetting to add/subtract it", "Calculating percentage of the new amount instead of the original"]*\r
\r
---\r
\r
## Practice Problem Sequence: Percentage Increase and Decrease\r
\r
**For:** Year 9 Mathematics\r
**Total problems:** 10\r
**Scaffold reduction:** Problems 1–2 include a method reminder. Problems 3–5 remove the reminder. Problems 6–8 require method selection. Problems 9–10 embed the skill in unfamiliar contexts.\r
\r
### Problem Sequence\r
\r
**Problem 1:** A jacket costs £80. The price increases by 10%. What is the new price?\r
*Hint: First find 10% of £80, then add it to £80.*\r
- **Design intent:** Near-identical to the worked example. Same structure (percentage increase), friendly numbers (10% of a round number), hint provided. Confirms basic understanding.\r
- **Difficulty level:** Near transfer\r
- **Expected answer:** £88\r
\r
**Problem 2:** A laptop costs £450. The price is reduced by 20% in a sale. What is the sale price?\r
*Hint: First find 20% of £450, then subtract it from £450.*\r
- **Design intent:** Introduces percentage decrease (subtract instead of add) but with a hint. Tests whether students can apply the reverse operation. Still friendly numbers.\r
- **Difficulty level:** Near transfer\r
- **Common error to watch for:** Students who add instead of subtract (get £540) — they're applying the increase method automatically without reading the question.\r
\r
**Problem 3:** A gym membership costs £35 per month. The gym announces a 12% price increase. What is the new monthly cost?\r
- **Design intent:** No hint provided. Non-round percentage (12%). Smaller base number. Tests whether students can work without scaffolding and handle a less convenient percentage.\r
- **Difficulty level:** Developing\r
- **Expected answer:** £39.20\r
\r
**Problem 4:** A house was bought for £185,000. Its value has decreased by 7%. What is it worth now?\r
- **Design intent:** Larger numbers (tests whether students can handle £185,000 without panicking), percentage decrease, and a real-world context shift (from shopping to property). Same underlying skill.\r
- **Difficulty level:** Developing\r
- **Common error to watch for:** Students who find 7% (£12,950) and write that as the answer — forgetting to subtract from the original.\r
\r
**Problem 5:** A school has 840 students. Next year, the number of students is expected to increase by 5%. How many students will there be?\r
- **Design intent:** Context shift (people, not money). The answer must be a whole number (you can't have 0.5 of a student) — tests whether students interpret their answer in context.\r
- **Difficulty level:** Developing\r
- **Expected answer:** 882 (840 × 0.05 = 42; 840 + 42 = 882)\r
\r
**Problem 6:** A car was worth £12,500 at the start of the year. By the end of the year, it was worth £11,250. What was the percentage decrease?\r
- **Design intent:** REVERSE problem — the percentage is unknown. Students must work backward: find the difference (£1,250), then calculate what percentage £1,250 is of £12,500. Tests deeper understanding of the relationship, not just forward application.\r
- **Difficulty level:** Far transfer\r
- **Common error to watch for:** Students who calculate £1,250 as a percentage of £11,250 (the new value) instead of £12,500 (the original) — this is one of the stated common errors.\r
- **Expected answer:** 10%\r
\r
**Problem 7:** A shirt is advertised as "30% off! Now only £28." What was the original price?\r
- **Design intent:** Another reverse problem — this time finding the original from the reduced price. Students must recognise that £28 is 70% of the original (not 100%). This is significantly harder because it requires proportional reasoning.\r
- **Difficulty level:** Far transfer\r
- **Expected answer:** £40 (£28 ÷ 0.7 = £40)\r
\r
**Problem 8:** A town's population increased by 15% to reach 9,200 people. What was the population before the increase?\r
- **Design intent:** Same structure as Problem 7 (find the original given the new value and the percentage change) but with increase instead of decrease and a different context. Tests whether students can transfer the reverse method across both directions.\r
- **Difficulty level:** Far transfer\r
- **Expected answer:** 8,000 (9,200 ÷ 1.15 = 8,000)\r
\r
**Problem 9:** A shop increases prices by 20% and then offers a "20% off" sale. A customer says: "The 20% increase and 20% decrease cancel out, so the price is back to normal." Are they correct? Explain your answer using a specific example.\r
- **Design intent:** The "twist" problem. The answer is NO — a 20% increase followed by a 20% decrease does NOT return to the original price (e.g., £100 → £120 → £96). This surfaces a deep misconception about percentages and forces explanation, not just calculation.\r
- **Difficulty level:** Far transfer / Critical thinking\r
- **Expected answer:** No. Example: £100 + 20% = £120. £120 - 20% = £96, not £100. The 20% decrease is calculated on the higher amount.\r
\r
**Problem 10:** An investment grows by 5% per year. If you invest £1,000, how much will it be worth after 3 years?\r
- **Design intent:** Compound percentage increase — the percentage applies to the new total each year, not the original. This extends the skill into a new territory (compound growth) and previews a future topic. It's OK if not all students get this — it's extension territory.\r
- **Difficulty level:** Far transfer / Extension\r
- **Expected answer:** £1,157.63 (£1,000 × 1.05³)\r
\r
### Scaffold Reduction Plan\r
\r
| Problems | Scaffold level |\r
|----------|---------------|\r
| 1–2 | Method hint provided ("First find X% of Y, then add/subtract") |\r
| 3–5 | No hints. Students must recall and apply the method independently |\r
| 6–8 | Reverse problems. Students must determine the method (work backward from a new value to find the original). No guidance on approach |\r
| 9–10 | Conceptual reasoning and extension. Students must explain, argue, or extend the skill into new territory |\r
\r
### Differentiation\r
\r
**Support (for students struggling with Problems 1–3):**\r
- Provide a method card: "Step 1: Find the percentage. Step 2: Add (increase) or subtract (decrease)."\r
- Reduce to Problems 1–5 only. Problems 6+ require secure forward application before attempting reverse problems.\r
- Pair with a worked example for Problem 6 (reverse percentage) — chain with Worked Example Fading Designer.\r
\r
**Extension (for students who complete all 10):**\r
- Problem 11: "A price increases by 25% and then decreases by 20%. Is the final price higher, lower, or the same as the original? Prove it algebraically."\r
- Problem 12: "How many years would it take for an investment at 5% compound interest to double? Estimate first, then calculate."\r
\r
### Monitoring Guide\r
\r
- **Problems 1–2:** These should take 2–3 minutes. If a student is stuck here, they don't have the basic method — intervene immediately with a quick re-teach using the worked example.\r
- **Problem 4:** Check answers here. If students write £12,950 (the percentage amount rather than the new value), they understand the calculation but are forgetting the final step. This is a procedural reminder, not a re-teach.\r
- **Problem 6:** This is the diagnostic problem. If students attempt to divide by the wrong amount (e.g., finding the percentage of the new value instead of the original), they have the common misconception. Stop and address with a targeted example: "The percentage change is always calculated relative to the ORIGINAL amount."\r
- **Problem 9:** Don't reveal the answer if students say "yes, they cancel out." Instead ask: "Test it with £100. Show me the maths." Let the surprise of getting £96 (not £100) create cognitive conflict.\r
- **General rule:** Circulate for the first 5 minutes, checking Problems 1–3. If 80%+ are correct on Problem 3, the class is ready to continue independently. If fewer than 80%, pause and address the gap.\r
\r
---\r
\r
## Known Limitations\r
\r
1. **The problem sequence assumes a single skill focus.** Real exam problems often combine multiple skills (percentage change + reading a graph + interpreting in context). This sequence builds fluency with the core skill; interleaving with other skills should happen in subsequent lessons, not within this initial practice set. Chain with Interleaving Unit Planner for mixed practice in later lessons.\r
\r
2. **Surface feature variation may confuse students who haven't mastered the basic procedure.** For very low-ability students, too much variation too early can feel overwhelming. For these students, begin with 4–5 near-transfer problems (varying only the numbers) before introducing context variation. The sequence can be compressed by skipping Problems 1–2 for higher-ability groups.\r
\r
3. **The monitoring guide requires the teacher to circulate effectively.** Designing good problems is necessary but not sufficient — the teacher must actually observe students working, identify error patterns, and intervene at the right moment. The guide helps direct attention but cannot replace the teacher's professional judgment about when to let students struggle and when to step in.\r
`,s=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: worked-example-fading-designer\r
description: "Design a worked example fading sequence from fully worked examples through to independent practice. Use when teaching procedures, algorithms, or multi-step processes to novice learners."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "memory-learning-science/worked-example-fading-designer"\r
skill_name: "Worked Example Designer with Completion Fading"\r
domain: "memory-learning-science"\r
version: "1.0"\r
evidence_strength: "strong"\r
evidence_sources:\r
  - "Sweller & Cooper (1985) — The use of worked examples as a substitute for problem solving in learning algebra"\r
  - "Atkinson et al. (2000) — Learning from examples: instructional principles from the worked examples research"\r
  - "Renkl (2014) — Toward an instructionally oriented theory of example-based learning"\r
  - "Kalyuga et al. (2003) — The expertise reversal effect (when worked examples become counterproductive)"\r
  - "van Merriënboer & Kirschner (2018) — Ten Steps to Complex Learning: fading and scaffolding principles"\r
input_schema:\r
  required:\r
    - field: "skill_to_teach"\r
      type: "string"\r
      description: "The specific procedure or skill students need to learn"\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group and expertise level (novice/developing/advanced)"\r
    - field: "steps_in_procedure"\r
      type: "integer"\r
      description: "Approximate number of steps in the complete procedure"\r
  optional:\r
    - field: "common_errors"\r
      type: "array"\r
      description: "Known errors students typically make with this procedure"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: individual student readiness data"\r
    - field: "prior_knowledge"\r
      type: "string"\r
      description: "What students already know that this skill builds on"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "worked_example"\r
      type: "object"\r
      description: "A complete worked example with annotated steps and self-explanation prompts"\r
    - field: "completion_problems"\r
      type: "array"\r
      description: "A sequence of 3–4 completion problems with progressive fading"\r
    - field: "independent_problems"\r
      type: "array"\r
      description: "2–3 fully independent practice problems"\r
    - field: "fading_rationale"\r
      type: "string"\r
      description: "Explanation of what is faded at each stage and why"\r
chains_well_with:\r
  - "cognitive-load-analyser"\r
  - "explicit-instruction-sequence-builder"\r
  - "practice-problem-sequence-designer"\r
  - "checking-for-understanding-protocol-designer"\r
teacher_time: "4 minutes"\r
tags: ["worked-examples", "scaffolding", "fading", "cognitive-load", "novice-learning"]\r
---\r
\r
# Worked Example Designer with Completion Fading\r
\r
## What This Skill Does\r
\r
Designs a complete scaffold sequence that moves students from studying a fully worked example through progressively faded completion problems to independent practice. For a given procedure or skill, it produces: (1) a worked example with annotated reasoning at each step, (2) a series of completion problems where successive steps are removed, and (3) independent practice problems. AI is specifically valuable here because effective worked examples require expert-level annotation of reasoning (not just showing steps, but explaining *why* each step is taken), and the fading sequence requires careful calibration of which steps to remove and in what order — a task requiring deep knowledge of both the subject content and the cognitive load research.\r
\r
## Evidence Foundation\r
\r
Sweller & Cooper (1985) demonstrated that novice learners who studied worked examples learned more effectively than those who attempted problem-solving, because worked examples reduce extraneous cognitive load — students can focus on understanding the procedure rather than searching for a solution path. Atkinson et al. (2000) synthesised the worked examples research and identified key design principles: examples must include explanatory annotations (not just steps), and the transition from examples to independent practice should be gradual. Renkl (2014) refined the theory, showing that self-explanation prompts embedded in worked examples significantly enhance learning because they promote germane processing. The fading approach — where worked examples gradually omit steps, creating "completion problems" — was shown by van Merriënboer & Kirschner (2018) to be more effective than an abrupt transition from examples to problems. Critically, Kalyuga et al. (2003) demonstrated the expertise reversal effect: worked examples that help novices become counterproductive for advanced learners, who learn better from problem-solving. This means fading must be calibrated to student expertise.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Skill to teach:** The specific procedure or skill. *e.g. "Solving simultaneous equations by elimination" / "Writing a topic sentence for an analytical paragraph" / "Balancing chemical equations"*\r
- **Student level:** Year group and expertise. *e.g. "Year 9, first encounter (novice)" / "Year 11 revision (developing)"*\r
- **Steps in procedure:** Approximate number of steps. *e.g. 5*\r
\r
Optional (injected by context engine if available):\r
- **Common errors:** Known errors students typically make. *e.g. ["Forgetting to multiply both sides", "Sign errors when subtracting equations"]*\r
- **Student profiles:** Individual readiness data for differentiated fading rates\r
- **Prior knowledge:** What prerequisite knowledge students have\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in instructional design specialising in worked examples and cognitive load management. You have deep knowledge of Sweller & Cooper (1985) on the worked example effect, Renkl (2014) on self-explanation in worked examples, Atkinson et al. (2000) on design principles for example-based learning, and the fading approach from van Merriënboer & Kirschner (2018).\r
\r
Your task is to design a complete worked example with completion fading for:\r
\r
**Skill:** {{skill_to_teach}}\r
**Student level:** {{student_level}}\r
**Steps in procedure:** approximately {{steps_in_procedure}} steps\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Known common errors:** {{common_errors}} — if provided, build awareness of these specific errors into the worked example annotations. If not provided, include the most common errors for this procedure based on your subject knowledge.\r
**Prior knowledge:** {{prior_knowledge}} — if provided, connect new steps to this existing knowledge explicitly. If not provided, assume standard prerequisite knowledge for the stated year group.\r
**Student profiles:** {{student_profiles}} — if provided, consider differentiated fading rates for different readiness levels. If not provided, design a single fading sequence for a typical mixed-ability class.\r
\r
Apply these evidence-based design principles:\r
\r
1. **Complete worked example first (Sweller & Cooper, 1985):** The first example must show EVERY step, fully worked, with no gaps. The student's only task is to study and understand — not to solve anything.\r
\r
2. **Annotate reasoning, not just steps (Renkl, 2014):** Each step must include a brief annotation explaining WHY this step is taken, not just WHAT is done. The annotation reveals expert thinking. Format: "Step → Reasoning annotation."\r
\r
3. **Self-explanation prompts (Renkl, 2014):** After the worked example, include 2–3 self-explanation questions that prompt students to explain the reasoning behind key steps. These promote active processing rather than passive reading.\r
\r
4. **Fading sequence (van Merriënboer & Kirschner, 2018):** Create 3–4 completion problems that progressively remove steps:\r
   - Completion 1: Remove the final step only. Student completes it.\r
   - Completion 2: Remove the final 2 steps.\r
   - Completion 3: Remove middle and final steps (student must do ~50% of the procedure).\r
   - Completion 4 (if needed): Only the first step is provided.\r
   Fade from the END of the procedure backward — the final steps are typically the most routine and least conceptually demanding.\r
\r
5. **Error awareness (where applicable):** If common errors are provided, include a "common error" annotation at the step where the error typically occurs, showing what the error looks like and why it's wrong.\r
\r
6. **Expertise reversal guard:** Note at what point the fading should accelerate for students who are demonstrating mastery, and when to move directly to independent practice.\r
\r
Return your output in this exact format:\r
\r
## Worked Example Sequence: [Skill Name]\r
\r
**For:** [Student level]\r
**Fading strategy:** [Brief description of what is faded and why]\r
\r
### Stage 1: Complete Worked Example\r
\r
**Problem:** [A specific, realistic problem]\r
\r
| Step | Action | Reasoning |\r
|------|--------|-----------|\r
| 1 | [What is done] | [Why this step — expert thinking made visible] |\r
| 2 | ... | ... |\r
| ... | ... | ... |\r
\r
**Answer:** [Final answer]\r
\r
**Self-explanation prompts:**\r
1. [Question prompting student to explain a key reasoning step]\r
2. [Question prompting comparison or connection]\r
\r
### Stage 2: Completion Problems (Fading Sequence)\r
\r
**Completion Problem 1:** [Final step removed]\r
**Completion Problem 2:** [More steps removed]\r
**Completion Problem 3:** [~50% removed]\r
\r
For each, show the provided steps and clearly mark where the student takes over.\r
\r
### Stage 3: Independent Practice\r
\r
2–3 problems with no support. Different surface features from the worked example to promote transfer.\r
\r
### Fading Rationale\r
\r
[3–4 sentences explaining what is faded at each stage and why, connected to CLT principles]\r
\r
### Expertise Reversal Note\r
\r
[When to skip or accelerate stages for advanced learners]\r
\r
**Self-check before returning output:** Verify that (a) every step in the worked example includes reasoning, not just procedure, (b) fading moves from end to beginning, (c) self-explanation prompts target reasoning not recall, (d) completion problems change surface features to prevent pattern matching, and (e) independent practice problems require the same procedure but look different from the worked example.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Skill: "Calculating the mean from a frequency table" / Student level: "Year 8 Mathematics, first encounter (novice)" / Steps: 5 / Common errors: ["Adding frequencies instead of multiplying value x frequency", "Dividing by number of rows instead of total frequency"]*\r
\r
---\r
\r
## Worked Example Sequence: Calculating the Mean from a Frequency Table\r
\r
**For:** Year 8 Mathematics, novice\r
**Fading strategy:** Steps are removed from the end of the procedure backward, because the final steps (division and interpretation) are the most procedurally straightforward once the conceptual setup is understood. The middle steps (fx column, totals) are faded last because they contain the most conceptually demanding elements.\r
\r
### Stage 1: Complete Worked Example\r
\r
**Problem:** A teacher recorded the number of books each student read during the term. Calculate the mean number of books read.\r
\r
| Books read (x) | Frequency (f) |\r
|:-:|:-:|\r
| 0 | 3 |\r
| 1 | 7 |\r
| 2 | 12 |\r
| 3 | 5 |\r
| 4 | 3 |\r
\r
| Step | Action | Reasoning |\r
|------|--------|-----------|\r
| 1 | Add an fx column to the table. Multiply each value by its frequency: 0x3=0, 1x7=7, 2x12=24, 3x5=15, 4x3=12 | We need to find the total of ALL the values, not just the ones shown. "2 books" appears 12 times, so it contributes 2x12=24 books to the total, not just "2." This is where many errors happen — adding 0+1+2+3+4 would only give us the total if each value appeared once. |\r
| 2 | Find the total of the fx column: 0+7+24+15+12 = 58 | This gives us the total number of books read by ALL students combined. This is the "total of all values" in the mean formula. |\r
| 3 | Find the total frequency: 3+7+12+5+3 = 30 | This is the total number of students. We divide by THIS number, not by the number of rows in the table (5). Common error: dividing by 5 because there are 5 rows — but there are 30 students, not 5. |\r
| 4 | Calculate the mean: Total of fx / Total of f = 58 / 30 = 1.93 (2 d.p.) | Mean = sum of all values / number of values. We're using totals from the table because we can't add every individual value (we'd need to write "2" twelve times). The frequency table is a shortcut. |\r
| 5 | Interpret: The mean number of books read per student is 1.93, or approximately 2 books. | Always state what the mean represents in context. "1.93" alone is meaningless — "1.93 books per student" connects the calculation to the real situation. |\r
\r
**Answer:** Mean = 1.93 books per student\r
\r
**Common error alerts:**\r
- At Step 1: Students who add the x column (0+1+2+3+4 = 10) instead of multiplying x by f are treating the table as if each value appeared only once. Ask: "Did only one student read 2 books?"\r
- At Step 3: Students who divide by 5 (number of rows) instead of 30 (total frequency) are confusing the number of categories with the number of data points. Ask: "How many students are there — 5 or 30?"\r
\r
**Self-explanation prompts:**\r
1. Why do we multiply each value by its frequency in Step 1, rather than just adding the values in the first column? What would go wrong if we only added 0+1+2+3+4?\r
2. In Step 3, we divide by 30, not by 5. Explain in your own words why dividing by 5 would give the wrong answer. What does each number represent?\r
\r
### Stage 2: Completion Problems (Fading Sequence)\r
\r
**Completion Problem 1** *(Step 5 removed — student interprets)*\r
\r
A shop recorded shoe sizes sold in one day:\r
\r
| Shoe size (x) | Frequency (f) | fx |\r
|:-:|:-:|:-:|\r
| 5 | 4 | 20 |\r
| 6 | 8 | 48 |\r
| 7 | 11 | 77 |\r
| 8 | 6 | 48 |\r
| 9 | 1 | 9 |\r
| **Total** | **30** | **202** |\r
\r
Mean = 202 / 30 = 6.73\r
\r
**Your turn:** Write a sentence interpreting this mean in context. What does 6.73 represent?\r
\r
---\r
\r
**Completion Problem 2** *(Steps 4–5 removed — student calculates and interprets)*\r
\r
Students were asked how many siblings they have:\r
\r
| Siblings (x) | Frequency (f) | fx |\r
|:-:|:-:|:-:|\r
| 0 | 5 | 0 |\r
| 1 | 9 | 9 |\r
| 2 | 8 | 16 |\r
| 3 | 6 | 18 |\r
| 4 | 2 | 8 |\r
| **Total** | **30** | **51** |\r
\r
**Your turn:** Calculate the mean and write a sentence interpreting it.\r
\r
---\r
\r
**Completion Problem 3** *(Steps 2–5 removed — student calculates totals, mean, and interpretation)*\r
\r
A PE teacher recorded how many laps students completed:\r
\r
| Laps (x) | Frequency (f) | fx |\r
|:-:|:-:|:-:|\r
| 3 | 2 | 6 |\r
| 4 | 7 | 28 |\r
| 5 | 10 | 50 |\r
| 6 | 8 | _____ |\r
| 7 | 3 | _____ |\r
| **Total** | **_____** | **_____** |\r
\r
**Your turn:** Complete the fx column for the remaining rows, find both totals, calculate the mean, and interpret your answer.\r
\r
---\r
\r
**Completion Problem 4** *(Only the table provided — student does the entire procedure)*\r
\r
A survey asked students how many hours of homework they did last night:\r
\r
| Hours (x) | Frequency (f) |\r
|:-:|:-:|\r
| 0 | 6 |\r
| 1 | 11 |\r
| 2 | 9 |\r
| 3 | 4 |\r
\r
**Your turn:** Add an fx column, calculate all values, find the mean, and interpret your answer.\r
\r
### Stage 3: Independent Practice\r
\r
**Problem 1:** A dice was rolled 40 times. The results are recorded below. Calculate the mean score per roll.\r
\r
| Score | 1 | 2 | 3 | 4 | 5 | 6 |\r
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|\r
| Frequency | 5 | 8 | 7 | 9 | 6 | 5 |\r
\r
*(Different format: horizontal table, different context, same procedure)*\r
\r
**Problem 2:** In a survey, 25 families reported the number of pets they own: 0 pets (8 families), 1 pet (9 families), 2 pets (5 families), 3 pets (2 families), 4 pets (1 family). Calculate the mean number of pets per family.\r
\r
*(Different format: data given as text, not a table — student must construct the frequency table first)*\r
\r
**Problem 3:** The mean test score for a class of 20 students is 14.5. The frequency table below is incomplete. Find the missing frequency.\r
\r
| Score (x) | Frequency (f) |\r
|:-:|:-:|\r
| 12 | 4 |\r
| 13 | ? |\r
| 14 | 6 |\r
| 15 | 3 |\r
| 16 | 2 |\r
| 17 | 1 |\r
\r
*(Reverse problem: given the mean, find the missing value — extends the same procedure in a new direction)*\r
\r
### Fading Rationale\r
\r
The fading sequence removes steps from the end of the procedure backward because the final steps (division and interpretation) are procedurally simpler and can be handed to the student first without overwhelming working memory. The middle steps (constructing the fx column and finding totals) are the most conceptually demanding — this is where the key insight lives (each value contributes frequency-many times to the total) — so these steps remain supported longest. By Completion Problem 4, only the raw table is provided and the student performs the entire procedure. Independent practice then varies the surface features (horizontal table, text-based data, reverse problem) to promote transfer beyond the specific format of the worked example.\r
\r
### Expertise Reversal Note\r
\r
If students are completing Completion Problem 2 accurately and confidently, skip directly to Completion Problem 4 or independent practice. Forcing advanced students through every fading stage wastes time and creates redundancy load (Kalyuga et al., 2003). For Year 11 students revising this topic, skip the worked example entirely — begin at independent practice and provide a worked example only if errors indicate the procedure isn't secure.\r
\r
---\r
\r
## Known Limitations\r
\r
1. **Worked examples are most effective for procedural skills with clear steps.** For tasks that are primarily conceptual, creative, or require judgment (e.g., writing an essay, designing an experiment), the step-by-step worked example format is less applicable. The skill can still produce useful models, but the fading sequence may not transfer as cleanly to open-ended tasks.\r
\r
2. **The fading sequence assumes relatively homogeneous student readiness.** In a mixed-ability class, some students will need more fading stages and some fewer. Teachers should use Completion Problem 2 as a checkpoint — if a student is accurate, move them forward faster. If they're struggling, provide an additional worked example with different numbers before continuing the fade.\r
\r
3. **Surface feature variation in independent practice is crucial but hard to fully anticipate.** If all practice problems look too similar to the worked example, students may develop inflexible knowledge that only works for problems that look like the example. The skill attempts to vary surface features, but teachers should add further variations based on their knowledge of what problem formats appear in assessments.\r
`,o=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: retrieval-practice-generator\r
description: "Generate retrieval practice questions at varied difficulty levels for a topic or concept. Use when creating quiz starters, revision activities, or low-stakes testing materials."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "memory-learning-science/retrieval-practice-generator"\r
skill_name: "Retrieval Practice Question Generator"\r
domain: "memory-learning-science"\r
version: "1.0"\r
evidence_strength: "strong"\r
evidence_sources:\r
  - "Roediger & Butler (2011) — The critical role of retrieval practice in long-term retention"\r
  - "Karpicke & Roediger (2008) — The critical importance of retrieval for learning"\r
  - "Rowland (2014) — Meta-analysis: the effect of testing versus restudy on retention (effect size 0.50)"\r
  - "Agarwal et al. (2012) — Classroom-based retrieval practice studies with middle school students"\r
  - "Dunlosky et al. (2013) — Practice testing rated as high-utility learning strategy"\r
input_schema:\r
  required:\r
    - field: "topic"\r
      type: "string"\r
      description: "The specific concept or skill students need to retrieve"\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group and approximate prior knowledge level"\r
    - field: "question_count"\r
      type: "integer"\r
      description: "Number of questions to generate (recommended 6–10)"\r
  optional:\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: individual language levels, prior knowledge gaps"\r
    - field: "competency_framework"\r
      type: "string"\r
      description: "From context engine: school's assessment framework or curriculum standard"\r
    - field: "time_since_learning"\r
      type: "string"\r
      description: "How long ago students first encountered this material"\r
    - field: "known_misconceptions"\r
      type: "array"\r
      description: "Specific misconceptions already observed in this cohort"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "questions"\r
      type: "array"\r
      description: "List of retrieval questions, each with question text, retrieval type label (free recall / cued recall / recognition), and difficulty estimate"\r
    - field: "spacing_recommendation"\r
      type: "string"\r
      description: "When to use these questions relative to original learning"\r
    - field: "answer_notes"\r
      type: "string"\r
      description: "Key points for correct answers and common errors to watch for"\r
    - field: "teacher_script"\r
      type: "string"\r
      description: "Brief suggested implementation script (how to run the retrieval activity)"\r
chains_well_with:\r
  - "spaced-practice-scheduler"\r
  - "formative-assessment-technique-selector"\r
  - "gap-analysis-from-student-work"\r
  - "cognitive-load-analyser"\r
teacher_time: "3 minutes"\r
tags: ["retrieval", "memory", "assessment", "spaced-practice", "testing-effect"]\r
---\r
\r
# Retrieval Practice Question Generator\r
\r
## What This Skill Does\r
\r
Generates a set of retrieval practice questions that force genuine reconstruction of knowledge from memory — not recognition, not re-reading, not familiarity-based guessing. The skill distinguishes between free recall (no cues), cued recall (partial cues), and recognition (select from options) question types, and calibrates the mix based on student level and time since learning. AI is specifically valuable here because designing questions that target reconstruction rather than recognition requires deep understanding of the testing effect literature — most teacher-made quiz questions inadvertently test recognition.\r
\r
## Evidence Foundation\r
\r
The testing effect is one of the most robust findings in cognitive psychology. Karpicke & Roediger (2008) demonstrated that retrieval practice produces substantially better long-term retention than re-studying, even when re-study involves more total exposure time. Roediger & Butler (2011) established that retrieval practice strengthens memory traces through a distinct mechanism from encoding — the act of reconstruction itself modifies the memory. Rowland's (2014) meta-analysis of 159 studies found a mean effect size of 0.50 for testing versus restudy, with effects robust across age groups, materials, and delay intervals. Critically, Agarwal et al. (2012) replicated these effects in real classroom settings with middle school students, confirming the lab-to-classroom transfer. Dunlosky et al. (2013) rated practice testing as one of only two "high utility" learning strategies in their landmark review of ten techniques.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Topic:** The specific concept or skill students need to retrieve. *e.g. "causes of World War I" / "photosynthesis light reactions" / "solving linear equations with one variable"*\r
- **Student level:** Year group and approximate prior knowledge. *e.g. "Year 9, mid-ability, covered this topic 2 weeks ago" / "Year 12 Biology, high prior knowledge"*\r
- **Question count:** Number of questions to generate. *e.g. 8*\r
\r
Optional (injected by context engine if available):\r
- **Student profiles:** Individual language proficiency levels, identified knowledge gaps from prior assessments\r
- **Competency framework:** The specific curriculum standard or assessment framework being targeted\r
- **Time since learning:** Duration since the material was first taught (affects difficulty calibration)\r
- **Known misconceptions:** Specific misconceptions already observed in student responses\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in cognitive psychology specialising in the testing effect and retrieval-based learning. You have deep knowledge of Roediger & Butler's (2011) work on retrieval practice, Karpicke & Roediger's (2008) research on the critical importance of retrieval for learning, and Rowland's (2014) meta-analysis demonstrating robust effect sizes for testing versus restudy.\r
\r
Your task is to generate {{question_count}} retrieval practice questions on the topic "{{topic}}" for {{student_level}}.\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Time since learning:** {{time_since_learning}} — if not provided, assume the material was taught within the last 1–2 weeks and calibrate difficulty accordingly.\r
**Known misconceptions:** {{known_misconceptions}} — if not provided, include questions targeting the most common misconceptions for this topic based on your subject knowledge.\r
**Competency framework:** {{competency_framework}} — if not provided, generate questions aligned to general curriculum expectations for the stated year group.\r
**Student profiles:** {{student_profiles}} — if not provided, design for a typical mixed-ability class with no specific language or learning needs.\r
\r
Apply these evidence-based criteria when generating questions:\r
\r
1. **Retrieval type distribution:** Include a mix of:\r
   - Free recall questions (no cues — e.g. "Explain the process of..." / "List the factors that...") — these produce the strongest learning effect but are hardest\r
   - Cued recall questions (partial cues — e.g. "The three main causes were _____, _____, and _____" / "Complete this diagram...") — moderate difficulty, good scaffolding\r
   - Recognition questions (select from options — e.g. multiple choice) — weakest retrieval effect but useful for building confidence in novice learners\r
   Weight toward free and cued recall. Only include recognition questions for novice learners or as warm-up.\r
\r
2. **Genuine reconstruction, not recognition:** Every question must require the student to reconstruct knowledge from memory, not simply recognise familiar-looking information. Avoid questions answerable by surface-level pattern matching.\r
\r
3. **Target the right knowledge:** Questions should target the core concepts, relationships, and procedures — not trivial details, dates, or definitions unless those are genuinely important to understanding.\r
\r
4. **Difficulty calibration:** If time since learning is recent (< 1 week), include more cued recall. If time since learning is longer (> 2 weeks), free recall becomes more valuable as it provides stronger retrieval practice during the forgetting phase.\r
\r
5. **Misconception targeting:** If known misconceptions are provided, include at least 2 questions specifically designed to surface those misconceptions.\r
\r
Return your output in this exact format:\r
\r
## Retrieval Practice Questions: [Topic]\r
\r
**For:** [Student level]\r
**Spacing recommendation:** [When to use these questions — e.g. "Use 3–7 days after initial teaching for optimal spacing effect. Re-use a subset at 2–4 weeks for a second retrieval opportunity."]\r
\r
### Questions\r
\r
For each question, provide:\r
- The question text\r
- **Type:** [Free Recall / Cued Recall / Recognition]\r
- **Targets:** [What specific knowledge this retrieves]\r
\r
### Answer Notes\r
\r
For each question, provide:\r
- Key points for a correct answer\r
- Common errors or misconceptions to watch for\r
\r
### Implementation Script\r
\r
A brief (3–4 sentence) script for how the teacher should run this retrieval activity in class, including:\r
- Whether to allow notes (no — that defeats the purpose)\r
- How long to give students (typically 8–12 minutes for 6–10 questions)\r
- What to do after (discuss answers, identify gaps, do NOT grade — low-stakes is essential)\r
\r
**Self-check before returning output:** Verify that (a) each question requires genuine reconstruction, not just recognition, (b) the mix of retrieval types is appropriate for the student level, (c) no question is answerable from the question text alone without prior knowledge, and (d) the questions target meaningful knowledge, not trivia.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Topic: "The causes and process of erosion" / Student level: "Year 7 Geography, mixed ability, covered this 10 days ago" / Question count: 8*\r
\r
---\r
\r
## Retrieval Practice Questions: The Causes and Process of Erosion\r
\r
**For:** Year 7 Geography, mixed ability\r
**Spacing recommendation:** Use now (10 days post-learning is within the optimal spacing window). Re-use questions 1, 3, 5, and 7 in 2–3 weeks for a second retrieval opportunity. After that, integrate erosion retrieval into mixed-topic quizzes once per half-term.\r
\r
### Questions\r
\r
**Q1.** Without looking at any notes, explain the difference between erosion and weathering. Why are they not the same thing?\r
- **Type:** Free Recall\r
- **Targets:** Distinction between two commonly conflated processes; understanding that erosion involves transport\r
\r
**Q2.** Name the four main types of erosion that rivers cause. For each one, describe what physically happens to the rock or riverbed.\r
- **Type:** Free Recall\r
- **Targets:** Hydraulic action, abrasion, attrition, solution — and the mechanism of each, not just the label\r
\r
**Q3.** A farmer notices that the soil on a hillside field is thinner every year. The field has no trees or hedgerows. Explain why the soil is disappearing, using the correct geographical terms.\r
- **Type:** Cued Recall (scenario provides contextual cue)\r
- **Targets:** Soil erosion process, role of vegetation in preventing erosion, surface runoff\r
\r
**Q4.** Complete this sequence: Rock is broken down by weathering → loose material is __________ by erosion → material is carried by a river, which is called __________ → material is dropped when the river slows, which is called __________.\r
- **Type:** Cued Recall\r
- **Targets:** Transport/erosion, transportation, deposition — the full cycle\r
\r
**Q5.** Draw a simple diagram showing how a waterfall is formed by erosion. Label at least four features and explain what type of erosion is happening at each point.\r
- **Type:** Free Recall (diagram from memory)\r
- **Targets:** Undercutting, hard/soft rock, plunge pool, retreat — spatial understanding of the process\r
\r
**Q6.** A student writes: "Erosion is when rocks get broken into smaller pieces by the weather." What is wrong with this statement? Write a more accurate version.\r
- **Type:** Cued Recall (error correction)\r
- **Targets:** Distinguishing weathering from erosion; understanding that erosion is about movement, not just breakdown\r
\r
**Q7.** Why does erosion happen faster in some places than others? Give three specific factors and explain how each one affects the rate of erosion.\r
- **Type:** Free Recall\r
- **Targets:** Rock type/hardness, climate/rainfall, vegetation cover, human activity — causal reasoning\r
\r
**Q8.** Which of the following is an example of abrasion?\r
(a) Salt crystals expanding in cracks in a cliff face\r
(b) Pebbles carried by a river grinding against the riverbed\r
(c) Carbon dioxide in rainwater dissolving limestone\r
(d) Waves compressing air into cracks in rock\r
- **Type:** Recognition\r
- **Targets:** Distinguishing abrasion from salt weathering (a), chemical weathering/solution (c), and hydraulic action (d)\r
\r
### Answer Notes\r
\r
- **Q1:** Key distinction — weathering breaks down rock *in situ*, erosion involves the *transport* of material. Common error: students say "erosion is when rock breaks down" (conflating with weathering).\r
- **Q2:** Hydraulic action (force of water), abrasion (sediment scraping), attrition (particles grinding each other), solution (chemical dissolving). Common error: confusing abrasion with attrition.\r
- **Q3:** Without vegetation roots to bind soil, rainfall creates surface runoff that carries topsoil downhill. Key terms: surface runoff, soil erosion, lack of interception. Common error: saying "the wind blows it away" without explaining the water-based mechanism.\r
- **Q4:** Transported (or picked up/moved), transportation, deposition. Common error: using "erosion" for all three blanks.\r
- **Q5:** Must show hard rock over soft rock, undercutting of soft rock, overhang, collapse, plunge pool, and gorge formation through retreat. Common error: drawing it as a single event rather than a process over time.\r
- **Q6:** The statement describes weathering, not erosion. Erosion specifically involves the *movement* of material. Better: "Erosion is the process by which weathered material is picked up and transported by agents such as rivers, waves, wind, or ice."\r
- **Q7:** Accept: rock hardness/type, rainfall amount and intensity, vegetation cover, slope angle, human activity (deforestation, construction). Must explain the mechanism, not just list factors.\r
- **Q8:** Correct answer: (b). Distractor analysis: (a) = salt weathering, (c) = chemical weathering/solution, (d) = hydraulic action.\r
\r
### Implementation Script\r
\r
Run this as a low-stakes retrieval starter — no notes, no textbooks, no devices. Tell students: "This is not a test for marks. It's a memory exercise. Getting stuck is normal and actually helps you learn — that's what the research shows." Give 10 minutes for all 8 questions. Students who finish early should go back and add more detail. After time is up, discuss answers as a class, focusing on Q1 and Q6 (the most common misconceptions). Do not collect or grade — the learning happens in the retrieval attempt itself, not in the score.\r
\r
---\r
\r
## Known Limitations\r
\r
1. **Cannot verify factual accuracy against a specific textbook or syllabus.** The questions are generated from general subject knowledge. Teachers should check that terminology and expected answers match what was actually taught — especially for Q2 and Q4 where specific terms may vary between curricula.\r
\r
2. **Free recall questions may overwhelm students with very low prior knowledge or limited English proficiency.** For EAL students or those with significant gaps, increase the proportion of cued recall and recognition questions. Chain with the Scaffolded Task Modifier for language-adapted versions.\r
\r
3. **The spacing recommendation is calibrated to lab research on optimal intervals.** Real classroom scheduling constraints (timetable gaps, holidays, assessment windows) may make the recommended spacing impractical. Teacher judgment on timing is always necessary.\r
`,l=[r,i,a,s,o,t].map(e=>n(e)).filter(Boolean);function h(){return l}export{h as getAll};
