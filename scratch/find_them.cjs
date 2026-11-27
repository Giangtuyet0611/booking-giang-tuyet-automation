const { getClients } = require('../src/lib/google.cjs');

async function findThem() {
  const { sheets } = getClients();
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const range = `'Data KOC (11/2026)'!A1:Q50`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const rows = res.data.values || [];
  rows.forEach((r, i) => {
    const s = r.join(' ');
    if (s.includes('han.daily') || s.includes('Bông iuuu')) {
      console.log(`Found at Row ${i + 1}: ${r[4]}`);
    }
  });
}

findThem().catch(console.error);
