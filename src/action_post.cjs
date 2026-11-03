const { google } = require('googleapis');
const fs = require('fs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    sheets: google.sheets({ version: 'v4', auth })
  };
}

/**
 * Ghi nhận báo cáo bài đăng (Post Report) vào Sheet "2 SL post & ĐTT - Saga" (Ảnh 3)
 */
async function executeSyncPost(postInfo) {
  const { sheets } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  console.log(`\n============================================================`);
  console.log(`GHI NHẬN BÀI POST CHO KOC: ${postInfo.kocName}`);
  console.log(`============================================================\n`);

  const spreadsheetId = config.SPREADSHEET_REPORT_MATERIALS_ID;
  const tabName = config.TAB_SL_POST || '2 SL post & ĐTT - Saga';

  const row = [
    postInfo.bookingDate || '10/10/2026',
    postInfo.airDate || '15/10/2026',
    postInfo.pic || 'Giáng Tuyết',
    postInfo.kocName,
    postInfo.productUtmLink || postInfo.productName || '',
    postInfo.productValue || '0 đ',
    postInfo.channelGroup || 'Tiktok',
    postInfo.totalEngagement || '0',
    postInfo.postLink1 || '',
    postInfo.caption || '',
    postInfo.seedingCount || '0',
    postInfo.brandValue || '0 đ',
    postInfo.view || '0',
    postInfo.reaction || '0',
    postInfo.comment || '0'
  ];

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${tabName}'!A:O`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row]
    }
  });

  console.log(`-> Ghi nhận bài Post thành công tại: ${appendRes.data.updates.updatedRange}`);
  return { success: true, updatedRange: appendRes.data.updates.updatedRange };
}

module.exports = { executeSyncPost };
