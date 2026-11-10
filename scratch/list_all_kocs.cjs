const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));

const kocList = new Set();
formatted.forEach(r => {
  if (r[3]) kocList.add(r[3].trim());
});

console.log('All KOC names:');
Array.from(kocList).sort().forEach(k => console.log(' -', k));

