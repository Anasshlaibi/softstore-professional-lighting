const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('scripts/saymon_products-PiUAE8-_.js', 'utf8');

// The file likely starts with `const e=[...]` or `export default e` or similar
// Let's create a sandbox and run it
const sandbox = { window: {}, console: console, module: {}, exports: {} };
vm.createContext(sandbox);

try {
  // Let's replace any `export` or `import` with dummy or let's find `const e=[...]`
  let sanitized = code.replace(/export\s*\{[^}]*\};?/g, '');
  // Extract products array if variable e or similar
  const match = sanitized.match(/const\s+([a-zA-Z0-9_]+)\s*=\s*(\[\s*\{[\s\S]*\}\s*\]);/);
  if (match) {
    console.log('Found array variable:', match[1]);
    const parsed = vm.runInContext('(' + match[2] + ')', sandbox);
    console.log('Successfully parsed products count:', parsed.length);
    fs.writeFileSync('scripts/saymon_products.json', JSON.stringify(parsed, null, 2));
    console.log('Saved scripts/saymon_products.json');

    // Print some stats
    const brands = {};
    const categories = {};
    parsed.forEach(p => {
      brands[p.brand] = (brands[p.brand] || 0) + 1;
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    console.log('Brands:', brands);
    console.log('Categories:', categories);
    console.log('Sample item:', parsed[0]);
  } else {
    console.log('No direct regex match, searching alternative...');
  }
} catch (err) {
  console.error('Error running VM:', err);
}
