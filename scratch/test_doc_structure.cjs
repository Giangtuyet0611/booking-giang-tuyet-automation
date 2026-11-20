const { google } = require('googleapis');
const fs = require('fs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    drive: google.drive({ version: 'v3', auth }),
    docs: google.docs({ version: 'v1', auth })
  };
}

async function testInspect() {
  const { docs } = getClients();
  const docId = process.argv[2] || '1iiZvzmGYEd5TVnsZDBE6Q5-PCXqFnaQG47JweAu7DSQ';
  const res = await docs.documents.get({ documentId: docId });
  console.log('Doc Title:', res.data.title);
  
  const tables = [];
  res.data.body.content.forEach((el, idx) => {
    if (el.table) {
      const rows = el.table.tableRows.map((r, ri) => {
        const text = r.tableCells.map(c => {
          let t = '';
          c.content.forEach(co => {
            if (co.paragraph) t += co.paragraph.elements.map(e => e.textRun?.content || '').join('');
          });
          return t.trim().replace(/\n/g, ' ');
        }).join(' | ');
        return `[Row ${ri}] ${text}`;
      });
      tables.push({
        index: idx,
        rowCount: el.table.tableRows.length,
        rows
      });
    }
  });

  console.log('Found tables:', JSON.stringify(tables, null, 2));
}

testInspect().catch(console.error);
