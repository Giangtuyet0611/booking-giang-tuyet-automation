const { getClients } = require('../src/lib/google.cjs');

async function findNextEmptyRow() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'SL materials - Saga v1'!A815:J830`
  });
  console.log('=== SL MATERIALS A815:J830 ===');
  (res.data.values || []).forEach((r, i) => {
    console.log(`Row ${815 + i}:`, r);
  });
}

findNextEmptyRow().catch(e => console.error(e));

