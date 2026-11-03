import { BookingRecord } from "../types/booking.types";
import { PostReportRecord, MaterialRecord } from "../types/media.types";
import { HubSettings } from "../types/config.types";
import { formatDateIso } from "../utils/date.util";
import { Logger } from "../utils/logger.util";

export class SheetsService {
  /**
   * Đồng bộ sang Sheet CSC Saga:
   * Cập nhật: Ngày book, Tên KOC, Sản phẩm, Giá trị bạn nhận
   */
  static syncToCscSaga(record: BookingRecord, settings: HubSettings): void {
    if (!settings.sheetCscSagaUrl) return;
    const ss = SpreadsheetApp.openByUrl(settings.sheetCscSagaUrl);
    const sheet = ss.getSheetByName(settings.sheetCscSagaTabName) || ss.getSheets()[0];

    const rowData = [
      formatDateIso(record.bookingDate),
      record.kocName,
      `${record.productCode} - ${record.productName}`,
      record.receivedValue,
      "Đã chốt Booking"
    ];
    sheet.appendRow(rowData);
    Logger.info(`Đã đồng bộ sang CSC Saga cho KOC: ${record.kocName}`);
  }

  /**
   * Đồng bộ sang Sheet CHECK TỒN KHO:
   * Rút thông tin từ HĐ, chỉ cập nhật: Số lượng và Nhận xét
   */
  static syncToCheckTonKho(record: BookingRecord, settings: HubSettings): void {
    if (!settings.sheetCheckTonKhoUrl) return;
    const ss = SpreadsheetApp.openByUrl(settings.sheetCheckTonKhoUrl);
    const sheet = ss.getSheetByName(settings.sheetCheckTonKhoTabName) || ss.getSheets()[0];

    const rowData = [
      formatDateIso(record.bookingDate),
      record.showroomName || "Showroom",
      record.productCode,
      record.kocName,
      record.quantity || 1,         // Số lượng
      record.inventoryNote || "Xuất tặng KOC" // Nhận xét
    ];
    sheet.appendRow(rowData);
    Logger.info(`Đã cập nhật Số lượng & Nhận xét sang CHECK TỒN KHO cho KOC: ${record.kocName}`);
  }

  /**
   * Đồng bộ sang Sheet SL post & ĐTT - Saga:
   * Theo dõi chỉ số bài đăng, đo lường view, engagement
   */
  static syncToSlPost(record: PostReportRecord, settings: HubSettings): void {
    if (!settings.sheetSlPostUrl) return;
    const ss = SpreadsheetApp.openByUrl(settings.sheetSlPostUrl);
    const sheet = ss.getSheetByName(settings.sheetSlPostTabName) || ss.getSheets()[0];

    const rowData = [
      record.kocName,
      record.platform,
      record.postUrl,
      record.caption,
      record.views || 0,
      record.engagement || 0,
      record.status || "Đã air"
    ];
    sheet.appendRow(rowData);
    Logger.info(`Đã cập nhật bài đăng sang Sheet SL Post cho KOC: ${record.kocName}`);
  }

  /**
   * Đồng bộ sang Sheet SL materials - Saga v1:
   * Ngày book, Tên, Sản phẩm, Quản lý thành phẩm, Đánh giá, Ngày có thành phẩm, Hạn SDHA
   */
  static syncToSlMaterials(
    record: MaterialRecord,
    copiedDriveUrl: string,
    bookingDate: Date | string,
    settings: HubSettings
  ): void {
    if (!settings.sheetSlMaterialsUrl) return;
    const ss = SpreadsheetApp.openByUrl(settings.sheetSlMaterialsUrl);
    const sheet = ss.getSheetByName(settings.sheetSlMaterialsTabName) || ss.getSheets()[0];

    const rowData = [
      formatDateIso(bookingDate),
      record.kocName,
      record.productName,
      copiedDriveUrl,                      // Quản lý thành phẩm (Link file trên Drive công ty)
      record.qualityRating || "Đạt",       // Đánh giá
      formatDateIso(record.deliveryDate),  // Ngày có thành phẩm
      record.sdhaDuration || "1 năm"       // Hạn SDHA
    ];
    sheet.appendRow(rowData);
    Logger.info(`Đã cập nhật thành phẩm sang Sheet SL Materials cho KOC: ${record.kocName}`);
  }
}
