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
    docs: google.docs({ version: 'v1', auth })
  };
}

async function run() {
  const { drive, docs } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  const fileMemRootId = config.CONTRACT_TARGET_ROOT_FOLDER_ID; // [0] File mềm
  const templateGiftDocId = config.CONTRACT_TEMPLATE_DOC_ID;

  const bookingDate = '2026-11-11';
  const monthFolderName = 'Tháng 11';
  const monthFolderId = await getOrCreateSubfolder(drive, fileMemRootId, monthFolderName);

  const kocDisplayName = 'Dmy nè';
  const kocFullName = 'NGUYỄN THỊ THANH NGÂN';
  const docTitle = `${bookingDate} - ${kocDisplayName} - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều`;

  console.log('Target Month Folder ID:', monthFolderId);
  console.log('Creating Doc:', docTitle);

  // Copy template
  const copyRes = await drive.files.copy({
    fileId: templateGiftDocId,
    supportsAllDrives: true,
    requestBody: {
      name: docTitle,
      parents: [monthFolderId]
    }
  });

  const docId = copyRes.data.id;
  console.log('Created doc ID:', docId);

  // Format SOW 1.3 with 5 items
  const sow1_3 = [
    'Đăng 01 bộ ảnh Pre Wedding Tiktok (Reup Facebook) (7-8 ảnh) “Ảnh cưới Pre Wedding cô dâu và chú rể cận đồng hồ Saga” vào ngày 25/11/2026',
    'Đăng 01 bộ ảnh Pre Wedding Tiktok (Reup Facebook) (7-8 ảnh) “Ảnh cưới Pre Wedding cô dâu và chú rể cận đồng hồ Saga” vào ngày 28/11/2026',
    'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Kể chuyện hành trình yêu nhau, đánh dấu cột mốc bằng Saga” vào ngày 29/11/2026',
    'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Chia sẻ câu chuyện đeo đồng hồ ngày cưới, review về đồng hồ” vào ngày 10/01/2027 (Gửi kịch bản 15/12/2026; Gửi video demo ngày 05/01/2027)',
    'Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Chia sẻ về dự án Cô dâu Saga của brand Saga Vietnam - Tặng đồng hồ cưới miễn phí” vào ngày 12/01/2027 (Gửi kịch bản 18/12/2026; Gửi video demo ngày 08/01/2027)'
  ].join('\n');

  const productDetailText = `- Thương hiệu: Saga\n- Số hiệu sản phẩm: 71959-RGRGTTR-2\n- Bộ sưu tập: Saga Lunar\n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm`;

  const requests = [
    // 1. Ngày ký
    { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: 'ngày 11 tháng 11 năm 2026' } },

    // 2. Thông tin Bên B
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: '83 đường số 3, phường Thông Tây Hội, quận Gò Vấp, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: '079301014286' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: '0939720264' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: 'Nguyenthithanhngan1812@gmail.com' } },

    // 3. Kênh đại diện
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/share/19LhfShFFd/?mibextid=wwXIfr' } },
    { replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: 'https://www.tiktok.com/@dmyne143' } },
    { replaceAllText: { containsText: { text: 'https://www.instagram.com/waananh', matchCase: false }, replaceText: 'không có' } },
    { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'TikTok, Facebook' } },

    // 4. Kênh hiển thị trong bảng SOW
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocDisplayName } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocDisplayName } },
    { replaceAllText: { containsText: { text: 'waananh  (Reup Reels, Story Instagram)', matchCase: false }, replaceText: `${kocDisplayName} (Reup Facebook)` } },
    { replaceAllText: { containsText: { text: 'waananh', matchCase: false }, replaceText: kocDisplayName } },
    { replaceAllText: { containsText: { text: 'Van Anh (alice)', matchCase: false }, replaceText: kocDisplayName } },
    { replaceAllText: { containsText: { text: 'Reup Reels, Story Instagram', matchCase: false }, replaceText: 'Reup Reels, Story Facebook' } },
    { replaceAllText: { containsText: { text: 'Instagram', matchCase: false }, replaceText: 'Facebook' } },
    { replaceAllText: { containsText: { text: 'Threads', matchCase: false }, replaceText: 'Facebook' } },

    // 5. Điều 1.1 & 1.2
    { replaceAllText: { 
      containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle) 1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false },
      replaceText: '1.1. Thời lượng video: 60 giây đến 90 giây.\n1.2. Số lượng hình ảnh/một bộ: Từ 7 đến 8 ảnh (Trong đó: ảnh Cô dâu 5-6 ảnh, ảnh Cô dâu cùng chú rể 2-3 ảnh, có 2-3 ảnh cận đồng hồ).'
    } },

    // 6. Điều 1.3: Thay thế bằng 5 câu SOW hoàn chỉnh
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: sow1_3 } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: '' } },

    // 7. Ràng buộc & SDHA
    { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: 'Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: 'Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: 'Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: 'Thời hạn sử dụng hình ảnh: Trọn đời' } },
    { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời' } },
    { replaceAllText: { 
      containsText: { text: 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook\n', matchCase: false }, 
      replaceText: 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook; gắn voucher brand tặng 15% dưới phần bình luận của Facebook và TikTok\n' 
    } },

    // 8. Sản phẩm Điều 2.1
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: '71959-RGRGTTR-2' } },
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: 'Đồng hồ Saga Lunar Watch 71959-RGRGTTR-2' } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 53578-LGSVLG-2  \n- Bộ sưu tập: Saga Stella Chance  \n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetailText } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2  - Bộ sưu tập: Saga Stella Chance  - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetailText } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: '8.950.000' } },
    { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: 'Tám triệu chín trăm năm mươi nghìn Việt Nam Đồng' } },

    // 9. Showroom nhận hàng Điều 2.2
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '634 Quang Trung, phường Thông Tây Hội, quận Gò Vấp, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '12/11/2026' } }
  ];

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });

  console.log('Batch update text completed successfully!');
  console.log(`Document URL: https://docs.google.com/document/d/${docId}/edit`);

  // Lưu kết quả ra file last_contract_result.json
  const result = {
    contracts: [
      {
        type: 'Gift',
        id: docId,
        title: docTitle,
        url: `https://docs.google.com/document/d/${docId}/edit`,
        sow: sow1_3
      }
    ],
    dntt: []
  };
  fs.writeFileSync('d:/Booking/last_contract_result.json', JSON.stringify(result, null, 2), 'utf8');
}

run().catch(console.error);

