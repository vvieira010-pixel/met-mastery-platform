import fs from 'fs';
import path from 'path';
const base = 'C:/Users/vviei/Plarform0.2';
const md = fs.readFileSync(path.join(base,'src/data/exercises/vocabulary/additional-michigan-vocab-10.md'),'utf8');
const lines = md.split(/\r?\n/);
const items=[];
let cur=null;
let answerMap=new Map();
const tableStart=lines.findIndex(l=>l.includes('| No. |'));
if(tableStart>-1){
  for(let i=tableStart+2;i<lines.length;i++){
    const line=lines[i];
    if(!line.startsWith('|')) break;
    const cols=line.split('|').map(s=>s.trim()).filter(Boolean);
    if(cols.length>=3){
      const num=parseInt(cols[0]);
      const ans=cols[1];
      const expl=cols[2];
      answerMap.set(num, {answer:ans, expl});
    }
  }
}
for(let i=0;i<lines.length;i++){
  const line=lines[i];
  const m=line.match(/^\*\*(\d+)\.\*\*\s*(.*)/);
  if(m){
    if(cur) items.push(cur);
    const num=parseInt(m[1]);
    const q=m[2].trim();
    cur={id:num, question:q, options:{}, level:'B2+', correct: answerMap.get(num)?.answer||'A', expl: answerMap.get(num)?.expl||''};
  } else if(cur && /^A\.\s/.test(line)){
    cur.options.A=line.replace(/^A\.\s*/,'').trim();
  } else if(cur && /^B\.\s/.test(line)){
    cur.options.B=line.replace(/^B\.\s*/,'').trim();
  } else if(cur && /^C\.\s/.test(line)){
    cur.options.C=line.replace(/^C\.\s*/,'').trim();
  } else if(cur && /^D\.\s/.test(line)){
    cur.options.D=line.replace(/^D\.\s*/,'').trim();
  }
}
if(cur) items.push(cur);
console.log('parsed',items.length);
const normalized={title:"Additional Michigan Vocab 10", level:"B2+", skill:"vocabulary", items:items.map(it=>({id:it.id, question:it.question, options:it.options, correctAnswer:it.correct, explanation:it.expl, level:'B2+'}))};
fs.writeFileSync(path.join(base,'src/data/exercises/vocabulary/additional-michigan-vocab-10.json'), JSON.stringify(normalized,null,2));
console.log('wrote', normalized.items.length);
