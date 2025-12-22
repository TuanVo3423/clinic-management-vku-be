// copy-data.js
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'data');
const destDir = path.join(__dirname, 'dist', 'data');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

fs.readdirSync(srcDir).forEach(file => {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
});

console.log('✅ Data files copied to dist/data');
