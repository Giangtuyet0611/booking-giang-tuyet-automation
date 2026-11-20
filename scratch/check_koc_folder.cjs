const { getClients } = require('../src/lib/google.cjs');

async function checkKocFolder() {
  const { drive } = getClients();
  const year2026FolderId = '1pfe51QxlMM5H0BBXh3wb5eRqQBJWOgXI';

  const res = await drive.files.list({
    q: `'${year2026FolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  console.log('=== KOC FOLDERS IN 2026 ===');
  const matches = (res.data.files || []).filter(f => f.name.toLowerCase().includes('hậu phương') || f.name.toLowerCase().includes('hau phuong') || f.name.toLowerCase().includes('tour guide'));
  console.log('Matches:', matches);
  if (matches.length === 0) {
    console.log('No existing folder found for Hậu Phương Tour Guide in 2026.');
  }
}

checkKocFolder().catch(e => console.error(e));

