const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

const names = [
  "AF35mm F1.8 Fuji (FX Mount) APS-C - Black",
  "AF50mm F1.8 Nikon (Z Mount) - Black",
  "AF135mm F1.8 Nikon (Z Mount) - Black",
  "AF24mm F1.8 Nikon (Z Mount) - Black",
  "AF35mm F1.8 Nikon (Z Mount) - Black",
  "AF35mm F1.4 Fuji (FX Mount) - Black",
  "AF35mm F1.8 Sony (E Mount) APS-C - Black",
  "AF35mm F1.8 Nikon (Z Mount) APS-C - Black",
  "AF50mm F1.8 Fuji (FX Mount) APS-C - Black",
  "AF40mm F2.5 Sony (E Mount) - Black",
  "AF50mm F1.8 Sony (E Mount) - Black",
  "AF24mm F1.8 Sony (E Mount) - Black",
  "AF50mm F1.8 Sony (E Mount) APS-C - Black",
  "AF50mm F1.8 Nikon (Z Mount) APS-C - Black",
  "AF35mm F1.8 Sony (E Mount) - Black",
  "AF24mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black",
  "AF35mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black",
  "AF50mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black",
  "50mm F1.2 M43 (Panasonic Olympus) - Black",
  "Autofocus adapter for Canon EF - Nikon Z - Black",
  "50mm F1.2 Sony (E Mount) - Black",
  "50mm F1.2 Fuji (FX Mount) - Black",
  "16mm T2.1 Sony (E Mount) - Black",
  "16mm T2.1 Fuji (FX Mount) - Black",
  "16mm T2.1 Canon (EOS-R Mount) - Black",
  "16mm T2.1 M43 (Panasonic Olympus) - Black",
  "16mm T2.1 M43 (Panasonic Olympus) - Titanium Gray",
  "AF135mm F1.8 Sony (E Mount) - Black",
  "16mm T2.1 Sony (E Mount) - Titanium Gray",
  "16mm T2.1 Fuji (FX Mount) - Titanium Gray",
  "16mm T2.1 Canon (EOS-R Mount) - Titanium Gray",
  "50mm F1.2 Nikon (Z Mount) - Black",
  "PL 4-in-1 Lens Adapter compatible with E / L / RF / Z Mount - Silver",
  "77mm True Color VND6-9 Filter - Black",
  "55mm 1/8 Black Mist Filter - Black",
  "AF135mm F1.8 Panasonic/Leica/Sigma (L Mount) - Black"
];

async function reset() {
  for (const name of names) {
    const { error } = await supabase
      .from('products gearshop')
      .update({ gallery: '[]' })
      .eq('name', name);
    if (error) {
      console.log('Error resetting', name, error);
    }
  }
  console.log('Reset complete!');
}

reset();
