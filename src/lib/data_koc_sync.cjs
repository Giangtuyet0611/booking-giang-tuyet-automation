const { getClients } = require('./google.cjs');

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function extractRegionFromAddress(address) {
  const addr = String(address || '').trim();
  if (!addr) return '-';
  const low = addr.toLowerCase();
  if (low.includes('hồ chí minh') || low.includes('tp. hcm') || low.includes('tp.hcm') || low.includes('tphcm') || low.includes('hcm') || low.includes('thủ đức')) {
    return 'TP. HCM';
  }
  if (low.includes('hà nội')) return 'Hà Nội';
  if (low.includes('đà nẵng')) return 'Đà Nẵng';
  if (low.includes('cần thơ')) return 'Cần Thơ';
  if (low.includes('hải phòng')) return 'Hải Phòng';
  if (low.includes('bắc ninh')) return 'Bắc Ninh';
  if (low.includes('đồng nai')) return 'Đồng Nai';
  if (low.includes('bình dương')) return 'Bình Dương';

  const parts = addr.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length > 0) {
    return parts[parts.length - 1];
  }
  return '-';
}

/**
 * Cập nhật thông tin KOC vào Sheet Data KOC (11/2026) ngay tại bước Làm hợp đồng.
 * - Nhận diện cột theo tên tiêu đề.
 * - Tuyệt đối không ghi đè cột có công thức hoặc có "(Auto)".
 * - Điền "-" vào các ô nhập liệu không có nội dung trên hàng của KOC.
 */
async function syncDataKocOnContract(deal, options = {}) {
  const { sheets, config } = getClients();
  const spreadsheetId = config.SPREADSHEET_DATA_KOC_ID;
  const tabName = config.TAB_DATA_KOC || 'Data KOC (11/2026)';

  console.log(`\n-> Đồng bộ thông tin KOC "${deal.koc.name}" vào Sheet ${tabName}...`);

  const [valRes, formulaRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId, range: `'${tabName}'!A1:Z1000` }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: `'${tabName}'!A1:Z1000`, valueRenderOption: 'FORMULA' })
  ]);

  const rows = valRes.data.values || [];
  const formulaRows = formulaRes.data.values || [];

  let headerRowIdx = -1;
  let header = [];
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const rNorm = (rows[i] || []).map(normalizeText);
    if (rNorm.some(c => c.startsWith('tên kênh')) && rNorm.some(c => c.startsWith('người phụ trách'))) {
      headerRowIdx = i;
      header = rows[i];
      break;
    }
  }

  if (headerRowIdx === -1) {
    console.warn(`⚠️ Không tìm thấy dòng tiêu đề hợp lệ trong ${tabName}. Bỏ qua cập nhật Data KOC.`);
    return { updated: false, reason: 'missing_header' };
  }

  const colMap = {};
  const autoCols = new Set();
  header.forEach((h, idx) => {
    const norm = normalizeText(h);
    if (norm.includes('(auto)') || norm.startsWith('tổng chi phí sau deal')) {
      autoCols.add(idx);
    }
    if (norm.startsWith('người phụ trách')) colMap.pic = idx;
    if (norm.startsWith('tên kênh')) colMap.channelName = idx;
    if (norm.startsWith('tên koc')) colMap.kocAlias = idx;
    if (norm.startsWith('khu vực')) colMap.region = idx;
    if (norm.startsWith('kênh tiktok')) colMap.tiktok = idx;
    if (norm.startsWith('link facebook')) colMap.facebook = idx;
    if (norm.startsWith('kênh instagram')) colMap.instagram = idx;
    if (norm.startsWith('kênh youtube')) colMap.youtube = idx;
    if (norm.startsWith('trạng thái')) colMap.status = idx;
    if (norm.startsWith('số sản phẩm tặng')) colMap.giftQty = idx;
    if (norm.startsWith('mã sản phẩm')) colMap.productCode = idx;
    if (norm.startsWith('tổng chi phí sản phẩm')) colMap.totalProductCost = idx;
    if (norm.startsWith('tổng cast')) colMap.totalCast = idx;
  });

  const requiredCols = ['pic', 'channelName', 'status', 'giftQty', 'productCode', 'totalProductCost', 'totalCast'];
  for (const rc of requiredCols) {
    if (colMap[rc] === undefined) {
      console.warn(`⚠️ Thiếu cột bắt buộc "${rc}" trên ${tabName}. Bỏ qua cập nhật Data KOC.`);
      return { updated: false, reason: `missing_col_${rc}` };
    }
  }

  const kocSearchNorm = normalizeText(deal.koc.name).replace(/^@/, '');
  const expectedPicNorm = normalizeText(deal.pic || 'Giáng Tuyết');
  const matchedIndices = [];
  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const channelVal = normalizeText(row[colMap.channelName] || '').replace(/^@/, '');
    if (!channelVal) continue;
    if (channelVal === kocSearchNorm || channelVal.includes(kocSearchNorm)) {
      matchedIndices.push(r);
    }
  }

  let targetRowIdx = -1;
  if (matchedIndices.length === 1) {
    targetRowIdx = matchedIndices[0];
  } else if (matchedIndices.length > 1) {
    const picMatched = matchedIndices.filter(r => normalizeText(rows[r][colMap.pic] || '').includes(expectedPicNorm));
    if (picMatched.length === 1) {
      targetRowIdx = picMatched[0];
    } else {
      console.warn(`⚠️ Tìm thấy ${matchedIndices.length} dòng trùng "${deal.koc.name}" trên ${tabName}. Không tự ghi để tránh nhầm.`);
      return { updated: false, reason: 'duplicate_rows' };
    }
  }

  if (targetRowIdx === -1) {
    console.warn(`⚠️ Không tìm thấy dòng của KOC "${deal.koc.name}" trên ${tabName}.`);
    return { updated: false, reason: 'not_found' };
  }

  const targetRowNumber = targetRowIdx + 1;
  const matchedRow = rows[targetRowIdx] || [];
  const matchedFormulaRow = formulaRows[targetRowIdx] || [];
  const picVal = normalizeText(matchedRow[colMap.pic] || '');

  if (!picVal.includes('tuyết') && !picVal.includes(expectedPicNorm)) {
    console.warn(`⚠️ Người phụ trách trên Sheet ("${matchedRow[colMap.pic]}") không khớp "${deal.pic || 'Giáng Tuyết'}". Không ghi.`);
    return { updated: false, reason: 'pic_mismatch' };
  }

  const giftProducts = (deal.products || []).filter(p => !p.isLoan && p.type !== 'loan' && p.code);
  const giftQty = giftProducts.length > 0 ? giftProducts.length : '-';
  const productCodes = giftProducts.length > 0 ? giftProducts.map(p => p.code).join(' ; ') : '-';
  const totalProductVal = giftProducts.reduce((s, p) => s + Number(String(p.value || '0').replace(/[^0-9]/g, '')), 0);
  const totalCostCell = totalProductVal > 0 ? totalProductVal : '-';
  const castAmount = Number(deal.cast?.amount || 0);
  const totalCastCell = castAmount > 0 ? castAmount : '-';

  const desiredValues = new Map();
  desiredValues.set(colMap.status, 'Đã chốt');
  if (colMap.kocAlias !== undefined) desiredValues.set(colMap.kocAlias, deal.koc.fullName || '-');
  if (colMap.region !== undefined) desiredValues.set(colMap.region, extractRegionFromAddress(deal.koc.address));
  if (colMap.tiktok !== undefined) desiredValues.set(colMap.tiktok, deal.koc.channels?.tiktok || '-');
  if (colMap.facebook !== undefined) desiredValues.set(colMap.facebook, deal.koc.channels?.facebook || '-');
  if (colMap.instagram !== undefined) desiredValues.set(colMap.instagram, deal.koc.channels?.instagram || '-');
  if (colMap.youtube !== undefined) desiredValues.set(colMap.youtube, deal.koc.channels?.youtube || '-');
  desiredValues.set(colMap.giftQty, giftQty);
  desiredValues.set(colMap.productCode, productCodes);
  desiredValues.set(colMap.totalProductCost, totalCostCell);
  desiredValues.set(colMap.totalCast, totalCastCell);

  // Trên hàng KOC, mọi cột nhập liệu (không phải Auto/công thức) đang trống sẽ điền "-"
  const updates = [];
  for (let c = 0; c < header.length; c++) {
    if (autoCols.has(c)) continue;
    const rawFormula = String(matchedFormulaRow[c] || '');
    if (rawFormula.startsWith('=')) continue; // Bảo toàn công thức

    if (desiredValues.has(c)) {
      updates.push({
        range: `'${tabName}'!${colIndexToA1(c)}${targetRowNumber}`,
        values: [[desiredValues.get(c)]]
      });
    } else {
      const existingVal = String(matchedRow[c] || '').trim();
      if (existingVal === '') {
        updates.push({
          range: `'${tabName}'!${colIndexToA1(c)}${targetRowNumber}`,
          values: [['-']]
        });
      }
    }
  }

  if (options.dryRun) {
    console.log(`-> [DRY RUN] Sẽ cập nhật Data KOC Row ${targetRowNumber} (${updates.length} ô).`);
    return { updated: false, dryRun: true, rowNumber: targetRowNumber };
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });

  console.log(`-> ✅ ĐÃ CẬP NHẬT THÀNH CÔNG SHEET DATA KOC TẠI ROW ${targetRowNumber} (${updates.length} ô)!`);
  return { updated: true, rowNumber: targetRowNumber };
}

module.exports = { syncDataKocOnContract };
