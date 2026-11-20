const { getClients } = require('../lib/google.cjs');

/**
 * Ghi nhận Materials / Thành phẩm vào Sheet MỚI: "Report Saga"
 * Spreadsheet: 1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I
 * Tab: Report Saga (gid: 2134196678)
 */
async function syncReportMaterials(options = {}) {
  const { sheets } = getClients();

  const spreadsheetId = '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I';
  const tabName = 'Report Saga';

  const kocChannel = options.channel || options.koc || 'Quỳnh Musé';
  const contactTurn = options.turn || '1';
  const folderUrl = options.folderUrl || 'https://drive.google.com/drive/folders/1jICFJis9-GudrJFFf337FWGHvVdWpthh';
  const summaryTitle = options.title || 'Bộ ảnh Lookbook mặc đầm & vest (15 ảnh)';
  const format = options.format || 'Hình ảnh';
  const sdha = options.sdha || 'Trọn đời';

  console.log('========================================================================');
  console.log(`GHI NHẬN REPORT SAGA (THÀNH PHẨM MATERIALS): ${kocChannel}`);
  console.log(`Spreadsheet ID: ${spreadsheetId}`);
  console.log(`Tab: ${tabName}`);
  console.log('========================================================================\n');

  // 1. Quét tìm dòng trống đầu tiên (cột F - Tên kênh rỗng) từ dòng 3 trở đi
  console.log('1. Đang kiểm tra dòng trống đầu tiên tại cột F (Tên kênh)...');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!F3:F100`
  });

  const fValues = res.data.values || [];
  let targetRow = 3;
  for (let i = 0; i < fValues.length; i++) {
    if (!fValues[i] || !fValues[i][0] || fValues[i][0].trim() === '') {
      targetRow = 3 + i;
      break;
    }
    targetRow = 3 + i + 1;
  }

  console.log(`-> Dòng trống đầu tiên được chọn: Dòng ${targetRow}`);

  // 2. Chuẩn bị ghi vào các cột bắt buộc:
  // Col E: Liên hệ lần thứ
  // Col F: Tên kênh
  // Col M: Materials (Gắn hyperlink)
  // Col N: Format
  // Col O: Thời gian SDHA
  // Lưu ý: Tuyệt đối KHÔNG ghi đè cột A, D, G, H, I, J, K, R vì đã có công thức MAP tự động!
  
  // Ghi Col E và F
  console.log(`2. Ghi nhận Col E (Liên hệ lần thứ: ${contactTurn}) & Col F (Tên kênh: ${kocChannel})...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!E${targetRow}:F${targetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[contactTurn, kocChannel]]
    }
  });

  // Ghi Col M, N, O
  const materialsHyperlink = `=HYPERLINK("${folderUrl}"; "${summaryTitle}")`;
  console.log(`3. Ghi nhận Col M (Materials), Col N (Format: ${format}), Col O (SDHA: ${sdha})...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!M${targetRow}:O${targetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[materialsHyperlink, format, sdha]]
    }
  });

  // 4. Đọc lại toàn bộ dòng để kiểm tra kết quả công thức tự động nhảy
  console.log(`4. Kiểm tra dòng ${targetRow} sau khi cập nhật...`);
  const checkRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A${targetRow}:R${targetRow}`
  });

  const rowVals = checkRes.data.values ? checkRes.data.values[0] : [];
  console.log('========================================================================');
  console.log('✅ GHI NHẬN THÀNH CÔNG VÀO SHEET REPORT SAGA!');
  console.log(`- Dòng: ${targetRow}`);
  console.log(`- Ngày BOOK (Auto): ${rowVals[0] || '(Đang đồng bộ)'}`);
  console.log(`- Người phụ trách (Auto): ${rowVals[3] || '(Đang đồng bộ)'}`);
  console.log(`- Liên hệ lần thứ: ${rowVals[4]}`);
  console.log(`- Tên kênh: ${rowVals[5]}`);
  console.log(`- Tên KOC (Auto): ${rowVals[6]}`);
  console.log(`- Tệp KOC (Auto): ${rowVals[7]}`);
  console.log(`- Thương hiệu (Auto): ${rowVals[8]}`);
  console.log(`- Dự án (Auto): ${rowVals[9]}`);
  console.log(`- Mã SP (Auto): ${rowVals[10]}`);
  console.log(`- Materials: ${rowVals[12]}`);
  console.log(`- Format: ${rowVals[13]}`);
  console.log(`- SDHA: ${rowVals[14]}`);
  console.log(`- Chi phí sau deal (Auto): ${rowVals[17]}`);
  console.log('========================================================================\n');

  return {
    success: true,
    rowNumber: targetRow,
    kocChannel,
    summaryTitle,
    folderUrl,
    rowVals
  };
}

module.exports = { syncReportMaterials };
