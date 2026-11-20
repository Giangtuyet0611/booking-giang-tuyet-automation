const { getClients } = require('../src/lib/google.cjs');

async function inspectDocNow() {
  const { docs } = getClients();
  const docId = '1DD58AtzTQPxFA_LOuEkqeEIuYowzNgpaHNmQ_yz_H-Y';
  const res = await docs.documents.get({ documentId: docId });

  res.data.body.content.forEach((el, idx) => {
    if (el.table) {
      console.log(`\nTable at ${idx} (rows: ${el.table.rows}):`);
      el.table.tableRows.forEach((tr, rIdx) => {
        const text = tr.tableCells.map(tc => {
          let t = '';
          tc.content.forEach(c => {
            if (c.paragraph) t += c.paragraph.elements.map(e => e.textRun?.content || '').join('');
          });
          return t.trim().replace(/\n/g, ' ');
        }).join(' | ');
        console.log(`  Row ${rIdx}: ${text}`);
      });
    }
  });
}

inspectDocNow().catch(e => console.error(e));

