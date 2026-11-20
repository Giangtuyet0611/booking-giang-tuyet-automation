const { getClients } = require('../lib/google.cjs');

async function checkDetails() {
  const { sheets } = getClients();

  console.log('=== REPORT SAGA ROWS 1-15 ===');
  const reportRes = await sheets.spreadsheets.values.get({
    spreadsheetId: '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I',
    range: `'Report Saga'!A1:Z15`
  });
  const rRows = reportRes.data.values || [];
  rRows.forEach((r, idx) => {
    console.log(`Row ${idx + 1}:`, r);
  });

  console.log('\n=== SEARCH QUYNH IN DATA KOC (11/2026) ===');
  const dataRes = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: `'Data KOC (11/2026)'!A1:Z150`
  });
  const dRows = dataRes.data.values || [];
  dRows.forEach((r, idx) => {
    const text = (r || []).join(' ').toLowerCase();
    if (text.includes('quỳnh') || text.includes('quynh') || text.includes('muse') || text.includes('musé') || text.includes('71836')) {
      console.log(`Data KOC Row ${idx + 1}:`, r.slice(0, 7), r.slice(18, 23));
    }
  });

  console.log('\n=== SPREADSHEET TỔNG HỢP (CŨ) SL materials - Saga v1 ===');
  const oldMatRes = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'SL materials - Saga v1'!A1:M100`
  });
  const oldRows = oldMatRes.data.values || [];
  console.log(`SL materials - Saga v1 total rows: ${oldRows.length}`);
  oldRows.forEach((r, idx) => {
    const text = (r || []).join(' ').toLowerCase();
    if (text.includes('quỳnh') || text.includes('quynh') || text.includes('muse') || text.includes('musé')) {
      console.log(`SL materials Row ${idx + 1}:`, r.slice(0, 10));
    }
  });

  console.log('\n=== SPREADSHEET TỔNG HỢP (CŨ) CSC - Saga ===');
  const oldCscRes = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'CSC - Saga'!A1:K100`
  });
  const oldCscRows = oldCscRes.data.values || [];
  oldCscRows.forEach((r, idx) => {
    const text = (r || []).join(' ').toLowerCase();
    if (text.includes('quỳnh') || text.includes('quynh') || text.includes('muse') || text.includes('musé')) {
      console.log(`CSC - Saga Row ${idx + 1}:`, r.slice(0, 8));
    }
  });
}

module.exports = { checkDetails };

