const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  console.log('Searching for Media / Materials root folder...');
  const res = await drive.files.list({
    q: "(name contains 'Materials' or name contains 'Media' or name contains 'Thành phẩm') and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id, name, mimeType, parents)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 30
  });
  console.log('Folders found:', JSON.stringify(res.data.files, null, 2));
}

run().catch(console.error);
