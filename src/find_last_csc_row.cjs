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
  let lastNonEmptyRow = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r && (r[1] || r[2] || r[3])) { // PIC, Ngày Book, or Tên KOC
      lastNonEmptyRow = i + 1;
    }
  }

  console.log(`Last non-empty row index: ${lastNonEmptyRow}`);
  console.log('Row content:', rows[lastNonEmptyRow - 1]);
}

main().catch(console.error);
