const { google } = require('googleapis');
const fs = require('fs');
const { getOrCreateSubfolder } = require('./utils/drive_folder.util.cjs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    drive: google.drive({ version: 'v3', auth }),
    sheets: google.sheets({ version: 'v4', auth })
  };
}

async function main() {
  const { drive, sheets } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  const mediaRootId = '1haQ5DK8FYMHJ-7bDzmR5SldEIHyePVDl';
  const year2026FolderId = '1pfe51QxlMM5H0BBXh3wb5eRqQBJWOgXI';
  const spreadsheetId = config.SPREADSHEET_REPORT_MATERIALS_ID;
  const materialsTabName = config.TAB_SL_MATERIALS || 'SL materials - Saga v1';

  const kocChannelName = 'giadinhthaovi (20/10)';
  const kocShortName = 'Giadinhthaovi';
  const productName = 'Saga Dancing Heart 53766-GPMWGP-2';
  const bookingDate = '03/10/2026';
  const receiveDate = '19/10/2026';
  const sdha = 'Trọn đời';

  console.log('============================================================');
  console.log('BẮT ĐẦU XỬ LÝ MEDIA MATERIALS CHO:', kocShortName);
  console.log('============================================================');

  // 1. Tạo thư mục KOC trong 2026: YYYY-MM-DD - KOC
  const kocFolderName = `2026-10-03 - ${kocShortName}`;
  console.log(`1. Tạo / Tìm thư mục KOC: "${kocFolderName}" trong 2026...`);
  const kocFolderId = await getOrCreateSubfolder(drive, year2026FolderId, kocFolderName);

  // 2. Tạo 2 thư mục con: Video và Hình ảnh
  console.log('2. Tạo 2 thư mục con "Video" và "Hình ảnh"...');
  const videoFolderId = await getOrCreateSubfolder(drive, kocFolderId, 'Video');
  const imageFolderId = await getOrCreateSubfolder(drive, kocFolderId, 'Hình ảnh');

  const videoFolderUrl = `https://drive.google.com/drive/folders/${videoFolderId}`;
  const imageFolderUrl = `https://drive.google.com/drive/folders/${imageFolderId}`;

  console.log(`- Folder Video: ${videoFolderUrl}`);
  console.log(`- Folder Hình ảnh: ${imageFolderUrl}`);

  // 3. COPY & ĐỔI TÊN CHUẨN SAGA 100%:
  // Format: KOC SAGA, TÊN KOC, tên sản phẩm, thể loại - tóm tắt nội dung video
  
  // Video 1: Daily Vlog từ folder 1cpinCs7Lvis5uFwAUxZwa-7TS-ktN8qB (id: 1zucnKfzKr5VO3DmW99iUpwSoC-ijfYOc)
  const video1Name = `KOC SAGA, ${kocShortName}, ${productName}, Video review, storytelling.mov`;
  console.log(`3.1. Copy Video 1: "${video1Name}"...`);
  const copyVid1 = await drive.files.copy({
    fileId: '1zucnKfzKr5VO3DmW99iUpwSoC-ijfYOc',
    supportsAllDrives: true,
    requestBody: {
      name: video1Name,
      parents: [videoFolderId]
    }
  });
  console.log(`   -> Xong Video 1 (ID: ${copyVid1.data.id})`);

  // Video 2: File 1Toa-1dd3KBHJEUuk2gj_DMIwoepsW6y4
  const video2Name = `KOC SAGA, ${kocShortName}, ${productName}, Video daily, lifestyle.mp4`;
  console.log(`3.2. Copy Video 2: "${video2Name}"...`);
  const copyVid2 = await drive.files.copy({
    fileId: '1Toa-1dd3KBHJEUuk2gj_DMIwoepsW6y4',
    supportsAllDrives: true,
    requestBody: {
      name: video2Name,
      parents: [videoFolderId]
    }
  });
  console.log(`   -> Xong Video 2 (ID: ${copyVid2.data.id})`);

  // Bộ ảnh (8 ảnh từ folder 1cpinCs7Lvis5uFwAUxZwa-7TS-ktN8qB)
  const imageFiles = [
    { id: '1xlBx4575-JWnaMSbpA7eKd55ea1S9UZ8', ext: 'jpg' },
    { id: '1IeqpvZyk6F0Szal6-N54OFpRwLEnz9PU', ext: 'jpg' },
    { id: '1Z8Zcqm34VaJKAt4uMh8NC7nfRqUdqYsu', ext: 'jpg' },
    { id: '1brq6ECr0qjqkonsbARoQxtWOpkOHQeAg', ext: 'jpg' },
    { id: '1T_n90fwTrxppmmppjfnHwSVHTtgdRdmf', ext: 'jpg' },
    { id: '1dLCPxmucwbi-tCRwdEB0ZljfFlfDsYtW', ext: 'jpg' },
    { id: '1ot9jkej5PTjexK-mGCjSrETRP4kKS3hg', ext: 'heic' },
    { id: '1GPFFspBthuX5MPDHUOlvYeneavNPl07H', ext: 'heic' }
  ];

  console.log(`3.3. Copy ${imageFiles.length} ảnh vào thư mục "Hình ảnh"...`);
  for (let i = 0; i < imageFiles.length; i++) {
    const img = imageFiles[i];
    const imgNum = String(i + 1).padStart(2, '0');
    const imgName = `KOC SAGA, ${kocShortName}, ${productName}, Bộ ảnh concept 20-10 - ${imgNum}.${img.ext}`;
    await drive.files.copy({
      fileId: img.id,
      supportsAllDrives: true,
      requestBody: {
        name: imgName,
        parents: [imageFolderId]
      }
    });
    console.log(`   + [${imgNum}/${imageFiles.length}] ${imgName}`);
  }

  // 4. Ghi nhận vào Sheet "SL materials - Saga v1" (Từ Cột A -> Cột J)
  console.log('4. Kiểm tra dòng trống trong Sheet "SL materials - Saga v1"...');
  const matRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${materialsTabName}'!A1:B1000`
  });

  const existingRows = matRes.data.values || [];
  let nextRow = existingRows.length + 1;
  console.log(`-> Dòng tiếp theo trong Sheet Materials: ${nextRow}`);

  // Chuẩn bị 3 dòng Materials:
  // 1) Video review, storytelling
  // 2) Bộ ảnh concept 20/10
  // 3) Video daily, lifestyle
  const materialsRows = [
    [
      bookingDate,
      kocChannelName,
      `=IFERROR(XLOOKUP(INDIRECT("B"&ROW()), 'CSC - Saga'!D:D, 'CSC - Saga'!E:E, "${productName}"), "${productName}")`,
      '', // Image SP
      'Video',
      `=HYPERLINK("${videoFolderUrl}", "Video review, storytelling")`,
      'V: Review + Storytelling',
      'Bằng kỳ vọng',
      receiveDate,
      sdha
    ],
    [
      bookingDate,
      kocChannelName,
      `=IFERROR(XLOOKUP(INDIRECT("B"&ROW()), 'CSC - Saga'!D:D, 'CSC - Saga'!E:E, "${productName}"), "${productName}")`,
      '', // Image SP
      'Hình',
      `=HYPERLINK("${imageFolderUrl}", "Bộ ảnh concept 20/10")`,
      'H: Lookbook/Concept',
      'Bằng kỳ vọng',
      receiveDate,
      sdha
    ],
    [
      bookingDate,
      kocChannelName,
      `=IFERROR(XLOOKUP(INDIRECT("B"&ROW()), 'CSC - Saga'!D:D, 'CSC - Saga'!E:E, "${productName}"), "${productName}")`,
      '', // Image SP
      'Video',
      `=HYPERLINK("${videoFolderUrl}", "Video daily, lifestyle")`,
      'V: Daily/Lifestyle',
      'Bằng kỳ vọng',
      receiveDate,
      sdha
    ]
  ];

  console.log(`Đang ghi ${materialsRows.length} dòng vào phạm vi '${materialsTabName}'!A${nextRow}:J${nextRow + 2}...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${materialsTabName}'!A${nextRow}:J${nextRow + 2}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: materialsRows
    }
  });

  console.log('-> Đã cập nhật xong Sheet Materials thành công!');

  const summaryResult = {
    kocFolderName,
    kocFolderUrl: `https://drive.google.com/drive/folders/${kocFolderId}`,
    videoFolderUrl,
    imageFolderUrl,
    videos: [
      video1Name,
      video2Name
    ],
    imageCount: imageFiles.length,
    sheetUpdatedRange: `'${materialsTabName}'!A${nextRow}:J${nextRow + 2}`
  };

  fs.writeFileSync('d:/Booking/last_materials_result.json', JSON.stringify(summaryResult, null, 2), 'utf8');
  console.log('Kết quả đã được lưu tại d:/Booking/last_materials_result.json');
}

main().catch(err => {
  console.error('Lỗi khi xử lý materials:', err);
  process.exit(1);
});
