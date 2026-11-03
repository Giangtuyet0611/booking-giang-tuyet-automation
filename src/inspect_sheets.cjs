const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const sheets = google.sheets({ version: 'v4', auth });

  const sheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: sheetId
  });

  console.log('Tabs in [0] Tổng hợp report & materials KOL/KOC:');
  meta.data.sheets.forEach(s => {
    console.log(`- ${s.properties.title} (sheetId: ${s.properties.sheetId})`);
  });
}

run().catch(console.error);
