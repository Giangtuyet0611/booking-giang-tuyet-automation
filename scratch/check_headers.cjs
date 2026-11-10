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
    spreadsheetId,
    includeGridData: true,
    ranges: ["'Trang tính1'!A1:Z5"]
  });

  console.log('Sheet metadata:');
  meta.data.sheets.forEach(s => {
    console.log(`Sheet: ${s.properties.title}, id: ${s.properties.sheetId}`);
    if (s.data && s.data[0]) {
      console.log('Start row:', s.data[0].startRow, 'start col:', s.data[0].startColumn);
      s.data[0].rowData.slice(0, 5).forEach((r, idx) => {
        const vals = (r.values || []).map(c => c.formattedValue || '');
        console.log(`Row ${idx + 1}:`, vals.slice(0, 20).join(' | '));
      });
    }
  });
}

main().catch(console.error);

