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
  const res = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1164:AA1500`,
  });

  const rows = res.data.values || [];
  console.log(`Checking rows 1164 to 1500 (${rows.length} rows):`);

  rows.forEach((r, idx) => {
    const rowNum = 1164 + idx;
    const pic = r[1] || '';
    const chan = r[4] || '';
    const proj = r[16] || '';
    const stat = r[18] || '';
    if (pic === 'Thanh Hà' || pic === 'Tuyết' || /cô dâu|saga/i.test(proj)) {
      console.log(`Row ${rowNum} | PIC="${pic}" | Channel="${chan}" | Status="${stat}" | Proj="${proj}"`);
    }
  });

  // Also inspect Row 511 in detail
  const res511 = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A511:AA511`,
  });
  console.log('\nRow 511 in detail:', JSON.stringify(res511.data.values[0]));
}

main().catch(console.error);
