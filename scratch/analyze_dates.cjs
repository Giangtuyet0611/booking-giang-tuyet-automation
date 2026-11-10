const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));
const formulas = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formula.json', 'utf8'));

console.log('Total rows:', formatted.length);

// Print all dates in Col B (index 1)
const dates = formatted.map((r, i) => ({ row: i + 1, dateStr: r[1], raw: unformatted[i]?.[1] }));
console.log('Sample dates:', dates.slice(0, 15));

// Check date distribution
const dateCounts = {};
dates.forEach(d => {
  if (d.dateStr) {
    dateCounts[d.dateStr] = (dateCounts[d.dateStr] || 0) + 1;
  } else {
    dateCounts['EMPTY'] = (dateCounts['EMPTY'] || 0) + 1;
  }
});
console.log('Date counts:', dateCounts);

