const { getClients } = require('../src/lib/google.cjs');

async function inspectRow1154() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: `'Data KOC (11/2026)'!A1154:AA1154`
  });
  console.log('=== ROW 1154 DATA KOC ===');
  console.log(res.data.values);
}

inspectRow1154().catch(e => console.error(e));

