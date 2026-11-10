const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function inspectTop() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  const resValues = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:AA5`
  });

  const resFormulas = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:AA5`,
    valueRenderOption: 'FORMULA'
  });

  console.log('--- HEADERS (Row 1) ---');
  resValues.data.values[0].forEach((h, i) => console.log(`[${i}] ${h.replace(/\n/g, ' ')}`));

  console.log('\n--- ROW 2 VALUES ---');
  console.log(JSON.stringify(resValues.data.values[1]));

  console.log('\n--- ROW 2 FORMULAS ---');
  console.log(JSON.stringify(resFormulas.data.values[1]));

  console.log('\n--- ROW 3 VALUES ---');
  console.log(JSON.stringify(resValues.data.values[2]));
}

inspectTop().catch(console.error);
