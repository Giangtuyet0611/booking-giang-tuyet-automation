const { google } = require('googleapis');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
auth.setCredentials(credentials);
const docs = google.docs({ version: 'v1', auth });

async function restoreProductTable() {
  const docId = '1r21XNbqRrQA8--JdtGYytaqgPhVl5GB5ny15qE22JWk';

  // 1. Get doc and find product table (table at element 45 or the second table in body)
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

  console.log('Found product table at startIndex:', prodTable.startIndex, 'rows:', prodTable.table.tableRows.length);

  // 2. Insert 2 rows below Row 0
  for (let i = 0; i < 2; i++) {
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
    console.log('Inserted product table row', i + 1);
  }

  // 3. Re-fetch doc to inspect cells of Row 1 and Row 2
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

  console.log('Product table now has rows:', prodTable.table.tableRows.length);
  const row1Cells = prodTable.table.tableRows[1].tableCells.map(c => c.startIndex);
  const row2Cells = prodTable.table.tableRows[2].tableCells.map(c => c.startIndex);

  console.log('Row 1 cell count:', row1Cells.length);
  console.log('Row 2 cell count:', row2Cells.length);

  const detailText = `- Thương hiệu: Saga\n- Số hiệu sản phẩm: 71959-RGRGTTR-2\n- Bộ sưu tập: Saga Lunar\n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm`;

  // Row 2 data:
  // Cell 4 or Cell 5: 8.950.000
  // Cell 0: Tổng giá trị sản phẩm
  // Row 1 data:
  // Cell 0: 71959-RGRGTTR-2
  // Cell 1: Đồng hồ SAGA 71959-RGRGTTR-2
  // Cell 3: detailText
  // Cell 4: 1
  // Cell 5: 8.950.000

  // We fill from bottom to top (Row 2, then Row 1, from right to left)
  const requests = [
    // Row 2
    { insertText: { location: { index: row2Cells[4] + 1 }, text: '8.950.000' } },
    { insertText: { location: { index: row2Cells[0] + 1 }, text: 'Tổng giá trị sản phẩm' } },

    // Row 1
    { insertText: { location: { index: row1Cells[5] + 1 }, text: '8.950.000' } },
    { insertText: { location: { index: row1Cells[4] + 1 }, text: '1' } },
    { insertText: { location: { index: row1Cells[3] + 1 }, text: detailText } },
    { insertText: { location: { index: row1Cells[1] + 1 }, text: 'Đồng hồ SAGA 71959-RGRGTTR-2' } },
    { insertText: { location: { index: row1Cells[0] + 1 }, text: '71959-RGRGTTR-2' } }
  ];

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });

  console.log('Product table restored with exact format: Đồng hồ SAGA 71959-RGRGTTR-2');
}

restoreProductTable().catch(console.error);

