const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

function getClients() {
  const rootDir = path.resolve(__dirname, '../..');
  const credsPath = path.join(rootDir, '.gdrive-server-credentials.json');
  const keysPath = path.join(rootDir, 'gcp-oauth.keys.json');
  const configPath = path.join(rootDir, 'config.json');

  if (!fs.existsSync(credsPath)) {
    throw new Error(`Không tìm thấy file token xác thực: ${credsPath}. Hãy chạy authenticate.bat trước!`);
  }
  if (!fs.existsSync(keysPath)) {
    throw new Error(`Không tìm thấy file Google OAuth keys: ${keysPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync(keysPath, 'utf8')).installed;
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};

  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    auth,
    drive: google.drive({ version: 'v3', auth }),
    docs: google.docs({ version: 'v1', auth }),
    sheets: google.sheets({ version: 'v4', auth }),
    gmail: google.gmail({ version: 'v1', auth }),
    config
  };
}

module.exports = { getClients };

