const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const docs = google.docs({ version: 'v1', auth: a });

async function inspectDocDetail() {
  const docId = '1rmTgsWuU64Ej_JTPYxpXqv2DcvSImZAG1bfQZ_dDDss';
  const doc = await docs.documents.get({ documentId: docId });
  
  function getElementText(elem) {
    if (elem.paragraph) {
      return elem.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
    } else if (elem.table) {
      let t = '--- TABLE START ---\n';
      elem.table.tableRows.forEach((row, rIdx) => {
        t += `Row ${rIdx}: ` + row.tableCells.map(c => c.content.map(getElementText).join(' ').trim()).join(' | ') + '\n';
      });
      t += '--- TABLE END ---\n';
      return t;
    }
    return '';
  }

  const parts = doc.data.body.content.map(getElementText);
  fs.writeFileSync('d:/Booking/scratch/doc_full_inspect.txt', parts.join(''), 'utf8');
  console.log('Saved inspection text, length:', parts.join('').length);
}

inspectDocDetail().catch(console.error);
