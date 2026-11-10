const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));
const formulas = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formula.json', 'utf8'));

formatted.forEach((row, rIdx) => {
  for (let c = 53; c < row.length; c++) {
    if (row[c] !== '' && row[c] !== undefined) {
      console.log(`Row ${rIdx + 1} Col ${c}: ${row[c]}`);
    }
  }
});

