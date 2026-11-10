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

  console.log('--- Sample closed deals by Tuyet/Giang Tuyet ---');
  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const pic = row[1] || '';
    const status = row[18] || '';
    if (/tuyết|tuyet/i.test(pic) && /đã chốt/i.test(status)) {
      count++;
      console.log(`\nRow ${i + 1} (${pic}): Channel="${row[4]}"`);
      [1, 10, 11, 18, 19, 20, 21, 22, 23, 24, 25, 26].forEach(idx => {
        if (header[idx]) {
          console.log(`  [${idx}] ${header[idx].replace(/\n/g, ' ')}: "${row[idx] !== undefined ? row[idx] : ''}"`);
        }
      });
      if (count >= 3) break;
    }
  }

  // Also check distinct values of PIC in col 1 for Tuyet
  const picSet = new Set();
  for (let i = 1; i < rows.length; i++) {
    const pic = rows[i][1];
    if (pic && /tuyết|tuyet/i.test(pic)) {
      picSet.add(pic);
    }
  }
  console.log('\nDistinct PIC values for Tuyet:', Array.from(picSet));
})().catch(console.error);
