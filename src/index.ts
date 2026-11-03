import { BookingHandler } from "./handlers/booking.handler";
import { MediaHandler } from "./handlers/media.handler";
import { Logger } from "./utils/logger.util";

/**
 * Tự động tạo Custom Menu khi mở file Google Sheets
 */
export function onOpen(): void {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🚀 SAGA Booking Automation")
    .addItem("▶ 1. Tạo HĐ & Đồng Bộ Tồn Kho/CSC (Dòng đang chọn)", "triggerGenerateContract")
    .addSeparator()
    .addItem("▶ 2. Tải, Đổi Tên Materials & Ghi Sheet (Dòng đang chọn)", "triggerProcessMaterials")
    .addSeparator()
    .addItem("▶ 3. Cập Nhật Báo Cáo Bài Đăng (Dòng đang chọn)", "triggerUpdatePostReport")
    .addToUi();
}

/**
 * Hàm kích hoạt Action 1: Tạo Hợp đồng & Đồng bộ Tồn Kho, CSC
 */
export function triggerGenerateContract(): void {
  BookingHandler.handleActiveRow();
}

/**
 * Hàm kích hoạt Action 2: Xử lý Materials Media
 */
export function triggerProcessMaterials(): void {
  MediaHandler.handleActiveMaterialRow();
}

/**
 * Hàm kích hoạt Action 3: Cập nhật Báo cáo Post
 */
export function triggerUpdatePostReport(): void {
  MediaHandler.handleActivePostRow();
}

// Gắn các hàm vào global scope để Google Apps Script có thể gọi từ giao diện Menu
const globalScope = typeof globalThis !== "undefined" ? globalThis : this;
(globalScope as Record<string, unknown>)["onOpen"] = onOpen;
(globalScope as Record<string, unknown>)["triggerGenerateContract"] = triggerGenerateContract;
(globalScope as Record<string, unknown>)["triggerProcessMaterials"] = triggerProcessMaterials;
(globalScope as Record<string, unknown>)["triggerUpdatePostReport"] = triggerUpdatePostReport;
