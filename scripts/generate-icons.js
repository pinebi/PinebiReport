const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const svgContent = fs.readFileSync('./public/icons/icon.svg', 'utf8');
  
  const sizes = [144, 192, 512];
  
  for (const size of sizes) {
    try {
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(`./public/icons/icon-${size}x${size}.png`);
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating icon-${size}x${size}.png:`, error.message);
    }
  }
}

generateIcons().catch(console.error);






