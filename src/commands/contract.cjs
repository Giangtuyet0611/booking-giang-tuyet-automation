const fs = require('fs');
const { getClients } = require('../lib/google.cjs');
const { getOrCreateSubfolder } = require('../utils/drive_folder.util.cjs');
const { verifyContract } = require('./verify_contract.cjs');
const { handleSplitContract } = require('../lib/split_contract.cjs');

function numberToVietnameseWords(num) {
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const units = ['', 'nghìn', 'triệu', 'tỷ'];

  if (num === 0) return 'không đồng';
  let strNum = Math.round(num).toString();
  
  const chunks = [];
  while (strNum.length > 0) {
    chunks.unshift(strNum.slice(-3));
    strNum = strNum.slice(0, -3);
  }

  function readChunk(chunk, isHighest) {
    const n = parseInt(chunk, 10);
    if (n === 0) return '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    let res = '';

    if (h > 0 || !isHighest) {
      res += digits[h] + ' trăm ';
    }

    if (t === 0 && o > 0) {
      if (h > 0 || !isHighest) res += 'lẻ ';
      res += digits[o];
    } else if (t === 1) {
      res += 'mười ';
      if (o === 1) res += 'một';
      else if (o === 5) res += 'lăm';
      else if (o > 0) res += digits[o];
    } else if (t > 1) {
      res += digits[t] + ' mươi ';
      if (o === 1) res += 'mốt';
      else if (o === 5) res += 'lăm';
      else if (o > 0) res += digits[o];
    }

    return res.trim();
  }

  let words = '';
  const totalChunks = chunks.length;
  for (let i = 0; i < totalChunks; i++) {
    const chunkWords = readChunk(chunks[i], i === 0);
    if (chunkWords) {
      const unitIndex = totalChunks - 1 - i;
      words += chunkWords + ' ' + (units[unitIndex] || '') + ' ';
    }
  }

  words = words.trim().replace(/\s+/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatSowItemSentence(item) {
  const category = item.category || 'Video';
  const platform = item.platform || 'Tiktok';
  const duration = item.qty || item.duration || (category.includes('Photo') ? '6-8 ảnh' : '60-90s');
  const concept = item.concept || item.title || 'Review đồng hồ Saga';
  const airDate = item.airDate || '27/11/2026';

  let reupPart = '';
  if (item.reup) {
    const reupType = category.includes('Photo') ? '' : 'Reels, Story ';
    reupPart = ` (Reup ${reupType}${item.reup})`;
  }

  let noteWrap = '';
  if (item.note) {
    noteWrap = ` (${item.note})`;
  }

  return `Đăng 01 ${category} ${platform}${reupPart} (${duration}) “${concept}” vào ngày ${airDate}${noteWrap}`.trim();
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

async function syncGiftSowTable(docs, docId, deal) {
  let docData = (await docs.documents.get({ documentId: docId })).data;
  let sowTable = docData.body.content.find(el => el.table);
  if (!sowTable) return;

  // Giữ Row 0 (header) và Row 1 (template row), xóa các row từ index 2 trở đi
  while (sowTable.table.tableRows.length > 2) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          deleteTableRow: {
            tableCellLocation: { tableStartLocation: { index: sowTable.startIndex }, rowIndex: sowTable.table.tableRows.length - 1 }
          }
        }]
      }
    });
    docData = (await docs.documents.get({ documentId: docId })).data;
    sowTable = docData.body.content.find(el => el.table);
  }

  // Thêm đủ số hàng cho deal.sow (nếu chỉ còn Row 0 header thì insertBelow rowIndex 0)
  while (sowTable.table.tableRows.length - 1 < deal.sow.length) {
    const baseRowIdx = sowTable.table.tableRows.length > 1 ? 1 : 0;
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          insertTableRow: {
            tableCellLocation: { tableStartLocation: { index: sowTable.startIndex }, rowIndex: baseRowIdx },
            insertBelow: true
          }
        }]
      }
    });
    docData = (await docs.documents.get({ documentId: docId })).data;
    sowTable = docData.body.content.find(el => el.table);
  }

  // Đảm bảo các hàng dữ liệu (từ row 1 trở đi) có nền trắng (không bị dính nền vàng từ header nếu copy từ row 0)
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [{
        updateTableCellStyle: {
          tableRange: {
            tableCellLocation: { tableStartLocation: { index: sowTable.startIndex }, rowIndex: 1, columnIndex: 0 },
            rowSpan: deal.sow.length,
            columnSpan: sowTable.table.columns
          },
          tableCellStyle: {
            backgroundColor: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } }
          },
          fields: 'backgroundColor'
        }
      }]
    }
  });

  const kocName = deal.koc.name;
  for (let i = 0; i < deal.sow.length; i++) {
    const item = deal.sow[i];
    const reupStr = item.reup ? ` (Reup ${item.reup})` : '';
    const channelText = `${kocName} (${item.platform || 'TikTok'})${reupStr}`;
    const cellsData = [
      { col: 0, text: String(i + 1) },
      { col: 1, text: item.category || 'Video Post' },
      { col: 3, text: channelText },
      { col: 4, text: item.qty || '01' },
      { col: 5, text: '1' },
      { col: 6, text: item.airDate || '' }
    ];
    for (const c of cellsData) {
      docData = (await docs.documents.get({ documentId: docId })).data;
      sowTable = docData.body.content.find(el => el.table);
      const row = sowTable.table.tableRows[i + 1];
      if (row && row.tableCells[c.col]) {
        await setCellTextSafe(docs, docId, row.tableCells[c.col], c.text);
      }
    }
  }

  // Đảm bảo chữ trong các hàng dữ liệu không bị in đậm
  docData = (await docs.documents.get({ documentId: docId })).data;
  sowTable = docData.body.content.find(el => el.table);
  const unboldReqs = [];
  for (let r = 1; r < sowTable.table.tableRows.length; r++) {
    for (const cell of sowTable.table.tableRows[r].tableCells) {
      for (const content of cell.content || []) {
        if (content.paragraph && content.endIndex - 1 > content.startIndex) {
          unboldReqs.push({
            updateTextStyle: {
              range: { startIndex: content.startIndex, endIndex: content.endIndex - 1 },
              textStyle: { bold: false },
              fields: 'bold'
            }
          });
        }
      }
    }
  }
  if (unboldReqs.length > 0) {
    await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: unboldReqs } });
  }
}

async function syncSingleGiftProductTable(docs, docId, products, totalValFormatted) {
  const list = Array.isArray(products) ? products.filter(p => p && p.code) : (products && products.code ? [products] : []);
  if (list.length === 0) return;

  let docData = (await docs.documents.get({ documentId: docId })).data;
  let prodTable = docData.body.content.filter(el => el.table)[1];
  if (!prodTable || !prodTable.table.tableRows[1]) return;

  // Điều chỉnh số hàng dữ liệu = list.length (row 0 = header, row cuối = tổng)
  let currentDataRows = prodTable.table.tableRows.length - 2;
  while (currentDataRows < list.length) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests: [{ insertTableRow: { tableCellLocation: { tableStartLocation: { index: prodTable.startIndex }, rowIndex: 1 }, insertBelow: true } }] }
    });
    docData = (await docs.documents.get({ documentId: docId })).data;
    prodTable = docData.body.content.filter(el => el.table)[1];
    currentDataRows = prodTable.table.tableRows.length - 2;
  }
  while (currentDataRows > list.length) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests: [{ deleteTableRow: { tableCellLocation: { tableStartLocation: { index: prodTable.startIndex }, rowIndex: 1 + list.length } } }] }
    });
    docData = (await docs.documents.get({ documentId: docId })).data;
    prodTable = docData.body.content.filter(el => el.table)[1];
    currentDataRows = prodTable.table.tableRows.length - 2;
  }

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const pVal = Number(String(p.value || '0').replace(/[^0-9]/g, '')).toLocaleString('vi-VN');
    const detailText = `- Thương hiệu: ${p.brand || 'Saga'}\n- Số hiệu sản phẩm: ${p.code}\n- Bộ sưu tập: ${p.collection || ''}\n- Xuất xứ: ${p.origin || 'Mỹ'}\n- Máy: ${p.movement || 'Quartz (Pin)'}\n- Bảo Hành Quốc Tế: ${p.warranty || '2 Năm'}`;
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

  docData = (await docs.documents.get({ documentId: docId })).data;
  prodTable = docData.body.content.filter(el => el.table)[1];
  const totalRow = prodTable.table.tableRows[prodTable.table.tableRows.length - 1];
  if (totalRow) {
    const valCell = totalRow.tableCells[totalRow.tableCells.length - 2]?.content?.map(c => c.paragraph?.elements?.map(e => e.textRun?.content || '').join('')).join('').trim()
      ? totalRow.tableCells[totalRow.tableCells.length - 2]
      : totalRow.tableCells[totalRow.tableCells.length - 1];
    if (valCell) {
      await setCellTextSafe(docs, docId, valCell, totalValFormatted);
    }
  }
}

async function handleContractCommand(deal, options = {}) {
  const { drive, docs, config } = getClients();

  const fileMemRootId = config.CONTRACT_TARGET_ROOT_FOLDER_ID;
  const templateGiftDocId = config.CONTRACT_TEMPLATE_DOC_ID;

  const bookingDate = deal.bookingDate || new Date().toISOString().split('T')[0];
  const [yearStr, monthStr, dayStr] = bookingDate.split('-');
  const monthFolderName = `Tháng ${parseInt(monthStr, 10)}`;

  const monthFolderId = await getOrCreateSubfolder(drive, fileMemRootId, monthFolderName);

  // Nếu deal vừa có Cast > 0 vừa có sản phẩm TẶNG (không phải sản phẩm mượn) -> Tách thành Thư mục tổng + HĐ Cast + HĐ Tặng SP
  const giftProducts = (deal.products || []).filter(p => !p.isLoan && p.type !== 'loan');
  if (deal.cast && Number(deal.cast.amount || 0) > 0 && giftProducts.length > 0) {
    console.log(`\n============================================================`);
    console.log(`TIẾN HÀNH TÁCH HỢP ĐỒNG (CAST + GIFT): ${deal.koc.name}`);
    console.log(`============================================================\n`);
    return handleSplitContract({
      drive,
      docs,
      config,
      deal,
      monthFolderId,
      numberToVietnameseWords,
      options
    });
  }

  const kocName = deal.koc.name;
  const kocFullName = deal.koc.fullName.toUpperCase();
  const docTitle = `${bookingDate} - ${kocName} - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều`;

  console.log(`\n============================================================`);
  console.log(`TIẾN HÀNH TẠO HỢP ĐỒNG: ${docTitle}`);
  console.log(`============================================================\n`);

  let docId = options.docId || null;

  if (docId) {
    console.log(`-> Chế độ sửa trực tiếp trên Doc ID có sẵn: ${docId} (không tạo file mới)`);
  } else {
    // Kiểm tra file trùng
    const existingFiles = await drive.files.list({
      q: `'${monthFolderId}' in parents and name = '${docTitle}' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (existingFiles.data.files && existingFiles.data.files.length > 0) {
      if (!options.replace) {
        console.warn(`⚠️ File hợp đồng "${docTitle}" ĐÃ TỒN TẠI trên Drive (ID: ${existingFiles.data.files[0].id}).`);
        console.warn(`   Nếu muốn sửa trực tiếp trên file này, hãy truyền --doc-id ${existingFiles.data.files[0].id} hoặc --replace`);
        return {
          alreadyExists: true,
          docId: existingFiles.data.files[0].id,
          url: `https://docs.google.com/document/d/${existingFiles.data.files[0].id}/edit`
        };
      } else {
        console.log(`-> Đã bật --replace: Thử chuyển file cũ vào thùng rác...`);
        let allTrashed = true;
        for (const ef of existingFiles.data.files) {
          try {
            await drive.files.update({
              fileId: ef.id,
              supportsAllDrives: true,
              requestBody: { trashed: true }
            });
          } catch (err) {
            allTrashed = false;
            console.warn(`⚠️ Không đủ quyền xóa file ${ef.id} trên Shared Drive (${err.message}). Sẽ sửa trực tiếp trên file hiện có!`);
          }
        }
        if (!allTrashed) {
          docId = existingFiles.data.files[0].id;
        }
      }
    }
  }

  // 1. Copy template nếu chưa có docId
  if (!docId) {
    console.log(`1. Nhân bản từ template Google Doc...`);
    const copyRes = await drive.files.copy({
      fileId: templateGiftDocId,
      supportsAllDrives: true,
      requestBody: {
        name: docTitle,
        parents: [monthFolderId],
        mimeType: 'application/vnd.google-apps.document'
      }
    });
    docId = copyRes.data.id;
    console.log(`-> Doc ID mới: ${docId}`);
  } else {
    console.log(`1. Sử dụng Doc ID hiện có: ${docId} (sửa trực tiếp, không tạo file mới)...`);
  }

  // 2. Xóa Item 3 thừa trong Table 1 (Row 6) nếu deal chỉ có <= 2 hạng mục SOW
  if (deal.sow.length <= 2) {
    console.log(`2. Tối ưu Table 1: Loại bỏ hàng thừa Item 3 (Row 6)...`);
    const docPre = (await docs.documents.get({ documentId: docId })).data;
    const sowTablePre = docPre.body.content.find(el => el.table);
    if (sowTablePre && sowTablePre.table.tableRows.length >= 7) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [{
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: sowTablePre.startIndex },
                rowIndex: 6
              }
            }
          }]
        }
      });
    }
  }

  // 3. Chuẩn bị các trường văn bản thay thế IN-PLACE (Giữ nguyên 100% format bảng và văn bản)
  const totalVal = deal.products.reduce((sum, p) => sum + Number(String(p.value || '0').replace(/[^0-9]/g, '')), 0);
  const totalValFormatted = totalVal > 0 ? totalVal.toLocaleString('vi-VN') : '';
  const totalValInWords = totalVal > 0 ? (numberToVietnameseWords(totalVal) + ' Việt Nam Đồng') : '..........';

  const sowSentences = deal.sow.map(formatSowItemSentence).join('\n');

  const channelTiktokLine = deal.koc.channels?.tiktok ? `Là đại diện của kênh TikTok: ${deal.koc.channels.tiktok}` : '';
  const channelFacebookLine = deal.koc.channels?.facebook ? `Là đại diện của kênh Facebook: ${deal.koc.channels.facebook}` : '';

  const p0 = deal.products[0] || {};
  const hasProdCode = Boolean(p0.code && p0.code.trim());
  const prodNameDisplay = hasProdCode ? `Đồng hồ SAGA ${p0.code}` : '';
  const productDetailText = `- Thương hiệu: ${p0.brand || 'Saga'}\n- Số hiệu sản phẩm: ${p0.code || ''}\n- Bộ sưu tập: ${p0.collection || ''}\n- Xuất xứ: ${p0.origin || 'Mỹ'}\n- Máy: ${p0.movement || 'Quartz (Pin)'}\n- Bảo Hành Quốc Tế: ${p0.warranty || '2 Năm'}`;

  const activePlatforms = [];
  if (deal.koc.channels?.tiktok) activePlatforms.push('TikTok');
  if (deal.koc.channels?.facebook) activePlatforms.push('Facebook');
  if (deal.koc.channels?.instagram) activePlatforms.push('Instagram');
  const activePlatformsStr = activePlatforms.length > 0 ? activePlatforms.join(', ') : 'TikTok, Facebook';

  const has78Photos = deal.sow.some(s => (s.qty || '').includes('7-8'));
  const photoRuleText = has78Photos
    ? '1.1. Thời lượng video: 60 giây đến 90 giây.\n1.2. Số lượng hình ảnh/một bộ: Từ 7 đến 8 ảnh/bộ (Trong đó: ảnh cô dâu 5-6 ảnh và ảnh cô dâu cùng chú rể 2-3 ảnh, có 2-3 ảnh cận đồng hồ).'
    : '1.1. Thời lượng video: 60 giây đến 90 giây.\n1.2. Số lượng hình ảnh/một bộ: Từ 6 đến 8 ảnh/bộ.';

  const voucherRuleText = deal.koc.channels?.instagram
    ? 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook, Instagram; gắn voucher brand tặng 15% dưới phần bình luận của Facebook, Instagram và TikTok (riêng TikTok không gắn link)\n'
    : 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook; gắn voucher brand tặng 15% dưới phần bình luận của Facebook và TikTok\n';

  const requests = [
    // 0. THAY THẾ TOÀN BỘ CÂU SOW ĐIỀU 1.3 ĐẦU TIÊN (Tránh bị thay thế từng phần nhỏ làm sai lệch match string)
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: sowSentences } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: '' } },

    // Dọn dẹp triệt để nếu sót cụm từ Loan Niệm
    { replaceAllText: { containsText: { text: '“Trend Loan Niệm”', matchCase: false }, replaceText: `“${deal.sow[0]?.concept || 'Saga'}”` } },
    { replaceAllText: { containsText: { text: '“Trend Loan Niệm”', matchCase: false }, replaceText: `“${deal.sow[0]?.concept || 'Saga'}”` } },
    { replaceAllText: { containsText: { text: 'trend Loan Niệm', matchCase: false }, replaceText: 'Saga' } },
    { replaceAllText: { containsText: { text: 'trend Loan Niệm', matchCase: false }, replaceText: 'Saga' } },

    // 1. Ngày ký
    { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },

    // 2. Thông tin Bên B
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: deal.koc.address || '' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: deal.koc.cccd || '' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: deal.koc.phone || '' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: deal.koc.email || '' } },

    // 3. Kênh đại diện
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: channelFacebookLine || '' } },
    { replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: deal.koc.channels?.tiktok || '' } },
    ...(deal.koc.channels?.instagram
      ? [{ replaceAllText: { containsText: { text: 'https://www.instagram.com/waananh', matchCase: false }, replaceText: deal.koc.channels.instagram } }]
      : [
        { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh  ', matchCase: false }, replaceText: '' } },
        { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh\n', matchCase: false }, replaceText: '' } },
        { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh', matchCase: false }, replaceText: '' } }
      ]),
    { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: activePlatformsStr } },

    // 4. Kênh hiển thị trong bảng SOW và đại diện
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Facebook)` } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Facebook)` } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp  (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Facebook)` } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp  (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Facebook)` } },
    { replaceAllText: { containsText: { text: 'waananh (Instagram)', matchCase: false }, replaceText: `${kocName} (TikTok)` } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: 'waananh', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: 'Van Anh (alice)', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: 'Reup Reels, Story Instagram', matchCase: false }, replaceText: 'Reup Facebook' } },
    { replaceAllText: { containsText: { text: 'Reup Threads', matchCase: false }, replaceText: 'Reup Facebook' } },

    // 5. Cập nhật số lượng và ngày tháng trong Bảng SOW (chỉ chạy khi <= 2 SOW; > 2 SOW đã có syncGiftSowTable)
    ...(deal.sow.length <= 2 ? [
      { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: deal.sow[1]?.airDate || deal.sow[0]?.airDate || '27/11/2026' } },
      { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: deal.sow[0]?.airDate || '27/11/2026' } },
      { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: deal.sow[1]?.qty || '01 video (60-90s)' } },
      { replaceAllText: { containsText: { text: '01 video', matchCase: false }, replaceText: deal.sow[0]?.qty || '01 bộ (6-8 ảnh)' } },
      { replaceAllText: { containsText: { text: 'Video Post', matchCase: true }, replaceText: '__TEMP_VIDEO_CAT__' } },
      { replaceAllText: { containsText: { text: 'Photo Post', matchCase: true }, replaceText: 'Video Post' } },
      { replaceAllText: { containsText: { text: '__TEMP_VIDEO_CAT__', matchCase: true }, replaceText: 'Photo Post' } }
    ] : [
      // Sửa lại nếu doc hiện có bị replaceAllText trước đó làm lệch câu Điều 1.3
      { replaceAllText: {
        containsText: { text: 'Đăng 01 bộ (7-8 ảnh) Post Tiktok(Reup Facebook, Instagram) (01 bộ (7-8 ảnh)) “Bộ ảnh Pre-Wedding 1 cô dâu và chú rể cận đồng hồ Saga” vào ngày 20/03/2027\nĐăng 01 bộ (7-8 ảnh) Post Tiktok(Reup Facebook, Instagram) (01 bộ (7-8 ảnh)) “Bộ ảnh Pre-Wedding 2 cô dâu và chú rể cận đồng hồ Saga” vào ngày 22/03/2027\nĐăng 01 bộ (7-8 ảnh) Post Tiktok(Reup Reels, Story Facebook, Instagram) (01 bộ (7-8 ảnh) (60-90s)) “Kể chuyện hành trình yêu nhau, đánh dấu cột mốc về chung nhà bằng đồng hồ Saga” vào ngày 25/03/2027\nĐăng 01 bộ (7-8 ảnh) Post Tiktok(Reup Facebook, Instagram) (01 bộ (7-8 ảnh)) “Bộ ảnh đám hỏi cô dâu và chú rể cận đồng hồ Saga” vào ngày 15/05/2027\nĐăng 01 bộ (7-8 ảnh) Post Tiktok(Reup Reels, Story Facebook, Instagram) (01 bộ (7-8 ảnh) (60-90s)) “Chia sẻ câu chuyện đeo đồng hồ ngày cưới, review thiết kế và trải nghiệm đeo Saga” vào ngày 17/05/2027\nĐăng 01 bộ (7-8 ảnh) Post Tiktok(Reup Reels, Story Facebook, Instagram) (01 bộ (7-8 ảnh) (60-90s)) “Chia sẻ về dự án Cô dâu Saga của brand Saga Vietnam - Tặng đồng hồ cưới miễn phí” vào ngày 23/05/2027', matchCase: false },
        replaceText: sowSentences
      } }
    ]),

    // 6. Điều 1.1 & 1.2
    { replaceAllText: { 
      containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle)\u000b1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false },
      replaceText: photoRuleText
    } },

    // 7. Ràng buộc & Thời hạn SDHA
    { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: 'Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: 'Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: 'Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: `Thời hạn sử dụng hình ảnh: ${deal.sdha || 'Trọn đời'}` } },
    { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: `1.7. Thời hạn sử dụng hình ảnh: ${deal.sdha || 'Trọn đời'}` } },
    { replaceAllText: { 
      containsText: { text: 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook\n', matchCase: false }, 
      replaceText: voucherRuleText
    } },

    // 8. BẢNG GIÁ TRỊ HỢP ĐỒNG (Table 2) - Thay thế in-place 100% giữ nguyên format
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 53578-LGSVLG-2  \n- Bộ sưu tập: Saga Stella Chance  \n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetailText } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2   - Bộ sưu tập: Saga Stella Chance - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetailText } },
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: prodNameDisplay } },
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: p0.code || '' } },
    { replaceAllText: { containsText: { text: 'Saga Stella Chance', matchCase: false }, replaceText: p0.collection || '' } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: totalValFormatted } },
    { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: totalValInWords } },
    { replaceAllText: { containsText: { text: 'với tổng giá trị là  VNĐ (..........)', matchCase: false }, replaceText: `với tổng giá trị là ${totalValFormatted} VNĐ (${totalValInWords})` } },

    // 9. Showroom & Ngày nhận hàng (Điều 2.2)
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: deal.showroom.address || '' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: deal.showroom.pickupDate || '' } }
  ];

  console.log(`3. Cập nhật nội dung toàn văn bản và bảng in-place...`);
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });

  if (deal.sow.length > 2) {
    console.log(`3b. Đồng bộ Bảng SOW (${deal.sow.length} hạng mục)...`);
    await syncGiftSowTable(docs, docId, deal);
  }

  if ((options.docId && hasProdCode) || (deal.products && deal.products.length > 1)) {
    console.log(`3c. Đồng bộ Bảng Sản phẩm (Table 2 - mỗi sản phẩm 1 hàng)...`);
    await syncSingleGiftProductTable(docs, docId, deal.products, totalValFormatted);
  }

  // 4. Tự động Verify chất lượng tài liệu
  console.log(`4. Tự động kiểm tra chất lượng tài liệu hợp đồng...`);
  const verifyResult = await verifyContract(docId);

  // 5. Lưu kết quả
  const contractResult = {
    contracts: [
      {
        type: 'Gift',
        id: docId,
        title: docTitle,
        url: `https://docs.google.com/document/d/${docId}/edit`,
        productCode: deal.products[0]?.code || '',
        productName: `Đồng hồ SAGA ${deal.products[0]?.code || ''}`,
        productValue: totalVal,
        sowCount: deal.sow.length
      }
    ],
    koc: {
      kocName: kocName,
      fullName: kocFullName,
      cccd: deal.koc.cccd,
      phone: deal.koc.phone,
      email: deal.koc.email,
      address: deal.koc.address,
      showroom: deal.showroom.address,
      pickupDate: deal.showroom.pickupDate
    },
    verified: verifyResult.allPass
  };

  fs.writeFileSync('d:/Booking/last_contract_result.json', JSON.stringify(contractResult, null, 2), 'utf8');

  console.log(`\n🎉 HOÀN THÀNH TẠO HỢP ĐỒNG:`);
  console.log(`👉 Link: https://docs.google.com/document/d/${docId}/edit`);
  console.log(`Trạng thái Verify: ${verifyResult.allPass ? 'TẤT CẢ PASS' : 'CÓ CẢNH BÁO'}`);

  return contractResult;
}

module.exports = { handleContractCommand };
