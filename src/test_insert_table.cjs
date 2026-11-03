const fs = require('fs');
const { google } = require('googleapis');
const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);
const docs = google.docs({ version: 'v1', auth });

async function testInsertAndFill() {
  const docId = '1ABw_ISkKP4g9rbaSJkQ0Y4bOBNm07Hr5Cl2_TBUamwQ'; // let's use a new copy or test
  // Let's create a test doc
  const testDoc = await docs.documents.create({ requestBody: { title: 'TEST_INSERT_TABLE' } });
  const tId = testDoc.data.documentId;

  // Insert 2 rows x 6 cols
  await docs.documents.batchUpdate({
    documentId: tId,
    requestBody: {
      requests: [
        {
          insertTable: {
            rows: 2,
            columns: 6,
            location: { index: 1 }
          }
        }
      ]
    }
  });

  const doc = await docs.documents.get({ documentId: tId });
  const table = doc.data.body.content[1].table;
  console.log('Inserted table rows:', table.tableRows.length, 'cols:', table.tableRows[0].tableCells.length);

  // We can insert text into cells in reverse order of startIndex!
  const cells = [
    { r: 0, c: 0, text: 'STT' },
    { r: 0, c: 1, text: 'Hạng mục' },
    { r: 0, c: 2, text: 'Kênh' },
    { r: 0, c: 3, text: 'Số lượng' },
    { r: 0, c: 4, text: 'Số link' },
    { r: 0, c: 5, text: 'Thời gian đăng tải' },
    { r: 1, c: 0, text: '1' },
    { r: 1, c: 1, text: 'Photo Post' },
    { r: 1, c: 2, text: 'Minh Anh Daily (Tiktok, Reup FB, IG)' },
    { r: 1, c: 3, text: '6-8 ảnh' },
    { r: 1, c: 4, text: '1' },
    { r: 1, c: 5, text: '29/10/2026' }
  ];

  const textInserts = [];
  // Collect cell start indices
  cells.forEach(item => {
    const cell = table.tableRows[item.r].tableCells[item.c];
    const cellIndex = cell.content[0].startIndex;
    textInserts.push({ index: cellIndex, text: item.text });
  });

  // Sort descending so later insertions don't shift earlier indices
  textInserts.sort((a, b) => b.index - a.index);

  const fillRequests = textInserts.map(ti => ({
    insertText: {
      location: { index: ti.index },
      text: ti.text
    }
  }));

  await docs.documents.batchUpdate({
    documentId: tId,
    requestBody: { requests: fillRequests }
  });

  console.log('Successfully filled table cells!');
  const finalDoc = await docs.documents.get({ documentId: tId });
  const finalTable = finalDoc.data.body.content[1].table;
  finalTable.tableRows.forEach((r, ri) => {
    const rText = r.tableCells.map(c => c.content.map(p => p.paragraph ? p.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('').trim() : '').join(' ')).join(' | ');
    console.log(`Row ${ri}: ${rText}`);
  });
}

testInsertAndFill().catch(console.error);
