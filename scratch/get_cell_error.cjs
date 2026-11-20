const { getClients } = require('../src/lib/google.cjs');

async function getCellError() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    ranges: [`'SL materials - Saga v1'!C822:F822`],
    fields: 'sheets.data.rowData.values(effectiveValue,formattedValue,userEnteredValue,hyperlink)'
  });
  console.log('=== CELL VALUES / ERRORS ===');
  console.log(JSON.stringify(res.data.sheets[0].data[0].rowData[0].values, null, 2));
}

getCellError().catch(e => console.error(e));

