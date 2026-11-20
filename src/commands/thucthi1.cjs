const fs = require('fs');
const { getClients } = require('../lib/google.cjs');
const { findStoreByAddressOrName } = require('../utils/store_lookup.util.cjs');
const { generateUnifiedDispatchEmail, renderEmailHtml } = require('../utils/mail_template.cjs');
const { createGmailDraft, updateGmailDraft } = require('../utils/gmail_draft.util.cjs');

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

async function handleThucThi1Command(deal, options = {}) {
  const { docs, sheets, config } = getClients();

  console.log(`\n============================================================`);
  console.log(`TIẾN HÀNH THỰC THI 1: KOC ${deal.koc.name}`);
  console.log(`============================================================\n`);

  // 1. Quét Live Docs nếu có hợp đồng
  let targetShowroomAddress = deal.showroom?.address || '';
  let pickupDate = deal.showroom?.pickupDate || '';
  let kocFullName = deal.koc.fullName || '';
  let kocCccd = deal.koc.cccd || '';
  let kocPhone = deal.koc.phone || '';
  let productCode = deal.products && deal.products[0] ? deal.products[0].code : '';
  let totalPrice = deal.products ? deal.products.reduce((s, p) => s + (p.value || 0), 0) : 0;

  const lastContractPath = 'd:/Booking/last_contract_result.json';
  if (fs.existsSync(lastContractPath)) {
    try {
      const lastContract = JSON.parse(fs.readFileSync(lastContractPath, 'utf8'));
      if (lastContract.contracts && lastContract.contracts[0]) {
        const contractId = lastContract.contracts[0].id;
        console.log(`1. Quét trạng thái thời gian thực từ Google Doc (${contractId})...`);
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
        if (benBMatch) kocFullName = benBMatch[1].trim();

        const cccdMatch = fullText.match(/Số căn cước công dân \(CCCD\):\s*([0-9]+)/i);
        if (cccdMatch) kocCccd = cccdMatch[1].trim();

        const sdtMatch = fullText.match(/Số điện thoại:\s*([0-9]+)/i);
        if (sdtMatch) kocPhone = sdtMatch[1].trim();

        const showroomMatch = fullText.match(/Tại Showroom Đồng Hồ Hải Triều:\s*([^\n]+)/i);
        if (showroomMatch) targetShowroomAddress = showroomMatch[1].trim();

        const dateMatch = fullText.match(/Thời gian nhận sản phẩm dự kiến:\s*([^\n]+)/i);
        if (dateMatch) pickupDate = dateMatch[1].trim();

        const prodCodeMatch = fullText.match(/Số hiệu sản phẩm:\s*([A-Za-z0-9-]+)/i);
        if (prodCodeMatch) productCode = prodCodeMatch[1].trim();

        const priceMatch = fullText.match(/với tổng giá trị là\s*([0-9.,]+)\s*VNĐ/i);
        if (priceMatch) totalPrice = priceMatch[1].trim();
      }
    } catch (err) {
      console.warn(`Lưu ý quét live doc: ${err.message}`);
    }
  }

  // 2. Tra cứu Showroom Email
  console.log(`2. Tra cứu Showroom Email từ danh bạ cửa hàng...`);
  const storeInfo = await findStoreByAddressOrName(targetShowroomAddress);
  const showroomName = storeInfo ? storeInfo.name : 'Showroom Quang Trung (049QT1)';
  const showroomPic = storeInfo ? storeInfo.leaderInfo.split('\n')[0].trim() : 'BA phụ trách showroom';
  console.log(`-> Showroom: ${showroomName} (${storeInfo ? storeInfo.email : 'N/A'}) - Leader: ${showroomPic}`);

  // 3. Soạn Draft Mail xuất hàng
  console.log(`3. Soạn Draft Mail xuất hàng...`);
  const hasTransferStore = Boolean(deal.showroom?.transferStore);
  const transferShowrooms = hasTransferStore
    ? [
        {
          sourceShowroom: deal.showroom.transferStore,
          products: [{ name: `Đồng hồ SAGA ${productCode}`, qty: '01' }]
        }
      ]
    : [];

  const mailParams = {
    kocName: deal.koc.name,
    kocFullName: kocFullName,
    kocPhone: kocPhone,
    kocCccd: kocCccd,
    targetShowroom: showroomName,
    targetShowroomAddress: targetShowroomAddress,
    storePic: showroomPic,
    pickupDate: pickupDate,
    xnhProducts: hasTransferStore
      ? []
      : [{ name: `Đồng hồ SAGA ${productCode}`, qty: '01' }],
    transferShowrooms,
    giftProducts: [
      { name: `Đồng hồ SAGA ${productCode}`, qty: '01' }
    ],
    hasBorrow: false
  };

  const mailResult = generateUnifiedDispatchEmail(mailParams);
  const subject = `Marketing - Xuất sản phẩm tặng KOC ${deal.koc.name}`;
  const htmlBody = renderEmailHtml(mailResult.body, mailParams);

  let draftId = 'DRY_RUN_DRAFT_ID';
  if (!options.dryRun) {
    let existingDraftId = null;
    const lastThucThiPath = 'd:/Booking/last_thucthi1_result.json';
    if (fs.existsSync(lastThucThiPath)) {
      try {
        const prev = JSON.parse(fs.readFileSync(lastThucThiPath, 'utf8'));
        if (prev.koc === deal.koc.name && prev.gmailDraftId && prev.gmailDraftId !== 'DRY_RUN_DRAFT_ID') {
          existingDraftId = prev.gmailDraftId;
        }
      } catch (_) {}
    }

    if (existingDraftId) {
      try {
        const draftRes = await updateGmailDraft({ draftId: existingDraftId, subject, htmlBody });
        draftId = draftRes.id;
        console.log(`-> ĐÃ CẬP NHẬT TRỰC TIẾP GMAIL DRAFT HIỆN CÓ! (ID: ${draftId})`);
      } catch (err) {
        const draftRes = await createGmailDraft({ subject, htmlBody });
        draftId = draftRes.id;
        console.log(`-> ĐÃ TẠO GMAIL DRAFT MỚI! (ID: ${draftId})`);
      }
    } else {
      const draftRes = await createGmailDraft({ subject, htmlBody });
      draftId = draftRes.id;
      console.log(`-> ĐÃ TẠO GMAIL DRAFT THÀNH CÔNG! (ID: ${draftId})`);
    }
  } else {
    console.log(`-> [DRY RUN] Đã tạo nội dung Gmail Draft (không đẩy thực tế): Tiêu đề: "${subject}"`);
  }

  // 4. Cập nhật Sheet Data KOC
  console.log(`4. Cập nhật Sheet Data KOC (Tab Data KOC (11/2026))...`);
  const spreadsheetId = config.SPREADSHEET_DATA_KOC_ID;
  const tabName = config.TAB_DATA_KOC || 'Data KOC (11/2026)';

  const sheetRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:Z500`
  });

  const rows = sheetRes.data.values || [];
  let headerRowIdx = 0;
  let header = rows[0] || [];
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const rNorm = (rows[i] || []).map(normalize);
    if (rNorm.some(c => c.includes('tên kênh')) && rNorm.some(c => c.includes('người phụ trách'))) {
      headerRowIdx = i;
      header = rows[i];
      break;
    }
  }

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

  const requiredCols = ['pic', 'channelName', 'status', 'giftQty', 'productCode', 'totalProductCost', 'totalCast'];
  for (const rc of requiredCols) {
    if (colMap[rc] === undefined) {
      throw new Error(`Không tìm thấy cột bắt buộc: "${rc}" trên Sheet Data KOC!`);
    }
  }

  // Tìm KOC row (ưu tiên khớp chính xác hoặc channelVal chứa kocSearchNorm; không để tên ngắn như "Đan" khớp nhầm "Đan Quỳnh")
  const kocSearchNorm = normalize(deal.koc.name).replace(/^@/, '');
  const expectedPicNorm = normalize(deal.pic || 'Giáng Tuyết');
  const matchedIndices = [];
  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const channelVal = normalize(row[colMap.channelName] || '').replace(/^@/, '');
    if (!channelVal) continue;
    if (channelVal === kocSearchNorm || channelVal.includes(kocSearchNorm)) {
      matchedIndices.push(r);
    }
  }

  let targetRowIdx = -1;
  if (matchedIndices.length === 1) {
    targetRowIdx = matchedIndices[0];
  } else if (matchedIndices.length > 1) {
    const picMatched = matchedIndices.filter(r => normalize(rows[r][colMap.pic] || '').includes(expectedPicNorm));
    if (picMatched.length === 1) {
      targetRowIdx = picMatched[0];
    } else {
      throw new Error(`Tìm thấy nhiều dòng (${matchedIndices.map(r => r + 1).join(', ')}) khớp KOC "${deal.koc.name}" trên Sheet Data KOC. Vui lòng kiểm tra lại!`);
    }
  }

  if (targetRowIdx === -1) {
    throw new Error(`Không tìm thấy dòng của KOC "${deal.koc.name}" trên Sheet Data KOC!`);
  }

  const targetRowNumber = targetRowIdx + 1;
  const matchedRow = rows[targetRowIdx];
  const picVal = normalize(matchedRow[colMap.pic] || '');
  console.log(`-> Khớp dòng KOC tại Row ${targetRowNumber} (Người phụ trách: "${matchedRow[colMap.pic]}")`);

  // Kiểm tra người phụ trách
  if (!picVal.includes('tuyết') && !picVal.includes(expectedPicNorm)) {
    throw new Error(`Người phụ trách trên Sheet ("${matchedRow[colMap.pic]}") không khớp với "${deal.pic || 'Giáng Tuyết'}". Vui lòng kiểm tra lại!`);
  }

  const castAmount = deal.cast?.amount || 0;
  const totalCostVal = typeof totalPrice === 'number' ? totalPrice.toLocaleString('vi-VN') : totalPrice;

  const updates = [
    { range: `'${tabName}'!${colIndexToA1(colMap.status)}${targetRowNumber}`, values: [['Đã chốt']] },
    { range: `'${tabName}'!${colIndexToA1(colMap.giftQty)}${targetRowNumber}`, values: [[deal.products?.length || 1]] },
    { range: `'${tabName}'!${colIndexToA1(colMap.productCode)}${targetRowNumber}`, values: [[productCode]] },
    { range: `'${tabName}'!${colIndexToA1(colMap.totalProductCost)}${targetRowNumber}`, values: [[totalCostVal]] },
    { range: `'${tabName}'!${colIndexToA1(colMap.totalCast)}${targetRowNumber}`, values: [[castAmount]] }
  ];

  if (!options.dryRun) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    console.log(`-> ĐÃ CẬP NHẬT THÀNH CÔNG SHEET DATA KOC TẠI ROW ${targetRowNumber}!`);
  } else {
    console.log(`-> [DRY RUN] Sẽ cập nhật Sheet Data KOC tại Row ${targetRowNumber}: Trạng thái = Đã chốt, Mã = ${productCode}, Chi phí = ${totalCostVal}, Cast = ${castAmount}`);
  }

  const result = {
    koc: deal.koc.name,
    gmailDraftId: draftId,
    subject,
    showroom: showroomName,
    sheetRow: targetRowNumber,
    isDryRun: Boolean(options.dryRun)
  };

  fs.writeFileSync('d:/Booking/last_thucthi1_result.json', JSON.stringify(result, null, 2), 'utf8');

  console.log(`\n🎉 HOÀN THÀNH THỰC THI 1 THÀNH CÔNG!`);
  return result;
}

module.exports = { handleThucThi1Command };
