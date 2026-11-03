const { executeThucThi1 } = require('./action_thucthi1.cjs');
const fs = require('fs');

async function main() {
  const data = {
    kocName: 'Nguyễn Minh Anh',
    fullName: 'NGUYỄN THỊ MINH ANH',
    cccd: '079999001234',
    address: '25 Đường Số 8, TP. Thủ Đức, TP.HCM',
    phone: '0900000123',
    email: 'minhanh.koc.test@example.com',
    tiktokUrl: 'https://www.tiktok.com/@minhanh.koc.test',
    facebookUrl: 'https://www.facebook.com/minhanh.koc.test',
    instagramUrl: 'https://www.instagram.com/minhanh.koc.test',
    pic: 'Giáng Tuyết',
    bookingDate: '26/10/2026',
    
    // Cast
    castAmount: 15000000,
    castType: 'Net',
    bankAccount: '000123456789',
    bankName: 'Vietcombank – Chi nhánh TP.HCM',
    paymentDateRange: 'từ 27/10/2026 - 02/11/2026',

    // Sản phẩm tặng
    giftProducts: [
      { name: 'Saga Stella Crystal Silver (SAG-TEST-001)', qty: '01' },
      { name: 'Saga Elegance Rose Gold (SAG-TEST-002)', qty: '01' },
      { name: 'Saga Charm Blue Pearl (SAG-TEST-003)', qty: '01' },
      { name: 'Saga Luxury Diamond Gold (SAG-TEST-004)', qty: '01' }
    ],
    products: [
      { name: 'Saga Stella Crystal Silver', code: 'SAG-TEST-001', value: 12900000 },
      { name: 'Saga Elegance Rose Gold', code: 'SAG-TEST-002', value: 13500000 },
      { name: 'Saga Charm Blue Pearl', code: 'SAG-TEST-003', value: 12800000 },
      { name: 'Saga Luxury Diamond Gold', code: 'SAG-TEST-004', value: 14200000 }
    ],
    totalProductValue: '53.400.000 đ',

    // Sản phẩm mượn
    hasBorrow: true,
    borrowProducts: [
      { name: 'Saga Stella Black Diamond', code: 'SAG-TEST-005', borrowDate: '26/10/2026', returnDate: '29/10/2026' }
    ],
    borrowProduct: 'Saga Stella Black Diamond (SAG-TEST-005)',
    borrowProductQty: '01',
    borrowDate: '26/10/2026',
    returnDate: '29/10/2026',

    // Showroom nhận
    showroom: 'Showroom 156 Trần Quang Khải',
    showroomAddress: '156 Trần Quang Khải, TP.HCM',
    showroomContact: 'Trần Thu Hà',
    pickupDate: '27/10/2026',
    needDate: '26/10/2026'
  };

  const res = await executeThucThi1(data);
  fs.writeFileSync('d:/Booking/last_thucthi1_result.json', JSON.stringify(res, null, 2), 'utf8');
  console.log('Saved thucthi1 result to d:/Booking/last_thucthi1_result.json');
}

main().catch(err => {
  console.error('Error executing ThucThi1:', err);
  process.exit(1);
});
