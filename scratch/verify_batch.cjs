const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

const ROWS = [307, 1040, 1063, 685, 306, 279, 416, 305, 1066, 977, 2463, 592, 1037, 1099, 494];

async function verify() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  const ranges = [`'${tabName}'!A1:AA1`, ...ROWS.map(r => `'${tabName}'!A${r}:AA${r}`)];
  const res = await s.spreadsheets.values.batchGet({ spreadsheetId, ranges });

  const headers = res.data.valueRanges[0].values[0];
  console.log('=== VERIFICATION SUMMARY ===');
  for (let i = 1; i < ranges.length; i++) {
    const row = res.data.valueRanges[i].values[0];
    const rNum = ROWS[i - 1];
    console.log(`\nRow ${rNum}:`);
    console.log(`  PIC: "${row[1]}" | Channel: "${row[4]}" | Status: "${row[18]}"`);
    console.log(`  Gift count: "${row[20]}" | Products: "${row[21]}"`);
    console.log(`  Total gift cost: "${row[22]}" | Auto cost: "${row[23]}" | Cast: "${row[24]}" | Total deal: "${row[25]}"`);
    console.log(`  Date Book: "${row[26]}"`);
  }
}

verify().catch(console.error);
