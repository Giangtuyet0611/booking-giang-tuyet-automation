const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1NvETiRitI0PHeae1KfOjyTQ7ODa-aN2v_VB8xqSf6Cw';

  // Fetch formatted values
  const resFormatted = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Trang tính1'!A1:ZZ200",
    valueRenderOption: 'FORMATTED_VALUE'
  });

  // Fetch unformatted values (raw numbers, formulas)
  const resUnformatted = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Trang tính1'!A1:ZZ200",
    valueRenderOption: 'UNFORMATTED_VALUE'
  });

  // Fetch formulas
  const resFormula = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Trang tính1'!A1:ZZ200",
    valueRenderOption: 'FORMULA'
  });

  fs.writeFileSync('d:/Booking/scratch/sheet_formatted.json', JSON.stringify(resFormatted.data.values, null, 2));
  fs.writeFileSync('d:/Booking/scratch/sheet_unformatted.json', JSON.stringify(resUnformatted.data.values, null, 2));
  fs.writeFileSync('d:/Booking/scratch/sheet_formula.json', JSON.stringify(resFormula.data.values, null, 2));

  console.log('Saved all 3 sheets datasets successfully!');
}

main().catch(console.error);

