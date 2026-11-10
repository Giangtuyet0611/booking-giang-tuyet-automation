const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const docs = google.docs({ version: 'v1', auth });

async function check() {
  const doc = await docs.documents.get({ documentId: '1rmTgsWuU64Ej_JTPYxpXqv2DcvSImZAG1bfQZ_dDDss' });
  const body = doc.data.body.content;

  body.forEach((el, idx) => {
    if (el.table) {
      console.log(`\n=== Table at element ${idx} ===`);
      el.table.tableRows.forEach((row, rIdx) => {
        const rowText = row.tableCells.map(c => {
          return c.content.map(cc => cc.paragraph ? cc.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('') : '').join('').trim();
        }).join(' | ');
        console.log(`Row ${rIdx}: ${rowText}`);
      });
    }
  });
}

check();
