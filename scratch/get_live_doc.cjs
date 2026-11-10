const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const docs = google.docs({ version: 'v1', auth: a });

async function getLiveDoc() {
  const docId = '1rmTgsWuU64Ej_JTPYxpXqv2DcvSImZAG1bfQZ_dDDss';
  const doc = await docs.documents.get({ documentId: docId });

  function getElementText(elem) {
    if (elem.paragraph) {
      return elem.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
    } else if (elem.table) {
      let t = '\n--- TABLE ---\n';
      elem.table.tableRows.forEach((row, rIdx) => {
        t += `Row ${rIdx}: ` + row.tableCells.map(c => c.content.map(getElementText).join(' ').trim()).join(' | ') + '\n';
      });
      t += '--- END TABLE ---\n';
      return t;
    }
    return '';
  }

  const fullText = doc.data.body.content.map(getElementText).join('');
  fs.writeFileSync('d:/Booking/scratch/live_doc_hana.txt', fullText, 'utf8');
  console.log('Saved live doc text, length:', fullText.length);
}

getLiveDoc().catch(console.error);
