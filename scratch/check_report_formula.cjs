const { google } = require('googleapis');
const fs = require('fs');
const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

(async () => {
  const id = '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I';
  const res = await s.spreadsheets.values.get({
    spreadsheetId: id,
    range: "'Report Saga'!A3:Z5",
    valueRenderOption: 'FORMULA'
  });
  console.log('Row 3 formulas:', JSON.stringify(res.data.values[0], null, 2));
})().catch(console.error);
