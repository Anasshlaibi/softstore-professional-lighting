const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const Fuse = require('fuse.js');
const cheerio = require('cheerio');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

// Map of DB Name to local HTML file (from sync_galleries)
const manualMap = {
  "AF35mm F1.8 Fuji (FX Mount) APS-C - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
  "AF50mm F1.8 Nikon (Z Mount) - Black": "50mm-f1-8-af-lens.html",
  "AF135mm F1.8 Nikon (Z Mount) - Black": "af-135mm-f1-8-full-frame-lens-for-e-z-l.html",
  "AF24mm F1.8 Nikon (Z Mount) - Black": "af-24mm-f1-8-full-frame-lens-for-e.html",
  "AF35mm F1.8 Nikon (Z Mount) - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
  "AF35mm F1.4 Fuji (FX Mount) - Black": "af-35mm-f1-4.html",
  "AF35mm F1.8 Sony (E Mount) APS-C - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
  "AF35mm F1.8 Nikon (Z Mount) APS-C - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
  "AF50mm F1.8 Fuji (FX Mount) APS-C - Black": "50mm-f1-8-af-lens.html",
  "AF40mm F2.5 Sony (E Mount) - Black": "af-40mm-f2-5-full-frame-lens-for-e-z-l.html",
  "AF50mm F1.8 Sony (E Mount) - Black": "50mm-f1-8-af-lens.html",
  "AF24mm F1.8 Sony (E Mount) - Black": "af-24mm-f1-8-full-frame-lens-for-e.html",
  "AF50mm F1.8 Sony (E Mount) APS-C - Black": "50mm-f1-8-af-lens.html",
  "16mm T2.1 Canon (EOS-R Mount) - Titanium Gray": "16mm-t2-9-cinema-lens.html",
  "16mm T2.1 Canon (EOS-R Mount) - Black": "16mm-t2-9-cinema-lens.html",
  "16mm T2.1 M43 (Panasonic Olympus) - Titanium Gray": "16mm-t2-9-cinema-lens.html",
  "16mm T2.1 Sony (E Mount) - Titanium Gray": "16mm-t2-9-cinema-lens.html",
  "16mm T2.1 M43 (Panasonic Olympus) - Black": "16mm-t2-9-cinema-lens.html",
  "16mm T2.1 Fuji (FX Mount) - Titanium Gray": "16mm-t2-9-cinema-lens.html",
  "16mm T2.1 Sony (E Mount) - Black": "16mm-t2-9-cinema-lens.html",
  "16mm T2.1 Fuji (FX Mount) - Black": "16mm-t2-9-cinema-lens.html",
  "50mm F1.2 Nikon (Z Mount) - Black": "50mm-f1-05.html",
  "50mm F1.2 Fuji (FX Mount) - Black": "50mm-f1-05.html",
  "50mm F1.2 Sony (E Mount) - Black": "50mm-f1-05.html",
  "50mm F1.2 M43 (Panasonic Olympus) - Black": "50mm-f1-05.html",
  "Autofocus adapter for Canon EF - Nikon Z - Black": "lens-adapter.html",
  "PL 4-in-1 Lens Adapter compatible with E / L / RF / Z Mount - Silver": "lens-adapter.html",
  "77mm True Color VND6-9 Filter - Black": "magnetic-filters.html",
  "55mm 1/8 Black Mist Filter - Black": "magnetic-filters.html",
  "35mm T2.0 Nikon (Z Mount) - Black": "35mm-t2-0-cinema-lens.html",
  "50mm T2.0 Sony (E Mount) - Black": "50mm-t2-0-cinema-lens.html",
  "AF135mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black": "af-135mm-f1-8-full-frame-lens-for-e-z-l.html",
  "AF35mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black": "af-35mm-f1-8-full-frame-lens-for-e-z-l.html",
  "AF24mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black": "af-24mm-f1-8-full-frame-lens-for-e.html",
  "AF50mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black": "50mm-f1-8-af-lens.html",
  "AF135mm F1.8 Sony (E Mount) - Black": "af-135mm-f1-8-full-frame-lens-for-e-z-l.html",
  "35mm F1.4 Canon (EOS-R Mount) mark iii FF - Black": "35mm-f1-4.html"
};

async function main() {
  console.log('Loading local HTML files...');
  const folder = 'C:/Downloaded Web Sites/7artisans.store/products';
  const htmlFiles = fs.readdirSync(folder).filter(f => f.endsWith('.html'));

  const localFilesHtml = {};

  for (const file of htmlFiles) {
    const filePath = path.join(folder, file);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    // Extract rich HTML
    let richHtml = '';
    let started = false;

    $('[id^="shopify-section-"]').each((i, el) => {
      const id = $(el).attr('id');
      if (id.includes('__related-products') || id.includes('__footer')) {
        started = false;
      }
      if (started) {
        richHtml += $(el).prop('outerHTML');
      }
      if (id.endsWith('__main')) {
        started = true;
      }
    });

    if (richHtml) {
      // Fix paths
      richHtml = richHtml.replace(/\.\.\/cdn\//g, 'https://7artisans.store/cdn/');
      richHtml = richHtml.replace(/(?<!https:)\/\/7artisans\.store\/cdn\//g, 'https://7artisans.store/cdn/');
      // Avoid some tracking or broken scripts
      richHtml = richHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      const titleMatch = html.match(/<title>\s*(.*?)\s*&ndash;/);
      let title = titleMatch ? titleMatch[1].trim() : file;

      localFilesHtml[file] = { title, html: richHtml };
    }
  }

  console.log(`Extracted rich descriptions for ${Object.keys(localFilesHtml).length} HTML files.`);

  console.log('Fetching Supabase products...');
  const { data: dbProducts, error } = await supabase.from('products gearshop').select('id, name');

  if (error) {
    console.error('Supabase error:', error);
    return;
  }

  const fuseOptions = { keys: ['title'], threshold: 0.3 };
  const localList = Object.entries(localFilesHtml).map(([file, data]) => ({ file, title: data.title }));
  const fuse = new Fuse(localList, fuseOptions);

  const richDescriptionsMap = {};

  for (const p of dbProducts) {
    let matchedFile = null;

    if (manualMap[p.name]) {
      matchedFile = manualMap[p.name];
    } else {
      let cleanName = p.name;
      cleanName = cleanName.replace(/\(.*?\)/g, '');
      cleanName = cleanName.replace(/-\s*Black/g, '');
      cleanName = cleanName.replace(/Mount/g, '');
      cleanName = cleanName.replace(/FF/g, '');
      
      const results = fuse.search(cleanName);
      if (results.length > 0) {
        matchedFile = results[0].item.file;
      }
    }

    if (matchedFile && localFilesHtml[matchedFile]) {
      richDescriptionsMap[p.id] = localFilesHtml[matchedFile].html;
    }
  }

  const outputPath = path.join(__dirname, 'src', 'data', 'richDescriptions.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(richDescriptionsMap));

  console.log(`Saved rich descriptions mapped to ${Object.keys(richDescriptionsMap).length} DB products to ${outputPath}.`);
}

main();
