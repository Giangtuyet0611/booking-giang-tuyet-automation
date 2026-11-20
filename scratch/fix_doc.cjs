const { google } = require('googleapis');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
auth.setCredentials(credentials);
const docs = google.docs({ version: 'v1', auth });

async function fix() {
  const docId = '1r21XNbqRrQA8--JdtGYytaqgPhVl5GB5ny15qE22JWk';

  const sow1_3 = [
    'Đăng 01 bộ ảnh Pre Wedding Tiktok (Reup Facebook) (7-8 ảnh) “Ảnh cưới Pre Wedding cô dâu và chú rể cận đồng hồ Saga” vào ngày 25/11/2026',
    'Đăng 01 bộ ảnh Pre Wedding Tiktok (Reup Facebook) (7-8 ảnh) “Ảnh cưới Pre Wedding cô dâu và chú rể cận đồng hồ Saga” vào ngày 28/11/2026',
    'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Kể chuyện hành trình yêu nhau, đánh dấu cột mốc bằng Saga” vào ngày 29/11/2026',
    'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Chia sẻ câu chuyện đeo đồng hồ ngày cưới, review về đồng hồ” vào ngày 10/01/2027 (Gửi kịch bản 15/12/2026; Gửi video demo ngày 05/01/2027)',
    'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Chia sẻ về dự án Cô dâu Saga của brand Saga Vietnam - Tặng đồng hồ cưới miễn phí” vào ngày 12/01/2027 (Gửi kịch bản 18/12/2026; Gửi video demo ngày 08/01/2027)'
  ].join('\n');

  const requests = [
    // 1. SOW 1.3
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: sow1_3 } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Facebook (Reup Facebook, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
    // 2. BST Saga Stella Chance -> Saga Lunar
    { replaceAllText: { containsText: { text: 'Saga Stella Chance', matchCase: false }, replaceText: 'Saga Lunar' } },
    // 3. Tên SP
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 71959-RGRGTTR-2', matchCase: false }, replaceText: 'Đồng hồ Saga Lunar Watch 71959-RGRGTTR-2' } }
  ];

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });
  console.log('Update fix done!');
}
fix().catch(console.error);

