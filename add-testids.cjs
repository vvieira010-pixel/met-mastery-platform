const fs = require('fs');
const path = require('path');

const pagesDir = 'src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has data-testid in function signature
  if (content.includes('"data-testid"') || content.includes("data-testid")) {
    console.log('Skipping', file, '- already has testid');
    return;
  }
  
  // Find default export function
  const regex = /export default function (\w+)\((\{([^}]*)\})\)/;
  const match = content.match(regex);
  
  if (match) {
    const funcName = match[1];
    const params = match[2];
    const innerParams = match[3].trim();
    
    let newParams;
    if (innerParams === '') {
      newParams = '{ "data-testid": testId }';
    } else {
      newParams = '{ ' + innerParams + ', "data-testid": testId }';
    }
    
    const newSignature = 'export default function ' + funcName + '(' + newParams + ')';
    content = content.replace(regex, newSignature);
    
    // Add data-testid to root element
    // Find the first return statement with JSX
    const returnRegex = /return\s*\(\s*<(\w+)/;
    const returnMatch = content.match(returnRegex);
    if (returnMatch) {
      const tagName = returnMatch[1];
      const tagRegex = new RegExp('(<' + tagName + '\\b)([^>]*)>');
      const tagMatch = content.match(tagRegex);
      if (tagMatch && !tagMatch[2].includes('data-testid')) {
        const newTag = tagMatch[1] + tagMatch[2] + ' data-testid={testId}>';
        content = content.replace(tagMatch[0], newTag);
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  } else {
    console.log('Could not parse', file);
  }
});