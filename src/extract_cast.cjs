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

  const doc = await docs.documents.get({ documentId: '19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V' });
  
  function getParagraphText(element) {
    let t = '';
    if (element.textRun) {
      t += element.textRun.content;
    }
    return t;
  }

  function parseBody(body) {
    let out = '';
    for (const c of body.content) {
      if (c.paragraph) {
        for (const el of c.paragraph.elements) {
          out += getParagraphText(el);
        }
      } else if (c.table) {
        for (const row of c.table.tableRows) {
          for (const cell of row.tableCells) {
            for (const item of cell.content) {
              if (item.paragraph) {
                for (const el of item.paragraph.elements) {
                  out += getParagraphText(el);
                }
              }
            }
            out += ' | ';
          }
          out += '\n';
        }
      }
    }
    return out;
  }

  const text = parseBody(doc.data.body);
  fs.writeFileSync('d:/Booking/sample_cast_extracted.txt', text, 'utf8');
  console.log('Successfully saved sample_cast_extracted.txt! Lines:', text.split('\n').length);
}

main().catch(err => console.error(err));
