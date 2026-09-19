const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gunuqwikqhtllwplzcru.supabase.co';
const supabaseKey = 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePrice() {
  const row = {
    id: 15,
    name: 'Atomos Ninja V 5" 4K HDR + Pack Complet (SSD 500Go Lunchbox, Valise, Batterie, 2x HDMI) - Comme Neuf',
    price: 5500,
    oldPrice: 8500,
    rentPrice: null,
    category: 'occasion',
    image: '/images/products/atomos-ninja-v-occasion-kit.jpg',
    gallery: [
      '/images/products/atomos-ninja-v-occasion-kit.jpg',
      '/images/products/atomos-ninja-v-occasion-camera.jpg',
      '/images/products/atomos-ninja-v-occasion-lunchbox.jpg',
      '/images/products/atomos-ninja-v-occasion-ssd.jpg'
    ],
    video: '',
    desc: 'Atomos Ninja V 5 pouces 4K HDR 1000 nits en état comme neuf (impeccable). Pack complet "prêt à tourner" comprenant : moniteur Atomos Ninja V, SSD mSATA 500 Go dans boîtier Lunchbox compact rouge, valise rigide de transport étanche, alimentation secteur officielle + dummy battery DC coupler, adaptateurs secteur internationaux, batterie NP-F + chargeur dédié, 2 câbles HDMI professionnels (Micro HDMI et Full HDMI) et rotule fixation cold shoe.',
    stars: 5,
    specs: [
      'État : Comme Neuf (Impeccable)',
      'Écran 5" 1000 nits HDR ProRes RAW',
      'SSD 500 Go mSATA Lunchbox Rouge Inclus',
      'Valise Rigide de Transport Incluse',
      'Alimentation Secteur + Dummy Battery DC Coupler',
      'Batterie NP-F + Chargeur Inclus',
      '2 Câbles HDMI (Micro HDMI & Full HDMI)',
      'Garantie 3 Mois GearShop'
    ],
    inStock: true,
    promoEligible: false
  };

  const { data, error } = await supabase.from('products gearshop').upsert([row]);
  if (error) {
    console.error('Supabase update error:', error);
  } else {
    console.log('Successfully updated Atomos Ninja V price to 5500 DH in Supabase DB!');
  }
}

updatePrice();
