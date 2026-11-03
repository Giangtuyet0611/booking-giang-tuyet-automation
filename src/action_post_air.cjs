const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';
const TAB_CSC = 'CSC - Saga';
const TAB_POST = 'SL post & ĐTT - Saga';

function getSheetsClient() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  return google.sheets({ version: 'v4', auth });
}

/**
 * Phân tích và gán nhãn cho link bài đăng
 */
function parsePostUrl(url) {
  const u = String(url).trim();
  const lower = u.toLowerCase();

  // TikTok
  if (lower.includes('tiktok.com')) {
    if (lower.includes('/photo/')) {
      return { platform: 'Tiktok', label: 'Tiktok Photo', group: 'Tiktok', url: u };
    }
    // Mặc định video Tiktok hiển thị là "Tiktok"
    return { platform: 'Tiktok', label: 'Tiktok', group: 'Tiktok', url: u };
  }

  // Facebook
  if (lower.includes('facebook.com') || lower.includes('fb.watch')) {
    if (lower.includes('reel') || lower.includes('reels')) {
      return { platform: 'Facebook', label: 'Facebook Reels', group: 'FB / IG', url: u };
    }
    return { platform: 'Facebook', label: 'Facebook', group: 'FB / IG', url: u };
  }

  // Instagram
  if (lower.includes('instagram.com')) {
    if (lower.includes('/reel/') || lower.includes('/reels/')) {
      return { platform: 'Instagram', label: 'Instagram Reels', group: 'FB / IG', url: u };
    }
    if (lower.includes('/p/') || lower.includes('photo')) {
      return { platform: 'Instagram', label: 'Instagram', group: 'FB / IG', url: u };
    }
    return { platform: 'Instagram', label: 'Instagram Video', group: 'FB / IG', url: u };
  }

  // Threads
  if (lower.includes('threads.net')) {
    return { platform: 'Threads', label: 'Threads Post', group: 'Threads', url: u };
  }

  // Youtube
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    if (lower.includes('/shorts/')) {
      return { platform: 'Youtube', label: 'Youtube Shorts', group: 'Youtube', url: u };
    }
    return { platform: 'Youtube', label: 'Youtube Video', group: 'Youtube', url: u };
  }

  return { platform: 'Other', label: 'Link Post', group: 'FB / IG', url: u };
}

/**
 * Đối chiếu thông tin KOC từ Tab CSC - Saga
 */
async function lookupKocFromCsc(sheets, kocName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${TAB_CSC}'!A2:F`
  });

  const rows = res.data.values || [];
  const searchKey = kocName.toLowerCase().trim();

  // Tìm kiếm chính xác hoặc chứa tên KOC
  let matched = null;
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    const nameInSheet = String(row[3] || '').trim(); // Cột D: Tên KOC
    if (nameInSheet.toLowerCase() === searchKey) {
      matched = {
        nguoiPhuTrach: row[1] || '',
        ngayBook: row[2] || '',
        tenKoc: nameInSheet,
        linkSpUtm: row[4] || '',
        giaTriSp: row[5] || ''
      };
      break;
    }
  }

  // Nếu chưa thấy, thử tìm partial match
  if (!matched) {
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];
      const nameInSheet = String(row[3] || '').trim();
      if (nameInSheet.toLowerCase().includes(searchKey) || searchKey.includes(nameInSheet.toLowerCase())) {
        matched = {
          nguoiPhuTrach: row[1] || '',
          ngayBook: row[2] || '',
          tenKoc: nameInSheet,
          linkSpUtm: row[4] || '',
          giaTriSp: row[5] || ''
        };
        break;
      }
    }
  }

  return matched;
}

/**
 * Tìm dòng trống đầu tiên sau dòng có dữ liệu cuối cùng trong tab 'SL post & ĐTT - Saga'
 */
async function findFirstEmptyRowInPostTab(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${TAB_POST}'!D1:D1500`
  });

  const rows = res.data.values || [];
  let lastDataRow = 1;
  for (let i = rows.length - 1; i >= 0; i--) {
    const val = rows[i] ? rows[i][0] : '';
    if (val && String(val).trim() !== '') {
      lastDataRow = i + 1; // 1-indexed
      break;
    }
  }
  return lastDataRow + 1;
}

/**
 * Lấy SheetId của tab theo tên
 */
async function getSheetIdByTitle(sheets, title) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets.find(s => s.properties.title === title);
  if (!sheet) throw new Error(`Không tìm thấy sheet có tên "${title}"`);
  return sheet.properties.sheetId;
}

/**
 * Hàm thực thi ghi nhận Post Air
 * @param {Object} params
 * @param {string} params.kocName - Tên KOC cần tra cứu đối chiếu
 * @param {Array<string>} params.postUrls - Danh sách các link bài đăng được gửi
 * @param {string} [params.airDate] - Ngày air post định dạng DD/MM/YYYY (mặc định lấy ngày hiện tại)
 * @param {Array<string>} [params.captions] - Danh sách caption tương ứng (nếu có)
 */
async function recordPostAir({ kocName, postUrls, airDate, captions = [] }) {
  const sheets = getSheetsClient();
  const postSheetId = await getSheetIdByTitle(sheets, TAB_POST);

  // 1. Chuẩn hóa ngày air
  let formattedAirDate = airDate;
  if (!formattedAirDate) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    formattedAirDate = `${dd}/${mm}/${yyyy}`;
  }

  // 2. Tra cứu CSC - Saga
  const kocInfo = await lookupKocFromCsc(sheets, kocName);
  if (!kocInfo) {
    throw new Error(`Không tìm thấy thông tin KOC "${kocName}" trong Tab "${TAB_CSC}". Vui lòng kiểm tra lại tên KOC.`);
  }

  console.log(`Tìm thấy KOC trong CSC: [${kocInfo.tenKoc}] | Phụ trách: ${kocInfo.nguoiPhuTrach} | Ngày book: ${kocInfo.ngayBook}`);

  // 3. Phân loại và gom nhóm links
  const parsedItems = postUrls.map((url, idx) => ({
    ...parsePostUrl(url),
    caption: captions[idx] || ''
  }));

  // Gom các link FB và IG nếu gửi cùng ngày
  const fbIgItems = parsedItems.filter(item => item.group === 'FB / IG');
  const otherItems = parsedItems.filter(item => item.group !== 'FB / IG');

  const groupsToInsert = [];

  // Nhóm FB/IG (cho phép Link post 1 và Link post 2 trên cùng 1 dòng)
  if (fbIgItems.length > 0) {
    for (let i = 0; i < fbIgItems.length; i += 2) {
      const item1 = fbIgItems[i];
      const item2 = fbIgItems[i + 1] || null;
      groupsToInsert.push({
        groupName: 'FB / IG',
        post1: item1,
        post2: item2
      });
    }
  }

  // Các nhóm khác (Tiktok, Threads, Youtube) mỗi link 1 dòng
  for (const item of otherItems) {
    groupsToInsert.push({
      groupName: item.group,
      post1: item,
      post2: null
    });
  }

  const results = [];

  // 4. Ghi từng dòng vào Tab 'SL post & ĐTT - Saga'
  for (const entry of groupsToInsert) {
    const targetRow = await findFirstEmptyRowInPostTab(sheets);
    console.log(`Đang ghi nhận vào dòng ${targetRow}...`);

    // Cập nhật Cột A -> G
    // A: Ngày book, B: Ngày Air post, C: Người phụ trách, D: Tên KOC, E: Link SP UTM, F: Giá trị SP, G: Nhóm bài viết
    const rangeAG = `'${TAB_POST}'!A${targetRow}:G${targetRow}`;
    const valuesAG = [[
      kocInfo.ngayBook,
      formattedAirDate,
      kocInfo.nguoiPhuTrach,
      kocInfo.tenKoc,
      kocInfo.linkSpUtm,
      kocInfo.giaTriSp,
      entry.groupName
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeAG,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: valuesAG }
    });

    // Cập nhật Cột J (Caption 1)
    if (entry.post1.caption) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${TAB_POST}'!J${targetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[entry.post1.caption]] }
      });
    }

    // Cập nhật Cột S (Caption 2) nếu có
    if (entry.post2 && entry.post2.caption) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${TAB_POST}'!S${targetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[entry.post2.caption]] }
      });
    }

    // Set Hyperlink chuẩn cho Cột I (Link post 1) và Cột R (Link post 2) qua batchUpdate
    const updateCellRequests = [];
    
    // Cột I: columnIndex = 8 (0-indexed)
    updateCellRequests.push({
      updateCells: {
        range: {
          sheetId: postSheetId,
          startRowIndex: targetRow - 1,
          endRowIndex: targetRow,
          startColumnIndex: 8,
          endColumnIndex: 9
        },
        rows: [{
          values: [{
            userEnteredValue: { stringValue: entry.post1.label },
            userEnteredFormat: {
              textFormat: {
                link: { uri: entry.post1.url }
              }
            }
          }]
        }],
        fields: 'userEnteredValue,userEnteredFormat.textFormat.link'
      }
    });

    // Cột R: columnIndex = 17 (0-indexed) nếu có post2
    if (entry.post2) {
      updateCellRequests.push({
        updateCells: {
          range: {
            sheetId: postSheetId,
            startRowIndex: targetRow - 1,
            endRowIndex: targetRow,
            startColumnIndex: 17,
            endColumnIndex: 18
          },
          rows: [{
            values: [{
              userEnteredValue: { stringValue: entry.post2.label },
              userEnteredFormat: {
                textFormat: {
                  link: { uri: entry.post2.url }
                }
              }
            }]
          }],
          fields: 'userEnteredValue,userEnteredFormat.textFormat.link'
        }
      });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: updateCellRequests }
    });

    // Đảm bảo các công thức ở cột H, L, U luôn tồn tại nếu dòng mới chưa có
    const checkFormulaRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TAB_POST}'!H${targetRow}:U${targetRow}`,
      valueRenderOption: 'FORMULA'
    });

    const rowFormulas = (checkFormulaRes.data.values && checkFormulaRes.data.values[0]) || [];
    const hasFormulaH = rowFormulas[0] && String(rowFormulas[0]).startsWith('=');
    const hasFormulaL = rowFormulas[4] && String(rowFormulas[4]).startsWith('=');
    const hasFormulaU = rowFormulas[13] && String(rowFormulas[13]).startsWith('=');

    const formulaUpdates = [];
    if (!hasFormulaH) {
      formulaUpdates.push({
        range: `'${TAB_POST}'!H${targetRow}`,
        values: [[`=(N${targetRow}+O${targetRow}*10+P${targetRow}*30)+(W${targetRow}+X${targetRow}*10+Y${targetRow}*30)+(AF${targetRow}+AG${targetRow}*10+AH${targetRow}*30)+(AO${targetRow}+AP${targetRow}*10+AQ${targetRow}*30)+(AX${targetRow}+AY${targetRow}*10+AZ${targetRow}*30)`]]
      });
    }
    if (!hasFormulaL) {
      formulaUpdates.push({
        range: `'${TAB_POST}'!L${targetRow}`,
        values: [[`=(N${targetRow}+O${targetRow}*10+P${targetRow}*30)*1000`]]
      });
    }
    if (!hasFormulaU) {
      formulaUpdates.push({
        range: `'${TAB_POST}'!U${targetRow}`,
        values: [[`=(W${targetRow}+X${targetRow}*10+Y${targetRow}*30)*1000`]]
      });
    }

    if (formulaUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: formulaUpdates
        }
      });
    }

    results.push({
      row: targetRow,
      group: entry.groupName,
      post1: entry.post1.label,
      post2: entry.post2 ? entry.post2.label : null,
      airDate: formattedAirDate,
      koc: kocInfo.tenKoc
    });
  }

  return results;
}

module.exports = {
  getSheetsClient,
  parsePostUrl,
  lookupKocFromCsc,
  findFirstEmptyRowInPostTab,
  recordPostAir
};
