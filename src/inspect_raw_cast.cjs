const fs = require('fs');
const { google } = require('googleapis');
const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);
const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

async function dumpRawCast() {
  const templateStream = await drive.files.get({
    fileId: '19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V',
    alt: 'media',
    supportsAllDrives: true
  }, { responseType: 'stream' });

  const createRes = await drive.files.create({
    requestBody: { name: 'RAW_CAST_TEST', mimeType: 'application/vnd.google-apps.document' },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: templateStream.data
    },
    supportsAllDrives: true,
    fields: 'id'
  });
  const docId = createRes.data.id;
  const doc = await docs.documents.get({ documentId: docId });
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
  fs.writeFileSync('d:/Booking/raw_cast_dump.txt', text, 'utf8');
  await drive.files.delete({ fileId: docId, supportsAllDrives: true });
  console.log('Done raw_cast_dump.txt');
}
dumpRawCast().catch(console.error);
