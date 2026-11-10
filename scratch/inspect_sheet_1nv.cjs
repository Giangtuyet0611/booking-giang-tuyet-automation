const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1NvETiRitI0PHeae1KfOjyTQ7ODa-aN2v_VB8xqSf6Cw';

  const meta = await sheets.spreadsheets.get({
    spreadsheetId
  });

  console.log('Title:', meta.data.properties.title);
  console.log('Sheets:');
  for (const s of meta.data.sheets) {
    console.log(`- ${s.properties.title} (id: ${s.properties.sheetId}, rows: ${s.properties.gridProperties.rowCount}, cols: ${s.properties.gridProperties.columnCount})`);
  }

  // Get data from the first sheet or gid=0
  const firstSheetTitle = meta.data.sheets[0].properties.title;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${firstSheetTitle}'!A1:Z30`,
  });

  console.log('\nFirst 30 rows sample:');
  res.data.values.forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`, JSON.stringify(row));
  });
}

main().catch(console.error);

