const { getClients } = require('../src/lib/google.cjs');

async function checkPIC() {
  const { sheets } = getClients();
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const range = `'Data KOC (11/2026)'!B1:B100`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const rows = res.data.values || [];
  const pics = new Set(rows.map(r => r[0]).filter(Boolean));
  console.log('Distinct PICs in first 100 rows:', Array.from(pics));
}

checkPIC().catch(console.error);
