const { getClients } = require('../src/lib/google.cjs');

async function listFolderContents() {
  const { drive } = getClients();

  const imgFolderId = '1aJpp0gRissAL8jB8lSR2HsfcZS9HMKTV';
  const vidFolderId = '1qeR2OrL0pdQJNbarbuZVvA7CKP69lG3D';

  console.log('=== FILES IN FOLDER ẢNH ===');
  const imgRes = await drive.files.list({
    q: `'${imgFolderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, size)',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  (imgRes.data.files || []).forEach(f => console.log(`- [${f.id}] ${f.name} (${Math.round((f.size||0)/1024)} KB)`));

  console.log('\n=== FILES IN FOLDER VIDEO ===');
  const vidRes = await drive.files.list({
    q: `'${vidFolderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, size)',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  (vidRes.data.files || []).forEach(f => console.log(`- [${f.id}] ${f.name} (${Math.round((f.size||0)/1024)} KB)`));
}

listFolderContents().catch(e => console.error(e));

