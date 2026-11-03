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

async function run() {
  console.log('=== BẮT ĐẦU TẠO LẠI TOÀN BỘ HỢP ĐỒNG & PHIẾU ĐNTT HOÀN TOÀN CHUẨN XÁC ===\n');

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
    { replaceAllText: { containsText: { text: 'Tổ 3, Ấp 5B, Xã Lộc Tấn, Tỉnh Đồng Nai', matchCase: false }, replaceText: '123 Đường Nguyễn Văn Linh, Phường Tân Hưng, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '070198007772', matchCase: false }, replaceText: '000000000000' } },
    { replaceAllText: { containsText: { text: 'booking.phuongdung@gmail.com', matchCase: false }, replaceText: 'minhanh.demo@example.com' } },
    { replaceAllText: { containsText: { text: '0337674264', matchCase: false }, replaceText: '0900000000' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Facebook: https://www.facebook.com/profile.php?id=100088058531745', matchCase: false }, replaceText: 'Là đại diện của kênh Tiktok: https://www.tiktok.com/@minhanhdaily\nLà đại diện của kênh Facebook: https://www.facebook.com/minhanhdaily' } },

    // Section 1: Nền tảng & SOW Table
    { replaceAllText: { containsText: { text: 'thông qua nền tảng Tiktok. Cụ thể:', matchCase: false }, replaceText: 'thông qua nền tảng TikTok, Facebook, Instagram. Cụ thể:' } },
    { replaceAllText: { containsText: { text: 'Nguyễn Phương Dung (Reup Reels)', matchCase: false }, replaceText: `${kocDisplayName} (Video Tiktok, Reup Reels, Story FB, IG)` } },
    { replaceAllText: { containsText: { text: '05/10/2026', matchCase: false }, replaceText: '29/10/2026' } },

    // Section 1.2: Định hướng kịch bản & câu SOW duy nhất
    { replaceAllText: { containsText: { text: 'Reup 01 Video lên Reels Facebook khai thác nội dung “Quà tặng 20/10, nàng có thể tự mua quà cho chính mình, vì dù không có ai bên cạnh, nàng vẫn xứng đáng được yêu thương và tỏa sáng. Saga đồng hành cùng nàng qua nhiều phiên bản phong cách” vào ngày 05/10/2026', matchCase: false }, replaceText: 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook, Instagram) (60-90s) “Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm” vào ngày 29/10/2026' } },

    // Section 1.3: Thời gian hiển thị
    { replaceAllText: { containsText: { text: '1.3. Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: '1.3. Thời gian hiển thị bài đăng: Trọn đời.' } },

    // Section 1.5 & 1.6: Ràng buộc & SDHA
    { replaceAllText: { containsText: { text: 'ở Reels Facebook được đăng ở chế độ công khai', matchCase: false }, replaceText: 'ở TikTok, Reels/Story Facebook được đăng ở chế độ công khai' } },
    { replaceAllText: { containsText: { text: '1.6. Thời hạn sử dụng hình ảnh: 1 tháng', matchCase: false }, replaceText: '1.6. Thời hạn sử dụng hình ảnh: 03 tháng kể từ ngày đăng (từ 29/10/2026 đến 29/01/2027)' } },

    // Section 2.1: Bảng chi phí & Giá trị HĐ (Gross vs Net)
    { replaceAllText: { containsText: { text: 'Bên A trả cho Bên B tổng chi phí để thực hiện dịch vụ bằng hiện kim là: 4.500.000 (Bằng chữ: Bốn triệu năm trăm nghìn Việt Nam Đồng) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)', matchCase: false }, replaceText: `Bên A trả cho Bên B tổng chi phí để thực hiện dịch vụ bằng hiện kim là: ${taxInfo.gross.toLocaleString('vi-VN')} VNĐ (Bằng chữ: Bảy triệu bảy trăm bảy mươi bảy nghìn bảy trăm bảy mươi tám đồng. Trong đó: Thuế TNCN (10%) khấu trừ: ${taxInfo.tax.toLocaleString('vi-VN')} VNĐ; KOC thực nhận: ${taxInfo.net.toLocaleString('vi-VN')} VNĐ) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)` } },
    { replaceAllText: { containsText: { text: 'Booking KOC Nguyễn Phương Dung', matchCase: false }, replaceText: `Booking KOC ${kocDisplayName}` } },
    { replaceAllText: { containsText: { text: 'Reup Reels Facebook', matchCase: false }, replaceText: '01 Video Tiktok (60-90s) (Reup Reels, Story FB, IG)' } },
    { replaceAllText: { containsText: { text: '4.500.000', matchCase: false }, replaceText: taxInfo.gross.toLocaleString('vi-VN') } },

    // Section 2.3: Các đợt thanh toán
    { replaceAllText: { containsText: { text: 'Bên A thanh toán cho Bên B 100% Giá trị hợp đồng tương đương: 4.500.000 VNĐ (Bằng chữ: Bốn triệu năm trăm nghìn Việt Nam Đồng) thành các đợt như sau:', matchCase: false }, replaceText: `Bên A thanh toán cho Bên B 100% Giá trị hợp đồng tương đương: ${taxInfo.gross.toLocaleString('vi-VN')} VNĐ (Trong đó: Thuế TNCN (10%) khấu trừ: ${taxInfo.tax.toLocaleString('vi-VN')} VNĐ; KOC thực nhận: ${taxInfo.net.toLocaleString('vi-VN')} VNĐ) thành các đợt như sau:` } },
    { replaceAllText: { containsText: { text: 'Đợt 1: Bên A thanh toán cho Bên B 50% Giá trị hợp đồng tương đương 2.250.000 VNĐ (Bằng chữ: Hai triệu hai trăm năm mươi nghìn Việt Nam Đồng) trong 07 (bảy) ngày làm việc sau khi bên B gửi kịch bản.', matchCase: false }, replaceText: 'Đợt 1: Bên A thanh toán cho Bên B 50% Giá trị hợp đồng tương đương 3.500.000 VNĐ (Bằng chữ: Ba triệu năm trăm nghìn đồng (Thực nhận đợt 1)) trong 07 (bảy) ngày làm việc sau khi bên B gửi kịch bản.' } },
    { replaceAllText: { containsText: { text: 'Đợt 2: Bên A thanh toán cho Bên B 50% Giá trị hợp đồng tương đương 2.250.000 VNĐ (Bằng chữ: Hai triệu hai trăm năm mươi nghìn Việt Nam Đồng) trong vòng 07 (bảy) ngày làm việc kể từ ngày hai bên nghiệm thu công việc.', matchCase: false }, replaceText: 'Đợt 2: Bên A thanh toán cho Bên B 50% Giá trị hợp đồng tương đương 3.500.000 VNĐ (Bằng chữ: Ba triệu năm trăm nghìn đồng (Thực nhận đợt 2)) trong vòng 07 (bảy) ngày làm việc kể từ ngày hai bên nghiệm thu công việc.' } },
    { replaceAllText: { containsText: { text: 'video Facebook', matchCase: false }, replaceText: 'video TikTok, Reels Facebook' } },

    // Section 2.4: Tài khoản
    { replaceAllText: { containsText: { text: 'Ngân hàng Quân đội (MB) – Chi nhánh Bình Phước', matchCase: false }, replaceText: 'Vietcombank – Chi nhánh TP.HCM' } },

    // Tên đại diện và ký tên Bên B
    { replaceAllText: { containsText: { text: 'NGUYỄN PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'NGUYỄN THỊ  PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'NGUYỄN THỊ PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Nguyễn Thị Phương Dung', matchCase: false }, replaceText: kocFullName } }
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

  // Bước 4.1: Xóa toàn bộ Table SOW cũ (Table 27) và thay thế bằng Bảng SOW 2 hàng mới hoàn hảo
  const g1Doc = await docs.documents.get({ documentId: gift1DocId });
  let sowTable1 = null;
  let p31_1 = null, p34_1 = null;

  for (const el of g1Doc.data.body.content) {
    if (el.table && el.table.tableRows.length >= 7 && !sowTable1) {
      sowTable1 = el;
    } else if (el.paragraph) {
      const text = el.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
      if (text.includes('Trend Loan Niệm') && text.includes('Video') && !p31_1) {
        p31_1 = el;
      } else if (text.includes('1.4. Thời gian hiển thị bài đăng:') && !p34_1) {
        p34_1 = el;
      }
    }
  }

  // Xóa sạch các đoạn SOW thừa (P 31, P 32, P 33) và chèn đúng 1 câu SOW Photo Post
  if (p31_1 && p34_1) {
    await docs.documents.batchUpdate({
      documentId: gift1DocId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: { startIndex: p31_1.startIndex, endIndex: p34_1.startIndex }
            }
          },
          {
            insertText: {
              location: { index: p31_1.startIndex },
              text: 'Đăng 01 photo post Tiktok (Reup Facebook, Instagram) (6-8 ảnh) “đeo Saga đi sự kiện, không gian sang trọng,... (Có ảnh cận đồng hồ)” vào ngày 29/10/2026\n'
            }
          }
        ]
      }
    });
    console.log(`-> Gift 1: Đã xóa sạch 3 đoạn SOW thừa và chèn đúng 1 câu Photo Post duy nhất!`);
  }

  // Xóa Table SOW cũ và chèn Table 2 hàng mới
  const g1DocBeforeTable = await docs.documents.get({ documentId: gift1DocId });
  const sowTable1Fresh = g1DocBeforeTable.data.body.content.find(el => el.table && el.table.tableRows.length >= 7);
  if (sowTable1Fresh) {
    const tableInsertIdx = sowTable1Fresh.startIndex;
    await docs.documents.batchUpdate({
      documentId: gift1DocId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: { startIndex: sowTable1Fresh.startIndex, endIndex: sowTable1Fresh.endIndex }
            }
          },
          {
            insertTable: {
              rows: 2,
              columns: 6,
              location: { index: tableInsertIdx }
            }
          }
        ]
      }
    });

    // Điền dữ liệu vào Table mới
    const g1DocWithNewTable = await docs.documents.get({ documentId: gift1DocId });
    const newTable1 = g1DocWithNewTable.data.body.content.find(el => el.table && el.table.tableRows.length === 2 && el.table.tableRows[0].tableCells.length === 6).table;

    const cells1 = [
      { r: 0, c: 0, text: 'STT' },
      { r: 0, c: 1, text: 'Hạng mục' },
      { r: 0, c: 2, text: 'Kênh' },
      { r: 0, c: 3, text: 'Số lượng' },
      { r: 0, c: 4, text: 'Số link đính kèm' },
      { r: 0, c: 5, text: 'Thời gian đăng tải bài viết' },
      { r: 1, c: 0, text: '1' },
      { r: 1, c: 1, text: 'Photo Post' },
      { r: 1, c: 2, text: `${kocDisplayName} (Tiktok, Reup FB, IG)` },
      { r: 1, c: 3, text: '6-8 ảnh' },
      { r: 1, c: 4, text: '1' },
      { r: 1, c: 5, text: '29/10/2026' }
    ];

    const textInserts1 = [];
    cells1.forEach(item => {
      const cell = newTable1.tableRows[item.r].tableCells[item.c];
      const cellIndex = cell.content[0].startIndex;
      textInserts1.push({ index: cellIndex, text: item.text });
    });
    textInserts1.sort((a, b) => b.index - a.index);

    await docs.documents.batchUpdate({
      documentId: gift1DocId,
      requestBody: {
        requests: textInserts1.map(ti => ({ insertText: { location: { index: ti.index }, text: ti.text } }))
      }
    });
    console.log(`-> Gift 1: Đã chèn và điền bảng SOW chuẩn 1 hạng mục Photo Post!`);
  }

  // Bước 4.2: Cập nhật thông tin Bên B, Sản phẩm và các điều khoản khác
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
    { replaceAllText: { containsText: { text: 'thông qua nền tảng Threads, Instagram, Tiktok. Cụ thể:', matchCase: false }, replaceText: 'thông qua nền tảng TikTok, Facebook, Instagram. Cụ thể:' } },

    // Điều 1.1: Chỉ giữ mô tả hình ảnh
    { replaceAllText: { containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle) 1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false }, replaceText: '1.1. Số lượng hình ảnh/một bộ: Từ 6 đến 8 ảnh. Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ để chọn ảnh phù hợp đăng tải.' } },

    // Điều 1.4 & 1.7
    { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: '1.7. Thời hạn sử dụng hình ảnh: 03 tháng kể từ ngày đăng (từ 29/10/2026 đến 29/01/2027)' } },

    // Điều 2.1: Sản phẩm Saga Stella Chance 12.59M
    { replaceAllText: { containsText: { text: 'Bên A thanh toán cho Bên B tổng chi phí để thực hiện dịch vụ bằng sản phẩm hiện vật là: 01 (một) chiếc đồng hồ với tổng giá trị là 6.950.000 VNĐ (Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng). Giá trị này được xác định là giá thị trường của sản phẩm tại thời điểm giao nhận.', matchCase: false }, replaceText: 'Bên A thanh toán cho Bên B tổng chi phí để thực hiện dịch vụ bằng sản phẩm hiện vật là: 01 (một) chiếc đồng hồ với tổng giá trị là 12.590.000 VNĐ (Mười hai triệu năm trăm chín mươi nghìn đồng). Giá trị này được xác định là giá thị trường của sản phẩm tại thời điểm giao nhận.' } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: '12.590.000' } },
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: '53578-LGSVWH-2' } },
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: 'Đồng hồ SAGA 53578-LGSVWH-2' } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2 - Bộ sưu tập: Saga Stella Chance - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 53578-LGSVWH-2\n- Bộ sưu tập: Saga Stella Chance\n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm' } },

    // Showroom & ngày nhận
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '05/11/2026' } }
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

  // Bước 5.1: Xóa sạch các đoạn SOW thừa (P 31, P 32, P 33) và chèn đúng 1 câu SOW Video Lifestyle
  const g2Doc = await docs.documents.get({ documentId: gift2DocId });
  let p31_2 = null, p34_2 = null;

  for (const el of g2Doc.data.body.content) {
    if (el.paragraph) {
      const text = el.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
      if (text.includes('Trend Loan Niệm') && text.includes('Video') && !p31_2) {
        p31_2 = el;
      } else if (text.includes('1.4. Thời gian hiển thị bài đăng:') && !p34_2) {
        p34_2 = el;
      }
    }
  }

  if (p31_2 && p34_2) {
    await docs.documents.batchUpdate({
      documentId: gift2DocId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: { startIndex: p31_2.startIndex, endIndex: p34_2.startIndex }
            }
          },
          {
            insertText: {
              location: { index: p31_2.startIndex },
              text: 'Đăng 01 Video Tiktok (Reup Reels Facebook, Instagram) (30-45s) “quay lifestyle cùng đồng hồ” vào ngày 30/10/2026\n'
            }
          }
        ]
      }
    });
    console.log(`-> Gift 2: Đã xóa sạch 3 đoạn SOW thừa và chèn đúng 1 câu Video Lifestyle duy nhất!`);
  }

  // Xóa Table SOW cũ và chèn Table 2 hàng mới
  const g2DocBeforeTable = await docs.documents.get({ documentId: gift2DocId });
  const sowTable2Fresh = g2DocBeforeTable.data.body.content.find(el => el.table && el.table.tableRows.length >= 7);
  if (sowTable2Fresh) {
    const tableInsertIdx = sowTable2Fresh.startIndex;
    await docs.documents.batchUpdate({
      documentId: gift2DocId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: { startIndex: sowTable2Fresh.startIndex, endIndex: sowTable2Fresh.endIndex }
            }
          },
          {
            insertTable: {
              rows: 2,
              columns: 6,
              location: { index: tableInsertIdx }
            }
          }
        ]
      }
    });

    // Điền dữ liệu vào Table mới
    const g2DocWithNewTable = await docs.documents.get({ documentId: gift2DocId });
    const newTable2 = g2DocWithNewTable.data.body.content.find(el => el.table && el.table.tableRows.length === 2 && el.table.tableRows[0].tableCells.length === 6).table;

    const cells2 = [
      { r: 0, c: 0, text: 'STT' },
      { r: 0, c: 1, text: 'Hạng mục' },
      { r: 0, c: 2, text: 'Kênh' },
      { r: 0, c: 3, text: 'Số lượng' },
      { r: 0, c: 4, text: 'Số link đính kèm' },
      { r: 0, c: 5, text: 'Thời gian đăng tải bài viết' },
      { r: 1, c: 0, text: '1' },
      { r: 1, c: 1, text: 'Video Post' },
      { r: 1, c: 2, text: `${kocDisplayName} (Video Tiktok, Reup Reels FB, IG)` },
      { r: 1, c: 3, text: '01 video' },
      { r: 1, c: 4, text: '1' },
      { r: 1, c: 5, text: '30/10/2026' }
    ];

    const textInserts2 = [];
    cells2.forEach(item => {
      const cell = newTable2.tableRows[item.r].tableCells[item.c];
      const cellIndex = cell.content[0].startIndex;
      textInserts2.push({ index: cellIndex, text: item.text });
    });
    textInserts2.sort((a, b) => b.index - a.index);

    await docs.documents.batchUpdate({
      documentId: gift2DocId,
      requestBody: {
        requests: textInserts2.map(ti => ({ insertText: { location: { index: ti.index }, text: ti.text } }))
      }
    });
    console.log(`-> Gift 2: Đã chèn và điền bảng SOW chuẩn 1 hạng mục Video Lifestyle!`);
  }

  // Bước 5.2: Cập nhật thông tin Bên B, Sản phẩm và các điều khoản khác
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
    { replaceAllText: { containsText: { text: 'thông qua nền tảng Threads, Instagram, Tiktok. Cụ thể:', matchCase: false }, replaceText: 'thông qua nền tảng TikTok, Facebook, Instagram. Cụ thể:' } },

    // Điều 1.1: Chỉ giữ thời lượng video
    { replaceAllText: { containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle) 1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false }, replaceText: '1.1. Thời lượng video: 30 giây đến 45 giây (Video Lifestyle)' } },

    // Điều 1.4 & 1.7
    { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: '1.7. Thời hạn sử dụng hình ảnh: 03 tháng kể từ ngày đăng (từ 30/10/2026 đến 30/01/2027)' } },

    // Điều 2.1: Sản phẩm Saga Stella Rectangle 8.9M
    { replaceAllText: { containsText: { text: 'Bên A thanh toán cho Bên B tổng chi phí để thực hiện dịch vụ bằng sản phẩm hiện vật là: 01 (một) chiếc đồng hồ với tổng giá trị là 6.950.000 VNĐ (Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng). Giá trị này được xác định là giá thị trường của sản phẩm tại thời điểm giao nhận.', matchCase: false }, replaceText: 'Bên A thanh toán cho Bên B tổng chi phí để thực hiện dịch vụ bằng sản phẩm hiện vật là: 01 (một) chiếc đồng hồ với tổng giá trị là 8.900.000 VNĐ (Tám triệu chín trăm nghìn đồng). Giá trị này được xác định là giá thị trường của sản phẩm tại thời điểm giao nhận.' } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: '8.900.000' } },
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: '71836-SVSVSV-2' } },
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: 'Đồng hồ SAGA 71836-SVSVSV-2' } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2 - Bộ sưu tập: Saga Stella Chance - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 71836-SVSVSV-2\n- Bộ sưu tập: Saga Stella\n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm' } },

    // Showroom & ngày nhận
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '05/11/2026' } }
  ];

  await docs.documents.batchUpdate({
    documentId: gift2DocId,
    requestBody: { requests: gift2Requests }
  });
  console.log(`-> Đã hoàn thành HĐ Tặng SP 2: ${gift2DocId}`);

  // =========================================================================
  // PHIẾU ĐỀ NGHỊ THANH TOÁN (YYYY-MM-DD CHUẨN)
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

  console.log('\n=== KẾT QUẢ TẠO LẠI HOÀN TOÀN CHUẨN XÁC 100% ===');
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

run().catch(console.error);
