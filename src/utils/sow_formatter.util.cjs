/**
 * Helper chuẩn hóa và định dạng SOW (Hạng mục hợp tác), Chi tiết sản phẩm,
 * và Thuế TNCN cho Hợp đồng Booking KOC Saga theo đúng yêu cầu V4.0.
 */

/**
 * Định dạng 01 dòng Điều 1.3 theo đúng quy chuẩn:
 * "Đăng 01 hạng mục -bộ ảnh/video- -nền tảng chính- (Reup -thể loại Reels/Story- -nền tảng phụ- ) (thời lượng) “rút gọn 1 câu khái quát từ định hướng kịch bản” vào ngày air"
 * 
 * Ví dụ:
 * - Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 27/10/2026
 * - Đăng 01 photo post Instagram (Reup Threads, Tiktok -  trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 27/10/2026 - 15/10/2026
 */
function formatSowItemSentence(item) {
  if (typeof item === 'string') {
    return item;
  }

  const category = item.category || (item.type === 'Photo' ? 'photo post' : 'Video'); // 'Video' | 'photo post' | 'Bộ ảnh'
  const mainPlatform = item.mainPlatform || 'Tiktok';
  const duration = item.duration || (category === 'Video' ? '60-90s' : '4-6 ảnh');
  const concept = item.concept || item.scriptSummary || item.title || 'Review đồng hồ Saga';
  const airDate = item.airDate || item.postDate || '27/10/2026';

  let reupPart = '';
  if (item.reupPlatform) {
    const reupType = item.reupType ? `${item.reupType} ` : 'Reels, Story ';
    reupPart = ` (Reup ${reupType}${item.reupPlatform})`;
  } else if (item.reup) {
    reupPart = ` (${item.reup})`;
  }

  let conceptWrap = `“${concept}”`;
  if (item.conceptNote) {
    conceptWrap = `${conceptWrap} ${item.conceptNote}`;
  }

  return `Đăng 01 ${category} ${mainPlatform}${reupPart} (${duration}) ${conceptWrap} vào ngày ${airDate}`;
}

/**
 * Định dạng thông tin chi tiết sản phẩm chuẩn hóa:
 * vd sản phẩm là Saga Stella 55757-hggvh-2
 * thì
 * - Thương hiệu: Saga
 * - Số hiệu sản phẩm: 55757-hggvh-2
 * - Bộ sưu tập: Saga Stella
 * - Xuất xứ: Mỹ
 * - Máy: Quartz (Pin)
 * - Bảo Hành Quốc Tế: 2 Năm
 */
function formatProductDetails(product) {
  const brand = product.brand || 'Saga';
  
  // Tách mã sản phẩm và bộ sưu tập nếu có
  let code = product.code || '';
  let name = product.name || '';
  let collection = product.collection || '';

  if (!code && name) {
    // Tìm mã sản phẩm (thường có định dạng số-chữ như 53578-LGSVLG-2 hoặc 55757-hggvh-2)
    const match = name.match(/([0-9]{4,6}-[A-Za-z0-9-]+)/);
    if (match) {
      code = match[1];
    }
  }

  if (!collection && name) {
    let clean = name.replace(/Đồng hồ|Dong ho/gi, '').trim();
    if (code) {
      clean = clean.replace(code, '').trim();
    }
    collection = clean.trim();
    if (!collection.toLowerCase().startsWith('saga')) {
      collection = `Saga ${collection}`.trim();
    }
  }

  if (!collection) {
    collection = 'Saga Stella';
  }

  const origin = product.origin || 'Mỹ';
  const movement = product.movement || 'Quartz (Pin)';
  const warranty = product.warranty || '2 Năm';

  return `- Thương hiệu: ${brand}\n- Số hiệu sản phẩm: ${code || 'Đang cập nhật'}\n- Bộ sưu tập: ${collection}\n- Xuất xứ: ${origin}\n- Máy: ${movement}\n- Bảo Hành Quốc Tế: ${warranty}`;
}

module.exports = {
  formatSowItemSentence,
  formatProductDetails
};
