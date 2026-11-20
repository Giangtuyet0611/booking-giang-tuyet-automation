const { getClients } = require('../src/lib/google.cjs');

async function checkReportSaga() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I',
    range: `'Report Saga'!A1:Z20`
  });
  console.log('=== REPORT SAGA ALL ROWS ===');
  const rows = res.data.values || [];
  console.log(`Total rows returned: ${rows.length}`);
  rows.forEach((r, idx) => {
    console.log(`Row ${idx + 1}:`, r);
  });
}

checkReportSaga().catch(e => console.error(e));

