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
    range: `'${tabName}'!A:AA`,
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
        if (val) console.log(`  [${idx}] ${h.replace(/\n/g, ' ')}: "${val}"`);
      });
    }
  }

  // Also check if there are other rows where PIC is 'Giáng Tuyết' or 'Tuyết'
  console.log('\n--- Rows with PIC Giang Tuyet ---');
  let gtRows = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const pic = row[1] || '';
    if (/tuyết|tuyet/i.test(pic)) {
      gtRows++;
      console.log(`Row ${i + 1}: PIC="${pic}" | Channel="${row[4]}" | Name="${row[5]}" | Status="${row[18]}"`);
    }
  }
  console.log('Total Giang Tuyet rows:', gtRows);
})().catch(err => {
  console.error('Error:', err);
});
