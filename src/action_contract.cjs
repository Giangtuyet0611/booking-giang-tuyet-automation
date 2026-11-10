const { google } = require('googleapis');
const fs = require('fs');
const { getOrCreateSubfolder } = require('./utils/drive_folder.util.cjs');
const { formatSowItemSentence, formatProductDetails } = require('./utils/sow_formatter.util.cjs');
const { calculateTax } = require('./utils/tax.util.cjs');

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

/**
 * Chia nhóm sản phẩm sao cho mỗi nhóm tổng giá trị không quá 20.000.000 VNĐ
 */
function groupProductsUnder20M(products) {
  const groups = [];
  let currentGroup = [];
  let currentTotal = 0;

  for (const p of products) {
    const val = Number(String(p.value || p.price || '0').replace(/[^0-9]/g, ''));
    if (currentGroup.length > 0 && currentTotal + val > 20000000) {
      groups.push(currentGroup);
      currentGroup = [p];
      currentTotal = val;
    } else {
      currentGroup.push(p);
      currentTotal += val;
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function formatVND(num) {
  return Number(num || 0).toLocaleString('vi-VN');
}

/**
 * Tự động tạo bộ hợp đồng chuẩn hóa 100% theo Quy định V4.0:
 * 1. SOW bám sát 100% yêu cầu được cung cấp, không giữ lại hạng mục dư từ mẫu.
 * 2. Cấu trúc câu Điều 1.3 theo đúng form chuẩn của brief.
 * 3. Thời gian hiển thị: LUÔN LÀ "Trọn đời".
 * 4. SDHA: Tùy theo SOW, nếu nhắc SDHA mà không rõ thời gian thì là "Trọn đời".
 * 5. Chi tiết sản phẩm: Thương hiệu, Số hiệu, BST, Xuất xứ, Máy, BH Quốc tế.
 * 6. Cast >= 5M: Thể hiện chi tiết Thuế TNCN 10% & Thực nhận.
 * 7. Đồng bộ tên người ký Bên B ở bảng cuối trang.
 * 8. Đổi ngày ký: "Hôm nay, ngày [DD] tháng [MM] năm [YYYY], tại TP. Hồ Chí Minh, chúng tôi gồm có:"
 * 9. Không lặp 2 lần dòng "Là đại diện của kênh Tiktok".
 * 10. Quản lý thư mục: KOC >= 2 HĐ gom chung 1 thư mục tổng hợp trong thư mục Tháng, 1 HĐ lưu lẻ trực tiếp.
 */
async function generateSplittedContracts(params) {
  const { drive, docs } = getClients();
  const config = JSON.parse(fs.readFileSync('d:/Booking/config.json', 'utf8'));

  const fileMemRootId = config.CONTRACT_TARGET_ROOT_FOLDER_ID; // [0] File mềm
  const templateGiftDocId = config.CONTRACT_TEMPLATE_DOC_ID; // Mẫu Trao đổi tặng SP (Google Doc)
  const templateCastDocId = config.CONTRACT_TEMPLATE_CAST_DOC_ID || config.CONTRACT_TEMPLATE_DOC_ID; // Mẫu Trả Cast (.docx)

  const bookingDate = params.bookingDate ? params.bookingDate.replace(/\//g, '-') : '2026-10-26';
  const dateParts = bookingDate.split('-');
  const yearStr = dateParts[0] || '2026';
  const monthStr = dateParts[1] || '10';
  const dayStr = dateParts[2] || '26';
  const monthFolderName = `Tháng ${parseInt(monthStr, 10)}`;

  const kocFullName = (params.fullName || params.kocName || '').toUpperCase();
  const kocDisplayName = params.kocName || params.fullName || '';

  console.log(`\n============================================================`);
  console.log(`BẮT ĐẦU TẠO HỢP ĐỒNG CHO KOC: ${kocDisplayName} (${kocFullName})`);
  console.log(`============================================================`);

  // 1. TÌM HOẶC DÙNG LẠI THƯ MỤC THÁNG CÓ SẴN (Không tạo trùng)
  const monthFolderId = await getOrCreateSubfolder(drive, fileMemRootId, monthFolderName);

  // 2. PHÂN TÍCH HỢP ĐỒNG CẦN TẠO
  const castAmountNum = Number(String(params.castAmount || '0').replace(/[^0-9]/g, ''));
  const hasCast = castAmountNum > 0;

  const products = params.products || (params.productName ? [{ name: params.productName, value: params.productValue || '0', code: params.productCode }] : []);
  const productGroups = products.length > 0 ? groupProductsUnder20M(products) : [];
  
  const totalContractsCount = (hasCast ? 1 : 0) + productGroups.length;
  console.log(`-> KOC có tổng cộng ${totalContractsCount} hợp đồng (Cast: ${hasCast ? 1 : 0}, Tặng SP: ${productGroups.length}).`);

  // 3. XÁC ĐỊNH THƯ MỤC ĐÍCH:
  let targetFolderId = monthFolderId;
  let kocFolderName = null;

  if (totalContractsCount > 1) {
    kocFolderName = `${bookingDate} - ${kocDisplayName} - [Booking KOC/KOL] Hợp đồng tổng hợp - Đồng Hồ Hải Triều`;
    targetFolderId = await getOrCreateSubfolder(drive, monthFolderId, kocFolderName);
    console.log(`-> Có >= 2 hợp đồng -> Tạo/Dùng thư mục KOC tổng hợp: "${kocFolderName}"`);
  } else {
    console.log(`-> Chỉ có 1 hợp đồng duy nhất -> Lưu lẻ trực tiếp trong "${monthFolderName}", không tạo thư mục tổng hợp.`);
  }

  // Dọn dẹp bất kỳ file trùng tên hoặc dở dang trước khi tạo mới
  try {
    const existingFilesInTarget = await drive.files.list({
      q: `'${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    if (existingFilesInTarget.data.files && existingFilesInTarget.data.files.length > 0) {
      for (const ef of existingFilesInTarget.data.files) {
        if (ef.name.includes(kocDisplayName) || ef.name.includes(kocFullName)) {
          console.log(`-> Xóa file cũ/dở dang: ${ef.name}`);
          await drive.files.delete({ fileId: ef.id, supportsAllDrives: true }).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.log('Lưu ý dọn dẹp:', err.message);
  }

  const createdDocs = [];
  let contractOrderIndex = 0;

  // Giãn cách ngày ký các hợp đồng +-3 ngày so với ngày yêu cầu nếu có nhiều HĐ
  function calculateContractDate(baseDateStr, index, total) {
    if (total <= 1) {
      const parts = baseDateStr.split('-');
      return {
        iso: baseDateStr,
        year: parts[0] || '2026',
        month: parts[1] || '10',
        day: parts[2] || '26'
      };
    }
    let offset = 0;
    if (total === 2) {
      offset = index === 0 ? 0 : 2;
    } else if (total === 3) {
      offset = [-2, 0, 2][index] !== undefined ? [-2, 0, 2][index] : (index * 2 - 2);
    } else {
      const step = 6 / (total - 1);
      offset = Math.round(-3 + index * step);
    }
    const [y, m, d] = baseDateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d + offset);
    const yyyy = String(dt.getFullYear());
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return {
      iso: `${yyyy}-${mm}-${dd}`,
      year: yyyy,
      month: mm,
      day: dd
    };
  }

  // =========================================================================
  // 4. TẠO HỢP ĐỒNG THƯƠNG MẠI (TRẢ CAST) NẾU CÓ
  // =========================================================================
  if (hasCast) {
    const castDate = calculateContractDate(bookingDate, contractOrderIndex, totalContractsCount);
    contractOrderIndex++;

    const castDocTitle = `${castDate.iso} - ${kocDisplayName} - [Booking KOC/KOL] Hợp đồng Thương mại (Trả cast) - Đồng Hồ Hải Triều`;
    console.log(`   + Đang tạo HĐ Thương mại (Trả cast): ${castDocTitle} (Ngày ký: ${castDate.iso})`);

    // Tải template docx và upload chuyển đổi thành Google Doc
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
      fields: 'id, name, mimeType'
    });

    const castDocId = createCastRes.data.id;
    console.log(`   -> Google Doc Cast tạo thành công: ID ${castDocId}`);

    // Xử lý thuế TNCN nếu Cast >= 5M
    const isNet = params.castType === 'Net' || params.isGross === false;
    const taxInfo = calculateTax(castAmountNum, !isNet);
    const halfNetNum = Math.round(taxInfo.netAmount / 2);

    let costExplanation = `${formatVND(taxInfo.grossAmount)} VNĐ`;
    let costTableText = formatVND(taxInfo.grossAmount);
    if (taxInfo.taxApplicable) {
      costExplanation = `${formatVND(taxInfo.grossAmount)} VNĐ. Trong đó: Thuế TNCN (10%) khấu trừ: ${formatVND(taxInfo.taxAmount)} VNĐ; KOC thực nhận: ${formatVND(taxInfo.netAmount)} VNĐ`;
      costTableText = `${formatVND(taxInfo.grossAmount)} (Thuế TNCN 10%: ${formatVND(taxInfo.taxAmount)}đ | Thực nhận: ${formatVND(taxInfo.netAmount)}đ)`;
    }

    // Xử lý SOW cast (bám sát SOW được giao)
    const castSowSentence = formatSowItemSentence(params.sowCast || {
      category: 'Video',
      mainPlatform: params.mainPlatform || 'Tiktok',
      reupPlatform: params.reupPlatform || 'Facebook',
      reupType: 'Reels, Story',
      duration: params.videoDuration || '60-90s',
      concept: params.concept || 'Review đồng hồ Saga',
      airDate: params.postDate || `${dayStr}/${monthStr}/${yearStr}`
    });

    // Chuẩn bị các replacements cho Cast
    const castRequests = [
      // 1. Ngày ký chuẩn: "Hôm nay, ngày [DD] tháng [MM] năm [YYYY], tại TP. Hồ Chí Minh, chúng tôi gồm có:"
      { replaceAllText: { containsText: { text: 'ngày 27 tháng 08 năm 2026', matchCase: false }, replaceText: `ngày ${castDate.day} tháng ${castDate.month} năm ${castDate.year}` } },
      
      // 2. Thông tin Bên B
      { replaceAllText: { containsText: { text: 'HỘ KINH DOANH NGUYỄN PHƯƠNG DUNG', matchCase: false }, replaceText: `BÀ ${kocFullName}` } },
      { replaceAllText: { containsText: { text: 'Nguyễn Thị Phương Dung', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'NGUYỄN PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'NGUYỄN THỊ  PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'NGUYỄN THỊ PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'Tổ 3, Ấp 5B, Xã Lộc Tấn, Tỉnh Đồng Nai', matchCase: false }, replaceText: params.address || '' } },
      { replaceAllText: { containsText: { text: '070198007772', matchCase: false }, replaceText: params.cccd || '' } },
      { replaceAllText: { containsText: { text: 'booking.phuongdung@gmail.com', matchCase: false }, replaceText: params.email || '' } },
      { replaceAllText: { containsText: { text: '0337674264', matchCase: false }, replaceText: params.phone || '' } },
      { replaceAllText: { containsText: { text: 'https://www.facebook.com/profile.php?id=100088058531745', matchCase: false }, replaceText: params.tiktokUrl || params.facebookUrl || '' } },
      
      // 3. SOW & Timeline
      { replaceAllText: { containsText: { text: 'Reup 01 Video lên Reels Facebook khai thác nội dung “Quà tặng 20/10, nàng có thể tự mua quà cho chính mình, vì dù không có ai bên cạnh, nàng vẫn xứng đáng được yêu thương và tỏa sáng. Saga đồng hành cùng nàng qua nhiều phiên bản phong cách” vào ngày 05/10/2026', matchCase: false }, replaceText: castSowSentence } },
      { replaceAllText: { containsText: { text: '05/10/2026', matchCase: false }, replaceText: params.postDate || `${dayStr}/${monthStr}/${yearStr}` } },
      
      // 4. Thời gian hiển thị: LUÔN LÀ TRỌN ĐỜI; SDHA theo SOW
      { replaceAllText: { containsText: { text: '1.3. Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: '1.3. Thời gian hiển thị bài đăng: Trọn đời.' } },
      { replaceAllText: { containsText: { text: 'Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: 'Thời gian hiển thị bài đăng: Trọn đời.' } },
      { replaceAllText: { containsText: { text: '1.6. Thời hạn sử dụng hình ảnh: 1 tháng', matchCase: false }, replaceText: `1.6. Thời hạn sử dụng hình ảnh: ${params.sdha || 'Trọn đời'}` } },
      { replaceAllText: { containsText: { text: 'Thời hạn sử dụng hình ảnh: 1 tháng', matchCase: false }, replaceText: `Thời hạn sử dụng hình ảnh: ${params.sdha || 'Trọn đời'}` } },

      // 5. Bảng Chi phí & Thuế TNCN
      { replaceAllText: { containsText: { text: '4.500.000', matchCase: false }, replaceText: formatVND(taxInfo.grossAmount) } },
      { replaceAllText: { containsText: { text: 'Bốn triệu năm trăm nghìn Việt Nam Đồng', matchCase: false }, replaceText: costExplanation } },
      { replaceAllText: { containsText: { text: '2.250.000', matchCase: false }, replaceText: formatVND(halfNetNum) } },
      { replaceAllText: { containsText: { text: 'Hai triệu hai trăm năm mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: `${formatVND(halfNetNum)} VNĐ (Thực nhận đợt 1)` } },
      { replaceAllText: { containsText: { text: 'Hai triệu hai trăm mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: `${formatVND(halfNetNum)} VNĐ (Thực nhận đợt 2)` } },
      
      // 6. Tài khoản ngân hàng
      { replaceAllText: { containsText: { text: '922019868', matchCase: false }, replaceText: params.bankAccount || '' } },
      { replaceAllText: { containsText: { text: 'Ngân hàng TMCP Quân Đội (MB Bank)', matchCase: false }, replaceText: params.bankName || '' } }
    ];

    await docs.documents.batchUpdate({
      documentId: castDocId,
      requestBody: { requests: castRequests }
    });

    createdDocs.push({
      type: 'Cast',
      title: castDocTitle,
      id: castDocId,
      url: `https://docs.google.com/document/d/${castDocId}/edit`
    });
  }

  // =========================================================================
  // 5. TẠO CÁC HỢP ĐỒNG TẶNG SẢN PHẨM (MỖI HĐ KHÔNG QUÁ 20 TRIỆU)
  // =========================================================================
  for (let i = 0; i < productGroups.length; i++) {
    const group = productGroups[i];
    const groupProductCodes = group.map(p => p.code || p.name).join(' & ');
    const groupProductNames = group.map(p => p.name || p.code).join(', ');
    const groupTotalVal = group.reduce((sum, p) => sum + Number(String(p.value || '0').replace(/[^0-9]/g, '')), 0);
    const pPrimary = group[0];

    const giftDate = calculateContractDate(bookingDate, contractOrderIndex, totalContractsCount);
    contractOrderIndex++;

    const giftDocTitle = `${giftDate.iso} - ${kocDisplayName} - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều`;
    console.log(`   + Đang tạo HĐ Tặng SP nhóm ${i + 1} (${group.length} SP <= 20tr): ${giftDocTitle} (Ngày ký: ${giftDate.iso})`);

    const copyGiftRes = await drive.files.copy({
      fileId: templateGiftDocId,
      supportsAllDrives: true,
      requestBody: {
        name: giftDocTitle,
        parents: [targetFolderId]
      }
    });

    const giftDocId = copyGiftRes.data.id;

    // Chuẩn bị chi tiết sản phẩm chuẩn hóa:
    // - Thương hiệu: Saga
    // - Số hiệu sản phẩm: ...
    // - Bộ sưu tập: ...
    // - Xuất xứ: Mỹ
    // - Máy: Quartz (Pin)
    // - Bảo Hành Quốc Tế: 2 Năm
    const productDetailText = formatProductDetails(pPrimary);

    // Chuẩn bị SOW chính xác (tuyệt đối không lấy mẫu dư)
    const sowItems = params.sowItems || params.sow || [
      {
        category: 'Video',
        mainPlatform: params.mainPlatform || 'Tiktok',
        reupPlatform: params.reupPlatform || 'Facebook',
        reupType: 'Reels, Story',
        duration: params.videoDuration || '60-90s',
        concept: params.concept || 'Review đồng hồ Saga',
        airDate: params.postDate || `${giftDate.day}/${giftDate.month}/${giftDate.year}`
      }
    ];

    const sowSentence1 = formatSowItemSentence(sowItems[0]);
    const sowSentence2 = sowItems.length > 1 ? formatSowItemSentence(sowItems[1]) : '';
    const sowSentence3 = sowItems.length > 2 ? formatSowItemSentence(sowItems[2]) : '';

    // Xử lý các kênh liên hệ: không lặp dòng TikTok
    const channelTiktokLine = params.tiktokUrl ? `Là đại diện của kênh TikTok: ${params.tiktokUrl}` : '';
    const channelFacebookLine = params.facebookUrl ? `Là đại diện của kênh Facebook: ${params.facebookUrl}` : '';
    const channelInstagramLine = params.instagramUrl ? `Là đại diện của kênh Instagram: ${params.instagramUrl}` : '';

    const giftRequests = [
      // 1. Ngày ký
      { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: `ngày ${giftDate.day} tháng ${giftDate.month} năm ${giftDate.year}` } },

      // 2. Thông tin Bên B
      { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'PHẠM THU PHƯƠNG THẢO VI', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'NGUYỄN THỊ  PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'NGUYỄN THỊ PHƯƠNG DUNG', matchCase: false }, replaceText: kocFullName } },
      { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: params.address || '' } },
      { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: params.cccd || '' } },
      { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: params.phone || '' } },
      { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: params.email || '' } },

      // 3. Xử lý triệt để không lặp kênh TikTok
      { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: channelFacebookLine || channelInstagramLine || '' } },
      { replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: params.tiktokUrl || '' } },
      { replaceAllText: { containsText: { text: 'https://www.instagram.com/waananh', matchCase: false }, replaceText: params.instagramUrl || '' } },
      { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: params.platformsText || 'TikTok, Facebook' } },

      // 4. Kênh hiển thị trong bảng
      { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocDisplayName } },
      { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocDisplayName } },
      { replaceAllText: { containsText: { text: 'waananh  (Reup Reels, Story Instagram)', matchCase: false }, replaceText: params.reupPlatform ? `${kocDisplayName} (Reup Reels, Story ${params.reupPlatform})` : '' } },
      { replaceAllText: { containsText: { text: 'waananh', matchCase: false }, replaceText: kocDisplayName } },
      { replaceAllText: { containsText: { text: 'Van Anh (alice)', matchCase: false }, replaceText: kocDisplayName } },

      // 5. SOW chuẩn Điều 1.3 (xóa bỏ triệt để các câu mẫu dư nếu deal không có)
      { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: sowSentence1 } },
      { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: sowSentence2 } },
      { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: sowSentence3 } },

      // 6. Thời gian hiển thị bài đăng: LUÔN LÀ TRỌN ĐỜI
      { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
      { replaceAllText: { containsText: { text: 'Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: 'Thời gian hiển thị bài đăng: Trọn đời.' } },
      { replaceAllText: { containsText: { text: 'Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: `Thời hạn sử dụng hình ảnh: ${params.sdha || 'Trọn đời'}` } },
      { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: `1.7. Thời hạn sử dụng hình ảnh: ${params.sdha || 'Trọn đời'}` } },

      // 7. Chi tiết sản phẩm chuẩn hóa
      { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: pPrimary.code || '' } },
      { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: pPrimary.name || '' } },
      { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2  - Bộ sưu tập: Saga Stella Chance  - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetailText } },
      { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: formatVND(groupTotalVal) } },
      { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: pPrimary.valueText || `${formatVND(groupTotalVal)} VNĐ` } },

      // 8. Showroom nhận & ngày nhận
      { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: params.showroomAddress || params.showroom || 'Showroom 156 Trần Quang Khải, TP.HCM' } },
      { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: params.pickupDate || `${giftDate.day}/${giftDate.month}/${giftDate.year}` } }
    ];

    // Nếu deal chỉ có 1 SOW item (không có photo post và video 2) -> dọn sạch các text thừa trong bảng Điều 1
    if (sowItems.length === 1) {
      giftRequests.push(
        { replaceAllText: { containsText: { text: 'Photo Post', matchCase: false }, replaceText: '' } },
        { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: '' } },
        { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: '' } },
        { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: sowItems[0].airDate || params.postDate || `${giftDate.day}/${giftDate.month}/${giftDate.year}` } },
        { replaceAllText: { containsText: { text: '16/10/2026', matchCase: false }, replaceText: '' } }
      );
    }

    await docs.documents.batchUpdate({
      documentId: giftDocId,
      requestBody: { requests: giftRequests }
    });

    createdDocs.push({
      type: `Gift_${i + 1}`,
      title: giftDocTitle,
      id: giftDocId,
      totalValue: groupTotalVal,
      products: groupProductNames,
      url: `https://docs.google.com/document/d/${giftDocId}/edit`
    });
  }

  console.log(`\nHOÀN THÀNH TẠO BỘ HỢP ĐỒNG:`);
  createdDocs.forEach((d, idx) => console.log(`  ${idx + 1}. [${d.type}] ${d.title} -> ${d.url}`));

  return {
    isSingleContract: totalContractsCount === 1,
    kocFolderName: kocFolderName,
    targetFolderUrl: `https://drive.google.com/drive/folders/${targetFolderId}`,
    targetFolderId: targetFolderId,
    contracts: createdDocs
  };
}

module.exports = { generateSplittedContracts };
