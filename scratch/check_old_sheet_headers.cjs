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
    range: "'2 SL post & ĐTT - Saga'!A1:BA3",
  });

  console.log('Old Sheet Headers:');
  res.data.values.forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`);
    row.forEach((c, i) => {
      if (c) console.log(`  [${i}] ${c}`);
    });
  });
}

main().catch(console.error);

