const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  const folderId = '1j81rMtBefFggNcfuqbnuUNlJZyLNesC4';
  console.log(`Inspecting reference folder: ${folderId}...`);

  const folderMeta = await drive.files.get({
    fileId: folderId,
    fields: 'id, name, mimeType, parents',
    supportsAllDrives: true
  });
  console.log('Folder Info:', folderMeta.data);

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, size)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  console.log('Files inside:', JSON.stringify(res.data.files, null, 2));
}

run().catch(console.error);
