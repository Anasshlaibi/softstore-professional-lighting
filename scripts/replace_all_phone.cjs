const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        replaceInDir(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js|cjs|html|json|md)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      const replacements = [
        ['06 73 01 18 73', '06 73 01 18 73'],
        ['0673011873', '0673011873'],
        ['212673011873', '212673011873'],
        ['+212 673-011873', '+212 673-011873'],
        ['+212 6 73 01 18 73', '+212 6 73 01 18 73'],
        ['+212673011873', '+212673011873'],
        ['06.73.01.18.73', '06.73.01.18.73']
      ];

      for (const [oldVal, newVal] of replacements) {
        if (content.includes(oldVal)) {
          content = content.split(oldVal).join(newVal);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated phone in: ${fullPath}`);
      }
    }
  }
}

replaceInDir(process.cwd());
console.log('Finished updating all phone numbers to 0673011873 / +212673011873!');
