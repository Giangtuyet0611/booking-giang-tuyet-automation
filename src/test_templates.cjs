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

  console.log('--- TEMPLATES IN Đồng Hồ Hải Triều (1VVMbAsWsqi6cIQjeAvmO2XtKCZJ9TXLE) ---');
  const templates = await drive.files.list({
    q: "'1VVMbAsWsqi6cIQjeAvmO2XtKCZJ9TXLE' in parents and trashed = false",
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  console.log(templates.data.files);
}

main().catch(console.error);
