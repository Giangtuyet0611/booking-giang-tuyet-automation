const { getClients } = require('../src/lib/google.cjs');

async function check() {
  const { sheets } = getClients();
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const range = `'Data KOC (11/2026)'!A1:Q50`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const rows = res.data.values || [];
  const targets = ['tungvahanne', 'phamngocnee', 'chloee2380'];
  const matches = [];

  rows.forEach((row, idx) => {
    const rowStr = row.join(' ').toLowerCase();
    for (const t of targets) {
      if (rowStr.includes(t)) {
        matches.push({ rowNumber: idx + 1, target: t, data: row.slice(0, 7) });
      }
    }
  });

  console.log('Duplicate matches:', matches);

  console.log('\nTop 12 rows state:');
  for (let i = 0; i < Math.min(12, rows.length); i++) {
    const r = rows[i] || [];
    console.log(`Row ${i + 1}: [A] ${r[0] || ''} | [B] ${r[1] || ''} | [C] ${r[2] || ''} | [E] ${r[4] || ''} | [K] ${r[10] || ''}`);
  }
}

check().catch(console.error);
