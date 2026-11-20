const { google } = require('googleapis');
const fs = require('fs');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const sheets = google.sheets({ version: 'v4', auth });
const config = JSON.parse(fs.readFileSync('d:/Booking/config.json'));

function colIndexToA1(idx) {
  let s = '';
  let n = idx;
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

async function testLookup() {
  const spreadsheetId = config.SPREADSHEET_DATA_KOC_ID;
  const tabName = 'Data KOC (11/2026)';

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:Z100`
  });

  const rows = res.data.values || [];
  const header = rows[0] || [];
  console.log('Header length:', header.length);

  // Dynamic header resolution
  function normalize(s) {
    return (s || '').toLowerCase().replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const colMap = {};
  header.forEach((h, idx) => {
    const norm = normalize(h);
    if (norm.includes('người phụ trách')) colMap.pic = idx;
    if (norm.includes('tên kênh')) colMap.channelName = idx;
    if (norm.includes('trạng thái')) colMap.status = idx;
    if (norm.includes('số sản phẩm tặng')) colMap.giftQty = idx;
    if (norm.includes('mã sản phẩm')) colMap.productCode = idx;
    if (norm.includes('tổng chi phí sản phẩm')) colMap.totalProductCost = idx;
    if (norm.includes('tổng cast')) colMap.totalCast = idx;
  });

  console.log('Resolved column indices:', colMap);
  for (const k in colMap) {
    console.log(`  ${k} -> Col ${colIndexToA1(colMap[k])} (${header[colMap[k]].replace(/\n/g, ' ')})`);
  }

  // Find KOC row
  let targetRowIdx = -1;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const channelVal = normalize(row[colMap.channelName] || '');
    if (channelVal.includes('dmy nè') || channelVal.includes('dmy ne')) {
      targetRowIdx = r;
      console.log(`Found matching KOC at row ${r + 1}:`, row);
      break;
    }
  }

  if (targetRowIdx === -1) {
    console.error('KOC not found!');
    return;
  }

  const matchedRow = rows[targetRowIdx];
  const picVal = normalize(matchedRow[colMap.pic] || '');
  console.log(`Row ${targetRowIdx + 1} PIC is: "${picVal}"`);

  // Verify PIC
  if (!picVal.includes('tuyết')) {
    console.error('PIC does not match Giáng Tuyết!');
    return;
  }

  console.log('Verification PASSED! Ready to update.');
}

testLookup().catch(console.error);

