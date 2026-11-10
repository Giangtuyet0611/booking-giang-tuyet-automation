const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function searchTokens() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  // We can fetch in chunks of 3000 rows
  const chunks = ['A1:O3000', 'A3001:O6000', 'A6001:O9000', 'A9001:O12000', 'A12001:O16500'];
  const tokens = ['viihihii', '1DCwSmnFwh', 'samie.cutie', 'samyneee', 'emwaiesei', '71959-RGRGTTR-2', '53229-RGMWRG-4'];

  for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
    const range = `'${tabName}'!${chunks[cIdx]}`;
    const offset = cIdx * 3000;
    const res = await s.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values || [];
    rows.forEach((r, idx) => {
      const line = (r || []).join(' ').toLowerCase();
      tokens.forEach(tok => {
        if (line.includes(tok.toLowerCase())) {
          console.log(`Matched "${tok}" at Row ${offset + idx + 1}: PIC="${r[1]}" | Channel="${r[4]}" | Line="${line.slice(0, 100)}"`);
        }
      });
    });
  }
  console.log('Search finished.');
}

searchTokens().catch(console.error);
