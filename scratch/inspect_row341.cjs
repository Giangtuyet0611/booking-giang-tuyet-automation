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
    range: `'${tabName}'!A1:AA345`,
  });
  const header = res.data.values[0];
  const row341 = res.data.values[340]; // 0-indexed: row 341 is index 340
  console.log('Row 341 details:');
  header.forEach((h, i) => {
    console.log(`[Col ${i}] ${h.replace(/\n/g, ' ')}: "${row341[i] || ''}"`);
  });
})().catch(console.error);
