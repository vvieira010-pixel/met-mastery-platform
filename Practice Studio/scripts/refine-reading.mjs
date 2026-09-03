import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('Practice Studio/current/by-topic/reading');
const exercises = [];
for (const name of fs.readdirSync(dir).filter((name) => name.endsWith('.json') && name !== 'index.json')) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  exercises.push(...data.exercises);
}

function topic(item) {
  const text = JSON.stringify(item).toLowerCase();
  if (item.type === 'blank' || text.includes('b1 reading grammar')) return 'reading-language';
  if (text.includes('online learning') || text.includes('online platforms')) return 'online-learning';
  if (text.includes('study abroad') || text.includes('short-term exchange') || text.includes('international experience')) return 'study-abroad';
  if (text.includes('flexible work') || text.includes('remote work')) return 'work-and-career';
  if (text.includes('christmas tree')) return 'christmas-tree-farming';
  if (text.includes('baobab')) return 'baobab-adaptation';
  if (text.includes('cherry blossom') || text.includes('hanami')) return 'cherry-blossom-culture';
  if (text.includes('city tree') || text.includes('tree adoption') || text.includes('trees in cities')) return 'urban-forestry';
  if (text.includes('mangrove')) return 'mangrove-ecosystems';
  if (text.includes('atlantic forest')) return 'forest-conservation';
  if (text.includes('isolated tree') || text.includes('loneliest tree')) return 'isolated-trees';
  if (text.includes('arbor day')) return 'arbor-day';
  if (text.includes('tree ring') || text.includes('dendrochronology')) return 'tree-rings';
  if (text.includes('seed bank') || text.includes('saving tree and plant seeds')) return 'seed-conservation';
  if (text.includes('trees communicate')) return 'tree-communication';
  if (text.includes('giant sequoia')) return 'giant-sequoias';
  if (text.includes('oldest trees')) return 'ancient-trees';
  if (text.includes('renewable energy')) return 'renewable-energy';
  if (text.includes('great barrier reef')) return 'marine-ecosystems';
  if (text.includes('olympic games')) return 'olympic-history';
  if (text.includes('jupiter') || text.includes('great red spot')) return 'astronomy-and-space';
  if (text.includes('silk road')) return 'silk-road-history';
  if (text.includes('water cycle')) return 'water-cycle';
  if (text.includes('printing press')) return 'printing-press-history';
  if (text.includes('chocolate')) return 'food-history';
  if (text.includes('marie curie')) return 'scientists-and-discovery';
  if (text.includes("world's fairs") || text.includes('worlds fairs')) return 'innovation-and-exhibitions';
  if (text.includes('human brain')) return 'brain-science';
  if (text.includes('music school') || text.includes('music and education')) return 'music-and-education';
  return 'general-reading';
}

const groups = new Map();
for (const item of exercises) {
  const key = topic(item);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);
}
for (const name of fs.readdirSync(dir).filter((name) => name.endsWith('.json') && name !== 'index.json')) fs.unlinkSync(path.join(dir, name));
const topics = {};
for (const [key, items] of groups) {
  fs.writeFileSync(path.join(dir, `${key}.json`), `${JSON.stringify({ skill: 'reading', topic: key, totalExercises: items.length, exercises: items }, null, 2)}\n`);
  topics[key] = items.length;
}
fs.writeFileSync(path.join(dir, 'index.json'), `${JSON.stringify({ skill: 'reading', topics, totalExercises: exercises.length }, null, 2)}\n`);
console.log(`Refined ${exercises.length} exercises into ${groups.size} reading topics.`);
for (const [key, items] of [...groups].sort()) console.log(`${key}=${items.length}`);
