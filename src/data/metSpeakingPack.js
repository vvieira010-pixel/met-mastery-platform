export const MET_SPEAKING_PACK = {
  title: 'MET Speaking — How It Is Scored',
  source: 'Michigan Language Assessment — 26.3 MET Speaking Resource Pack (University of Michigan)',
  categories: [
    {
      name: 'Task Completion',
      what: 'How fully you complete the prompt: relevance to topic, amount you say, and your ability to elaborate with supporting detail.',
    },
    {
      name: 'Language Resources',
      what: 'Range and accuracy of vocabulary and grammar: complex sentences, control, error seriousness, and vocabulary appropriacy to the task.',
    },
    {
      name: 'Intelligibility / Delivery',
      what: 'How your speech sounds: fluency, rhythm, pronunciation (sounds + word stress), and hesitations/pauses.',
    },
  ],
  scale: [
    {
      score: 4,
      taskCompletion: 'Directly relevant. Fully completes the task with extensive supporting detail.',
      languageResources: 'Complex sentences usually controlled. Errors infrequent and not distracting. Broad, task-appropriate vocabulary.',
      delivery: 'Usually smooth, little hesitation. Clear and easy to understand.',
    },
    {
      score: 3,
      taskCompletion: 'Directly relevant. Completes the task with general details but not original or extensive support.',
      languageResources: 'Some complex structures but not consistently controlled. No mistakes that cause misunderstanding. Vocabulary directly appropriate.',
      delivery: 'Some hesitation but no long pauses. Generally clear; only a few words unclear.',
    },
    {
      score: 2,
      taskCompletion: 'Generally relevant. Some detail for most aspects; may have difficulty completing the task.',
      languageResources: 'Simple patterns generally controlled. Noticeable errors that do not block meaning. Some relevant vocabulary.',
      delivery: 'Sometimes hesitant with pauses/reformulations while searching for words. Generally clear but listener effort needed in stretches.',
    },
    {
      score: 1,
      taskCompletion: 'Somewhat relevant but very short and simple. Difficulty completing the task.',
      languageResources: 'Simple/short sentences. Basic grammar and word-choice errors. Very limited vocabulary range.',
      delivery: 'Frequent pauses, false starts, reformulations. Many hesitations. Listener effort required.',
    },
    {
      score: 0,
      taskCompletion: 'Little to no response, or not at all relevant.',
      languageResources: 'Insufficient language resources for any meaningful response.',
      delivery: 'Not comprehensible even to a sympathetic listener.',
    },
  ],
  tasks: [
    {
      id: 'task1',
      title: 'Task 1 — Describe a Picture (60 sec)',
      goal: 'Describe exactly what you see — factual, organized, with present continuous + location prepositions.',
      practiceAlone: [
        'Set a 60-sec timer and describe a picture descriptively.',
        'Record yourself.',
        'Hide the image. Listen and try to draw what you described.',
        'Compare drawing vs original — missing details = need more specific language next time.',
      ],
      practiceWithPartner: [
        'Collect similar images with small differences (same people, different actions/appearance).',
        'Describe one image for 60 sec without saying which one.',
        'Partner guesses which image you described — if wrong, add more precise details.',
      ],
    },
    {
      id: 'task2',
      title: 'Task 2 — Personal Experience (60 sec)',
      goal: 'Tell a short personal story linked to the Task 1 theme with past tenses + details (who/where/when/what/why/how) + feeling.',
      tips: [
        'Use Wh- questions as a scaffold to build your story.',
        'Include many details: when it happened, who was with you, how you felt.',
        'Keep tenses consistent — use past tenses for past events; don’t mix within a sentence.',
      ],
      practiceAlone: [
        'Keep a daily 60-sec video journal: summarize one key moment with vivid adjectives/action words.',
      ],
      practiceWithPartner: [
        'Interview each other about a memorable event using Wh- questions.',
        'Take notes, then report back what your partner said.',
        'Compare what was remembered vs missed — add missing details next time.',
        'Each speak for 60 sec on your own experience with as much detail as possible.',
      ],
    },
    {
      id: 'task4',
      title: 'Tasks 4 & 5 — Advantages/Disadvantages & Persuade (90 sec each)',
      goal: 'Task 4: cover both sides (not just one) with reasons, consequences, and unique supporting details. 90 sec gives more time to elaborate. Conclusion is optional.',
      tips: [
        'Elaborate on both advantages and disadvantages — don’t focus on one side only.',
        'Develop each point with “why” and “what consequence?”',
        'Use unique details that fully support each side to score higher.',
      ],
      practiceAlone: [
        'List pros/cons + consequences for hypothetical or personal situations to generate ideas faster.',
        'Build a Venn diagram: Advantages | Connections | Disadvantages — then speak for 90 sec from your notes. Example Venn: “Working with an old friend” — Advantages: new skills, know the boss → more comfortable, working with a friend could be fun vs Disadvantages: skills might be too difficult, people might think you only got the job because you know the boss.',
      ],
    },
  ],
  languageResources: {
    buildingVocab: [
      'Read and listen to as much English as possible.',
      'Write down every new word to review later.',
      'Reuse new vocabulary whenever possible.',
      'Keep a topic-organized vocabulary notebook.',
      'Use flashcards with images or very short sentences; test yourself frequently.',
      'Note part of speech, common usage, pronunciation, and related words.',
      'Play word games (word searches, crosswords, memory) to boost recall.',
      'Learn synonyms/antonyms to vary word choice; write responses first to choose words carefully, then practice speaking spontaneously for 60/90 sec.',
    ],
    grammarAccuracy: [
      'Focus on specific structures: verb tenses, subject–verb agreement, conditionals, adjective clauses, participial phrases.',
      'Study the rule, then practice it spontaneously until it feels natural.',
      'Keep tenses consistent — if asked about a past experience, stay in past tenses; don’t switch within a sentence.',
      'Use complex sentences correctly when appropriate:',
    ],
    grammarExamples: [
      {
        label: 'Join with linking words',
        before: 'Students will resent going to school on Saturdays. And their motivation and grades will be affected.',
        after: 'Not only will students resent going to school on Saturdays but their motivation and grades will also be affected.',
      },
      {
        label: 'Combine with clauses',
        before: 'Students will not like going to school on Saturdays. Saturdays are part of the weekend. They should be a day for fun.',
        after: 'Students will not like going to school on Saturdays, which are part of the weekend and should be days for fun.',
      },
    ],
    selfCorrection: 'If you make a mistake while speaking, go back and correct yourself — it shows control.',
  },
  delivery: {
    intro: 'The single best way to improve is to practice speaking aloud as much as possible. Record yourself, listen back, and get partner feedback.',
    techniques: [
      { name: 'Minimal Pairs', how: 'Ship vs sheep — words differing by one sound. Listen carefully, repeat, record, and compare. If you can’t hear the difference, study that sound more.' },
      { name: 'Tongue Twisters', how: 'Short phrases with similar sounds (e.g., “She sells sea shells on the sea shore”). Start slow, then increase speed without errors.' },
      { name: 'Use a Mirror', how: 'Watch mouth shape for each sound. Look up a visual guide, then copy the shape in the mirror until correct.' },
      { name: 'Listen and Repeat', how: 'Watch TV/movies/videos with subtitles. Mimic intonation, rhythm, and speech patterns.' },
      { name: 'Use a Transcript', how: 'Print a transcript and mark features as you listen, then read aloud with those features. Record and compare. For extra challenge, pre-mark where you think features occur, then check.' },
    ],
    transcriptKey: [
      { symbol: '(', feature: 'Connected sounds' },
      { symbol: '.', feature: 'Pause' },
      { symbol: '✱', feature: 'Stressed syllable' },
      { symbol: '➚', feature: 'Tone goes up' },
      { symbol: '➘', feature: 'Tone goes down' },
    ],
  },
  finalTips: [
    'Focus on clear goals for each practice session.',
    'Record and reflect — use the Speaking Rating Scale above to check you meet your target score.',
    'Seek feedback from proficient speakers on clarity and detail.',
    'Even a few minutes every day builds confidence and score.',
  ],
};
