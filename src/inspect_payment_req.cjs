const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  console.log('1. Checking PAYMENT_REQUEST_TEMPLATE_ID (1Nrddzf6LNfW49sPGLxSOBq7vjn-dPvgh)...');
  try {
    const file = await drive.files.get({
      fileId: '1Nrddzf6LNfW49sPGLxSOBq7vjn-dPvgh',
      fields: 'id, name, mimeType',
      supportsAllDrives: true
    });
    console.log('Template file:', file.data);
  } catch (e) {
    console.log('Error template:', e.message);
  }

  console.log('\n2. Listing [1] Đề nghị thanh toán cho KOC (11f7opbjvk0q4E9dZIrwGm-FhpEyrjw5j)...');
  try {
    const files = await drive.files.list({
      q: "'11f7opbjvk0q4E9dZIrwGm-FhpEyrjw5j' in parents and trashed = false",
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 20
    });
    console.log('Files in [1] Đề nghị thanh toán:', files.data.files);
  } catch (e) {
    console.log('Error listing folder:', e.message);
  }
}

run().catch(console.error);
