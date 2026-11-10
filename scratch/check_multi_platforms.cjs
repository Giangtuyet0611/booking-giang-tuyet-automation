const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));

const slotDefs = [
  { typeCol: 8, name: 'slot1' },
  { typeCol: 17, name: 'slot2' },
  { typeCol: 26, name: 'slot3' },
  { typeCol: 35, name: 'slot4' },
  { typeCol: 44, name: 'slot5' },
  { typeCol: 53, name: 'slot6' },
  { typeCol: 62, name: 'slot7' },
];

for (let r = 0; r < formatted.length; r++) {
  const rowF = formatted[r];
  const types = slotDefs.map(s => rowF[s.typeCol]).filter(t => t && t.trim());
  
  const platforms = new Set();
  types.forEach(t => {
    if (/tiktok/i.test(t)) platforms.add('TikTok');
    else if (/facebook|facbook|instagram|reels|post/i.test(t)) {
      if (rowF[6] === 'Threads' || t.toLowerCase() === 'threads' || (t.toLowerCase() === 'post' && rowF[6] === 'Threads')) {
        platforms.add('Threads');
      } else {
        platforms.add('FB/IG');
      }
    } else if (/youtube/i.test(t)) {
      platforms.add('Youtube');
    } else if (/threads/i.test(t)) {
      platforms.add('Threads');
    }
  });

  if (platforms.size > 1) {
    console.log(`Row ${r + 1} has multiple platforms:`, Array.from(platforms), types);
  }
}
console.log('Check finished.');

