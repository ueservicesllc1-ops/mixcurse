const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'index.html');
console.log('Leyendo archivo...');
let content = fs.readFileSync(filePath, 'utf8');

// Fix relative paths: ../offline-integration.js -> offline-integration.js
content = content.replace(/\.\.\/offline-integration\.js/g, 'offline-integration.js');
content = content.replace(/\.\.\/additional-functions\.js/g, 'additional-functions.js');
content = content.replace(/\.\.\/assets\//g, 'assets/');

// Fix sw.js registration path (already relative, keep as is)
// Fix manifest path (already relative)

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Rutas corregidas correctamente en www/index.html');
