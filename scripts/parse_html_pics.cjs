const fs = require('fs');

const content = fs.readFileSync('C:/Users/HELIOS NEO 16/Documents/softstore-professional-lighting-main/HTML FOR PICS.HTML', 'utf-8');

console.log('File length:', content.length);

// Extract all image tags and also product titles / links
const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
const altRegex = /alt=["']([^"']*)["']/i;

const images = [];
let match;
while ((match = imgRegex.exec(content)) !== null) {
  const fullTag = match[0];
  const src = match[1];
  const altMatch = fullTag.match(altRegex);
  const alt = altMatch ? altMatch[1] : '';

  if (src && (src.includes('wp-content/uploads') || src.includes('kamerty.ma')) && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
    images.push({ src, alt, fullTag });
  }
}

console.log(`Found ${images.length} equipment images in HTML FOR PICS.HTML:`);
images.slice(0, 30).forEach((img, i) => {
  console.log(`${i + 1}. [${img.alt}] -> ${img.src}`);
});
