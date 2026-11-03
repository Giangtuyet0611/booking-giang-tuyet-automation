/**
 * Tiện ích quản lý và tìm/tạo thư mục Drive thông minh
 * Quy tắc:
 * - Nếu thư mục Năm / Tháng đã tồn tại -> DÙNG LẠI THƯ MỤC CÓ SẴN, TUYỆT ĐỐI KHÔNG TẠO MỚI!
 * - Chỉ tạo mới khi chưa tồn tại.
 */

async function getOrCreateSubfolder(drive, parentId, folderName) {
  // Tìm kiếm thư mục con trong parentId
  const query = `'${parentId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  
  const searchRes = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 5
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    const existing = searchRes.data.files[0];
    console.log(`[Drive] Tìm thấy thư mục có sẵn: "${existing.name}" (ID: ${existing.id}) -> Dùng lại.`);
    return existing.id;
  }

  // Nếu chưa có, tạo mới
  console.log(`[Drive] Chưa có thư mục "${folderName}" trong parent (${parentId}) -> Tạo mới.`);
  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    },
    supportsAllDrives: true,
    fields: 'id, name'
  });

  return createRes.data.id;
}

module.exports = { getOrCreateSubfolder };
