const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

const htmlContent = fs.readFileSync('C:/Users/HELIOS NEO 16/Documents/softstore-professional-lighting-main/HTML FOR PICS.HTML', 'utf-8');

// Parse all images with their URL and surrounding context/text/alt/filename
const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
const altRegex = /alt=["']([^"']*)["']/i;

const scrapedImages = [];
let m;
while ((m = imgRegex.exec(htmlContent)) !== null) {
  const fullTag = m[0];
  const src = m[1];
  const altMatch = fullTag.match(altRegex);
  const alt = altMatch ? altMatch[1] : '';

  if (src && src.includes('wp-content/uploads') && !src.includes('logo') && !src.includes('cropped-') && !src.includes('banner')) {
    // Extract filename without extension
    const urlParts = src.split('/');
    const filename = decodeURIComponent(urlParts[urlParts.length - 1]).toLowerCase();
    scrapedImages.push({
      src,
      alt: alt.toLowerCase(),
      filename,
      fullText: `${alt} ${filename}`.toLowerCase()
    });
  }
}

console.log(`Extracted ${scrapedImages.length} candidate product images from HTML.`);

function findBestMatch(productName, productCategory) {
  const nameL = productName.toLowerCase();
  const tokens = nameL
    .replace(/[^\w\d\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['noir', 'blanc', 'vert', 'rouge', 'bleu', 'kit', 'boitier', 'objectif', 'camera', 'appareil', 'photo'].includes(t));

  let bestMatch = null;
  let bestScore = 0;

  for (const img of scrapedImages) {
    let score = 0;
    for (const token of tokens) {
      if (img.fullText.includes(token)) {
        score += token.length; // weight longer specific model tokens (e.g. "fx30", "r6", "z6", "v100", "sl60", "lark", "charmera")
      }
    }

    // Exact model code boost
    const modelMatch = nameL.match(/\b(z9|z6|z5|z30|z50|zr|r5|r6|r8|r10|r50|fx30|fx3|a7|a7s|a6600|zv-e10|v1|sl60|lark|ace pro|charmera|az528|wpz2|fz55)\b/i);
    if (modelMatch && img.fullText.includes(modelMatch[1].toLowerCase())) {
      score += 15;
    }

    if (score > bestScore && score >= 8) {
      bestScore = score;
      bestMatch = img.src;
    }
  }

  return bestMatch;
}

async function testMatch() {
  const { data: products } = await supabase
    .from('products gearshop')
    .select('id, name, category, image')
    .gte('id', 5000)
    .order('id', { ascending: true });

  console.log(`Testing match for ${products.length} imported products...`);
  let matched = 0;
  for (const p of products) {
    const match = findBestMatch(p.name, p.category);
    if (match) {
      matched++;
      console.log(`✅ [${p.id}] ${p.name}`);
      console.log(`   -> ${match}`);
    } else {
      console.log(`❌ [${p.id}] ${p.name} (No match)`);
    }
  }

  console.log(`\nMatched ${matched} / ${products.length} products with real images!`);
}

testMatch();
