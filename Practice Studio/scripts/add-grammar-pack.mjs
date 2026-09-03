import fs from 'node:fs';
import path from 'node:path';

const source = path.resolve('Practice Studio/incoming/grammar/grammar_92_questions.json');
const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const questions = data.questions ?? [];
const currentSkills = path.resolve('Practice Studio/current/skills/grammar');
const currentTopics = path.resolve('Practice Studio/current/by-topic/grammar');
const incomingTopics = path.resolve('Practice Studio/incoming/grammar/by-topic');

fs.copyFileSync(source, path.join(currentSkills, 'grammar_92_questions.json'));

const groups = new Map();
for (const question of questions) {
  if (!groups.has(question.category)) groups.set(question.category, []);
  groups.get(question.category).push({
    ...question,
    type: 'mcq',
    skill: 'Grammar',
  });
}

function mergeInto(dir, category, additions) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${category}.json`);
  let existing = { skill: 'grammar', topic: category, totalExercises: 0, exercises: [] };
  if (fs.existsSync(file)) existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  const old = existing.exercises ?? [];
  const seen = new Set(old.map((item) => item.id).filter(Boolean));
  const merged = [...old, ...additions.filter((item) => !seen.has(item.id))];
  fs.writeFileSync(file, `${JSON.stringify({ skill: 'grammar', topic: category, totalExercises: merged.length, exercises: merged }, null, 2)}\n`);
}

for (const [category, items] of groups) {
  mergeInto(currentTopics, category, items);
  mergeInto(incomingTopics, category, items);
}

function refreshIndex(dir) {
  const topics = {};
  for (const name of fs.readdirSync(dir).filter((name) => name.endsWith('.json') && name !== 'index.json')) {
    const item = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    topics[name.slice(0, -5)] = item.totalExercises ?? item.exercises?.length ?? 0;
  }
  fs.writeFileSync(path.join(dir, 'index.json'), `${JSON.stringify({ skill: 'grammar', topics, totalExercises: Object.values(topics).reduce((sum, count) => sum + count, 0) }, null, 2)}\n`);
}

refreshIndex(currentTopics);
refreshIndex(incomingTopics);
console.log(`Added ${questions.length} new grammar questions across ${groups.size} categories.`);
