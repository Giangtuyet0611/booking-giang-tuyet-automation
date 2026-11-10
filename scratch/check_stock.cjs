const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const sheets = google.sheets({ version: 'v4', auth: a });

async function checkStock() {
  const spreadsheetId = '1jqSBCvOJNjrMKjlJuxKDVJQ1xY0KcNfZgo_zFKWIJuc';
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  console.log('Sheets in stock spreadsheet:');
  meta.data.sheets.forEach(s => console.log('  ' + s.properties.title + ' (id: ' + s.properties.sheetId + ')'));

  const firstTab = meta.data.sheets[0].properties.title;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${firstTab}'!A1:Z500`
  });
  const rows = res.data.values || [];
  console.log('Header:', rows[0]);
  for (let r = 0; r < rows.length; r++) {
    const text = (rows[r] || []).join(' ');
    if (text.includes('71959')) {
      console.log(`Row ${r + 1}:`, rows[r]);
    }
  }
}

checkStock().catch(console.error);
