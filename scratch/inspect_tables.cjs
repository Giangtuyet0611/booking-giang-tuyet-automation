const { getClients } = require('../src/lib/google.cjs');

async function inspectTables() {
  const { docs } = getClients();

  const docDanQuynhId = '1GFeuVyG1giikSQ6nIrp99zqg8tSpROGyuMlO0prNThg';
  const docDmyId = '1r21XNbqRrQA8--JdtGYytaqgPhVl5GB5ny15qE22JWk';
  const docTemplateId = '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8';

  const [resDQ, resDmy, resTpl] = await Promise.all([
    docs.documents.get({ documentId: docDanQuynhId }),
    docs.documents.get({ documentId: docDmyId }),
    docs.documents.get({ documentId: docTemplateId })
  ]);

  function dumpTables(doc, name) {
    console.log(`\n================== ${name} ==================`);
    const tables = [];
    doc.body.content.forEach((el, idx) => {
      if (el.table) {
        tables.push({ idx, rows: el.table.rows, el });
      }
    });
    console.log(`Found ${tables.length} tables`);
    tables.forEach((t, tIdx) => {
      console.log(`\n--- Table ${tIdx + 1} (${t.rows} rows) ---`);
      t.el.table.tableRows.forEach((tr, rIdx) => {
        const rowText = tr.tableCells.map(tc => {
          let cText = '';
          tc.content.forEach(c => {
            if (c.paragraph) {
              cText += c.paragraph.elements.map(e => e.textRun?.content || '').join('');
            }
          });
          return cText.trim().replace(/\n/g, ' ');
        }).join(' | ');
        console.log(`Row ${rIdx + 1}: ${rowText}`);
      });
    });
  }

  dumpTables(resTpl.data, 'TEMPLATE GỐC');
  dumpTables(resDmy.data, 'DMY NÈ (BẢN CHUẨN TRƯỚC ĐÓ)');
  dumpTables(resDQ.data, 'ĐAN QUỲNH (HIỆN TẠI)');
}

inspectTables().catch(e => console.error(e));
