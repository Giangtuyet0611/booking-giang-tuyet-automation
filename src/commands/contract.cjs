const fs = require('fs');
const { getClients } = require('../lib/google.cjs');
const { getOrCreateSubfolder } = require('../utils/drive_folder.util.cjs');
const { verifyContract } = require('./verify_contract.cjs');
const { handleSplitContract } = require('../lib/split_contract.cjs');

function numberToVietnameseWords(num) {
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const units = ['', 'nghìn', 'triệu', 'tỷ'];

  if (num === 0) return 'không đồng';
  let strNum = Math.round(num).toString();
  
  const chunks = [];
  while (strNum.length > 0) {
    chunks.unshift(strNum.slice(-3));
    strNum = strNum.slice(0, -3);
  }

  function readChunk(chunk, isHighest) {
    const n = parseInt(chunk, 10);
    if (n === 0) return '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    let res = '';

    if (h > 0 || !isHighest) {
      res += digits[h] + ' trăm ';
    }

    if (t === 0 && o > 0) {
      if (h > 0 || !isHighest) res += 'lẻ ';
      res += digits[o];
    } else if (t === 1) {
      res += 'mười ';
      if (o === 1) res += 'một';
      else if (o === 5) res += 'lăm';
      else if (o > 0) res += digits[o];
    } else if (t > 1) {
      res += digits[t] + ' mươi ';
      if (o === 1) res += 'mốt';
      else if (o === 5) res += 'lăm';
      else if (o > 0) res += digits[o];
    }

    return res.trim();
  }

  let words = '';
  const totalChunks = chunks.length;
  for (let i = 0; i < totalChunks; i++) {
    const chunkWords = readChunk(chunks[i], i === 0);
    if (chunkWords) {
      const unitIndex = totalChunks - 1 - i;
      words += chunkWords + ' ' + (units[unitIndex] || '') + ' ';
    }
  }

  words = words.trim().replace(/\s+/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatSowItemSentence(item) {
  const category = item.category || 'Video';
  const platform = item.platform || 'Tiktok';
  const duration = item.qty || item.duration || (category.includes('Photo') ? '6-8 ảnh' : '60-90s');
  const concept = item.concept || item.title || 'Review đồng hồ Saga';
  const airDate = item.airDate || '27/11/2026';

  let reupPart = '';
  if (item.reup) {
    const reupType = category.includes('Photo') ? '' : 'Reels, Story ';
    reupPart = ` (Reup ${reupType}${item.reup})`.trim();
  }

  let noteWrap = '';
  if (item.note) {
    noteWrap = ` (${item.note})`;
  }

  return `Đăng 01 ${category} ${platform}${reupPart} (${duration}) “${concept}” vào ngày ${airDate}${noteWrap}`.trim();
}

async function handleContractCommand(deal, options = {}) {
  const { drive, docs, config } = getClients();

  const fileMemRootId = config.CONTRACT_TARGET_ROOT_FOLDER_ID;
  const templateGiftDocId = config.CONTRACT_TEMPLATE_DOC_ID;

  const bookingDate = deal.bookingDate || new Date().toISOString().split('T')[0];
  const [yearStr, monthStr, dayStr] = bookingDate.split('-');
  const monthFolderName = `Tháng ${parseInt(monthStr, 10)}`;

  const monthFolderId = await getOrCreateSubfolder(drive, fileMemRootId, monthFolderName);

  // Nếu deal vừa có Cast > 0 vừa có sản phẩm tặng -> Tách thành Thư mục tổng + HĐ Cast + HĐ Tặng SP
  if (deal.cast && Number(deal.cast.amount || 0) > 0 && deal.products && deal.products.length > 0) {
    console.log(`\n============================================================`);
    console.log(`TIẾN HÀNH TÁCH HỢP ĐỒNG (CAST + GIFT): ${deal.koc.name}`);
    console.log(`============================================================\n`);
    return handleSplitContract({
      drive,
      docs,
      config,
      deal,
      monthFolderId,
      numberToVietnameseWords,
      options
    });
  }

  const kocName = deal.koc.name;
  const kocFullName = deal.koc.fullName.toUpperCase();
  const docTitle = `${bookingDate} - ${kocName} - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều`;

  console.log(`\n============================================================`);
  console.log(`TIẾN HÀNH TẠO HỢP ĐỒNG: ${docTitle}`);
  console.log(`============================================================\n`);

  let docId = options.docId || null;

  if (docId) {
    console.log(`-> Chế độ sửa trực tiếp trên Doc ID có sẵn: ${docId} (không tạo file mới)`);
  } else {
    // Kiểm tra file trùng
    const existingFiles = await drive.files.list({
      q: `'${monthFolderId}' in parents and name = '${docTitle}' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (existingFiles.data.files && existingFiles.data.files.length > 0) {
      if (!options.replace) {
        console.warn(`⚠️ File hợp đồng "${docTitle}" ĐÃ TỒN TẠI trên Drive (ID: ${existingFiles.data.files[0].id}).`);
        console.warn(`   Nếu muốn sửa trực tiếp trên file này, hãy truyền --doc-id ${existingFiles.data.files[0].id} hoặc --replace`);
        return {
          alreadyExists: true,
          docId: existingFiles.data.files[0].id,
          url: `https://docs.google.com/document/d/${existingFiles.data.files[0].id}/edit`
        };
      } else {
        console.log(`-> Đã bật --replace: Thử chuyển file cũ vào thùng rác...`);
        let allTrashed = true;
        for (const ef of existingFiles.data.files) {
          try {
            await drive.files.update({
              fileId: ef.id,
              supportsAllDrives: true,
              requestBody: { trashed: true }
            });
          } catch (err) {
            allTrashed = false;
            console.warn(`⚠️ Không đủ quyền xóa file ${ef.id} trên Shared Drive (${err.message}). Sẽ sửa trực tiếp trên file hiện có!`);
          }
        }
        if (!allTrashed) {
          docId = existingFiles.data.files[0].id;
        }
      }
    }
  }

  // 1. Copy template nếu chưa có docId
  if (!docId) {
    console.log(`1. Nhân bản từ template Google Doc...`);
    const copyRes = await drive.files.copy({
      fileId: templateGiftDocId,
      supportsAllDrives: true,
      requestBody: {
        name: docTitle,
        parents: [monthFolderId],
        mimeType: 'application/vnd.google-apps.document'
      }
    });
    docId = copyRes.data.id;
    console.log(`-> Doc ID mới: ${docId}`);
  } else {
    console.log(`1. Sử dụng Doc ID hiện có: ${docId} (sửa trực tiếp, không tạo file mới)...`);
  }

  // 2. Xóa Item 3 thừa trong Table 1 (Row 6) nếu deal chỉ có <= 2 hạng mục SOW
  if (deal.sow.length <= 2) {
    console.log(`2. Tối ưu Table 1: Loại bỏ hàng thừa Item 3 (Row 6)...`);
    const docPre = (await docs.documents.get({ documentId: docId })).data;
    const sowTablePre = docPre.body.content.find(el => el.table);
    if (sowTablePre && sowTablePre.table.tableRows.length >= 7) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [{
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: { index: sowTablePre.startIndex },
                rowIndex: 6
              }
            }
          }]
        }
      });
    }
  }

  // 3. Chuẩn bị các trường văn bản thay thế IN-PLACE (Giữ nguyên 100% format bảng và văn bản)
  const totalVal = deal.products.reduce((sum, p) => sum + Number(String(p.value || '0').replace(/[^0-9]/g, '')), 0);
  const totalValFormatted = totalVal.toLocaleString('vi-VN');
  const totalValInWords = numberToVietnameseWords(totalVal) + ' Việt Nam Đồng';

  const sowSentences = deal.sow.map(formatSowItemSentence).join('\n');

  const channelTiktokLine = deal.koc.channels?.tiktok ? `Là đại diện của kênh TikTok: ${deal.koc.channels.tiktok}` : '';
  const channelFacebookLine = deal.koc.channels?.facebook ? `Là đại diện của kênh Facebook: ${deal.koc.channels.facebook}` : '';

  const p0 = deal.products[0] || {};
  const productDetailText = `- Thương hiệu: ${p0.brand || 'Saga'}\n- Số hiệu sản phẩm: ${p0.code}\n- Bộ sưu tập: ${p0.collection || 'Saga'}\n- Xuất xứ: ${p0.origin || 'Mỹ'}\n- Máy: ${p0.movement || 'Quartz (Pin)'}\n- Bảo Hành Quốc Tế: ${p0.warranty || '2 Năm'}`;

  const requests = [
    // 0. THAY THẾ TOÀN BỘ CÂU SOW ĐIỀU 1.3 ĐẦU TIÊN (Tránh bị thay thế từng phần nhỏ làm sai lệch match string)
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, replaceText: sowSentences } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: '' } },

    // Dọn dẹp triệt để nếu sót cụm từ Loan Niệm
    { replaceAllText: { containsText: { text: '“Trend Loan Niệm”', matchCase: false }, replaceText: `“${deal.sow[0]?.concept || 'Saga'}”` } },
    { replaceAllText: { containsText: { text: '“Trend Loan Niệm”', matchCase: false }, replaceText: `“${deal.sow[0]?.concept || 'Saga'}”` } },
    { replaceAllText: { containsText: { text: 'trend Loan Niệm', matchCase: false }, replaceText: 'Saga' } },
    { replaceAllText: { containsText: { text: 'trend Loan Niệm', matchCase: false }, replaceText: 'Saga' } },

    // 1. Ngày ký
    { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: `ngày ${dayStr} tháng ${monthStr} năm ${yearStr}` } },

    // 2. Thông tin Bên B
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: kocFullName } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: deal.koc.address || '' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: deal.koc.cccd || '' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: deal.koc.phone || '' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: deal.koc.email || '' } },

    // 3. Kênh đại diện
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: channelFacebookLine || '' } },
    { replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: deal.koc.channels?.tiktok || '' } },
    { replaceAllText: { containsText: { text: 'https://www.instagram.com/waananh', matchCase: false }, replaceText: deal.koc.channels?.instagram || 'không có' } },
    { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'TikTok, Facebook' } },

    // 4. Kênh hiển thị trong bảng SOW và đại diện
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Facebook)` } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Facebook)` } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp  (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Facebook)` } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp  (Video Tiktok)', matchCase: false }, replaceText: `${kocName} (Facebook)` } },
    { replaceAllText: { containsText: { text: 'waananh (Instagram)', matchCase: false }, replaceText: `${kocName} (TikTok)` } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: 'waananh', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: 'Van Anh (alice)', matchCase: false }, replaceText: kocName } },
    { replaceAllText: { containsText: { text: 'Reup Reels, Story Instagram', matchCase: false }, replaceText: 'Reup Facebook' } },
    { replaceAllText: { containsText: { text: 'Reup Threads', matchCase: false }, replaceText: 'Reup Facebook' } },

    // 5. Cập nhật số lượng và ngày tháng trong Bảng SOW (Table 1)
    { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: deal.sow[1]?.airDate || deal.sow[0]?.airDate || '27/11/2026' } },
    { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: deal.sow[0]?.airDate || '27/11/2026' } },
    { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: deal.sow[1]?.qty || '01 video (60-90s)' } },
    { replaceAllText: { containsText: { text: '01 video', matchCase: false }, replaceText: deal.sow[0]?.qty || '01 bộ (6-8 ảnh)' } },

    // Hoán đổi Category để Row 1 là Photo Post và Row 3 là Video Post
    { replaceAllText: { containsText: { text: 'Video Post', matchCase: true }, replaceText: '__TEMP_VIDEO_CAT__' } },
    { replaceAllText: { containsText: { text: 'Photo Post', matchCase: true }, replaceText: 'Video Post' } },
    { replaceAllText: { containsText: { text: '__TEMP_VIDEO_CAT__', matchCase: true }, replaceText: 'Photo Post' } },

    // 6. Điều 1.1 & 1.2
    { replaceAllText: { 
      containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle)\u000b1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false },
      replaceText: '1.1. Thời lượng video: 60 giây đến 90 giây.\n1.2. Số lượng hình ảnh/một bộ: Từ 6 đến 8 ảnh/bộ.'
    } },

    // 7. Ràng buộc & Thời hạn SDHA
    { replaceAllText: { containsText: { text: '1.4. Thời gian hiển thị bài đăng: Trọn đời.', matchCase: false }, replaceText: '1.4. Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: 'Thời gian hiển thị bài đăng: 12 tháng', matchCase: false }, replaceText: 'Thời gian hiển thị bài đăng: Trọn đời.' } },
    { replaceAllText: { containsText: { text: 'Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: `Thời hạn sử dụng hình ảnh: ${deal.sdha || 'Trọn đời'}` } },
    { replaceAllText: { containsText: { text: '1.7. Thời hạn sử dụng hình ảnh: Trọn đời', matchCase: false }, replaceText: `1.7. Thời hạn sử dụng hình ảnh: ${deal.sdha || 'Trọn đời'}` } },
    { replaceAllText: { 
      containsText: { text: 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook\n', matchCase: false }, 
      replaceText: 'Gắn link sản phẩm ở cuối video post hoặc dưới phần bình luận của kênh Facebook; gắn voucher brand tặng 15% dưới phần bình luận của Facebook và TikTok\n' 
    } },

    // 8. BẢNG GIÁ TRỊ HỢP ĐỒNG (Table 2) - Thay thế in-place 100% giữ nguyên format
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: p0.code } },
    { replaceAllText: { containsText: { text: 'Đồng hồ SAGA 53578-LGSVLG-2', matchCase: false }, replaceText: `Đồng hồ SAGA ${p0.code}` } },
    { replaceAllText: { containsText: { text: 'Saga Stella Chance', matchCase: false }, replaceText: p0.collection || 'Saga Chroma Dance' } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga\n- Số hiệu sản phẩm: 53578-LGSVLG-2  \n- Bộ sưu tập: Saga Stella Chance  \n- Xuất xứ: Mỹ\n- Máy: Quartz (Pin)\n- Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetailText } },
    { replaceAllText: { containsText: { text: '- Thương hiệu: Saga - Số hiệu sản phẩm: 53578-LGSVLG-2   - Bộ sưu tập: Saga Stella Chance - Xuất xứ: Mỹ - Máy: Quartz (Pin) - Bảo Hành Quốc Tế: 2 Năm', matchCase: false }, replaceText: productDetailText } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: totalValFormatted } },
    { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: totalValInWords } },

    // 9. Showroom & Ngày nhận hàng (Điều 2.2)
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: deal.showroom.address || '' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: deal.showroom.pickupDate || '' } }
  ];

  console.log(`3. Cập nhật nội dung toàn văn bản và bảng in-place...`);
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });

  // 4. Tự động Verify chất lượng tài liệu
  console.log(`4. Tự động kiểm tra chất lượng tài liệu hợp đồng...`);
  const verifyResult = await verifyContract(docId);

  // 5. Lưu kết quả
  const contractResult = {
    contracts: [
      {
        type: 'Gift',
        id: docId,
        title: docTitle,
        url: `https://docs.google.com/document/d/${docId}/edit`,
        productCode: deal.products[0]?.code || '',
        productName: `Đồng hồ SAGA ${deal.products[0]?.code || ''}`,
        productValue: totalVal,
        sowCount: deal.sow.length
      }
    ],
    koc: {
      kocName: kocName,
      fullName: kocFullName,
      cccd: deal.koc.cccd,
      phone: deal.koc.phone,
      email: deal.koc.email,
      address: deal.koc.address,
      showroom: deal.showroom.address,
      pickupDate: deal.showroom.pickupDate
    },
    verified: verifyResult.allPass
  };

  fs.writeFileSync('d:/Booking/last_contract_result.json', JSON.stringify(contractResult, null, 2), 'utf8');

  console.log(`\n🎉 HOÀN THÀNH TẠO HỢP ĐỒNG:`);
  console.log(`👉 Link: https://docs.google.com/document/d/${docId}/edit`);
  console.log(`Trạng thái Verify: ${verifyResult.allPass ? 'TẤT CẢ PASS' : 'CÓ CẢNH BÁO'}`);

  return contractResult;
}

module.exports = { handleContractCommand };
