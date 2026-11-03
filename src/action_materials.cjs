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

/**
 * Xử lý Materials Media từ link Drive KOC gửi
 * Quy tắc cập nhật mới:
 * 1. Chỉ ghi từ Cột A đến Cột J (BỎ HOÀN TOÀN CỘT K ĐẾN Q).
 * 2. Cột C (Link sản phẩm) liên kết tự động với Sheet "CSC - Saga" qua công thức XLOOKUP:
 *    Khi bạn cập nhật link UTM bên CSC - Saga, sheet Materials bên cạnh tự động nhảy link theo real-time.
 * 3. Cột F (Angle hình ảnh): Gắn link Drive thư mục Video/Hình ảnh vào text tóm tắt (chuẩn Ctrl + K).
 */
async function executeSyncMaterials(kocInfo) {
  const { drive, sheets } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  console.log(`\n============================================================`);
  console.log(`BẮT ĐẦU XỬ LÝ MATERIALS CHO KOC: ${kocInfo.kocName}`);
  console.log(`============================================================\n`);

  const mediaRootId = config.MEDIA_ROOT_FOLDER_ID || '1haQ5DK8FYMHJ-7bDzmR5SldEIHyePVDl';
  const bookingDate = kocInfo.bookingDate ? kocInfo.bookingDate.replace(/\//g, '-') : '2026-10-24';
  const currentYear = bookingDate.includes('-') ? bookingDate.split('-')[0] : '2026';

  // 1. TÌM HOẶC DÙNG LẠI THƯ MỤC NĂM (YYYY) - Chỉ tạo khi chưa có
  console.log(`1. Kiểm tra thư mục năm ${currentYear} trong Media Root...`);
  const yearFolderId = await getOrCreateSubfolder(drive, mediaRootId, currentYear);

  // 2. TẠO HOẶC DÙNG LẠI THƯ MỤC KOC: YYYY-MM-DD - Tên KOC
  const kocFolderName = `${bookingDate} - ${kocInfo.kocName}`;
  console.log(`2. Kiểm tra/Tạo thư mục KOC: "${kocFolderName}" trong năm ${currentYear}...`);
  const kocFolderId = await getOrCreateSubfolder(drive, yearFolderId, kocFolderName);

  // 3. TẠO 2 SUB-FOLDER: "Video" và "Hình ảnh"
  console.log(`3. Kiểm tra/Tạo 2 thư mục con "Video" và "Hình ảnh"...`);
  const videoFolderId = await getOrCreateSubfolder(drive, kocFolderId, 'Video');
  const imageFolderId = await getOrCreateSubfolder(drive, kocFolderId, 'Hình ảnh');

  const videoFolderUrl = `https://drive.google.com/drive/folders/${videoFolderId}`;
  const imageFolderUrl = `https://drive.google.com/drive/folders/${imageFolderId}`;

  // 4. GHI NHẬN ĐỒNG BỘ DÒNG MỚI VÀO SHEET "SL materials - Saga v1" (CHỈ TỪ CỘT A ĐẾN CỘT J)
  const spreadsheetId = config.SPREADSHEET_REPORT_MATERIALS_ID;
  const tabName = config.TAB_SL_MATERIALS || 'SL materials - Saga v1';

  // Công thức động lấy Link UTM từ Sheet 'CSC - Saga' theo Tên KOC:
  // Nếu CSC có link UTM thì tự lấy, nếu chưa có thì hiển thị tên sản phẩm mặc định
  const utmDynamicFormula = `=IFERROR(XLOOKUP(INDIRECT("B"&ROW()), 'CSC - Saga'!D:D, 'CSC - Saga'!E:E, "${kocInfo.productName || ''}"), "${kocInfo.productName || ''}")`;

  const rows = (kocInfo.materialsList || [
    {
      type: 'Video',
      title: kocInfo.videoSummary || 'POV - Khi ảnh chọn quà mà không cần tui gửi link',
      format: kocInfo.videoFormat || 'V: Review + Storytelling',
      quality: 'Bằng kỳ vọng',
      receiveDate: kocInfo.receiveDate || bookingDate,
      sdha: kocInfo.sdha || 'Trọn đời',
      folderUrl: videoFolderUrl
    },
    {
      type: 'Hình',
      title: kocInfo.imageSummary || 'Bộ hình concept 20/10 kết hợp hoa',
      format: kocInfo.imageFormat || 'H: Lookbook/Concept',
      quality: 'Bằng kỳ vọng',
      receiveDate: kocInfo.receiveDate || bookingDate,
      sdha: kocInfo.sdha || 'Trọn đời',
      folderUrl: imageFolderUrl
    }
  ]).map(m => [
    bookingDate,                                               // Cột A: Ngày book
    kocInfo.kocName,                                           // Cột B: Tên KOC
    utmDynamicFormula,                                         // Cột C: Link sản phẩm (tự đồng bộ UTM từ CSC - Saga)
    kocInfo.productImageUrl ? `=IMAGE("${kocInfo.productImageUrl}")` : '', // Cột D: Image (SP)
    m.type,                                                    // Cột E: Loại Materials (Video / Hình)
    `=HYPERLINK("${m.folderUrl}", "${m.title}")`,              // Cột F: Angle hình ảnh (Ctrl+K gắn link Drive vào tóm tắt)
    m.format,                                                  // Cột G: Content Format
    m.quality,                                                 // Cột H: Chất lượng materials
    m.receiveDate,                                             // Cột I: Ngày có thành phẩm
    m.sdha                                                     // Cột J: Thời gian SDHA
    // KHÔNG GHI CỘT K ĐẾN Q THEO YÊU CẦU
  ]);

  console.log(`4. Đang đồng bộ ${rows.length} dòng (Cột A -> J) vào Sheet "${tabName}"...`);
  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${tabName}'!A:J`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: rows
    }
  });

  console.log(`-> Đã ghi nhận Materials thành công (Cột A -> J) tại: ${appendRes.data.updates.updatedRange}`);

  return {
    success: true,
    kocFolderUrl: `https://drive.google.com/drive/folders/${kocFolderId}`,
    videoFolderUrl: videoFolderUrl,
    imageFolderUrl: imageFolderUrl,
    updatedRange: appendRes.data.updates.updatedRange
  };
}

module.exports = { executeSyncMaterials };
