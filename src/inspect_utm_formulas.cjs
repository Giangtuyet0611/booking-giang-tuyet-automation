const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';

  console.log('--- Inspecting formulas in SL materials - Saga v1 (Col C rows 740-745) ---');
  const resMat = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'SL materials - Saga v1'!B740:D745",
    valueRenderOption: 'FORMULA'
  });
  console.log('Materials Formulas/Values:\n', JSON.stringify(resMat.data.values, null, 2));

  console.log('\n--- Inspecting formulas in CSC - Saga (Col D-E rows 335-340) ---');
  const resCsc = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'CSC - Saga'!C335:F340",
    valueRenderOption: 'FORMULA'
  });
  console.log('CSC Formulas/Values:\n', JSON.stringify(resCsc.data.values, null, 2));
}

run().catch(console.error);
