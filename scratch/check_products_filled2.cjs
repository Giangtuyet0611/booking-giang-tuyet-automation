const { google } = require('googleapis');
const fs = require('fs');
const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

(async () => {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';
  const res = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!U1:Y`, // cols U (20), V (21), W (22), X (23), Y (24)
  });
  const rows = res.data.values || [];
  console.log('Total rows checked in U:Y:', rows.length);
  let found = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row && row.some(x => x && x.trim())) {
      found++;
      console.log(`Row ${i + 1}:`, JSON.stringify(row));
      if (found >= 10) break;
    }
  }
  console.log('Found:', found);
})().catch(console.error);
