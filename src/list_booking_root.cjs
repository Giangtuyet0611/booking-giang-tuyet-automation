const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  console.log('Listing contents of [0] Booking KOC/KOL (1OTvybZrJqKk7_kv1y9fDCZVWaxrr_BYq)...');
  const res = await drive.files.list({
    q: "'1OTvybZrJqKk7_kv1y9fDCZVWaxrr_BYq' in parents and trashed = false",
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 50
  });
  console.log('Files:', JSON.stringify(res.data.files, null, 2));
}

run().catch(console.error);
