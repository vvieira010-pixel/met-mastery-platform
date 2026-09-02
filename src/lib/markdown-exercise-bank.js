/**
 * Markdown exercise-bank adapter.
 *
 * The teacher-authored Markdown banks remain the source of truth. This adapter
 * exposes their section metadata to the existing Exercise Library without
 * copying or silently rewriting the original teaching material.
 */
import b2Exercises from '../../Banco de 100 exercícios B2 — prática original no estilo MET.md?raw';

const SECTION_RE = /^##\s+(?:(\d+)\.\s+|((?:B2|B2\+)\s+Material\s+\d+\s+—\s+|Material\s+\d+\s+—\s+))(.+)$/gm;

function firstMatch(body, pattern) {
  return String(body || '').match(pattern)?.[1]?.trim() || '';
}

function cleanMarkdown(value) {
  return String(value || '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function markdownBlock(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(body || '').match(new RegExp(`\\*\\*${escaped}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'));
  return match ? match[1].trim() : '';
}

function parseOptions(text) {
  const source = String(text || '');
  const options = [];
  const matches = [...source.matchAll(/\(([A-D])\)\s*([\s\S]*?)(?=\s*\([A-D]\)|$)/g)];
  matches.forEach(match => {
    const option = cleanMarkdown(match[2]).replace(/\s+\d+\.\s*$/, '').trim();
    if (option) options.push({ key: match[1].toUpperCase(), text: option });
  });
  return options;
}

function answerLetters(answer) {
  return [...String(answer || '').matchAll(/(?:^|[;\s])(?:\d+\s*[-.]?\s*)?([A-D])(?:\b|\s|;)/gi)]
    .map(match => match[1].toUpperCase());
}

function answerIndex(answer, options) {
  const letter = answerLetters(answer)[0];
  if (!letter) return -1;
  return options.findIndex(option => option.key === letter);
}

function humanTimeToSeconds(value) {
  const text = String(value || '').toLowerCase();
  const minutes = Number(text.match(/(\d+)\s*minut/)?.[1] || 0);
  const seconds = Number(text.match(/(\d+)\s*segund/)?.[1] || 0);
  return Math.max(30, minutes * 60 + seconds || 60);
}

function makeShort(section, prompt) {
  return {
    type: 'short',
    title: section.title,
    skill: section.skill,
    level: section.level,
    prompt: prompt || section.instruction,
    rubric: markdownBlock(section.body, 'Feedback / critério') || 'Write a clear, accurate response that completes the task.',
    source: section.source,
  };
}

function makeFix(section, content, answer) {
  const replacement = String(answer || '').match(/(.+?)\s*(?:→|->)\s*(.+?)(?:\.|$)/);
  const errorText = cleanMarkdown(content).replace(/\*\*/g, '');
  const correctedText = replacement
    ? errorText.replace(replacement[1].trim(), replacement[2].trim())
    : cleanMarkdown(answer).replace(/^“|”$/g, '');
  return {
    type: 'fix',
    title: section.title,
    skill: section.skill,
    level: section.level,
    instruction: section.instruction,
    errorText,
    correctedText,
    hint: markdownBlock(section.body, 'Feedback / critério'),
    source: section.source,
  };
}

function makeBlank(section, content, answer) {
  const options = parseOptions(content);
  const letters = answerLetters(answer);
  const blanks = letters.map((letter, index) => {
    const start = index * 4;
    const group = options.slice(start, start + 4);
    const correct = group.find(option => option.key === letter)?.text;
    return correct || letter;
  });
  return {
    type: 'blank',
    title: section.title,
    skill: section.skill,
    level: section.level,
    instruction: section.instruction,
    template: content.replace(/_{3,}/g, '______').replace(/\n\s*\d+\.\s*\([A-D]\)[\s\S]*$/m, '').trim(),
    blanks: blanks.length ? blanks : cleanMarkdown(answer).split(/[;,]/).map(value => value.trim()).filter(Boolean),
    explanation: markdownBlock(section.body, 'Feedback / critério'),
    source: section.source,
  };
}

function makeObjective(section, content, answer, passage = '') {
  const options = parseOptions(content);
  const correct = answerIndex(answer, options);
  const question = cleanMarkdown(content
    .replace(/\([A-D]\)[\s\S]*$/m, '')
    .replace(/^\*\*(?:Pergunta|Question):\*\*\s*/i, ''));
  const base = {
    title: section.title,
    skill: section.skill,
    level: section.level,
    question: question || section.instruction,
    options: options.map(option => option.text),
    correct: correct >= 0 ? correct : 0,
    explanation: markdownBlock(section.body, 'Feedback / critério'),
    source: section.source,
  };
  return passage
    ? {
      type: 'read',
      title: section.title,
      skill: section.skill,
      level: section.level,
      passage,
      questions: [{ id: `${section.id}-q1`, ...base }],
      source: section.source,
    }
    : { type: 'mcq', ...base };
}

function makeReadingSet(section, content, answer) {
  const chunks = String(content || '').split(/\n(?=\d+\.\s+)/);
  if (chunks.length < 3) return null;

  const letters = answerLetters(answer);
  const questions = chunks.slice(1).map((chunk, index) => {
    const options = parseOptions(chunk);
    if (options.length < 2) return null;
    return {
      id: `${section.id}-q${index + 1}`,
      title: section.title,
      skill: section.skill,
      level: section.level,
      question: cleanMarkdown(chunk.replace(/\([A-D]\)[\s\S]*$/m, '')),
      options: options.map(option => option.text),
      correct: Math.max(0, options.findIndex(option => option.key === letters[index])),
      explanation: markdownBlock(section.body, 'Feedback / critério'),
      source: section.source,
    };
  });

  if (questions.some(question => !question)) return null;
  return {
    type: 'read',
    title: section.title,
    skill: section.skill,
    level: section.level,
    passage: chunks[0].trim(),
    questions,
    source: section.source,
  };
}

function makeListening(section, script, questionBlock, answer) {
  const options = parseOptions(questionBlock);
  return {
    type: 'listen',
    title: section.title,
    skill: 'Listening',
    level: section.level,
    audioText: script,
    plays: 2,
    question: cleanMarkdown(questionBlock.replace(/\([A-D]\)[\s\S]*$/m, '')),
    options: options.map(option => option.text),
    correct: Math.max(0, answerIndex(answer, options)),
    explanation: markdownBlock(section.body, 'Feedback / critério'),
    source: section.source,
  };
}

function makeSpeaking(section) {
  return {
    type: 'speak',
    title: section.title,
    skill: 'Speaking',
    level: section.level,
    prompt: section.instruction,
    targetSeconds: humanTimeToSeconds(section.time),
    rubric: markdownBlock(section.body, 'Feedback / critério'),
    source: section.source,
  };
}

function convertSection(section) {
  const body = section.body;
  const answer = markdownBlock(body, 'Gabarito / resposta-modelo') || markdownBlock(body, 'Answer key') || markdownBlock(body, 'Model answer');
  const content = markdownBlock(body, 'Conteúdo') || markdownBlock(body, 'Use it in the MET-style task') || '';
  const script = markdownBlock(body, 'Roteiro para gravação');
  const questionBlock = markdownBlock(body, 'Pergunta') || content;
  const title = section.title.toLowerCase();
  const skill = section.skill.toLowerCase();

  if (skill.includes('speaking')) return makeSpeaking(section);
  if (skill.includes('listening') || script) return makeListening(section, script || content, questionBlock, answer);
  if (/correction|error identification|error correction|corrija|corrija a frase|identifique e corrija/.test(title + ' ' + section.instruction.toLowerCase())) return makeFix(section, content, answer);
  if (/fill in the blanks|word formation|complete o parágrafo|complete cada|lacuna/.test(title + ' ' + section.instruction.toLowerCase()) && /_{3,}/.test(content)) return makeBlank(section, content, answer);
  if (skill.includes('reading')) {
    const readingSet = makeReadingSet(section, content, answer);
    if (readingSet) return readingSet;
  }
  if (/\([A-D]\)/.test(content) || /\([A-D]\)/.test(questionBlock)) {
    const questionIndex = content.search(/(?:\*\*)?(?:Pergunta|Question):/i);
    const passage = questionIndex > 80 ? content.slice(0, questionIndex).trim() : '';
    return makeObjective(section, questionIndex >= 0 ? content.slice(questionIndex) : content, answer, passage);
  }
  return makeShort(section, section.instruction || content);
}

function parseSections(raw, source) {
  const matches = [...String(raw || '').matchAll(SECTION_RE)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index || raw.length;
    const body = raw.slice(start, end).trim();
    const number = match[1] || firstMatch(match[2], /\d+/);
    const title = cleanMarkdown(match[3]);
    const skill = cleanMarkdown(firstMatch(body, /\*\*(?:Primary )?skill:\*\*\s*([^\n]+)/i)) || 'Mixed skills';
    const level = cleanMarkdown(firstMatch(body, /\*\*(?:Level|Nível sugerido):\*\*\s*([^\n]+)/i)) || (source.includes('B1') ? 'B1' : 'B2');
    const time = cleanMarkdown(firstMatch(body, /\*\*(?:Suggested time|Tempo sugerido):\*\*\s*([^\n]+)/i));
    const instruction = cleanMarkdown(firstMatch(body, /\*\*(?:Instruction|Instrução):\*\*\s*([^\n]+)/i));
    const previewSource = body
      .split(/\n\s*\n/)
      .map(cleanMarkdown)
      .find(text => text && !/^Prática original|^Original MET-style practice|^\*\*/i.test(text)) || instruction;

    const section = {
      id: `md_${source}_${number || index + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: title,
      title,
      skill,
      level,
      time,
      instruction,
      preview: previewSource.slice(0, 220),
      source,
      sourceText: body,
      body,
    };
    const exercise = convertSection(section);
    return {
      ...section,
      exercises: [{
        ...exercise,
        id: `md_ex_${source}_${number || index + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }],
    };
  });
}

const ORIGINAL = parseSections(b2Exercises, 'b2-original-exercises');

export const MARKDOWN_BANKS = [
  {
    id: 'b2-original-exercises',
    label: '100 Original B2 Exercises',
    level: 'B2',
    description: 'Original MET-style practice across Reading, Listening, Writing, and Speaking.',
    sourceFile: 'Banco de 100 exercícios B2 — prática original no estilo MET.md',
    modules: ORIGINAL,
  },
];

export function getMarkdownModules() {
  return MARKDOWN_BANKS.flatMap(bank => bank.modules.map(module => ({
    ...module,
    bankId: bank.id,
    bankLabel: bank.label,
    bankDescription: bank.description,
    sourceFile: bank.sourceFile,
  })));
}

export function getMarkdownBankSummary() {
  return MARKDOWN_BANKS.map(bank => ({
    ...bank,
    moduleCount: bank.modules.length,
    exerciseCount: bank.modules.length,
  }));
}
