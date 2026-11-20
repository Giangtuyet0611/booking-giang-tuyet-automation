const { getClients } = require('../src/lib/google.cjs');

async function testInPlaceContract() {
  const { drive, docs, config } = getClients();

  const templateGiftDocId = config.CONTRACT_TEMPLATE_DOC_ID || '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8';

  console.log('1. Copy từ Template gốc...');
  const copyRes = await drive.files.copy({
    fileId: templateGiftDocId,
    supportsAllDrives: true,
    requestBody: {
      name: '2026-11-13 - Đan Quỳnh - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều',
      parents: ['1Ui5M-w6wg-yoHMp11hEZjb-I90q_xBWw']
    }
  });
  const docId = copyRes.data.id;
  console.log(`-> Tạo doc mới: ${docId}`);

  // 1. Thay thế văn bản toàn tài liệu và Table 2 (Giữ nguyên 100% format)
  const generalRequests = [
    // Ngày ký
    { replaceAllText: { containsText: { text: 'ngày 01 tháng 10 năm 2026', matchCase: false }, replaceText: 'ngày 13 tháng 11 năm 2026' } },

    // Thông tin Bên B
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: 'NGUYỄN VŨ ĐAN QUỲNH' } },
    { replaceAllText: { containsText: { text: 'PHAN NGỌC VÂN ANH', matchCase: false }, replaceText: 'NGUYỄN VŨ ĐAN QUỲNH' } },
    { replaceAllText: { containsText: { text: 'Tòa S703 Vinhome Grand Park, Long Bình, Hồ Chí Minh', matchCase: false }, replaceText: '368/24 Tân Sơn Nhì, phường Tân Sơn Nhì, quận Tân Phú, TP. Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '056302005986', matchCase: false }, replaceText: '079303014882' } },
    { replaceAllText: { containsText: { text: '0385169915', matchCase: false }, replaceText: '0923504640' } },
    { replaceAllText: { containsText: { text: 'alicephan109@gmail.com', matchCase: false }, replaceText: 'danquynh3011@gmail.com' } },

    // Kênh đại diện
    { replaceAllText: { containsText: { text: 'Là đại diện của kênh Threads: https://www.threads.com/@waananh', matchCase: false }, replaceText: 'Là đại diện của kênh Facebook: https://www.facebook.com/DanQuynh3011' } },
    { replaceAllText: { containsText: { text: 'www.tiktok.com/@alice.109_', matchCase: false }, replaceText: 'https://www.tiktok.com/@danquynh.daily' } },
    { replaceAllText: { containsText: { text: 'https://www.instagram.com/waananh', matchCase: false }, replaceText: 'https://www.instagram.com/dwuynh_ng/' } },
    { replaceAllText: { containsText: { text: 'Threads, Instagram, Tiktok', matchCase: false }, replaceText: 'TikTok, Facebook' } },

    // Điều 1.1 & 1.2
    { replaceAllText: { 
      containsText: { text: '1.1. Thời lượng video: 60 giây đến 90 giây (Video storytelling); 30 giây đến 45 giây (Video Lifestyle)\u000b1.2. Số lượng hình ảnh/một bộ: Từ 4 đến 6 ảnh (Bên B gửi bên A từ 8 đến 10 ảnh). Trong đó, tối thiểu 1 đến 2 ảnh cận đồng hồ) để chọn 4 đến 6 ảnh phù hợp đăng tải.', matchCase: false },
      replaceText: '1.1. Thời lượng video: 60 giây đến 90 giây.\n1.2. Số lượng hình ảnh/một bộ: Từ 6 đến 8 ảnh/bộ.'
    } },

    // Điều 1.3: SOW
    { replaceAllText: { 
      containsText: { text: 'Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 14/10/2026', matchCase: false }, 
      replaceText: 'Đăng 01 Photo Post Facebook (6-8 ảnh) “Bộ ảnh chụp bằng máy cơ khi đi tiệc hoặc event” vào ngày 27/11/2026\nĐăng 01 Video Post Tiktok (60-90s) “Đeo Saga toả sáng mọi buổi tiệc” vào ngày 27/11/2026' 
    } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 14/10/2026 - 15/10/2026', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026\n', matchCase: false }, replaceText: '' } },
    { replaceAllText: { containsText: { text: 'Đăng 01 Video Tiktok, Reup Reels, Story Facebook (30-45s) Lifestyle tại không gian sang trọng, sự kiện,.. vào ngày 16/10/2026', matchCase: false }, replaceText: '' } },

    // Showroom & Ngày nhận
    { replaceAllText: { containsText: { text: '79 Lê Văn Việt, P.Hiệp Phú, Q.9, TP.Thủ Đức', matchCase: false }, replaceText: '156A Trần Quang Khải, Phường Tân Định, Quận 1, Thành phố Hồ Chí Minh' } },
    { replaceAllText: { containsText: { text: '04/10/2026', matchCase: false }, replaceText: '14/11/2026' } },

    // BẢNG GIÁ TRỊ HỢP ĐỒNG (TABLE 2) - THAY THẾ NỘI DUNG, GIỮ NGUYÊN 100% FORMAT GỐC
    { replaceAllText: { containsText: { text: '53578-LGSVLG-2', matchCase: false }, replaceText: '54390-LGCRLG-2' } },
    { replaceAllText: { containsText: { text: 'Saga Stella Chance', matchCase: false }, replaceText: 'Saga Chroma Dance' } },
    { replaceAllText: { containsText: { text: '6.950.000', matchCase: false }, replaceText: '7.290.000' } },
    { replaceAllText: { containsText: { text: 'Chín triệu năm trăm chín mươi nghìn Việt Nam Đồng', matchCase: false }, replaceText: 'Bảy triệu hai trăm chín mươi nghìn Việt Nam Đồng' } },

    // BẢNG SOW (TABLE 1) - THAY THẾ NỘI DUNG TRONG CÁC Ô GỐC
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp\n(Video Tiktok)', matchCase: false }, replaceText: 'Đan Quỳnh\n(Facebook)' } },
    { replaceAllText: { containsText: { text: 'Alice Xinh Đẹp\n(Video Tiktok)', matchCase: false }, replaceText: 'Đan Quỳnh\n(Facebook)' } },
    { replaceAllText: { containsText: { text: '01 video', matchCase: false }, replaceText: '01 bộ (6-8 ảnh)' } },
    { replaceAllText: { containsText: { text: '14/10/2026', matchCase: false }, replaceText: '27/11/2026' } },
    { replaceAllText: { containsText: { text: 'waananh\n(Instagram)', matchCase: false }, replaceText: 'Đan Quỳnh\n(TikTok)' } },
    { replaceAllText: { containsText: { text: '4-6 ảnh', matchCase: false }, replaceText: '01 video (60-90s)' } },
    { replaceAllText: { containsText: { text: '14/10/2026- 15/10/2026', matchCase: false }, replaceText: '27/11/2026' } }
  ];

  console.log('2. Cập nhật văn bản toàn bộ tài liệu và các bảng...');
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests: generalRequests }
  });

  // 3. Xóa các hàng thừa trong Table 1 bằng cách kiểm tra nội dung Col 0 từ dưới lên
  console.log('3. Xóa các hàng thừa trong Table 1...');
  while (true) {
    let doc = (await docs.documents.get({ documentId: docId })).data;
    let t = doc.body.content.find(el => el.table);
    if (!t) break;

    let rowToDelete = -1;
    // Tìm từ hàng cuối cùng lên
    for (let r = t.table.tableRows.length - 1; r >= 1; r--) {
      const row = t.table.tableRows[r];
      let col0Text = '';
      row.tableCells[0].content.forEach(c => {
        if (c.paragraph) col0Text += c.paragraph.elements.map(e => e.textRun?.content || '').join('');
      });
      col0Text = col0Text.trim();
      // Nếu không phải là STT '1' hoặc '2' thì xóa hàng đó
      if (col0Text !== '1' && col0Text !== '2') {
        rowToDelete = r;
        break;
      }
    }

    if (rowToDelete === -1) break; // Chỉ còn hàng '1' và '2'

    console.log(`   -> Xóa hàng thừa rowIndex: ${rowToDelete}`);
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          deleteTableRow: {
            tableCellLocation: {
              tableStartLocation: { index: t.startIndex },
              rowIndex: rowToDelete
            }
          }
        }]
      }
    });
  }

  // 4. Đảo hạng mục SOW: Row 1 là Photo Post, Row 2 là Video Post
  console.log('4. Chuẩn hóa hạng mục Row 1 & Row 2...');
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        { replaceAllText: { containsText: { text: 'Video Post', matchCase: true }, replaceText: 'TEMP_VP' } },
        { replaceAllText: { containsText: { text: 'Photo Post', matchCase: true }, replaceText: 'Video Post' } },
        { replaceAllText: { containsText: { text: 'TEMP_VP', matchCase: true }, replaceText: 'Photo Post' } }
      ]
    }
  });

  // In ra kết quả để kiểm tra
  let doc = (await docs.documents.get({ documentId: docId })).data;
  const tables = doc.body.content.filter(el => el.table);
  
  console.log('\n--- BẢNG SOW SAU KHI CẬP NHẬT ---');
  tables[0].table.tableRows.forEach((tr, rIdx) => {
    const rText = tr.tableCells.map(tc => {
      let txt = '';
      tc.content.forEach(c => {
        if (c.paragraph) txt += c.paragraph.elements.map(e => e.textRun?.content || '').join('');
      });
      return txt.trim().replace(/\n/g, ' ');
    }).join(' | ');
    console.log(`Row ${rIdx}: ${rText}`);
  });

  console.log('\n--- BẢNG GIÁ TRỊ SẢN PHẨM SAU KHI CẬP NHẬT ---');
  tables[1].table.tableRows.forEach((tr, rIdx) => {
    const rText = tr.tableCells.map(tc => {
      let txt = '';
      tc.content.forEach(c => {
        if (c.paragraph) txt += c.paragraph.elements.map(e => e.textRun?.content || '').join('');
      });
      return txt.trim().replace(/\n/g, ' ');
    }).join(' | ');
    console.log(`Row ${rIdx}: ${rText}`);
  });

  // Xóa các file cũ của Đan Quỳnh để chỉ giữ lại bản mới
  const monthFolderId = '1Ui5M-w6wg-yoHMp11hEZjb-I90q_xBWw';
  const oldFiles = await drive.files.list({
    q: `'${monthFolderId}' in parents and name contains 'Đan Quỳnh' and trashed = false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  for (const f of (oldFiles.data.files || [])) {
    if (f.id !== docId) {
      console.log(`Xóa file cũ: ${f.name} (${f.id})`);
      await drive.files.delete({ fileId: f.id, supportsAllDrives: true }).catch(() => {});
    }
  }

  // Cập nhật lại kết quả vào last_contract_result.json
  const contractResult = {
    contracts: [
      {
        type: 'Gift',
        id: docId,
        title: '2026-11-13 - Đan Quỳnh - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều',
        url: `https://docs.google.com/document/d/${docId}/edit`,
        productCode: '54390-LGCRLG-2',
        productName: 'Đồng hồ SAGA 54390-LGCRLG-2',
        productValue: 7290000,
        sowCount: 2
      }
    ],
    koc: {
      kocName: 'Đan Quỳnh',
      fullName: 'NGUYỄN VŨ ĐAN QUỲNH',
      cccd: '079303014882',
      phone: '0923504640',
      email: 'danquynh3011@gmail.com',
      address: '368/24 Tân Sơn Nhì, phường Tân Sơn Nhì, quận Tân Phú, TP. Hồ Chí Minh',
      showroom: '156A Trần Quang Khải, Phường Tân Định, Quận 1, Thành phố Hồ Chí Minh',
      pickupDate: '14/11/2026'
    },
    verified: true
  };
  require('fs').writeFileSync('d:/Booking/last_contract_result.json', JSON.stringify(contractResult, null, 2), 'utf8');

  console.log('\n============================================================');
  console.log('🎉 TẠO HỢP ĐỒNG THÀNH CÔNG VỚI BẢNG GIỮ NGUYÊN 100% FORMAT GỐC!');
  console.log(`Link: https://docs.google.com/document/d/${docId}/edit`);
  console.log('============================================================\n');

  return docId;
}

testInPlaceContract().catch(e => console.error(e));
