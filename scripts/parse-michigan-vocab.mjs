import fs from 'fs';
import path from 'path';
const base = 'C:/Users/vviei/Plarform0.2';
const md = fs.readFileSync(path.join(base,'src/data/exercises/vocabulary/michigan-vocab-45.md'),'utf8');
const lines = md.split(/\r?\n/);
const items = [];
let current = null;
let answerMap = new Map();

// First parse answer key table at bottom
const tableStart = lines.findIndex(l=>l.includes('| No. |'));
if(tableStart>-1){
  for(let i=tableStart+2;i<lines.length;i++){
    const line = lines[i];
    if(!line.startsWith('|')) break;
    const cols = line.split('|').map(s=>s.trim()).filter(Boolean);
    // cols: No., Level, Answer, Explanation
    if(cols.length>=4){
      const num = parseInt(cols[0]);
      const level = cols[1];
      const answer = cols[2];
      const expl = cols[3];
      answerMap.set(num, {level, answer, expl});
    }
  }
}

let qNum = 0;
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  const qMatch = line.match(/^\*\*(\d+)\.\*\*\s*(.*)/);
  if(qMatch){
    if(current) items.push(current);
    qNum = parseInt(qMatch[1]);
    const question = qMatch[2].trim();
    current = {id: qNum, rawQuestion: question, options:{}, level: answerMap.get(qNum)?.level || (qNum<=15?'B1':qNum<=30?'B2':'B2+'), correct: answerMap.get(qNum)?.answer || 'A', expl: answerMap.get(qNum)?.expl || ''};
  } else if(current && /^A\.\s/.test(line)){
    current.options.A = line.replace(/^A\.\s*/,'').trim();
  } else if(current && /^B\.\s/.test(line)){
    current.options.B = line.replace(/^B\.\s*/,'').trim();
  } else if(current && /^C\.\s/.test(line)){
    current.options.C = line.replace(/^C\.\s*/,'').trim();
  } else if(current && /^D\.\s/.test(line)){
    current.options.D = line.replace(/^D\.\s*/,'').trim();
  }
}
if(current) items.push(current);

console.log('parsed', items.length);
// Create normalized JSON
const normalized = {
  title: "Michigan Vocabulary 45",
  level: "B1-B2+",
  skill: "vocabulary",
  items: items.map(it=> ({
    id: it.id,
    question: it.rawQuestion,
    options: it.options,
    correctAnswer: it.correct,
    explanation: it.expl,
    level: it.level
  }))
};
fs.writeFileSync(path.join(base,'src/data/exercises/vocabulary/michigan-vocab-45.json'), JSON.stringify(normalized,null,2));
console.log('wrote json', normalized.items.length);
// Validate
const distinctLevels = [...new Set(items.map(i=>i.level))];
console.log('levels', distinctLevels);
