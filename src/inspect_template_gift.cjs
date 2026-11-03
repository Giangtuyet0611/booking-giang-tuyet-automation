const fs = require('fs');
const { google } = require('googleapis');
const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);
const docs = google.docs({ version: 'v1', auth });

async function inspectTemplate() {
  const doc = await docs.documents.get({ documentId: '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8' });
  let text = '';
  doc.data.body.content.forEach((el, idx) => {
    if (el.paragraph) {
      const pText = el.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
      text += `[P ${idx}] ${pText}\n`;
    } else if (el.table) {
      text += `[TABLE ${idx}] rows: ${el.table.tableRows.length}\n`;
      el.table.tableRows.forEach((row, rIdx) => {
        const rowText = row.tableCells.map(cell => cell.content.map(c => c.paragraph ? c.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('').trim() : '').join(' ')).join(' | ');
        text += `  Row ${rIdx}: ${rowText}\n`;
      });
    }
  });
  fs.writeFileSync('d:/Booking/template_gift_dump.txt', text, 'utf8');
  console.log('Done template_gift_dump.txt, total elements:', doc.data.body.content.length);
}
inspectTemplate().catch(console.error);
