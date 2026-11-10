const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const docs = google.docs({ version: 'v1', auth });
const DOCUMENT_ID = '1rmTgsWuU64Ej_JTPYxpXqv2DcvSImZAG1bfQZ_dDDss';

async function updateDoc() {
  const requests = [
    // 1. Table SOW: Update Table 0 rows
    // Row 3: Hiền Huỳnh\n(Facebook) -> Hana Sắp Cưới\n(Tiktok ảnh)
    {
      replaceAllText: {
        containsText: { matchCase: true, text: 'Hiền Huỳnh\n(Facebook)' },
        replaceText: 'Hana Sắp Cưới\n(Tiktok ảnh)'
      }
    },
    // Row 4: Hana Sắp Cưới\n(Reup Tiktok ảnh) -> Hana Sắp Cưới\n(Reup Facebook)
    {
      replaceAllText: {
        containsText: { matchCase: true, text: 'Hana Sắp Cưới\n(Reup Tiktok ảnh)' },
        replaceText: 'Hana Sắp Cưới\n(Reup Facebook)'
      }
    },
    // Row 2 and 6: Hiền Huỳnh\n(Reup Reels, Story Facebook) -> Hana Sắp Cưới\n(Reup Reels, Story Facebook)
    {
      replaceAllText: {
        containsText: { matchCase: true, text: 'Hiền Huỳnh\n(Reup Reels, Story Facebook)' },
        replaceText: 'Hana Sắp Cưới\n(Reup Reels, Story Facebook)'
      }
    },
    // Also if any leftover "Hiền Huỳnh" in table
    {
      replaceAllText: {
        containsText: { matchCase: true, text: 'Hiền Huỳnh' },
        replaceText: 'Hana Sắp Cưới'
      }
    },

    // 2. Table Product:
    // Tên sản phẩm: Đồng hồ SAGA 71959-RGRGTTR-2 -> Đồng hồ Saga Lunar Watch 71959-RGRGTTR-2
    {
      replaceAllText: {
        containsText: { matchCase: true, text: 'Đồng hồ SAGA 71959-RGRGTTR-2' },
        replaceText: 'Đồng hồ Saga Lunar Watch 71959-RGRGTTR-2'
      }
    },
    // Bộ sưu tập: Saga Lunar Watch -> Bộ sưu tập: Saga Lunar
    {
      replaceAllText: {
        containsText: { matchCase: true, text: 'Bộ sưu tập: Saga Lunar Watch' },
        replaceText: 'Bộ sưu tập: Saga Lunar'
      }
    },
    // Rule 5: Số hiệu sản phẩm
    {
      replaceAllText: {
        containsText: { matchCase: true, text: 'Mã sản phẩm: 71959-RGRGTTR-2' },
        replaceText: 'Số hiệu sản phẩm: 71959-RGRGTTR-2'
      }
    },

    // 3. Showroom address in Điều 2.2
    {
      replaceAllText: {
        containsText: { matchCase: true, text: '83 Dương Bá Trạc, Phường 1, Quận 8, TP.HCM' },
        replaceText: '81 Dương Bá Trạc, Phường Chánh Hưng, TP.HCM'
      }
    }
  ];

  const res = await docs.documents.batchUpdate({
    documentId: DOCUMENT_ID,
    requestBody: { requests }
  });

  console.log('Batch update completed successfully:', JSON.stringify(res.data));
}

updateDoc().catch(console.error);
