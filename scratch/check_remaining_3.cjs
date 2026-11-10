const fs = require('fs');

const data = JSON.parse(fs.readFileSync('d:/Booking/scratch/match_results.json', 'utf8'));

[4, 12, 16].forEach(dealId => {
  const item = data.find(d => d.deal.id === dealId);
  console.log(`\n========================================`);
  console.log(`DEAL #${dealId}: ${item.deal.title}`);
  item.candidateRows.forEach(c => {
    console.log(`Row ${c.rowIdx} | PIC="${c.pic}" | Channel="${c.channel}" | Name="${c.name}" | Status="${c.status}"`);
    console.log(`   Raw: ${JSON.stringify(c.rawRow.slice(0, 19))}`);
  });
});
