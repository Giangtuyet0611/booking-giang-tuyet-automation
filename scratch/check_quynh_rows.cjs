const { getClients } = require('../src/lib/google.cjs');

async function inspectQuynhRows() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'SL materials - Saga v1'!A730:M745`
  });
  console.log('=== SL MATERIALS ROWS 730-745 ===');
  (res.data.values || []).forEach((r, i) => {
    console.log(`Row ${730 + i}:`, r);
  });
}

inspectQuynhRows().catch(e => console.error(e));

