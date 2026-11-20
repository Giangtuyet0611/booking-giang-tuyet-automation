const { google } = require('googleapis');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
auth.setCredentials(credentials);
const docs = google.docs({ version: 'v1', auth });

async function fix1_1() {
  const docId = '1r21XNbqRrQA8--JdtGYytaqgPhVl5GB5ny15qE22JWk';

  const target = "1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle)\u000b1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.";
  const replacement = "1.1. Thời lượng video: 60 giây đến 90 giây.\n1.2. Số lượng hình ảnh/một bộ: Từ 7 đến 8 ảnh/bộ (Trong đó: ảnh Cô dâu [5-6 ảnh] và ảnh Cô dâu cùng chú rể [2-3 ảnh], có 2-3 ảnh cận đồng hồ).";

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        { replaceAllText: { containsText: { text: target, matchCase: false }, replaceText: replacement } }
      ]
    }
  });
  console.log('1.1 and 1.2 replaced perfectly!');
}
fix1_1().catch(console.error);

