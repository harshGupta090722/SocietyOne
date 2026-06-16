import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) { 
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
let output = [];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Check if line contains $
    if (line.includes('$')) {
      // Print the line if it has $ followed by { or a digit or space digit, AND is not a clear template literal
      if (line.match(/\$\s*[\{0-9]/)) {
          output.push(`${file}:${i+1}: ${line.trim()}`);
      }
    }
  });
});
console.log(output.join('\n'));
