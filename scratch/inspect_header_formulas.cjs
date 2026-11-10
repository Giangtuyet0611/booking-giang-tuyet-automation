const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function inspectHeaderFormulas() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  const resFormulas = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:AA1`,
    valueRenderOption: 'FORMULA'
  });

  console.log('--- ROW 1 FORMULAS ---');
  resFormulas.data.values[0].forEach((f, i) => {
    if (f.startsWith('=')) {
      console.log(`[Col ${i}] ${f}`);
    } else {
      console.log(`[Col ${i}] text: "${f.replace(/\n/g, ' ')}"`);
    }
  });
}

inspectHeaderFormulas().catch(console.error);
