const { getClients } = require('../src/lib/google.cjs');

async function checkRows() {
  const { sheets } = getClients();
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const range = `'Data KOC (11/2026)'!A1:Q10`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const rows = res.data.values || [];
  rows.forEach((r, i) => {
    console.log(`Row ${i + 1}: [A] ${r[0] || ''} | [B] ${r[1] || ''} | [E] ${r[4] || ''}`);
  });
}

checkRows().catch(console.error);
