#!/usr/bin/env node
// Simple splash generator using sharp to rasterize the SVG into PNG for Expo splash
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  try {
    const root = path.join(__dirname, '..');
    const svgPath = path.join(root, 'assets', 'splash.svg');
    const outPng = path.join(root, 'assets', 'splash.png');
    if (!fs.existsSync(svgPath)) {
      console.error('splash.svg not found');
      process.exit(1);
    }
    await sharp(svgPath)
      .resize(2048, 2048, { fit: 'cover', position: 'centre' })
      .png()
      .toFile(outPng);
    console.log('✅ Generated splash.png from splash.svg');
  } catch (e) {
    console.error('Failed generating splash:', e);
    process.exit(1);
  }
})();
