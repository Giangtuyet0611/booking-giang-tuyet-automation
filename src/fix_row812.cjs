const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';
  const tabName = 'SL materials - Saga v1';

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A812:C812`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          '03/10/2026',
          'giadinhthaovi (20/10)',
          '=IFERROR(XLOOKUP(B812; \'CSC - Saga\'!D:D; \'CSC - Saga\'!E:E; "Saga Dancing Heart 53766-GPMWGP-2"); "Saga Dancing Heart 53766-GPMWGP-2")'
        ]
      ]
    }
  });

  console.log('Fixed A812:C812!');
}

main().catch(console.error);
