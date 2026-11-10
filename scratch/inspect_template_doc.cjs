const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const docs = google.docs({ version: 'v1', auth: a });

async function inspectDoc() {
  const docId = '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8';
  const res = await docs.documents.get({ documentId: docId });
  const doc = res.data;
  console.log('Title:', doc.title);
  
  // Extract text elements
  const text = [];
  function extractText(content) {
    for (const elem of content) {
      if (elem.paragraph) {
        elem.paragraph.elements.forEach(e => {
          if (e.textRun && e.textRun.content) text.push(e.textRun.content);
        });
      } else if (elem.table) {
        elem.table.tableRows.forEach(row => {
          row.tableCells.forEach(cell => {
            extractText(cell.content);
          });
        });
      }
    }
  }
  extractText(doc.body.content);
  fs.writeFileSync('d:/Booking/scratch/template_gift_text.txt', text.join(''), 'utf8');
  console.log('Saved template text length:', text.join('').length);
}

inspectDoc().catch(console.error);
