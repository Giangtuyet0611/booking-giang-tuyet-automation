const { google } = require('googleapis');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
auth.setCredentials(credentials);
const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

async function testRebuildTable() {
  const originalDocId = '1r21XNbqRrQA8--JdtGYytaqgPhVl5GB5ny15qE22JWk';

  // 1. Get fresh doc
  let doc = (await docs.documents.get({ documentId: originalDocId })).data;
  let tableEl = null;
  for (const el of doc.body.content) {
    if (el.table && el.table.tableRows.length >= 7) {
      tableEl = el;
      break;
    }
  }

  console.log('Found table at index:', tableEl.startIndex, 'with rows:', tableEl.table.tableRows.length);

  // 2. Delete rows down to row 1 (keep Row 0 Header and Row 1)
  while (true) {
    doc = (await docs.documents.get({ documentId: originalDocId })).data;
    let curTable = null;
    for (const el of doc.body.content) {
      if (el.table && el.table.tableRows.length > 1) {
        curTable = el;
        break;
      }
    }
    if (!curTable || curTable.table.tableRows.length <= 1) break;

    // Delete last row
    const lastIdx = curTable.table.tableRows.length - 1;
    await docs.documents.batchUpdate({
      documentId: originalDocId,
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
    console.log('Deleted row', lastIdx);
  }

  console.log('Table now has 1 row (Header only)');

  // 3. Now insert 5 rows below Row 0
  for (let i = 0; i < 5; i++) {
    doc = (await docs.documents.get({ documentId: originalDocId })).data;
    let curTable = null;
    for (const el of doc.body.content) {
      if (el.table) {
        curTable = el;
        break;
      }
    }
    const lastRowIdx = curTable.table.tableRows.length - 1;
    await docs.documents.batchUpdate({
      documentId: originalDocId,
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
    console.log('Inserted row', i + 1);
  }

  // 4. Inspect the 5 newly inserted rows
  doc = (await docs.documents.get({ documentId: originalDocId })).data;
  let curTable = null;
  for (const el of doc.body.content) {
    if (el.table) {
      curTable = el;
      break;
    }
  }
  console.log('Final table rows count:', curTable.table.tableRows.length);

  // 5. Fill each row with exact data!
  const rowData = [
    {
      stt: '1',
      category: 'Photo Post',
      channel: 'Dmy nè (Tiktok)\nDmy nè (Reup Facebook)',
      qty: '01 bộ (7-8 ảnh)',
      links: '1',
      airDate: '25/11/2026'
    },
    {
      stt: '2',
      category: 'Photo Post',
      channel: 'Dmy nè (Tiktok)\nDmy nè (Reup Facebook)',
      qty: '01 bộ (7-8 ảnh)',
      links: '1',
      airDate: '28/11/2026'
    },
    {
      stt: '3',
      category: 'Video Post',
      channel: 'Dmy nè (Tiktok)\nDmy nè (Reup Reels, Story Facebook)',
      qty: '01 video (60-90s)',
      links: '1',
      airDate: '29/11/2026'
    },
    {
      stt: '4',
      category: 'Video Post',
      channel: 'Dmy nè (Tiktok)\nDmy nè (Reup Reels, Story Facebook)',
      qty: '01 video (60-90s)',
      links: '1',
      airDate: '10/01/2027'
    },
    {
      stt: '5',
      category: 'Video Post',
      channel: 'Dmy nè (Tiktok)\nDmy nè (Reup Reels, Story Facebook)',
      qty: '01 video (60-90s)',
      links: '1',
      airDate: '12/01/2027'
    }
  ];

  // Fill from bottom to top (row 5 down to row 1, cell 6 down to cell 0)
  // to avoid shifting indexes!
  for (let r = 5; r >= 1; r--) {
    const data = rowData[r - 1];
    // Re-fetch doc to get exact startIndexes of cells for row r
    doc = (await docs.documents.get({ documentId: originalDocId })).data;
    for (const el of doc.body.content) {
      if (el.table) {
        curTable = el;
        break;
      }
    }
    const tableRow = curTable.table.tableRows[r];
    const cellIndices = tableRow.tableCells.map(c => c.startIndex);

    // Columns:
    // 0: STT
    // 1: Hạng mục
    // 2: (empty / merged)
    // 3: Kênh
    // 4: Số lượng
    // 5: Số link
    // 6: Thời gian
    const fillRequests = [
      { insertText: { location: { index: cellIndices[6] + 1 }, text: data.airDate } },
      { insertText: { location: { index: cellIndices[5] + 1 }, text: data.links } },
      { insertText: { location: { index: cellIndices[4] + 1 }, text: data.qty } },
      { insertText: { location: { index: cellIndices[3] + 1 }, text: data.channel } },
      { insertText: { location: { index: cellIndices[1] + 1 }, text: data.category } },
      { insertText: { location: { index: cellIndices[0] + 1 }, text: data.stt } }
    ];

    await docs.documents.batchUpdate({
      documentId: originalDocId,
      requestBody: { requests: fillRequests }
    });
    console.log('Filled data for row', r);
  }

  console.log('Successfully rebuilt SOW Table with all 5 rows!');
}

testRebuildTable().catch(console.error);

