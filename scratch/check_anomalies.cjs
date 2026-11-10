const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));

const slotDefs = [
  { typeCol: 8, viewCol: 12, likeCol: 13, cmtCol: 14, shareCol: 15, saveCol: 16 },
  { typeCol: 17, viewCol: 21, likeCol: 22, cmtCol: 23, shareCol: 24, saveCol: 25 },
  { typeCol: 26, viewCol: 30, likeCol: 31, cmtCol: 32, shareCol: 33, saveCol: 34 },
  { typeCol: 35, viewCol: 39, likeCol: 40, cmtCol: 41, shareCol: 42, saveCol: 43 },
  { typeCol: 44, viewCol: 48, likeCol: 49, cmtCol: 50, shareCol: 51, saveCol: 52 },
  { typeCol: 53, viewCol: 57, likeCol: 58, cmtCol: 59, shareCol: 60, saveCol: 61 },
  { typeCol: 62, viewCol: 66, likeCol: 67, cmtCol: 68, shareCol: 69, saveCol: 70 },
];

let anomalies = 0;
for (let r = 0; r < formatted.length; r++) {
  const rowF = formatted[r];
  const rowU = unformatted[r];

  slotDefs.forEach((slot, sIdx) => {
    const rawType = (rowF[slot.typeCol] || '').trim();
    const view = rowU?.[slot.viewCol];
    const like = rowU?.[slot.likeCol];

    const hasViewNumber = typeof view === 'number';
    const hasLikeNumber = typeof like === 'number';

    if (!rawType && (hasViewNumber || hasLikeNumber)) {
      console.log(`Row ${r + 1} Slot ${sIdx + 1}: NO type, but view=${view}, like=${like}`);
      anomalies++;
    }
  });
}
console.log(`Total anomalies: ${anomalies}`);

