const { getClients } = require('../src/lib/google.cjs');

async function checkLastRows() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'SL materials - Saga v1'!A810:M830`
  });
  console.log('=== SL MATERIALS ROWS 810-830 ===');
  (res.data.values || []).forEach((r, i) => {
    console.log(`Row ${810 + i}:`, r);
  });
}

checkLastRows().catch(e => console.error(e));

