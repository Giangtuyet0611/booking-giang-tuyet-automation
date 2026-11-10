const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Check the user sheet
  const userSheetId = '1NvETiRitI0PHeae1KfOjyTQ7ODa-aN2v_VB8xqSf6Cw';
  const metaUser = await sheets.spreadsheets.get({ spreadsheetId: userSheetId });
  console.log('User spreadsheet title:', metaUser.data.properties.title);
  metaUser.data.sheets.forEach(s => console.log('User sheet:', s.properties.title, s.properties.sheetId));

  // Let's get formulas and header info from user sheet
  const userSample = await sheets.spreadsheets.get({
    spreadsheetId: userSheetId,
    includeGridData: true,
    ranges: ["'Trang tính1'!A1:Z6"]
  });

  const rowData = userSample.data.sheets[0].data[0].rowData;
  console.log('\n--- Row 1 with values and formulas ---');
  (rowData[0].values || []).forEach((c, idx) => {
    console.log(`Col ${idx}: val=${c.formattedValue}, formula=${c.userEnteredValue ? JSON.stringify(c.userEnteredValue) : ''}`);
  });

  console.log('\n--- Row 3 with values and formulas ---');
  (rowData[2].values || []).forEach((c, idx) => {
    console.log(`Col ${idx}: val=${c.formattedValue}, formula=${c.userEnteredValue ? JSON.stringify(c.userEnteredValue) : ''}`);
  });
}

main().catch(console.error);

