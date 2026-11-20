const { getClients } = require('../src/lib/google.cjs');

async function searchQuynhDataKoc() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: `'Data KOC (11/2026)'!A:Z`
  });
  const rows = res.data.values || [];
  console.log(`Total rows in Data KOC (11/2026): ${rows.length}`);
  rows.forEach((r, idx) => {
    const text = (r || []).join(' ').toLowerCase();
    if (text.includes('muse') || text.includes('musé') || text.includes('quỳnh') || text.includes('quynh')) {
      console.log(`Row ${idx + 1}: Col D (lh): "${r[3]}", Col E (channel): "${r[4]}", Col F (name): "${r[5]}"`);
    }
  });
}

searchQuynhDataKoc().catch(e => console.error(e));

