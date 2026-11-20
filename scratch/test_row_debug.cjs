const { getClients } = require('../src/lib/google.cjs');

async function testDebug() {
  const { drive, docs } = getClients();

  // Copy fresh template
  console.log('Copying fresh template...');
  const copyRes = await drive.files.copy({
    fileId: '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8',
    supportsAllDrives: true,
    requestBody: { name: 'DEBUG TEST TABLE' }
  });
  const docId = copyRes.data.id;
  console.log('Doc ID:', docId);

  async function printTableRows(step) {
    const doc = (await docs.documents.get({ documentId: docId })).data;
    const t = doc.body.content.find(el => el.table);
    console.log(`[${step}] Table rowCount: ${t.table.tableRows.length}`);
  }

  await printTableRows('Initial');

  // Delete row 6 (Item 3)
  console.log('Deleting row 6...');
  const sowTable = (await docs.documents.get({ documentId: docId })).data.body.content.find(el => el.table);
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [{
        deleteTableRow: {
          tableCellLocation: {
            tableStartLocation: { index: sowTable.startIndex },
            rowIndex: 6
          }
        }
      }]
    }
  });

  await printTableRows('After deleting Item 3 (row 6)');

  // Clean up
  await drive.files.delete({ fileId: docId });
}

testDebug().catch(console.error);
