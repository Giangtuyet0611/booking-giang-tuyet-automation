const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  console.log('1. Searching for folder "[6] Kế toán tháng"...');
  const folderRes = await drive.files.list({
    q: "name contains 'Kế toán tháng' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id, name, mimeType, parents)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  console.log('Folder result:', folderRes.data.files);

  console.log('\n2. Inspecting DNTT template doc (143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg)...');
  try {
    const doc = await docs.documents.get({
      documentId: '143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg'
    });
    console.log('Doc Title:', doc.data.title);

    let fullText = '';
    doc.data.body.content.forEach(el => {
      if (el.paragraph) {
        el.paragraph.elements.forEach(p => {
          if (p.textRun) fullText += p.textRun.content;
        });
      } else if (el.table) {
        fullText += '\n[TABLE]\n';
        el.table.tableRows.forEach(row => {
          let rowStr = '| ';
          row.tableCells.forEach(cell => {
            let cellText = '';
            cell.content.forEach(c => {
              if (c.paragraph) {
                c.paragraph.elements.forEach(p => {
                  if (p.textRun) cellText += p.textRun.content.trim() + ' ';
                });
              }
            });
            rowStr += cellText.trim() + ' | ';
          });
          fullText += rowStr + '\n';
        });
        fullText += '[END TABLE]\n';
      }
    });
    console.log('Template Content:\n', fullText.substring(0, 1500));
    fs.writeFileSync('d:/Booking/sample_dntt_extracted.txt', fullText, 'utf8');
  } catch (e) {
    console.log('Error reading doc:', e.message);
  }
}

run().catch(console.error);
