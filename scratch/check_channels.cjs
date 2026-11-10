const fs = require('fs');

const rows = JSON.parse(fs.readFileSync('d:/Booking/scratch/early_rows.json', 'utf8'));

console.log('--- Search channels in early_rows for Vi / Vy / Dung / Sa ---');
rows.forEach(r => {
  const c = r.chan.toLowerCase();
  if (
    c.includes('vi') || c.includes('vy') || c.includes('dương') || c.includes('dung') || 
    c.includes('sa') || c.includes('sami') || c.includes('thảo') || c.includes('hạnh')
  ) {
    console.log(`Row ${r.rowNum} | PIC="${r.pic}" | Channel="${r.chan}" | Proj="${r.proj}" | Status="${r.stat}"`);
  }
});
