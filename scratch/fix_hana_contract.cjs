const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const docs = google.docs({ version: 'v1', auth: a });

async function fixContract() {
  const docId = '1rmTgsWuU64Ej_JTPYxpXqv2DcvSImZAG1bfQZ_dDDss';

  const requests = [
    // 1. Sửa Bảng sản phẩm Điều 2: Tên sản phẩm & Bộ sưu tập
    {
      replaceAllText: {
        containsText: { text: 'Đồng hồ SAGA 71959-RGRGTTR-2', matchCase: false },
        replaceText: 'Đồng hồ Saga Lunar Watch 71959-RGRGTTR-2'
      }
    },
    {
      replaceAllText: {
        containsText: { text: '- Bộ sưu tập: Saga Lunar Watch', matchCase: false },
        replaceText: '- Bộ sưu tập: Saga Lunar'
      }
    },
    {
      replaceAllText: {
        containsText: { text: '- Bộ sưu tập: Saga Stella (Saga Lunar)', matchCase: false },
        replaceText: '- Bộ sưu tập: Saga Lunar'
      }
    },
    {
      replaceAllText: {
        containsText: { text: '- Mã sản phẩm: 71959-RGRGTTR-2', matchCase: false },
        replaceText: '- Số hiệu sản phẩm: 71959-RGRGTTR-2'
      }
    },

    // 2. Sửa Kênh trong Bảng Điều 1: Triệt tiêu "Hiền Huỳnh", đưa về "Hana Sắp Cưới", sửa thứ tự Video 1, Video 2, 3 Bộ ảnh
    {
      replaceAllText: {
        containsText: { text: 'Hiền Huỳnh\n(Reup Reels, Story Facebook)', matchCase: false },
        replaceText: 'Hana Sắp Cưới\n(Reup Reels, Story Facebook)'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Hiền Huỳnh(Reup Reels, Story Facebook)', matchCase: false },
        replaceText: 'Hana Sắp Cưới\n(Reup Reels, Story Facebook)'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Hiền Huỳnh\n(Facebook)', matchCase: false },
        replaceText: 'Hana Sắp Cưới\n(Video Tiktok)'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Hiền Huỳnh(Facebook)', matchCase: false },
        replaceText: 'Hana Sắp Cưới\n(Video Tiktok)'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Hana Sắp Cưới\n(Reup Tiktok ảnh)', matchCase: false },
        replaceText: 'Hana Sắp Cưới\n(Reup Reels, Story Facebook)'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Hana Sắp Cưới(Reup Tiktok ảnh)', matchCase: false },
        replaceText: 'Hana Sắp Cưới\n(Reup Reels, Story Facebook)'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Hiền Huỳnh', matchCase: false },
        replaceText: 'Hana Sắp Cưới'
      }
    }
  ];

  console.log(`Executing batchUpdate with ${requests.length} replacement requests...`);
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });
  console.log('Update 1 completed.');
}

fixContract().catch(console.error);
