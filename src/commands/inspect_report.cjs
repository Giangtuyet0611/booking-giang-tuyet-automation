const { getClients } = require('../lib/google.cjs');

async function inspectReportSheets(kocQuery = 'Quỳnh Musé') {
  const { sheets } = getClients();

  console.log(`\n=== 1. KIỂM TRA SHEET DATA KOC (11/2026) ===`);
  const dataKocId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const dataKocRes = await sheets.spreadsheets.values.get({
    spreadsheetId: dataKocId,
    range: `'Data KOC (11/2026)'!A1:Z100`
  });
  const dataRows = dataKocRes.data.values || [];
  console.log(`Tổng số dòng Data KOC: ${dataRows.length}`);
  if (dataRows.length > 0) {
    const headers = dataRows[0];
    console.log(`Headers (${headers.length}):`, headers);
    
    // Tìm Quỳnh Musé
    dataRows.forEach((r, idx) => {
      const rowStr = (r || []).join(' | ');
      if (rowStr.toLowerCase().includes(kocQuery.toLowerCase())) {
        console.log(`-> Khớp dòng ${idx + 1}:`, r);
      }
    });
  }

  console.log(`\n=== 2. KIỂM TRA SHEET REPORT SAGA (MỚI) ===`);
  const reportId = '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I';
  const reportRes = await sheets.spreadsheets.values.get({
    spreadsheetId: reportId,
    range: `'Report Saga'!A1:Z50`
  });
  const reportRows = reportRes.data.values || [];
  console.log(`Tổng số dòng Report Saga: ${reportRows.length}`);
  if (reportRows.length > 0) {
    console.log(`Headers (${reportRows[0].length}):`, reportRows[0]);
    reportRows.slice(0, 10).forEach((r, idx) => {
      const rowStr = (r || []).join(' | ');
      if (rowStr.toLowerCase().includes(kocQuery.toLowerCase())) {
        console.log(`-> Khớp dòng ${idx + 1}:`, r);
      }
    });
  }

  console.log(`\n=== 3. KIỂM TRA SPREADSHEET CŨ (SL materials - Saga v1) NẾU CÓ ===`);
  try {
    const oldReportId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';
    const oldRes = await sheets.spreadsheets.values.get({
      spreadsheetId: oldReportId,
      range: `'SL materials - Saga v1'!A1:M20`
    });
    const oldRows = oldRes.data.values || [];
    console.log(`Headers cũ:`, oldRows[0]);
    oldRows.forEach((r, idx) => {
      const rowStr = (r || []).join(' | ');
      if (rowStr.toLowerCase().includes(kocQuery.toLowerCase())) {
        console.log(`-> Khớp dòng cũ ${idx + 1}:`, r);
      }
    });
  } catch (err) {
    console.log('Lỗi đọc sheet cũ:', err.message);
  }
}

module.exports = { inspectReportSheets };

