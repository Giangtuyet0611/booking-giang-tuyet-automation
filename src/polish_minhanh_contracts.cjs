const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const docs = google.docs({ version: 'v1', auth });

async function polish() {
  const last = JSON.parse(fs.readFileSync('d:/Booking/last_contract_result.json'));
  const castId = last.contracts[0].id;
  const gift1Id = last.contracts[1].id;
  const gift2Id = last.contracts[2].id;

  console.log('Polishing Cast doc:', castId);
  await docs.documents.batchUpdate({
    documentId: castId,
    requestBody: {
      requests: [
        {
          replaceAllText: {
            containsText: { text: 'NGUYỄN LÊ MINH ANH (Reup Reels)', matchCase: false },
            replaceText: 'Minh Anh Daily (Video Tiktok, Reup Reels, Story FB, IG)'
          }
        },
        {
          replaceAllText: {
            containsText: {
              text: 'Reup 01 Video lên Reels Facebook khai thác nội dung “Quà tặng 20/10, nàng có thể tự mua quà cho chính mình, vì dù không có ai bên cạnh, nàng vẫn xứng đáng được yêu thương và tỏa sáng. Saga đồng hành cùng nàng qua nhiều phiên bản phong cách” vào ngày 29/10/2026',
              matchCase: false
            },
            replaceText: 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook, Instagram) (60-90s) “Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm” vào ngày 29/10/2026'
          }
        },
        {
          replaceAllText: {
            containsText: { text: '(Bằng chữ: Bốn triệu năm trăm nghìn Việt Nam Đồng)', matchCase: false },
            replaceText: '(Bằng chữ: Bảy triệu bảy trăm bảy mươi bảy nghìn bảy trăm bảy mươi tám đồng. Trong đó: Thuế TNCN (10%) khấu trừ: 777.778 VNĐ; KOC thực nhận: 7.000.000 VNĐ)'
          }
        }
      ]
    }
  });

  console.log('Polishing Gift 1 doc:', gift1Id);
  // Cập nhật điều 1.1 trong Gift 1
  const g1Doc = await docs.documents.get({ documentId: gift1Id });
  let p11_1 = null;
  for (const el of g1Doc.data.body.content) {
    if (el.paragraph) {
      const text = el.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
      if (text.includes('1.1. Thời lượng video:') && text.includes('1.2. Số lượng hình ảnh')) {
        p11_1 = el;
        break;
      }
    }
  }
  if (p11_1) {
    await docs.documents.batchUpdate({
      documentId: gift1Id,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: { startIndex: p11_1.startIndex, endIndex: p11_1.endIndex - 1 }
            }
          },
          {
            insertText: {
              location: { index: p11_1.startIndex },
              text: '1.1. Số lượng hình ảnh/một bộ: Từ 6 đến 8 ảnh. Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ để chọn ảnh phù hợp đăng tải.'
            }
          }
        ]
      }
    });
  }

  console.log('Polishing Gift 2 doc:', gift2Id);
  // Cập nhật điều 1.1 trong Gift 2
  const g2Doc = await docs.documents.get({ documentId: gift2Id });
  let p11_2 = null;
  for (const el of g2Doc.data.body.content) {
    if (el.paragraph) {
      const text = el.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
      if (text.includes('1.1. Thời lượng video:') && text.includes('1.2. Số lượng hình ảnh')) {
        p11_2 = el;
        break;
      }
    }
  }
  if (p11_2) {
    await docs.documents.batchUpdate({
      documentId: gift2Id,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: { startIndex: p11_2.startIndex, endIndex: p11_2.endIndex - 1 }
            }
          },
          {
            insertText: {
              location: { index: p11_2.startIndex },
              text: '1.1. Thời lượng video: 30 giây đến 45 giây (Video Lifestyle)'
            }
          }
        ]
      }
    });
  }

  console.log('Polish completed 100%!');
}

polish().catch(console.error);
