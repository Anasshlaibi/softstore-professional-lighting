const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'ai', 'products.json');
const json = JSON.parse(fs.readFileSync(file, 'utf8'));

const newProduct = {
  id: 15,
  name: 'Atomos Ninja V 5" 4K HDR + Pack Complet (SSD 500Go Lunchbox, Valise, Batterie, 2x HDMI) - Comme Neuf',
  category: 'Occasion & Déstockage',
  brand: 'Atomos',
  price: 5500,
  currency: 'MAD',
  inStock: true,
  condition: 'Occasion - Comme Neuf',
  warranty: '3 mois GearShop',
  description: 'Moniteur-enregistreur 5 pouces 4K HDR 1000 nits Atomos Ninja V en état comme neuf (pack complet prêt à tourner). Comprend SSD 500Go Lunchbox rouge, valise rigide étanche, alimentation secteur, dummy battery DC coupler, batterie NP-F + chargeur dédié, 2 câbles HDMI professionnels (Micro HDMI et Full HDMI) et rotule fixation cold shoe.',
  image: 'https://www.gearshop.ma/images/products/atomos-ninja-v-occasion-kit.jpg',
  url: 'https://www.gearshop.ma/product/15-atomos-ninja-v-5-4k-hdr-pack-accessoires-occasion-comme-neuf'
};

if (Array.isArray(json.products)) {
  const existingIdx = json.products.findIndex(p => p.id === 15 || (p.name && p.name.includes('Atomos Ninja V')));
  if (existingIdx !== -1) {
    json.products[existingIdx] = newProduct;
  } else {
    json.products.unshift(newProduct);
  }
  fs.writeFileSync(file, JSON.stringify(json, null, 2), 'utf8');
  console.log('Successfully updated Atomos Ninja V to 5500 DH in public/ai/products.json!');
}
