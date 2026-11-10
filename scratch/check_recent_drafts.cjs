const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const gmail = google.gmail({ version: 'v1', auth });

async function check() {
  const res = await gmail.users.drafts.list({ userId: 'me', maxResults: 5 });
  console.log('Drafts count:', res.data.drafts ? res.data.drafts.length : 0);
  if (res.data.drafts && res.data.drafts.length > 0) {
    for (const d of res.data.drafts.slice(0, 3)) {
      const draft = await gmail.users.drafts.get({ userId: 'me', id: d.id });
      const headers = draft.data.message.payload.headers;
      const getH = (name) => (headers.find(h => h.name.toLowerCase() === name.toLowerCase()) || {}).value;
      console.log('ID:', d.id);
      console.log('Subject:', getH('Subject'));
      console.log('To:', getH('To'));
      console.log('Cc:', getH('Cc'));
      console.log('Snippet:', draft.data.message.snippet);
      console.log('----------------');
    }
  }
}
check();
