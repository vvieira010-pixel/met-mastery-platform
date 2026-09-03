import { vocabAddon } from './vocab-55.js';
import { speakingAddon } from './speaking-29.js';
import { writingAddon } from './writing-76.js';

function mergeBuckets(...maps) {
  const out = {};
  for (const map of maps) {
    for (const [topic, items] of Object.entries(map)) {
      out[topic] = [...(out[topic] || []), ...items];
    }
  }
  return out;
}

const base = {
  work_career: [],
  healthcare: [],
  education: [],
  technology: [],
  environment: [],
  community: [],
  travel_culture: [],
  money_consumer: [],
  family_relationships: [],
  media_news: [],
  general: [],
};

const addonExercises = mergeBuckets(base, vocabAddon, speakingAddon, writingAddon);

export default addonExercises;
