const { getClients } = require('../src/lib/google.cjs');

async function inspectRow235() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: `'Data KOC (11/2026)'!A235:AA235`
  });
  console.log('=== ROW 235 DATA KOC ===');
  console.log(res.data.values);
}

inspectRow235().catch(e => console.error(e));

