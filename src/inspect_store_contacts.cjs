const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const sheets = google.sheets({ version: 'v4', auth });

async function inspectStores() {
  const spreadsheetId = '1G-S4EQ-HQHPMqdKk9V26yRVNQ_ZWn-dXezcZNogh-jY';
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  console.log('Spreadsheet Title:', meta.data.properties.title);
  const tabName = meta.data.sheets[0].properties.title;
  console.log('Tab Name:', tabName);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A1:Z100`
  });

  const rows = res.data.values || [];
  console.log('Total rows:', rows.length);
  rows.forEach((r, idx) => {
    console.log(`[Row ${idx + 1}]`, r.join(' | '));
  });

  fs.writeFileSync('d:/Booking/store_contacts_dump.json', JSON.stringify(rows, null, 2), 'utf8');
}

inspectStores().catch(console.error);
