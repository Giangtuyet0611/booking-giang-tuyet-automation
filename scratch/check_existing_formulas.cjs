const { getClients } = require('../src/lib/google.cjs');

async function checkExistingHyperlinks() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'SL materials - Saga v1'!C790:F817`,
    valueRenderOption: 'FORMULA'
  });
  console.log('=== FORMULAS IN C790:F817 ===');
  (res.data.values || []).forEach((r, idx) => {
    if (r && r.some(c => typeof c === 'string' && c.startsWith('='))) {
      console.log(`Row ${790 + idx}:`, r);
    }
  });
}

checkExistingHyperlinks().catch(e => console.error(e));

