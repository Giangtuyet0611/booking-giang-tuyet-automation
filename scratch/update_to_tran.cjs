const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function updateRow341() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  // We want to update:
  // 1. Column B (Người phụ trách) -> 'Tuyết'
  // 2. Column K (Kênh TikTok) -> 'https://www.tiktok.com/@hngtotran'
  // 3. Column L (Link Facebook) -> 'https://www.facebook.com/share/14yxc618ake/?mibextid=wwXIfr'
  // 4. Column S (Trạng thái) -> 'Đã chốt'
  // 5. Column U (Số sản phẩm tặng) -> 1
  // 6. Column V (Mã sản phẩm) -> '53229-SVMWSV-7'
  // 7. Column W (Tổng chi phí sản phẩm) -> 8610000
  // 8. Column Y (Tổng cast) -> 0

  const data = [
    {
      range: `'${tabName}'!B341`,
      values: [['Tuyết']]
    },
    {
      range: `'${tabName}'!K341:L341`,
      values: [['https://www.tiktok.com/@hngtotran', 'https://www.facebook.com/share/14yxc618ake/?mibextid=wwXIfr']]
    },
    {
      range: `'${tabName}'!S341`,
      values: [['Đã chốt']]
    },
    {
      range: `'${tabName}'!U341:W341`,
      values: [[1, '53229-SVMWSV-7', 8610000]]
    },
    {
      range: `'${tabName}'!Y341`,
      values: [[0]]
    }
  ];

  const res = await s.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data
    }
  });

  console.log('Update result:', res.data);

  // Read back row 341 to verify
  const verify = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A341:AA341`
  });
  console.log('\nVerified Row 341:');
  const headers = (await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:AA1`
  })).data.values[0];

  verify.data.values[0].forEach((val, idx) => {
    if (val !== undefined && val !== '') {
      console.log(`  [${headers[idx].replace(/\n/g, ' ')}]: "${val}"`);
    }
  });
}

updateRow341().catch(console.error);
