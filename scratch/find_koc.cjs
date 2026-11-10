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
    range: `'${tabName}'!A1:AA200`,
  });

  const rows = res.data.values || [];
  console.log('Total rows in sheet:', rows.length);
  const header = rows[0] || [];

  let matches = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowText = (row || []).join(' | ');
    if (/tố trân|to tran|hngtotran/i.test(rowText)) {
      matches++;
      console.log(`\nMatch #${matches} at Row ${i + 1}:`);
      header.forEach((h, idx) => {
        const val = row[idx] !== undefined ? row[idx] : '';
        console.log(`  [${idx}] ${h.replace(/\n/g, ' ')}: "${val}"`);
      });
    }
  }

  if (matches === 0) {
    console.log('No matches found for Tố Trân / hngtotran. Showing first 10 rows channels:');
    for (let i = 1; i < Math.min(rows.length, 15); i++) {
      console.log(`Row ${i + 1}: PIC="${rows[i][1]}" | Channel="${rows[i][4]}" | Status="${rows[i][18]}"`);
    }
  }
})().catch(err => {
  console.error('Error:', err);
});
