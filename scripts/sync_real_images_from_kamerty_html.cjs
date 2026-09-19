const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

const htmlContent = fs.readFileSync('C:/Users/HELIOS NEO 16/Documents/softstore-professional-lighting-main/HTML FOR PICS.HTML', 'utf-8');

// Parse all image URLs
const imgRegex = /https:\/\/kamerty\.ma\/wp-content\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi;
const allImageUrls = [...new Set(htmlContent.match(imgRegex) || [])]
  .filter(url => !url.includes('logo') && !url.includes('cropped-') && !url.includes('banner') && !url.includes('150x150') && !url.includes('100x100'));

console.log(`Extracted ${allImageUrls.length} unique authentic studio product photos from HTML.`);

// Clean high-res URL (convert thumbnail -330x330 to full size)
function getHighResUrl(url) {
  return url.replace(/-\d+x\d+\.(jpg|jpeg|png|webp)$/i, '.$1');
}

// Build smart matching rules
function findExactPhoto(pName, pCategory) {
  const nameL = pName.toLowerCase();

  for (const rawUrl of allImageUrls) {
    const urlL = decodeURIComponent(rawUrl).toLowerCase();

    // Kodak Charmera
    if (nameL.includes('charmera') && urlL.includes('charmera')) return getHighResUrl(rawUrl);

    // Kodak Pixpro C1
    if (nameL.includes('pixpro c1') && urlL.includes('pixpro-c1')) return getHighResUrl(rawUrl);

    // Kodak Pixpro FZ55
    if (nameL.includes('fz55') && urlL.includes('fz55')) return getHighResUrl(rawUrl);

    // Kodak Pixpro FZ45
    if (nameL.includes('fz45') && urlL.includes('fz45')) return getHighResUrl(rawUrl);

    // Kodak Pixpro AZ528 / AZ255 / AZ425
    if (nameL.includes('az528') && urlL.includes('az528')) return getHighResUrl(rawUrl);
    if (nameL.includes('az255') && urlL.includes('az255')) return getHighResUrl(rawUrl);
    if (nameL.includes('az425') && urlL.includes('az425')) return getHighResUrl(rawUrl);
    if (nameL.includes('wpz2') && urlL.includes('wpz2')) return getHighResUrl(rawUrl);

    // Agfa Realishot DC8200 & DC5200
    if (nameL.includes('dc8200') && urlL.includes('dc8200')) return getHighResUrl(rawUrl);
    if (nameL.includes('dc5200') && urlL.includes('dc5200')) return getHighResUrl(rawUrl);

    // Instax Mini 11 & 12
    if (nameL.includes('instax mini 11') && urlL.includes('instax-mini-11')) return getHighResUrl(rawUrl);
    if (nameL.includes('instax mini 12') && urlL.includes('instax-mini-12')) return getHighResUrl(rawUrl);
    if (nameL.includes('instax wide 400') && urlL.includes('wide')) return getHighResUrl(rawUrl);
    if (nameL.includes('instax mini evo') && urlL.includes('evo')) return getHighResUrl(rawUrl);

    // DJI Osmo Pocket 3 / Mobile / RS
    if (nameL.includes('pocket 3') && (urlL.includes('pocket-3') || urlL.includes('pocket-4'))) return getHighResUrl(rawUrl);
    if (nameL.includes('osmo mobile') && (urlL.includes('osmo-mobile-7') || urlL.includes('osmo-mobile-8'))) return getHighResUrl(rawUrl);

    // Sony Alpha & FX
    if (nameL.includes('a7 iv') || nameL.includes('alpha 7 iv')) {
      if (urlL.includes('alpha-7-iv') || urlL.includes('a7-iv') || urlL.includes('ilce-7m4') || urlL.includes('a7iv')) return getHighResUrl(rawUrl);
    }
    if (nameL.includes('a7 iii') || nameL.includes('alpha 7 iii')) {
      if (urlL.includes('alpha-7-iii') || urlL.includes('a7iii') || urlL.includes('ilce-7m3')) return getHighResUrl(rawUrl);
    }
    if (nameL.includes('fx30') && (urlL.includes('fx30') || urlL.includes('ilme-fx30'))) return getHighResUrl(rawUrl);
    if (nameL.includes('fx3') && (urlL.includes('fx3') || urlL.includes('ilme-fx3'))) return getHighResUrl(rawUrl);
    if (nameL.includes('zv-e10') && urlL.includes('zv-e10')) return getHighResUrl(rawUrl);
    if (nameL.includes('6600') && urlL.includes('6600')) return getHighResUrl(rawUrl);

    // Sony Lenses
    if (nameL.includes('16-35mm') && urlL.includes('16-35mm')) return getHighResUrl(rawUrl);
    if (nameL.includes('24-70mm') && urlL.includes('24-70mm')) return getHighResUrl(rawUrl);
    if (nameL.includes('70-200mm') && urlL.includes('70-200mm')) return getHighResUrl(rawUrl);
    if (nameL.includes('50mm f/1.2') && urlL.includes('50mm') && urlL.includes('1.2')) return getHighResUrl(rawUrl);
    if (nameL.includes('85mm') && urlL.includes('85mm')) return getHighResUrl(rawUrl);
    if (nameL.includes('90mm') && urlL.includes('90mm')) return getHighResUrl(rawUrl);

    // Canon EOS R5 / R6 / R8 / R10 / R50 / 2000D
    if (nameL.includes('r50') && urlL.includes('r50')) return getHighResUrl(rawUrl);
    if (nameL.includes('2000d') && urlL.includes('2000d')) return getHighResUrl(rawUrl);
    if (nameL.includes('lp-e17') && urlL.includes('lp-e17')) return getHighResUrl(rawUrl);
    if (nameL.includes('np-fz100') && urlL.includes('np-fz100')) return getHighResUrl(rawUrl);

    // Godox Flashes
    if (nameL.includes('v860') && urlL.includes('v860')) return getHighResUrl(rawUrl);
    if (nameL.includes('v1') && urlL.includes('v1')) return getHighResUrl(rawUrl);
    if (nameL.includes('sl60') && urlL.includes('sl60')) return getHighResUrl(rawUrl);
    if (nameL.includes('tl120') && urlL.includes('tl120')) return getHighResUrl(rawUrl);

    // Hollyland / Rode / Shure
    if (nameL.includes('lark') && (urlL.includes('lark') || urlL.includes('wireless-go'))) return getHighResUrl(rawUrl);
    if (nameL.includes('solidcom') && urlL.includes('solidcom')) return getHighResUrl(rawUrl);

    // SmallRig
    if (nameL.includes('smallrig') && urlL.includes('smallrig')) return getHighResUrl(rawUrl);
  }

  return null;
}

async function syncImages() {
  console.log('Fetching products to update with authentic photos from HTML FOR PICS.HTML...');
  const { data: products } = await supabase
    .from('products gearshop')
    .select('id, name, category, image')
    .gte('id', 5000)
    .order('id', { ascending: true });

  let updated = 0;
  for (const p of products) {
    const photo = findExactPhoto(p.name, p.category);
    if (photo && photo !== p.image) {
      const { error } = await supabase
        .from('products gearshop')
        .update({
          image: photo,
          gallery: JSON.stringify([photo])
        })
        .eq('id', p.id);

      if (!error) {
        console.log(`✅ [${p.id}] ${p.name}`);
        console.log(`   -> ${photo}`);
        updated++;
      }
    }
  }

  console.log(`\n🎉 Synchronized ${updated} authentic product photos into Supabase!`);
}

syncImages();
