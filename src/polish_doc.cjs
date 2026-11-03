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

  const docId = '11JR5czwgK8vmpjdlERGAmnWxSdECyd6zGm0bVwQBtG8';
  const targetFolderId = '1L_w9zOlQtul_EXviyK83ZTBVRomsdLC4';
  const newTitle = '2026-10-23 - Tô Thu Hà (NMGT) - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều';

  const fineReplacements = [
    // Bảng Điều 1
    { target: 'waananh', replacement: 'to.thu.ha.99883' },
    { target: 'Van Anh (alice)', replacement: 'to.thu.ha.99883' },
    { target: 'Reup Reels, Story Instagram', replacement: 'Reup Story, Reels Facebook' },
    { target: 'Instagram', replacement: 'Facebook' },
    { target: 'Reup Threads', replacement: 'Reup Story Facebook' },
    { target: 'Reup Tiktok', replacement: 'Reup Reels Facebook' },
    
    // Điều 1.3
    { target: '“Trend Loan Niệm”', replacement: '“POV - Khi ảnh chọn quà mà không cần tui gửi link”' },
    { target: 'trend Loan Niệm', replacement: 'concept 20/10, hoa' },
    { target: 'Threads, Tiktok -  concept 20/10, hoa', replacement: 'Facebook' },
    { target: '6-8 ảnh', replacement: '4-6 ảnh' },
    { target: '11/10/2026 - 15/10/2026', replacement: '12/10/2026' },
    { target: 'Lifestyle tại không gian sang trọng, sự kiện,..', replacement: 'Lifestyle' },
    
    // Điều 1.4 và 1.7
    { target: '1.4. Thời gian hiển thị bài đăng: 03 tháng kể từ ngày air bài.', replacement: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' },
    { target: 'Showroom Đồng Hồ Hải Triều - Showroom Đồng Hồ Hải Triều - Nguyễn Thị Định', replacement: 'Showroom Đồng Hồ Hải Triều - Nguyễn Thị Định' }
  ];

  const requests = fineReplacements.map(r => ({
    replaceAllText: {
      containsText: {
        text: r.target,
        matchCase: false
      },
      replaceText: r.replacement
    }
  }));

  console.log('Đang tinh chỉnh các chuỗi văn bản còn lại...');
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });

  console.log('Tinh chỉnh Doc thành công!');

  // Xóa file PDF cũ nếu có trong folder
  const oldPdfs = await drive.files.list({
    q: `'${targetFolderId}' in parents and name contains '${newTitle}' and mimeType = 'application/pdf' and trashed = false`,
    supportsAllDrives: true
  });
  for (const f of oldPdfs.data.files) {
    console.log(`Xóa PDF cũ: ${f.id} - ${f.name}`);
    await drive.files.delete({ fileId: f.id, supportsAllDrives: true });
  }

  // Xuất file PDF mới
  console.log('Đang xuất lại file PDF chuẩn hoàn hảo...');
  const pdfResponse = await drive.files.export({
    fileId: docId,
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

  console.log('\n============================================================');
  console.log('Google Doc Link:', `https://docs.google.com/document/d/${docId}/edit`);
  console.log('PDF Link:', createdPdf.data.webViewLink);
  console.log('============================================================\n');
}

main().catch(console.error);
