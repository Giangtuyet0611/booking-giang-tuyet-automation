import { loadHubSettings } from "../config/settings";
import { SHEET_NAMES } from "../config/constants";
import { MaterialRecord, PostReportRecord } from "../types/media.types";
import { MediaService } from "../core/media.service";
import { SheetsService } from "../core/sheets.service";
import { Logger } from "../utils/logger.util";

export class MediaHandler {
  /**
   * Xử lý dòng đang chọn trên Sheet '🎬 03_Thành Phẩm Media'
   */
  static handleActiveMaterialRow(): void {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.MATERIALS);
    if (!sheet) {
      Logger.alert(`Không tìm thấy sheet '${SHEET_NAMES.MATERIALS}'!`);
      return;
    }

    const rowIndex = sheet.getActiveCell().getRow();
    if (rowIndex < 2) {
      Logger.alert("Vui lòng chọn một dòng thành phẩm (từ dòng 2 trở đi) để thực hiện!");
      return;
    }

    const rowValues = sheet.getRange(rowIndex, 1, 1, 11).getValues()[0];
    const record: MaterialRecord = {
      rowIndex,
      publicDriveUrl: String(rowValues[0] || "").trim(),
      selectedFileNames: String(rowValues[1] || "")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      kocName: String(rowValues[2] || "").trim(),
      productName: String(rowValues[3] || "").trim(),
      formatType: (String(rowValues[4] || "").trim() === "Hình ảnh" ? "Hình ảnh" : "Video") as "Video" | "Hình ảnh",
      summaryContent: String(rowValues[5] || "").trim(),
      qualityRating: String(rowValues[6] || "Đạt").trim(),
      deliveryDate: rowValues[7] || new Date(),
      sdhaDuration: String(rowValues[8] || "1 năm").trim()
    };

    if (!record.publicDriveUrl || !record.kocName) {
      Logger.alert("Thiếu Link Drive hoặc Tên KOC ở dòng được chọn!");
      return;
    }

    Logger.toast(`Đang tải, đổi tên và lưu trữ Materials cho KOC: ${record.kocName}...`);
    const settings = loadHubSettings();

    try {
      // 1. Sao chép và đổi tên file chuẩn
      const copiedUrls = MediaService.processAndRenameMaterials(record, new Date(), settings);
      const combinedUrls = copiedUrls.join("\n");

      // 2. Đồng bộ sang Sheet SL materials - Saga v1
      SheetsService.syncToSlMaterials(record, combinedUrls, new Date(), settings);

      // 3. Ghi link kết quả lại sheet
      sheet.getRange(rowIndex, 10).setValue(combinedUrls);
      sheet.getRange(rowIndex, 11).setValue("Đã lưu trữ & Đồng bộ");

      Logger.alert(`✅ Thành công! Đã copy ${copiedUrls.length} file và cập nhật Sheet SL Materials cho ${record.kocName}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      Logger.error(`Lỗi xử lý Materials: ${message}`, err);
      Logger.alert(`❌ Có lỗi xảy ra: ${message}`);
    }
  }

  /**
   * Xử lý dòng đang chọn trên Sheet '📊 02_Báo Cáo Post'
   */
  static handleActivePostRow(): void {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.POST_REPORT);
    if (!sheet) {
      Logger.alert(`Không tìm thấy sheet '${SHEET_NAMES.POST_REPORT}'!`);
      return;
    }

    const rowIndex = sheet.getActiveCell().getRow();
    if (rowIndex < 2) {
      Logger.alert("Vui lòng chọn một dòng báo cáo bài đăng để thực hiện!");
      return;
    }

    const rowValues = sheet.getRange(rowIndex, 1, 1, 8).getValues()[0];
    const record: PostReportRecord = {
      rowIndex,
      kocName: String(rowValues[0] || "").trim(),
      platform: String(rowValues[1] || "TikTok").trim(),
      postUrl: String(rowValues[2] || "").trim(),
      caption: String(rowValues[3] || "").trim(),
      views: Number(rowValues[4] || 0),
      engagement: Number(rowValues[5] || 0),
      status: String(rowValues[6] || "Đã air").trim()
    };

    Logger.toast(`Đang đồng bộ báo cáo bài đăng cho KOC: ${record.kocName}...`);
    const settings = loadHubSettings();

    try {
      SheetsService.syncToSlPost(record, settings);
      sheet.getRange(rowIndex, 8).setValue("Đã cập nhật Báo cáo");
      Logger.alert(`✅ Thành công! Đã đồng bộ số liệu Post sang Sheet SL Post & ĐTT cho ${record.kocName}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      Logger.error(`Lỗi xử lý Post Report: ${message}`, err);
      Logger.alert(`❌ Có lỗi xảy ra: ${message}`);
    }
  }
}
