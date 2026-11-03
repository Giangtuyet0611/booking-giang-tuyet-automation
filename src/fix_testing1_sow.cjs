const { google } = require('googleapis');
const fs = require('fs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    drive: google.drive({ version: 'v3', auth }),
    docs: google.docs({ version: 'v1', auth })
  };
}

async function fixTesting1SowAndDates() {
  const { drive, docs } = getClients();

  console.log('=== 1. ĐỔI TÊN CÁC FILE PHIẾU ĐNTT SANG YYYY-MM-DD ===');
  const dnttDoc1Id = '1Y-pcNyFPTxayUdOOPBP26Ov4yO828swNximRhJO3cOw';
  const dnttDoc2Id = '11ClzgHVmV1_lgR_pwoODhF6b2w-uEgN8gXYxY_O6rxE';

  const newTitle1 = '2026-10-28 - Phiếu đề nghị thanh toán (Đợt 1 - 50% sau duyệt kịch bản) - Team Social - MINH ANH DAILY';
  const newTitle2 = '2026-10-28 - Phiếu đề nghị thanh toán (Đợt 2 - 50% sau nghiệm thu) - Team Social - MINH ANH DAILY';

  await drive.files.update({
    fileId: dnttDoc1Id,
    requestBody: { name: newTitle1 },
    supportsAllDrives: true
  });
  console.log('-> Đã đổi tên Phiếu ĐNTT 1:', newTitle1);

  await drive.files.update({
    fileId: dnttDoc2Id,
    requestBody: { name: newTitle2 },
    supportsAllDrives: true
  });
  console.log('-> Đã đổi tên Phiếu ĐNTT 2:', newTitle2);

  // =========================================================================
  // 2. CHUẨN HÓA SOW CHO HĐ TẶNG SP 1 (SAGA STELLA CHANCE - 53578-LGSVWH-2)
  // HĐ này CHỈ CÓ SOW: 01 photo post Tiktok (6-8 ảnh)
  // =========================================================================
  console.log('\n=== 2. CHUẨN HÓA SOW CHO HĐ TẶNG SP 1 (CHỈ CHỨA PHOTO POST) ===');
  const gift1DocId = '1FyPHbHLzghKLAO1EDKTvvlWr_00yqtOGFLu--4P6ATs';

  // Lấy cấu trúc doc để tìm table Điều 1
  const doc1Res = await docs.documents.get({ documentId: gift1DocId });
  let table1 = null;
  for (const el of doc1Res.data.body.content) {
    if (el.table && el.table.tableRows.length >= 4) {
      table1 = el;
      break;
    }
  }

  // Cập nhật text trong Gift 1:
  // - Bảng Điều 1: Dòng 1 thành Photo Post, 6-8 ảnh, ngày 29/10/2026
  // - Điều 1.3: CHỈ GIỮ 01 câu Photo Post, xóa 2 câu Video
  // - Điều 1.1 & 1.2: Chuẩn hóa cho Photo Post
  const gift1Requests = [
    // Điều 1.3: Xóa câu video 1 và video 2
    {
      replaceAllText: {
        containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook, Instagram) (60-90s) “Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm” vào ngày 29/10/2026\n', matchCase: false },
        replaceText: ''
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels Facebook, Instagram) (30-45s) “Lifestyle cùng đồng hồ” vào ngày 30/10/2026\n', matchCase: false },
        replaceText: ''
      }
    },
    // Điều 1.1: Bỏ phần thời lượng video
    {
      replaceAllText: {
        containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle) ', matchCase: false },
        replaceText: ''
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false },
        replaceText: 'Từ 6 đến 8 ảnh. Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ để chọn ảnh phù hợp đăng tải.'
      }
    },
    // Bảng Điều 1: Dòng 1 chuyển thành Photo Post
    {
      replaceAllText: {
        containsText: { text: 'Video Post', matchCase: false },
        replaceText: 'Photo Post'
      }
    },
    {
      replaceAllText: {
        containsText: { text: '01 video', matchCase: false },
        replaceText: '6-8 ảnh'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Minh Anh Daily (Video Tiktok)', matchCase: false },
        replaceText: 'Minh Anh Daily (Tiktok)'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Minh Anh Daily  (Reup Reels, Story FB, IG)', matchCase: false },
        replaceText: 'Minh Anh Daily (Reup Reels, Story Facebook, Instagram)'
      }
    }
  ];

  await docs.documents.batchUpdate({
    documentId: gift1DocId,
    requestBody: { requests: gift1Requests }
  });

  // Sau đó xóa các hàng 3 và 2 của bảng Điều 1 để bảng CHỈ CÒN ĐÚNG 1 HÀNG SOW
  const doc1AfterRes = await docs.documents.get({ documentId: gift1DocId });
  let table1After = null;
  for (const el of doc1AfterRes.data.body.content) {
    if (el.table && el.table.tableRows.length >= 4) {
      table1After = el;
      break;
    }
  }

  if (table1After) {
    console.log(`Xóa các dòng thừa (hàng 3, hàng 2) trong bảng SOW của Gift 1 (bảng có ${table1After.table.tableRows.length} hàng)...`);
    await docs.documents.batchUpdate({
      documentId: gift1DocId,
      requestBody: {
        requests: [
          {
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: table1After.startIndex },
                rowIndex: 3
              }
            }
          },
          {
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: table1After.startIndex },
                rowIndex: 2
              }
            }
          }
        ]
      }
    });
    console.log('-> Đã xóa sạch các dòng thừa trong bảng SOW của Gift 1!');
  }

  // =========================================================================
  // 3. CHUẨN HÓA SOW CHO HĐ TẶNG SP 2 (SAGA STELLA RECTANGLE - 71836-SVSVSV-2)
  // HĐ này CHỈ CÓ SOW: 01 Video Tiktok (30-45s) Lifestyle
  // =========================================================================
  console.log('\n=== 3. CHUẨN HÓA SOW CHO HĐ TẶNG SP 2 (CHỈ CHỨA VIDEO LIFESTYLE) ===');
  const gift2DocId = '1qZnn2Y3UMkFiED2gduwxrVnOyvcaFhFrHWS2tZs0LFI';

  const gift2Requests = [
    // Điều 1.3: Xóa câu video storytelling và câu photo post
    {
      replaceAllText: {
        containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook, Instagram) (60-90s) “Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm” vào ngày 29/10/2026\n', matchCase: false },
        replaceText: ''
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Đăng 01 photo post Tiktok (Reup Reels, Story Facebook, Instagram) (6-8 ảnh) “đeo Saga đi sự kiện, không gian sang trọng,... (Có ảnh cận đồng hồ)” concept tiệc cuối năm vào ngày 29/10/2026\n', matchCase: false },
        replaceText: ''
      }
    },
    // Điều 1.1: Chuẩn hóa cho Video Lifestyle
    {
      replaceAllText: {
        containsText: { text: '60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle)', matchCase: false },
        replaceText: '30 giây đến 45 giây (Video Lifestyle)'
      }
    },
    {
      replaceAllText: {
        containsText: { text: '1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false },
        replaceText: ''
      }
    },
    // Bảng Điều 1: Dòng 1 cập nhật ngày 30/10/2026
    {
      replaceAllText: {
        containsText: { text: '29/10/2026', matchCase: false },
        replaceText: '30/10/2026'
      }
    },
    {
      replaceAllText: {
        containsText: { text: 'Minh Anh Daily  (Reup Reels, Story FB, IG)', matchCase: false },
        replaceText: 'Minh Anh Daily (Reup Reels Facebook, Instagram)'
      }
    }
  ];

  await docs.documents.batchUpdate({
    documentId: gift2DocId,
    requestBody: { requests: gift2Requests }
  });

  // Sau đó xóa các hàng 3 và 2 của bảng Điều 1 để bảng CHỈ CÒN ĐÚNG 1 HÀNG SOW
  const doc2AfterRes = await docs.documents.get({ documentId: gift2DocId });
  let table2After = null;
  for (const el of doc2AfterRes.data.body.content) {
    if (el.table && el.table.tableRows.length >= 4) {
      table2After = el;
      break;
    }
  }

  if (table2After) {
    console.log(`Xóa các dòng thừa (hàng 3, hàng 2) trong bảng SOW của Gift 2 (bảng có ${table2After.table.tableRows.length} hàng)...`);
    await docs.documents.batchUpdate({
      documentId: gift2DocId,
      requestBody: {
        requests: [
          {
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: table2After.startIndex },
                rowIndex: 3
              }
            }
          },
          {
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: table2After.startIndex },
                rowIndex: 2
              }
            }
          }
        ]
      }
    });
    console.log('-> Đã xóa sạch các dòng thừa trong bảng SOW của Gift 2!');
  }

  // =========================================================================
  // 4. CHUẨN HÓA SOW CHO HĐ THƯƠNG MẠI (TRẢ CAST)
  // HĐ này CHỈ CÓ SOW: 01 Video Tiktok (60-90s) Storytelling
  // =========================================================================
  console.log('\n=== 4. CHUẨN HÓA SOW CHO HĐ CAST (CHỈ CHỨA VIDEO STORYTELLING) ===');
  const castDocId = '1J0Cx9ERxGHmhamNn4Mys6uxEgdxNGkAghE9ciz-bStc';
  await docs.documents.batchUpdate({
    documentId: castDocId,
    requestBody: {
      requests: [
        {
          replaceAllText: {
            containsText: { text: 'NGUYỄN LÊ MINH ANH (Reup Reels)', matchCase: false },
            replaceText: 'Minh Anh Daily (Reup Reels, Story FB, IG)'
          }
        },
        {
          replaceAllText: {
            containsText: { text: '28/10/2026', matchCase: false },
            replaceText: '29/10/2026'
          }
        }
      ]
    }
  });

  console.log('\n=== HOÀN TẤT CHUẨN HÓA 100% SOW VÀ TÊN FILE YYYY-MM-DD ===');
}

fixTesting1SowAndDates().catch(console.error);
