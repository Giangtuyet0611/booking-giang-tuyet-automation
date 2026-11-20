const { getClients } = require('../lib/google.cjs');
const { getOrCreateSubfolder } = require('../utils/drive_folder.util.cjs');
const path = require('path');

/**
 * Liệt kê tất cả files trong một thư mục Drive (bao gồm duyệt đệ quy subfolder nếu có)
 */
async function listAllFilesRecursive(drive, folderId) {
  let allFiles = [];
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size)',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken: pageToken
    });

    const files = res.data.files || [];
    for (const f of files) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        const subFiles = await listAllFilesRecursive(drive, f.id);
        allFiles = allFiles.concat(subFiles);
      } else {
        allFiles.push(f);
      }
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return allFiles;
}

/**
 * Tìm thư mục năm 2026 trong Media Root
 */
async function getMediaYearFolder() {
  const { drive, config } = getClients();
  const mediaRootId = config.MEDIA_ROOT_FOLDER_ID || '1haQ5DK8FYMHJ-7bDzmR5SldEIHyePVDl';
  // Folder 2026 ID mặc định: 1pfe51QxlMM5H0BBXh3wb5eRqQBJWOgXI
  return await getOrCreateSubfolder(drive, mediaRootId, '2026');
}

/**
 * Tìm thư mục KOC đã có trong năm 2026 (hoặc tạo mới)
 */
async function getOrCreateKocMediaFolder(drive, yearFolderId, kocName) {
  // Tìm xem có folder nào chứa tên KOC không
  const res = await drive.files.list({
    q: `'${yearFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name contains '${kocName}' and trashed = false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  if (res.data.files && res.data.files.length > 0) {
    const existing = res.data.files[0];
    console.log(`[Media] Tìm thấy thư mục KOC đã có: "${existing.name}" (ID: ${existing.id})`);
    return existing.id;
  }

  // Nếu chưa có, tạo theo chuẩn ISO YYYY-MM-DD - Tên KOC
  const today = new Date().toISOString().slice(0, 10);
  const newFolderName = `${today} - ${kocName}`;
  console.log(`[Media] Tạo thư mục KOC mới: "${newFolderName}"...`);
  return await getOrCreateSubfolder(drive, yearFolderId, newFolderName);
}

/**
 * Thực thi xử lý media: copy các ảnh được chọn từ folder nguồn sang folder KOC chuẩn
 */
async function handleMediaCommand(options = {}) {
  const { drive } = getClients();
  const sourceFolderId = options.source || '1RhiRuTC0taLfJiw8mzQEbhrsetxIrNYd';
  const kocName = options.koc || 'Quỳnh Musé';
  const productName = options.product || 'Saga Stella Rectangle 71836-SVSVSV-2';

  console.log('========================================================================');
  console.log(`BẮT ĐẦU XỬ LÝ MEDIA MATERIALS CHO KOC: ${kocName}`);
  console.log(`Sản phẩm: ${productName}`);
  console.log(`Folder nguồn: ${sourceFolderId}`);
  console.log('========================================================================\n');

  // 1. Quét danh sách file từ source folder
  console.log('1. Đang quét danh sách file từ thư mục nguồn...');
  const sourceFiles = await listAllFilesRecursive(drive, sourceFolderId);
  console.log(`   Tìm thấy ${sourceFiles.length} file trong thư mục nguồn:`);
  sourceFiles.forEach(f => console.log(`   - [${f.id}] ${f.name} (${Math.round((f.size || 0)/1024)} KB)`));

  // 2. Định nghĩa danh sách ảnh cần lấy theo yêu cầu của user
  // Concept 1: Mặc đầm chụp lookbook
  // Xa: 2691, 2651
  // Trung: 2668, 2656, 2600
  // Cận: 2678, 2604
  // Concept 2: Mặc vest chụp lookbook
  // Xa: 2584 (Tạm)
  // Trung: 2555, 2531, 2489
  // Cận: 2565, 2561, 2547, 2479
  const targets = [
    // Concept 1
    { code: '2691', concept: 'Mặc đầm chụp lookbook', angle: 'Góc xa' },
    { code: '2651', concept: 'Mặc đầm chụp lookbook', angle: 'Góc xa' },
    { code: '2668', concept: 'Mặc đầm chụp lookbook', angle: 'Góc trung' },
    { code: '2656', concept: 'Mặc đầm chụp lookbook', angle: 'Góc trung' },
    { code: '2600', concept: 'Mặc đầm chụp lookbook', angle: 'Góc trung' },
    { code: '2678', concept: 'Mặc đầm chụp lookbook', angle: 'Góc cận' },
    { code: '2604', concept: 'Mặc đầm chụp lookbook', angle: 'Góc cận' },

    // Concept 2
    { code: '2584', concept: 'Mặc vest chụp lookbook', angle: 'Góc xa', note: '(Tạm)' },
    { code: '2555', concept: 'Mặc vest chụp lookbook', angle: 'Góc trung' },
    { code: '2531', concept: 'Mặc vest chụp lookbook', angle: 'Góc trung' },
    { code: '2489', concept: 'Mặc vest chụp lookbook', angle: 'Góc trung' },
    { code: '2565', concept: 'Mặc vest chụp lookbook', angle: 'Góc cận' },
    { code: '2561', concept: 'Mặc vest chụp lookbook', angle: 'Góc cận' },
    { code: '2547', concept: 'Mặc vest chụp lookbook', angle: 'Góc cận' },
    { code: '2479', concept: 'Mặc vest chụp lookbook', angle: 'Góc cận' },
  ];

  // 3. Chuẩn bị thư mục đích trong Media Root 2026
  console.log('\n2. Chuẩn bị thư mục đích...');
  const yearFolderId = await getMediaYearFolder();
  const kocFolderId = await getOrCreateKocMediaFolder(drive, yearFolderId, kocName);
  const imageFolderId = await getOrCreateSubfolder(drive, kocFolderId, 'Hình ảnh');
  const targetFolderUrl = `https://drive.google.com/drive/folders/${imageFolderId}`;
  console.log(`   -> Thư mục lưu ảnh: ${targetFolderUrl}`);

  // 4. Khớp và copy từng file
  console.log('\n3. Bắt đầu copy và chuẩn hóa tên file...');
  const results = [];
  const notFound = [];

  for (const t of targets) {
    // Tìm file chứa mã số code
    const matched = sourceFiles.find(f => {
      const name = f.name.toLowerCase();
      // Khớp số code xuất hiện như một token hoặc trong tên
      return name.includes(t.code);
    });

    if (!matched) {
      console.warn(`   ⚠️ Không tìm thấy ảnh có mã số: ${t.code} (${t.concept} - ${t.angle})`);
      notFound.push(t);
      continue;
    }

    // Xác định phần mở rộng (ext)
    const extMatch = matched.name.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? `.${extMatch[1]}` : '.jpg';

    // Đặt tên theo chuẩn: KOC SAGA, TÊN KOC, tên sản phẩm, concept - góc số_hiệu.ext
    // Ví dụ: KOC SAGA, Quỳnh Musé, Saga Stella Rectangle 71836-SVSVSV-2, Mặc đầm chụp lookbook - Góc xa 2691.jpg
    const noteSuffix = t.note ? ` ${t.note}` : '';
    const newName = `KOC SAGA, ${kocName}, ${productName}, ${t.concept} - ${t.angle} ${t.code}${noteSuffix}${ext}`;

    console.log(`   -> Copy: [${matched.name}] -> "${newName}"`);
    
    const copied = await drive.files.copy({
      fileId: matched.id,
      supportsAllDrives: true,
      requestBody: {
        name: newName,
        parents: [imageFolderId]
      },
      fields: 'id, name, webViewLink'
    });

    results.push({
      code: t.code,
      concept: t.concept,
      angle: t.angle,
      note: t.note,
      oldName: matched.name,
      newName: newName,
      fileId: copied.data.id
    });
  }

  console.log('\n========================================================================');
  console.log(`HOÀN TẤT: Đã copy & đổi tên thành công ${results.length}/${targets.length} ảnh.`);
  if (notFound.length > 0) {
    console.log(`⚠️ Có ${notFound.length} ảnh chưa tìm thấy:`, notFound.map(n => n.code).join(', '));
  }
  console.log(`\nLink thư mục đích "Hình ảnh": ${targetFolderUrl}`);
  console.log('========================================================================\n');

  return {
    success: true,
    totalRequested: targets.length,
    totalCopied: results.length,
    notFound,
    results,
    targetFolderUrl,
    imageFolderId
  };
}

module.exports = {
  listAllFilesRecursive,
  getMediaYearFolder,
  handleMediaCommand
};
