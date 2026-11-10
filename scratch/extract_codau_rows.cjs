const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));
const formulas = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formula.json', 'utf8'));

const codauRows = [];

formatted.forEach((row, idx) => {
  const koc = (row[3] || '').trim();
  if (/cô dâu saga/i.test(koc)) {
    codauRows.push({
      rowIdx: idx + 1,
      dateBook: row[0],
      dateAir: row[1],
      pic: row[2],
      koc: koc,
      product: row[4],
      channelG: row[6],
      dttColH: unformatted[idx]?.[7],
      formColH: formulas[idx]?.[7],
      slots: [
        { s: 1, type: row[8], view: unformatted[idx]?.[12], like: unformatted[idx]?.[13], cmt: unformatted[idx]?.[14], share: unformatted[idx]?.[15] },
        { s: 2, type: row[17], view: unformatted[idx]?.[21], like: unformatted[idx]?.[22], cmt: unformatted[idx]?.[23], share: unformatted[idx]?.[24] },
      ].filter(s => s.type || s.view !== undefined || s.like !== undefined)
    });
  }
});

console.log('Total rows for Cô dâu Saga:', codauRows.length);
codauRows.forEach(r => console.log(JSON.stringify(r)));

