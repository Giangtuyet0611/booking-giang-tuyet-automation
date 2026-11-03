const { google } = require('googleapis');
const fs = require('fs');
const { calculateTax } = require('./utils/tax.util.cjs');
const { formatProductDetails } = require('./utils/sow_formatter.util.cjs');

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

function formatVND(num) {
  return Number(num || 0).toLocaleString('vi-VN');
}

async function recreateClean() {
  const { drive, docs } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  const templateGiftDocId = config.CONTRACT_TEMPLATE_DOC_ID; // 1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8
  const templateCastDocId = config.CONTRACT_TEMPLATE_CAST_DOC_ID; // 19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V
  const templateDnttDocId = config.PAYMENT_REQUEST_TEMPLATE_DOC_ID; // 143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg
  const dnttFolderId = config.PAYMENT_REQUEST_TARGET_FOLDER_ID; // 12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku

  // Thư mục KOC tổng hợp Testing 1
  const targetFolderId = '1rYY4A1CmDyZTjgNYtwtB-bnUvxkAcmda';

  // Dọn dẹp các file HĐ cũ trong thư mục KOC trước
  console.log('1. Dọn dẹp các file cũ trong thư mục KOC...');
  const existingFiles = await drive.files.list({
    q: `'${targetFolderId}' in parents and trashed = false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  if (existingFiles.data.files) {
    for (const f of existingFiles.data.files) {
      console.log(`- Xóa file cũ: ${f.name} (${f.id})`);
      await drive.files.delete({ fileId: f.id, supportsAllDrives: true }).catch(() => {});
    }
  }

  // Dọn dẹp các file Phiếu ĐNTT cũ trong thư mục Kết toán tháng
  console.log('2. Dọn dẹp các file Phiếu ĐNTT cũ của Minh Anh Daily...');
  const existingDntt = await drive.files.list({
    q: `'${dnttFolderId}' in parents and name contains 'MINH ANH DAILY' and trashed = false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  if (existingDntt.data.files) {
    for (const f of existingDntt.data.files) {
      console.log(`- Xóa Phiếu ĐNTT cũ: ${f.name} (${f.id})`);
      await drive.files.delete({ fileId: f.id, supportsAllDrives: true }).catch(() => {});
    }
  }

  const bookingDateIso = '2026-10-28';
  const dayStr = '28';
  const monthStr = '10';
  const yearStr = '2026';
  const kocDisplayName = 'Minh Anh Daily';
  const kocFullName = 'NGUYỄN LÊ MINH ANH';

  // =========================================================================
  // TẠO HỢP ĐỒNG 1: HỢP ĐỒNG THƯƠNG MẠI (TRẢ CAST 7M NET)
  // SOW: 01 Video Tiktok (60-90s) (Reup Reels, Story FB, IG) 29/10/2026
  // =========================================================================
  console.log('\n3. Tạo HĐ Thương mại (Trả cast)...');
  const castDocTitle = `${bookingDateIso} - ${kocDisplayName} - [Booking KOC/KOL] Hợp đồng Thương mại (Trả cast) - Đồng Hồ Hải Triều`;

  const templateStream = await drive.files.get({
    fileId: templateCastDocId,
    alt: 'media',
    supportsAllDrives: true
  }, { responseType: 'stream' });

  const createCastRes = await drive.files.create({
    requestBody: {
      name: castDocTitle,
      mimeType: 'application/vnd.google-apps.document',
      parents: [targetFolderId]
    },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: templateStream.data
    },
    supportsAllDrives: true,
    fields: 'id, name'
  });

  const castDocId = createCastRes.data.id;
  const taxInfo = calculateTax(7000000, false); // Net 7tr
  const halfNet = 3500000;

  const castRequests = [
    { replaceAllText: { containsText: { text: 'ngày 27 tháng 08 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },
    { replaceAllText: { containsText: { text: 'HỘ KINH DOANH NGUYỄN PHƯƠNG DUNG', matchCase: false }, replaceText: `BÀ ${kocFullName}` } },
    { replaceAllText: { containsText: { text: 'Nguyễn Thị Phương Dung', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'NGUYỄN PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'NGUYỄN THỊ  PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'NGUYỄN THỊ PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tổ 3, Ấp 5B, Xã Lộc Tấn, Tỉnh Đồng Nai', matchCase: false }, replaceText: '123 Đường Nguyễn Văn Linh, Phường Tân Hưng, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '070198007772', matchCase: false }, replaceText: '000000000000' } },
    { replaceAllText: { containsText: { text: 'booking.phuongdung@gmail.com', matchCase: false }, replaceText: 'minhanh.demo@example.com' } },
    { replaceAllText: { containsText: { text: '0337674264', matchCase: false }, replaceText: '0900000000' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Facebook: https://www.facebook.com/profile.php?id=100088058531745', matchCase: false }, replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/minhanhdaily' } },

    // Bảng Điều 1 SOW
    { replaceAllText: { containsText: { text: 'Nguyễn Phương Dung (Reup Reels)', matchCase: false }, replaceText: `${kocDisplayName} (Reup Reels, Story FB, IG)` } },
    { replaceAllText: { containsText: { text: '05/10/2026', matchCase: false }, replaceText: '29/10/2026' } },

    // Điều 1.2
    { replaceAllText: { containsText: { text: 'Reup 01 Video lên Reels Facebook khai thác nội dung “Quà tặng 20/10, nàng có thể tự mua quà cho chính mình, vì dù không có ai bên cạnh, nàng vẫn xứng đáng được yêu thương và tỏa sáng. Saga đồng hành cùng nàng qua nhiều phiên bản phong cách” vào ngày 05/10/2026', matchCase: false }, replaceText: 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook, Instagram) (60-90s) “Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm” vào ngày 29/10/2026' } },
    { replaceAllText: { containsText: { text: '1.3. Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: '1.3. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: '1.6. Thời hạn sử dụng hình ảnh: 1 tháng', matchCase: false }, replaceText: '1.6. Thời hạn sử dụng hình ảnh: 03 tháng kể từ ngày đăng (từ 06/11/2026 đến 06/02/2027)' } },

    // Điều 2 & Bảng Chi phí Thuế Net
    { replaceAllText: { containsText: { text: '4.500.000', matchCase: false }, replaceText: formatVND(taxInfo.grossAmount) } },
    { replaceAllText: { containsText: { text: 'Bốn triệu năm trăm nghìn Việt Nam Đồng', matchCase: false }, replaceText: `${formatVND(taxInfo.grossAmount)} VNĐ. Trong đó: Thuế TNCN (10%) khấu trừ: ${formatVND(taxInfo.taxAmount)} VNĐ; KOC thực nhận: ${formatVND(taxInfo.netAmount)} VNĐ` } },
    { replaceAllText: { containsText: { text: '2.250.000', matchCase: false }, replaceText: formatVND(halfNet) } },
    { replaceAllText: { containsText: { text: 'Hai triệu hai trăm năm mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: `${formatVND(halfNet)} VNĐ (Thực nhận đợt 1)` } },
    { replaceAllText: { containsText: { text: 'Hai triệu hai trăm mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: `${formatVND(halfNet)} VNĐ (Thực nhận đợt 2)` } },
    { replaceAllText: { containsText: { text: '922019868', matchCase: false }, replaceText: '0000000000' } },
    { replaceAllText: { containsText: { text: 'Ngân hàng TMCP Quân Đội (MB Bank)', matchCase: false }, replaceText: 'Vietcombank – Chi nhánh TP.HCM' } }
  ];

  await docs.documents.batchUpdate({
    documentId: castDocId,
    requestBody: { requests: castRequests }
  });
  console.log('-> Tạo xong HĐ Cast chuẩn: ID', castDocId);

  // =========================================================================
  // TẠO HỢP ĐỒNG 2: HĐ TẶNG SP 1 (SAGA STELLA CHANCE - 53578-LGSVWH-2, 12.59M)
  // SOW CHỈ CÓ: 01 photo post Tiktok (6-8 ảnh) concept đeo Saga đi sự kiện...
  // =========================================================================
  console.log('\n4. Tạo HĐ Tặng SP 1 (Saga Stella Chance)...');
  const gift1Title = `${bookingDateIso} - ${kocDisplayName} - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - 53578-LGSVWH-2 - Đồng Hồ Hải Triều`;
  const copyGift1Res = await drive.files.copy({
    fileId: templateGiftDocId,
    supportsAllDrives: true,
    requestBody: {
      name: gift1Title,
      parents: [targetFolderId]
    }
  });
  const gift1DocId = copyGift1Res.data.id;

  const sp1Details = formatProductDetails({
    brand: 'Saga',
    code: '53578-LGSVWH-2',
    name: 'Đồng hồ Saga Stella Chance',
    collection: 'Saga Stella Chance',
    origin: 'Mỹ',
    movement: 'Quartz (Pin)',
    warranty: '2 Năm'
  });

  const gift1Requests = [
    { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: '123 Đường Nguyễn Văn Linh, Phường Tân Hưng, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: '000000000000' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: '0900000000' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: 'minhanh.demo@example.com' } },

    // Kênh đại diện: không lặp
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: 'https://www.tiktok.com/@minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'https://www.instagram.com/waananh', matchCase: false }, replaceText: 'https://www.instagram.com/minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'TikTok, Facebook, Instagram' } },

    // SOW BẢNG ĐIỀU 1: HỢP ĐỒNG 1 LÀ PHOTO POST (6-8 ẢNH)
    // Row 1 biến thành Photo Post
    { replaceAllText: { containsText: { text: 'Video Post', matchCase: false }, replaceText: 'Photo Post' } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocDisplayName} (Tiktok)` } },
    { replaceAllText: { containsText: { text: 'waananh  (Reup Reels, Story Instagram)', matchCase: false }, replaceText: `${kocDisplayName} (Reup Reels, Story Facebook, Instagram)` } },
    { replaceAllText: { containsText: { text: '01 video', matchCase: false }, replaceText: '6-8 ảnh' } },
    { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: '29/10/2026' } },

    // Xóa sạch nội dung hàng 2 và hàng 3 trong bảng
    { replaceAllText: { containsText: { text: 'waananh  (Instagram)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Van Anh (alice) (Reup Threads)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Reup Tiktok)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp  (Video Tiktok)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: '16/10/2026', matchCase: false }, replaceText: '' } },

    // Điều 1.1 & 1.2: Chuẩn hóa cho Photo Post
    { replaceAllText: { containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false }, replaceText: 'Từ 6 đến 8 ảnh. Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ để chọn ảnh phù hợp đăng tải.' } },

    // Điều 1.3: CHỈ GIỮ ĐÚNG 01 CÂU PHOTO POST
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026 \n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: 'Đăng 01 photo post Tiktok (Reup Reels, Story Facebook, Instagram) (6-8 ảnh) “đeo Saga đi sự kiện, không gian sang trọng,... (Có ảnh cận đồng hồ)” concept tiệc cuối năm vào ngày 29/10/2026' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026 \n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: '' } },

    // Thời gian hiển thị & SDHA
    { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: '1.7. Thời hạn sử dụng hình ảnh: 03 tháng kể từ ngày đăng (từ 06/11/2026 đến 06/02/2027)' } },

    // Thông tin sản phẩm SP 1
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: '53578-LGSVWH-2' } },
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: 'Đồng hồ Saga Stella Chance' } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2  - Bộ sưu tập: Saga Stella Chance  - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: sp1Details } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: '12.590.000' } },
    { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: 'Mười hai triệu năm trăm chín mươi nghìn Việt Nam Đồng' } },

    // Showroom & ngày nhận
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '05/11/2026' } }
  ];

  await docs.documents.batchUpdate({
    documentId: gift1DocId,
    requestBody: { requests: gift1Requests }
  });

  // Xóa các hàng thừa trong bảng SOW
  const g1Doc = await docs.documents.get({ documentId: gift1DocId });
  let t1 = null;
  for (const el of g1Doc.data.body.content) {
    if (el.table && el.table.tableRows.length >= 4) {
      t1 = el;
      break;
    }
  }
  if (t1) {
    // Xóa các hàng thừa sau hàng 1 (tức là xóa rowIndex 2 liên tục cho đến khi bảng chỉ còn 2 hàng)
    while (true) {
      const freshDoc = await docs.documents.get({ documentId: gift1DocId });
      let freshTable = null;
      for (const el of freshDoc.data.body.content) {
        if (el.table && el.table.tableRows.length > 2) {
          freshTable = el;
          break;
        }
      }
      if (!freshTable) break;

      await docs.documents.batchUpdate({
        documentId: gift1DocId,
        requestBody: {
          requests: [{
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: freshTable.startIndex },
                rowIndex: 2
              }
            }
          }]
        }
      });
    }
    console.log(`-> Đã rút gọn bảng SOW của Gift 1 xuống còn đúng 1 hạng mục Photo Post!`);
  }

  // =========================================================================
  // TẠO HỢP ĐỒNG 3: HĐ TẶNG SP 2 (SAGA STELLA RECTANGLE - 71836-SVSVSV-2, 8.9M)
  // SOW CHỈ CÓ: 01 Video Tiktok (30-45s) quay lifestyle cùng đồng hồ
  // =========================================================================
  console.log('\n5. Tạo HĐ Tặng SP 2 (Saga Stella Rectangle)...');
  const gift2Title = `${bookingDateIso} - ${kocDisplayName} - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - 71836-SVSVSV-2 - Đồng Hồ Hải Triều`;
  const copyGift2Res = await drive.files.copy({
    fileId: templateGiftDocId,
    supportsAllDrives: true,
    requestBody: {
      name: gift2Title,
      parents: [targetFolderId]
    }
  });
  const gift2DocId = copyGift2Res.data.id;

  const sp2Details = formatProductDetails({
    brand: 'Saga',
    code: '71836-SVSVSV-2',
    name: 'Đồng hồ Saga Stella Rectangle',
    collection: 'Saga Stella Rectangle',
    origin: 'Mỹ',
    movement: 'Quartz (Pin)',
    warranty: '2 Năm'
  });

  const gift2Requests = [
    { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: '123 Đường Nguyễn Văn Linh, Phường Tân Hưng, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: '000000000000' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: '0900000000' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: 'minhanh.demo@example.com' } },

    // Kênh đại diện: không lặp
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: 'https://www.tiktok.com/@minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'https://www.instagram.com/waananh', matchCase: false }, replaceText: 'https://www.instagram.com/minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'TikTok, Facebook, Instagram' } },

    // SOW BẢNG ĐIỀU 1: HỢP ĐỒNG 2 LÀ VIDEO LIFESTYLE (30-45S)
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocDisplayName} (Video Tiktok)` } },
    { replaceAllText: { containsText: { text: 'waananh  (Reup Reels, Story Instagram)', matchCase: false }, replaceText: `${kocDisplayName} (Reup Reels Facebook, Instagram)` } },
    { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: '30/10/2026' } },

    // Xóa sạch nội dung hàng 2 và hàng 3 trong bảng
    { replaceAllText: { containsText: { text: 'waananh  (Instagram)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Van Anh (alice) (Reup Threads)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Reup Tiktok)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp  (Video Tiktok)', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: '16/10/2026', matchCase: false }, replaceText: '' } },

    // Điều 1.1 & 1.2: Chuẩn hóa cho Video Lifestyle
    { replaceAllText: { containsText: { text: '60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle)', matchCase: false }, replaceText: '30 giây đến 45 giây (Video Lifestyle)' } },
    { replaceAllText: { containsText: { text: '1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false }, replaceText: '' } },

    // Điều 1.3: CHỈ GIỮ ĐÚNG 01 CÂU VIDEO LIFESTYLE
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026 \n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026 \n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: 'Đăng 01 Video Tiktok (Reup Reels Facebook, Instagram) (30-45s) “Lifestyle cùng đồng hồ” vào ngày 30/10/2026' } },

    // Thời gian hiển thị & SDHA
    { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: '1.7. Thời hạn sử dụng hình ảnh: 03 tháng kể từ ngày đăng (từ 06/11/2026 đến 06/02/2027)' } },

    // Thông tin sản phẩm SP 2
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: '71836-SVSVSV-2' } },
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: 'Đồng hồ Saga Stella Rectangle' } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2  - Bộ sưu tập: Saga Stella Chance  - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: sp2Details } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: '8.900.000' } },
    { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: 'Tám triệu chín trăm nghìn Việt Nam Đồng' } },

    // Showroom & ngày nhận
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '05/11/2026' } }
  ];

  await docs.documents.batchUpdate({
    documentId: gift2DocId,
    requestBody: { requests: gift2Requests }
  });

  // Xóa các hàng thừa trong bảng SOW
  const g2Doc = await docs.documents.get({ documentId: gift2DocId });
  let t2 = null;
  for (const el of g2Doc.data.body.content) {
    if (el.table && el.table.tableRows.length >= 4) {
      t2 = el;
      break;
    }
  }
  if (t2) {
    // Xóa các hàng thừa sau hàng 1 (tức là xóa rowIndex 2 liên tục cho đến khi bảng chỉ còn 2 hàng)
    while (true) {
      const freshDoc = await docs.documents.get({ documentId: gift2DocId });
      let freshTable = null;
      for (const el of freshDoc.data.body.content) {
        if (el.table && el.table.tableRows.length > 2) {
          freshTable = el;
          break;
        }
      }
      if (!freshTable) break;

      await docs.documents.batchUpdate({
        documentId: gift2DocId,
        requestBody: {
          requests: [{
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: freshTable.startIndex },
                rowIndex: 2
              }
            }
          }]
        }
      });
    }
    console.log(`-> Đã rút gọn bảng SOW của Gift 2 xuống còn đúng 1 hạng mục Video Lifestyle!`);
  }

  // =========================================================================
  // TẠO LẠI PHIẾU ĐỀ NGHỊ THANH TOÁN (YYYY-MM-DD CHUẨN)
  // =========================================================================
  console.log('\n6. Tạo 2 Phiếu ĐNTT với tên YYYY-MM-DD chuẩn...');
  const dntt1Title = `${bookingDateIso} - Phiếu đề nghị thanh toán (Đợt 1 - 50% sau duyệt kịch bản) - Team Social - ${kocFullName}`;
  const dntt2Title = `${bookingDateIso} - Phiếu đề nghị thanh toán (Đợt 2 - 50% sau nghiệm thu) - Team Social - ${kocFullName}`;

  // Đợt 1
  const copyDntt1 = await drive.files.copy({
    fileId: templateDnttDocId,
    supportsAllDrives: true,
    requestBody: { name: dntt1Title, parents: [dnttFolderId] }
  });
  const dntt1Id = copyDntt1.data.id;
  await docs.documents.batchUpdate({
    documentId: dntt1Id,
    requestBody: {
      requests: [
        { replaceAllText: { containsText: { text: 'Nguyễn Thị Thảo Hương', matchCase: false }, replaceText: kocFullName } },
        { replaceAllText: { containsText: { text: '106828683333 - Ngân hàng Thương mại Cổ phần Công Thương Việt Nam (VietinBank) - Chi nhánh 2 TP.HCM', matchCase: false }, replaceText: '0000000000 - Vietcombank – Chi nhánh TP.HCM' } },
        { replaceAllText: { containsText: { text: '4.000.000 VNĐ', matchCase: false }, replaceText: '3.500.000 VNĐ' } },
        { replaceAllText: { containsText: { text: '21/10/2026', matchCase: false }, replaceText: '28/10/2026' } },
        { replaceAllText: { containsText: { text: 'Chi phí booking KOC quay/chụp sản phẩm đồng hồ', matchCase: false }, replaceText: 'Chi phí booking KOC quay/chụp sản phẩm đồng hồ Saga (Đợt 1 - 50% sau duyệt kịch bản)' } }
      ]
    }
  });

  // Đợt 2
  const copyDntt2 = await drive.files.copy({
    fileId: templateDnttDocId,
    supportsAllDrives: true,
    requestBody: { name: dntt2Title, parents: [dnttFolderId] }
  });
  const dntt2Id = copyDntt2.data.id;
  await docs.documents.batchUpdate({
    documentId: dntt2Id,
    requestBody: {
      requests: [
        { replaceAllText: { containsText: { text: 'Nguyễn Thị Thảo Hương', matchCase: false }, replaceText: kocFullName } },
        { replaceAllText: { containsText: { text: '106828683333 - Ngân hàng Thương mại Cổ phần Công Thương Việt Nam (VietinBank) - Chi nhánh 2 TP.HCM', matchCase: false }, replaceText: '0000000000 - Vietcombank – Chi nhánh TP.HCM' } },
        { replaceAllText: { containsText: { text: '4.000.000 VNĐ', matchCase: false }, replaceText: '3.500.000 VNĐ' } },
        { replaceAllText: { containsText: { text: '21/10/2026', matchCase: false }, replaceText: '28/10/2026' } },
        { replaceAllText: { containsText: { text: 'Chi phí booking KOC quay/chụp sản phẩm đồng hồ', matchCase: false }, replaceText: 'Chi phí booking KOC quay/chụp sản phẩm đồng hồ Saga (Đợt 2 - 50% sau nghiệm thu)' } }
      ]
    }
  });

  console.log('\n=== KẾT QUẢ TẠO LẠI HOÀN HẢO ===');
  console.log('1. HĐ Trả Cast:', `https://docs.google.com/document/d/${castDocId}/edit`);
  console.log('2. HĐ Tặng SP 1:', `https://docs.google.com/document/d/${gift1DocId}/edit`);
  console.log('3. HĐ Tặng SP 2:', `https://docs.google.com/document/d/${gift2DocId}/edit`);
  console.log('4. Phiếu ĐNTT Đợt 1 (YYYY-MM-DD):', `https://docs.google.com/document/d/${dntt1Id}/edit`);
  console.log('5. Phiếu ĐNTT Đợt 2 (YYYY-MM-DD):', `https://docs.google.com/document/d/${dntt2Id}/edit`);

  const results = {
    contracts: [
      { type: 'Cast', id: castDocId, title: castDocTitle, url: `https://docs.google.com/document/d/${castDocId}/edit`, sow: '01 Video Tiktok (60-90s) Storytelling' },
      { type: 'Gift_1', id: gift1DocId, title: gift1Title, url: `https://docs.google.com/document/d/${gift1DocId}/edit`, sow: '01 photo post Tiktok (6-8 ảnh)' },
      { type: 'Gift_2', id: gift2DocId, title: gift2Title, url: `https://docs.google.com/document/d/${gift2DocId}/edit`, sow: '01 Video Tiktok (30-45s) Lifestyle' }
    ],
    dntt: [
      { phase: 'Đợt 1', id: dntt1Id, title: dntt1Title, url: `https://docs.google.com/document/d/${dntt1Id}/edit` },
      { phase: 'Đợt 2', id: dntt2Id, title: dntt2Title, url: `https://docs.google.com/document/d/${dntt2Id}/edit` }
    ]
  };

  fs.writeFileSync('d:/Booking/last_contract_result.json', JSON.stringify(results, null, 2), 'utf8');
}

recreateClean().catch(console.error);
