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
    range: `'${tabName}'!A341:AA341`,
    valueRenderOption: 'FORMULA'
  });
  console.log('Row 341 raw formulas/values:');
  const row = res.data.values[0] || [];
  row.forEach((v, i) => console.log(`Col ${i}: ${v}`));
})().catch(console.error);
