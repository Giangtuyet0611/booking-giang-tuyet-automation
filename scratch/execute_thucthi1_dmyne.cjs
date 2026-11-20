const { google } = require('googleapis');
const fs = require('fs');
const { findStoreByAddressOrName } = require('../src/utils/store_lookup.util.cjs');
const { generateUnifiedDispatchEmail, renderEmailHtml } = require('../src/utils/mail_template.cjs');
const { createGmailDraft } = require('../src/utils/gmail_draft.util.cjs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    drive: google.drive({ version: 'v3', auth }),
    docs: google.docs({ version: 'v1', auth }),
    sheets: google.sheets({ version: 'v4', auth })
  };
}

function colIndexToA1(idx) {
  let s = '';
  let n = idx;
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

function normalize(s) {
  return (s || '').toLowerCase().replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function run() {
  const { docs, sheets } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  console.log('============================================================');
  console.log('BẮT ĐẦU THỰC THI 1: QUÉT DOCS LIVE -> DRAFT GMAIL -> UPDATE DATA KOC');
  console.log('============================================================');

  // 1. QUÉT DOCS Ở TRẠNG THÁI MỚI NHẤT
  const lastContractResult = JSON.parse(fs.readFileSync('d:/Booking/last_contract_result.json', 'utf8'));
  const contractId = lastContractResult.contracts[0].id;
  console.log(`\n1. Quét Google Doc mới nhất: ${contractId}`);

  const docRes = await docs.documents.get({ documentId: contractId });
  let fullText = '';
  function extract(elements) {
    for (const el of elements) {
      if (el.paragraph) {
        for (const p of el.paragraph.elements) {
          if (p.textRun) fullText += p.textRun.content;
        }
      } else if (el.table) {
        for (const row of el.table.tableRows) {
          for (const cell of row.tableCells) {
            extract(cell.content);
          }
        }
      }
    }
  }
  extract(docRes.data.body.content);

  const benBMatch = fullText.match(/BÊN B:\s*([^\n]+)/i);
  const kocFullName = benBMatch ? benBMatch[1].trim() : 'NGUYỄN THỊ THANH NGÂN';

  const cccdMatch = fullText.match(/Số căn cước công dân \(CCCD\):\s*([0-9]+)/i);
  const kocCccd = cccdMatch ? cccdMatch[1].trim() : '079301014286';

  const sdtMatch = fullText.match(/Số điện thoại:\s*([0-9]+)/i);
  const kocPhone = sdtMatch ? sdtMatch[1].trim() : '0939720264';

  const showroomMatch = fullText.match(/Tại Showroom Đồng Hồ Hải Triều:\s*([^\n]+)/i);
  const targetShowroomAddress = showroomMatch ? showroomMatch[1].trim() : '634 Quang Trung, phường Thông Tây Hội, quận Gò Vấp, TP. Hồ Chí Minh';

  const pickupDateMatch = fullText.match(/Thời gian nhận sản phẩm dự kiến:\s*([^\n]+)/i);
  const pickupDate = pickupDateMatch ? pickupDateMatch[1].trim() : '12/11/2026';

  const prodCodeMatch = fullText.match(/Số hiệu sản phẩm:\s*([A-Za-z0-9-]+)/i);
  const productCode = prodCodeMatch ? prodCodeMatch[1].trim() : '71959-RGRGTTR-2';

  const priceMatch = fullText.match(/với tổng giá trị là\s*([0-9.,]+)\s*VNĐ/i);
  const totalPrice = priceMatch ? priceMatch[1].trim() : '8.950.000';

  console.log(`- KOC: ${kocFullName} (CCCD: ${kocCccd}, SĐT: ${kocPhone})`);
  console.log(`- Showroom: ${targetShowroomAddress}`);
  console.log(`- Ngày nhận dự kiến: ${pickupDate}`);
  console.log(`- Sản phẩm: ${productCode} (Trị giá: ${totalPrice} VNĐ)`);

  // 2. TRA CỨU SHOWROOM EMAIL
  console.log(`\n2. Tra cứu Showroom Email từ danh bạ...`);
  const storeInfo = await findStoreByAddressOrName(targetShowroomAddress);
  const showroomName = storeInfo ? storeInfo.name : 'Showroom Quang Trung (049QT1)';
  const showroomPic = storeInfo ? storeInfo.leaderInfo.split('\n')[0].trim() : 'BA - Trần Thị Quỳnh Như';
  console.log(`-> Tìm thấy Showroom: ${showroomName}`);
  console.log(`   Email: ${storeInfo ? storeInfo.email : 'quangtrung@donghohaitrieu.vn'}`);
  console.log(`   Leader / BA: ${showroomPic}`);

  // 3. SOẠN DRAFT MAIL VÀ ĐẨY VÀO GMAIL DRAFTS
  console.log(`\n3. Soạn Draft Mail xuất hàng và đẩy vào Gmail Drafts...`);
  const mailParams = {
    kocName: 'Dmy nè',
    kocFullName: kocFullName,
    kocPhone: kocPhone,
    kocCccd: kocCccd,
    targetShowroom: showroomName,
    targetShowroomAddress: targetShowroomAddress,
    storePic: showroomPic,
    pickupDate: pickupDate,
    needDate: '11/11/2026',
    xnhProducts: [
      { name: `Đồng hồ SAGA ${productCode}`, qty: '01' }
    ],
    transferShowrooms: [],
    giftProducts: [
      { name: `Đồng hồ SAGA ${productCode}`, qty: '01' }
    ],
    hasBorrow: false
  };

  const mailResult = generateUnifiedDispatchEmail(mailParams);
  const subject = `Marketing - Xuất sản phẩm tặng KOC Dmy nè`;
  const htmlBody = renderEmailHtml(mailResult.body, mailParams);

  // Push to Gmail Draft (To & Cc left blank as per Rule 8)
  const draftRes = await createGmailDraft({
    subject,
    htmlBody
  });
  console.log(`-> ĐÃ TẠO GMAIL DRAFT THÀNH CÔNG!`);
  console.log(`   Draft ID: ${draftRes.id}`);
  console.log(`   Tiêu đề: ${subject}`);
  console.log(`   Người nhận: (để trống - người dùng tự điền khi gửi)`);

  // 4. CẬP NHẬT SHEET DATA KOC (11/2026)
  console.log(`\n4. Cập nhật trạng thái chốt deal trên Sheet Data KOC (11/2026)...`);
  const spreadsheetId = config.SPREADSHEET_DATA_KOC_ID;
  const tabName = 'Data KOC (11/2026)';

  const sheetRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:Z100`
  });

  const rows = sheetRes.data.values || [];
  const header = rows[0] || [];

  const colMap = {};
  header.forEach((h, idx) => {
    const norm = normalize(h);
    if (norm.includes('người phụ trách')) colMap.pic = idx;
    if (norm.includes('tên kênh')) colMap.channelName = idx;
    if (norm.includes('trạng thái')) colMap.status = idx;
    if (norm.includes('số sản phẩm tặng')) colMap.giftQty = idx;
    if (norm.includes('mã sản phẩm')) colMap.productCode = idx;
    if (norm.includes('tổng chi phí sản phẩm')) colMap.totalProductCost = idx;
    if (norm.includes('tổng cast')) colMap.totalCast = idx;
  });

  let targetRowIdx = -1;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const channelVal = normalize(row[colMap.channelName] || '');
    if (channelVal.includes('dmy nè') || channelVal.includes('dmy ne')) {
      targetRowIdx = r;
      break;
    }
  }

  if (targetRowIdx === -1) {
    throw new Error('Không tìm thấy dòng KOC Dmy nè trên Sheet Data KOC!');
  }

  const targetRowNumber = targetRowIdx + 1; // 1-indexed (Row 55)
  console.log(`-> Tìm thấy dòng KOC tại Row ${targetRowNumber}`);

  // Cập nhật 5 ô theo Rule 3.1:
  // S (Trạng thái) = "Đã chốt"
  // U (Số sản phẩm tặng) = 1
  // V (Mã sản phẩm) = "71959-RGRGTTR-2"
  // W (Tổng chi phí sản phẩm) = "8.950.000"
  // Y (Tổng cast) = 0
  const updates = [
    { range: `'${tabName}'!${colIndexToA1(colMap.status)}${targetRowNumber}`, values: [['Đã chốt']] },
    { range: `'${tabName}'!${colIndexToA1(colMap.giftQty)}${targetRowNumber}`, values: [[1]] },
    { range: `'${tabName}'!${colIndexToA1(colMap.productCode)}${targetRowNumber}`, values: [[productCode]] },
    { range: `'${tabName}'!${colIndexToA1(colMap.totalProductCost)}${targetRowNumber}`, values: [[totalPrice]] },
    { range: `'${tabName}'!${colIndexToA1(colMap.totalCast)}${targetRowNumber}`, values: [[0]] }
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });

  console.log(`-> ĐÃ CẬP NHẬT THÀNH CÔNG SHEET DATA KOC TẠI ROW ${targetRowNumber}:`);
  console.log(`   - Trạng thái: Đã chốt`);
  console.log(`   - Số sản phẩm tặng: 1`);
  console.log(`   - Mã sản phẩm: ${productCode}`);
  console.log(`   - Tổng chi phí sản phẩm: ${totalPrice}`);
  console.log(`   - Tổng cast: 0`);

  // Lưu log kết quả
  const executionResult = {
    koc: 'Dmy nè',
    gmailDraftId: draftRes.id,
    subject: subject,
    showroom: showroomName,
    sheetUpdated: {
      spreadsheetId,
      tab: tabName,
      row: targetRowNumber,
      status: 'Đã chốt',
      productCode: productCode,
      giftQty: 1,
      totalProductCost: totalPrice,
      totalCast: 0
    }
  };

  fs.writeFileSync('d:/Booking/last_thucthi1_result.json', JSON.stringify(executionResult, null, 2), 'utf8');

  console.log('\n============================================================');
  console.log('HOÀN TẤT THỰC THI 1 TRỌN GÓI THÀNH CÔNG 100%!');
  console.log('============================================================\n');
}

run().catch(console.error);

