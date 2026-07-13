const fs = require('fs');

const dbProducts = JSON.parse(fs.readFileSync('db_image_backup.json', 'utf8'));
const shopifyProducts = JSON.parse(fs.readFileSync('all_shopify_products.json', 'utf8'));

function extractAttributes(name) {
  const attrs = {};
  
  // Focal length (e.g., 10mm, 135mm, 35mm/50mm/75mm)
  const focalMatch = name.match(/(\d+(?:\.\d+)?mm)/);
  if (focalMatch) attrs.focal = focalMatch[1];

  // Aperture (e.g., F1.8, T2.1, F1.4)
  const apertureMatch = name.match(/([FT]\d+\.\d+)/);
  if (apertureMatch) attrs.aperture = apertureMatch[1];
  
  // Series
  if (name.includes('AF')) attrs.series = 'AF';
  else if (name.includes('Spectrum')) attrs.series = 'Spectrum';
  else if (name.includes('Hope')) attrs.series = 'Hope';
  else if (name.includes('Photo')) attrs.series = 'Photo';
  
  // Mount
  if (name.includes('Nikon') || name.includes('Z Mount') || name.includes('Z-mount')) attrs.mount = 'Z';
  else if (name.includes('Sony') || name.includes('E Mount') || name.includes('E-mount')) attrs.mount = 'E';
  else if (name.includes('Canon') || name.includes('EOS-R') || name.includes('RF')) attrs.mount = 'RF';
  else if (name.includes('Fuji') || name.includes('FX Mount')) attrs.mount = 'FX';
  else if (name.includes('M43') || name.includes('Panasonic Olympus')) attrs.mount = 'M43';
  else if (name.includes('L Mount') || name.includes('Leica')) attrs.mount = 'L';
  
  // Color
  if (name.includes('Titanium') || name.includes('Silver')) attrs.color = 'Titanium';
  else if (name.includes('Black')) attrs.color = 'Black';
  
  return attrs;
}

let report = 'ID,Supabase Name,Focal,Aperture,Mount,Shopify Match Handle,Confidence\n';

for (const dbp of dbProducts) {
  const dbAttr = extractAttributes(dbp.name);
  
  let bestMatch = null;
  let bestConfidence = 0;
  
  // Only attempt matching if it's a lens (has focal)
  if (!dbAttr.focal && !dbp.name.includes('Filter') && !dbp.name.includes('Adapter') && !dbp.name.includes('YB-100') && !dbp.name.includes('S100')) {
      report += `"${dbp.id}","${dbp.name}","","","","","0%"\n`;
      continue;
  }
  
  for (const sp of shopifyProducts) {
     const spAttr = extractAttributes(sp.title);
     // We must match at least Focal, Aperture, Series if they exist
     let matchScore = 0;
     let possibleScore = 0;
     
     if (dbAttr.focal) {
       possibleScore++;
       if (spAttr.focal === dbAttr.focal || sp.title.includes(dbAttr.focal)) matchScore++;
     }
     
     if (dbAttr.aperture) {
       possibleScore++;
       if (spAttr.aperture === dbAttr.aperture || sp.title.includes(dbAttr.aperture)) matchScore++;
     }
     
     if (dbAttr.series) {
       possibleScore++;
       if (spAttr.series === dbAttr.series || sp.title.includes(dbAttr.series)) matchScore++;
     }
     
     // strict fail check
     if (dbAttr.focal && spAttr.focal && dbAttr.focal !== spAttr.focal) continue;
     if (dbAttr.aperture && spAttr.aperture && dbAttr.aperture !== spAttr.aperture) continue;
     if (dbAttr.series && spAttr.series && dbAttr.series !== spAttr.series) continue;

     if (possibleScore > 0 && matchScore === possibleScore) {
       bestMatch = sp.handle;
       bestConfidence = 100;
       break;
     }
  }
  
  if (bestConfidence === 100) {
      report += `"${dbp.id}","${dbp.name}","${dbAttr.focal||''}","${dbAttr.aperture||''}","${dbAttr.mount||''}","${bestMatch}","100%"\n`;
  } else {
      report += `"${dbp.id}","${dbp.name}","${dbAttr.focal||''}","${dbAttr.aperture||''}","${dbAttr.mount||''}","","0%"\n`;
  }
}

fs.writeFileSync('match_report.csv', report);
console.log('match_report.csv generated.');
