/**
 * Module cập nhật Bảng SOW và Bảng Sản phẩm IN-PLACE (Giữ nguyên 100% format gốc của Template)
 * Tuyệt đối không xóa bảng và tạo lại bằng insertTableRow để tránh mất border, padding, font styling.
 */

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

/**
 * Cập nhật ô trong Google Docs bằng cách xóa text cũ và chèn text mới
 * Bảo toàn hoàn toàn định dạng paragraph và cell style gốc.
 */
async function setCellText(docs, docId, cell, newText) {
  let start = null;
  let end = null;
  for (const c of cell.content) {
    if (c.paragraph) {
      if (start === null) start = c.paragraph.elements[0].startIndex;
      end = c.paragraph.elements[c.paragraph.elements.length - 1].endIndex;
    }
  }

  if (start === null || end === null) return;

  // 1. Xóa text cũ nếu có
  if (end - 1 > start) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          deleteContentRange: {
            range: {
              startIndex: start,
              endIndex: end - 1
            }
          }
        }]
      }
    });
  }

  // 2. Chèn text mới nếu có
  if (newText) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          insertText: {
            location: { index: start },
            text: newText
          }
        }]
      }
    });
  }
}

/**
 * Cập nhật Bảng SOW (Table 1) in-place giữ nguyên 100% format.
 */
async function updateSowTableInPlace(docs, docId, sowItems, kocName) {
  // Template Table 1 có 8 hàng:
  // Row 0: Header
  // Row 1: STT 1 (Item 1)
  // Row 2: Reup
  // Row 3: STT 2 (Item 2)
  // Row 4: Reup
  // Row 5: Reup
  // Row 6: STT 3 (Item 3)
  // Row 7: Reup

  // Col indices:
  // Col 0: STT (giữ nguyên không sửa)
  // Col 1: Hạng mục
  // Col 2: Merged
  // Col 3: Kênh
  // Col 4: Số lượng
  // Col 5: Số link đính kèm
  // Col 6: Thời gian đăng tải

  const targetRows = [1, 3, 6];
  for (let i = 0; i < sowItems.length && i < targetRows.length; i++) {
    const targetRowIdx = targetRows[i];
    const item = sowItems[i];

    let channelText = `${kocName}\n(${item.platform || 'Tiktok'})`;
    if (item.reup) {
      const reupType = item.category === 'Photo Post' ? '' : 'Reels, Story ';
      channelText += `\n(Reup ${reupType}${item.reup})`.trim();
    }
    const catText = item.category || (item.category?.includes('Photo') ? 'Photo Post' : 'Video Post');
    const qtyText = item.qty || (item.category?.includes('Photo') ? '01 bộ (6-8 ảnh)' : '01 video (60-90s)');
    const airDateText = item.airDate || '';

    // Cập nhật từng ô (lấy lại doc sau mỗi ô để index luôn chuẩn xác)
    let doc = (await docs.documents.get({ documentId: docId })).data;
    let sowTable = doc.body.content.find(el => el.table);
    await setCellText(docs, docId, sowTable.table.tableRows[targetRowIdx].tableCells[1], catText);

    doc = (await docs.documents.get({ documentId: docId })).data;
    sowTable = doc.body.content.find(el => el.table);
    await setCellText(docs, docId, sowTable.table.tableRows[targetRowIdx].tableCells[3], channelText);

    doc = (await docs.documents.get({ documentId: docId })).data;
    sowTable = doc.body.content.find(el => el.table);
    await setCellText(docs, docId, sowTable.table.tableRows[targetRowIdx].tableCells[4], qtyText);

    doc = (await docs.documents.get({ documentId: docId })).data;
    sowTable = doc.body.content.find(el => el.table);
    await setCellText(docs, docId, sowTable.table.tableRows[targetRowIdx].tableCells[5], '1');

    doc = (await docs.documents.get({ documentId: docId })).data;
    sowTable = doc.body.content.find(el => el.table);
    await setCellText(docs, docId, sowTable.table.tableRows[targetRowIdx].tableCells[6], airDateText);
  }

  // Xác định danh sách hàng cần xóa theo số lượng sowItems
  let deleteSequence = [];
  if (sowItems.length === 1) {
    // Giữ Row 0 (Header), Row 1 (Item 1)
    deleteSequence = [7, 6, 5, 4, 3, 2];
  } else if (sowItems.length === 2) {
    // Giữ Row 0 (Header), Row 1 (Item 1), Row 3 (Item 2)
    deleteSequence = [7, 6, 5, 4, 2];
  } else if (sowItems.length === 3) {
    // Giữ Row 0 (Header), Row 1 (Item 1), Row 3 (Item 2), Row 6 (Item 3)
    deleteSequence = [7, 5, 4, 2];
  }

  // Xóa từng hàng từ index lớn xuống bé
  for (const r of deleteSequence) {
    const doc = (await docs.documents.get({ documentId: docId })).data;
    const sowTable = doc.body.content.find(el => el.table);
    if (!sowTable || r >= sowTable.table.tableRows.length) continue;

    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          deleteTableRow: {
            tableCellLocation: {
              tableStartLocation: { index: sowTable.startIndex },
              rowIndex: r
            }
          }
        }]
      }
    });
  }
}

/**
 * Cập nhật Bảng Sản phẩm (Table 2) in-place giữ nguyên 100% format.
 */
async function updateProductTableInPlace(docs, docId, products) {
  if (!products || products.length === 0) return;

  const totalVal = products.reduce((sum, p) => sum + Number(String(p.value || '0').replace(/[^0-9]/g, '')), 0);
  const totalFormatted = totalVal.toLocaleString('vi-VN');
  const totalWords = numberToVietnameseWords(totalVal) + ' Việt Nam Đồng';

  const p0 = products[0];
  const prodCode = p0.code;
  const prodCollection = p0.collection || 'Saga Stella Chance';
  const prodPrice = Number(String(p0.value || '0').replace(/[^0-9]/g, '')).toLocaleString('vi-VN');

  // Trong Template gốc:
  // Mã: 53578-LGSVLG-2
  // BST: Saga Stella Chance
  // Giá: 6.950.000
  // Bằng chữ: Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng
  const replaceRequests = [
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: prodCode } },
    { replaceAllText: { containsText: { text: 'Saga Stella Chance', matchCase: false }, replaceText: prodCollection } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: prodPrice } },
    { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: totalWords } }
  ];

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests: replaceRequests }
  });
}

module.exports = {
  updateSowTableInPlace,
  updateProductTableInPlace,
  numberToVietnameseWords
};
