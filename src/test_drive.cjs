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

  console.log('Searching across all drives...');
  const res = await drive.files.list({
    q: "name = '[0] File mềm' or name = '[0] Mẫu' or name = 'Tháng 10' or name = '[3] Hợp Đồng' or name = '[0] Booking KOC/KOL'",
    fields: 'files(id, name, mimeType, parents)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 30
  });

  console.log(JSON.stringify(res.data.files, null, 2));

  // Let's also check parent folder 1jdoa16sX_3Dz_87GFhw14NXjxyr6Ze2-
  try {
    const parentRes = await drive.files.get({
      fileId: '1jdoa16sX_3Dz_87GFhw14NXjxyr6Ze2-',
      fields: 'id, name, parents',
      supportsAllDrives: true
    });
    console.log('Parent 1jdoa...:', parentRes.data);
  } catch (e) {
    console.log('Error getting parent:', e.message);
  }
}

main().catch(console.error);
