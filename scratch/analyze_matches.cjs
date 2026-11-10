const fs = require('fs');

const data = JSON.parse(fs.readFileSync('d:/Booking/scratch/match_results.json', 'utf8'));

data.forEach(item => {
  console.log(`\nDeal #${item.deal.id}: ${item.deal.title}`);
  if (item.candidateRows.length === 1) {
    const c = item.candidateRows[0];
    console.log(`  -> EXACT 1 MATCH: Row ${c.rowIdx} | PIC="${c.pic}" | Channel="${c.channel}" | Status="${c.status}"`);
  } else if (item.candidateRows.length > 1) {
    console.log(`  -> MULTIPLE MATCHES (${item.candidateRows.length}):`);
    // filter to those with matching channel name or status
    item.candidateRows.forEach(c => {
      console.log(`     Row ${c.rowIdx} | PIC="${c.pic}" | Channel="${c.channel}" | Status="${c.status}" | TikTok="${c.tiktok}"`);
    });
  } else {
    console.log(`  -> NO MATCH!`);
  }
});
