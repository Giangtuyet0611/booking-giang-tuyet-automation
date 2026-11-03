const { google } = require('googleapis');
const fs = require('fs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    docs: google.docs({ version: 'v1', auth })
  };
}

function extractText(content) {
  let text = '';
  for (const element of content) {
    if (element.paragraph) {
      for (const el of element.paragraph.elements) {
        if (el.textRun) {
          text += el.textRun.content;
        }
      }
    } else if (element.table) {
      text += '\n[TABLE]\n';
      for (const row of element.table.tableRows) {
        let rowText = '| ';
        for (const cell of row.tableCells) {
          let cellText = '';
          for (const cContent of cell.content) {
            if (cContent.paragraph) {
              for (const el of cContent.paragraph.elements) {
                if (el.textRun) cellText += el.textRun.content.trim() + ' ';
              }
            }
          }
          rowText += cellText.trim() + ' | ';
        }
        text += rowText + '\n';
      }
      text += '[END TABLE]\n';
    }
  }
  return text;
}

async function verify() {
  const { docs } = getClients();

  console.log('--- KIỂM TRA HĐ TẶNG SP 1 ---');
  const gift1Res = await docs.documents.get({ documentId: '1FyPHbHLzghKLAO1EDKTvvlWr_00yqtOGFLu--4P6ATs' });
  const gift1Text = extractText(gift1Res.data.body.content);
  fs.writeFileSync('d:/Booking/verify_gift1.txt', gift1Text, 'utf8');

  console.log('--- KIỂM TRA HĐ TRẢ CAST ---');
  const castRes = await docs.documents.get({ documentId: '1J0Cx9ERxGHmhamNn4Mys6uxEgdxNGkAghE9ciz-bStc' });
  const castText = extractText(castRes.data.body.content);
  fs.writeFileSync('d:/Booking/verify_cast.txt', castText, 'utf8');

  console.log('Done writing verify files.');
}

verify().catch(console.error);
