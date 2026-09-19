const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, filePath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(filePath, buf);
        console.log(`Saved ${buf.length} bytes to ${filePath}`);
        resolve(buf);
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

const lights = [
  {
    name: 'YM 350',
    file: 'ym-350.webp',
    url: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/2025060617165969C379C73A0204C9_b.jpg'
  },
  {
    name: 'YB-300R',
    file: 'yb-300r.webp',
    url: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/202507261324366A68649B911A5220_b.jpg'
  },
  {
    name: 'YB-100R',
    file: 'yb-100r.webp',
    url: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/20240319173149416DF92390F5C3A7_b.webp'
  },
  {
    name: 'S100 W portable',
    file: 's100-w-portable.webp',
    url: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/202410161549379C4705A19E57E8B5_b.jpg'
  },
  {
    name: 'Y300S',
    file: 'y300s.webp',
    url: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/20240319171843802F1E3F22F87FE6_b.webp'
  },
  {
    name: 'Panel P-500',
    file: 'panel-p-500.webp',
    url: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/20240319170443F599C75DE4A68CC2_s.webp'
  },
  {
    name: 'BKL400Bi Bi-Color',
    file: 'bkl400bi-bi-color.webp',
    url: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/2024031917094038E8FE10EB0A76EE_b.webp'
  },
  {
    name: 'P-60S Spotlight',
    file: 'p-60s-spotlight.webp',
    url: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/product/20240319172605E856942DA5A96791_b.webp'
  }
];

async function run() {
  for (const item of lights) {
    const dest = path.join(process.cwd(), 'public/images/products', item.file);
    console.log(`Downloading authentic lighting asset for ${item.name}...`);
    try {
      await download(item.url, dest);
    } catch (e) {
      console.error(`Error on ${item.name}:`, e.message);
    }
  }
}

run();
