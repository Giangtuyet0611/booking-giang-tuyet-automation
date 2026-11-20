const { google } = require('googleapis');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
auth.setCredentials(credentials);
const sheets = google.sheets({ version: 'v4', auth });
const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

async function check() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.SPREADSHEET_DATA_KOC_ID,
    range: `'Data KOC (11/2026)'!A1:Z100`
  });
  const rows = res.data.values || [];
  console.log('Total rows:', rows.length);
  const header = rows[0] || [];
  console.log('Header:', header);
  for (let i = 0; i < rows.length; i++) {
    const rowStr = (rows[i] || []).join(' | ');
    if (rowStr.toLowerCase().includes('dmy') || rowStr.toLowerCase().includes('ngân')) {
      console.log('Row', i + 1, ':', rowStr);
    }
  }
}
check().catch(console.error);

