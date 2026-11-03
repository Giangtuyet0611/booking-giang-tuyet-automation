const http = require('http');
const url = require('url');
const { google } = require('googleapis');
const fs = require('fs');
const { exec } = require('child_process');

async function main() {
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;

  const PORT = 8085;
  const server = http.createServer();
  server.listen(PORT, '127.0.0.1', async () => {
    const redirectUri = `http://localhost:${PORT}`;

    const oauth2Client = new google.auth.OAuth2(
      oauthKeys.client_id,
      oauthKeys.client_secret,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes
    });

    console.log('\n============================================================');
    console.log('Vui long mo duong link sau tren trinh duyet de cap quyen Ghi/Tao file:');
    console.log(authUrl);
    console.log('============================================================\n');

    // Tu dong mo trinh duyet
    exec(`start "" "${authUrl}"`);

    server.on('request', async (req, res) => {
      try {
        const queryParams = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
        const code = queryParams.get('code');
        if (code) {
          const { tokens } = await oauth2Client.getToken(code);
          fs.writeFileSync('d:/Booking/.gdrive-server-credentials.json', JSON.stringify(tokens, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h2>Cap quyen thanh cong! Ban co the dong tab nay va quay lai Antigravity.</h2>');
          console.log('\nDa luu Token day du quyen vao .gdrive-server-credentials.json thanh cong!');
          server.close();
          process.exit(0);
        }
      } catch (err) {
        console.error('Loi lay token:', err);
        res.writeHead(500);
        res.end('Loi: ' + err.message);
      }
    });
  });
}

main().catch(console.error);
