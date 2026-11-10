const { google } = require('googleapis');
const fs = require('fs');
const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

(async () => {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';
  const res = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:AA1000`,
  });
  const rows = res.data.values || [];
  const header = rows[0];

  console.log('--- Rows with non-empty Mã sản phẩm or Số sản phẩm tặng ---');
  let found = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[20] || row[21] || row[22] || row[24]) {
      found++;
      console.log(`\nRow ${i + 1} (${row[1]}): Channel="${row[4]}"`);
      [1, 18, 20, 21, 22, 23, 24, 25, 26].forEach(idx => {
        console.log(`  [${idx}] ${header[idx].replace(/\n/g, ' ')}: "${row[idx] || ''}"`);
      });
      if (found >= 5) break;
    }
  }
  console.log('Found rows:', found);
})().catch(console.error);
