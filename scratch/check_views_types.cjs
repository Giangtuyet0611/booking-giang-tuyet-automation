const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));

const slotDefs = [
  { s: 1, typeCol: 8, viewCol: 12 },
  { s: 2, typeCol: 17, viewCol: 21 },
  { s: 3, typeCol: 26, viewCol: 30 },
  { s: 4, typeCol: 35, viewCol: 39 },
  { s: 5, typeCol: 44, viewCol: 48 },
  { s: 6, typeCol: 53, viewCol: 57 },
  { s: 7, typeCol: 62, viewCol: 66 },
];

let nonNumericViews = [];

for (let r = 0; r < formatted.length; r++) {
  const rowF = formatted[r];
  const rowU = unformatted[r];

  slotDefs.forEach(slot => {
    const rawType = (rowF[slot.typeCol] || '').trim();
    if (!rawType) return;

    const valU = rowU?.[slot.viewCol];
    const valF = rowF[slot.viewCol];

    if (valU !== undefined && valU !== '' && typeof valU !== 'number') {
      nonNumericViews.push({
        row: r + 1,
        slot: slot.s,
        rawType,
        valU,
        valF
      });
    }
  });
}

console.log('Non-numeric views count:', nonNumericViews.length);
console.log('Non-numeric views:', nonNumericViews);

