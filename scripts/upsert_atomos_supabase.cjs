const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gunuqwikqhtllwplzcru.supabase.co';
const supabaseKey = 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';
const supabase = createClient(supabaseUrl, supabaseKey);

async function upsertAtomos() {
  const row = {
    id: 15,
    name: 'Atomos Ninja V 5" 4K HDR + Pack Accessoires (Occasion - Comme Neuf)',
    price: 4500,
    oldPrice: 7500,
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
    desc: 'Atomos Ninja V 5 pouces 4K HDR 1000 nits en état comme neuf. Pack complet comprenant : moniteur Atomos Ninja V, valise rigide de transport, alimentation secteur + dummy battery DC coupler, adaptateurs secteur internationaux, chargeur batterie NP-F + 1 batterie, adaptateur SSD Lunchbox rouge, 2 câbles HDMI (Micro HDMI et Full HDMI) et support fixation cold shoe. Option SSD mSATA 500 Go disponible (+1 000 DH) ou pack complet à 5 500 DH.',
    stars: 5,
    specs: [
      'État : Comme Neuf (Impeccable)',
      'Écran 5" 1000 nits HDR ProRes RAW',
      'Valise Rigide de Transport Incluse',
      'Pack Alimentation + Dummy Battery + Batterie NP-F',
      '2 Câbles HDMI (Micro & Full)',
      'Option SSD 500Go Lunchbox (+1 000 DH)',
      'Garantie 3 Mois GearShop'
    ],
    inStock: true,
    promoEligible: false
  };

  const { data, error } = await supabase.from('products gearshop').upsert([row]);
  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Successfully upserted Atomos Ninja V to Supabase products gearshop table!');
  }
}

upsertAtomos();
