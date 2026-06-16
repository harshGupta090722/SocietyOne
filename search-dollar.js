import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('frontend/src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Check if line has '$'
    if (line.includes('$')) {
      // ignore if it's purely a template literal string like `${` inside backticks
      // This is a naive check: if the line has `$` but it's not followed by `{`
      // Or if it's `$\{` inside JSX (no backticks)
      if (line.match(/\$(?=[0-9])|\$\s*\{|\$ /) && !line.match(/\`.*?\$\{.*?\}.*\`/)) {
        console.log(`${file}:${i+1}: ${line.trim()}`);
      } else if (line.includes('$') && !line.includes('${') && !line.includes('eslint') && !line.includes('.match') && !line.includes('.replace') && !line.includes('console.log')) {
         console.log(`${file}:${i+1}: ${line.trim()}`);
      }
    }
  });
});
