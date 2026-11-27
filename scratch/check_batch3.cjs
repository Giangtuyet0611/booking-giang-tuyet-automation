const { getClients } = require('../src/lib/google.cjs');

async function checkBatch3() {
  const { sheets } = getClients();
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const range = `'Data KOC (11/2026)'!A1:Q50`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const rows = res.data.values || [];
  const targets = ['_qu.anh', 'nntchi0501', 'wuynzaooo', 'tungvahanne'];
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

  console.log('\nTop 8 rows state:');
  for (let i = 0; i < Math.min(8, rows.length); i++) {
    const r = rows[i] || [];
    console.log(`Row ${i + 1}: [A] ${r[0] || ''} | [B] ${r[1] || ''} | [C] ${r[2] || ''} | [E] ${r[4] || ''}`);
  }
}

checkBatch3().catch(console.error);
