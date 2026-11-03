const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;

  const auth = new google.auth.OAuth2(
    oauthKeys.client_id,
    oauthKeys.client_secret,
    oauthKeys.redirect_uris[0]
  );
  auth.setCredentials(credentials);
  const docs = google.docs({ version: 'v1', auth });

  const doc = await docs.documents.get({
    documentId: '17cZZRLPIE9_sPreYj_LI3xtQTo5dw1qFBJTH3rHU1eQ'
  });

  console.log('Title:', doc.data.title);
  
  // Extract all text elements
  let fullText = '';
  doc.data.body.content.forEach(element => {
    if (element.paragraph) {
      element.paragraph.elements.forEach(el => {
        if (el.textRun) {
          fullText += el.textRun.content;
        }
      });
    } else if (element.table) {
      fullText += '\n[TABLE]\n';
      element.table.tableRows.forEach(row => {
        let rowStr = '| ';
        row.tableCells.forEach(cell => {
          let cellText = '';
          cell.content.forEach(c => {
            if (c.paragraph) {
              c.paragraph.elements.forEach(el => {
                if (el.textRun) cellText += el.textRun.content.trim() + ' ';
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

  fs.writeFileSync('d:/Booking/sample_contract_extracted.txt', fullText, 'utf8');
  console.log('Saved extracted sample to d:/Booking/sample_contract_extracted.txt');
  console.log('Snippet:\n', fullText.substring(0, 1500));
}

main().catch(console.error);
