const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function insertTopKocs() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const sheetId = 280295617;
  const tabName = 'Data KOC (11/2026)';

  console.log('1. Inserting 2 rows at top (startIndex: 1, endIndex: 3)...');
  await s.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: 1,
              endIndex: 3
            },
            inheritFromBefore: false
          }
        }
      ]
    }
  });
  console.log('Inserted 2 rows successfully.');

  // Today's date string
  const today = '05/11/2026';

  // Construct values for Row 2 (Thảo Vi) and Row 3 (Cô dâu My Sa)
  // Headers index:
  // 0: STT (Auto) -> leave blank
  // 1: Người phụ trách -> 'Tuyết'
  // 2: Ngày tìm -> today
  // 3: Liên hệ lần thứ (Auto) -> leave blank
  // 4: Tên kênh -> 'Thảo Vi' / 'Cô dâu My Sa'
  // 5: Tên KOC / Nghệ danh -> 'Thảo Vi' / 'My Sa'
  // 6: Tệp / nhóm KOC -> ''
  // 7: Ngành / lĩnh vực -> 'Người thường/reviewer'
  // 8: Style Content -> 'Daily Vlog/Life Style'
  // 9: Khu vực -> ''
  // 10: Kênh TikTok
  // 11: Link Facebook
  // 12: Kênh Instagram
  // 13: Kênh Youtube -> ''
  // 14: Contact -> ''
  // 15: Thương hiệu hợp tác -> 'Saga'
  // 16: Dự án đã liên hệ -> 'Cô dâu Saga'
  // 17: Lý do rớt deal ? -> ''
  // 18: Trạng thái -> 'Đã chốt'
  // 19: Giá báo -> ''
  // 20: Số sản phẩm tặng -> 1
  // 21: Mã sản phẩm
  // 22: Tổng chi phí sản phẩm
  // 23: Cost sản phẩm (Auto) -> leave blank
  // 24: Tổng cast -> 0

  const row2 = [
    '', // 0: STT
    'Tuyết', // 1: PIC
    today, // 2: Ngày tìm
    '', // 3: Liên hệ lần thứ
    'Thảo Vi', // 4: Tên kênh
    'Thảo Vi', // 5: Tên KOC
    '', // 6
    'Người thường/reviewer', // 7
    'Daily Vlog/Life Style', // 8
    '', // 9
    'https://www.tiktok.com/@viihihii_', // 10
    'https://www.facebook.com/share/1DCwSmnFwh/?mibextid=wwXIfr', // 11
    '', // 12
    '', // 13
    '', // 14
    'Saga', // 15
    'Cô dâu Saga', // 16
    '', // 17
    'Đã chốt', // 18
    '', // 19
    1, // 20
    '53229-RGMWRG-4', // 21
    8610000, // 22
    '', // 23
    0 // 24
  ];

  const row3 = [
    '', // 0: STT
    'Tuyết', // 1: PIC
    today, // 2: Ngày tìm
    '', // 3: Liên hệ lần thứ
    'Cô dâu My Sa', // 4: Tên kênh
    'My Sa', // 5: Tên KOC
    '', // 6
    'Người thường/reviewer', // 7
    'Daily Vlog/Life Style', // 8
    '', // 9
    'https://www.tiktok.com/@samie.cutie', // 10
    'https://www.facebook.com/samyneee', // 11
    'https://www.instagram.com/emwaiesei/', // 12
    '', // 13
    '', // 14
    'Saga', // 15
    'Cô dâu Saga', // 16
    '', // 17
    'Đã chốt', // 18
    '', // 19
    1, // 20
    '71959-RGRGTTR-2', // 21
    8950000, // 22
    '', // 23
    0 // 24
  ];

  console.log('2. Writing data to rows 2 and 3...');
  await s.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A2:Y3`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row2, row3]
    }
  });
  console.log('Updated rows 2 and 3.');

  // Verification
  console.log('3. Verifying top 4 rows...');
  const res = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:AA4`
  });

  const headers = res.data.values[0];
  for (let r = 1; r <= 3; r++) {
    const row = res.data.values[r] || [];
    console.log(`\nRow ${r + 1}:`);
    row.forEach((v, idx) => {
      if (v) console.log(`  [${headers[idx].replace(/\n/g, ' ')}]: "${v}"`);
    });
  }
}

insertTopKocs().catch(console.error);
