const fs = require('fs');
const { google } = require('googleapis');

function getGmailClient() {
  const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
  const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

  const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
  auth.setCredentials(creds);

  return google.gmail({ version: 'v1', auth });
}

function makeRawEmail({ to, cc, subject, htmlBody }) {
  const toStr = Array.isArray(to) ? to.join(', ') : to;
  const ccStr = cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : '';

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${toStr}`,
    ...(ccStr ? [`Cc: ${ccStr}`] : []),
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    htmlBody
  ];

  const message = messageParts.join('\r\n');
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Tạo email nháp (Draft) trong Gmail
 */
async function createGmailDraft({ to, cc, subject, htmlBody }) {
  const gmail = getGmailClient();
  const raw = makeRawEmail({ to, cc, subject, htmlBody });

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw
      }
    }
  });

  return res.data;
}

module.exports = {
  createGmailDraft,
  makeRawEmail
};
