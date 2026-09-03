export const CATEGORIES = [
  { id: 'listening', label: 'Listening', icon: '🎧' },
  { id: 'reading', label: 'Reading & Grammar', icon: '📖' },
  { id: 'speaking', label: 'Speaking', icon: '🎙️' },
  { id: 'writing', label: 'Writing', icon: '✍️' },
  { id: 'strategy', label: 'Test Strategy', icon: '🎯' },
  { id: 'vocabulary', label: 'Vocabulary & Idioms', icon: '📚' },
];

export const RESOURCE_TYPES = [
  { id: 'all', label: 'All Formats' },
  { id: 'cheatsheet', label: 'In-App Cheat Sheets', icon: '📋' },
  { id: 'article', label: 'Guides & Articles', icon: '📄' },
  { id: 'video', label: 'Videos & Audio', icon: '🎬' },
  { id: 'template', label: 'Templates & Worksheets', icon: '📝' },
  { id: 'link', label: 'Official Links', icon: '🔗' },
];

const RESOURCES = [
  /* ══════════════════════════════════════════════════════════════════
     1. LISTENING RESOURCES
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'res-lis-1',
    category: 'listening',
    type: 'cheatsheet',
    level: 'B1–B2',
    duration: '6 min read',
    title: '2-Speaker Dialogue Distractor Elimination Guide',
    description: 'Learn how to identify tone shifts, indirect agreements, and misleading negative questions in MET Part 1 conversations.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'MET Mastery Listening Lab',
    why: 'Direct alignment with MET Listening Part 1 & 2 question traps',
    tags: ['Dialogues', 'Traps', 'Listening Part 1', 'Distractors'],
    content: `### 2-Speaker Dialogue Distractor Elimination Guide

#### 1. The "Almost True" Distractor
Test writers frequently use exact words spoken in the audio but change the context or time frame.
* **Audio example:** "I was going to submit the lab report before noon, but Dr. Evans gave us until tomorrow morning."
* **Distractor:** "The speaker submitted the report at noon." (Incorrect context)
* **Correct option:** "The deadline was extended."

#### 2. Recognizing Indirect Agreement
In MET dialogues, speakers rarely say "Yes, I agree." Look for these natural idiomatic acknowledgments:
* *"You can say that again!"* = Total agreement.
* *"I'll second that."* = Agreeing with a suggestion.
* *"Tell me about it."* = Sympathy or shared experience.
* *"I wouldn't say no to that."* = Eager acceptance.

#### 3. Negative & Rhetorical Questions
* *"Isn't Dr. Ramirez lecturing today?"* = The speaker expects Dr. Ramirez is lecturing.
* *"Why not drop by the library first?"* = A direct recommendation, not an inquiry about reasons.

#### 4. The 3-Step Elimination Protocol
1. **Predict during the 8-second pause:** Read the 4 options and underline key verbs and nouns.
2. **Listen for the Pivot:** Note contrasting transitions like *actually, however, though, in fact, except*.
3. **Verify the Subject:** Confirm whether the question asks about the woman's opinion, the man's decision, or their shared plan.`
  },
  {
    id: 'res-lis-2',
    category: 'listening',
    type: 'video',
    level: 'B2–C1',
    duration: '12 min video',
    title: 'MET Listening: Long Talks & Lecture Note-Taking Method',
    description: 'Master 2-column shorthand note-taking for Michigan English Test academic talks and public radio interviews.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'Michigan Language Assessment & VV Prep',
    why: 'Addresses 4-to-5 question talk sets in MET Listening Part 3',
    tags: ['Lectures', 'Note-Taking', 'Part 3', 'Audio Strategy'],
    content: `### Long Talks & Lecture Note-Taking Framework

#### The 2-Column Split Method
Divide your scrap paper into two sections:
* **Left Column (Key Concept / Topic Sentence):** Write main topics, definitions, and speaker hypotheses.
* **Right Column (Supporting Evidence / Chronology):** Write statistics, names of researchers, causes, and contrasting results.

#### High-Frequency Shorthand Symbols for MET Listening
* \`→\` : Causes / leads to
* \`≠\` : Differs from / in contrast to
* \`+\` : In addition / further benefit
* \`↑ / ↓\` : Increase / Decrease
* \`w/\` : With
* \`w/o\` : Without
* \`b/c\` : Because

#### Identifying Signpost Language in Academic Talks
* **Definition:** *"By this we mean...", "This phenomenon is termed..."*
* **Contrast:** *"Contrary to earlier assumptions...", "While previous studies indicated..."*
* **Conclusion:** *"The takeaway here is...", "Ultimately, the findings suggest..."*`
  },
  {
    id: 'res-lis-3',
    category: 'listening',
    type: 'article',
    level: 'All Levels',
    duration: '5 min read',
    title: 'American Connected Speech & Acoustic Reductions in MET',
    description: 'Decode fast natural spoken English: Flap T, glottal stops, vowel reductions, and linking in conversational dialogues.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'Applied Linguistics Study Hub',
    why: 'Prevents listening comprehension breakdown caused by phonological linking',
    tags: ['Phonetics', 'Connected Speech', 'American Accent', 'Audio'],
    content: `### American Connected Speech & Acoustic Reductions

#### 1. The Flap [ɾ]
When /t/ or /d/ appears between two vowel sounds (with the second unstressed), it sounds like a light tap:
* *"water"* sounds like *"wah-der"*
* *"put it on"* sounds like *"puh-dih-tahn"*
* *"better off"* sounds like *"beh-der-off"*

#### 2. Pronoun & Auxiliary Reductions
* *"Could have"* → *"Could've"* → \`/kʊdə/\`
* *"Should have been"* → \`/ʃʊdəv bɪn/\`
* *"Tell him"* → *"Tell 'im"* \`/tɛl ɪm/\`
* *"What do you want?"* → \`/wʌtʃə wɑnt/\`

#### 3. Catenation (Consonant to Vowel Linking)
* *"hold on"* → *"hol-don"*
* *"first of all"* → *"firs-tuh-vall"*
* *"pick it up"* → *"pi-ki-tup"*`
  },

  /* ══════════════════════════════════════════════════════════════════
     2. READING & GRAMMAR RESOURCES
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'res-read-1',
    category: 'reading',
    type: 'cheatsheet',
    level: 'B2–C1',
    duration: '8 min read',
    title: '100 Most Tested Prepositional Collocations & Verb Patterns in MET',
    description: 'Comprehensive quick-reference table for high-frequency prepositions, dependent verbs, and adjective collocations tested in MET grammar.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'MET Grammar & Syntax Bank',
    why: 'Directly improves accuracy on the 50-question MET Reading & Grammar section',
    tags: ['Grammar', 'Collocations', 'Prepositions', 'B2-C1'],
    content: `### 100 Most Tested Prepositional Collocations in MET

#### Dependent Prepositions on Verbs
* **Account for** *(explain / constitute a portion)*
* **Comply with** *(follow regulations / laws)*
* **Consist of** *(be composed of)*
* **Contribute to** *(lead to / donate toward)*
* **Deprive of** *(strip away rights / access)*
* **Interfere with** *(disrupt / impede)*
* **Refrain from** *(avoid doing something)*
* **Rely / Depend upon** *(trust / need support from)*
* **Result in** *(lead to outcome)* vs **Result from** *(be caused by)*
* **Stem from** *(originate in)*

#### Adjective + Preposition Pairings
* **Adept at** *(skilled in)*
* **Compatible with** *(working well together)*
* **Eligible for** *(qualified to receive)*
* **Immune to** *(not affected by)*
* **Indifferent to** *(unconcerned about)*
* **Prone to** *(susceptible to injury/illness)*
* **Subject to** *(conditional upon / vulnerable to)*

#### Fixed Prepositional Phrases in Formal English
* *In accordance with* (following rules)
* *In light of* (considering recent facts)
* *On behalf of* (representing someone)
* *With regard to* / *In terms of* (concerning)
* *By virtue of* (because of / by authority of)`
  },
  {
    id: 'res-read-2',
    category: 'reading',
    type: 'cheatsheet',
    level: 'B2–C1',
    duration: '7 min read',
    title: 'Inversions, Conditionals & Subjunctive Structures Master Bank',
    description: 'Detailed breakdown of high-difficulty MET syntax structures including negative inversions, mixed conditionals, and subjunctive clauses.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'MET Advanced Syntax Guild',
    why: 'Covers the top 15% differentiating grammar questions that define CEFR B2 and C1 scores',
    tags: ['Grammar', 'Inversion', 'Conditionals', 'Advanced Syntax'],
    content: `### Advanced MET Grammar Master Bank

#### 1. Negative Inversions (Auxiliary before Subject)
When a negative or restrictive adverb begins a sentence, invert the auxiliary verb and subject:
* **Seldom / Rarely:** *"Rarely **do we observe** such rapid atmospheric shifts."*
* **Not only... but also:** *"Not only **did the study confirm** the diagnosis, but it also revealed new markers."*
* **Under no circumstances:** *"Under no circumstances **should patients discontinue** medication without consultation."*
* **Hardly / Scarcely... when:** *"Hardly **had the procedure concluded** when the results were announced."*

#### 2. Inverted (Conditional Without "If")
* **Had (3rd Conditional):** *"**Had we known** about the supply shortage, we would have adjusted the timeline."*
* **Were (2nd Conditional):** *"**Were the facility to expand**, more staff would be hired."*
* **Should (1st Conditional):** *"**Should you require** further assistance, contact the proctor."*

#### 3. The Mandative Subjunctive (Base Verb)
Following verbs of urgency, demand, or necessity (*insist, recommend, demand, require, propose, vital, essential*):
* *"The committee recommended that the candidate **submit** (not submits) three references."*
* *"It is essential that every protocol **be** (not is) strictly adhered to."*`
  },
  {
    id: 'res-read-3',
    category: 'reading',
    type: 'article',
    level: 'All Levels',
    duration: '6 min read',
    title: 'Multi-Text Skimming & Pacing Strategy for the 65-Minute Reading Section',
    description: 'Learn the 4-phase time budget to finish all 50 reading comprehension and grammar questions with 5 minutes to spare for review.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'MET Mastery Reading Team',
    why: 'Prevents time exhaustion on multi-paragraph reading texts',
    tags: ['Reading', 'Time Management', 'Skimming', 'Pacing'],
    content: `### 65-Minute MET Reading Section Time Budget

#### Recommended Section Breakdown (50 Questions total)
* **Questions 1–20 (Grammar & Sentence Completion):** 15 minutes (approx. 45 seconds per question).
* **Questions 21–32 (Single Reading Passages):** 16 minutes.
* **Questions 33–42 (Multi-Text / Paired Articles):** 15 minutes.
* **Questions 43–50 (Technical / Complex Expository Text):** 14 minutes.
* **Buffer & Review:** 5 minutes.

#### The 3-Step Reading Technique for Long Texts
1. **Title & Topic Sentence First:** Read the first sentence of each paragraph to construct a 30-second mental map.
2. **Scan the Question Stem:** Check if the question is *Global* (main idea, author's tone) or *Local* (specific paragraph, line reference, vocabulary in context).
3. **Targeted Location:** Jump directly to the paragraph referencing key keywords. Never re-read the entire passage from start to finish for factual detail questions.`
  },

  /* ══════════════════════════════════════════════════════════════════
     3. SPEAKING RESOURCES
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'res-spk-1',
    category: 'speaking',
    type: 'cheatsheet',
    level: 'B1–B2–C1',
    duration: '8 min read',
    title: 'MET 5-Task Speaking Blueprint (Q1 to Q5)',
    description: 'Exact templates, timing, and response skeletons for all 5 prompts in the Michigan English Test Speaking assessment.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'VV Method Speaking Lab',
    why: 'Guarantees structured responses that meet CEFR B2/C1 fluency and coherence benchmarks',
    tags: ['Speaking', 'Oral Exam', 'Templates', 'Fluency'],
    content: `### MET Speaking 5-Task Blueprint

#### Task 1: Describing a Picture (60 seconds)
* **Opening (10s):** *"In this photograph, the main focal point is [subject], who appears to be [action/setting]."*
* **Details (35s):** *"In the foreground, we can observe [detail A], whereas in the background, there is [detail B]. The lighting/mood suggests..."*
* **Speculation (15s):** *"Judging by their expression, it seems they might be preparing to..."*

#### Task 2: Expressing a Personal Preference / Story (60 seconds)
* **Direct Answer (10s):** *"If I had to choose between [Option A] and [Option B], I would definitively opt for [Option A]."*
* **Reason 1 + Example (25s):** *"First and foremost, it offers greater flexibility. For instance, when I was..."*
* **Reason 2 + Conclusion (25s):** *"Moreover, it is far more practical in the long run. For these reasons, I prefer..."*

#### Task 3: Evaluating Advantages & Disadvantages (60 seconds)
* **Introduction (10s):** *"There are notable merits as well as significant drawbacks associated with [Topic]."*
* **Advantages (25s):** *"On the positive side, a major benefit is [Point 1], which enables people to..."*
* **Disadvantages (25s):** *"On the other hand, one cannot overlook the potential downside of [Point 2]..."*

#### Task 4: Giving Advice or Solving a Problem (60 seconds)
* **Empathy + Stance (10s):** *"I understand this is a challenging dilemma. If I were in their shoes, I would recommend taking immediate action."*
* **Primary Recommendation (25s):** *"First, they should clearly communicate with [Party], making sure to clarify..."*
* **Alternative Plan (25s):** *"Additionally, having a backup plan such as [Action B] would mitigate any risks."*

#### Task 5: Stating and Defending an Opinion on a Broader Issue (90 seconds)
* **Thesis (15s):** *"While opinions on [Issue] vary widely, I strongly contend that [Stance]."*
* **Point 1 (30s):** *"To begin with, empirical evidence demonstrates that [Argument 1]..."*
* **Counterargument Rebuttal (30s):** *"Admittedly, critics argue that [Counterpoint]; however, this fails to account for..."*
* **Conclusion (15s):** *"In summary, taking a proactive approach to [Issue] is paramount for sustainable progress."*`
  },
  {
    id: 'res-spk-2',
    category: 'speaking',
    type: 'article',
    level: 'B2–C1',
    duration: '5 min read',
    title: 'Discourse Markers & Intonation Patterns for High-Band Fluency',
    description: 'Replace awkward pauses with natural discourse signposts, conversational fillers, and expressive sentence stress.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'Oral Proficiency Institute',
    why: 'Improves the pronunciation and fluency rating components of the MET Speaking scale',
    tags: ['Speaking', 'Discourse Markers', 'Fluency', 'Intonation'],
    content: `### High-Scoring Discourse Markers for MET Speaking

#### Buying Thinking Time (Without Saying "Uhh / Umm")
* *"That's an interesting question to consider..."*
* *"To put it into perspective..."*
* *"Looking at this from another angle..."*
* *"What immediately comes to mind is..."*

#### Transitioning Between Ideas Smoothly
* **Adding weight:** *"Not only that, but on top of it..."*
* **Illustrating:** *"To illustrate this point with a concrete example..."*
* **Contrasting:** *"Having said that, there is another facet to consider..."*
* **Concluding:** *"All things considered, the overarching benefit is..."*

#### Sentence Intonation Rules
* **Lists:** Rising pitch on intermediate items, falling pitch on the final item (*"I enjoy hiking ↗, swimming ↗, and reading ↘"*).
* **Definite statements:** Falling pitch at the end of clauses conveys authority and confidence.`
  },

  /* ══════════════════════════════════════════════════════════════════
     4. WRITING RESOURCES
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'res-wri-1',
    category: 'writing',
    type: 'cheatsheet',
    level: 'B2–C1',
    duration: '8 min read',
    title: 'Task 1 & Task 2 Essay Architectures & Scoring Formulas',
    description: 'Structured templates for short-response emails/requests (Task 1) and 4-paragraph argumentative essays (Task 2) with linking expressions.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'MET Mastery Writing Lab',
    why: 'Provides scoring benchmarks for task completion, coherence, and lexical range',
    tags: ['Writing', 'Essay Template', 'Task 1', 'Task 2', 'Academic'],
    content: `### MET Writing Task 1 & 2 Blueprint

#### Task 1: Formal / Semi-Formal Written Response (approx. 50–75 words)
* **Salutation:** *Dear [Name] / Dear Hiring Committee / Hi [Name],*
* **Purpose Statement (Sentence 1):** *I am writing to inquire about [Topic] / in response to your recent announcement regarding [Topic].*
* **Direct Details (Sentences 2–4):** Address all bullet points given in the prompt with precise vocabulary.
* **Call to Action / Sign-off (Sentence 5):** *I would greatly appreciate your prompt response. Sincerely, [Your Name].*

#### Task 2: 4-Paragraph Argumentative Essay Architecture (approx. 200–250 words)

##### Paragraph 1: Introduction (approx. 40 words)
* **General Hook:** Broad context statement introducing the general topic.
* **Pivot:** Introduce the tension/debate (*While some propose X, others maintain that Y*).
* **Thesis Statement:** Clear declaration of your stance with two supporting preview points.

##### Paragraph 2: Body Paragraph 1 (approx. 70 words)
* **Topic Sentence:** *The foremost justification for [Stance] lies in [Point 1].*
* **Explanation:** Elaborate on the underlying mechanism or societal impact.
* **Concrete Example:** *For instance, recent workplace data indicates that...*
* **Concluding Connection:** *Consequently, this underscores the necessity of...*

##### Paragraph 3: Body Paragraph 2 + Counterargument (approx. 70 words)
* **Topic Sentence:** *Furthermore, [Point 2] plays a pivotal role in ensuring...*
* **Counterbalance:** *Granted, opponents argue that [Counterpoint]; nevertheless, this can be addressed by...*
* **Impact Sentence:** *Thus, the advantages substantially outweigh any temporary hurdles.*

##### Paragraph 4: Conclusion (approx. 40 words)
* **Restatement of Thesis:** *In conclusion, taking all factors into account, [Restate position in fresh words].*
* **Final Thought / Recommendation:** *Moving forward, implementing these measures will prove indispensable for future success.*`
  },
  {
    id: 'res-wri-2',
    category: 'writing',
    type: 'template',
    level: 'All Levels',
    duration: '5 min read',
    title: 'Top 10 Avoidable Sentence Errors Checklist in MET Writing',
    description: 'Printable editing checklist to eliminate run-on sentences, comma splices, subject-verb disagreement, and dangling modifiers.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'Academic Writing Center',
    why: 'Saves 5 to 10 points in the grammatical accuracy and range sub-score',
    tags: ['Writing', 'Proofreading', 'Grammar Errors', 'Editing'],
    content: `### Top 10 Avoidable Sentence Errors in MET Writing

#### 1. Comma Splice
* **Incorrect:** *The experiment concluded, the results were inconclusive.*
* **Correct:** *The experiment concluded; however, the results were inconclusive.* OR *Although the experiment concluded, the results were inconclusive.*

#### 2. Run-on / Fused Sentence
* **Incorrect:** *Students must register early otherwise classes will be full.*
* **Correct:** *Students must register early; otherwise, classes will be full.*

#### 3. Dangling Modifier
* **Incorrect:** *Having analyzed the data, the conclusion was obvious.* (The conclusion did not analyze the data!)
* **Correct:** *Having analyzed the data, the researchers reached an obvious conclusion.*

#### 4. Pronoun-Antecedent Agreement
* **Incorrect:** *Every participant must submit their log.* (Acceptable in informal speech, but formal MET essays prefer precise gender-neutral or plural phrasing):
* **Refined:** *All participants must submit their logs.*

#### 5. Parallel Structure in Lists
* **Incorrect:** *The program teaches writing, speaking, and how to read.*
* **Correct:** *The program teaches writing, speaking, and reading.*`
  },

  /* ══════════════════════════════════════════════════════════════════
     5. TEST STRATEGY & OFFICIAL RESOURCES
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'res-strat-1',
    category: 'strategy',
    type: 'link',
    level: 'All Levels',
    duration: 'Official Doc',
    title: 'Official MET Test Specifications & CEFR Concordance Scale',
    description: 'Michigan Language Assessment official CEFR cut-off scores, section breakdowns, and scaled score conversions (0–80 per section).',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'Michigan Language Assessment',
    why: 'Essential reference for score targets, hospital/licensing board requirements, and CEFR levels',
    tags: ['Official', 'CEFR', 'Score Scale', 'Specifications'],
    content: `### Official MET CEFR Score Concordance

| Scaled Section Score | Overall Score Range | CEFR Level | Practical Meaning |
| :--- | :--- | :--- | :--- |
| **0 – 39** | < 40 | A2 / Below | Basic User |
| **40 – 52** | 40 – 52 | **B1** | Independent User (Intermediate) |
| **53 – 63** | 53 – 63 | **B2** | Vantage / Professional Readiness |
| **64 – 80** | 64 – 80 | **C1** | Effective Operational Proficiency |

*Note: For CGFNS / Nursing / Medical Board licensing, a score of 53+ in each section (B2) or an overall scaled score of 55+ is typical. Always verify your specific state or board requirements.*`
  },
  {
    id: 'res-strat-2',
    category: 'strategy',
    type: 'template',
    level: 'All Levels',
    duration: 'Template',
    title: 'Personal MET Error Log & Remediation Sheet',
    description: 'Actionable tracking template to categorize practice mistakes by Skill, Root Cause (Lexical, Grammatical, Distractor Trap, Pacing), and Next Action.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'MET Mastery Diagnostic Protocol',
    why: 'Directly turns diagnostic and homework feedback into measurable score gains',
    tags: ['Error Log', 'Diagnostic', 'Self-Study', 'Tracker'],
    content: `### Personal MET Error Log Protocol

#### When to Log an Error
Whenever you miss a question in homework, a mock test, or class exercises, do not simply look at the right answer. Fill out this 4-step log:

| Date | Section & Q# | What I Selected vs Correct | Why I Missed It (Root Cause) | Prevention Rule |
| :--- | :--- | :--- | :--- | :--- |
| *Ex: Oct 12* | *Reading Q14* | *Selected C (consist with) instead of A (consist of)* | *Collocation confusion* | *Review "consist OF" flashcard daily* |
| *Ex: Oct 14* | *Listening Q28* | *Selected B (Tomorrow) instead of D (Next week)* | *Missed the pivot word "postponed"* | *Wait until the speaker finishes full sentence* |

#### The 4 Root Cause Categories
1. **Vocabulary / Collocation Deficit:** Did not know the idiom or word meaning.
2. **Grammatical Constraint:** Overlooked agreement, verb tense, or inversion trigger.
3. **Pacing / Time Pressure:** Rushed through options in the final 30 seconds.
4. **Distractor Trap:** Fell for identical audio words used in an altered context.`
  },
  {
    id: 'res-strat-3',
    category: 'strategy',
    type: 'article',
    level: 'All Levels',
    duration: '4 min read',
    title: 'Digital MET at Home vs. Test Center: Essential Exam Day Checklist',
    description: 'Hardware requirements, proctor rules, room setup, ID requirements, and audio headset configurations for the Michigan English Test.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'Michigan Assessment Operations',
    why: 'Prevents disqualifications, tech issues, or last-minute panic on exam day',
    tags: ['Exam Day', 'Digital MET', 'Proctoring', 'Checklist'],
    content: `### Digital MET Exam Day Checklist

#### 1. Hardware & System Setup
* **Computer:** Windows or macOS laptop/desktop (no tablets or phones).
* **Webcam & Microphone:** Built-in or external camera with 360-degree room scan capability.
* **Headset:** Wired 3.5mm or USB headphones with microphone (Bluetooth wireless earbuds are prohibited).
* **Browser:** Latest version of Chrome or the designated secure test delivery browser.

#### 2. Room Environment & Desk Rules
* Clean, flat desk surface with only computer, mouse, clear water glass, and 1 sheet of blank scratch paper with pen (if permitted by test version).
* Well-lit room with no secondary monitors, books, or posters in camera view.
* Complete quiet: ensure no family members or pets enter the testing room during the session.

#### 3. Identification & Credentials
* Valid government-issued passport or national photo ID matching your registration name exactly.
* Have your exam confirmation code and portal login credentials ready.`
  },

  /* ══════════════════════════════════════════════════════════════════
     6. VOCABULARY & IDIOMS RESOURCES
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'res-voc-1',
    category: 'vocabulary',
    type: 'cheatsheet',
    level: 'B2–C1',
    duration: '10 min read',
    title: 'MET High-Yield Academic Word List (50 Top Sub-Lists & Synonyms)',
    description: 'The 50 most frequently recurring academic verbs, nouns, and modifiers in Michigan English Test texts with formal alternatives.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'Corpus of Academic English & MET Analysis',
    why: 'Boosts both reading comprehension accuracy and written vocabulary band score',
    tags: ['Vocabulary', 'Academic Word List', 'Synonyms', 'Lexical Resource'],
    content: `### 50 High-Yield Academic Verbs & Formal Substitutes

| Informal / Common | Formal MET Academic Synonym | Example Usage in MET Context |
| :--- | :--- | :--- |
| *Make sure* | **Ascertain / Verify** | *The audit sought to ascertain the accuracy of the records.* |
| *Show* | **Demonstrate / Illustrate / Exemplify** | *The clinical trial demonstrated a marked reduction in symptoms.* |
| *Help* | **Facilitate / Foster** | *New interactive software facilitates foreign language acquisition.* |
| *Get / Obtain* | **Acquire / Derive** | *The department acquired substantial grant funding for research.* |
| *Give up* | **Relinquish / Forego** | *The director relinquished control over daily operations.* |
| *Stop / Block* | **Imped / Deter / Inhibit** | *Extreme climate conditions may deter further expansion.* |
| *Put together* | **Synthesize / Integrate** | *The paper synthesizes findings from twelve global studies.* |
| *Point out* | **Indicate / Emphasize / Highlight** | *Researchers highlighted key disparities in the data set.* |
| *Change* | **Modify / Alter / Fluctuate** | *Annual expenditures fluctuated considerably over the decade.* |
| *Start* | **Commence / Initiate** | *Phase two of the restoration will commence next quarter.* |`
  },
  {
    id: 'res-voc-2',
    category: 'vocabulary',
    type: 'article',
    level: 'B1–B2',
    duration: '6 min read',
    title: 'Essential Idiomatic Expressions in Professional & Campus Dialogues',
    description: 'Decode 30 idioms frequently spoken in MET Part 1 and Part 2 dialogues concerning campus life, internships, and work projects.',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    source: 'MET Pragmatics & Idioms Guide',
    why: 'Prevents taking colloquial expressions literally during listening tests',
    tags: ['Idioms', 'Listening Dialogues', 'Campus Life', 'Vocabulary'],
    content: `### Essential MET Campus & Professional Idioms

* **"Back to the drawing board"** → Starting a project over from the beginning due to an initial failure.
* **"Bite off more than you can chew"** → Taking on more responsibility or courses than one can handle.
* **"Burn the midnight oil"** → Studying or working late into the night.
* **"Call it a day"** → Deciding to stop working for the remainder of the afternoon/evening.
* **"Cut corners"** → Doing something cheaply or carelessly to save time or money.
* **"Hit the books"** → Beginning an intensive study session.
* **"In hot water"** → Facing trouble or administrative consequences.
* **"On the fence"** → Undecided between two choices or elective courses.
* **"Play it by ear"** → Deciding how to deal with a situation as it develops rather than planning.
* **"See eye to eye"** → Agreeing fully with a classmate or supervisor.`
  }
];

export default RESOURCES;
