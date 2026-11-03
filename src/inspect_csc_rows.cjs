const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';

  const resCsc = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'CSC - Saga'!C330:F338",
    valueRenderOption: 'FORMULA'
  });
  console.log('CSC Rows 330-338:\n', JSON.stringify(resCsc.data.values, null, 2));
}

run().catch(console.error);
