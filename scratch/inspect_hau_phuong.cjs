const { getClients } = require('../src/lib/google.cjs');

async function inspectHauPhuong() {
  const { sheets, drive } = getClients();

  // 1. Search in Data KOC (11/2026)
  console.log('=== SEARCH HẬU PHƯƠNG IN DATA KOC (11/2026) ===');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: `'Data KOC (11/2026)'!A:Z`
  });
  const rows = res.data.values || [];
  console.log(`Total rows in Data KOC: ${rows.length}`);
  const matches = [];
  rows.forEach((r, idx) => {
    const text = (r || []).join(' ').toLowerCase();
    if (text.includes('hậu phương') || text.includes('hau phuong') || text.includes('odaychungminhyeunhau') || text.includes('72109-svmwsv-2') || text.includes('72109')) {
      matches.push({
        row: idx + 1,
        lh: r[3],
        channel: r[4],
        name: r[5],
        pic: r[1],
        status: r[18],
        sp: r[21]
      });
    }
  });
  console.log('Matches:', matches);

  // 2. Inspect Drive folder
  console.log('\n=== INSPECT DRIVE FOLDER 16BokDNjK2W3sS9yf3K_IJ9sAlcspzHRf ===');
  const folderId = '16BokDNjK2W3sS9yf3K_IJ9sAlcspzHRf';
  try {
    const folderRes = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType',
      supportsAllDrives: true
    });
    console.log(`Folder Name: "${folderRes.data.name}"`);

    const filesRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    console.log(`Files count: ${filesRes.data.files?.length || 0}`);
    (filesRes.data.files || []).forEach(f => {
      console.log(`- [${f.id}] ${f.name} (${f.mimeType})`);
    });
  } catch (err) {
    console.error('Drive error:', err.message);
  }
}

inspectHauPhuong().catch(e => console.error(e));

