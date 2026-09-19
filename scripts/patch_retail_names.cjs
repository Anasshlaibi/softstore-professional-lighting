const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

const SPECIFIC_CLEAN_NAMES = {
  5094: 'Nikon Z30 Kit + Objectif Nikkor Z DX 16-50mm f/3.5-6.3 VR',
  5095: 'Nikon Z50 II Kit + Objectif Nikkor Z DX 16-50mm VR',
  5096: 'Nikon Z5 II (Boîtier Nu)',
  5097: 'Nikon Z5 II Kit + Objectif Nikkor Z 24-50mm f/4-6.3',
  5098: 'Nikon Z5 II Kit + Objectif Nikkor Z 24-50mm f/4-6.3',
  5099: 'Nikon Boîtier Hybride Z fc / ZR (Noir)',
  5100: 'Nikon Coolpix P1100 (Noir)',
  5101: 'Nikon Boîtier Hybride Z6 III (Noir)',
  5102: 'Nikon Boîtier Hybride Pro Z9 (Noir)',
  5110: 'Sony ZV-E10 Kit + Objectif 16-50mm f/3.5-5.6',
  5111: 'Sony ZV-E10 Mark II Kit + Objectif 16-50mm',
  5112: 'Sony Alpha 7 III (Boîtier Nu)',
  5113: 'Sony Alpha 7 V / ILCE-7M5',
  5114: 'Sony Cinema Line FX30 (Boîtier Nu)',
  5115: 'Sony Alpha 7 IV (Boîtier Nu)',
  5116: 'Sony Alpha 6600 + Objectif 18-135mm',
  5117: 'Sony Alpha 7 IV Kit + Objectif 28-70mm',
  5118: 'Sony Alpha 7S III (Boîtier Nu)',
  5120: 'Sony Cinema Line FX3 (Boîtier Nu)',
  6001: 'Canon EOS R50 + Objectif RF-S 18-45mm IS STM',
  6002: 'Canon Cinema EOS C50 (Boîtier Nu)',
  6003: 'Canon Cinema EOS R5 C (Boîtier Nu)',
  6004: 'Canon EOS R5 Mark II (Boîtier Nu)',
  6005: 'Canon EOS R5 Mark II + Objectif RF 24-105mm L IS USM',
  6006: 'Canon EOS 2000D + Objectif EF-S 18-55mm IS II',
  6007: 'Canon EOS R10 + Objectif RF-S 18-150mm IS STM',
  6024: 'DJI Osmo Pocket 3 Creator Combo',
  6025: 'DJI Osmo Mobile 7 Stabilisateur Smartphone',
  6026: 'DJI Osmo Mobile 7P Stabilisateur Smartphone',
  5053: 'Insta360 Ace Pro 2 Kit Standard (Noir)',
  5054: 'Insta360 X5 Kit Standard 360 (Noir)',
  5055: 'Insta360 GO Ultra Kit Standard (Noir)',
};

async function patch() {
  for (const [idStr, cleanName] of Object.entries(SPECIFIC_CLEAN_NAMES)) {
    const id = parseInt(idStr, 10);
    await supabase.from('products gearshop').update({ name: cleanName }).eq('id', id);
  }
  console.log('✅ Specific names patched cleanly!');
}

patch();
