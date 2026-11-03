const fs = require('fs');
const { google } = require('googleapis');
const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);
const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

async function testDeleteAndInsertTable() {
  const copyRes = await drive.files.copy({
    fileId: '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8',
    supportsAllDrives: true,
    requestBody: { name: 'TEST_REPLACE_TABLE' }
  });
  const docId = copyRes.data.id;
  const doc = await docs.documents.get({ documentId: docId });

  let sowTable = null;
  for (const el of doc.data.body.content) {
    if (el.table && el.table.tableRows.length >= 7) {
      sowTable = el;
      break;
    }
  }

  console.log('sowTable start:', sowTable.startIndex, 'end:', sowTable.endIndex);

  try {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: {
                startIndex: sowTable.startIndex,
                endIndex: sowTable.endIndex
              }
            }
          }
        ]
      }
    });
    console.log('Successfully deleted entire sowTable via deleteContentRange!');
  } catch (err) {
    console.log('Failed to delete table via deleteContentRange:', err.message);
  }
}

testDeleteAndInsertTable().catch(console.error);
