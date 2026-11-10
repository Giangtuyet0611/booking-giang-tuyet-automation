const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function checkRows() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  const res = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A505:AA518`
  });
  console.log('Rows 505-518:');
  (res.data.values || []).forEach((r, idx) => {
    console.log(`Row ${505 + idx}: PIC="${r[1]}" | Channel="${r[4]}" | TikTok="${r[10]}" | FB="${r[11]}" | Contact="${r[14]}" | Status="${r[18]}"`);
  });
}

checkRows().catch(console.error);
