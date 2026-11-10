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
    range: `'${tabName}'!A:AA`,
  });

  const rows = res.data.values || [];

  // Filter all rows of Thanh Hà and Tuyết where Project or Channel is relevant
  // Especially check the rows between 1 and 1500
  const earlyRows = [];
  for (let r = 1; r < 1200 && r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const pic = row[1] || '';
    const chan = row[4] || '';
    const proj = row[16] || '';
    const stat = row[18] || '';
    const contact = row[14] || '';
    const tiktok = row[10] || '';
    const fb = row[11] || '';
    if (pic === 'Thanh Hà' || pic === 'Tuyết' || /cô dâu|saga/i.test(proj)) {
      earlyRows.push({
        rowNum: r + 1,
        pic,
        chan,
        stat,
        proj,
        contact,
        tiktok,
        fb
      });
    }
  }

  fs.writeFileSync('d:/Booking/scratch/early_rows.json', JSON.stringify(earlyRows, null, 2), 'utf8');
  console.log(`Saved ${earlyRows.length} rows to early_rows.json`);
}

main().catch(console.error);
