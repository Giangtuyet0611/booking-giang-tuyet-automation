const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'CSC - Saga'!A1:F350"
  });

  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const text = (r || []).join(' ');
    if (text.toLowerCase().includes('vi') || text.toLowerCase().includes('53766') || text.toLowerCase().includes('giadinh')) {
      console.log(`Found at row ${i + 1}:`, r);
    }
  }
}

main().catch(console.error);
