const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'ai', 'products.json');
const json = JSON.parse(fs.readFileSync(file, 'utf8'));

const newProduct = {
  id: 15,
  name: 'Atomos Ninja V 5" 4K HDR + Pack Accessoires (Occasion - Comme Neuf)',
  category: 'Occasion & Déstockage',
  brand: 'Atomos',
  price: 4500,
  currency: 'MAD',
  inStock: true,
  condition: 'Occasion - Comme Neuf',
  warranty: '3 mois GearShop',
  description: 'Moniteur-enregistreur 5 pouces 4K HDR 1000 nits Atomos Ninja V en état comme neuf avec valise rigide, alimentation secteur, dummy battery, chargeur batterie NP-F + 1 batterie, adaptateur Lunchbox SSD rouge, 2 câbles HDMI (Micro et Full) et monture cold shoe. Option SSD 500Go disponible (+1000 DH) ou Pack Complet 5500 DH.',
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
  console.log('Successfully added Atomos Ninja V to public/ai/products.json!');
} else {
  console.log('No products array found in products.json');
}
