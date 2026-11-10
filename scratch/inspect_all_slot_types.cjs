const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));

// Find all unique slot types and how they are written
const slotTypes = {};

const slotDefs = [
  { typeCol: 8, viewCol: 12, likeCol: 13, cmtCol: 14, shareCol: 15, saveCol: 16 },
  { typeCol: 17, viewCol: 21, likeCol: 22, cmtCol: 23, shareCol: 24, saveCol: 25 },
  { typeCol: 26, viewCol: 30, likeCol: 31, cmtCol: 32, shareCol: 33, saveCol: 34 },
  { typeCol: 35, viewCol: 39, likeCol: 40, cmtCol: 41, shareCol: 42, saveCol: 43 },
  { typeCol: 44, viewCol: 48, likeCol: 49, cmtCol: 50, shareCol: 51, saveCol: 52 },
  { typeCol: 53, viewCol: 57, likeCol: 58, cmtCol: 59, shareCol: 60, saveCol: 61 },
  { typeCol: 62, viewCol: 66, likeCol: 67, cmtCol: 68, shareCol: 69, saveCol: 70 },
];

for (let r = 0; r < formatted.length; r++) {
  const rowF = formatted[r];
  const rowU = unformatted[r];

  slotDefs.forEach((slot, sIdx) => {
    const rawType = rowF[slot.typeCol];
    const view = rowU?.[slot.viewCol];
    const like = rowU?.[slot.likeCol];

    if (rawType || view !== undefined || like !== undefined) {
      const trimmed = (rawType || '').trim();
      if (!slotTypes[trimmed]) {
        slotTypes[trimmed] = [];
      }
      slotTypes[trimmed].push({
        row: r + 1,
        date: rowF[1],
        slotIndex: sIdx + 1,
        rawType,
        view,
        like
      });
    }
  });
}

console.log('Unique Slot Types:');
for (const [k, v] of Object.entries(slotTypes)) {
  console.log(`- "${k}": count=${v.length}, sample rows: ${v.slice(0, 3).map(x => x.row).join(', ')}`);
}

