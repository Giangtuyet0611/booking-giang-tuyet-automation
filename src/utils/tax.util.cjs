/**
 * Module tính thuế TNCN cho hợp đồng Booking KOC
 * 
 * Quy ước:
 * - Ngưỡng chịu thuế: từ 5.000.000 VNĐ trở lên (dưới 5tr thì thuế = 0đ).
 * - Trường hợp 1: Giá đã bao gồm thuế (isGross = true):
 *   Thực nhận = Số tiền - 10%
 *   Thuế đóng = 10%
 *   Ví dụ: 5.000.000đ -> thực nhận 4.500.000đ, thuế 500.000đ.
 * - Trường hợp 2: Giá chưa bao gồm thuế (isGross = false, tức Net):
 *   Thực nhận = Số tiền thỏa thuận
 *   Tổng chi phí công ty chi = Thực nhận / 0.9
 *   Thuế đóng = Tổng chi phí - Thực nhận
 *   Ví dụ: 5.000.000đ -> thực nhận 5.000.000đ, thuế 555.556đ, tổng cộng 5.555.556đ.
 */
function calculateTax(amount, isGross = true) {
  const numAmount = Number(String(amount).replace(/[^0-9]/g, ''));
  
  if (numAmount < 5000000) {
    return {
      taxApplicable: false,
      grossAmount: numAmount,
      taxAmount: 0,
      netAmount: numAmount,
      explanation: 'Dưới ngưỡng 5.000.000đ: Miễn khấu trừ thuế TNCN.'
    };
  }

  if (isGross) {
    // Giá đã bao gồm thuế (Gross)
    const taxAmount = Math.round(numAmount * 0.1);
    const netAmount = numAmount - taxAmount;
    return {
      taxApplicable: true,
      isGross: true,
      grossAmount: numAmount,
      taxAmount: taxAmount,
      netAmount: netAmount,
      explanation: `Đã bao gồm thuế TNCN 10%: Tổng chi phí ${numAmount.toLocaleString('vi-VN')} đ | Thuế khấu trừ: ${taxAmount.toLocaleString('vi-VN')} đ | KOC thực nhận: ${netAmount.toLocaleString('vi-VN')} đ`
    };
  } else {
    // Giá chưa bao gồm thuế (Net KOC thực nhận)
    const grossAmount = Math.round(numAmount / 0.9);
    const taxAmount = grossAmount - numAmount;
    return {
      taxApplicable: true,
      isGross: false,
      grossAmount: grossAmount,
      taxAmount: taxAmount,
      netAmount: numAmount,
      explanation: `Chưa bao gồm thuế (Net): KOC thực nhận ${numAmount.toLocaleString('vi-VN')} đ | Thuế công ty đóng thay: ${taxAmount.toLocaleString('vi-VN')} đ | Tổng chi phí đề nghị: ${grossAmount.toLocaleString('vi-VN')} đ`
    };
  }
}

module.exports = { calculateTax };
