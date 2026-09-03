import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('Practice Studio');
const currentRoot = path.join(root, 'current', 'by-topic');
const incomingRoot = path.join(root, 'incoming');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const textOf = (item) => JSON.stringify(item).toLowerCase();
const has = (text, words) => words.some((word) => text.includes(word));

function classify(skill, item) {
  const text = textOf(item);
  if (skill === 'listening') {
    if (has(text, ['urban', 'housing', 'apartment', 'city planning', 'community green'])) return 'urban-planning';
    if (has(text, ['course', 'class', 'student', 'professor', 'university', 'campus', 'assignment', 'lecture', 'academic', 'school', 'book'])) return 'education';
    if (has(text, ['doctor', 'patient', 'hospital', 'nurse', 'medication', 'health', 'clinic'])) return 'healthcare';
    if (has(text, ['museum', 'exhibit', 'pottery', 'printing press', 'history', 'concert', 'presentation'])) return 'culture';
    if (has(text, ['researcher', 'research', 'scientist', 'study', 'figures', 'responses were analyzed', 'pilot'])) return 'science-and-research';
    if (has(text, ['plant', 'plants', 'urban garden', 'environment', 'water service'])) return 'environment';
    if (has(text, ['train', 'ferry', 'route', 'hill trail', 'passenger', 'travel', 'airport', 'rent'])) return 'travel-and-transport';
    if (has(text, ['work from home', 'employees', 'manager', 'workshop', 'project', 'design team', 'deadline', 'organizers', 'remote work'])) return 'work-and-career';
    if (has(text, ['cafe', 'barista', 'latte', 'restaurant', 'food', 'drinks'])) return 'food-and-dining';
    if (has(text, ['volunteer', 'community', 'neighborhood', 'residents'])) return 'community';
    if (has(text, ['system', 'online', 'technology', 'software'])) return 'technology';
    return 'general-academic';
  }
  if (skill === 'reading') {
    if (has(text, ['online learning', 'online education', 'education', 'students', 'study'])) return 'education';
    if (has(text, ['exchange', 'abroad', 'international', 'tourists', 'travel'])) return 'travel-and-culture';
    return 'general-reading';
  }
  if (skill === 'speaking') {
    if (has(text, ['job', 'career', 'work'])) return 'work-and-career';
    if (has(text, ['medical', 'health', 'doctor', 'hospital'])) return 'healthcare';
    if (has(text, ['school', 'subject', 'education'])) return 'education';
    if (has(text, ['technology', 'communicate'])) return 'technology';
    if (has(text, ['environment', 'protect'])) return 'environment';
    if (has(text, ['community event'])) return 'community';
    if (has(text, ['purchasing', 'buying'])) return 'shopping-and-finance';
    if (has(text, ['family'])) return 'family';
    if (has(text, ['news', 'source'])) return 'media-and-news';
    if (has(text, ['place', 'visited'])) return 'travel-and-culture';
    return 'general-speaking';
  }
  if (skill === 'writing') {
    if (has(text, ['team', 'working from home', 'work'])) return 'work-and-career';
    if (has(text, ['decision', 'money', 'need and a want'])) return 'life-and-finance';
    if (has(text, ['tourists', 'travel', 'cultures'])) return 'travel-and-culture';
    if (has(text, ['exercise', 'mental health', 'health'])) return 'healthcare';
    if (has(text, ['foreign language', 'study method', 'learn'])) return 'education';
    if (has(text, ['social media', 'online news', 'checking facts'])) return 'media-and-technology';
    if (has(text, ['biodiversity', 'environment'])) return 'environment';
    if (has(text, ['local community', 'conflicts in relationships'])) return 'community-and-relationships';
    if (has(text, ['sentence order'])) return 'grammar-practice';
    if (has(text, ['city'])) return 'cities-and-tourism';
    return 'general-writing';
  }
  if (skill === 'vocabulary') {
    if (has(text, ['remote work', 'position', 'manager', 'meeting', 'company', 'employees', 'job', 'organization', 'project', 'report', 'office', 'career', 'contract', 'committee'])) return 'work-and-career';
    if (has(text, ['patient', 'doctor', 'nurse', 'medication', 'disease', 'diet', 'healthy'])) return 'healthcare';
    if (has(text, ['professor', 'students', 'teacher', 'assignment', 'lesson', 'class'])) return 'education';
    if (has(text, ['technology', 'device', 'password', 'online', 'data'])) return 'technology';
    if (has(text, ['tree', 'energy', 'recycling', 'waste', 'air pollution', 'environmental'])) return 'environment';
    if (has(text, ['travel', 'passport', 'tour', 'airport'])) return 'travel-and-culture';
    if (has(text, ['budget', 'prices', 'money', 'afford', 'financial'])) return 'finance';
    if (has(text, ['family', 'cousins', 'traditions'])) return 'family';
    if (has(text, ['news', 'article', 'journalist', 'media', 'facts'])) return 'media-and-news';
    if (has(text, ['neighbors', 'community', 'volunteers'])) return 'community';
    return 'general-vocabulary';
  }
  if (skill === 'grammar') {
    if (has(text, ['collocation'])) return 'collocations';
    if (has(text, ['countable', 'uncountable', 'determiners', 'all, every', 'much', 'many'])) return 'nouns-and-determiners';
    if (has(text, ['word forms', 'nouns, verbs, adjectives'])) return 'word-forms';
    if (has(text, ['prepositions'])) return 'prepositions';
    if (has(text, ['spelling'])) return 'spelling';
    if (has(text, ['similar meanings', 'word choice'])) return 'word-choice';
    if (has(text, ['word order', 'sentence order', 'type":"order'])) return 'word-order';
    if (has(text, ['verb pattern'])) return 'verb-patterns';
    if (has(text, ['conditional', 'if you', 'if mark', 'if i ', 'would have', 'wish i'])) return 'conditionals';
    if (has(text, ['passive', 'was written', 'be completed', 'believed to'])) return 'passive-voice';
    if (has(text, ['past perfect', 'by the time', 'since 2019', 'already', 'had '])) return 'perfect-tenses';
    if (has(text, ['inversion', 'seldom', 'not only', 'under no circumstances', 'hardly', 'rarely'])) return 'inversion';
    if (has(text, ['relative clause', 'who ', 'those who', 'whose'])) return 'relative-clauses';
    if (has(text, ['pronoun', 'you and me', 'it was me', 'yours', 'another'])) return 'pronouns';
    if (has(text, ['comparative', 'more taller', 'than we expected', 'by far'])) return 'comparatives';
    if (has(text, ['gerund', 'infinitive', 'enjoys ', 'decided to', 'avoided '])) return 'gerunds-and-infinitives';
    if (has(text, ['modal', 'obligation', 'must ', 'should '])) return 'modals';
    if (has(text, ['reported speech', 'told me', 'said she', 'asked the students'])) return 'reported-speech';
    if (has(text, ['article', 'a new', 'the movie', 'an engineer'])) return 'articles';
    if (has(text, ['adverb', 'however', 'nevertheless', 'despite', 'although'])) return 'adverbs-and-connectors';
    if (has(text, ['type":"fix', 'errortext', 'correctedtext'])) return 'error-correction';
    if (has(text, ['future', 'next year', 'by friday'])) return 'future-tenses';
    return 'general-grammar';
  }
  return 'general-academic';
}

function extract(container) {
  if (Array.isArray(container)) return container;
  return container.exercises ?? container.questions ?? container.prompts ?? container.items ?? [];
}

function classifyFile(file, skill, outputRoot, removeUncategorized = false) {
  const container = readJson(file);
  const exercises = extract(container);
  const groups = new Map();
  for (const item of exercises) {
    const topic = classify(skill, item);
    if (!groups.has(topic)) groups.set(topic, []);
    groups.get(topic).push(item);
  }
  for (const [topic, items] of groups) {
    const out = path.join(outputRoot, skill, `${topic}.json`);
    let existing = [];
    if (fs.existsSync(out)) existing = extract(readJson(out));
    const seen = new Set(existing.map((item) => item.id).filter(Boolean));
    const merged = [...existing, ...items.filter((item) => !item.id || !seen.has(item.id))];
    writeJson(out, { skill, topic, totalExercises: merged.length, exercises: merged });
  }
  if (removeUncategorized) fs.unlinkSync(file);
}

const currentSkills = ['listening', 'reading', 'speaking', 'writing', 'vocabulary', 'grammar'];
for (const skill of currentSkills) {
  const file = path.join(currentRoot, skill, 'uncategorized.json');
  if (fs.existsSync(file)) classifyFile(file, skill, currentRoot, true);
}
for (const [skill, fileName] of [['listening', 'uncategorized.json'], ['vocabulary', 'uncategorized.json']]) {
  const file = path.join(incomingRoot, skill, 'by-topic', fileName);
  if (fs.existsSync(file)) classifyFile(file, skill, path.join(incomingRoot, skill, 'by-topic'), true);
}

for (const base of [currentRoot, path.join(incomingRoot, 'by-topic')]) {
  const index = {};
  for (const skill of fs.existsSync(base) ? fs.readdirSync(base) : []) {
    const dir = path.join(base, skill);
    if (!fs.statSync(dir).isDirectory()) continue;
    index[skill] = {};
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.json') && name !== 'index.json')) {
      const data = readJson(path.join(dir, file));
      index[skill][path.basename(file, '.json')] = data.totalExercises ?? extract(data).length;
    }
    writeJson(path.join(dir, 'index.json'), index[skill]);
  }
  writeJson(path.join(base, 'index.json'), index);
}
