/**
 * Schema & validation cho dữ liệu Deal KOC Booking
 */

function normalizeDate(d) {
  if (!d) return '';
  return String(d).trim().replace(/\//g, '-');
}

function validateDeal(raw) {
  const errors = [];
  const deal = JSON.parse(JSON.stringify(raw)); // clone

  // 1. KOC Info
  if (!deal.koc) {
    errors.push('Thiếu khối thông tin KOC ("koc")');
  } else {
    if (!deal.koc.name) errors.push('Thiếu Tên KOC / Tên kênh ("koc.name")');
    if (!deal.koc.fullName) errors.push('Thiếu Họ và tên đầy đủ KOC ("koc.fullName")');
    if (!deal.koc.cccd) errors.push('Thiếu số CCCD của KOC ("koc.cccd")');
    if (!deal.koc.phone) errors.push('Thiếu số điện thoại KOC ("koc.phone")');
    if (!deal.koc.address) errors.push('Thiếu địa chỉ KOC ("koc.address")');
    deal.koc.fullName = (deal.koc.fullName || '').toUpperCase();
  }

  // 2. Showroom & Pickup
  if (!deal.showroom) {
    errors.push('Thiếu khối thông tin Showroom nhận hàng ("showroom")');
  } else {
    if (!deal.showroom.address && !deal.showroom.name) {
      errors.push('Thiếu địa chỉ showroom nhận hàng ("showroom.address")');
    }
    if (!deal.showroom.pickupDate) {
      errors.push('Thiếu ngày nhận hàng dự kiến ("showroom.pickupDate")');
    }
  }

  // 3. SOW
  if (!deal.sow || !Array.isArray(deal.sow) || deal.sow.length === 0) {
    errors.push('Thiếu danh sách hạng mục hợp tác ("sow")');
  } else {
    deal.sow.forEach((item, idx) => {
      if (!item.airDate) errors.push(`Hạng mục SOW #${idx + 1} thiếu ngày air bài ("airDate")`);
      if (!item.concept && !item.title) errors.push(`Hạng mục SOW #${idx + 1} thiếu định hướng kịch bản/nội dung ("concept")`);
      // Chuẩn hóa category
      if (!item.category) {
        item.category = (item.type === 'Photo' || (item.qty && item.qty.includes('ảnh'))) ? 'Photo Post' : 'Video Post';
      }
      if (!item.platform) item.platform = 'Tiktok';
      if (!item.reup) item.reup = 'Facebook';
    });
  }

  // 4. Products & Cast
  deal.products = deal.products || [];
  deal.products.forEach(p => {
    if (!p.code) errors.push('Sản phẩm tặng thiếu mã sản phẩm ("code")');
    p.brand = p.brand || 'Saga';
    p.origin = p.origin || 'Mỹ';
    p.movement = p.movement || 'Quartz (Pin)';
    p.warranty = p.warranty || '2 Năm';
    p.name = `Đồng hồ SAGA ${p.code}`;
  });

  deal.cast = deal.cast || { amount: 0, type: 'Net' };
  deal.bookingDate = deal.bookingDate || new Date().toISOString().split('T')[0];
  deal.pic = deal.pic || 'Giáng Tuyết';
  deal.sdha = deal.sdha || 'Trọn đời';

  return {
    valid: errors.length === 0,
    errors,
    deal
  };
}

module.exports = {
  validateDeal
};

