const { getClients } = require('../lib/google.cjs');

const DATA_KOC_SPREADSHEET_ID = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
const DATA_KOC_TAB = 'Data KOC (11/2026)';
const REPORT_SPREADSHEET_ID = '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I';
const REPORT_TAB = 'Report Saga';

function normalizeHeader(s) {
  return String(s || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeName(s) {
  return String(s || '').replace(/^@/, '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function colIndexToA1(idx) {
  let s = '';
  let n = idx;
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

function findHeaderRow(rows, requiredPrefixes) {
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r] || [];
    const normCells = row.map(normalizeHeader);
    const colMap = {};
    let allFound = true;
    for (const req of requiredPrefixes) {
      const target = normalizeHeader(req);
      const matches = [];
      normCells.forEach((c, idx) => {
        if (c === target || c.startsWith(target)) matches.push(idx);
      });
      if (matches.length !== 1) {
        allFound = false;
        break;
      }
      colMap[req] = matches[0];
    }
    if (allFound) {
      return { headerRowIndex: r, colMap };
    }
  }
  return null;
}

function classifyPostUrl(url) {
  const u = String(url || '').toLowerCase();
  if (u.includes('facebook.com') || u.includes('fb.watch')) {
    const label = (u.includes('reel') || u.includes('/share/r/')) ? 'Facebook Reels' : 'Facebook';
    return { platform: 'Facebook', label };
  }
  if (u.includes('tiktok.com')) {
    const label = u.includes('/photo/') ? 'Tiktok Photo' : 'Tiktok';
    return { platform: 'Tiktok', label };
  }
  if (u.includes('instagram.com')) {
    let label = 'Instagram Video';
    if (u.includes('reel')) label = 'Instagram Reels';
    else if (u.includes('/p/') || u.includes('photo')) label = 'Instagram';
    return { platform: 'Instagram', label };
  }
  if (u.includes('threads.net') || u.includes('threads.com')) {
    return { platform: 'Threads', label: 'Threads' };
  }
  if (u.includes('youtube.com') || u.includes('youtu.be')) {
    return { platform: 'Youtube', label: 'Youtube' };
  }
  return { platform: 'Khác', label: 'Link post' };
}

async function handleReportPostCommand(payload, options = {}) {
  const { sheets } = getClients();

  const kocQuery = payload.koc;
  const airDate = payload.airDate || (() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();
  const materialsUrl = payload.materialsUrl || '';
  const materialsTitle = payload.materialsTitle || '';
  const format = payload.format || 'Video';
  const sdha = payload.sdha || 'Trọn đời';
  const links = payload.links || [];

  console.log('========================================================================');
  console.log(`BÁO CÁO POST AIR & MATERIALS: ${kocQuery}`);
  console.log('========================================================================');

  // 1. Dò Data KOC (11/2026) để đồng bộ "Liên hệ lần thứ" và "Tên kênh"
  const dkRes = await sheets.spreadsheets.values.get({
    spreadsheetId: DATA_KOC_SPREADSHEET_ID,
    range: `'${DATA_KOC_TAB}'!A1:Z2000`
  });
  const dkRows = dkRes.data.values || [];
  const dkHeader = findHeaderRow(dkRows, ['Tên kênh', 'Liên hệ lần thứ', 'Người phụ trách']);
  if (!dkHeader) {
    throw new Error('Không tìm thấy dòng tiêu đề hợp lệ trong Data KOC (11/2026).');
  }

  const normQuery = normalizeName(kocQuery);
  const matchedDkRows = [];
  const nearMatches = [];
  const aliasCol = dkRows[dkHeader.headerRowIndex].findIndex(h => normalizeHeader(h).startsWith('tên koc'));
  const prodCol = dkRows[dkHeader.headerRowIndex].findIndex(h => normalizeHeader(h).startsWith('mã sản phẩm'));
  for (let r = dkHeader.headerRowIndex + 1; r < dkRows.length; r++) {
    const row = dkRows[r] || [];
    const chanVal = row[dkHeader.colMap['Tên kênh']] || '';
    const aliasVal = aliasCol >= 0 ? (row[aliasCol] || '') : '';
    const prodVal = prodCol >= 0 ? (row[prodCol] || '') : '';
    const nChan = normalizeName(chanVal);
    const nAlias = normalizeName(aliasVal);
    if (nChan === normQuery) {
      matchedDkRows.push({
        rowNumber: r + 1,
        pic: row[dkHeader.colMap['Người phụ trách']] || '',
        turn: row[dkHeader.colMap['Liên hệ lần thứ']] || '',
        channelName: chanVal
      });
    } else if (
      (payload.productCode && prodVal.toUpperCase().includes(payload.productCode.toUpperCase())) ||
      nAlias === normQuery
    ) {
      nearMatches.push({
        rowNumber: r + 1,
        pic: row[dkHeader.colMap['Người phụ trách']] || '',
        turn: row[dkHeader.colMap['Liên hệ lần thứ']] || '',
        channelName: chanVal,
        alias: aliasVal,
        prod: prodVal
      });
    }
  }

  if (matchedDkRows.length === 0 && nearMatches.length === 1) {
    matchedDkRows.push(nearMatches[0]);
  } else if (matchedDkRows.length === 0) {
    const hint = nearMatches.length > 0 ? ` Gợi ý gần đúng: ${JSON.stringify(nearMatches)}` : '';
    throw new Error(`Không tìm thấy kênh "${kocQuery}" trong ${DATA_KOC_TAB}.${hint}`);
  }
  if (matchedDkRows.length > 1) {
    throw new Error(`Tìm thấy ${matchedDkRows.length} dòng trùng "${kocQuery}" trong ${DATA_KOC_TAB}. Vui lòng kiểm tra.`);
  }

  const kocMeta = matchedDkRows[0];
  console.log(`1. Data KOC khớp Row ${kocMeta.rowNumber}: Tên kênh="${kocMeta.channelName}", Liên hệ lần thứ="${kocMeta.turn}", PIC="${kocMeta.pic}"`);

  // 2. Dò header & dòng trống đầu tiên trong Report Saga
  const rpRes = await sheets.spreadsheets.values.get({
    spreadsheetId: REPORT_SPREADSHEET_ID,
    range: `'${REPORT_TAB}'!A1:Z500`
  });
  const rpRows = rpRes.data.values || [];
  const requiredReportCols = [
    'Ngày AIR',
    'Liên hệ lần thứ',
    'Tên kênh',
    'Materials',
    'Format',
    'Thời gian SDHA',
    'Kênh đăng',
    'Link post'
  ];
  const rpHeader = findHeaderRow(rpRows, requiredReportCols);
  if (!rpHeader) {
    throw new Error('Thiếu hoặc trùng tên cột bắt buộc trong Sheet Report Saga. DỪNG.');
  }
  console.log(`2. Nhận diện dòng tiêu đề Report Saga tại Row ${rpHeader.headerRowIndex + 1}:`, rpHeader.colMap);

  const channelColIdx = rpHeader.colMap['Tên kênh'];
  let firstEmptyRowIndex = rpHeader.headerRowIndex + 1;
  while (firstEmptyRowIndex < rpRows.length) {
    const val = (rpRows[firstEmptyRowIndex] || [])[channelColIdx];
    if (!val || String(val).trim() === '') break;
    firstEmptyRowIndex++;
  }

  // Kiểm tra locale của bảng tính (dùng ';' hay ',' cho HYPERLINK)
  const metaRes = await sheets.spreadsheets.get({ spreadsheetId: REPORT_SPREADSHEET_ID, fields: 'properties.locale' });
  const locale = metaRes.data.properties?.locale || 'vi_VN';
  const sep = (locale.startsWith('en')) ? ',' : ';';
  console.log(`3. Locale Sheet Report: ${locale} (HYPERLINK separator: "${sep}") | Dòng trống đầu tiên: Row ${firstEmptyRowIndex + 1}`);

  const materialsCell = materialsUrl
    ? (materialsTitle ? `=HYPERLINK("${materialsUrl}"${sep} "${materialsTitle}")` : materialsUrl)
    : '';

  const updates = [];
  for (let i = 0; i < links.length; i++) {
    const targetRowNum = firstEmptyRowIndex + 1 + i;
    const { platform, label } = classifyPostUrl(links[i]);
    const linkPostCell = `=HYPERLINK("${links[i]}"${sep} "${label}")`;

    const rowFields = {
      'Ngày AIR': airDate,
      'Liên hệ lần thứ': kocMeta.turn,
      'Tên kênh': kocMeta.channelName,
      'Materials': materialsCell,
      'Format': format,
      'Thời gian SDHA': sdha,
      'Kênh đăng': platform,
      'Link post': linkPostCell
    };

    console.log(`   -> Row ${targetRowNum} [${platform}]: ${label} | ${links[i]}`);
    for (const [colName, val] of Object.entries(rowFields)) {
      if (val === '' && colName === 'Materials') continue;
      const colLetter = colIndexToA1(rpHeader.colMap[colName]);
      updates.push({
        range: `'${REPORT_TAB}'!${colLetter}${targetRowNum}`,
        values: [[val]]
      });
    }
  }

  if (options.dryRun) {
    console.log('\n[DRY-RUN] Không ghi vào Google Sheet.');
    return { dryRun: true, startRow: firstEmptyRowIndex + 1, count: links.length };
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: REPORT_SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });

  console.log(`\n✅ ĐÃ GHI THÀNH CÔNG ${links.length} HÀNG VÀO SHEET REPORT SAGA (Row ${firstEmptyRowIndex + 1}..${firstEmptyRowIndex + links.length})!`);
  return {
    success: true,
    startRow: firstEmptyRowIndex + 1,
    endRow: firstEmptyRowIndex + links.length,
    kocMeta
  };
}

module.exports = { handleReportPostCommand };
