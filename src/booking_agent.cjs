const { generateSplittedContracts } = require('./action_contract.cjs');
const { executeThucThi1 } = require('./action_thucthi1.cjs');
const { executeSyncMaterials } = require('./action_materials.cjs');
const { executeSyncPost } = require('./action_post.cjs');

/**
 * Controller trung tâm của Antigravity Agent
 */
class BookingAgent {
  /**
   * Bước: Tạo Hợp Đồng Google Doc (Khi bạn nhắn "tiến hành")
   * Quy tắc mới:
   * 1. Hủy tạo PDF (Chỉ tạo Google Doc)
   * 2. Nếu vừa có Cast vừa có SP -> Tách HĐ Thương Mại (Cast) riêng và HĐ Tặng SP riêng.
   * 3. Nếu tổng giá trị sản phẩm > 20 triệu -> Tách thành nhiều HĐ sao cho mỗi HĐ <= 20 triệu.
   * 4. Tất cả các file HĐ để chung trong 1 thư mục KOC mới nằm trong thư mục Tháng.
   * 5. Dùng lại thư mục Tháng có sẵn nếu đã có, không tạo thêm thư mục Tháng trùng lặp!
   */
  static async handleCreateContract(params) {
    return await generateSplittedContracts(params);
  }

  /**
   * Bước 1: Xử lý lệnh "Thực thi 1" (Sau khi bạn đã check và duyệt Hợp đồng)
   * Bao gồm:
   * 1. Sinh các Draft Mail xuất hàng linh hoạt (Tặng / Tặng & Mượn / Mượn + 3 Luồng kho luân chuyển)
   * 2. Tự sinh Phiếu ĐNTT (nếu có Cast) vào thư mục [6] Kết toán tháng kèm tính thuế TNCN chuẩn
   * 3. Tự động ghi dòng mới sang Sheet "CSC - Saga" (Ảnh 1)
   */
  static async handleThucThi1(data) {
    return await executeThucThi1(data);
  }

  /**
   * Bước 2: Xử lý Media Materials (Khi KOC gửi link Drive)
   * Bao gồm:
   * 1. Tự tạo folder YYYY / YYYY-MM-DD - KOC / Video & Hình ảnh (Nếu năm YYYY đã có thì KHÔNG tạo thêm)
   * 2. Copy & Đổi tên file chuẩn Saga 100%:
   *    KOC SAGA, TÊN KOC, tên sản phẩm, thể loại - tóm tắt nội dung video
   * 3. Ghi đồng bộ sang Sheet "SL materials - Saga v1" (Ảnh 2)
   */
  static async handleMaterials(mediaData) {
    return await executeSyncMaterials(mediaData);
  }

  /**
   * Bước 3: Cập nhật Báo cáo Post (Khi KOC air bài)
   * Ghi nhận sang Sheet "2 SL post & ĐTT - Saga" (Ảnh 3)
   */
  static async handlePostAir(postData) {
    return await executeSyncPost(postData);
  }
}

module.exports = { BookingAgent };
