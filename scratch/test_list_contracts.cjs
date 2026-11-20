const { getClients } = require('../src/lib/google.cjs');

async function cleanDuplicates() {
  const { drive } = getClients();
  const keepId = '17o87EVE0TfXb2d6T-C-2fNBdEjVOoP4QVbVlKCTdRgs';
  const res = await drive.files.list({
    q: "'1Ui5M-w6wg-yoHMp11hEZjb-I90q_xBWw' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false",
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  const files = res.data.files || [];
  let trashedCount = 0;
  for (const f of files) {
    if (f.name.includes('Đan Quỳnh') && f.id !== keepId) {
      await drive.files.update({
        fileId: f.id,
        supportsAllDrives: true,
        requestBody: { trashed: true }
      });
      console.log(`Đã chuyển vào thùng rác bản trùng: ${f.id}`);
      trashedCount++;
    }
  }
  console.log(`Hoàn tất dọn dẹp: đã chuyển ${trashedCount} bản trùng vào thùng rác. Giữ lại duy nhất: ${keepId}`);
}

cleanDuplicates().catch(console.error);
