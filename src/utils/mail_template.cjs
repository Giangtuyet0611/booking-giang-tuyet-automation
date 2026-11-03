/**
 * Module sinh nội dung Draft Mail xuất sản phẩm KOC chuẩn chỉnh 100% (V4.0)
 * GOM CHUNG TẤT CẢ CÁC ĐOẠN XUẤT HÀNG TRONG 1 EMAIL DUY NHẤT (Theo đúng Ảnh 3)
 * 
 * QUY TẮC NGUỒN XUẤT HÀNG:
 * - Khi xuất từ nhiều nguồn đến:
 *   + Mục Kho XNH: CHỈ ghi các sản phẩm xuất từ Kho XNH.
 *   + Mục Điều hàng Showroom: CHỈ ghi các sản phẩm điều từ Showroom đó.
 *   + Mục Xuất tại Showroom nhận: Ghi TẤT CẢ các sản phẩm KOC nhận tại đây (Xuất 0đ).
 */

function generateUnifiedDispatchEmail(params) {
  const {
    kocName,
    kocFullName = params.kocName,
    kocPhone,
    kocCccd,
    
    // Nguồn xuất hàng:
    // 1. Kho XNH (Chị Ngọc) - list 120 sản phẩm tài trợ
    xnhProducts = params.xnhProducts || [], // [{ name, qty }]
    
    // 2. Điều hàng từ Showroom khác
    transferShowrooms = params.transferShowrooms || [], // [{ sourceShowroom, products: [{ name, qty }] }]
    
    // 3. Toàn bộ sản phẩm quà tặng KOC nhận tại showroom
    giftProducts = params.giftProducts || [], // TẤT CẢ sản phẩm tặng KOC nhận tại showroom
    
    // Sản phẩm mượn (nếu có)
    hasBorrow = params.hasBorrow || false,
    borrowProduct = params.borrowProduct || '',
    borrowProductQty = params.borrowProductQty || '01',
    borrowDate = params.borrowDate || '',
    returnDate = params.returnDate || '',

    // Showroom KOC đến nhận
    targetShowroom = params.targetShowroom || 'Showroom 190D',
    targetShowroomAddress = params.targetShowroomAddress || '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh, Việt Nam',
    storePic = params.storePic || 'chị BA - Trần Thúy My', // Phụ trách nhận tại showroom
    pickupDate = params.pickupDate || '',
    needDate = params.needDate
  } = params;

  // Tính ngày cửa hàng cần nhận được (thường trừ 01 ngày so với ngày KOC đến lấy)
  let calculatedNeedDate = needDate;
  if (!calculatedNeedDate && pickupDate && pickupDate.includes('/')) {
    const parts = pickupDate.split('/');
    const d = parseInt(parts[0], 10);
    const prevD = d > 1 ? String(d - 1).padStart(2, '0') : parts[0];
    calculatedNeedDate = `${prevD}/${parts[1]}/${parts[2]}`;
  } else if (!calculatedNeedDate) {
    calculatedNeedDate = pickupDate;
  }

  const sections = [];

  // =========================================================================
  // ĐOẠN 1: GỬI CHỊ THỊ KIM NGỌC TRẦN (NẾU CÓ XUẤT TỪ KHO XNH)
  // Chỉ ghi ĐÚNG các sản phẩm xuất từ kho XNH
  // =========================================================================
  if (xnhProducts && xnhProducts.length > 0) {
    let lines = '';
    xnhProducts.forEach(p => {
      lines += `-- ${p.qty || '01'} ${p.name || p.code}\n`;
    });

    sections.push(`Dear chị @Thị Kim Ngọc Trần,
Em có booking KOC ${kocFullName} review đồng hồ Saga. Em cần xuất sản phẩm trong list 120 sản phẩm Saga hãng tài trợ.
Sản phẩm xuất:
${lines.trim()}
- Thông tin xuất: Xuất đưa cho ${storePic}, xuất tới ${targetShowroom}, địa chỉ: ${targetShowroomAddress}
- Ngày cửa hàng cần nhận được: ${calculatedNeedDate}
Nhờ chị Kim Liên Liềng xác nhận giúp em nhé! Em xin cảm ơn.`);
  }

  // =========================================================================
  // ĐOẠN 2: GỬI SHOWROOM CẦN ĐIỀU HÀNG (NẾU CÓ ĐIỀU TỪ SHOWROOM KHÁC)
  // Chỉ ghi ĐÚNG các sản phẩm điều từ showroom đó
  // =========================================================================
  if (transferShowrooms && transferShowrooms.length > 0) {
    transferShowrooms.forEach(ts => {
      let lines = '';
      (ts.products || []).forEach(p => {
        lines += `Sản phẩm xuất: ${p.qty || '01'} ${p.name || p.code}\nSố lượng: ${p.qty || '1'}\n`;
      });

      sections.push(`Dear anh/chị @${ts.sourceShowroom} CH,
Em có booking KOC ${kocFullName} review đồng hồ Saga. Em cần xuất sản phẩm tại cửa hàng:
${lines.trim()}
- Thông tin xuất: Xuất đưa cho ${storePic}, xuất tới ${targetShowroom}, địa chỉ: ${targetShowroomAddress}
Ngày cửa hàng cần nhận được: ${calculatedNeedDate} (trừ 01 ngày so với ngày bạn đến lấy)`);
    });
  }

  // =========================================================================
  // ĐOẠN 3: GỬI SHOWROOM BẠN KOC ĐẾN NHẬN HÀNG (XUẤT GIÁ 0Đ + MƯỢN NẾU CÓ)
  // Ghi TẤT CẢ các sản phẩm quà tặng + mượn mà KOC sẽ nhận tại showroom này
  // =========================================================================
  let linesGift = '';
  (giftProducts || []).forEach(p => {
    linesGift += `-- ${p.qty || '01'} ${p.name || p.code}\n`;
  });

  let borrowSection = '';
  if (hasBorrow && borrowProduct) {
    borrowSection = `\nNgoài ra, em cần xuất thêm 1 sản phẩm cho KOC Mượn, chi tiết như sau: Sản phẩm xuất: ${borrowProduct} (Xuất kèm theo hộp Saga vuông đỏ kèm dây ruy băng, túi giấy đỏ)
- Số lượng: ${borrowProductQty}
- Ngày mượn: ${borrowDate || pickupDate}
- Ngày trả: ${returnDate}
- Thông tin cửa hàng xuất: ${targetShowroom}, địa chỉ: ${targetShowroomAddress}`;
  }

  const giftCount = (giftProducts || []).reduce((sum, p) => sum + parseInt(p.qty || '1', 10), 0);
  const giftCountText = giftCount < 10 ? '0' + giftCount : giftCount;

  let conditionText = '';
  if (giftCount > 0 && hasBorrow) {
    conditionText = `Chỉ xuất ${giftCountText} sản phẩm tặng và ${borrowProductQty} sản phẩm mượn (Đã nêu rõ ở trên)`;
  } else if (hasBorrow) {
    conditionText = `Chỉ xuất ${borrowProductQty} sản phẩm mượn (Đã nêu rõ ở trên)`;
  } else {
    conditionText = `Chỉ xuất ${giftCountText} sản phẩm tặng (Đã nêu rõ ở trên)`;
  }

  sections.push(`Dear anh/chị @${targetShowroom} CH,
Anh/chị xuất giúp em, các mẫu đồng hồ sau, khi sản phẩm đến cửa hàng:
${linesGift.trim()}
Thông qua thao tác xuất 0 đồng (bao gồm hộp Saga vuông đỏ kèm dây ruy băng, túi giấy đỏ và BOM đi kèm không xuất gói bảo hành mở rộng của Hải Triều) tại cửa hàng tặng cho KOC ${kocName} và chụp đồng hồ.
- Thông tin cửa hàng xuất: ${targetShowroom}, địa chỉ: ${targetShowroomAddress}
Thông tin xuất hóa đơn:
- Tên khách hàng xuất hóa đơn: ${kocFullName.toUpperCase()}
- Số điện thoại xuất hóa đơn: ${kocPhone || ''}
- Thao tác xuất: Xuất giá 0 đồng
- Ghi chú: Xuất kèm theo hộp Saga, túi giấy, xuất BOM đi kèm không xuất gói bảo hành mở rộng của Hải Triều${borrowSection}

Lưu ý: ${conditionText} tại cửa hàng cho KOC tại cửa hàng chỉ khi:
KOC đến cửa hàng và xuất trình Căn cước công dân gốc của bạn ${kocFullName.toUpperCase()} (Số CCCD: ${kocCccd || ''})
Nhờ chị Kim Liên Liềng xác nhận giúp em nhé! Em xin cảm ơn.
Cảm ơn anh/chị và chúc anh/chị một ngày tốt lành!`);

  // Gom tất cả các đoạn thành 1 email duy nhất ngăn cách bằng dòng gạch ngang (Ảnh 3)
  const unifiedBody = sections.join('\n\n----------------\n\n');

  return {
    subject: `Marketing - Xuất sản phẩm KOC ${kocFullName}`,
    body: unifiedBody,
    to: `${targetShowroom} CH <showroom@donghohaitrieu.vn>`,
    cc: `Kim Liên Liềng <kimlien@donghohaitrieu.vn>${(xnhProducts && xnhProducts.length > 0) ? ', Thị Kim Ngọc Trần <kimngoc@donghohaitrieu.vn>' : ''}`
  };
}

module.exports = { generateUnifiedDispatchEmail };
