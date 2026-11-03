const { google } = require('googleapis');
const fs = require('fs');

async function testConvert() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });

  // Download the docx template (1lB7v7X0OIOt-77gsD9eY93ZEqySui96h or 19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V)
  const templateId = '19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V';
  console.log('Downloading template docx...');
  const res = await drive.files.get({
    fileId: templateId,
    alt: 'media',
    supportsAllDrives: true
  }, { responseType: 'stream' });

  // Upload and convert to Google Doc
  console.log('Uploading and converting to Google Doc...');
  const uploadRes = await drive.files.create({
    requestBody: {
      name: 'TEST_CONVERTED_DOC',
      mimeType: 'application/vnd.google-apps.document',
      parents: ['1L_w9zOlQtul_EXviyK83ZTBVRomsdLC4']
    },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: res.data
    },
    supportsAllDrives: true,
    fields: 'id, name, mimeType'
  });

  console.log('Converted result:', uploadRes.data);

  // Now delete the test file
  await drive.files.delete({ fileId: uploadRes.data.id, supportsAllDrives: true });
  console.log('Cleaned up test file.');
}

testConvert().catch(console.error);
