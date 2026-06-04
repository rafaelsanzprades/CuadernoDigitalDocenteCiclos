const fs = require('fs');
const content = fs.readFileSync('src/services/demoSeed.ts', 'utf8');
const updated = content
  .replace(/"RA01"/g, '"RA1"')
  .replace(/"RA02"/g, '"RA2"')
  .replace(/"RA03"/g, '"RA3"')
  .replace(/"RA04"/g, '"RA4"')
  .replace(/"RA05"/g, '"RA5"')
  .replace(/"RA06"/g, '"RA6"')
  .replace(/Ra01/g, 'RA1')
  .replace(/Ra02/g, 'RA2')
  .replace(/"horas_totales": 167/g, '"horas_totales": 165');
fs.writeFileSync('src/services/demoSeed.ts', updated);
