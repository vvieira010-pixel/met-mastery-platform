import supplementaryListeningData from '../../met_listening_section_76_100.json' with { type: 'json' };
import met26ConversationsData from '../../met_26_conversations.json' with { type: 'json' };
import practiceStudioListeningData from '../data/exercises/listening/practice-studio-listening.json' with { type: 'json' };
import practiceStudioSpeakingData from '../data/exercises/speaking/practice-studio-speaking.json' with { type: 'json' };
import b2VocabMoreData from '../data/exercises/vocabulary/b2-vocab-50-more.json' with { type: 'json' };
import b2SpeakingMoreData from '../data/exercises/speaking/b2-speaking-50-more.json' with { type: 'json' };
import b2WritingMoreData from '../data/exercises/writing/b2-writing-50-more.json' with { type: 'json' };
import b2ReadingData from '../data/exercises/reading/b2-reading.json' with { type: 'json' };
import b2ReadingMoreData from '../data/exercises/reading/b2-reading-50-more.json' with { type: 'json' };
import readingTreesData from '../data/exercises/reading/reading-23-trees-77.json' with { type: 'json' };
import readingSubjectsData from '../data/exercises/reading/reading-23-met-subjects-77.json' with { type: 'json' };

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
      { id: 'reading_full_bank', title: 'Complete Reading Collection (102 Questions)', subtitle: '51 passages · 102 questions' },
      { id: 'work_career', title: 'Workplace Communication & Professional Life', subtitle: 'Workplace, business, professional life' },
      { id: 'nature_science', title: 'The Natural World & Scientific Discovery', subtitle: 'Animals, environment, biology' },
      { id: 'history_culture', title: 'History, Art & Cultural Heritage', subtitle: 'Art, civilisations, traditions' },
      { id: 'technology', title: 'Modern Technology & Digital Innovation', subtitle: 'Cars, energy, innovation' },
      { id: 'health_brain', title: 'Health, Wellbeing & Cognitive Science', subtitle: 'Sleep, learning, cognition' },
      { id: 'geography', title: 'Geography, Travel & World Cultures', subtitle: 'Places, planets, exploration' },
    ];
  }
  if (mode === 'speaking') {
    return [
      { id: 'describe_image', title: 'Describe the Image' },
      { id: 'speaking_full_bank', title: 'Speaking Practice' },
      { id: 'work_career', title: 'Professional Life & Employment' },
      { id: 'healthcare', title: 'Healthcare Communication & Patient Care' },
      { id: 'education', title: 'Education, Teaching & Learning' },
      { id: 'technology', title: 'Digital Technology & Modern Life' },
      { id: 'environment', title: 'Environmental Issues & Sustainability' },
      { id: 'community', title: 'Community Services & Public Life' },
      { id: 'travel_culture', title: 'Travel, Culture & Living Abroad' },
      { id: 'money_consumer', title: 'Consumer Life, Money & Advertising' },
      { id: 'family_relationships', title: 'Family, Relationships & Social Interaction' },
      { id: 'media_news', title: 'Media, News & Digital Communication' },
    ];
  }
  if (mode === 'grammar') {
    return [
      { id: 'gm_common_mistakes', title: 'Common Errors & Collocations', subtitle: '9 error types: collocation, articles, prepositions' },
      { id: 'gm_conditionals', title: 'Conditional Sentences (If-Clauses)', subtitle: 'If-clauses: real, hypothetical, past unreal' },
      { id: 'gm_passive', title: 'Passive Voice & Reporting', subtitle: 'be + past participle, reporting verbs' },
      { id: 'gm_modals', title: 'Modal Verbs for Deduction & Advice', subtitle: 'can, must, should have — deduction & advice' },
      { id: 'gm_inversion', title: 'Inversion After Negative Adverbs', subtitle: 'Never, Seldom → auxiliary + subject' },
      { id: 'gm_relatives', title: 'Relative Clauses (Defining & Non-Defining)', subtitle: 'who, which, whose — defining vs extra' },
      { id: 'gm_articles', title: 'Articles (a/an, the, Zero Article)', subtitle: 'a/an, the, zero — first mention vs specific' },
      { id: 'gm_pronouns', title: 'Pronoun Reference & Agreement', subtitle: 'I/me, they/them, mine/yours after prepositions' },
      { id: 'gm_comparatives', title: 'Comparative & Superlative Forms', subtitle: 'more/most, better/best — than others' },
      { id: 'gm_phrasal', title: 'Phrasal Verbs in Context', subtitle: 'catch up with, keep posted on, figure out' },
      { id: 'gm_agreement', title: 'Subject-Verb Agreement & Concord', subtitle: 'Everyone is, neither is — singular' },
      { id: 'gm_reported', title: 'Reported Speech & Indirect Questions', subtitle: 'will → would, ask + not to' },
      { id: 'gm_gerunds', title: 'Gerunds & Infinitives After Verbs', subtitle: 'interested in studying vs decide to pursue' },
      { id: 'gm_quantifiers', title: 'Quantifiers & Determiners', subtitle: 'another, a lot of, little vs few' },
      { id: 'gm_connectors', title: 'Linking Words & Connectors', subtitle: 'On the contrary, Despite, Nevertheless' },
      { id: 'gm_demonstratives', title: 'Demonstrative Pronouns & Determiners', subtitle: 'this/these near, that/those far' },
      { id: 'gm_adverbs', title: 'Adverbs of Degree & Position', subtitle: 'almost, yet, still — position matters' },
      { id: 'gm_infinitives', title: 'Infinitive of Purpose & Result', subtitle: 'to study, capable of achieving' },
      { id: 'gm_somewhere', title: 'Somewhere, Anywhere, Nowhere', subtitle: 'somewhere else vs anywhere' },
      { id: 'gm_order_fix', title: 'Sentence Reordering & Error Correction', subtitle: 'Reorder + fix the mistake' },
      { id: 'gm_grammar_50_more', title: 'Mixed Grammar Practice (48 Questions)', subtitle: 'Mixed 14 topics, B1/B2/B2+' },
      { id: 'gm_full_bank', title: 'Complete Grammar Collection (218 Questions)', subtitle: 'All 218 Q — 22 topics' },
    ];
  }
  if (mode === 'writing' || mode === 'vocab') {
    return [
      { id: `${mode}_full_bank`, title: mode === 'writing' ? 'Complete Writing Collection (138 Tasks)' : 'Complete Vocabulary Collection (128 Tasks)' },
      { id: 'work_career', title: 'Professional Life & Employment' },
      { id: 'healthcare', title: 'Healthcare Communication & Patient Care' },
      { id: 'education', title: 'Education, Teaching & Learning' },
      { id: 'technology', title: 'Digital Technology & Modern Life' },
      { id: 'environment', title: 'Environmental Issues & Sustainability' },
      { id: 'community', title: 'Community Services & Public Life' },
      { id: 'travel_culture', title: 'Travel, Culture & Living Abroad' },
      { id: 'money_consumer', title: 'Consumer Life, Money & Advertising' },
      { id: 'family_relationships', title: 'Family, Relationships & Social Interaction' },
      { id: 'media_news', title: 'Media, News & Digital Communication' },
      { id: 'general', title: 'General & Academic Vocabulary' },
    ];
  }
  if (mode === 'listening') {
    return []; // Handled asynchronously in PracticeSession or via a new helper
  }
  return [
    { id: 'work_career', title: 'Professional Life & Employment' },
    { id: 'healthcare', title: 'Healthcare Communication & Patient Care' },
    { id: 'education', title: 'Education, Teaching & Learning' },
    { id: 'technology', title: 'Digital Technology & Modern Life' },
    { id: 'environment', title: 'Environmental Issues & Sustainability' },
    { id: 'community', title: 'Community Services & Public Life' },
    { id: 'travel_culture', title: 'Travel, Culture & Living Abroad' },
    { id: 'money_consumer', title: 'Consumer Life, Money & Advertising' },
    { id: 'family_relationships', title: 'Family, Relationships & Social Interaction' },
    { id: 'media_news', title: 'Media, News & Digital Communication' },
    { id: 'general', title: 'General & Academic Vocabulary' },
  ];
}

let supplementaryListeningPromise = null;
async function getSupplementaryListening() {
  if (!supplementaryListeningPromise) {
    supplementaryListeningPromise = Promise.resolve(
      supplementaryListeningData.exercises || [],
    );
  }
  return supplementaryListeningPromise;
}

let practiceStudioListeningPromise = null;
async function getPracticeStudioListening() {
  if (!practiceStudioListeningPromise) {
    practiceStudioListeningPromise = Promise.resolve(
      practiceStudioListeningData.exercises || [],
    );
  }
  return practiceStudioListeningPromise;
}

// Practice Studio Listening Lab: ONLY the 60 Practice Studio audios —
// the 35-clip studio bank (conversations 01-07, L15-L22, 1-minute 01-20)
// plus the 25-clip supplementary pack (76-100).
const LISTENING_TITLE_OVERRIDES = {
  'Conversation 01': 'Academic Discussion — Missing a Lecture',
  'Conversation 02': 'Workplace Dialogue — Checking a Report',
  'Conversation 03': 'Everyday Banking — Withdrawing Cash',
  'Conversation 04': 'Study Time — Finishing a Chapter',
  'Conversation 05': 'Daily Life — Finding Lost Sunglasses',
  'Conversation 06': 'University Life — Choosing Electives',
  'Conversation 07': 'Work Meeting — Project Update',
  'L15 · Museum Closure': 'Museum Closure — Visitor Information',
  'L16 · Safety Procedures': 'Workplace Safety — Emergency Protocols',
  'L17 · Bird Sleep': 'Science Report — How Birds Sleep',
  'L18 · Stress Immune': 'Health Talk — Stress and the Immune System',
  'L19 · Printing Press': 'History Lecture — The Printing Press',
  'L20 · Cooking Class': 'Community Notice — Cooking Class Schedule',
  'L21 · Online Ordering': 'Consumer Advice — Online Order Problems',
  'L22 · Urban Gardens': 'City Report — Urban Garden Programme',
  '1-Minute 01 · Gym Membership Freeze': 'Quick Response — Gym Membership Freeze',
  '1-Minute 02 · Dentist Reschedule': 'Quick Response — Dentist Appointment Change',
  '1-Minute 03 · Library Late Hours': 'Quick Response — Library Extended Hours',
  '1-Minute 04 · Job Interview Arrival': 'Quick Response — Job Interview Directions',
  '1-Minute 05 · Car Rental Return': 'Quick Response — Car Rental Return Process',
  '1-Minute 06 · Pharmacy Pickup': 'Quick Response — Pharmacy Prescription Pickup',
  '1-Minute 07 · Airport Gate Change': 'Quick Response — Airport Gate Announcement',
  '1-Minute 08 · IT Help Desk': 'Quick Response — IT Help Desk Request',
  '1-Minute 09 · Farmers Market Stall': 'Quick Response — Farmers Market Inquiry',
  '1-Minute 10 · Volunteer Cleanup': 'Quick Response — Volunteer Cleanup Event',
  '1-Minute 11 · Coffee Shop Interview': 'Quick Response — Coffee Shop Chat',
  '1-Minute 12 · Train Platform Announcement': 'Quick Response — Train Platform Update',
  '1-Minute 13 · Doctor\'s Office Check-In': 'Quick Response — Doctor\'s Office Check-In',
  '1-Minute 14 · Apartment Noise Complaint': 'Quick Response — Noise Complaint',
  '1-Minute 15 · Museum Tour Start': 'Quick Response — Museum Tour Information',
  '1-Minute 16 · Online Order Problem': 'Quick Response — Online Order Issue',
  '1-Minute 17 · Cooking Class Sign-Up': 'Quick Response — Cooking Class Registration',
  '1-Minute 18 · Weather Travel Advice': 'Quick Response — Weather Travel Warning',
  '1-Minute 19 · Printer Handouts Meeting': 'Quick Response — Printer and Handouts',
  '1-Minute 20 · Walking Podcast Plan': 'Quick Response — Podcast Recording Plan',
  'Bonus 1 · Adapting to Online Learning': 'Extended Listening — Adapting to Online Learning',
  'Bonus 2 · Public Parks Opinion': 'Extended Listening — Public Parks Opinion',
  'Bonus 3 · Working From Home': 'Extended Listening — Working From Home',
  '76 · A Room Change': 'Accommodation — Requesting a Room Change',
  '77 · A Travel Suggestion': 'Travel — Making a Suggestion',
  '78 · A Library Book Renewal': 'Library — Renewing a Book',
  '79 · A Restaurant Review': 'Dining — Restaurant Review',
  '80 · A Workplace Reminder': 'Professional — Workplace Reminder',
  '81 · A Course Deadline': 'Academic — Course Deadline',
  '82 · A Neighborhood Notice': 'Community — Neighbourhood Notice',
  '83 · A Package Collection': 'Delivery — Package Collection',
  '84 · A Team Update': 'Professional — Team Project Update',
  '85 · A Health Workshop': 'Health — Workshop Information',
  '86 · A Weather-Related Delay': 'Travel — Weather Delay',
  '87 · A Volunteer Task': 'Community — Volunteer Assignment',
  '88 · A Project Update': 'Professional — Project Progress',
  '89 · A Cautious Forecast': 'News — Cautious Weather Forecast',
  '90 · An Implied Objection': 'Speaking — Handling an Implied Objection',
  '91 · A Source Comparison': 'Academic — Comparing Sources',
  '92 · A Revised Recommendation': 'Professional — Revised Recommendation',
  '93 · A Policy Condition': 'Workplace — Policy Condition',
  '94 · A Nuanced Evaluation': 'Academic — Nuanced Evaluation',
  '95 · An Academic Qualification': 'Academic — Qualification Discussion',
  '96 · A Corrected Figure': 'Professional — Correcting Data',
  '97 · A Strategic Trade-Off': 'Business — Strategic Trade-Off',
  '98 · A Meeting Summary': 'Professional — Meeting Summary',
  '99 · A Public Response': 'Public — Official Response',
  '100 · Integrated Listening Review': 'Review — Integrated Listening Practice',
};

const LISTENING_PARTS = [
  { id: 'listening_part_1', title: 'Part 1 — Short conversations', subtitle: 'MET-style practice: listen for the key detail in a short exchange.' },
  { id: 'listening_part_2', title: 'Part 2 — Longer conversations', subtitle: 'MET-style practice: follow a fuller conversation and its important details.' },
  { id: 'listening_part_3', title: 'Part 3 — Talks and announcements', subtitle: 'MET-style practice: follow one speaker’s main idea, details, and purpose.' },
];

const PART_1_AUDIO_FILES = new Set([
  'conversation_01.wav', 'conversation_02.wav', 'conversation_03.wav', 'conversation_04.wav',
  'conversation_05.wav', 'conversation_06.wav', 'conversation_07.wav',
]);

const PART_2_AUDIO_FILES = new Set([
  'listening-1min-01-gym-freeze.mp3', 'listening-1min-02-dentist-reschedule.mp3',
  'listening-1min-04-job-interview.mp3', 'listening-1min-05-car-rental.mp3',
  'listening-1min-06-pharmacy-pickup.mp3', 'listening-1min-08-it-helpdesk.mp3',
  'listening-1min-09-farmers-market.mp3', 'listening-1min-11-cafe-interview.mp3',
  'listening-1min-13-doctors-checkin.mp3', 'listening-1min-14-noise-complaint.mp3',
  'listening-1min-16-online-order.mp3', 'listening-1min-17-cooking-class.mp3',
  'listening-1min-19-printer-handouts.mp3', 'listening-1min-20-walking-podcast.mp3',
  'listening-90-implied-objection.mp3',
]);

const LISTENING_TOPIC_RULES = [
  { id: 'health', title: 'Health and wellbeing', match: /health|doctor|dentist|pharmacy|gym|stress|sleep/i },
  { id: 'education', title: 'Education and learning', match: /lecture|university|library|course|class|academic|school|student|printing press/i },
  { id: 'work', title: 'Work and professional life', match: /work|office|job|employee|team|printer|project|policy|meeting|professional|strategic|qualification|report|sales|interview/i },
  { id: 'travel', title: 'Travel and transport', match: /travel|airport|train|car rental|walking|weather|room change|bicycle|bike/i },
  { id: 'community', title: 'Community and daily life', match: /community|volunteer|neighbou?r|parks|public|urban garden|museum|cooking|restaurant|farmers|food|consumer|package|apartment|lunch|sunglasses|bank|online order/i },
  { id: 'science', title: 'Science, culture, and society', match: /science|bird|environment|source comparison|forecast|history|opinion|review|evaluation|figure/i },
];

function getAudioFile(audioId = '') {
  return String(audioId).split('/').pop() || '';
}

function getListeningPartId(audioId) {
  const file = getAudioFile(audioId);
  if (PART_1_AUDIO_FILES.has(file)) return 'listening_part_1';
  if (PART_2_AUDIO_FILES.has(file)) return 'listening_part_2';
  return 'listening_part_3';
}

function getListeningTopic(title = '') {
  return LISTENING_TOPIC_RULES.find(topic => topic.match.test(title))
    || { id: 'general', title: 'General communication' };
}

function getListeningGroupTitle(exercise) {
  const raw = exercise.audioTitle || exercise.title || 'Listening practice';
  return LISTENING_TITLE_OVERRIDES[raw] || raw;
}

function withListeningMetadata(exercise) {
  const audioId = exercise.audioSrc || exercise.url || `embed-${exercise.id}`;
  const partId = getListeningPartId(audioId);
  const topic = getListeningTopic(getListeningGroupTitle(exercise));
  return {
    ...exercise,
    listeningFormat: exercise.listeningFormat || 'multiple_choice',
    listeningPart: partId,
    listeningTopic: topic.id,
    listeningTopicTitle: topic.title,
  };
}

async function getAllPracticeStudioListeningExercises() {
  const own = await getPracticeStudioListening();
  const supplementary = await getSupplementaryListening();
  return [...own, ...supplementary].map(withListeningMetadata);
}

export async function getPracticeStudioListeningGroups() {
  const exercises = await getAllPracticeStudioListeningExercises();
  const groups = new Map();
  exercises.forEach(ex => {
    const audioId = ex.audioSrc || `embed-${ex.id}`;
    if (!audioId) return;
    groups.set(audioId, getListeningGroupTitle(ex));
  });
  return Array.from(groups.entries()).map(([id, title]) => ({ id, title }));
}

export async function getPracticeStudioListeningParts() {
  const exercises = await getAllPracticeStudioListeningExercises();
  const groupIds = new Set(exercises.map(exercise => exercise.audioSrc || exercise.url || `embed-${exercise.id}`));
  return LISTENING_PARTS.map(part => ({
    ...part,
    clipCount: new Set(
      exercises
        .filter(exercise => exercise.listeningPart === part.id)
        .map(exercise => exercise.audioSrc || exercise.url || `embed-${exercise.id}`),
    ).size,
  })).filter(part => groupIds.size > 0 && part.clipCount > 0);
}

export async function getPracticeStudioListeningTopics(partId) {
  const exercises = await getAllPracticeStudioListeningExercises();
  const topics = new Map();

  exercises
    .filter(exercise => exercise.listeningPart === partId)
    .forEach(exercise => {
      const id = `${partId}::${exercise.listeningTopic}`;
      const current = topics.get(id) || {
        id,
        title: exercise.listeningTopicTitle,
        clipIds: new Set(),
      };
      current.clipIds.add(exercise.audioSrc || exercise.url || `embed-${exercise.id}`);
      topics.set(id, current);
    });

  return Array.from(topics.values())
    .map(({ id, title, clipIds }) => ({ id, title, subtitle: `${clipIds.size} clip${clipIds.size === 1 ? '' : 's'}` }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPracticeStudioListeningExercises(selectionId) {
  const exercises = await getAllPracticeStudioListeningExercises();
  const [partId, topicId] = String(selectionId || '').split('::');

  if (topicId) {
    return exercises.filter(exercise => exercise.listeningPart === partId && exercise.listeningTopic === topicId);
  }

  return exercises.filter(exercise => (exercise.audioSrc || exercise.url || `embed-${exercise.id}`) === selectionId);
}

let met26Promise = null;
async function getMet26Conversations() {
  if (!met26Promise) {
    met26Promise = Promise.resolve(met26ConversationsData.exercises || []);
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

let practiceSpeakingPromise = null;
async function getPracticeStudioSpeaking() {
  if (!practiceSpeakingPromise) {
    practiceSpeakingPromise = Promise.resolve(
      practiceStudioSpeakingData.exercises || [],
    );
  }
  return practiceSpeakingPromise;
}

// Practice Studio speaking topics (prepended to the standard topic list).
export function getPracticeStudioSpeakingTopics() {
  return [
    { id: 'spk_audio_prompts', title: 'Listen and Speak', subtitle: 'Listen · prepare · speak' },
    { id: 'spk_quiz', title: 'Speak and Compare', subtitle: 'Record · compare with a sample answer' },
  ];
}

// Serves Practice Studio topics from the speaking bank; anything else falls through
// to the standard speaking bank so existing content keeps working.
export async function getPracticeStudioSpeakingExercises(topicId) {
  const pack = await getPracticeStudioSpeaking();
  const mine = pack.filter(e => e.topic === topicId);
  if (mine.length || topicId === 'spk_audio_prompts' || topicId === 'spk_quiz') return mine;
  return getSpeakingExercises(topicId);
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
    const extras = (b2VocabMoreData.modules || []).flatMap(mod => mod.items || []).map(normalizeBankMCQ);
    return [...vocabTopics.flatMap(t => t.exercises.filter(e => e.type === 'mcq' || e.type === 'blank')), ...getMetB2MultipleChoice('vocabulary'), ...extras];
  }
  const topic = vocabTopics.find(t => t.id === topicId);
  if (!topic) return [];
  const base = topic.exercises.filter(e => e.type === 'mcq' || e.type === 'blank');
  const { getMetB2MultipleChoice } = await import('./met-b2-multiple-choice-data.js');
  const b2All = getMetB2MultipleChoice('vocabulary');
  // B2 vocab is not topic-specific — mix in as general practice
  const extras = topicId === 'general'
    ? (b2VocabMoreData.modules || []).flatMap(mod => mod.items || []).map(normalizeBankMCQ)
    : [];
  return [...base, ...b2All, ...extras];
}

export async function getSpeakingExercises(topicId) {
  if (topicId === 'describe_image') {
    const { default: imageDescriptionExercises } = await import('../data/exercises/speaking/image-description.js');
    return imageDescriptionExercises;
  }
  const { vocabTopics } = await getFullData();
  const isFullBank = topicId === 'speaking_full_bank';
  const topic = vocabTopics.find(t => t.id === topicId);
  if (!isFullBank && !topic) return [];

  // Speaking Mirror must contain prompts that can actually be recorded. The
  // shared vocabulary bank also includes `short` writing tasks and speaking
  // strategy MCQs; those belong in Writing/strategy practice, not here.
  const base = isFullBank
    ? vocabTopics.flatMap(t => t.exercises.filter(e => e.type === 'speak'))
    : topic.exercises.filter(e => e.type === 'speak');

  const more = (b2SpeakingMoreData.modules || [])
    .flatMap(mod => mod.exercises || [])
    .map(exercise => {
      const destination = classifyAdditionalSpeakingTopic(exercise.topic);
      return { ...exercise, type: 'speak', sourceTopic: exercise.topic, topic: destination };
    })
    .filter(exercise => isFullBank || exercise.topic === topicId);

  return [...base, ...more];
}

function classifyAdditionalSpeakingTopic(topic) {
  const destinations = {
    'Farmers Market': 'money_consumer',
    'Birthday Party': 'family_relationships',
    Dentist: 'healthcare',
    Camping: 'travel_culture',
    Gardening: 'environment',
    Zoo: 'environment',
    'Barber Shop': 'money_consumer',
    'Board Games': 'family_relationships',
    'Street Food': 'travel_culture',
    Wedding: 'family_relationships',
  };
  return destinations[topic] || 'community';
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
  const more = (b2WritingMoreData.modules || []).flatMap(mod => mod.exercises || []);
  return [...base, ...b2, ...more];
}

export async function getReadingExercises(topicId) {
  const extended = await loadExtendedReadingExercises();
  if (!topicId || topicId === 'reading_full_bank') return extended;
  return extended.filter(e => e.topic === topicId);
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
    extendedReadingPromise = Promise.resolve([
      b2ReadingData,
      b2ReadingMoreData,
      readingTreesData,
      readingSubjectsData,
    ]).then(modules => {
      const exercises = [];
      for (const data of modules) {
        const source = data.modules || [];
        for (const mod of source) {
          for (const item of (mod.items || [])) {
            const questions = (item.questions || []).map((q, i) => ({
              ...q,
              id: q.id || `${item.id}_q${i + 1}`,
              question: q.question || q.stem || q.prompt || '',
              options: (q.options || []).map(o => typeof o === 'string' ? o : o.text || o.label || String(o)),
              correct: typeof q.correct === 'number' ? q.correct :
                typeof q.correctAnswer === 'string' ? 'ABCD'.indexOf(q.correctAnswer) :
                typeof q.correct === 'string' ? 'ABCD'.indexOf(q.correct) : 0,
            }));
            if (questions.length === 0) continue;
            exercises.push({
              id: `reading_bank_${item.id}`,
              type: 'read',
              passage: item.passage || '',
              source: item.source || '',
              questions,
              topic: classifyReadingTopic(item.id, item.passage || '', item.source || ''),
            });
          }
        }
        const passages = data.passages || [];
        for (const p of passages) {
          const questions = (p.questions || []).map((q, i) => ({
            ...q,
            id: q.id || `pass_${p.passageId || p.id || 'x'}_q${i + 1}`,
            question: q.question || q.stem || q.prompt || '',
            options: Array.isArray(q.options)
              ? q.options.map(o => typeof o === 'string' ? o : o.text || o.label || String(o))
              : Object.values(q.options || {}).map(o => typeof o === 'string' ? o : o.text || o.label || String(o)),
            correct: typeof q.correct === 'number' ? q.correct :
              typeof q.correct === 'string' ? 'ABCD'.indexOf(q.correct) :
              typeof q.correctAnswer === 'string' ? 'ABCD'.indexOf(q.correctAnswer) : 0,
          }));
          if (questions.length === 0) continue;
          exercises.push({
            id: `reading_ext_${data.id || 'bank'}_${p.passageId || p.id || exercises.length}`,
            type: 'read',
            passage: p.text || p.passage
              || (p.sections ? Object.entries(p.sections).map(([k, v]) => `Section ${k}\n\n${v}`).join('\n\n') : '')
              || '',
            source: p.intro || p.topic || '',
            questions,
            topic: classifyReadingTopic(p.topic || p.intro || '', p.text || '', ''),
          });
        }
      }
      return exercises;
    });
  }
  return extendedReadingPromise;
}

function classifyReadingTopic(id, passage, source) {
  const text = `${id} ${passage} ${source}`.toLowerCase();
  if (/work|career|employ|job|office|workplace|business|manager|salary|professional/.test(text)) return 'work_career';
  if (/honeybee|animal|migrat|tree|forest|sequoia|mangrove|seed|nature|ecolog|environment|biodivers|species|plant|ocean|coral|reef|barrier/.test(text)) return 'nature_science';
  if (/mona lisa|pompeii|photography|history|culture|art|museum|olympic|silk road|chocolate|printing press|world.?s fair|music|archaeolog|ancient|century|tradition/.test(text)) return 'history_culture';
  if (/electric car|renewable|solar|energy|technolog|robot|artificial|digital|computer|internet|innovat|engineer/.test(text)) return 'technology';
  if (/sleep|brain|health|learn|cognit|mental|stress|memory|medic|well.?being|left.?handed|neurosc/.test(text)) return 'health_brain';
  if (/dead sea|jupiter|planet|geography|explor|travel|country|continent|satellite|space|astronom|world/.test(text)) return 'geography';
  return 'nature_science';
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
