const { getClients } = require('../src/lib/google.cjs');

async function checkRow733Formulas() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'SL materials - Saga v1'!A733:J734`,
    valueRenderOption: 'FORMULA'
  });
  console.log('=== ROW 733-734 FORMULAS ===');
  console.log(JSON.stringify(res.data.values, null, 2));
}

checkRow733Formulas().catch(e => console.error(e));
