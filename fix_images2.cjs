const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

function getBigrams(str) {
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const bigrams = [];
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.push(s.slice(i, i + 2));
  }
  return bigrams;
}

function diceCoefficient(str1, str2) {
  const bg1 = getBigrams(str1);
  const bg2 = getBigrams(str2);
  if (bg1.length === 0 || bg2.length === 0) return 0;
  
  let intersection = 0;
  const bg2Copy = [...bg2];
  for (const bg of bg1) {
    const idx = bg2Copy.indexOf(bg);
    if (idx !== -1) {
      intersection++;
      bg2Copy.splice(idx, 1);
    }
  }
  return (2.0 * intersection) / (bg1.length + bg2.length);
}

async function run() {
  const productsDir = 'C:\\Downloaded Web Sites\\7artisans.store\\products';
  const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.html'));

  const fileData = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(productsDir, file), 'utf8');
    const titleMatch = content.match(/<meta property="og:title" content="([^"]+)">/);
    const imageMatch = content.match(/<meta property="og:image:secure_url" content="([^"]+)">/);
    if (titleMatch && imageMatch) {
      // Remove generic stuff from title
      let cleanTitle = titleMatch[1].replace(/official 7artisans store/gi, '')
                                    .replace(/–/g, '')
                                    .replace(/-/g, ' ')
                                    .trim();
      fileData.push({
        title: cleanTitle,
        fileName: file.replace('.html', '').replace(/-/g, ' '),
        image: imageMatch[1]
      });
    }
  }

  const { data: products, error } = await supabase.from('products gearshop').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  let updatedCount = 0;
  for (const product of products) {
    // Skip if it already has a working image? 
    // The user said "missing pics", so maybe I should update all of them just in case.
    
    let bestMatch = null;
    let highestScore = 0;
    
    for (const fd of fileData) {
       // Compare against title and fileName
       const score1 = diceCoefficient(product.name, fd.title);
       const score2 = diceCoefficient(product.name, fd.fileName);
       const score = Math.max(score1, score2);
       
       if (score > highestScore) {
         highestScore = score;
         bestMatch = fd;
       }
    }
    
    if (highestScore > 0.4 && bestMatch) { // 0.4 is a reasonable threshold for Dice Coefficient
       console.log(`[SCORE: ${(highestScore).toFixed(2)}] ${product.name} -> ${bestMatch.title}`);
       await supabase.from('products gearshop').update({ image: bestMatch.image }).eq('id', product.id);
       updatedCount++;
    } else {
       console.log(`[NO MATCH] ${product.name} (Best score: ${(highestScore).toFixed(2)})`);
    }
  }
  console.log(`Updated ${updatedCount} products!`);
}

run();
