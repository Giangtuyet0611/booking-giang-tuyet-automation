const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const docs = google.docs({ version: 'v1', auth: a });

async function inspectTables() {
  const docId = '1rmTgsWuU64Ej_JTPYxpXqv2DcvSImZAG1bfQZ_dDDss';
  const res = await docs.documents.get({ documentId: docId });
  const content = res.data.body.content;

  let tableIdx = 0;
  for (const elem of content) {
    if (elem.table) {
      console.log(`\n=================== TABLE ${tableIdx} (start: ${elem.startIndex}, end: ${elem.endIndex}) ===================`);
      elem.table.tableRows.forEach((row, rIdx) => {
        const cells = row.tableCells.map(c => {
          let text = '';
          (c.content || []).forEach(p => {
            if (p.paragraph) {
              text += p.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('').trim();
            }
          });
          return text;
        });
        console.log(`Row ${rIdx}: ${cells.join(' | ')}`);
      });
      tableIdx++;
    }
  }
}

inspectTables().catch(console.error);
