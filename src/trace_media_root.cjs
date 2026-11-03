const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  console.log('Searching for folder with subfolder Video & Hinh anh...');
  const res = await drive.files.list({
    q: "(name = 'Video' or name = 'Hình ảnh') and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id, name, mimeType, parents)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 10
  });
  console.log('Video/Hinh anh folders:', JSON.stringify(res.data.files, null, 2));

  if (res.data.files.length > 0) {
    const parentId = res.data.files[0].parents[0];
    const parentMeta = await drive.files.get({
      fileId: parentId,
      fields: 'id, name, parents',
      supportsAllDrives: true
    });
    console.log('Parent KOC folder:', parentMeta.data);

    if (parentMeta.data.parents) {
      const yearMeta = await drive.files.get({
        fileId: parentMeta.data.parents[0],
        fields: 'id, name, parents',
        supportsAllDrives: true
      });
      console.log('Grandparent (Year) folder:', yearMeta.data);

      if (yearMeta.data.parents) {
        const rootMeta = await drive.files.get({
          fileId: yearMeta.data.parents[0],
          fields: 'id, name, parents',
          supportsAllDrives: true
        });
        console.log('Great-grandparent (Media Root) folder:', rootMeta.data);
      }
    }
  }
}

run().catch(console.error);
