/**
 * Module chuyên trách tái cấu trúc và điền dữ liệu bảng trong Google Docs:
 * 1. Bảng SOW (Điều 1): Tự động co giãn theo số lượng hạng mục SOW thực tế.
 * 2. Bảng Sản phẩm (Điều 2.1): Chuẩn hóa format "Đồng hồ SAGA + mã", đầy đủ 6 thông số kỹ thuật.
 */

async function rebuildSowTable(docs, docId, sowItems, kocName) {
  // 1. Lấy trạng thái hiện tại của tài liệu
  let doc = (await docs.documents.get({ documentId: docId })).data;
  let sowTable = null;
  for (const el of doc.body.content) {
    if (el.table) {
      sowTable = el;
      break;
    }
  }

  if (!sowTable) throw new Error('Không tìm thấy Bảng SOW trong tài liệu!');

  // 2. Xóa các hàng dữ liệu cũ, chỉ giữ lại Row 0 (Header)
  while (true) {
    doc = (await docs.documents.get({ documentId: docId })).data;
    let curTable = null;
    for (const el of doc.body.content) {
      if (el.table) {
        curTable = el;
        break;
      }
    }
    if (!curTable || curTable.table.tableRows.length <= 1) break;

    const lastIdx = curTable.table.tableRows.length - 1;
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          deleteTableRow: {
            tableCellLocation: {
              tableStartLocation: { index: curTable.startIndex },
              rowIndex: lastIdx
            }
          }
        }]
      }
    });
  }

  // 3. Chèn số hàng mới tương ứng với số lượng hạng mục SOW
  for (let i = 0; i < sowItems.length; i++) {
    doc = (await docs.documents.get({ documentId: docId })).data;
    let curTable = null;
    for (const el of doc.body.content) {
      if (el.table) {
        curTable = el;
        break;
      }
    }
    const lastRowIdx = curTable.table.tableRows.length - 1;
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          insertTableRow: {
            tableCellLocation: {
              tableStartLocation: { index: curTable.startIndex },
              rowIndex: lastRowIdx
            },
            insertBelow: true
          }
        }]
      }
    });
  }

  // 4. Điền nội dung từng ô từ dưới lên trên (để bảo toàn chỉ số index)
  for (let r = sowItems.length; r >= 1; r--) {
    const item = sowItems[r - 1];
    doc = (await docs.documents.get({ documentId: docId })).data;
    let curTable = null;
    for (const el of doc.body.content) {
      if (el.table) {
        curTable = el;
        break;
      }
    }

    const tableRow = curTable.table.tableRows[r];
    const cellIndices = tableRow.tableCells.map(c => c.startIndex);

    let channelText = `${kocName} (${item.platform || 'Tiktok'})`;
    if (item.reup) {
      const reupType = item.category === 'Photo Post' ? '' : 'Reels, Story ';
      channelText += `\n${kocName} (Reup ${reupType}${item.reup})`.trim();
    }

    const qtyText = item.qty || (item.category === 'Photo Post' ? '01 bộ (7-8 ảnh)' : '01 video (60-90s)');

    // Cột theo template:
    // [0]: STT
    // [1]: Hạng mục
    // [2]: Merged cell trống
    // [3]: Kênh
    // [4]: Số lượng
    // [5]: Số link đính kèm
    // [6]: Thời gian đăng tải
    const fillRequests = [
      { insertText: { location: { index: cellIndices[6] + 1 }, text: item.airDate || '' } },
      { insertText: { location: { index: cellIndices[5] + 1 }, text: String(item.links || '1') } },
      { insertText: { location: { index: cellIndices[4] + 1 }, text: qtyText } },
      { insertText: { location: { index: cellIndices[3] + 1 }, text: channelText } },
      { insertText: { location: { index: cellIndices[1] + 1 }, text: item.category || 'Video Post' } },
      { insertText: { location: { index: cellIndices[0] + 1 }, text: String(r) } }
    ];

    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests: fillRequests }
    });
  }
}

async function rebuildProductTable(docs, docId, products) {
  let doc = (await docs.documents.get({ documentId: docId })).data;
  let prodTable = null;
  let tableCount = 0;
  for (const el of doc.body.content) {
    if (el.table) {
      tableCount++;
      if (tableCount === 2) {
        prodTable = el;
        break;
      }
    }
  }

  if (!prodTable) throw new Error('Không tìm thấy Bảng Sản phẩm (Table 2) trong tài liệu!');

  // 1. Xóa các hàng dữ liệu cũ, chỉ giữ lại Row 0 (Header)
  while (true) {
    doc = (await docs.documents.get({ documentId: docId })).data;
    tableCount = 0;
    prodTable = null;
    for (const el of doc.body.content) {
      if (el.table) {
        tableCount++;
        if (tableCount === 2) {
          prodTable = el;
          break;
        }
      }
    }
    if (!prodTable || prodTable.table.tableRows.length <= 1) break;

    const lastIdx = prodTable.table.tableRows.length - 1;
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          deleteTableRow: {
            tableCellLocation: {
              tableStartLocation: { index: prodTable.startIndex },
              rowIndex: lastIdx
            }
          }
        }]
      }
    });
  }

  // 2. Chèn N hàng sản phẩm + 1 hàng Tổng cộng
  const totalRowsToInsert = products.length + 1;
  for (let i = 0; i < totalRowsToInsert; i++) {
    doc = (await docs.documents.get({ documentId: docId })).data;
    tableCount = 0;
    for (const el of doc.body.content) {
      if (el.table) {
        tableCount++;
        if (tableCount === 2) {
          prodTable = el;
          break;
        }
      }
    }
    const lastRowIdx = prodTable.table.tableRows.length - 1;
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          insertTableRow: {
            tableCellLocation: {
              tableStartLocation: { index: prodTable.startIndex },
              rowIndex: lastRowIdx
            },
            insertBelow: true
          }
        }]
      }
    });
  }

  // 3. Điền hàng Tổng cộng trước (hàng cuối cùng)
  doc = (await docs.documents.get({ documentId: docId })).data;
  tableCount = 0;
  for (const el of doc.body.content) {
    if (el.table) {
      tableCount++;
      if (tableCount === 2) {
        prodTable = el;
        break;
      }
    }
  }

  const totalRowIdx = prodTable.table.tableRows.length - 1;
  const totalRowCells = prodTable.table.tableRows[totalRowIdx].tableCells.map(c => c.startIndex);
  const totalVal = products.reduce((sum, p) => sum + Number(String(p.value || '0').replace(/[^0-9]/g, '')), 0);
  const totalValFormatted = totalVal.toLocaleString('vi-VN');

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        { insertText: { location: { index: totalRowCells[4] + 1 }, text: totalValFormatted } },
        { insertText: { location: { index: totalRowCells[0] + 1 }, text: 'Tổng giá trị sản phẩm' } }
      ]
    }
  });

  // 4. Điền từng hàng sản phẩm từ dưới lên
  for (let pIdx = products.length - 1; pIdx >= 0; pIdx--) {
    const p = products[pIdx];
    const rIdx = pIdx + 1;

    doc = (await docs.documents.get({ documentId: docId })).data;
    tableCount = 0;
    for (const el of doc.body.content) {
      if (el.table) {
        tableCount++;
        if (tableCount === 2) {
          prodTable = el;
          break;
        }
      }
    }

    const rowCells = prodTable.table.tableRows[rIdx].tableCells.map(c => c.startIndex);
    const detailText = `- Thương hiệu: ${p.brand || 'Saga'}\n- Số hiệu sản phẩm: ${p.code}\n- Bộ sưu tập: ${p.collection || 'Saga Stella'}\n- Xuất xứ: ${p.origin || 'Mỹ'}\n- Máy: ${p.movement || 'Quartz (Pin)'}\n- Bảo Hành Quốc Tế: ${p.warranty || '2 Năm'}`;
    const pValueFormatted = Number(String(p.value || '0').replace(/[^0-9]/g, '')).toLocaleString('vi-VN');

    // Cột theo template:
    // [0]: Mã sản phẩm
    // [1]: Tên sản phẩm ("Đồng hồ SAGA + mã")
    // [2]: Ô trống
    // [3]: Thông tin chi tiết (6 thông số)
    // [4]: Số lượng
    // [5]: Giá trị sản phẩm
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          { insertText: { location: { index: rowCells[5] + 1 }, text: pValueFormatted } },
          { insertText: { location: { index: rowCells[4] + 1 }, text: String(p.qty || '1') } },
          { insertText: { location: { index: rowCells[3] + 1 }, text: detailText } },
          { insertText: { location: { index: rowCells[1] + 1 }, text: `Đồng hồ SAGA ${p.code}` } },
          { insertText: { location: { index: rowCells[0] + 1 }, text: p.code } }
        ]
      }
    });
  }
}

module.exports = {
  rebuildSowTable,
  rebuildProductTable
};

