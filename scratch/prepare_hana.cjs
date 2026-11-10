const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const drive = google.drive({ version: 'v3', auth: a });
const sheets = google.sheets({ version: 'v4', auth: a });

async function main() {
  const rootId = '117T7PVrbn48hc97-02JMj3K4ApYeSDPZ';
  const res = await drive.files.list({
    q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)'
  });
  console.log('Subfolders in [0] File mem:');
  res.data.files.forEach(f => console.log(`  ${f.name} (${f.id})`));

  // Also check Data KOC (11/2026) for Hana Sắp Cưới
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';
  const sRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:AA300`
  });
  const rows = sRes.data.values || [];
  const header = rows[0];
  console.log('\nSearching for Hana Sắp Cưới in Data KOC:');
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const text = (row || []).join(' ');
    if (/hana/i.test(text)) {
      console.log(`Row ${r + 1}: PIC="${row[1]}" | Channel="${row[4]}" | Proj="${row[16]}" | Status="${row[18]}"`);
    }
  }
}

main().catch(console.error);
