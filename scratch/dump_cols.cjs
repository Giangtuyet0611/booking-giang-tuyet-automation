const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1NvETiRitI0PHeae1KfOjyTQ7ODa-aN2v_VB8xqSf6Cw';

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'Trang tính1'!A1:BA10`,
  });

  const rows = res.data.values;
  for (let r = 0; r < Math.min(rows.length, 6); r++) {
    console.log(`\n--- ROW ${r + 1} ---`);
    rows[r].forEach((val, c) => {
      // Convert col index to Letter (0 -> A, 25 -> Z, 26 -> AA, etc.)
      const letter = getColLetter(c);
      if (val !== undefined && val !== '') {
        console.log(`Col ${letter} (${c}): ${val}`);
      }
    });
  }
}

function getColLetter(colIdx) {
  let temp = null;
  let letter = '';
  while (colIdx >= 0) {
    temp = colIdx % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIdx = Math.floor(colIdx / 26) - 1;
  }
  return letter;
}

main().catch(console.error);

