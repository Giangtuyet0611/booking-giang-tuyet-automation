const { getClients } = require('../src/lib/google.cjs');

async function testStepByStep() {
  const { drive, docs, config } = getClients();

  const templateGiftDocId = config.CONTRACT_TEMPLATE_DOC_ID || '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8';

  const copyRes = await drive.files.copy({
    fileId: templateGiftDocId,
    supportsAllDrives: true,
    requestBody: {
      name: 'TEMP_TEST_DOC',
      parents: ['1Ui5M-w6wg-yoHMp11hEZjb-I90q_xBWw']
    }
  });
  const docId = copyRes.data.id;

  let doc = (await docs.documents.get({ documentId: docId })).data;
  let t = doc.body.content.find(el => el.table);
  console.log(`Initial rows: ${t.table.tableRows.length}`);
  t.table.tableRows.forEach((r, idx) => {
    let text = '';
    r.tableCells[0].content.forEach(c => {
      if (c.paragraph) text += c.paragraph.elements.map(e => e.textRun?.content || '').join('');
    });
    console.log(`Row ${idx} Col 0: JSON: ${JSON.stringify(text)} (trim: ${JSON.stringify(text.trim())})`);
  });

  // Clean up
  await drive.files.delete({ fileId: docId, supportsAllDrives: true });
}

testStepByStep().catch(e => console.error(e));

