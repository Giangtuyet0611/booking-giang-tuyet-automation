const { getClients } = require('../src/lib/google.cjs');

async function verifyRow822() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'SL materials - Saga v1'!A822:J822`
  });
  console.log('=== ROW 822 VERIFICATION ===');
  console.log(res.data.values);
}

verifyRow822().catch(e => console.error(e));

