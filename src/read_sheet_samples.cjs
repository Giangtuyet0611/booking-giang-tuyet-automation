const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';

  console.log('--- Reading CSC - Saga header and sample rows ---');
  const cscRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'CSC - Saga'!A1:L5"
  });
  console.log('CSC - Saga Headers:', cscRes.data.values);

  const cscLastRows = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'CSC - Saga'!A335:L340"
  });
  console.log('CSC - Saga Sample Rows (around 337):', cscLastRows.data.values);

  console.log('\n--- Reading SL materials - Saga v1 header and sample rows ---');
  const matRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'SL materials - Saga v1'!A1:L3"
  });
  console.log('SL materials Headers:', matRes.data.values);

  const matSample = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'SL materials - Saga v1'!A824:K828"
  });
  console.log('SL materials Sample Rows (around 825):', matSample.data.values);

  console.log('\n--- Reading SL post & ĐTT - Saga header and sample rows ---');
  const postRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'SL post & ĐTT - Saga'!A1:O3"
  });
  console.log('SL post Headers:', postRes.data.values);
}

run().catch(console.error);
