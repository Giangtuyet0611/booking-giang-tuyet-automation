const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const docs = google.docs({ version: 'v1', auth: a });
const sheets = google.sheets({ version: 'v4', auth: a });

async function verify() {
  const docId = '1rmTgsWuU64Ej_JTPYxpXqv2DcvSImZAG1bfQZ_dDDss';
  const doc = await docs.documents.get({ documentId: docId });
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
  extractText(doc.data.body.content);
  const fullText = text.join('');

  console.log('--- VERIFICATION CHECKS ---');
  console.log('1. Date:', fullText.includes('ngày 06 tháng 11 năm 2026'));
  console.log('2. Bên B Name:', fullText.includes('HUỲNH THỊ MỸ HIỀN'));
  console.log('3. Address:', fullText.includes('283E Dương Bá Trạc'));
  console.log('4. CCCD:', fullText.includes('072199009144'));
  console.log('5. SĐT:', fullText.includes('0385683144'));
  console.log('6. Email:', fullText.includes('stellahuynh1711@gmail.com'));
  console.log('7. Product Code:', fullText.includes('71959-RGRGTTR-2'));
  console.log('8. Product Price:', fullText.includes('8.950.000'));
  console.log('9. Showroom:', fullText.includes('283-285 Dương Bá Trạc'));
  console.log('10. Old name "VÂN ANH" remains?:', fullText.includes('VÂN ANH') || fullText.includes('Vân Anh'));
  console.log('11. Old phone "0385169915" remains?:', fullText.includes('0385169915'));

  // Verify Sheet row 204
  const sRes = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: "'Data KOC (11/2026)'!A204:AA204"
  });
  console.log('\nSheet Row 204:');
  const headers = (await sheets.spreadsheets.values.get({
    spreadsheetId: '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw',
    range: "'Data KOC (11/2026)'!A1:AA1"
  })).data.values[0];

  (sRes.data.values[0] || []).forEach((v, i) => {
    if (v) console.log(`  [${headers[i].replace(/\n/g, ' ')}]: "${v}"`);
  });
}

verify().catch(console.error);
