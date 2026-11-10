const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function searchLinks() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';
  const res = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A:AA`,
  });

  const rows = res.data.values || [];
  console.log('Total rows:', rows.length);

  const queries = [
    { label: "viihihii", q: "viihihii" },
    { label: "1DCwSmnFwh", q: "1dcwsmnfwh" },
    { label: "iuduong", q: "iuduong" },
    { label: "hanh.dung.89118", q: "89118" },
    { label: "samie", q: "samie" },
    { label: "samyneee", q: "samyneee" },
    { label: "emwaiesei", q: "emwaiesei" },
    { label: "nguyenthuyan", q: "nguyenthuyan" },
    { label: "939910", q: "939910" },
    // Also search channel names loosely:
    { label: "My Sa", q: "my sa" },
    { label: "Hạnh Dung", q: "hạnh dung" },
  ];

  for (const item of queries) {
    console.log(`\n=== Query: ${item.label} ===`);
    let found = 0;
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const text = (row || []).join(' ').toLowerCase();
      if (text.includes(item.q.toLowerCase())) {
        found++;
        console.log(`Row ${r + 1} | PIC="${row[1]}" | Channel="${row[4]}" | Name="${row[5]}" | Contact="${row[14]}" | Proj="${row[16]}" | Status="${row[18]}"`);
      }
    }
    console.log(`Found ${found} matches.`);
  }
}

searchLinks().catch(console.error);
