const fs = require('fs');
const path = require('path');
const { validateDeal } = require('../lib/deal.schema.cjs');

function parseDealText(text) {
  const deal = {
    bookingDate: new Date().toISOString().split('T')[0],
    pic: 'Giáng Tuyết',
    koc: {
      name: '',
      fullName: '',
      cccd: '',
      phone: '',
      email: '',
      address: '',
      channels: {
        tiktok: '',
        facebook: '',
        instagram: ''
      }
    },
    cast: {
      amount: 0,
      type: 'Net'
    },
    products: [],
    sow: [],
    sdha: 'Trọn đời',
    showroom: {
      address: '',
      pickupDate: ''
    },
    notes: []
  };

  // 1. KOC Name
  const dealMatch = text.match(/SAGA\s*x\s*([^\n(]+)/i);
  if (dealMatch) {
    deal.koc.name = dealMatch[1].trim();
  }

  // 2. Personal info
  const nameMatch = text.match(/Họ\s*tên\s*:\s*([^\n\r]+)/i);
  if (nameMatch) deal.koc.fullName = nameMatch[1].trim().toUpperCase();

  const cccdMatch = text.match(/(?:CCCD|Căn cước|Số CCCD)\s*:\s*([0-9]+)/i);
  if (cccdMatch) deal.koc.cccd = cccdMatch[1].trim();

  const phoneMatch = text.match(/(?:Số điện thoại|SĐT|Phone)\s*:\s*([0-9]+)/i);
  if (phoneMatch) deal.koc.phone = phoneMatch[1].trim();

  const emailMatch = text.match(/Email\s*(?:cá nhân)?\s*:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  if (emailMatch) deal.koc.email = emailMatch[1].trim();

  const addrMatch = text.match(/(?:Địa chỉ(?:\s*sau sáp nhập)?)\s*:\s*([^\n\r]+)/i);
  if (addrMatch) deal.koc.address = addrMatch[1].trim();

  // 3. Channels
  const tiktokMatch = text.match(/https?:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+/i);
  if (tiktokMatch) deal.koc.channels.tiktok = tiktokMatch[0].trim();

  const fbMatch = text.match(/https?:\/\/(?:www\.)?facebook\.com\/[^\s]+/i);
  if (fbMatch) deal.koc.channels.facebook = fbMatch[0].trim();

  const igMatch = text.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i);
  if (igMatch) deal.koc.channels.instagram = igMatch[0].trim();

  // 4. Products
  const prodCodeMatch = text.match(/([0-9]{5}-[A-Z0-9-]+)/i);
  const priceMatch = text.match(/trị giá\s*([0-9.,]+)\s*đ/i);
  if (prodCodeMatch) {
    const code = prodCodeMatch[1].trim();
    let val = 0;
    if (priceMatch) {
      val = Number(priceMatch[1].replace(/[^0-9]/g, ''));
    }
    deal.products.push({
      code,
      name: `Đồng hồ SAGA ${code}`,
      collection: code.startsWith('71959') ? 'Saga Lunar' : 'Saga Stella',
      value: val
    });
  }

  // 5. Showroom
  const showroomMatch = text.match(/(?:showroom Đồng Hồ Hải Triều[^:]*|Showroom nhận[^:]*)\s*:\s*([^\n\r(]+)/i);
  if (showroomMatch) {
    deal.showroom.address = showroomMatch[1].trim();
  }

  const pickupMatch = text.match(/Ngày nhận(?: hàng)?(?:\s*dự kiến)?\s*:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i);
  if (pickupMatch) {
    deal.showroom.pickupDate = pickupMatch[1].trim();
  } else {
    // Default pickup date to tomorrow if not specified
    const dt = new Date();
    dt.setDate(dt.getDate() + 1);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    deal.showroom.pickupDate = `${dd}/${mm}/${yyyy}`;
  }

  // 6. SOW extraction
  // Extract all air dates
  const airMatches = [...text.matchAll(/(?:air ngày|vào ngày)\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/gi)];
  if (airMatches.length > 0) {
    airMatches.forEach(am => {
      const airDate = am[1];
      deal.sow.push({
        category: 'Video Post',
        platform: 'Tiktok',
        reup: 'Facebook',
        qty: '01 video (60-90s)',
        concept: 'Review đồng hồ Saga',
        airDate: airDate
      });
    });
  }

  return deal;
}

function handleNewDealCommand(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`File input không tồn tại: ${inputPath}`);
  }

  const content = fs.readFileSync(inputPath, 'utf8');
  let dealData;
  if (inputPath.endsWith('.json')) {
    dealData = JSON.parse(content);
  } else {
    dealData = parseDealText(content);
  }

  const validation = validateDeal(dealData);
  if (!validation.valid) {
    console.warn('⚠️ Phát hiện các trường cần bổ sung trong Deal:');
    validation.errors.forEach(e => console.warn(`  - ${e}`));
  }

  const out = outputPath || `deals/${dealData.koc.name ? dealData.koc.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'new_deal'}.json`;
  fs.writeFileSync(out, JSON.stringify(validation.deal, null, 2), 'utf8');
  console.log(`\n✅ Đã sinh file Deal chuẩn tại: ${out}`);
  console.log(JSON.stringify(validation.deal, null, 2));

  return out;
}

module.exports = {
  parseDealText,
  handleNewDealCommand
};

