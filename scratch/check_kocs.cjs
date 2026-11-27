const { getClients } = require('../src/lib/google.cjs');

async function check() {
  const { sheets, config } = getClients();
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const range = `'Data KOC (11/2026)'!A1:Q500`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const rows = res.data.values || [];
  console.log('Total rows in Data KOC (11/2026):', rows.length);

  const targets = ['han.daily11', 'bebong3280', 'bin.va.bong', 'bông', 'bống'];
  const matches = [];

  rows.forEach((row, idx) => {
    const rowStr = row.join(' ').toLowerCase();
    for (const t of targets) {
      if (rowStr.includes(t)) {
        matches.push({ rowNumber: idx + 1, target: t, data: row.slice(0, 7) });
      }
    }
  });

  console.log('Matches found:', JSON.stringify(matches, null, 2));
}

check().catch(console.error);
