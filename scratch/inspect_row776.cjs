const { getClients } = require('../src/lib/google.cjs');

async function inspectRow776() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: `'Data KOC (11/2026)'!A776:AA776`
  });
  console.log('=== ROW 776 DATA KOC ===');
  console.log(res.data.values);
}

inspectRow776().catch(e => console.error(e));

