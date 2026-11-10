const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));
const formulas = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formula.json', 'utf8'));

const slotDefs = [
  { s: 1, typeCol: 8, viewCol: 12, likeCol: 13, cmtCol: 14, shareCol: 15 },
  { s: 2, typeCol: 17, viewCol: 21, likeCol: 22, cmtCol: 23, shareCol: 24 },
  { s: 3, typeCol: 26, viewCol: 30, likeCol: 31, cmtCol: 32, shareCol: 33 },
  { s: 4, typeCol: 35, viewCol: 39, likeCol: 40, cmtCol: 41, shareCol: 42 },
  { s: 5, typeCol: 44, viewCol: 48, likeCol: 49, cmtCol: 50, shareCol: 51 },
  { s: 6, typeCol: 53, viewCol: 57, likeCol: 58, cmtCol: 59, shareCol: 60 },
  { s: 7, typeCol: 62, viewCol: 66, likeCol: 67, cmtCol: 68, shareCol: 69 },
];

for (let r = 0; r < formatted.length; r++) {
  const rowF = formatted[r];
  const rowU = unformatted[r];

  let calculatedDTT = 0;
  slotDefs.forEach(slot => {
    const rawType = (rowF[slot.typeCol] || '').trim();
    if (!rawType) return;
    const like = typeof rowU?.[slot.likeCol] === 'number' ? rowU[slot.likeCol] : 0;
    const cmt = typeof rowU?.[slot.cmtCol] === 'number' ? rowU[slot.cmtCol] : 0;
    const share = typeof rowU?.[slot.shareCol] === 'number' ? rowU[slot.shareCol] : 0;
    calculatedDTT += like + cmt * 10 + share * 30;
  });

  const colHVal = typeof rowU?.[7] === 'number' ? rowU[7] : (parseFloat(rowF[7]) || 0);

  if (calculatedDTT !== colHVal) {
    console.log(`Row ${r + 1}: Date=${rowF[1]}, KOC=${rowF[3]}, ColG=${rowF[6]}, CalcDTT=${calculatedDTT}, ColH=${colHVal}, Diff=${calculatedDTT - colHVal}`);
  }
}

