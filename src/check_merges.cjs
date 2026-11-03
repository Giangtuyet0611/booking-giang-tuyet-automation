const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';

  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: ["'SL materials - Saga v1'!A810:J815"],
    fields: 'sheets(merges)'
  });

  console.log('Merges:', JSON.stringify(res.data.sheets[0].merges, null, 2));
}

main().catch(console.error);
