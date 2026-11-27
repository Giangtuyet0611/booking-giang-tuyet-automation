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
  const { drive, docs, sheets, config } = getClients();

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

  let contractId = options.docId || deal.docId || null;
  const lastContractPath = 'd:/Booking/last_contract_result.json';
  if (!contractId && fs.existsSync(lastContractPath)) {
    try {
      const lastContract = JSON.parse(fs.readFileSync(lastContractPath, 'utf8'));
      const sameKoc = normalize(lastContract?.koc?.kocName) === normalize(deal.koc.name);
      if (sameKoc && lastContract.contracts && lastContract.contracts[0]) {
        contractId = lastContract.contracts[0].id;
      }
    } catch (_) {}
  }

  if (!contractId && deal.bookingDate) {
    try {
      const monthNum = parseInt(deal.bookingDate.split('-')[1], 10);
      const monthRes = await drive.files.list({
        q: `'${config.CONTRACT_TARGET_ROOT_FOLDER_ID}' in parents and name = 'Tháng ${monthNum}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });
      const monthFolderId = monthRes.data.files?.[0]?.id;
      if (monthFolderId) {
        const docSearch = await drive.files.list({
          q: `'${monthFolderId}' in parents and name contains '${deal.koc.name.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
          fields: 'files(id, name)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });
        if (docSearch.data.files && docSearch.data.files[0]) {
          contractId = docSearch.data.files[0].id;
        }
      }
    } catch (_) {}
  }

  if (contractId) {
    try {
      {
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

        const benBBlockMatch = fullText.match(/BÊN B:[\s\S]*?(?=ĐIỀU 1:|$)/i);
        const benBBlock = benBBlockMatch ? benBBlockMatch[0] : fullText;

        const benBMatch = benBBlock.match(/BÊN B:\s*([^\n]+)/i);
        if (benBMatch) kocFullName = benBMatch[1].trim();

        const cccdMatch = benBBlock.match(/Số căn cước công dân \(CCCD\):\s*([0-9]+)/i);
        if (cccdMatch) kocCccd = cccdMatch[1].trim();

        const sdtMatch = benBBlock.match(/Số điện thoại:\s*([0-9.\s]+)/i);
        if (sdtMatch) kocPhone = sdtMatch[1].replace(/\s+/g, '').trim();

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

  const result = {
    koc: deal.koc.name,
    gmailDraftId: draftId,
    subject,
    showroom: showroomName,
    isDryRun: Boolean(options.dryRun)
  };

  fs.writeFileSync('d:/Booking/last_thucthi1_result.json', JSON.stringify(result, null, 2), 'utf8');

  console.log(`\n🎉 HOÀN THÀNH THỰC THI 1 THÀNH CÔNG!`);
  return result;
}

module.exports = { handleThucThi1Command };
