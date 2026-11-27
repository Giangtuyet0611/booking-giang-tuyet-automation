const { getClients } = require('../src/lib/google.cjs');

async function checkKoc() {
  const { sheets } = getClients();
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const range = `'Data KOC (11/2026)'!A1:Q500`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const rows = res.data.values || [];
  const targets = ['lenanhminh', 'lnaminh', 'aminhxdnmt', 'ánh minh'];
  const matches = [];

  rows.forEach((row, idx) => {
    const rowStr = row.join(' ').toLowerCase();
    for (const t of targets) {
      if (rowStr.includes(t)) {
        matches.push({ rowNumber: idx + 1, target: t, channel: row[4], date: row[2], pic: row[1] });
      }
    }
  });

  console.log('Matches found:', matches);

  console.log('\nTop 4 rows:');
  for (let i = 0; i < Math.min(4, rows.length); i++) {
    const r = rows[i] || [];
    console.log(`Row ${i + 1}: [A] ${r[0] || ''} | [B] ${r[1] || ''} | [C] ${r[2] || ''} | [E] ${r[4] || ''}`);
  }
}

checkKoc().catch(console.error);
