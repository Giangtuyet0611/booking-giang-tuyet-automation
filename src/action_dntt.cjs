const { google } = require('googleapis');
const fs = require('fs');
const { calculateTax } = require('./utils/tax.util.cjs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    drive: google.drive({ version: 'v3', auth }),
    docs: google.docs({ version: 'v1', auth })
  };
}

/**
 * Sinh 01 Phiếu Đề Nghị Thanh Toán (Docs)
 * - Giá trị thanh toán: CHỈ GHI GIÁ TRỊ THỰC NHẬN (NET)
 * - Hỗ trợ các đợt thanh toán nếu có
 */
async function generateSinglePaymentRequestDoc(params, docs, drive, config) {
  const templateId = config.PAYMENT_REQUEST_TEMPLATE_DOC_ID || '143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg';
  const targetFolderId = config.PAYMENT_REQUEST_TARGET_FOLDER_ID || '12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku';

  const {
    kocName,
    receiverName,
    bankAccount,
    bankName,
    amount, // Giá trị thực nhận (Net)
    bookingDate = '2026-10-26',
    paymentDateRange = 'Trong vòng 7 ngày làm việc',
    phaseName = '', // vd: 'Đợt 1', 'Đợt 2'
    note = 'Chi phí booking KOC quay/chụp sản phẩm đồng hồ Saga'
  } = params;

  const targetName = (receiverName || kocName || '').toUpperCase();
  const dateStr = bookingDate.replace(/\//g, '-');
  
  const phaseSuffix = phaseName ? ` (${phaseName})` : '';
  const docTitle = `${dateStr} - Phiếu đề nghị thanh toán${phaseSuffix} - Team Social - ${targetName}`;
  const displayAmount = Number(amount || 0).toLocaleString('vi-VN') + ' VNĐ';

  console.log(`Đang nhân bản mẫu DNTT vào thư mục Kế toán tháng (${targetFolderId}): ${docTitle}...`);
  const copyRes = await drive.files.copy({
    fileId: templateId,
    supportsAllDrives: true,
    requestBody: {
      name: docTitle,
      parents: [targetFolderId]
    }
  });

  const newDocId = copyRes.data.id;

  // Thay thế các trường trong văn bản mẫu (Chỉ ghi giá trị thực nhận)
  const fullExplanation = phaseName ? `${note} - ${phaseName}` : note;
  const replacements = [
    { target: 'Nguyễn Thị Thảo Hương', replacement: targetName },
    { target: '106828683333 - Ngân hàng Thương mại Cổ phần Công Thương Việt Nam (VietinBank) - Chi nhánh 2 TP.HCM', replacement: `${bankAccount || ''} - ${bankName || ''}` },
    { target: '4.000.000 VNĐ', replacement: displayAmount },
    { target: 'từ 22/10/2026 - 28/10/2026', replacement: paymentDateRange },
    { target: '21/10/2026', replacement: bookingDate },
    { target: 'Chi phí booking KOC quay/chụp sản phẩm đồng hồ', replacement: fullExplanation }
  ];

  const requests = replacements.map(r => ({
    replaceAllText: {
      containsText: {
        text: r.target,
        matchCase: false
      },
      replaceText: r.replacement
    }
  }));

  await docs.documents.batchUpdate({
    documentId: newDocId,
    requestBody: { requests }
  });

  return {
    docId: newDocId,
    docTitle: docTitle,
    docUrl: `https://docs.google.com/document/d/${newDocId}/edit`,
    phaseName: phaseName,
    netAmount: amount
  };
}

/**
 * Sinh bộ Phiếu Đề Nghị Thanh Toán (xử lý chia đợt nếu có)
 * Quy định V4.0: Chỉ ghi giá trị THỰC NHẬN (Net)
 */
async function generatePaymentRequestDoc(params) {
  const { drive, docs } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  const {
    amount,
    isGross = true,
    phases = null // Nếu có danh sách các đợt: [{ phaseName: 'Đợt 1', percent: 0.5 }, { phaseName: 'Đợt 2', percent: 0.5 }]
  } = params;

  // 1. Tính toán thuế TNCN và số tiền THỰC NHẬN
  const taxInfo = calculateTax(amount, isGross);
  const totalNet = taxInfo.netAmount; // Giá trị THỰC NHẬN

  console.log(`Tổng Cast: ${Number(amount).toLocaleString('vi-VN')} đ | Thực nhận (Net): ${totalNet.toLocaleString('vi-VN')} đ`);

  const createdRequests = [];

  if (Array.isArray(phases) && phases.length > 0) {
    // Tạo từng phiếu cho từng đợt thanh toán
    for (const ph of phases) {
      const phAmount = ph.amount || Math.round(totalNet * (ph.percent || (1 / phases.length)));
      const res = await generateSinglePaymentRequestDoc({
        ...params,
        amount: phAmount,
        phaseName: ph.phaseName || ph.name,
        paymentDateRange: ph.paymentDateRange || params.paymentDateRange
      }, docs, drive, config);
      createdRequests.push(res);
    }
  } else if (params.splitPhases) {
    // Mặc định tách 2 đợt: 50% kịch bản & 50% nghiệm thu
    const halfNet = Math.round(totalNet / 2);
    const p1 = await generateSinglePaymentRequestDoc({
      ...params,
      amount: halfNet,
      phaseName: 'Đợt 1 - 50% sau duyệt kịch bản'
    }, docs, drive, config);
    const p2 = await generateSinglePaymentRequestDoc({
      ...params,
      amount: totalNet - halfNet,
      phaseName: 'Đợt 2 - 50% sau nghiệm thu'
    }, docs, drive, config);
    createdRequests.push(p1, p2);
  } else {
    // 01 Phiếu thanh toán duy nhất với giá trị thực nhận toàn phần
    const res = await generateSinglePaymentRequestDoc({
      ...params,
      amount: totalNet,
      phaseName: params.phaseName || ''
    }, docs, drive, config);
    createdRequests.push(res);
  }

  return {
    totalNet: totalNet,
    taxInfo: taxInfo,
    docUrl: createdRequests[0].docUrl,
    docTitle: createdRequests[0].docTitle,
    requests: createdRequests
  };
}

module.exports = {
  generatePaymentRequestDoc
};
