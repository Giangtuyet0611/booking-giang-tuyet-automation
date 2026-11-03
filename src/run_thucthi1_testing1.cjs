const { executeThucThi1 } = require('./action_thucthi1.cjs');
const fs = require('fs');

async function run() {
  const data = {
    kocName: 'Minh Anh Daily',
    kocFullName: 'NGUYỄN LÊ MINH ANH',
    phone: '0900000000',
    cccd: '000000000000',
    bookingDate: '28/10/2026',
    pic: 'Giáng Tuyết',

    // Phân bổ xuất kho
    showroom: 'Showroom 190D',
    showroomAddress: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh',
    storePic: 'chị BA - Trần Thúy My',
    pickupDate: '05/11/2026',
    needDate: '04/11/2026',

    // Nguồn 1: Kho XNH (Chị Ngọc)
    xnhProducts: [
      { name: 'Đồng hồ Saga Stella Chance (53578-LGSVWH-2)', qty: '01' },
      { name: 'Đồng hồ Saga Stella Rectangle (71836-SVSVSV-2)', qty: '01' }
    ],

    // Nguồn 2: Điều hàng từ Showroom Phan Văn Trị
    transferShowrooms: [
      {
        sourceShowroom: 'Phan Văn Trị',
        products: [
          { name: 'Đồng hồ Saga Stella (53375-SVMWBK-2)', qty: '01' }
        ]
      }
    ],

    // Nguồn 3: Showroom nhận (KOC nhận tất cả SP tặng + mượn tại đây)
    giftProducts: [
      { name: 'Đồng hồ Saga Stella Chance (53578-LGSVWH-2)', qty: '01' },
      { name: 'Đồng hồ Saga Stella Rectangle (71836-SVSVSV-2)', qty: '01' }
    ],
    hasBorrow: true,
    borrowProduct: 'Đồng hồ Saga Stella (53375-SVMWBK-2)',
    borrowProductQty: '01',
    borrowDate: '05/11/2026',
    returnDate: '08/11/2026',

    // Cast & Phiếu ĐNTT (Net: 7.000.000 VNĐ)
    castAmount: 7000000,
    castType: 'Net',
    isGross: false,
    splitPhases: true,
    bankAccount: '0000000000',
    bankName: 'Vietcombank – Chi nhánh TP.HCM',
    paymentDateRange: 'Trong vòng 7 ngày làm việc',

    // Sheet CSC - Saga
    productName: 'Saga Stella Chance 53578-LGSVWH-2\nSaga Stella Rectangle 71836-SVSVSV-2',
    totalProductValue: '21.490.000 đ'
  };

  console.log('--- KHỞI CHẠY THỰC THI 1 CHO TESTING 1 ---');
  const result = await executeThucThi1(data);
  console.log('--- KẾT QUẢ THỰC THI 1 ---');
  console.log(JSON.stringify(result, null, 2));

  fs.writeFileSync('d:/Booking/last_thucthi1_result.json', JSON.stringify(result, null, 2), 'utf8');
}

module.exports = { run };

if (require.main === module) {
  run().catch(console.error);
}
