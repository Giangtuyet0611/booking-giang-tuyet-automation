const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: "'1EFynO084xbkvE9DVHgIZP0DlXYAiyyUt' in parents and trashed = false",
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  console.log('Files in [0] Mau:', JSON.stringify(res.data.files, null, 2));

  // Also search for any Google Docs with "Hợp đồng Thương mại" or "Trả cast"
  const searchCast = await drive.files.list({
    q: "name contains 'Trả cast' and mimeType = 'application/vnd.google-apps.document' and trashed = false",
    fields: 'files(id, name, mimeType, parents)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  console.log('Google Docs with Trả cast:', JSON.stringify(searchCast.data.files, null, 2));
}

main().catch(console.error);
