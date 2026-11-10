const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));
const formulas = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formula.json', 'utf8'));

console.log('--- WEEK 3 ROWS (Rows 131 to 136) ---');
for (let r = 130; r < 136; r++) {
  console.log(`Row ${r + 1}: Date=${formatted[r][1]}, ChannelG=${formatted[r][6]}, ColH_val=${unformatted[r]?.[7]}, ColH_form=${formulas[r]?.[7]}`);
  console.log(`   Slot 1: type=${formatted[r][8]}, view=${unformatted[r]?.[12]}, like=${unformatted[r]?.[13]}, cmt=${unformatted[r]?.[14]}, share=${unformatted[r]?.[15]}`);
}

console.log('\n--- WEEK 4 ROWS (Rows 137 to 141) ---');
for (let r = 136; r < 141; r++) {
  console.log(`Row ${r + 1}: Date=${formatted[r][1]}, ChannelG=${formatted[r][6]}, ColH_val=${unformatted[r]?.[7]}, ColH_form=${formulas[r]?.[7]}`);
  console.log(`   Slot 1: type=${formatted[r][8]}, view=${unformatted[r]?.[12]}, like=${unformatted[r]?.[13]}, cmt=${unformatted[r]?.[14]}, share=${unformatted[r]?.[15]}`);
}

