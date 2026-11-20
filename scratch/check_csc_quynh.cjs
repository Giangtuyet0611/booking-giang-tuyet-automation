const { getClients } = require('../src/lib/google.cjs');

async function checkCscQuynh() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    range: `'CSC - Saga'!A:G`
  });
  const rows = res.data.values || [];
  rows.forEach((r, idx) => {
    const text = (r || []).join(' ').toLowerCase();
    if (text.includes('quỳnh musé') || text.includes('quynh muse') || text.includes('71836-svsvsv-2')) {
      console.log(`CSC Row ${idx + 1}:`, r);
    }
  });
}

checkCscQuynh().catch(e => console.error(e));

