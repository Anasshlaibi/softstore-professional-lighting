const fs = require('fs');

const content = fs.readFileSync('scripts/saymon_products-PiUAE8-_.js', 'utf8');

// Let's inspect the export or data structure in this file
console.log('File size:', content.length);

// Let's find object structures like {id:..., name:..., price:..., image:...}
const idMatches = [...content.matchAll(/id:\s*["']?([a-zA-Z0-9_-]+)["']?/g)].slice(0, 10);
console.log('Sample IDs:', idMatches.map(m => m[1]));

// Let's write a small script to evaluate or regex extract the products array
fs.writeFileSync('scripts/saymon_js_snippet.txt', content.slice(0, 3000));
console.log('Saved first 3000 chars of saymon bundle');
