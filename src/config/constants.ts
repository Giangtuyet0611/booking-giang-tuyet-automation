export const SHEET_NAMES = {
  SETTINGS: "⚙️ Cấu hình",
  BOOKING: "📋 01_Booking & Hợp Đồng",
  POST_REPORT: "📊 02_Báo Cáo Post",
  MATERIALS: "🎬 03_Thành Phẩm Media"
};

export const CONTRACT_TEMPLATE_NAMES: Record<string, string> = {
  "Tặng sản phẩm": "Mau_01_Tang_San_Pham",
  "Tặng sản phẩm + mượn thêm sản phẩm": "Mau_02_Tang_Va_Muon_San_Pham",
  "Only Cast": "Mau_03_Only_Cast",
  "Only Cast + Thuế": "Mau_04_Only_Cast_Co_Thue",
  "Cast + mượn sản phẩm": "Mau_05_Cast_Va_Muon_San_Pham"
};

export const NAMING_CONVENTIONS = {
  CONTRACT_DOC: "{{DATE}} - {{KOC_NAME}} - Hợp Đồng Booking Saga",
  PAYMENT_REQUEST: "{{DATE}} - {{KOC_NAME}} - Phiếu Đề Nghị Thanh Toán",
  MEDIA_FILE: "KOC SAGA, {{KOC_NAME}}, {{PRODUCT_NAME}}, {{FORMAT}} - {{SUMMARY}}",
  MEDIA_FOLDER: "{{DATE}} - {{KOC_NAME}}"
};
