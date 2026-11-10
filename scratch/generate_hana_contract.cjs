const { google } = require('googleapis');
const fs = require('fs');
const { getOrCreateSubfolder } = require('../src/utils/drive_folder.util.cjs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    drive: google.drive({ version: 'v3', auth }),
    docs: google.docs({ version: 'v1', auth }),
    sheets: google.sheets({ version: 'v4', auth })
  };
}

async function run() {
  const { drive, docs, sheets } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  const fileMemRootId = config.CONTRACT_TARGET_ROOT_FOLDER_ID; // 117T7PVrbn48hc97-02JMj3K4ApYeSDPZ
  const templateGiftDocId = config.CONTRACT_TEMPLATE_DOC_ID; // 1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8

  console.log('1. Checking / Creating Month 11 folder in [0] File mềm...');
  const monthFolderId = await getOrCreateSubfolder(drive, fileMemRootId, 'Tháng 11');
  console.log('Month folder ID:', monthFolderId);

  const bookingDate = '2026-11-06';
  const kocDisplayName = 'Hana Sắp Cưới';
  const kocFullName = 'HUỲNH THỊ MỸ HIỀN';
  const productCode = '71959-RGRGTTR-2';
  const productName = 'Đồng hồ Nữ Saga 71959-RGRGTTR-2';
  const productPrice = 8950000;
  const productPriceFormatted = '8.950.000';
  const productPriceInWords = 'Tám triệu chín trăm năm mươi nghìn đồng';

  const docTitle = `${bookingDate} - ${kocDisplayName} - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - ${productCode} - Đồng Hồ Hải Triều`;

  console.log(`2. Copying template to create: "${docTitle}"...`);
  const copyRes = await drive.files.copy({
    fileId: templateGiftDocId,
    supportsAllDrives: true,
    requestBody: {
      name: docTitle,
      parents: [monthFolderId]
    }
  });

  const docId = copyRes.data.id;
  console.log(`Document created with ID: ${docId}`);

  // Product 6 fields
  const productDetails = `- Thương hiệu: Saga\n- Số hiệu sản phẩm: ${productCode}\n- Bộ sưu tập: Saga Stella (Saga Lunar)\n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm`;

  // SOW sentences
  const sow1 = 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Chia sẻ câu chuyện đeo đồng hồ ngày cưới, review về đồng hồ” vào Tháng 12/2026';
  const sow2 = 'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Chia sẻ về dự án \'Cô dâu Saga\' của brand Saga Vietnam - TẶNG ĐỒNG HỒ CƯỚI MIỄN PHÍ” vào Tháng 12/2026';
  const sow3 = 'Đăng 03 Bộ ảnh cưới Tiktok (Reup Facebook) (7-8 ảnh/bộ: tại gia, Get ready khách sạn, nhà hàng) “Bộ ảnh cưới ngọt ngào cùng đồng hồ Saga” vào Tháng 12/2026';

  const requests = [
    // 1. Ngày ký
    { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: 'ngày 06 tháng 11 năm 2026' } },

    // 2. Thông tin Bên B
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: '283E Dương Bá Trạc, phường Chánh Hưng, HCM' } },
    { replaceAllText: { containsText: { text: 'Mã số thuế: 056302005986', matchCase: false }, replaceText: 'Mã số thuế: ' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: 'stellahuynh1711@gmail.com' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: '0385683144' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: '072199009144' } },

    // Kênh mạng xã hội Bên B (Triệt tiêu lặp dòng, chỉ giữ TikTok và Facebook)
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/share/1CC98dKuuL/' } },
    { replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: 'https://www.tiktok.com/@hanasapcuoi' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh  ', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Instagram: https://www.instagram.com/waananh', matchCase: false }, replaceText: '' } },

    // Điều 1: nền tảng truyền thông
    { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'TikTok, Facebook' } },

    // Bảng Điều 1
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocDisplayName } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocDisplayName } },
    { replaceAllText: { containsText: { text: 'waananh', matchCase: false }, replaceText: kocDisplayName } },
    { replaceAllText: { containsText: { text: 'Van Anh (alice)', matchCase: false }, replaceText: kocDisplayName } },
    { replaceAllText: { containsText: { text: '(Reup Reels, Story Instagram)', matchCase: false }, replaceText: '(Reup Reels, Story Facebook)' } },
    { replaceAllText: { containsText: { text: '(Instagram)', matchCase: false }, replaceText: '(Facebook)' } },
    { replaceAllText: { containsText: { text: '(Reup Threads)', matchCase: false }, replaceText: '(Reup Facebook)' } },
    { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: '3 bộ ảnh (7-8 ảnh/bộ)' } },
    { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: 'Tháng 12/2026' } },
    { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: 'Tháng 12/2026' } },
    { replaceAllText: { containsText: { text: '16/10/2026', matchCase: false }, replaceText: 'Tháng 12/2026' } },

    // Điều 1.1 / 1.2
    { replaceAllText: { containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle) 1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false }, replaceText: '1.1. Thời lượng video: 60 giây đến 90 giây.\n1.2. Số lượng hình ảnh: 03 bộ ảnh cưới: 01 bộ ảnh tại gia; 01 bộ ảnh Get ready - mặc áo choàng lụa tại khách sạn trước ngày cưới; 01 bộ ảnh tại nhà hàng (7-8 ảnh/bộ. Trong đó, ảnh Cô dâu [5-6 ảnh] và ảnh Cô dâu cùng chú rể [2-3 ảnh], có 2-3 ảnh cận đồng hồ).' } },

    // Điều 1.3
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: sow1 } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: sow2 } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: sow3 } },

    // Điều 1.4 & Điều 1.7
    { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời.' } },

    // Điều 1.6 Điều khoản ràng buộc
    { replaceAllText: { containsText: { text: 'Sản phẩm trong video được đăng tải phải gắn trên link Bio kênh TikTok \nGắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook\nGắn thẻ, tag brand @Saga Vietnam ở Reels/Story Facebook được đăng ở chế độ công khai', matchCase: false }, replaceText: '- Sản phẩm trong video/bài đăng được gắn trên link Bio kênh TikTok.\n- Story cho mỗi post gắn link sản phẩm, tag brand @Saga Vietnam ở chế độ công khai.\n- Trong comment Facebook và TikTok: đính kèm link sản phẩm (riêng TikTok không gắn link) và voucher brand tặng 15% cho KOC và Followers dưới post.\n- Brand được quyền reup lại hình ảnh/video trên các nền tảng truyền thông chính thống của Saga Vietnam & Đồng Hồ Hải Triều.' } },

    // Điều 2.1 Giá trị hợp đồng
    { replaceAllText: { containsText: { text: '6.950.000 VNĐ (Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng)', matchCase: false }, replaceText: `${productPriceFormatted} VNĐ (${productPriceInWords})` } },
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: productCode } },
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: productName } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 53578-LGSVLG-2  \n- Bộ sưu tập: Saga Stella Chance\n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetails } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2  - Bộ sưu tập: Saga Stella Chance  - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetails } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: productPriceFormatted } },

    // Điều 2.2 Showroom nhận hàng
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '283-285 Dương Bá Trạc, Phường 1, Quận 8, TP.HCM' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '10/11/2026' } },

    // Chữ ký Bên B
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } }
  ];

  console.log(`3. Executing ${requests.length} text replacements in Doc...`);
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });
  console.log('Doc replacements completed successfully.');

  // 4. Update Sheet Data KOC (Row 204)
  console.log('4. Updating Row 204 in Data KOC (11/2026)...');
  const spreadsheetId = config.SPREADSHEET_DATA_KOC_ID;
  const tabName = config.TAB_DATA_KOC;

  const sheetUpdates = [
    {
      range: `'${tabName}'!B204`,
      values: [['Tuyết']]
    },
    {
      range: `'${tabName}'!K204:L204`,
      values: [['https://www.tiktok.com/@hanasapcuoi', 'https://www.facebook.com/share/1CC98dKuuL/']]
    },
    {
      range: `'${tabName}'!S204`,
      values: [['Đã chốt']]
    },
    {
      range: `'${tabName}'!U204:W204`,
      values: [[1, productCode, productPrice]]
    },
    {
      range: `'${tabName}'!Y204`,
      values: [[0]]
    }
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: sheetUpdates
    }
  });
  console.log('Sheet Row 204 updated successfully.');

  console.log('\n============================================================');
  console.log('HOÀN TẤT:');
  console.log(`- Link Hợp đồng: https://docs.google.com/document/d/${docId}/edit`);
  console.log(`- Folder: Tháng 11 (https://drive.google.com/drive/folders/${monthFolderId})`);
  console.log(`- Sheet Data KOC Row 204 updated.`);
  console.log('============================================================\n');
}

run().catch(console.error);
