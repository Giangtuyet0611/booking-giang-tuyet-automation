const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));

console.log('Searching for "Cô dâu" or related in all rows:');

formatted.forEach((row, idx) => {
  const rowStr = JSON.stringify(row);
  if (/cô dâu|co dau/i.test(rowStr)) {
    console.log(`Row ${idx + 1}: Date=${row[1]}, Channel=${row[6]}, KOC=${row[3]}, Product=${row[4]}`);
    console.log(`   Slot 1: ${row[8]}, View: ${row[12]}, DTT H: ${unformatted[idx]?.[7]}`);
  }
});

// Also check all distinct KOC names in Col D (index 3) to see which ones have tags like (Cô dâu Saga) or similar
console.log('\nDistinct KOC names containing "Cô dâu" or "Saga":');
const kocSet = new Set();
formatted.forEach(r => {
  if (r[3]) kocSet.add(r[3]);
});
Array.from(kocSet).filter(k => /cô dâu|co dau/i.test(k)).forEach(k => console.log(' -', k));

