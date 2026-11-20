const { getClients } = require('../src/lib/google.cjs');

async function inspectTemplateDetailed() {
  const { docs } = getClients();
  const templateId = '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8';
  const res = await docs.documents.get({ documentId: templateId });

  res.data.body.content.forEach((el, idx) => {
    if (el.table) {
      console.log(`\n================== TABLE AT INDEX ${idx} (Rows: ${el.table.rows}, Cols: ${el.table.columns}) ==================`);
      el.table.tableRows.forEach((tr, rIdx) => {
        console.log(`\n--- Row ${rIdx} ---`);
        tr.tableCells.forEach((tc, cIdx) => {
          let text = '';
          tc.content.forEach(c => {
            if (c.paragraph) {
              text += c.paragraph.elements.map(e => e.textRun?.content || '').join('');
            }
          });
          console.log(`  Col ${cIdx}: "${text.trim().replace(/\n/g, '\\n')}"`);
        });
      });
    }
  });
}

inspectTemplateDetailed().catch(e => console.error(e));

