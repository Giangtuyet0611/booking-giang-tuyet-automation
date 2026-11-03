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
  const res = await docs.documents.get({ documentId: '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8' });
  console.log('Doc Title:', res.data.title);
  
  const tables = [];
  res.data.body.content.forEach((el, idx) => {
    if (el.table) {
      tables.push({
        index: idx,
        startIndex: el.startIndex,
        endIndex: el.endIndex,
        rowCount: el.table.tableRows.length
      });
    }
  });

  console.log('Found tables:', JSON.stringify(tables, null, 2));
}

testInspect().catch(console.error);
