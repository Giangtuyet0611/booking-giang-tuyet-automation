const { getClients } = require('../lib/google.cjs');
const { getOrCreateSubfolder } = require('../utils/drive_folder.util.cjs');

async function executeHauPhuong() {
  const { drive, sheets } = getClients();

  console.log('========================================================================');
  console.log('BẮT ĐẦU XỬ LÝ MEDIA MATERIALS & BÁO CÁO POST AIR: HẬU PHƯƠNG TOUR GUIDE');
  console.log('========================================================================\n');

  // ---------------------------------------------------------
  // BƯỚC 1: XỬ LÝ DRIVE - TẠO THƯ MỤC & COPY / ĐỔI TÊN CHUẨN
  // ---------------------------------------------------------
  const year2026FolderId = '1pfe51QxlMM5H0BBXh3wb5eRqQBJWOgXI';
  const kocFolderName = '2026-11-04 - Hậu Phương Tour Guide';
  
  console.log(`1. Tạo / Tìm thư mục KOC: "${kocFolderName}" trong năm 2026...`);
  const kocFolderId = await getOrCreateSubfolder(drive, year2026FolderId, kocFolderName);
  const kocFolderUrl = `https://drive.google.com/drive/folders/${kocFolderId}`;

  console.log('2. Tạo 2 thư mục con "Hình ảnh" và "Video"...');
  const imageFolderId = await getOrCreateSubfolder(drive, kocFolderId, 'Hình ảnh');
  const videoFolderId = await getOrCreateSubfolder(drive, kocFolderId, 'Video');

  const imageFolderUrl = `https://drive.google.com/drive/folders/${imageFolderId}`;
  const videoFolderUrl = `https://drive.google.com/drive/folders/${videoFolderId}`;

  // 2.1 Copy Video
  // Source video ID: 14MeKZn483ccosvW9OAPfwTowm47hySv8
  const videoNewName = 'KOC SAGA, Hậu Phương Tour Guide, Saga Stella 72109-SVMWSV-2, Video chia sẻ Kể chuyện hành trình yêu nhau.mov';
  console.log(`\n3. Đang copy Video: "${videoNewName}"...`);
  const copyVid = await drive.files.copy({
    fileId: '14MeKZn483ccosvW9OAPfwTowm47hySv8',
    supportsAllDrives: true,
    requestBody: {
      name: videoNewName,
      parents: [videoFolderId]
    },
    fields: 'id, name'
  });
  console.log(`   -> Copy thành công Video: ID ${copyVid.data.id}`);

  // 2.2 Copy 8 ảnh
  const photos = [
    // Xa: 4495, 0862, 3716
    { id: '1z-7TemA_ZmVYGihoFyyLyMDuwziAbPzB', code: '4495', angle: 'Góc xa', ext: 'jpeg' },
    { id: '1qsAo6f-s34ZaI3XLRk12nKnB14pWZBXr', code: '0862', angle: 'Góc xa', ext: 'JPG' },
    { id: '1B3o8PjIIdZkVoN_eNRK9-ZIl5iSdN-hk', code: '3716', angle: 'Góc xa', ext: 'jpeg' },
    // Trung: 0863, 0053
    { id: '1tzyyN9I1RAkO-2NCiZ9tdI2h-wjMUKME', code: '0863', angle: 'Góc trung', ext: 'JPG' },
    { id: '1CBPrcq3_EOIi01S3ZzbXBrUZ7Vzi_ZKG', code: '0053', angle: 'Góc trung', ext: 'JPG' },
    // Cận: 4313, 3625, 3621
    { id: '16-bJlWiVcJObwIJLPaTYofbThYrazOzN', code: '4313', angle: 'Góc cận', ext: 'jpeg' },
    { id: '1HSNWfDyCAv2PWdlViv1eFF_igUmqojN0', code: '3625', angle: 'Góc cận', ext: 'jpeg' },
    { id: '1m65HGXBmw524lJU55bvGCgVilKz4Aeu8', code: '3621', angle: 'Góc cận', ext: 'jpeg' }
  ];

  console.log(`\n4. Đang copy 8 ảnh vào thư mục "Hình ảnh"...`);
  const copiedPhotos = [];
  for (const p of photos) {
    const photoName = `KOC SAGA, Hậu Phương Tour Guide, Saga Stella 72109-SVMWSV-2, Bộ ảnh pre wedding - ${p.angle} ${p.code}.${p.ext}`;
    console.log(`   -> Copy [${p.code}] -> "${photoName}"`);
    const cRes = await drive.files.copy({
      fileId: p.id,
      supportsAllDrives: true,
      requestBody: {
        name: photoName,
        parents: [imageFolderId]
      },
      fields: 'id, name'
    });
    copiedPhotos.push({ code: p.code, name: photoName, id: cRes.data.id });
  }
  console.log(`-> Đã copy đủ 8/8 ảnh thành công!`);

  // ---------------------------------------------------------
  // BƯỚC 2: GHI NHẬN 4 DÒNG POST AIR VÀO SHEET "Report Saga"
  // ---------------------------------------------------------
  const spreadsheetId = '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I';
  const tabName = 'Report Saga';

  console.log(`\n5. Tìm dòng trống đầu tiên trên Sheet "${tabName}"...`);
  const checkEmptyRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!F3:F100`
  });
  const fVals = checkEmptyRes.data.values || [];
  let startRow = 3;
  for (let i = 0; i < fVals.length; i++) {
    if (!fVals[i] || !fVals[i][0] || fVals[i][0].trim() === '') {
      startRow = 3 + i;
      break;
    }
    startRow = 3 + i + 1;
  }
  console.log(`-> Dòng trống bắt đầu ghi nhận: Dòng ${startRow}`);

  // Định nghĩa 4 bài đăng:
  // 1. Instagram: https://www.instagram.com/p/DfXBpApk8Ho/?cplk=eWhzZ2U1NGY4dTQw -> Format Hình ảnh, nhãn Instagram
  // 2. Facebook: https://www.facebook.com/share/p/1KtLkoFTa3/ -> Format Hình ảnh, nhãn Facebook
  // 3. TikTok Photo: https://www.tiktok.com/@odaychungminhyeunhau/photo/7704663149735185685?_r=1&_t=ZS-9B9RV5Wk8aC -> Format Hình ảnh, nhãn Tiktok Photo
  // 4. TikTok Video: https://www.tiktok.com/@odaychungminhyeunhau/video/7703917742520306964?_r=1&_t=ZS-9B6252xAlb2 -> Format Video, nhãn Tiktok

  const todayStr = '13/11/2026';
  const contactTurn = '1';
  const channelName = 'Hậu Phương Tour Guide';
  const materialsHyperlink = `=HYPERLINK("${kocFolderUrl}"; "Thành phẩm KOC Hậu Phương Tour Guide")`;
  const sdha = 'Trọn đời';

  const postsData = [
    {
      format: 'Hình ảnh',
      platform: 'Instagram',
      url: 'https://www.instagram.com/p/DfXBpApk8Ho/?cplk=eWhzZ2U1NGY4dTQw',
      label: 'Instagram'
    },
    {
      format: 'Hình ảnh',
      platform: 'Facebook',
      url: 'https://www.facebook.com/share/p/1KtLkoFTa3/',
      label: 'Facebook'
    },
    {
      format: 'Hình ảnh',
      platform: 'Tiktok',
      url: 'https://www.tiktok.com/@odaychungminhyeunhau/photo/7704663149735185685?_r=1&_t=ZS-9B9RV5Wk8aC',
      label: 'Tiktok Photo'
    },
    {
      format: 'Video',
      platform: 'Tiktok',
      url: 'https://www.tiktok.com/@odaychungminhyeunhau/video/7703917742520306964?_r=1&_t=ZS-9B6252xAlb2',
      label: 'Tiktok'
    }
  ];

  // Ghi từng dòng để đảm bảo không ghi đè cột có công thức
  // Các cột cần ghi:
  // - Col B: Ngày AIR
  // - Col E: Liên hệ lần thứ
  // - Col F: Tên kênh
  // - Col M: Materials
  // - Col N: Format
  // - Col O: Thời gian SDHA
  // - Col P: Kênh đăng
  // - Col Q: Link post

  for (let idx = 0; idx < postsData.length; idx++) {
    const curRow = startRow + idx;
    const post = postsData[idx];
    const postLinkFormula = `=HYPERLINK("${post.url}"; "${post.label}")`;

    console.log(`\n6.${idx + 1} Đang ghi Dòng ${curRow} (${post.platform} - ${post.label})...`);

    // Ghi Col B: Ngày AIR
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${tabName}'!B${curRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[todayStr]] }
    });

    // Ghi Col E & F: Liên hệ lần thứ & Tên kênh
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${tabName}'!E${curRow}:F${curRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[contactTurn, channelName]] }
    });

    // Ghi Col M, N, O, P, Q
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${tabName}'!M${curRow}:Q${curRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          materialsHyperlink,
          post.format,
          sdha,
          post.platform,
          postLinkFormula
        ]]
      }
    });
  }

  // ---------------------------------------------------------
  // BƯỚC 3: KIỂM TRA ĐỐI CHIẾU LẠI 4 DÒNG TRÊN REPORT SAGA
  // ---------------------------------------------------------
  console.log(`\n7. Đang kiểm tra đối chiếu dữ liệu 4 dòng (${startRow} đến ${startRow + 3})...`);
  const verifyRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A${startRow}:R${startRow + 3}`
  });

  const verifiedRows = verifyRes.data.values || [];
  console.log('========================================================================');
  console.log('KẾT QUẢ ĐỒNG BỘ REPORT SAGA:');
  verifiedRows.forEach((r, i) => {
    const rowNum = startRow + i;
    console.log(`Dòng ${rowNum}:`);
    console.log(`  - Ngày BOOK (Auto): ${r[0] || '(Đang kéo)'}`);
    console.log(`  - Ngày AIR: ${r[1]}`);
    console.log(`  - Người phụ trách (Auto): ${r[3] || '(Đang kéo)'}`);
    console.log(`  - Liên hệ lần thứ: ${r[4]}`);
    console.log(`  - Tên kênh: ${r[5]}`);
    console.log(`  - Dự án (Auto): ${r[9] || '(Đang kéo)'}`);
    console.log(`  - Mã SP (Auto): ${r[10] || '(Đang kéo)'}`);
    console.log(`  - Materials: ${r[12]}`);
    console.log(`  - Format: ${r[13]}`);
    console.log(`  - SDHA: ${r[14]}`);
    console.log(`  - Kênh đăng: ${r[15]}`);
    console.log(`  - Link post: ${r[16]}`);
    console.log(`  - Chi phí sau deal (Auto): ${r[17] || '(Đang kéo)'}`);
  });
  console.log('========================================================================\n');

  return {
    kocFolderName,
    kocFolderUrl,
    imageFolderUrl,
    videoFolderUrl,
    copiedVideo: videoNewName,
    copiedPhotosCount: copiedPhotos.length,
    reportUpdatedRows: `${startRow} đến ${startRow + 3}`
  };
}

module.exports = { executeHauPhuong };

