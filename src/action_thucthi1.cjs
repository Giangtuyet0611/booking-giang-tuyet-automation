const { google } = require('googleapis');
const fs = require('fs');
const { generatePaymentRequestDoc } = require('./action_dntt.cjs');
const { generateUnifiedDispatchEmail, renderEmailHtml } = require('./utils/mail_template.cjs');
const { findStoreByAddressOrName } = require('./utils/store_lookup.util.cjs');
const { createGmailDraft } = require('./utils/gmail_draft.util.cjs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    sheets: google.sheets({ version: 'v4', auth }),
    docs: google.docs({ version: 'v1', auth })
  };
}

/**
 * Xử lý Bước "Thực thi 1" (Chuẩn V4.1)
 * 1. Đọc hợp đồng ở trạng thái mới nhất từ Docs (nếu có docIds)
 * 2. Tra cứu email Showroom tự động từ Sheet danh sách cửa hàng
 * 3. Soạn Draft Mail xuất hàng gom chung và ĐẨY THẲNG VÀO GMAIL DRAFTS
 * 4. Sinh Phiếu ĐNTT (nếu có Cast) với giá trị THỰC NHẬN (Net), hỗ trợ chia đợt
 * 5. Ghi dòng mới vào Sheet CSC - Saga: CHỈ GHI MỚI, KHÔNG GHI ĐÈ.
 */
async function executeThucThi1(data) {
  const { sheets, docs } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  console.log(`\n============================================================`);
  console.log(`BẮT ĐẦU THỰC THI 1 CHO KOC: ${data.kocName}`);
  console.log(`============================================================\n`);

  const results = {
    email: null,
    gmailDraftId: null,
    paymentRequest: null,
    sheetCscUpdated: false,
    sheetCscRow: null
  };

  // Tra cứu showroom từ Sheet cửa hàng
  const targetAddress = data.showroomAddress || data.showroom || '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh';
  const storeInfo = await findStoreByAddressOrName(targetAddress);
  const targetEmail = storeInfo ? storeInfo.email : '190tranquangkhai@donghohaitrieu.vn';
  const storePic = storeInfo ? storeInfo.leaderInfo.split('\n')[0] : (data.storePic || 'BA - Trần Thùy My');

  // 1. TẠO DRAFT MẪU MAIL XUẤT HÀNG GOM CHUNG TRONG 1 EMAIL DUY NHẤT
  console.log('1. Đang sinh bản Draft Mail xuất hàng gom chung trong 1 email...');
  const mailParams = {
    kocName: data.kocName,
    kocFullName: data.kocFullName || data.fullName || data.kocName,
    kocPhone: data.phone,
    kocCccd: data.cccd,
    
    xnhProducts: data.xnhProducts || [],
    transferShowrooms: data.transferShowrooms || [],
    giftProducts: data.giftProducts || (data.productName ? [{ name: data.productName, qty: data.giftProductQty || '01' }] : (data.products || [])),
    
    hasBorrow: data.hasBorrow !== undefined ? data.hasBorrow : Boolean(data.borrowProduct || data.borrowProducts),
    borrowProduct: data.borrowProduct || (data.borrowProducts && data.borrowProducts[0] ? `${data.borrowProducts[0].name} (${data.borrowProducts[0].code})` : ''),
    borrowProductQty: data.borrowProductQty || '01',
    borrowDate: data.borrowDate || (data.borrowProducts && data.borrowProducts[0] ? data.borrowProducts[0].borrowDate : ''),
    returnDate: data.returnDate || (data.borrowProducts && data.borrowProducts[0] ? data.borrowProducts[0].returnDate : ''),

    targetShowroom: data.showroom || (storeInfo ? storeInfo.name : 'Showroom 190 Trần Quang Khải'),
    targetShowroomAddress: targetAddress,
    storePic: storePic,
    pickupDate: data.pickupDate || '05/11/2026',
    needDate: data.needDate || '04/11/2026'
  };
  const mailResult = generateUnifiedDispatchEmail(mailParams);

  results.email = mailResult;
  console.log(`-> Đã tạo bản Draft Mail gom chung thành công!`);

  // Đẩy bản nháp vào Gmail Draft
  try {
    const subject = `Marketing - Xuất sản phẩm tặng KOC ${data.kocName}`;
    // Font serif, cỡ Lớn, in đậm thông tin quan trọng; KHÔNG đề xuất người nhận (To) và KHÔNG Cc
    const htmlBody = renderEmailHtml(mailResult.body, mailParams);

    const draftRes = await createGmailDraft({
      subject,
      htmlBody
    });

    results.gmailDraftId = draftRes.id;
    console.log(`-> ĐÃ ĐẨY BẢN NHÁP VÀO GMAIL DRAFTS THÀNH CÔNG! (Draft ID: ${draftRes.id})`);
    console.log(`   Tiêu đề: ${subject}`);
    console.log(`   Người nhận: (để trống - người dùng tự điền khi gửi)`);
  } catch (err) {
    console.warn(`! Không thể tự động tạo Draft trong Gmail: ${err.message}`);
  }

  // 2. TẠO PHIẾU ĐỀ NGHỊ THANH TOÁN (NẾU CÓ CAST) - CHỈ GHI GIÁ TRỊ THỰC NHẬN
  const castNumber = Number(String(data.castAmount || '0').replace(/[^0-9]/g, ''));
  const isNet = data.castType === 'Net' || data.isGross === false;
  
  if (castNumber > 0) {
    console.log(`2. Hợp đồng có Cast (${castNumber.toLocaleString()} đ) -> Đang tạo Phiếu DNTT với GIÁ TRỊ THỰC NHẬN tại [6] Kết toán tháng...`);
    results.paymentRequest = await generatePaymentRequestDoc({
      kocName: data.kocName,
      receiverName: (data.fullName || data.receiverName || data.kocName).toUpperCase(),
      bankAccount: data.bankAccount,
      bankName: data.bankName,
      amount: castNumber,
      isGross: !isNet,
      phases: data.phases || null,
      splitPhases: data.splitPhases || false,
      bookingDate: data.bookingDate || '26/10/2026',
      paymentDateRange: data.paymentDateRange || 'Trong vòng 7 ngày làm việc'
    });
    console.log(`-> Đã tạo Phiếu DNTT thành công: ${results.paymentRequest.docUrl}`);
  } else {
    console.log('2. Hợp đồng không có Cast (Cast = 0 đ) -> Bỏ qua tạo Phiếu DNTT.');
  }

  // 3. TỰ ĐỘNG GHI DÒNG MỚI SANG SHEET "CSC - Saga" (Tab 1) - TUYỆT ĐỐI CHỈ GHI MỚI
  console.log('3. Đang tìm dòng trống mới nhất trong Sheet "CSC - Saga" (tuyệt đối không ghi đè)...');
  const spreadsheetId = config.SPREADSHEET_REPORT_MATERIALS_ID;
  const tabName = config.TAB_CSC_SAGA || 'CSC - Saga';

  // Lấy toàn bộ cột D (Tên KOC) để tìm dòng cuối cùng có dữ liệu
  const checkColD = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!D:D`
  });
  
  const colDValues = checkColD.data.values || [];
  let lastNonEmptyIndex = 0;
  for (let i = colDValues.length - 1; i >= 0; i--) {
    if (colDValues[i] && colDValues[i][0] && colDValues[i][0].toString().trim() !== '') {
      lastNonEmptyIndex = i + 1; // 1-indexed
      break;
    }
  }

  // Dòng ghi mới luôn là dòng ngay sau dòng có dữ liệu cuối cùng
  const targetRow = Math.max(lastNonEmptyIndex + 1, 334);
  console.log(`-> Dòng có dữ liệu cuối cùng là: ${lastNonEmptyIndex}. Ghi MỚI vào dòng: ${targetRow}`);

  // Chuẩn bị nội dung sản phẩm
  let productsDesc = data.productName || data.productsDescription || '';
  if (!productsDesc && data.products && data.products.length > 0) {
    productsDesc = data.products.map(p => `${p.name} ${p.code}`).join('\n');
  }

  let totalValText = data.totalProductValue || data.productValue || '0 đ';

  const rowValues = [
    `=A${targetRow - 1}+1`, // STT tự động tăng dần so với dòng trước đó
    data.pic || 'Giáng Tuyết',
    data.bookingDate || '26/10/2026',
    data.kocName,
    productsDesc,
    totalValText,
    '0', // Click link organic
    data.voucherCode || ''
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A${targetRow}:H${targetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowValues]
    }
  });

  results.sheetCscUpdated = true;
  results.sheetCscRow = targetRow;
  console.log(`-> Đã ghi dòng MỚI thành công vào Sheet "${tabName}" tại phạm vi: A${targetRow}:H${targetRow}`);

  console.log('\n============================================================');
  console.log('HOÀN TẤT THỰC THI 1 THÀNH CÔNG RỰC RỠ!');
  console.log('============================================================\n');

  return results;
}

module.exports = { executeThucThi1 };
