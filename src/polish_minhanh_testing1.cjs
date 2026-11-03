const { google } = require('googleapis');
const fs = require('fs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    docs: google.docs({ version: 'v1', auth })
  };
}

async function polish() {
  const { docs } = getClients();

  // 1. Polish Cast Doc
  const castDocId = '1J0Cx9ERxGHmhamNn4Mys6uxEgdxNGkAghE9ciz-bStc';
  await docs.documents.batchUpdate({
    documentId: castDocId,
    requestBody: {
      requests: [
        {
          replaceAllText: {
            containsText: { text: 'Là đại diện của kênh Facebook: https://www.tiktok.com/@minhanhdaily', matchCase: false },
            replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/minhanhdaily'
          }
        },
        {
          replaceAllText: {
            containsText: { text: '3.500.000 VNĐ (Thực nhận đợt 1)) trong vòng 07 (bảy) ngày làm việc kể từ ngày hai bên nghiệm thu công việc.', matchCase: false },
            replaceText: '3.500.000 VNĐ (Thực nhận đợt 2)) trong vòng 07 (bảy) ngày làm việc kể từ ngày hai bên nghiệm thu công việc.'
          }
        }
      ]
    }
  });
  console.log('Polished Cast Doc.');

  // 2. Polish Gift Doc 1 & Gift Doc 2
  const giftDocIds = [
    '1FyPHbHLzghKLAO1EDKTvvlWr_00yqtOGFLu--4P6ATs',
    '1qZnn2Y3UMkFiED2gduwxrVnOyvcaFhFrHWS2tZs0LFI'
  ];

  for (const gId of giftDocIds) {
    await docs.documents.batchUpdate({
      documentId: gId,
      requestBody: {
        requests: [
          // Cập nhật ngày trong bảng SOW
          { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: '29/10/2026' } },
          { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: '29/10/2026' } },
          { replaceAllText: { containsText: { text: '16/10/2026', matchCase: false }, replaceText: '30/10/2026' } },
          // Cập nhật số lượng ảnh trong bảng
          { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: '6-8 ảnh' } },
          // Reup FB, IG
          { replaceAllText: { containsText: { text: 'Reup Reels, Story Instagram', matchCase: false }, replaceText: 'Reup Reels, Story FB, IG' } }
        ]
      }
    });
    console.log(`Polished Gift Doc ${gId}.`);
  }
}

polish().catch(console.error);
