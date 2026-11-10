const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1NvETiRitI0PHeae1KfOjyTQ7ODa-aN2v_VB8xqSf6Cw';

  // Get total rows
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'Trang tính1'!A1:BA200`,
    valueRenderOption: 'FORMATTED_VALUE'
  });

  const rows = res.data.values || [];
  console.log(`Total rows fetched: ${rows.length}`);

  // Inspect unique values in platform columns: Col G (6), Col I (8), Col R (17), Col AA (26), Col AJ (35), Col AS (44)
  const platformsG = new Set();
  const platformsI = new Set();
  const platformsR = new Set();
  const platformsAA = new Set();
  const platformsAJ = new Set();

  rows.forEach((r, idx) => {
    if (r[6]) platformsG.add(r[6]);
    if (r[8]) platformsI.add(r[8]);
    if (r[17]) platformsR.add(r[17]);
    if (r[26]) platformsAA.add(r[26]);
    if (r[35]) platformsAJ.add(r[35]);
  });

  console.log('Platforms Col G:', Array.from(platformsG));
  console.log('Platforms Col I:', Array.from(platformsI));
  console.log('Platforms Col R:', Array.from(platformsR));
  console.log('Platforms Col AA:', Array.from(platformsAA));
  console.log('Platforms Col AJ:', Array.from(platformsAJ));
}

main().catch(console.error);

