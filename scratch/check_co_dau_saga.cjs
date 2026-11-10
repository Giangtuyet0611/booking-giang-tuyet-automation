const fs = require('fs');

const rows = JSON.parse(fs.readFileSync('d:/Booking/scratch/early_rows.json', 'utf8'));

console.log('--- ALL rows with project "Cô dâu Saga" ---');
rows.forEach(r => {
  if (/cô dâu saga/i.test(r.proj)) {
    console.log(`Row ${r.rowNum} | PIC="${r.pic}" | Channel="${r.chan}" | Status="${r.stat}"`);
  }
});
