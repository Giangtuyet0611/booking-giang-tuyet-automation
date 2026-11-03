const { generateSplittedContracts } = require('./action_contract.cjs');
const fs = require('fs');

async function main() {
  const params = {
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
    bookingDate: '2026-10-26',
    castAmount: '15000000',
    castType: 'Net',
    bankAccount: '000123456789',
    bankName: 'Vietcombank – Chi nhánh TP.HCM',
    showroom: 'Showroom Đồng Hồ Hải Triều - 156 Trần Quang Khải, TP.HCM',
    showroomContact: 'Trần Thu Hà',
    pickupDate: '27/10/2026',
    postDate: '27/10/2026',
    sdha: '03 tháng kể từ ngày đăng',
    products: [
      { name: 'Saga Stella Crystal Silver', code: 'SAG-TEST-001', value: 12900000, valueText: 'Mười hai triệu chín trăm nghìn đồng' },
      { name: 'Saga Elegance Rose Gold', code: 'SAG-TEST-002', value: 13500000, valueText: 'Mười ba triệu năm trăm nghìn đồng' },
      { name: 'Saga Charm Blue Pearl', code: 'SAG-TEST-003', value: 12800000, valueText: 'Mười hai triệu tám trăm nghìn đồng' },
      { name: 'Saga Luxury Diamond Gold', code: 'SAG-TEST-004', value: 14200000, valueText: 'Mười bốn triệu hai trăm nghìn đồng' }
    ],
    borrowProducts: [
      { name: 'Saga Stella Black Diamond', code: 'SAG-TEST-005', borrowDate: '26/10/2026', returnDate: '29/10/2026' }
    ]
  };

  const result = await generateSplittedContracts(params);
  fs.writeFileSync('d:/Booking/last_contract_result.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('Result saved to d:/Booking/last_contract_result.json');
}

main().catch(err => {
  console.error('Error generating contracts:', err);
  process.exit(1);
});
