const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function processImage() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();

  const srcPath = path.join(__dirname, '../scratch_pocket4pro.jpg');
  const b64 = fs.readFileSync(srcPath).toString('base64');

  const html = `
    <!DOCTYPE html>
    <html>
      <head><style>body { margin: 0; padding: 0; background: transparent; }</style></head>
      <body>
        <canvas id="canvasBody" width="600" height="900"></canvas>
        <script>
          const img = new Image();
          img.onload = () => {
            const bodyCanvas = document.getElementById('canvasBody');
            const bCtx = bodyCanvas.getContext('2d');
            bCtx.imageSmoothingEnabled = true;
            bCtx.imageSmoothingQuality = 'high';

            // Measured exact single body bbox:
            const cropX = 158;
            const cropY = 328;
            const cropW = 290;
            const cropH = 705;
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropW;
            tempCanvas.height = cropH;
            const tCtx = tempCanvas.getContext('2d');
            tCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

            // Clean background with defringing / color decontamination
            const imgData = tCtx.getImageData(0, 0, cropW, cropH);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              const r = d[i], g = d[i+1], b = d[i+2];
              const brightness = (r + g + b) / 3;
              
              if (brightness > 210) {
                // Background pixel
                d[i+3] = 0;
              } else if (brightness > 130 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
                // Semi-light gray fringe pixel on edge: decontaminate white and fade
                const alpha = Math.max(0, Math.min(1, (210 - brightness) / 80));
                d[i+3] = Math.round(d[i+3] * alpha);
                // Darken fringe pixel to remove white halo
                d[i] = Math.round(d[i] * 0.4);
                d[i+1] = Math.round(d[i+1] * 0.4);
                d[i+2] = Math.round(d[i+2] * 0.4);
              }
            }
            tCtx.putImageData(imgData, 0, 0);

            // Draw centered on 600x900 canvas
            const targetH = 750;
            const targetW = (cropW / cropH) * targetH;
            const targetX = (600 - targetW) / 2;
            const targetY = (900 - targetH) / 2;
            bCtx.drawImage(tempCanvas, 0, 0, cropW, cropH, targetX, targetY, targetW, targetH);

            window.renderComplete = true;
          };
          img.src = 'data:image/jpeg;base64,${b64}';
        </script>
      </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForFunction(() => window.renderComplete === true, { timeout: 10000 });

  const bodyDataUrl = await page.evaluate(() => {
    return document.getElementById('canvasBody').toDataURL('image/png');
  });

  const savePng = (dataUrl, filePath) => {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  };

  const prodDir = path.join(__dirname, '../public/images/products');
  savePng(bodyDataUrl, path.join(prodDir, 'dji-osmo-pocket-4-pro-3.png'));
  console.log('Saved dji-osmo-pocket-4-pro-3.png with halo decontamination');

  await browser.close();
}

processImage()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
