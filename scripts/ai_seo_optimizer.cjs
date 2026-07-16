const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const cinemaLensIds = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007];

async function run() {
  console.log('Fetching Cinema Lenses from Supabase...');
  const { data: lenses, error } = await supabase
    .from('products gearshop')
    .select('id, name, desc')
    .in('id', cinemaLensIds);

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  console.log(`Found ${lenses.length} lenses. Optimizing with Geo/AI SEO content...`);

  for (const lens of lenses) {
    const is35mm = lens.name.includes('35mm');
    const focalLength = is35mm ? '35mm' : '50mm';
    const mountMatch = lens.name.match(/\((.*?)\)/);
    const mount = mountMatch ? mountMatch[1] : 'votre appareil';

    const seoBlock = `
<div class="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
  <h3 class="text-xl font-bold text-gray-900 mb-3">Lentille Cinéma ${focalLength} T2.0 pour ${mount} - Disponible au Maroc</h3>
  <p class="text-gray-700 leading-relaxed mb-4">
    Découvrez la puissance de la lentille cinéma <strong>7Artisans ${focalLength} T2.0</strong>, conçue spécifiquement pour les productions vidéo professionnelles exigeantes. GearShop, votre revendeur officiel au Maroc (basé à Casablanca), vous propose cette optique incontournable pour les montures <strong>${mount}</strong>.
  </p>
  <ul class="list-disc pl-5 text-gray-700 mb-4 space-y-2">
    <li><strong>Rendu Cinématographique :</strong> Un T-stop de T2.0 permettant de filmer en conditions de basse lumière avec un bokeh crémeux et naturel, parfait pour les tournages au Maroc.</li>
    <li><strong>Conception Professionnelle :</strong> Bagues d'ouverture et de mise au point crantées (0.8 MOD) compatibles avec tous les systèmes de Follow Focus standards du marché.</li>
    <li><strong>Focus Breathing Minime :</strong> Idéal pour les transitions de point fluides sans déformation du cadre lors de vos vidéos commerciales ou documentaires.</li>
  </ul>
  <p class="text-gray-700 font-medium">
    📍 <a href="/magasin-casablanca" class="text-indigo-600 hover:underline">Testez cet objectif dans notre boutique à Casablanca</a> ou profitez de la livraison express partout au Maroc (Rabat, Marrakech, Tanger, etc.).
  </p>
</div>
`;

    // Only append if not already there
    let newDesc = lens.desc || '';
    if (!newDesc.includes('Lentille Cinéma')) {
      newDesc = newDesc + seoBlock;
      
      const { error: updateError } = await supabase
        .from('products gearshop')
        .update({ desc: newDesc })
        .eq('id', lens.id);
        
      if (updateError) {
        console.error(`Failed to update lens ${lens.id}:`, updateError);
      } else {
        console.log(`✅ Successfully optimized SEO for: ${lens.name}`);
      }
    } else {
      console.log(`⏩ Already optimized: ${lens.name}`);
    }
  }

  console.log('AI/Geo SEO Optimization Complete!');
}

run();
