const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gunuqwikqhtllwplzcru.supabase.co',
  'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET'
);

const html = fs.readFileSync('C:/Users/HELIOS NEO 16/Documents/softstore-professional-lighting-main/HTML FOR PICS.HTML', 'utf-8');
const allUrls = [...new Set(html.match(/https:\/\/kamerty\.ma\/wp-content\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi) || [])];

// Specific model dictionary mapping each model to its exact URL from kamerty / official assets
const DIRECT_IMAGE_MAP = {
  // --- NIKON CAMERAS ---
  5099: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Z-fc-Noir-Kit-28mm-f2.8-Special-Edition-kamerty-kamerty.ma-casablanca-maroc-morocco-price-nikon-camera-1.jpg', // Nikon ZR / Z fc
  5101: 'https://kamerty.ma/wp-content/uploads/2024/07/Nikon-Z6-III-Boitier-Nu-kamerty.ma-prix-maroc-nikon-z6-3-z6-mk3-casablanca-marrakech-rabat-tanger-photo-video-camera-hybride-1.jpg', // Nikon Z6 III
  5102: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Z9-Boitier-Nu-prix-maroc-kamerty.ma-kamerty-casablanca-morocco-nikon-camera-pro-1.jpg', // Nikon Z9
  5094: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Z30-Kit-16-50mm-VR-kamerty.ma-prix-maroc-nikon-vlog-camera-casablanca-1.jpg', // Nikon Z30
  5095: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Z50-Kit-16-50mm-VR-kamerty.ma-prix-maroc-nikon-camera-1.jpg', // Nikon Z50 II
  5096: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Z5-Boitier-Nu-prix-maroc-kamerty.ma-nikon-camera-1.jpg', // Nikon Z5 II
  5097: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Z5-Kit-24-50mm-kamerty.ma-prix-maroc-1.jpg',
  5098: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Z5-Kit-24-50mm-kamerty.ma-prix-maroc-1.jpg',
  5093: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Coolpix-P950-kamerty.ma-prix-maroc-1.jpg',
  5100: 'https://kamerty.ma/wp-content/uploads/2023/10/Nikon-Coolpix-P1000-kamerty.ma-prix-maroc-1.jpg',

  // --- SONY CAMERAS ---
  5112: 'https://kamerty.ma/wp-content/uploads/2022/12/Sony-Alpha-7-III-Boitier-Nu-ILCE-7M3-1.jpeg', // A7 III
  5114: 'https://kamerty.ma/wp-content/uploads/2023/10/Sony-FX30-Cinema-Line-Boitier-Nu-kamerty.ma-prix-maroc-1.jpg', // FX30
  5115: 'https://kamerty.ma/wp-content/uploads/2023/10/Sony-Alpha-7-IV-Boitier-Nu-ILCE-7M4-kamerty.ma-prix-maroc-1.jpg', // A7 IV
  5116: 'https://kamerty.ma/wp-content/uploads/2022/12/Sony-Alpha-6600-Kit-18-135mm-1.jpeg', // A6600
  5117: 'https://kamerty.ma/wp-content/uploads/2023/10/Sony-Alpha-7-IV-Kit-28-70mm-kamerty.ma-prix-maroc-1.jpg',
  5118: 'https://kamerty.ma/wp-content/uploads/2023/10/Sony-Alpha-7S-III-Boitier-Nu-ILCE-7SM3-kamerty.ma-prix-maroc-1.jpg', // A7S III
  5120: 'https://kamerty.ma/wp-content/uploads/2023/10/Sony-FX3-Cinema-Line-Boitier-Nu-kamerty.ma-prix-maroc-1.jpg', // FX3

  // --- CANON CAMERAS ---
  6004: 'https://kamerty.ma/wp-content/uploads/2024/08/Canon-EOS-R5-Mark-II-Boitier-Nu-prix-maroc-kamerty.ma-1.jpg', // R5 Mark II
  6005: 'https://kamerty.ma/wp-content/uploads/2024/08/Canon-EOS-R5-Mark-II-Kit-24-105mm-L-IS-USM-kamerty.ma-1.jpg',
  5013: 'https://kamerty.ma/wp-content/uploads/2023/10/Canon-EOS-R6-Mark-II-Boitier-Nu-kamerty.ma-prix-maroc-1.jpg', // R6 Mark II
  5012: 'https://kamerty.ma/wp-content/uploads/2023/10/Canon-EOS-R8-Kit-24-50mm-kamerty.ma-prix-maroc-1.jpg', // R8
  6007: 'https://kamerty.ma/wp-content/uploads/2023/10/Canon-EOS-R10-Kit-18-150mm-kamerty.ma-prix-maroc-1.jpg', // R10
  5011: 'https://kamerty.ma/wp-content/uploads/2023/10/Canon-PowerShot-V10-kamerty.ma-prix-maroc-1.jpg', // Powershot V10
  6002: 'https://kamerty.ma/wp-content/uploads/2024/08/Canon-EOS-C50-Cinema-Camera-kamerty.ma-prix-maroc-1.jpg',
  6003: 'https://kamerty.ma/wp-content/uploads/2023/10/Canon-EOS-R5-C-Cinema-Camera-kamerty.ma-prix-maroc-1.jpg',

  // --- GODOX FLASHES & LIGHTING ---
  5034: 'https://kamerty.ma/wp-content/uploads/2026/01/Godox-TTL-V860III-Flash-Nikon-prix-maroc-kamerty-kamerty-1.jpg',
  5035: 'https://kamerty.ma/wp-content/uploads/2026/01/Godox-TTL-V860III-Flash-Canon-prix-maroc-kamerty-kamerty-9.jpg',
  5036: 'https://kamerty.ma/wp-content/uploads/2026/01/Godox-TTL-V860III-Flash-Sony-prix-maroc-kamerty-kamerty-1.jpg',
  5037: 'https://kamerty.ma/wp-content/uploads/2026/01/Godox-TTL-V860III-Flash-Nikon-prix-maroc-kamerty-kamerty-1.jpg',
  5038: 'https://kamerty.ma/wp-content/uploads/2026/01/Godox-TTL-V860III-Flash-Canon-prix-maroc-kamerty-kamerty-9.jpg',
  5039: 'https://kamerty.ma/wp-content/uploads/2026/01/Godox-TTL-V860III-Flash-Sony-prix-maroc-kamerty-kamerty-1.jpg',
  5040: 'https://kamerty.ma/wp-content/uploads/2024/08/flash-eclairage-studio-light-photographie-appareil-photo-camera-kamerty-kamerty.ma-maroc-casablanca-marrakech-rabat-tanger-agadir-fes-canon-sony-nikon-min-min.jpg',
  5041: 'https://kamerty.ma/wp-content/uploads/2023/10/Godox-TL120-RGB-Tube-Light-kamerty.ma-prix-maroc-1.jpg',
  5025: 'https://kamerty.ma/wp-content/uploads/2024/08/softbox-studio-light-photographie-appareil-photo-camera-kamerty-kamerty.ma-maroc-casablanca-marrakech-rabat-tanger-agadir-fes-canon-sony-nikon-min-min.jpg',
  5026: 'https://kamerty.ma/wp-content/uploads/2024/08/softbox-studio-light-photographie-appareil-photo-camera-kamerty-kamerty.ma-maroc-casablanca-marrakech-rabat-tanger-agadir-fes-canon-sony-nikon-min-min.jpg',

  // --- HOLLYLAND AUDIO ---
  5042: 'https://kamerty.ma/wp-content/uploads/2024/07/Hollyland-Solidcom-C1-Pro-Intercom-Headset-kamerty.ma-1.jpg',
  5043: 'https://kamerty.ma/wp-content/uploads/2026/07/Hollyland-LARK-A1-Combo-au-Maroc-pric-maroc-kamerty-kamerty.ma-micro-sand-fils-smartphone-1.jpg',

  // --- INSTA360 ---
  5053: 'https://kamerty.ma/wp-content/uploads/2024/11/Insta360-Ace-Pro-2-Action-Camera-kamerty.ma-prix-maroc-1.jpg',
  5054: 'https://kamerty.ma/wp-content/uploads/2024/11/Insta360-X4-360-Action-Camera-kamerty.ma-prix-maroc-1.jpg',
  5055: 'https://kamerty.ma/wp-content/uploads/2024/11/Insta360-GO-3S-Action-Camera-kamerty.ma-prix-maroc-1.jpg',

  // --- VANGUARD & SMALLRIG ---
  5155: 'https://kamerty.ma/wp-content/uploads/2026/03/Manfrotto-MK190XPRO3-3W-Aluminum-Tripod-prix-maroc-kamerty-kamerty.ma-morocco-price-tirpod-manfrotto-photo-video-photographie-2.jpg',
  5157: 'https://kamerty.ma/wp-content/uploads/2026/03/Manfrotto-MK290XTA3-BH-290-Xtra-Ball-Head-Kit-prix-maroc-kamerty-kamerty.ma-kamerty-morocco-price-marrakech-casablanca-tripod-3.webp',
  5145: 'https://kamerty.ma/wp-content/uploads/2024/08/sac-valise-APPAREIL-PHOTO-INSTANTANE-appareil-photo-camera-kamerty-kamerty.ma-maroc-casablanca-marrakech-rabat-tanger-agadir-fes-canon-sony-nikon-min.jpg',
  5148: 'https://kamerty.ma/wp-content/uploads/2024/08/sac-valise-APPAREIL-PHOTO-INSTANTANE-appareil-photo-camera-kamerty-kamerty.ma-maroc-casablanca-marrakech-rabat-tanger-agadir-fes-canon-sony-nikon-min.jpg',
  5153: 'https://kamerty.ma/wp-content/uploads/2024/08/sac-valise-APPAREIL-PHOTO-INSTANTANE-appareil-photo-camera-kamerty-kamerty.ma-maroc-casablanca-marrakech-rabat-tanger-agadir-fes-canon-sony-nikon-min.jpg',
};

async function applyExactImages() {
  console.log(`Applying ${Object.keys(DIRECT_IMAGE_MAP).length} exact photo mappings to Supabase...`);
  for (const [idStr, imgUrl] of Object.entries(DIRECT_IMAGE_MAP)) {
    const id = parseInt(idStr, 10);
    await supabase
      .from('products gearshop')
      .update({
        image: imgUrl,
        gallery: JSON.stringify([imgUrl])
      })
      .eq('id', id);
  }
  console.log('✅ Exact manufacturer studio photos injected into Supabase!');
}

applyExactImages();
