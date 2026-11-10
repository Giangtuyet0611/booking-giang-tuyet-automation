const { google } = require('googleapis');
const fs = require('fs');

const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);

const docs = google.docs({ version: 'v1', auth: a });
const drive = google.drive({ version: 'v3', auth: a });

async function readDoc() {
  const documentId = '1w6hJFmpJdntmWMBRXdH40awhLOT8CSJGhecTEq3gJbg';

  try {
    const meta = await drive.files.get({
      fileId: documentId,
      fields: 'id, name, mimeType, owners, modifiedTime'
    });
    console.log('File Metadata:', meta.data);

    const doc = await docs.documents.get({ documentId });
    console.log('Doc Title:', doc.data.title);

    let fullText = '';
    (doc.data.body?.content || []).forEach(element => {
      if (element.paragraph) {
        element.paragraph.elements?.forEach(e => {
          if (e.textRun?.content) {
            fullText += e.textRun.content;
          }
        });
      } else if (element.table) {
        element.table.tableRows?.forEach(row => {
          row.tableCells?.forEach(cell => {
            cell.content?.forEach(ce => {
              ce.paragraph?.elements?.forEach(pe => {
                if (pe.textRun?.content) fullText += pe.textRun.content;
              });
            });
            fullText += ' | ';
          });
          fullText += '\n';
        });
      }
    });

    console.log('\n=== DOCUMENT CONTENT ===\n');
    console.log(fullText);
    fs.writeFileSync('d:/Booking/scratch/doc_content.txt', fullText, 'utf8');
  } catch (err) {
    console.error('Error reading doc:', err.message);
  }
}

readDoc().catch(console.error);
