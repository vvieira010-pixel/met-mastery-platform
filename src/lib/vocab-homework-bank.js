let fullDataPromise = null;
function getFullData() {
  if (!fullDataPromise) {
    fullDataPromise = (async () => {
      const mod = await import('../data/exercises/vocabulary/met-vocab-homework-bank.js');
      const addon = (await import('../data/exercises/vocabulary/met-vocab-addon-exercises.js')).default;
      const mergedTopics = mod.vocabTopics.map(t => {
        const extra = addon[t.id];
        return extra ? { ...t, exercises: [...t.exercises, ...extra] } : t;
      });
      return { ...mod, vocabTopics: mergedTopics };
    })();
  }
  return fullDataPromise;
}

export function getTopicList(mode) {
  if (mode === 'b2_mcq') {
    return [
      { id: 'reading', title: 'Reading' },
      { id: 'listening', title: 'Listening' },
      { id: 'speaking', title: 'Speaking' },
      { id: 'writing', title: 'Writing' },
      { id: 'vocabulary', title: 'Vocabulary' },
      { id: 'grammar', title: 'Grammar' },
    ];
  }
  if (mode === 'reading') {
    return [
      { id: 'reading_full_bank', title: 'Full Reading Bank' },
      { id: 'study_abroad', title: 'Study Abroad & Work' },
      { id: 'online_learning', title: 'Online Learning & Technology' },
    ];
  }
  if (mode === 'speaking') {
    return [
      { id: 'describe_image', title: 'Describe the Image' },
      { id: 'speaking_full_bank', title: 'Full Speaking Bank' },
      { id: 'work_career', title: 'Work and Career' },
      { id: 'healthcare', title: 'Healthcare and Patient Care' },
      { id: 'education', title: 'Education and Learning' },
      { id: 'technology', title: 'Technology and Digital Life' },
      { id: 'environment', title: 'Environment and Sustainability' },
      { id: 'community', title: 'Community and Public Services' },
      { id: 'travel_culture', title: 'Travel, Culture, and Moving Abroad' },
      { id: 'money_consumer', title: 'Money, Consumer Choices, and Advertising' },
      { id: 'family_relationships', title: 'Family, Relationships, and Social Life' },
      { id: 'media_news', title: 'Media, News, and Communication' },
      { id: 'general', title: 'General Vocabulary' },
    ];
  }
  if (mode === 'grammar') {
    return [
      { id: 'gm_common_mistakes', title: 'Common Mistakes' },
      { id: 'gm_conditionals', title: 'Conditionals' },
      { id: 'gm_passive', title: 'Passive Voice' },
      { id: 'gm_modals', title: 'Modal Verbs' },
      { id: 'gm_inversion', title: 'Inversion' },
      { id: 'gm_relatives', title: 'Relative Clauses' },
      { id: 'gm_articles', title: 'Articles' },
      { id: 'gm_pronouns', title: 'Pronouns' },
      { id: 'gm_comparatives', title: 'Comparatives' },
      { id: 'gm_phrasal', title: 'Phrasal Verbs' },
      { id: 'gm_agreement', title: 'Subject-Verb Agreement' },
      { id: 'gm_reported', title: 'Reported Speech' },
      { id: 'gm_gerunds', title: 'Gerunds vs Infinitives' },
      { id: 'gm_quantifiers', title: 'Quantifiers' },
      { id: 'gm_connectors', title: 'Connectors' },
      { id: 'gm_demonstratives', title: 'Demonstratives' },
      { id: 'gm_adverbs', title: 'Adverbs of Degree' },
      { id: 'gm_infinitives', title: 'Infinitives of Purpose' },
      { id: 'gm_somewhere', title: 'Somewhere / Anywhere' },
      { id: 'gm_order_fix', title: 'Sentence Ordering & Error Correction' },
      { id: 'gm_grammar_50_more', title: 'Grammar — 48 More' },
      { id: 'gm_full_bank', title: 'Full Grammar Bank' },
    ];
  }
  if (mode === 'writing' || mode === 'vocab') {
    const label = mode === 'writing' ? 'Writing' : 'Vocabulary';
    return [
      { id: `${mode}_full_bank`, title: `Full ${label} Bank` },
      { id: 'work_career', title: 'Work and Career' },
      { id: 'healthcare', title: 'Healthcare and Patient Care' },
      { id: 'education', title: 'Education and Learning' },
      { id: 'technology', title: 'Technology and Digital Life' },
      { id: 'environment', title: 'Environment and Sustainability' },
      { id: 'community', title: 'Community and Public Services' },
      { id: 'travel_culture', title: 'Travel, Culture, and Moving Abroad' },
      { id: 'money_consumer', title: 'Money, Consumer Choices, and Advertising' },
      { id: 'family_relationships', title: 'Family, Relationships, and Social Life' },
      { id: 'media_news', title: 'Media, News, and Communication' },
      { id: 'general', title: 'General Vocabulary' },
    ];
  }
  if (mode === 'listening') {
    return []; // Handled asynchronously in PracticeSession or via a new helper
  }
  return [
    { id: 'work_career', title: 'Work and Career' },
    { id: 'healthcare', title: 'Healthcare and Patient Care' },
    { id: 'education', title: 'Education and Learning' },
    { id: 'technology', title: 'Technology and Digital Life' },
    { id: 'environment', title: 'Environment and Sustainability' },
    { id: 'community', title: 'Community and Public Services' },
    { id: 'travel_culture', title: 'Travel, Culture, and Moving Abroad' },
    { id: 'money_consumer', title: 'Money, Consumer Choices, and Advertising' },
    { id: 'family_relationships', title: 'Family, Relationships, and Social Life' },
    { id: 'media_news', title: 'Media, News, and Communication' },
    { id: 'general', title: 'General Vocabulary' },
  ];
}

let supplementaryListeningPromise = null;
async function getSupplementaryListening() {
  if (!supplementaryListeningPromise) {
    supplementaryListeningPromise = (async () => {
      try {
        const mod = await import('../../met_listening_section_76_100.json', { with: { type: 'json' } });
        return mod.default?.exercises || mod.exercises || [];
      } catch {
        return [];
      }
    })();
  }
  return supplementaryListeningPromise;
}

let met26Promise = null;
async function getMet26Conversations() {
  if (!met26Promise) {
    met26Promise = (async () => {
      try {
        const mod = await import('../../met_26_conversations.json', { with: { type: 'json' } });
        return mod.default?.exercises || mod.exercises || [];
      } catch {
        return [];
      }
    })();
  }
  return met26Promise;
}

export async function getListeningAudioGroups() {
  const { vocabTopics } = await getFullData();
  const { LISTENING } = await import('./met-b2-exercises.js');
  const supplementary = await getSupplementaryListening();
  const met26 = await getMet26Conversations();
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  const b2Listening = getMetB2MultipleChoice('listening');

  const allListening = [
    ...vocabTopics.flatMap(t => t.exercises.filter(e => e.type === 'listen')),
    ...LISTENING,
    ...supplementary,
    ...met26,
    ...b2Listening
  ];

  const groups = new Map();

  allListening.forEach(ex => {
    const audioId = ex.audioSrc || `embed-${ex.id}`;
    if (!audioId) return;

    let title;
    if (ex.audioTitle) {
      title = ex.audioTitle;
    } else if (ex.audioSrc) {
      const filename = ex.audioSrc.split('/').pop() || '';
      title = filename
        .replace(/^listening-(L\d+-)?/, '')
        .replace(/\.mp3$/, '')
        .split(/[-_]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else {
      title = ex.title || 'Special Exercise';
    }

    groups.set(audioId, title);
  });

  return Array.from(groups.entries()).map(([id, title]) => ({ id, title }));
}

export async function getGrammarExercises(topicId) {
  const drillMod = await import('./met-grammar-bank.js');
  const allModules = drillMod.getGrammarModules();
  if (topicId === 'gm_full_bank') {
    const { grammarMCQs } = await getFullData();
    const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
    return [...grammarMCQs, ...allModules.flatMap(m => m.exercises), ...getMetB2MultipleChoice('grammar')];
  }
  if (topicId) {
    const mod = allModules.find(m => m.id === topicId);
    if (mod) return mod.exercises;
  }
  const { grammarMCQs } = await getFullData();
  const drillQuestions = allModules.flatMap(m => m.exercises);
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  const b2 = getMetB2MultipleChoice('grammar');
  return [...grammarMCQs, ...drillQuestions, ...b2];
}

export async function getVocabExercises(topicId) {
  const { vocabTopics } = await getFullData();
  if (topicId === 'vocab_full_bank') {
    const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
    const extras = await import('../data/exercises/vocabulary/b2-vocab-50-more.json', { with: { type: 'json' } }).then(m => (m.default?.modules || []).flatMap(mod => mod.items || []).map(normalizeBankMCQ));
    return [...vocabTopics.flatMap(t => t.exercises.filter(e => e.type === 'mcq' || e.type === 'blank')), ...getMetB2MultipleChoice('vocabulary'), ...extras];
  }
  const topic = vocabTopics.find(t => t.id === topicId);
  if (!topic) return [];
  const base = topic.exercises.filter(e => e.type === 'mcq' || e.type === 'blank');
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  const b2All = getMetB2MultipleChoice('vocabulary');
  // B2 vocab is not topic-specific — mix in as general practice
  const extras = topicId === 'general'
    ? await import('../data/exercises/vocabulary/b2-vocab-50-more.json', { with: { type: 'json' } }).then(m => (m.default?.modules || []).flatMap(mod => mod.items || []).map(normalizeBankMCQ))
    : [];
  return [...base, ...b2All, ...extras];
}

export async function getSpeakingExercises(topicId) {
  if (topicId === 'describe_image') {
    const { default: imageDescriptionExercises } = await import('../data/exercises/speaking/image-description.js');
    return imageDescriptionExercises;
  }
  const { vocabTopics } = await getFullData();
  if (topicId === 'speaking_full_bank') topicId = 'general';
  const topic = vocabTopics.find(t => t.id === topicId);
  if (!topic) return [];
  const base = topicId === 'general'
    ? vocabTopics.flatMap(t => t.exercises.filter(e => e.type === 'speak' || e.type === 'short'))
    : topic.exercises.filter(e => e.type === 'speak' || e.type === 'short');
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  const b2 = getMetB2MultipleChoice('speaking');
  const { default: extended } = await import('../data/exercises/speaking/b2-speaking-50-more.json', { with: { type: 'json' } });
  const more = (extended?.modules || []).flatMap(mod => mod.exercises || []).map(ex => ({ ...ex, type: 'speak' }));
  return [...base, ...b2, ...more];
}

export async function getWritingExercises(topicId) {
  const { vocabTopics } = await getFullData();
  if (topicId === 'writing_full_bank') topicId = 'general';
  const topic = vocabTopics.find(t => t.id === topicId);
  if (!topic) return [];
  const base = topicId === 'general'
    ? vocabTopics.flatMap(t => t.exercises.filter(e => e.type === 'short'))
    : topic.exercises.filter(e => e.type === 'short');
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  const b2 = getMetB2MultipleChoice('writing');
  const { default: extended } = await import('../data/exercises/writing/b2-writing-50-more.json', { with: { type: 'json' } });
  const more = (extended?.modules || []).flatMap(mod => mod.exercises || []);
  return [...base, ...b2, ...more];
}

export async function getReadingExercises(topicId) {
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  const all = getMetB2MultipleChoice('reading');
  const extended = await loadExtendedReadingExercises();
  if (!topicId || topicId === 'reading_full_bank') return [...all, ...extended];
  const studyIds = new Set(['b2_mcq_reading_01','b2_mcq_reading_02','b2_mcq_reading_03','b2_mcq_reading_07','b2_mcq_reading_08']);
  const onlineIds = new Set(['b2_mcq_reading_04','b2_mcq_reading_05','b2_mcq_reading_06','b2_mcq_reading_09','b2_mcq_reading_10']);
  if (topicId === 'study_abroad') return [...all.filter(e => studyIds.has(e.id)), ...extended];
  if (topicId === 'online_learning') return [...all.filter(e => onlineIds.has(e.id)), ...extended];
  return [...all, ...extended];
}

function normalizeBankMCQ(item) {
  const options = Array.isArray(item.options) ? item.options : Object.entries(item.options || {}).sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value);
  const correct = typeof item.correct === 'number' ? item.correct : typeof item.correctAnswer === 'string'
    ? Math.max(0, options.findIndex(option => option === item.correctAnswer || option.startsWith(item.correctAnswer)))
    : typeof item.answer === 'number' ? item.answer : 0;
  return {
    ...item,
    id: `bank_${item.id}`,
    type: 'mcq',
    question: item.question || item.stem || item.prompt || '',
    options: options.map(option => typeof option === 'string' ? option : option.text || option.label || String(option)),
    correct,
  };
}

let extendedReadingPromise = null;
async function loadExtendedReadingExercises() {
  if (!extendedReadingPromise) {
    extendedReadingPromise = Promise.all([
      import('../data/exercises/reading/b2-reading.json', { with: { type: 'json' } }),
      import('../data/exercises/reading/b2-reading-50-more.json', { with: { type: 'json' } }),
      import('../data/exercises/reading/reading-23-trees-77.json', { with: { type: 'json' } }),
      import('../data/exercises/reading/reading-23-met-subjects-77.json', { with: { type: 'json' } }),
    ]).then(modules => modules.flatMap(({ default: data }) => (data.modules || []).flatMap(mod => mod.items || mod.passages || []).flatMap(item => (item.questions || []).map((question, index) => ({
      id: `reading_bank_${item.id || 'passage'}_${index + 1}`,
      type: 'read',
      passage: item.passage || '',
      source: item.source,
      questions: [{
        ...question,
        id: question.id || `${item.id || 'reading'}_q${index + 1}`,
        question: question.question || question.stem || question.prompt || '',
        options: (question.options || []).map(option => typeof option === 'string' ? option : option.text || option.label || String(option)),
      }],
    })))));
  }
  return extendedReadingPromise;
}

export async function getListeningExercises(audioId) {
  const { vocabTopics } = await getFullData();
  const { LISTENING } = await import('./met-b2-exercises.js');
  const supplementary = await getSupplementaryListening();
  const met26 = await getMet26Conversations();
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  const b2Listening = getMetB2MultipleChoice('listening');
  
  const allListening = [
    ...vocabTopics.flatMap(t => t.exercises.filter(e => e.type === 'listen' || e.type === 'embed')),
    ...LISTENING,
    ...supplementary,
    ...met26,
    ...b2Listening
  ];

  return allListening
    .filter(e => (e.audioSrc || e.url || `embed-${e.id}`) === audioId)
    .map(e => ({ ...e, listeningFormat: e.listeningFormat || inferListeningFormat(e.question) }));
}

function inferListeningFormat(question = '') {
  const q = question.toLowerCase();
  if (/attitude|feel|sound/.test(q)) return 'attitude';
  if (/what will .* next|probably do next|likely happen/.test(q)) return 'next_action';
  if (/what does .* mean|can be inferred|most likely/.test(q)) return 'inference';
  if (/what does .* ask|what does .* want|what does .* say/.test(q)) return 'speaker_intention';
  if (/main (topic|point|goal|purpose)|mainly/.test(q)) return 'summary';
  return 'multiple_choice';
}

export async function getMetB2MultipleChoiceExercises(sectionId) {
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  return getMetB2MultipleChoice(sectionId);
}
