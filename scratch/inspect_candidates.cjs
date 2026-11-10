const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function inspectCandidates() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  const rowIndices = [196, 303, 309, 511, 513, 1011, 1141, 1160, 1163];

  const headers = (await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:AA1`
  })).data.values[0];

  for (const r of rowIndices) {
    const res = await s.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tabName}'!A${r}:AA${r}`
    });
    const row = res.data.values ? res.data.values[0] : [];
    console.log(`\n=== ROW ${r} ===`);
    row.forEach((val, i) => {
      if (val) console.log(`  [${i}] ${headers[i].replace(/\n/g, ' ')}: "${val}"`);
    });
  }
}

inspectCandidates().catch(console.error);
