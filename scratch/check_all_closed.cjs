const fs = require('fs');

const rows = JSON.parse(fs.readFileSync('d:/Booking/scratch/early_rows.json', 'utf8'));

console.log('--- All "Đã chốt book" rows under Thanh Hà and Tuyết in early_rows ---');
rows.forEach(r => {
  if (r.stat === 'Đã chốt book' && (r.pic === 'Thanh Hà' || r.pic === 'Tuyết')) {
    console.log(`Row ${r.rowNum} | PIC="${r.pic}" | Channel="${r.chan}" | Proj="${r.proj}"`);
  }
});
