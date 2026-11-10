const { google } = require('googleapis');
const fs = require('fs');

const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);

const docs = google.docs({ version: 'v1', auth: a });

async function dumpContent() {
  const documentId = '1w6hJFmpJdntmWMBRXdH40awhLOT8CSJGhecTEq3gJbg';
  const doc = await docs.documents.get({ documentId });

  let text = '';
  function parseElements(elements) {
    elements.forEach(el => {
      if (el.paragraph) {
        el.paragraph.elements?.forEach(pe => {
          if (pe.textRun?.content) text += pe.textRun.content;
        });
      } else if (el.table) {
        el.table.tableRows?.forEach(row => {
          row.tableCells?.forEach(cell => {
            if (cell.content) parseElements(cell.content);
            text += ' | ';
          });
          text += '\n';
        });
      } else if (el.tableOfContents) {
        if (el.tableOfContents.content) parseElements(el.tableOfContents.content);
      }
    });
  }

  parseElements(doc.data.body.content);
  fs.writeFileSync('d:/Booking/scratch/doc_content.txt', text, 'utf8');
  console.log('Doc length:', text.length);
  console.log('Preview (first 1000 chars):');
  console.log(text.slice(0, 1000));
}

dumpContent().catch(console.error);
