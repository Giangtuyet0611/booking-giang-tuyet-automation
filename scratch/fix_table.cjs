const { google } = require('googleapis');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
auth.setCredentials(credentials);
const docs = google.docs({ version: 'v1', auth });

async function fixTableAnd12() {
  const docId = '1r21XNbqRrQA8--JdtGYytaqgPhVl5GB5ny15qE22JWk';

  const requests = [
    // Điều 1.1 & 1.2
    { replaceAllText: { 
      containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle) 1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false },
      replaceText: '1.1. Thời lượng video: 60 giây đến 90 giây.\n1.2. Số lượng hình ảnh/một bộ: Từ 7 đến 8 ảnh/bộ (Trong đó: ảnh Cô dâu 5-6 ảnh và ảnh Cô dâu cùng chú rể 2-3 ảnh, có 2-3 ảnh cận đồng hồ).'
    } },
    // Dates & quantities in table Điều 1
    { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: '28/11/2026' } },
    { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: '25/11/2026' } },
    { replaceAllText: { containsText: { text: '16/10/2026', matchCase: false }, replaceText: '29/11/2026 - 12/01/2027' } },
    { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: '7-8 ảnh' } },
    // Table Row 1 category: Photo Post (Pre-Wedding 1)
    // Row 1 originally has 'Video Post', let's make it 'Photo Post'
    { replaceAllText: { containsText: { text: 'Video Post\n\nDmy nè\n(Video Tiktok)', matchCase: false }, replaceText: 'Photo Post\n\nDmy nè\n(Tiktok)' } }
  ];

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });
  console.log('Fixed table and 1.1/1.2 successfully!');
}
fixTableAnd12().catch(console.error);

