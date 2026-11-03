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

  const castRes = await docs.documents.get({ documentId: '19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V' });
  console.log('=== CAST DOC ===');
  console.log('Title:', castRes.data.title);

  function extractText(content) {
    let text = '';
    for (const item of content) {
      if (item.paragraph) {
        for (const el of item.paragraph.elements) {
          if (el.textRun) text += el.textRun.content;
        }
      } else if (item.table) {
        for (const row of item.table.tableRows) {
          for (const cell of row.tableCells) {
            text += extractText(cell.content) + ' | ';
          }
          text += '\n';
        }
      }
    }
    return text;
  }

  const castText = extractText(castRes.data.body.content);
  fs.writeFileSync('d:/Booking/cast_template_text.txt', castText, 'utf8');
  console.log('Saved cast_template_text.txt, length:', castText.length);

  const giftRes = await docs.documents.get({ documentId: '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8' });
  console.log('=== GIFT DOC ===');
  console.log('Title:', giftRes.data.title);
  const giftText = extractText(giftRes.data.body.content);
  fs.writeFileSync('d:/Booking/gift_template_text.txt', giftText, 'utf8');
  console.log('Saved gift_template_text.txt, length:', giftText.length);
}

main().catch(console.error);
