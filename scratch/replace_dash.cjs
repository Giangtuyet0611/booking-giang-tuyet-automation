const { getClients } = require('../src/lib/google.cjs');

const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
const sheetId = 280295617;
const sheetTitle = 'Data KOC (11/2026)';

async function replaceDash() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A2:Q15`,
  });

  const rows = res.data.values || [];
  const requests = [];

  rows.forEach((row, rowIdx) => {
    const targetRowIndex = rowIdx + 1; // 0-based for row 2, 3...
    row.forEach((cellVal, colIdx) => {
      if (cellVal && cellVal.trim() === 'không có') {
        requests.push({
          updateCells: {
            range: {
              sheetId,
              startRowIndex: targetRowIndex,
              endRowIndex: targetRowIndex + 1,
              startColumnIndex: colIdx,
              endColumnIndex: colIdx + 1,
            },
            rows: [{
              values: [{
                userEnteredValue: { stringValue: '-' },
              }],
            }],
            fields: 'userEnteredValue',
          },
        });
      }
    });
  });

  console.log(`Found ${requests.length} cells with 'không có' in top 15 rows. Updating...`);
  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
    console.log('Updated successfully to "-"!');
  }
}

replaceDash().catch(console.error);
