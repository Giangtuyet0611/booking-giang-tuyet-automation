const fs = require('fs');
const { google } = require('googleapis');
const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);
const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

async function testTableTransform() {
  const copyRes = await drive.files.copy({
    fileId: '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8',
    supportsAllDrives: true,
    requestBody: { name: 'TEST_TABLE_TRANSFORM' }
  });
  const docId = copyRes.data.id;
  const doc = await docs.documents.get({ documentId: docId });

  let sowTable = null;
  for (const el of doc.data.body.content) {
    if (el.table && el.table.tableRows.length >= 7) {
      sowTable = el;
      break;
    }
  }

  console.log('sowTable start:', sowTable.startIndex, 'end:', sowTable.endIndex, 'rows:', sowTable.table.tableRows.length);

  // Thử xóa từng hàng từ dưới lên (từ rowIndex 7 xuống 2) xem có xóa được từng hàng riêng biệt không
  for (let r = sowTable.table.tableRows.length - 1; r >= 2; r--) {
    try {
      const curDoc = await docs.documents.get({ documentId: docId });
      let curTable = null;
      for (const el of curDoc.data.body.content) {
        if (el.table && el.table.tableRows.length > 2) {
          curTable = el;
          break;
        }
      }
      if (!curTable) break;
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [{
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: curTable.startIndex },
                rowIndex: r
              }
            }
          }]
        }
      });
      console.log(`Success deleted row ${r}`);
    } catch (err) {
      console.log(`Failed at row ${r}:`, err.message);
    }
  }

  const updatedDoc = await docs.documents.get({ documentId: docId });
  let finalTable = null;
  for (const el of updatedDoc.data.body.content) {
    if (el.table) {
      finalTable = el;
      break;
    }
  }
  console.log('Final table rows:', finalTable ? finalTable.table.tableRows.length : 'none');
}

testTableTransform().catch(console.error);
