const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;

  const auth = new google.auth.OAuth2(
    oauthKeys.client_id,
    oauthKeys.client_secret,
    oauthKeys.redirect_uris[0]
  );
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  console.log('--- FOLDERS/FILES IN Tháng 10 (1L_w9zOlQtul_EXviyK83ZTBVRomsdLC4) ---');
  const thang10 = await drive.files.list({
    q: "'1L_w9zOlQtul_EXviyK83ZTBVRomsdLC4' in parents and trashed = false",
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 15
  });
  console.log(thang10.data.files);
}

main().catch(console.error);
