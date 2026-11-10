const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function main() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  const res = await s.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [`'${tabName}'!A1:AA1`, `'${tabName}'!A2463:AA2463`, `'${tabName}'!A2502:AA2502`]
  });

  const headers = res.data.valueRanges[0].values[0];
  console.log('Row 2463:');
  (res.data.valueRanges[1].values[0] || []).forEach((v, i) => {
    if (v) console.log(`  [${i}] ${headers[i].replace(/\n/g, ' ')}: "${v}"`);
  });

  console.log('\nRow 2502:');
  (res.data.valueRanges[2].values[0] || []).forEach((v, i) => {
    if (v) console.log(`  [${i}] ${headers[i].replace(/\n/g, ' ')}: "${v}"`);
  });
}

main().catch(console.error);
