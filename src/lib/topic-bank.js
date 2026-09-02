/**
 * A teacher's reusable lesson-topic library.
 *
 * Topic records deliberately contain teaching material, not a homework
 * assignment. Homework stores a snapshot of a selected topic separately so
 * future edits to the library do not alter work already assigned to students.
 */
import { generateId } from './utils.js';

const TOPIC_BANK_KEY = 'vv:topicBank';

function getTopicBankKey() {
  try {
    const rawSession = localStorage.getItem('vv:supabase_session');
    const session = rawSession ? JSON.parse(rawSession) : null;
    const user = session?.user;
    const scope = user?.id || user?.email;
    return scope ? `${TOPIC_BANK_KEY}:${String(scope).trim().toLowerCase()}` : `${TOPIC_BANK_KEY}:anonymous`;
  } catch {
    return `${TOPIC_BANK_KEY}:anonymous`;
  }
}

function loadBank() {
  try {
    const key = getTopicBankKey();
    const scopedValue = localStorage.getItem(key);
    const legacyValue = key === TOPIC_BANK_KEY ? null : localStorage.getItem(TOPIC_BANK_KEY);
    const value = JSON.parse(scopedValue || legacyValue || '[]');
    if (!scopedValue && legacyValue) {
      localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
    }
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveBank(topics) {
  try { localStorage.setItem(getTopicBankKey(), JSON.stringify(topics)); } catch {}
}

export function getSavedTopics() {
  return loadBank().sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
}

export function saveTopicToBank(topic) {
  const now = new Date().toISOString();
  const list = loadBank();
  const existingIndex = topic?.bankTopicId ? list.findIndex(item => item.id === topic.bankTopicId) : -1;
  const record = {
    id: existingIndex >= 0 ? topic.bankTopicId : generateId('topic_'),
    title: String(topic?.title || '').trim(),
    category: topic?.category || 'My topics',
    skill: topic?.skill || '',
    objective: topic?.objective || '',
    content: topic?.content || '',
    examples: Array.isArray(topic?.examples) ? topic.examples
      .filter(example => typeof example?.text === 'string' && example.text.trim())
      .map(example => ({
        id: example.id || generateId('example_'),
        text: example.text.trim(),
        explanation: typeof example.explanation === 'string' ? example.explanation.trim() : '',
      })) : [],
    createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : now,
    updatedAt: now,
  };
  if (!record.title) return null;
  if (existingIndex >= 0) list[existingIndex] = record;
  else list.unshift(record);
  saveBank(list);
  return record;
}

export function removeSavedTopic(id) {
  saveBank(loadBank().filter(topic => topic.id !== id));
}
