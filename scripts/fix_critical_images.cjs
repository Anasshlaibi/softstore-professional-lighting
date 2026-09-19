const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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

async function run() {
  // 1. Download official 7Artisans 135mm F1.8 lens image
  const lens135Url = 'https://cdn.shopify.com/s/files/1/0555/8504/6736/files/1_9a398dbc-8564-4118-90c3-d96012864bad.jpg?v=1779179185';
  console.log('Downloading 7Artisans AF 135mm F1.8 official photo...');
  await download(lens135Url, path.join(process.cwd(), 'public/images/products/af135mm-f1-8-sony-e-mount-black.webp'));
  await download(lens135Url, path.join(process.cwd(), 'public/images/products/af135mm-f1-8-nikon-z-mount-black.webp'));
  await download(lens135Url, path.join(process.cwd(), 'public/images/products/af135mm-f1-8-panasonic-leica-sigma-l-mount-black.webp'));

  // 2. Fix Sony Alpha 7 III image (copy from Sony Alpha 7 body)
  const a7BodySrc = path.join(process.cwd(), 'public/images/products/sony-alpha-7-v-ilce-7m5.webp');
  const a7IIIPath = path.join(process.cwd(), 'public/images/products/sony-alpha-7-iii.webp');
  if (fs.existsSync(a7BodySrc)) {
    fs.copyFileSync(a7BodySrc, a7IIIPath);
    console.log(`Copied clean Sony Alpha 7 body image to ${a7IIIPath}`);
  }
}

run().catch(console.error);
