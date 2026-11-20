const { getClients } = require('../src/lib/google.cjs');

async function searchAll() {
  const { sheets } = getClients();

  // 1. Check tabs of Data KOC spreadsheet
  console.log('=== TABS OF DATA KOC SPREADSHEET ===');
  const metaDataKoc = await sheets.spreadsheets.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw'
  });
  console.log('Tabs Data KOC:', metaDataKoc.data.sheets.map(s => s.properties.title));

  // 2. Check tabs of Report spreadsheet
  console.log('=== TABS OF REPORT SPREADSHEET ===');
  const metaReport = await sheets.spreadsheets.get({
    spreadsheetId: '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I'
  });
  console.log('Tabs Report:', metaReport.data.sheets.map(s => s.properties.title));

  // 3. Search in all rows of SL materials - Saga v1 (Spreadsheet 1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0)
  const oldMatRes = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'SL materials - Saga v1'!A:J`
  });
  const allOldRows = oldMatRes.data.values || [];
  console.log(`Total rows in SL materials - Saga v1: ${allOldRows.length}`);
  allOldRows.forEach((r, idx) => {
    const text = (r || []).join(' ').toLowerCase();
    if (text.includes('muse') || text.includes('musé') || text.includes('quỳnh')) {
      console.log(`SL materials Row ${idx + 1}:`, r);
    }
  });

  // 4. Check rows in Report Saga (1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I)
  const reportRes = await sheets.spreadsheets.values.get({
    spreadsheetId: '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I',
    range: `'Report Saga'!A:Q`
  });
  const allReportRows = reportRes.data.values || [];
  console.log(`Total rows in Report Saga: ${allReportRows.length}`);
  allReportRows.forEach((r, idx) => {
    if (idx >= 2 && r && r.length > 0) {
      console.log(`Report Saga Row ${idx + 1}:`, r.slice(0, 10));
    }
  });
}

searchAll().catch(e => console.error(e));
