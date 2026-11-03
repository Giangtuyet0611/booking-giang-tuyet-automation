const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(
  keys.client_id,
  keys.client_secret,
  keys.redirect_uris[0]
);
auth.setCredentials(creds);

const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

const targetFolderId = '1rYY4A1CmDyZTjgNYtwtB-bnUvxkAcmda'; // KOC folder
const dnttFolderId = '12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku';   // [6] Kết toán tháng
const templateCastDocId = '19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V';
const templateGiftDocId = '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8';
const templateDnttDocId = '143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg';

function calculateTax(netAmount, isGross = false) {
  if (isGross) {
    const gross = netAmount;
    const tax = Math.round(gross * 0.1);
    const net = gross - tax;
    return { gross, tax, net };
  } else {
    const net = netAmount;
    const gross = Math.round(net / 0.9);
    const tax = gross - net;
    return { gross, tax, net };
  }
}

async function fixAll() {
  console.log('=== BẮT ĐẦU TẠO LẠI TOÀN BỘ HỢP ĐỒNG & PHIẾU ĐNTT CHUẨN XÁC 100% ===\n');

  // 1. Dọn dẹp thư mục KOC
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

  // 2. Dọn dẹp phiếu ĐNTT cũ
  console.log('2. Dọn dẹp các file Phiếu ĐNTT cũ của Minh Anh Daily...');
  const existingDntt = await drive.files.list({
    q: `'${dnttFolderId}' in parents and (name contains 'MINH ANH' or name contains 'Minh Anh') and trashed = false`,
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
  // HỢP ĐỒNG 1: HỢP ĐỒNG THƯƠNG MẠI (CAST 7M NET)
  // SOW duy nhất: 01 Video Tiktok (60-90s) (Reup Reels, Story FB, IG) 29/10/2026
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
  const taxInfo = calculateTax(7000000, false); // Net 7tr -> Gross 7.777.778, Tax 777.778

  const castRequests = [
    // Header & Bên B
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
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Facebook: https://www.facebook.com/profile.php?id=100088058531745', matchCase: false }, replaceText: 'Là đại diện của kênh Tiktok: https://www.tiktok.com/@minhanhdaily\nLà đại diện của kênh Facebook: https://www.facebook.com/minhanhdaily' } },

    // Điều 1 SOW
    { replaceAllText: { containsText: { text: 'thông qua nền tảng Facebook', matchCase: false }, replaceText: 'thông qua nền tảng TikTok, Facebook, Instagram' } },
    { replaceAllText: { containsText: { text: 'Nguyễn Phương Dung (Reup Reels)', matchCase: false }, replaceText: `${kocDisplayName} (Video Tiktok, Reup Reels, Story FB, IG)` } },
    { replaceAllText: { containsText: { text: '05/10/2026', matchCase: false }, replaceText: '29/10/2026' } },

    // Thay thế toàn bộ đoạn văn bản kịch bản cũ trong Điều 1.2
    { replaceAllText: { containsText: { text: 'Reup 01 Video lên Reels Facebook khai thác nội dung “Quà tặng 20/10, nàng có thể tự mua quà cho chính mình, vì dù không có ai bên cạnh, nàng vẫn xứng đáng được yêu thương và tỏa sáng. Saga đồng hành cùng nàng qua nhiều phiên bản phong cách”', matchCase: false }, replaceText: 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook, Instagram) (60-90s) “Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm”' } },

    // Ràng buộc & thời hạn SDHA
    { replaceAllText: { containsText: { text: 'ở Reels Facebook được đăng ở chế độ công khai', matchCase: false }, replaceText: 'ở TikTok, Reels/Story Facebook được đăng ở chế độ công khai' } },
    { replaceAllText: { containsText: { text: 'từ 06/11/2026 đến 06/02/2027', matchCase: false }, replaceText: 'từ 29/10/2026 đến 29/01/2027' } },

    // Điều 2.1 Bảng chi phí & Giá trị HĐ (Gross vs Net)
    { replaceAllText: { containsText: { text: '12.000.000 (Bằng chữ: Mười hai triệu đồng', matchCase: false }, replaceText: `${taxInfo.gross.toLocaleString('vi-VN')} VNĐ (Bằng chữ: Bảy triệu bảy trăm bảy mươi bảy nghìn bảy trăm bảy mươi tám đồng. Trong đó: Thuế TNCN (10%) khấu trừ: ${taxInfo.tax.toLocaleString('vi-VN')} VNĐ; KOC thực nhận: ${taxInfo.net.toLocaleString('vi-VN')} VNĐ)` } },
    { replaceAllText: { containsText: { text: '12.000.000', matchCase: false }, replaceText: taxInfo.gross.toLocaleString('vi-VN') } },
    { replaceAllText: { containsText: { text: 'Booking KOC Nguyễn Phương Dung', matchCase: false }, replaceText: `Booking KOC ${kocDisplayName}` } },
    { replaceAllText: { containsText: { text: 'Reup Reels Facebook', matchCase: false }, replaceText: '01 Video Tiktok (60-90s) (Reup Reels, Story FB, IG)' } },
    { replaceAllText: { containsText: { text: 'Video', matchCase: false }, replaceText: 'Gói' } },

    // Điều 2.3 Các đợt thanh toán
    { replaceAllText: { containsText: { text: '100% Giá trị hợp đồng tương đương: 12.000.000 VNĐ (Bằng chữ: Mười hai triệu đồng chẵn)', matchCase: false }, replaceText: `100% Giá trị hợp đồng tương đương: ${taxInfo.gross.toLocaleString('vi-VN')} VNĐ (Trong đó: Thuế TNCN (10%) khấu trừ: ${taxInfo.tax.toLocaleString('vi-VN')} VNĐ; KOC thực nhận: ${taxInfo.net.toLocaleString('vi-VN')} VNĐ)` } },
    { replaceAllText: { containsText: { text: '6.000.000 VNĐ (Bằng chữ: Sáu triệu đồng chẵn)', matchCase: false }, replaceText: '3.500.000 VNĐ (Bằng chữ: Ba triệu năm trăm nghìn đồng (Thực nhận đợt 1))' } },
    { replaceAllText: { containsText: { text: '6.000.000 VNĐ (Bằng chữ: Sáu triệu đồng)', matchCase: false }, replaceText: '3.500.000 VNĐ (Bằng chữ: Ba triệu năm trăm nghìn đồng (Thực nhận đợt 2))' } },
    { replaceAllText: { containsText: { text: 'video Facebook', matchCase: false }, replaceText: 'video TikTok, Reels Facebook' } },

    // Tài khoản
    { replaceAllText: { containsText: { text: '070198007772', matchCase: false }, replaceText: '0000000000' } },
    { replaceAllText: { containsText: { text: 'Ngân hàng Quân đội (MB) – Chi nhánh Bình Phước', matchCase: false }, replaceText: 'Vietcombank – Chi nhánh TP.HCM' } },

    // Ký tên bên B
    { replaceAllText: { containsText: { text: 'NGUYỄN THỊ PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } }
  ];

  await docs.documents.batchUpdate({
    documentId: castDocId,
    requestBody: { requests: castRequests }
  });
  console.log(`-> Đã hoàn thành HĐ Thương mại (Cast 7M Net): ${castDocId}`);

  // =========================================================================
  // HỢP ĐỒNG 2: HỢP ĐỒNG TẶNG SP 1 (SAGA STELLA CHANCE - 53578-LGSVWH-2, 12.59M)
  // SOW duy nhất: 01 Photo Post Tiktok (Reup FB, IG) (6-8 ảnh) 29/10/2026
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

  // Bước 4.1: Xóa các hàng thừa trong bảng SOW (Table 27 trong template có 8 hàng: Header + 7 hàng dữ liệu)
  // Xóa từ hàng 7 ngược về hàng 2 để chỉ giữ lại Row 0 (Header) và Row 1 (Dữ liệu duy nhất)
  const g1DocInitial = await docs.documents.get({ documentId: gift1DocId });
  let sowTable1 = null;
  for (const el of g1DocInitial.data.body.content) {
    if (el.table && el.table.tableRows.length >= 7) {
      sowTable1 = el;
      break;
    }
  }

  if (sowTable1) {
    while (true) {
      const freshDoc = await docs.documents.get({ documentId: gift1DocId });
      let curTable = null;
      for (const el of freshDoc.data.body.content) {
        if (el.table && el.table.tableRows.length > 2) {
          curTable = el;
          break;
        }
      }
      if (!curTable) break;

      const lastRowIdx = curTable.table.tableRows.length - 1;
      await docs.documents.batchUpdate({
        documentId: gift1DocId,
        requestBody: {
          requests: [{
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: curTable.startIndex },
                rowIndex: lastRowIdx
              }
            }
          }]
        }
      });
    }
    console.log(`-> Đã xóa sạch các hàng thừa trong bảng SOW Gift 1 (chỉ còn đúng 1 hàng dữ liệu)`);
  }

  // Bước 4.2: Cập nhật nội dung văn bản và xóa các đoạn SOW thừa (P 32, P 33)
  const gift1Requests = [
    // Header & Bên B
    { replaceAllText: { containsText: { text: 'ngày 03 tháng 10 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: '123 Đường Nguyễn Văn Linh, Phường Tân Hưng, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: '000000000000' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: 'minhanh.demo@example.com' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: '0900000000' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Tiktok: https://www.tiktok.com/@minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Tiktok: www.tiktok.com/@alice.109_', matchCase: false }, replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Instagram: https://www.instagram.com/minhanhdaily' } },

    // Section 1 Nền tảng
    { replaceAllText: { containsText: { text: 'thông qua nền tảng Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'thông qua nền tảng TikTok, Facebook, Instagram' } },

    // Row 1 của bảng SOW (chuyển thành Photo Post)
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocDisplayName} (Tiktok, Reup FB, IG)` } },
    { replaceAllText: { containsText: { text: 'Video Post', matchCase: false }, replaceText: 'Photo Post' } },
    { replaceAllText: { containsText: { text: '01 video', matchCase: false }, replaceText: '6-8 ảnh' } },
    { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: '29/10/2026' } },

    // Điều 1.1: Chỉ giữ mô tả hình ảnh, bỏ thời lượng video vì hợp đồng này là Photo Post
    { replaceAllText: { containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle) 1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false }, replaceText: '1.1. Số lượng hình ảnh/một bộ: Từ 6 đến 8 ảnh. Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ để chọn ảnh phù hợp đăng tải.' } },

    // Điều 1.3: Thay thế câu SOW 1 bằng đúng câu Photo Post của hợp đồng này
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: 'Đăng 01 photo post Tiktok (Reup Facebook, Instagram) (6-8 ảnh) “đeo Saga đi sự kiện, không gian sang trọng,... (Có ảnh cận đồng hồ)” vào ngày 29/10/2026' } },

    // XÓA SẠCH 2 CÂU SOW THỪA CỦA TEMPLATE (P 32 & P 33)
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: '' } },

    // Điều 1.4 & 1.7
    { replaceAllText: { containsText: { text: 'Trọn đời', matchCase: false }, replaceText: '03 tháng kể từ ngày đăng (từ 29/10/2026 đến 29/01/2027)' } },

    // Điều 2.1: Sản phẩm Saga Stella Chance 12.59M
    { replaceAllText: { containsText: { text: '10.840.000 VNĐ (Mười triệu tám trăm bốn mươi nghìn đồng)', matchCase: false }, replaceText: '12.590.000 VNĐ (Mười hai triệu năm trăm chín mươi nghìn đồng)' } },
    { replaceAllText: { containsText: { text: '10.840.000', matchCase: false }, replaceText: '12.590.000' } },
    { replaceAllText: { containsText: { text: '53585-SVSVWH-2', matchCase: false }, replaceText: '53578-LGSVWH-2' } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53585-SVSVWH-2  - Bộ sưu tập: Saga Stella - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 53578-LGSVWH-2\n- Bộ sưu tập: Saga Stella Chance\n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm' } },

    // Showroom & ngày nhận
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '05/11/2026' } },

    // Ký tên bên B
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } }
  ];

  await docs.documents.batchUpdate({
    documentId: gift1DocId,
    requestBody: { requests: gift1Requests }
  });
  console.log(`-> Đã hoàn thành HĐ Tặng SP 1: ${gift1DocId}`);

  // =========================================================================
  // HỢP ĐỒNG 3: HỢP ĐỒNG TẶNG SP 2 (SAGA STELLA RECTANGLE - 71836-SVSVSV-2, 8.9M)
  // SOW duy nhất: 01 Video Tiktok (30-45s) (Reup Reels FB, IG) 30/10/2026
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

  // Bước 5.1: Xóa các hàng thừa trong bảng SOW (Table 27 trong template có 8 hàng)
  const g2DocInitial = await docs.documents.get({ documentId: gift2DocId });
  let sowTable2 = null;
  for (const el of g2DocInitial.data.body.content) {
    if (el.table && el.table.tableRows.length >= 7) {
      sowTable2 = el;
      break;
    }
  }

  if (sowTable2) {
    while (true) {
      const freshDoc = await docs.documents.get({ documentId: gift2DocId });
      let curTable = null;
      for (const el of freshDoc.data.body.content) {
        if (el.table && el.table.tableRows.length > 2) {
          curTable = el;
          break;
        }
      }
      if (!curTable) break;

      const lastRowIdx = curTable.table.tableRows.length - 1;
      await docs.documents.batchUpdate({
        documentId: gift2DocId,
        requestBody: {
          requests: [{
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: curTable.startIndex },
                rowIndex: lastRowIdx
              }
            }
          }]
        }
      });
    }
    console.log(`-> Đã xóa sạch các hàng thừa trong bảng SOW Gift 2 (chỉ còn đúng 1 hàng dữ liệu)`);
  }

  // Bước 5.2: Cập nhật nội dung văn bản và xóa các đoạn SOW thừa (P 32, P 33)
  const gift2Requests = [
    // Header & Bên B
    { replaceAllText: { containsText: { text: 'ngày 03 tháng 10 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: '123 Đường Nguyễn Văn Linh, Phường Tân Hưng, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: '000000000000' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: 'minhanh.demo@example.com' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: '0900000000' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Tiktok: https://www.tiktok.com/@minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Tiktok: www.tiktok.com/@alice.109_', matchCase: false }, replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/minhanhdaily' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Instagram: https://www.instagram.com/minhanhdaily' } },

    // Section 1 Nền tảng
    { replaceAllText: { containsText: { text: 'thông qua nền tảng Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'thông qua nền tảng TikTok, Facebook, Instagram' } },

    // Row 1 của bảng SOW (Video Lifestyle)
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocDisplayName} (Video Tiktok, Reup Reels FB, IG)` } },
    { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: '30/10/2026' } },

    // Điều 1.1: Chỉ giữ thời lượng video lifestyle 30-45s, bỏ mô tả photo post vì đây là Video Lifestyle
    { replaceAllText: { containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle) 1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false }, replaceText: '1.1. Thời lượng video: 30 giây đến 45 giây (Video Lifestyle)' } },

    // Điều 1.3: Thay thế câu SOW 1 bằng đúng câu Video Lifestyle của hợp đồng này
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: 'Đăng 01 Video Tiktok (Reup Reels Facebook, Instagram) (30-45s) “quay lifestyle cùng đồng hồ” vào ngày 30/10/2026' } },

    // XÓA SẠCH 2 CÂU SOW THỪA CỦA TEMPLATE (P 32 & P 33)
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: '' } },

    // Điều 1.4 & 1.7
    { replaceAllText: { containsText: { text: 'Trọn đời', matchCase: false }, replaceText: '03 tháng kể từ ngày đăng (từ 30/10/2026 đến 30/01/2027)' } },

    // Điều 2.1: Sản phẩm Saga Stella Rectangle 8.9M
    { replaceAllText: { containsText: { text: '10.840.000 VNĐ (Mười triệu tám trăm bốn mươi nghìn đồng)', matchCase: false }, replaceText: '8.900.000 VNĐ (Tám triệu chín trăm nghìn đồng)' } },
    { replaceAllText: { containsText: { text: '10.840.000', matchCase: false }, replaceText: '8.900.000' } },
    { replaceAllText: { containsText: { text: '53585-SVSVWH-2', matchCase: false }, replaceText: '71836-SVSVSV-2' } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53585-SVSVWH-2  - Bộ sưu tập: Saga Stella - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 71836-SVSVSV-2\n- Bộ sưu tập: Saga Stella\n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm' } },

    // Showroom & ngày nhận
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '05/11/2026' } },

    // Ký tên bên B
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } }
  ];

  await docs.documents.batchUpdate({
    documentId: gift2DocId,
    requestBody: { requests: gift2Requests }
  });
  console.log(`-> Đã hoàn thành HĐ Tặng SP 2: ${gift2DocId}`);

  // =========================================================================
  // PHIẾU ĐỀ NGHỊ THANH TOÁN (ĐẶT TÊN CHUẨN YYYY-MM-DD)
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

  console.log('\n=== KẾT QUẢ TẠO LẠI HOÀN TOÀN CHUẨN XÁC ===');
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

fixAll().catch(console.error);
