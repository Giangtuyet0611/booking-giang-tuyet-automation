const { google } = require('googleapis');
const fs = require('fs');
const { Readable } = require('stream');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;

  const auth = new google.auth.OAuth2(
    oauthKeys.client_id,
    oauthKeys.client_secret,
    oauthKeys.redirect_uris[0]
  );
  auth.setCredentials(credentials);
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  const targetFolderId = '1L_w9zOlQtul_EXviyK83ZTBVRomsdLC4'; // Folder Tháng 10
  const templateDocId = '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8'; // Mẫu Doc chuẩn Tháng 10
  const newTitle = '2026-10-23 - Tô Thu Hà (NMGT) - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều';

  console.log(`Bắt đầu nhân bản mẫu hợp đồng sang thư mục Tháng 10 (${targetFolderId})...`);
  const copiedFile = await drive.files.copy({
    fileId: templateDocId,
    supportsAllDrives: true,
    requestBody: {
      name: newTitle,
      parents: [targetFolderId]
    }
  });

  const newDocId = copiedFile.data.id;
  console.log(`Đã tạo Google Doc với ID: ${newDocId}`);

  // Danh sách các mục cần thay thế chuẩn xác
  const replacements = [
    // Thông tin Bên B
    { target: 'PHAN NGỌC VÂN ANH', replacement: 'TÔ THU HÀ' },
    { target: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', replacement: 'Chung cư Petroland, số 2 đường 62, p.Bình Trưng, TP. Hồ Chí Minh' },
    { target: '056302005986', replacement: '031196008472' },
    { target: 'alicephan109@gmail.com', replacement: 'tothuha.hvtc@gmail.com' },
    { target: '0385169915', replacement: '0964961342' },
    
    // Kênh đại diện
    { target: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', replacement: 'Là đại diện của kênh Facebook: https://www.facebook.com/to.thu.ha.99883' },
    { target: 'www.tiktok.com/@alice.109_', replacement: 'www.tiktok.com/@hathuto.daily' },
    { target: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh', replacement: '' },
    { target: 'Threads, Instagram, Tiktok', replacement: 'Tiktok, Facebook' },
    
    // Tên hiển thị kênh trong Bảng & Mục 1
    { target: 'Alice Xinh Đẹp (Video Tiktok)', replacement: 'Hà Thu Tô (Video Tiktok)' },
    { target: 'Alice Xinh Đẹp  (Video Tiktok)', replacement: 'Hà Thu Tô (Video Lifestyle Tiktok)' },
    { target: 'Alice Xinh Đẹp (Reup Tiktok)', replacement: 'to.thu.ha.99883 (Reup Facebook Story)' },
    { target: 'Alice Xinh Đẹp', replacement: 'Hà Thu Tô' },
    { target: 'waananh  (Reup Reels, Story Instagram)', replacement: 'to.thu.ha.99883 (Reup Reels, Story Facebook)' },
    { target: 'waananh  (Instagram)', replacement: 'to.thu.ha.99883 (Facebook)' },
    { target: 'Van Anh (alice) (Reup Threads)', replacement: 'to.thu.ha.99883 (Reup Facebook Reels)' },
    
    // Bảng Timeline Air bài
    { target: '14/10/2026- 15/10/2026', replacement: '12/10/2026' },
    { target: '14/10/2026', replacement: '11/10/2026' },
    { target: '16/10/2026', replacement: '18/10/2026' },
    
    // Chi tiết điều 1.3
    { target: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', replacement: 'Đăng 01 Video Tiktok (Reup Story, Reels Facebook) (60-90s) “POV - Khi ảnh chọn quà mà không cần tui gửi link” vào ngày 11/10/2026' },
    { target: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', replacement: 'Đăng 01 photo post Facebook (4-6 ảnh) concept 20/10, hoa vào ngày 12/10/2026' },
    { target: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', replacement: 'Đăng 01 Video lifestyle Tiktok, Reup Reels, Story Facebook (30-45s) vào ngày 18/10/2026' },
    
    // Thời hạn SDHA
    { target: 'Trọn đời', replacement: '03 tháng kể từ ngày air bài' },
    { target: 'Trọn đời', replacement: '03 tháng kể từ ngày air bài' },
    
    // Giá trị chữ viết
    { target: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', replacement: 'Sáu triệu chín trăm năm mươi nghìn đồng' },
    
    // Showroom & Ngày nhận
    { target: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', replacement: 'Showroom Đồng Hồ Hải Triều - Nguyễn Thị Định' },
    { target: '04/10/2026', replacement: '27/10/2026' },
    { target: 'ngày 01 tháng 10 năm 2026', replacement: 'ngày 23 tháng 10 năm 2026' }
  ];

  const requests = replacements.map(r => ({
    replaceAllText: {
      containsText: {
        text: r.target,
        matchCase: false
      },
      replaceText: r.replacement
    }
  }));

  console.log('Đang cập nhật nội dung văn bản hợp đồng chuẩn format...');
  await docs.documents.batchUpdate({
    documentId: newDocId,
    requestBody: { requests }
  });

  console.log('Đã cập nhật nội dung văn bản thành công!');

  // Xuất file PDF vào cùng thư mục Tháng 10
  console.log('Đang xuất file PDF vào thư mục Tháng 10...');
  const pdfResponse = await drive.files.export({
    fileId: newDocId,
    mimeType: 'application/pdf'
  }, { responseType: 'arraybuffer' });

  const pdfBuffer = Buffer.from(pdfResponse.data);
  const pdfStream = new Readable();
  pdfStream.push(pdfBuffer);
  pdfStream.push(null);

  const createdPdf = await drive.files.create({
    requestBody: {
      name: `${newTitle}.pdf`,
      parents: [targetFolderId]
    },
    media: {
      mimeType: 'application/pdf',
      body: pdfStream
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  console.log('Xuất PDF thành công!');
  console.log('\n============================================================');
  console.log('Google Doc Link:', `https://docs.google.com/document/d/${newDocId}/edit`);
  console.log('PDF Link:', createdPdf.data.webViewLink);
  console.log('============================================================\n');
}

main().catch(console.error);
