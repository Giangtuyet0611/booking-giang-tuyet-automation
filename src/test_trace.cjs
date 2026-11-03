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

  console.log('--- FILES IN [0] Mẫu (1EFynO084xbkvE9DVHgIZP0DlXYAiyyUt) ---');
  const templates = await drive.files.list({
    q: "'1EFynO084xbkvE9DVHgIZP0DlXYAiyyUt' in parents and trashed = false",
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  console.log(templates.data.files);

  console.log('\n--- FOLDERS IN [3] Hợp Đồng (13dVe4sbx9Q4yOTbbP29xiIEy6tySWr9w) ---');
  const hopDongChildren = await drive.files.list({
    q: "'13dVe4sbx9Q4yOTbbP29xiIEy6tySWr9w' in parents and trashed = false",
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  console.log(hopDongChildren.data.files);

  // Let's find Saga folder inside [3] Hợp Đồng
  const sagaFolder = hopDongChildren.data.files.find(f => f.name.toLowerCase().includes('saga'));
  if (sagaFolder) {
    console.log(`\n--- FOLDERS IN Saga (${sagaFolder.id}) ---`);
    const sagaChildren = await drive.files.list({
      q: `'${sagaFolder.id}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    console.log(sagaChildren.data.files);

    // Let's find Năm 2026 inside Saga
    const nam2026 = sagaChildren.data.files.find(f => f.name.includes('2026'));
    if (nam2026) {
      console.log(`\n--- FOLDERS IN Năm 2026 (${nam2026.id}) ---`);
      const namChildren = await drive.files.list({
        q: `'${nam2026.id}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });
      console.log(namChildren.data.files);

      // Find [0] File mềm inside Năm 2026
      const fileMem = namChildren.data.files.find(f => f.name.includes('File mềm'));
      if (fileMem) {
        console.log(`\n--- FOLDERS IN [0] File mềm (${fileMem.id}) ---`);
        const fileMemChildren = await drive.files.list({
          q: `'${fileMem.id}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });
        console.log(fileMemChildren.data.files);
      }
    }
  }
}

main().catch(console.error);
