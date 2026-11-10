const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const drive = google.drive({ version: 'v3', auth: a });
const sheets = google.sheets({ version: 'v4', auth: a });

async function main() {
  const rootId = '117T7PVrbn48hc97-02JMj3K4ApYeSDPZ';
  const res = await drive.files.list({
    q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name)'
  });
  console.log('Subfolders in [0] File mem:');
  res.data.files.forEach(f => console.log(`  ${f.name} (${f.id})`));

  // Inspect Row 204 in Data KOC
  const sRes = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: "'Data KOC (11/2026)'!A204:AA204"
  });
  console.log('Row 204:', JSON.stringify(sRes.data.values[0]));
}

main().catch(console.error);
