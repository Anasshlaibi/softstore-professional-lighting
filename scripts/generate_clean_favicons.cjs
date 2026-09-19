const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function generateFavicons() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();

  const logoGearshopPath = path.join(__dirname, '../public/logo_gearshop.png');
  const logoB64 = fs.readFileSync(logoGearshopPath).toString('base64');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>body { margin: 0; padding: 0; background: transparent; }</style>
      </head>
      <body>
        <canvas id="canvasFavicon" width="512" height="512"></canvas>
        <canvas id="canvasFullLogo" width="1024" height="1024"></canvas>
        <script>
          const img = new Image();
          img.onload = () => {
            // 1. Draw Favicon / App Icon (Aperture G symbol centered inside a pristine white circle with safe-zone margin)
            const favCanvas = document.getElementById('canvasFavicon');
            const fCtx = favCanvas.getContext('2d');
            fCtx.imageSmoothingEnabled = true;
            fCtx.imageSmoothingQuality = 'high';

            fCtx.clearRect(0, 0, 512, 512);
            
            // Draw clean white circular background badge
            fCtx.beginPath();
            fCtx.arc(256, 256, 248, 0, Math.PI * 2);
            fCtx.fillStyle = '#FFFFFF';
            fCtx.fill();
            
            // Subtle premium border ring
            fCtx.lineWidth = 4;
            fCtx.strokeStyle = '#E2E8F0';
            fCtx.stroke();

            // Exact G emblem BBox:
            // sx: 337, sy: 100, sw: 668, sh: 549
            const sX = 337;
            const sY = 100;
            const sW = 668;
            const sH = 549;

            // Target size in 512x512 canvas:
            // Emblem width: 280px, height ~230px centered at (256, 256)
            const targetW = 280;
            const targetH = (sH / sW) * targetW; // ~230px
            const targetX = (512 - targetW) / 2;
            const targetY = (512 - targetH) / 2;
            
            fCtx.drawImage(img, sX, sY, sW, sH, targetX, targetY, targetW, targetH);

            // 2. Draw Full Logo (Square 1024x1024 for logo.png / schema / open-graph)
            const fullCanvas = document.getElementById('canvasFullLogo');
            const fullCtx = fullCanvas.getContext('2d');
            fullCtx.imageSmoothingEnabled = true;
            fullCtx.imageSmoothingQuality = 'high';
            fullCtx.fillStyle = '#FFFFFF';
            fullCtx.fillRect(0, 0, 1024, 1024);

            // Center the entire logo with elegant padding
            const targetFullW = 900;
            const targetFullH = (img.height / img.width) * targetFullW;
            const targetFullX = (1024 - targetFullW) / 2;
            const targetFullY = (1024 - targetFullH) / 2;
            fullCtx.drawImage(img, 0, 0, img.width, img.height, targetFullX, targetFullY, targetFullW, targetFullH);

            window.renderComplete = true;
          };
          img.src = 'data:image/png;base64,${logoB64}';
        </script>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  await page.waitForFunction(() => window.renderComplete === true, { timeout: 10000 });

  const { favDataUrl, fullLogoDataUrl } = await page.evaluate(() => {
    return {
      favDataUrl: document.getElementById('canvasFavicon').toDataURL('image/png'),
      fullLogoDataUrl: document.getElementById('canvasFullLogo').toDataURL('image/png'),
    };
  });

  const savePng = (dataUrl, filePath) => {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  };

  const publicDir = path.join(__dirname, '../public');

  // Save 512x512
  savePng(favDataUrl, path.join(publicDir, 'favicon-512x512.png'));
  console.log('Saved favicon-512x512.png');

  // Save full logo.png
  savePng(fullLogoDataUrl, path.join(publicDir, 'logo.png'));
  console.log('Saved logo.png');

  // Generate smaller sizes (192, 48, 32, 16, apple-touch-icon 180)
  const sizes = [
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  for (const s of sizes) {
    const resizedDataUrl = await page.evaluate((size) => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(document.getElementById('canvasFavicon'), 0, 0, size, size);
      return c.toDataURL('image/png');
    }, s.size);
    savePng(resizedDataUrl, path.join(publicDir, s.name));
    console.log(`Saved ${s.name}`);
  }

  // Also save favicon.ico
  const ico32Buffer = fs.readFileSync(path.join(publicDir, 'favicon-32x32.png'));
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32Buffer);
  console.log('Saved favicon.ico');

  await browser.close();
  console.log('All favicons & logo.png generated successfully!');
}

generateFavicons()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
