const { generateSplittedContracts } = require('./action_contract.cjs');

async function run() {
  const params = {
    // 1. KOC & Pháp lý
    kocName: 'Minh Anh Daily',
    fullName: 'NGUYỄN LÊ MINH ANH',
    cccd: '000000000000',
    address: '123 Đường Nguyễn Văn Linh, Phường Tân Hưng, TP. Hồ Chí Minh',
    phone: '0900000000',
    email: 'minhanh.demo@example.com',
    tiktokUrl: 'https://www.tiktok.com/@minhanhdaily',
    facebookUrl: 'https://www.facebook.com/minhanhdaily',
    instagramUrl: 'https://www.instagram.com/minhanhdaily',
    platformsText: 'TikTok, Facebook, Instagram',
    pic: 'Giáng Tuyết',
    bookingDate: '2026-10-28',

    // 2. Phí Cast
    castAmount: 7000000,
    castType: 'Net',
    isGross: false,
    bankAccount: '0000000000',
    bankName: 'Vietcombank – Chi nhánh TP.HCM',
    accountHolder: 'NGUYỄN LÊ MINH ANH',

    // 3. Sản phẩm Tặng (Tổng 21.490.000 > 20M -> Tự động tách 2 HĐ Tặng)
    products: [
      {
        name: 'Đồng hồ Saga Stella Chance',
        code: '53578-LGSVWH-2',
        collection: 'Saga Stella Chance',
        value: 12590000,
        brand: 'Saga',
        origin: 'Mỹ',
        movement: 'Quartz (Pin)',
        warranty: '2 Năm'
      },
      {
        name: 'Đồng hồ Saga Stella Rectangle',
        code: '71836-SVSVSV-2',
        collection: 'Saga Stella Rectangle',
        value: 8900000,
        brand: 'Saga',
        origin: 'Mỹ',
        movement: 'Quartz (Pin)',
        warranty: '2 Năm'
      }
    ],

    // 4. Sản phẩm Mượn
    borrowProducts: [
      {
        name: 'Đồng hồ Saga Stella',
        code: '53375-SVMWBK-2',
        qty: '01',
        borrowDate: '05/11/2026',
        returnDate: '08/11/2026'
      }
    ],

    // 5. SDHA: 03 tháng
    sdha: '03 tháng kể từ ngày đăng (từ 06/11/2026 đến 06/02/2027)',

    // 6. Showroom nhận
    showroom: 'Showroom 190D',
    showroomAddress: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh',
    pickupDate: '05/11/2026',

    // 7. SOW chi tiết 3 hạng mục
    sowItems: [
      {
        category: 'Video',
        mainPlatform: 'Tiktok',
        reupPlatform: 'Facebook, Instagram',
        reupType: 'Reels, Story',
        duration: '60-90s',
        concept: 'Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm',
        airDate: '29/10/2026'
      },
      {
        category: 'photo post',
        mainPlatform: 'Tiktok',
        reupPlatform: 'Facebook, Instagram',
        reupType: '',
        duration: '6-8 ảnh',
        concept: 'đeo Saga đi sự kiện, không gian sang trọng,... (Có ảnh cận đồng hồ)',
        conceptNote: 'concept tiệc cuối năm',
        airDate: '29/10/2026'
      },
      {
        category: 'Video',
        mainPlatform: 'Tiktok',
        reupPlatform: 'Facebook, Instagram',
        reupType: 'Reels',
        duration: '30-45s',
        concept: 'Lifestyle cùng đồng hồ',
        airDate: '30/10/2026'
      }
    ],

    // SOW cho hợp đồng Cast
    sowCast: {
      category: 'Video',
      mainPlatform: 'Tiktok',
      reupPlatform: 'Facebook, Instagram',
      reupType: 'Reels, Story',
      duration: '60-90s',
      concept: 'Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm',
      airDate: '29/10/2026'
    }
  };

  console.log('--- KHỞI CHẠY TẠO BỘ HỢP ĐỒNG CHO TESTING 1 ---');
  const result = await generateSplittedContracts(params);
  console.log('\n--- KẾT QUẢ TẠO HỢP ĐỒNG TESTING 1 ---');
  console.log(JSON.stringify(result, null, 2));

  fs.writeFileSync('d:/Booking/last_contract_result.json', JSON.stringify(result, null, 2), 'utf8');
}

run().catch(console.error);
