const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const sheets = google.sheets({ version: 'v4', auth: a });

async function checkAllTabs() {
  const spreadsheetId = '1jqSBCvOJNjrMKjlJuxKDVJQ1xY0KcNfZgo_zFKWIJuc';
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  for (const s of meta.data.sheets) {
    const t = s.properties.title;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${t}'!A1:G100`
    });
    const rows = res.data.values || [];
    for (let r = 0; r < rows.length; r++) {
      const line = (rows[r] || []).join(' ');
      if (line.includes('71959-RGRGTTR-2')) {
        console.log(`Found in Tab "${t}" Row ${r + 1}:`, rows[r]);
      }
    }
  }
  console.log('Search in stock sheet complete.');
}

checkAllTabs().catch(console.error);
