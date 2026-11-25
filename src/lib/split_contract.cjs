const fs = require('fs');
const { getOrCreateSubfolder } = require('../utils/drive_folder.util.cjs');
const { verifyContract } = require('../commands/verify_contract.cjs');

const MAX_GIFT_CONTRACT_VALUE = 20000000; // Không quá 20 triệu VNĐ / 1 HĐ Tặng SP

function addDaysIso(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function formatSowSentence(item) {
  const category = item.category || 'Video';
  const platform = item.platform || 'Tiktok';
  const duration = item.qty || item.duration || (category.includes('Photo') ? '7-8 ảnh' : '60-90s');
  const concept = item.concept || 'Review đồng hồ Saga';
  const airDate = item.airDate || '';
  const reupPart = item.reup
    ? ` (Reup ${category.includes('Photo') ? '' : 'Reels, Story '}${item.reup})`.trim()
    : '';
  const noteWrap = item.note ? ` (${item.note})` : '';
  return `Đăng 01 ${category} ${platform}${reupPart} (${duration}) “${concept}” vào ngày ${airDate}${noteWrap}`.trim();
}

function buildProductDetailBlock(p) {
  return `- Thương hiệu: ${p.brand || 'Saga'}\n- Số hiệu sản phẩm: ${p.code}\n- Bộ sưu tập: ${p.collection || 'Saga'}\n- Xuất xứ: ${p.origin || 'Mỹ'}\n- Máy: ${p.movement || 'Quartz (Pin)'}\n- Bảo Hành Quốc Tế: ${p.warranty || '2 Năm'}`;
}

/**
 * Chia danh sách sản phẩm thành nhiều nhóm sao cho tổng giá trị mỗi nhóm <= 20.000.000 VNĐ
 */
function splitProductsByMaxValue(products, maxVal = MAX_GIFT_CONTRACT_VALUE) {
  const groups = [];
  let currentGroup = [];
  let currentSum = 0;

  for (const p of products) {
    const val = Number(String(p.value || '0').replace(/[^0-9]/g, ''));
    if (currentGroup.length > 0 && currentSum + val > maxVal) {
      groups.push(currentGroup);
      currentGroup = [p];
      currentSum = val;
    } else {
      currentGroup.push(p);
      currentSum += val;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
}

async function createOrReuseDoc(drive, folderId, templateId, docTitle, replace, explicitDocId) {
  if (explicitDocId) return { docId: explicitDocId, isExisting: true };
  const existing = await drive.files.list({
    q: `'${folderId}' in parents and name = '${docTitle}' and trashed = false`,
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  if (existing.data.files && existing.data.files.length > 0) {
    const gdoc = existing.data.files.find(f => f.mimeType === 'application/vnd.google-apps.document');
    if (gdoc) {
      if (!replace) return { docId: gdoc.id, isExisting: true };
      try {
        await drive.files.update({
          fileId: gdoc.id,
          supportsAllDrives: true,
          requestBody: { trashed: true }
        });
      } catch (_) {
        // Không có quyền xóa trên Shared Drive -> sửa trực tiếp trên file hiện có
        return { docId: gdoc.id, isExisting: true };
      }
    }
  }
  const copyRes = await drive.files.copy({
    fileId: templateId,
    supportsAllDrives: true,
    requestBody: {
      name: docTitle,
      parents: [folderId],
      mimeType: 'application/vnd.google-apps.document'
    }
  });
  return { docId: copyRes.data.id, isExisting: false };
}

async function setCellTextSafe(docs, docId, cell, newText) {
  if (!cell || !cell.content || !cell.content[0]?.paragraph) return;
  const start = cell.content[0].paragraph.elements[0].startIndex;
  const end = cell.content.slice(-1)[0].paragraph.elements.slice(-1)[0].endIndex;
  const reqs = [];
  if (end - 1 > start) {
    reqs.push({ deleteContentRange: { range: { startIndex: start, endIndex: end - 1 } } });
  }
  if (newText !== undefined && newText !== null && newText !== '') {
    reqs.push({ insertText: { location: { index: start }, text: String(newText) } });
  }
  if (reqs.length > 0) {
    await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: reqs } });
  }
}

function getWatchCountLabel(count) {
  const words = { 1: 'một', 2: 'hai', 3: 'ba', 4: 'bốn', 5: 'năm', 6: 'sáu', 7: 'bảy', 8: 'tám', 9: 'chín', 10: 'mười' };
  const pad = count < 10 ? `0${count}` : String(count);
  return `${pad} (${words[count] || count}) chiếc đồng hồ`;
}

async function syncGiftProductTable(docs, docId, productChunk, totalValFormatted) {
  let docData = (await docs.documents.get({ documentId: docId })).data;
  let prodTable = docData.body.content.filter(el => el.table)[1];
  if (!prodTable) return;

  const targetDataRows = productChunk.length;
  let currentDataRows = prodTable.table.tableRows.length - 2; // row 0 = header, last row = total

  while (currentDataRows < targetDataRows) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          insertTableRow: {
            tableCellLocation: { tableStartLocation: { index: prodTable.startIndex }, rowIndex: 1 },
            insertBelow: true
          }
        }]
      }
    });
    docData = (await docs.documents.get({ documentId: docId })).data;
    prodTable = docData.body.content.filter(el => el.table)[1];
    currentDataRows = prodTable.table.tableRows.length - 2;
  }

  while (currentDataRows > targetDataRows) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          deleteTableRow: {
            tableCellLocation: { tableStartLocation: { index: prodTable.startIndex }, rowIndex: 1 + targetDataRows }
          }
        }]
      }
    });
    docData = (await docs.documents.get({ documentId: docId })).data;
    prodTable = docData.body.content.filter(el => el.table)[1];
    currentDataRows = prodTable.table.tableRows.length - 2;
  }

  for (let i = 0; i < productChunk.length; i++) {
    const p = productChunk[i];
    const pVal = Number(String(p.value || '0').replace(/[^0-9]/g, '')).toLocaleString('vi-VN');
    const detailText = buildProductDetailBlock(p);
    const cellsData = [
      { col: 0, text: p.code },
      { col: 1, text: `Đồng hồ SAGA ${p.code}` },
      { col: 3, text: detailText },
      { col: 4, text: '1' },
      { col: 5, text: pVal }
    ];
    for (const item of cellsData) {
      docData = (await docs.documents.get({ documentId: docId })).data;
      prodTable = docData.body.content.filter(el => el.table)[1];
      const row = prodTable.table.tableRows[i + 1];
      if (row && row.tableCells[item.col]) {
        await setCellTextSafe(docs, docId, row.tableCells[item.col], item.text);
      }
    }
  }

  // Cập nhật hàng Tổng giá trị sản phẩm (hàng cuối cùng)
  docData = (await docs.documents.get({ documentId: docId })).data;
  prodTable = docData.body.content.filter(el => el.table)[1];
  const totalRow = prodTable.table.tableRows[prodTable.table.tableRows.length - 1];
  if (totalRow) {
    // Ô cuối có chứa giá trị (thường là cell 4 do merge 0..3)
    const valCell = totalRow.tableCells[totalRow.tableCells.length - 2]?.content?.map(c => c.paragraph?.elements?.map(e => e.textRun?.content || '').join('')).join('').trim()
      ? totalRow.tableCells[totalRow.tableCells.length - 2]
      : totalRow.tableCells[totalRow.tableCells.length - 1];
    if (valCell) {
      await setCellTextSafe(docs, docId, valCell, totalValFormatted);
    }
  }
}

async function createCastContract({ drive, docs, config, deal, kocFolderId, numberToVietnameseWords, options }) {
  const bookingDate = deal.bookingDate;
  const [yearStr, monthStr, dayStr] = bookingDate.split('-');
  const kocName = deal.koc.name;
  const kocFullName = deal.koc.fullName.toUpperCase();
  const docTitle = `${bookingDate} - ${kocName} - [Booking KOC/KOL] Hợp đồng Thương mại (Trả cast) - Đồng Hồ Hải Triều`;

  console.log(`\n--- TẠO / CẬP NHẬT HỢP ĐỒNG THƯƠNG MẠI (TRẢ CAST): ${docTitle} ---`);
  const { docId } = await createOrReuseDoc(
    drive,
    kocFolderId,
    config.CONTRACT_TEMPLATE_CAST_DOC_ID,
    docTitle,
    options.replace,
    options.castDocId
  );
  console.log(`-> Cast Doc ID: ${docId}`);

  const castSow = deal.sow.filter(s => s.contractType === 'Cast');
  const sowItems = castSow.length > 0 ? castSow : deal.sow.filter(s => !s.category?.toLowerCase().includes('photo'));
  const sowSentences = sowItems.map(formatSowSentence).join('\n');

  const netAmount = Number(deal.cast.amount || 0);
  // Net = 90% Gross (thuế TNCN 10% trên Gross) => Gross = Net / 0.9, Thuế = Gross - Net
  const grossAmount = netAmount >= 5000000 ? Math.round(netAmount / 0.9) : netAmount;
  const taxAmount = grossAmount - netAmount;
  const halfNet = Math.round(netAmount / 2);

  const netStr = netAmount.toLocaleString('vi-VN');
  const taxStr = taxAmount.toLocaleString('vi-VN');
  const grossStr = grossAmount.toLocaleString('vi-VN');
  const halfNetStr = halfNet.toLocaleString('vi-VN');

  const netWords = `${numberToVietnameseWords(netAmount)} Việt Nam Đồng`;
  const halfNetWords = `${numberToVietnameseWords(halfNet)} Việt Nam Đồng`;

  const sowChannelSummary = sowItems.map((s, idx) => `${idx + 1}. ${s.platform || 'TikTok'} (Reup ${s.reup || 'Facebook'})`).join('\n');
  const sowDatesSummary = sowItems.map(s => s.airDate).join('\n');
  const sowQtySummary = `${sowItems.length < 10 ? '0' + sowItems.length : sowItems.length} video (60-90s)`;

  const requests = [
    { replaceAllText: { containsText: { text: 'ngày 27 tháng 08 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },
    { replaceAllText: { containsText: { text: 'HỘ KINH DOANH NGUYỄN PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'NGUYỄN THỊ  PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'NGUYỄN THỊ PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tổ 3, Ấp 5B, Xã Lộc Tấn, Tỉnh Đồng Nai', matchCase: false }, replaceText: deal.koc.address || '' } },
    { replaceAllText: { containsText: { text: 'Mã số hộ kinh doanh: 070198007772', matchCase: false }, replaceText: `Mã số thuế: ${deal.koc.cccd || ''}` } },
    { replaceAllText: { containsText: { text: '070198007772', matchCase: false }, replaceText: deal.koc.cccd || '' } },
    { replaceAllText: { containsText: { text: 'booking.phuongdung@gmail.com', matchCase: false }, replaceText: deal.koc.email || '' } },
    { replaceAllText: { containsText: { text: '0337674264', matchCase: false }, replaceText: deal.koc.phone || '' } },
    { replaceAllText: { containsText: { text: 'Đại diện bởi: Nguyễn Thị Phương Dung\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đại diện bởi: Nguyễn Thị Phương Dung', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'https://www.facebook.com/profile.php?id=100088058531745', matchCase: false }, replaceText: `${deal.koc.channels?.facebook || ''}\nLà đại diện của kênh TikTok: ${deal.koc.channels?.tiktok || ''}` } },
    { replaceAllText: { containsText: { text: 'Nguyễn Phương Dung (Reup Reels)', matchCase: false }, replaceText: `${kocName}\n${sowChannelSummary}` } },
    { replaceAllText: { containsText: { text: 'Nguyễn Phương Dung', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: '05/10/2026', matchCase: false }, replaceText: sowDatesSummary } },
    { replaceAllText: { containsText: { text: '01 video', matchCase: false }, replaceText: sowQtySummary } },
    { replaceAllText: {
      containsText: { text: 'Reup 01 Video lên Reels Facebook khai thác nội dung “Quà tặng 20/10, nàng có thể tự mua quà cho chính mình, vì dù không có ai bên cạnh, nàng vẫn xứng đáng được yêu thương và tỏa sáng. Saga đồng hành cùng nàng qua nhiều phiên bản phong cách” vào ngày 05/10/2026', matchCase: false },
      replaceText: sowSentences
    } },
    { replaceAllText: {
      containsText: { text: 'Reup 03 video (60-90s) lên Reels Facebook khai thác nội dung “Quà tặng 20/10, nàng có thể tự mua quà cho chính mình, vì dù không có ai bên cạnh, nàng vẫn xứng đáng được yêu thương và tỏa sáng. Saga đồng hành cùng nàng qua nhiều phiên bản phong cách” vào ngày 29/11/2026\n10/01/2027\n12/01/2027', matchCase: false },
      replaceText: sowSentences
    } },
    { replaceAllText: { containsText: { text: '1.3. Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: '1.3. Thời gian hiển thị bài đăng: Trọn đời' } },
    { replaceAllText: { containsText: { text: '1.6. Thời hạn sử dụng hình ảnh: 1 tháng', matchCase: false }, replaceText: `1.6. Thời hạn sử dụng hình ảnh: ${deal.sdha || 'Trọn đời'}` } },
    { replaceAllText: { containsText: { text: 'Reup Reels Facebook', matchCase: false }, replaceText: sowItems.map(s => s.concept).join('; ') } },
    { replaceAllText: {
      containsText: { text: 'Bên A trả cho Bên B tổng chi phí để thực hiện dịch vụ bằng hiện kim là: 4.500.000 (Bằng chữ: Bốn triệu năm trăm nghìn Việt Nam Đồng) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)', matchCase: false },
      replaceText: `Bên A trả cho Bên B chi phí để thực hiện dịch vụ bằng hiện kim là: ${netStr} VNĐ đã khấu trừ thuế TNCN (Bằng chữ: ${netWords}) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)`
    } },
    { replaceAllText: { containsText: { text: '4.500.000', matchCase: false }, replaceText: netStr } },
    { replaceAllText: { containsText: { text: 'Bốn triệu năm trăm nghìn Việt Nam Đồng', matchCase: false }, replaceText: netWords } },
    { replaceAllText: { containsText: { text: '2.250.000', matchCase: false }, replaceText: halfNetStr } },
    { replaceAllText: { containsText: { text: 'Hai triệu hai trăm năm mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: halfNetWords } },
    { replaceAllText: { containsText: { text: '922019868', matchCase: false }, replaceText: '[Chờ KOC bổ sung STK]' } },
    { replaceAllText: { containsText: { text: 'Ngân hàng TMCP Quân Đội (MB Bank)', matchCase: false }, replaceText: '[Chờ KOC bổ sung Ngân hàng]' } }
  ];

  await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests } });

  if (netAmount >= 5000000) {
    let docData = (await docs.documents.get({ documentId: docId })).data;
    const tables = docData.body.content.filter(el => el.table);
    const feeTable = tables[1];
    if (feeTable && feeTable.table.tableRows.length === 3) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            { insertTableRow: { tableCellLocation: { tableStartLocation: { index: feeTable.startIndex }, rowIndex: 2 }, insertBelow: true } },
            { insertTableRow: { tableCellLocation: { tableStartLocation: { index: feeTable.startIndex }, rowIndex: 2 }, insertBelow: true } }
          ]
        }
      });
    }

    docData = (await docs.documents.get({ documentId: docId })).data;
    const updatedFeeTable = docData.body.content.filter(el => el.table)[1];
    if (updatedFeeTable && updatedFeeTable.table.tableRows.length >= 5) {
      const r2 = updatedFeeTable.table.tableRows[2];
      const r3 = updatedFeeTable.table.tableRows[3];
      const r4 = updatedFeeTable.table.tableRows[4];

      await setCellTextSafe(docs, docId, r2.tableCells[r2.tableCells.length - 1], `${grossStr} (Đã bao gồm thuế)`);

      let t2 = (await docs.documents.get({ documentId: docId })).data.body.content.filter(el => el.table)[1];
      await setCellTextSafe(docs, docId, t2.table.tableRows[3].tableCells[0], `Bên B: ${kocFullName} thực nhận`);

      t2 = (await docs.documents.get({ documentId: docId })).data.body.content.filter(el => el.table)[1];
      await setCellTextSafe(docs, docId, t2.table.tableRows[3].tableCells[r3.tableCells.length - 1], netStr);

      t2 = (await docs.documents.get({ documentId: docId })).data.body.content.filter(el => el.table)[1];
      await setCellTextSafe(docs, docId, t2.table.tableRows[4].tableCells[0], 'Bên A: Công ty TNHH Hải Triều Việt Nam thực hiện nghĩa vụ đóng thuế thu nhập cá nhân cho bên B');

      t2 = (await docs.documents.get({ documentId: docId })).data.body.content.filter(el => el.table)[1];
      await setCellTextSafe(docs, docId, t2.table.tableRows[4].tableCells[r4.tableCells.length - 1], taxStr);
    }
  }

  const verifyResult = await verifyContract(docId);
  return {
    type: 'Cast',
    id: docId,
    title: docTitle,
    url: `https://docs.google.com/document/d/${docId}/edit`,
    netAmount,
    grossAmount,
    taxAmount,
    sowCount: sowItems.length,
    verified: verifyResult.allPass
  };
}

async function createGiftContractChunk({ drive, docs, config, deal, kocFolderId, numberToVietnameseWords, productChunk, sowChunk, giftDate, explicitDocId, options }) {
  const [yearStr, monthStr, dayStr] = giftDate.split('-');
  const kocName = deal.koc.name;
  const kocFullName = deal.koc.fullName.toUpperCase();
  const docTitle = `${giftDate} - ${kocName} - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều`;

  console.log(`\n--- TẠO / CẬP NHẬT HỢP ĐỒNG TẶNG SP (${giftDate}): ${docTitle} ---`);
  const { docId, isExisting } = await createOrReuseDoc(
    drive,
    kocFolderId,
    config.CONTRACT_TEMPLATE_DOC_ID,
    docTitle,
    options.replace,
    explicitDocId
  );
  console.log(`-> Gift Doc ID (${giftDate}): ${docId} (isExisting=${isExisting})`);

  const sowSentences = sowChunk.map(formatSowSentence).join('\n');
  const totalVal = productChunk.reduce((sum, p) => sum + Number(String(p.value || '0').replace(/[^0-9]/g, '')), 0);
  const totalValFormatted = totalVal.toLocaleString('vi-VN');
  const totalValInWords = numberToVietnameseWords(totalVal) + ' Việt Nam Đồng';

  const allCodes = productChunk.map(p => p.code).join(', ');
  const allNames = productChunk.map(p => `Đồng hồ SAGA ${p.code}`).join('\n');
  const allDetails = productChunk.map((p, i) => `${i + 1}. Đồng hồ SAGA ${p.code}:\n${buildProductDetailBlock(p)}`).join('\n\n');
  const totalQtyStr = String(productChunk.length);

  if (!isExisting) {
    // Doc mới từ template: xóa các item thừa trong Table 1 (giữ lại đúng số hạng mục SOW)
    const docPre = (await docs.documents.get({ documentId: docId })).data;
    const sowTablePre = docPre.body.content.find(el => el.table);
    if (sowTablePre) {
      if (sowChunk.length === 1 && sowTablePre.table.tableRows.length >= 8) {
        // Xóa Item 3 (row 6) trước, rồi xóa Item 2 (row 3)
        await docs.documents.batchUpdate({
          documentId: docId,
          requestBody: { requests: [{ deleteTableRow: { tableCellLocation: { tableStartLocation: { index: sowTablePre.startIndex }, rowIndex: 6 } } }] }
        });
        const docMid = (await docs.documents.get({ documentId: docId })).data;
        const sowTableMid = docMid.body.content.find(el => el.table);
        if (sowTableMid.table.tableRows.length >= 6) {
          await docs.documents.batchUpdate({
            documentId: docId,
            requestBody: { requests: [{ deleteTableRow: { tableCellLocation: { tableStartLocation: { index: sowTableMid.startIndex }, rowIndex: 3 } } }] }
          });
        }
      } else if (sowChunk.length === 2 && sowTablePre.table.tableRows.length >= 7) {
        await docs.documents.batchUpdate({
          documentId: docId,
          requestBody: { requests: [{ deleteTableRow: { tableCellLocation: { tableStartLocation: { index: sowTablePre.startIndex }, rowIndex: 6 } } }] }
        });
      }
    }

    const channelFacebookLine = deal.koc.channels?.facebook ? `Là đại diện của kênh Facebook: ${deal.koc.channels.facebook}` : '';
    const requests = [
      { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: sowSentences } },
      { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026\n', matchCase: false }, replaceText: '' } },
      { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
      { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026\n', matchCase: false }, replaceText: '' } },
      { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: '' } },
      { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },
      { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: deal.koc.address || '' } },
      { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: deal.koc.cccd || '' } },
      { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: deal.koc.phone || '' } },
      { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: deal.koc.email || '' } },
      { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: channelFacebookLine } },
      ...(deal.koc.channels?.tiktok
        ? [{ replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: deal.koc.channels.tiktok } }]
        : [
          { replaceAllText: { containsText: { text: 'Là đại diện của kênh Tiktok: www.tiktok.com/@alice.109_\n', matchCase: false }, replaceText: '' } },
          { replaceAllText: { containsText: { text: 'Là đại diện của kênh Tiktok: www.tiktok.com/@alice.109_', matchCase: false }, replaceText: '' } }
        ]),
      ...(deal.koc.channels?.instagram
        ? [{ replaceAllText: { containsText: { text: 'https://www.instagram.com/waananh', matchCase: false }, replaceText: deal.koc.channels.instagram } }]
        : [
          { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh  ', matchCase: false }, replaceText: '' } },
          { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh\n', matchCase: false }, replaceText: '' } },
          { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh', matchCase: false }, replaceText: '' } }
        ]),
      { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'TikTok, Facebook' } },
      { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Tiktok)` } },
      { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Tiktok)` } },
      { replaceAllText: { containsText: { text: 'waananh (Instagram)', matchCase: false }, replaceText: `${kocName} (Tiktok)` } },
      { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocName } },
      { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocName } },
      { replaceAllText: { containsText: { text: 'waananh', matchCase: false }, replaceText: kocName } },
      { replaceAllText: { containsText: { text: 'Van Anh (alice)', matchCase: false }, replaceText: kocName } },
      { replaceAllText: { containsText: { text: 'Reup Reels, Story Instagram', matchCase: false }, replaceText: 'Reup Facebook' } },
      { replaceAllText: { containsText: { text: 'Reup Threads', matchCase: false }, replaceText: 'Reup Facebook' } },
      { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: sowChunk[1]?.airDate || sowChunk[0]?.airDate || '' } },
      { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: sowChunk[0]?.airDate || '' } },
      { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: sowChunk[1]?.qty || sowChunk[0]?.qty || '01 bộ (7-8 ảnh)' } },
      { replaceAllText: { containsText: { text: '01 video', matchCase: false }, replaceText: sowChunk[0]?.qty || '01 bộ (7-8 ảnh)' } },
      { replaceAllText: { containsText: { text: 'Video Post', matchCase: true }, replaceText: 'Photo Post' } },
      { replaceAllText: {
        containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle)\u000b1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false },
        replaceText: '1.1. Số lượng hình ảnh/một bộ: Từ 7 đến 8 ảnh/bộ (Trong đó: ảnh cô dâu 5-6 ảnh và ảnh cô dâu cùng chú rể 2-3 ảnh, có 2-3 ảnh cận đồng hồ).'
      } },
      { replaceAllText: { containsText: { text: 'Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: 'Thời gian hiển thị bài đăng: Trọn đời.' } },
      { replaceAllText: { containsText: { text: 'Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: `Thời hạn sử dụng hình ảnh: ${deal.sdha || 'Trọn đời'}` } },
      { replaceAllText: {
        containsText: { text: 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook\n', matchCase: false },
        replaceText: 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook; gắn voucher brand tặng 15% dưới phần bình luận của Facebook (riêng TikTok không gắn link trong comment)\n'
      } },
      { replaceAllText: { containsText: { text: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 53578-LGSVLG-2  \n- Bộ sưu tập: Saga Stella Chance  \n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: allDetails } },
      { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2   - Bộ sưu tập: Saga Stella Chance - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: allDetails } },
      { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: allNames } },
      { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: allCodes } },
      { replaceAllText: { containsText: { text: 'Saga Stella Chance', matchCase: false }, replaceText: productChunk.map(p => p.collection).join(', ') } },
      { replaceAllText: { containsText: { text: '01 (một) chiếc đồng hồ', matchCase: false }, replaceText: getWatchCountLabel(productChunk.length) } },
      { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: totalValFormatted } },
      { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: totalValInWords } },
      { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: deal.showroom.address || '' } },
      { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: deal.showroom.pickupDate || '' } }
    ];
    await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests } });
    await syncGiftProductTable(docs, docId, productChunk, totalValFormatted);
  } else {
    // Sửa trực tiếp trên Google Doc hiện có (không tạo file mới)
    const docCur = (await docs.documents.get({ documentId: docId })).data;
    const tablesCur = docCur.body.content.filter(el => el.table);
    const sowTableCur = tablesCur[0];

    // Nếu cần xóa Item 2 (row 3) trong Table 1 để chỉ giữ 1 hạng mục SOW
    if (sowChunk.length === 1 && sowTableCur && sowTableCur.table.tableRows.length >= 6) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: { requests: [{ deleteTableRow: { tableCellLocation: { tableStartLocation: { index: sowTableCur.startIndex }, rowIndex: 3 } } }] }
      });
    }

    // Xóa câu SOW thứ 2 ở Điều 1.3 nếu chỉ giữ 1 SOW + xóa dòng Instagram không có + cập nhật số lượng đồng hồ
    const reqsExisting = [];
    if (sowChunk.length === 1) {
      const otherAir = deal.sow.find(s => s.contractType === 'Gift' && s.airDate !== sowChunk[0].airDate);
      if (otherAir) {
        const dropSentence = formatSowSentence(otherAir);
        reqsExisting.push({ replaceAllText: { containsText: { text: `\n${dropSentence}`, matchCase: false }, replaceText: '' } });
        reqsExisting.push({ replaceAllText: { containsText: { text: dropSentence, matchCase: false }, replaceText: '' } });
      }
    }
    if (!deal.koc.channels?.instagram) {
      reqsExisting.push(
        { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: không có  ', matchCase: false }, replaceText: '' } },
        { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: không có\n', matchCase: false }, replaceText: '' } },
        { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: không có', matchCase: false }, replaceText: '' } }
      );
    }
    reqsExisting.push(
      { replaceAllText: { containsText: { text: '01 (một) chiếc đồng hồ', matchCase: false }, replaceText: getWatchCountLabel(productChunk.length) } },
      { replaceAllText: { containsText: { text: '32.500.000', matchCase: false }, replaceText: totalValFormatted } },
      { replaceAllText: { containsText: { text: 'Ba mươi hai triệu năm trăm nghìn Việt Nam Đồng', matchCase: false }, replaceText: totalValInWords } }
    );
    await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: reqsExisting } });
    await syncGiftProductTable(docs, docId, productChunk, totalValFormatted);
  }

  const verifyResult = await verifyContract(docId);
  return {
    type: 'Gift',
    id: docId,
    title: docTitle,
    url: `https://docs.google.com/document/d/${docId}/edit`,
    productCode: allCodes,
    productName: allNames,
    productValue: totalVal,
    sowCount: sowChunk.length,
    verified: verifyResult.allPass
  };
}

async function handleSplitContract({ drive, docs, config, deal, monthFolderId, numberToVietnameseWords, options }) {
  const bookingDate = deal.bookingDate;
  const kocName = deal.koc.name;
  const kocFullName = deal.koc.fullName.toUpperCase();
  const compositeFolderName = `${bookingDate} - ${kocName} - [Booking KOC/KOL] Hợp đồng tổng hợp - Đồng Hồ Hải Triều`;

  console.log(`1. Tạo / Tìm thư mục tổng KOC: "${compositeFolderName}"...`);
  const kocFolderId = await getOrCreateSubfolder(drive, monthFolderId, compositeFolderName);
  const kocFolderUrl = `https://drive.google.com/drive/folders/${kocFolderId}`;

  const castContract = await createCastContract({ drive, docs, config, deal, kocFolderId, numberToVietnameseWords, options });

  // Chỉ tách sản phẩm TẶNG (sản phẩm mượn tích hợp trong hợp đồng chính, không tách riêng)
  const giftOnlyProducts = (deal.products || []).filter(p => !p.isLoan && p.type !== 'loan');
  const productGroups = splitProductsByMaxValue(giftOnlyProducts, MAX_GIFT_CONTRACT_VALUE);
  const giftSows = deal.sow.filter(s => s.contractType === 'Gift');

  const giftContracts = [];
  for (let i = 0; i < productGroups.length; i++) {
    const giftDate = addDaysIso(bookingDate, i + 1); // 2026-11-14, 2026-11-15...
    const sowSlice = productGroups.length === giftSows.length
      ? [giftSows[i]]
      : (i === 0 ? giftSows : []);
    const gc = await createGiftContractChunk({
      drive,
      docs,
      config,
      deal,
      kocFolderId,
      numberToVietnameseWords,
      productChunk: productGroups[i],
      sowChunk: sowSlice.length > 0 ? sowSlice : [giftSows[0]].filter(Boolean),
      giftDate,
      explicitDocId: i === 0 ? options.giftDocId : undefined,
      options
    });
    giftContracts.push(gc);
  }

  const allContracts = [castContract, ...giftContracts];
  const contractResult = {
    compositeFolder: { id: kocFolderId, name: compositeFolderName, url: kocFolderUrl },
    contracts: allContracts,
    koc: {
      kocName,
      fullName: kocFullName,
      cccd: deal.koc.cccd,
      phone: deal.koc.phone,
      email: deal.koc.email,
      address: deal.koc.address,
      showroom: deal.showroom.address,
      pickupDate: deal.showroom.pickupDate
    },
    verified: allContracts.every(c => c.verified)
  };

  fs.writeFileSync('d:/Booking/last_contract_result.json', JSON.stringify(contractResult, null, 2), 'utf8');
  return contractResult;
}

module.exports = { handleSplitContract };
