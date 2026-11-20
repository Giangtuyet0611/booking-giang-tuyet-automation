const { getClients } = require('../src/lib/google.cjs');

async function inspectReportSagaRow3() {
  const { sheets } = getClients();
  const spreadsheetId = '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I';
  const range = `'Report Saga'!A1:Z10`;

  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [range],
    fields: 'sheets.data.rowData.values(userEnteredValue,effectiveValue,formattedValue)'
  });

  const rowData = res.data.sheets[0].data[0].rowData || [];
  console.log('Total rows inspected:', rowData.length);
  rowData.forEach((row, rIdx) => {
    console.log(`\n--- ROW ${rIdx + 1} ---`);
    const vals = (row.values || []).map((v, cIdx) => {
      const u = v.userEnteredValue ? Object.values(v.userEnteredValue)[0] : '';
      const f = v.formattedValue || '';
      return u !== f ? `[${cIdx}] U: ${u} | F: ${f}` : (u ? `[${cIdx}] ${u}` : null);
    }).filter(Boolean);
    console.log(vals.join('\n'));
  });
}

inspectReportSagaRow3().catch(e => console.error(e));

