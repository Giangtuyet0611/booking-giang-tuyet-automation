const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  console.log('--- Inspecting folder 1cpinCs7Lvis5uFwAUxZwa-7TS-ktN8qB ---');
  try {
    const folderRes = await drive.files.list({
      q: "'1cpinCs7Lvis5uFwAUxZwa-7TS-ktN8qB' in parents and trashed = false",
      fields: 'files(id, name, mimeType, size)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    console.log('Files in folder:', folderRes.data.files);
  } catch (err) {
    console.log('Folder error:', err.message);
  }

  console.log('--- Inspecting file 1Toa-1dd3KBHJEUuk2gj_DMIwoepsW6y4 ---');
  try {
    const fileRes = await drive.files.get({
      fileId: '1Toa-1dd3KBHJEUuk2gj_DMIwoepsW6y4',
      fields: 'id, name, mimeType, size',
      supportsAllDrives: true
    });
    console.log('File info:', fileRes.data);
  } catch (err) {
    console.log('File error:', err.message);
  }
}

main().catch(console.error);
