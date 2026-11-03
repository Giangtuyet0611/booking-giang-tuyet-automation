const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const sheets = google.sheets({ version: 'v4', auth });
const STORE_SHEET_ID = '1G-S4EQ-HQHPMqdKk9V26yRVNQ_ZWn-dXezcZNogh-jY';

let cachedStores = null;

async function fetchAllStores() {
  if (cachedStores) return cachedStores;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: STORE_SHEET_ID,
    range: 'A1:B100'
  });

  const rows = res.data.values || [];
  const stores = [];

  rows.forEach(r => {
    const col0 = r[0] || '';
    const col1 = r[1] || '';

    // Extract email from col0
    const emailMatch = col0.match(/Email:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    const email = emailMatch ? emailMatch[1].trim() : '';

    // Extract address
    const addrMatch = col0.match(/Địa chỉ:\s*([^\n\r]+)/i);
    const address = addrMatch ? addrMatch[1].trim() : '';

    // Extract name
    const lines = col0.split('\n').map(l => l.trim()).filter(Boolean);
    const name = lines[0] || '';

    if (email) {
      stores.push({
        rawInfo: col0,
        leaderInfo: col1,
        name,
        address,
        email
      });
    }
  });

  cachedStores = stores;
  return stores;
}

/**
 * Tìm kiếm thông tin showroom dựa trên chuỗi địa chỉ hoặc tên showroom
 */
async function findStoreByAddressOrName(query) {
  const stores = await fetchAllStores();
  const qNorm = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const s of stores) {
    const nameNorm = s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const addrNorm = s.address.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Match các từ khóa nổi bật (ví dụ 190, tran quang khai, le van viet...)
    if (qNorm.includes('190') && (qNorm.includes('tran quang khai') || qNorm.includes('tqk'))) {
      if (s.name.includes('190 TQK') || s.email.includes('190tranquangkhai')) return s;
    }
    if (qNorm.includes('le van viet') || qNorm.includes('lvv')) {
      if (s.name.includes('Lê Văn Việt') || s.email.includes('levanviet')) return s;
    }
    if (addrNorm && (qNorm.includes(addrNorm) || addrNorm.includes(qNorm))) {
      return s;
    }
    if (nameNorm && (qNorm.includes(nameNorm) || nameNorm.includes(qNorm))) {
      return s;
    }
  }

  // Fallback match email or substring
  return stores.find(s => qNorm.includes(s.email.split('@')[0])) || null;
}

module.exports = {
  fetchAllStores,
  findStoreByAddressOrName
};
