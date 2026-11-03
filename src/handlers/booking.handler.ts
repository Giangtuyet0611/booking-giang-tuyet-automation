import { loadHubSettings } from "../config/settings";
import { SHEET_NAMES } from "../config/constants";
import { BookingRecord, ContractType } from "../types/booking.types";
import { ContractService } from "../core/contract.service";
import { SheetsService } from "../core/sheets.service";
import { Logger } from "../utils/logger.util";

export class BookingHandler {
  static handleActiveRow(): void {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.BOOKING);
    if (!sheet) {
      Logger.alert(`Không tìm thấy sheet '${SHEET_NAMES.BOOKING}'!`);
      return;
    }

    const rowIndex = sheet.getActiveCell().getRow();
    if (rowIndex < 2) {
      Logger.alert("Vui lòng chọn một dòng dữ liệu KOC (từ dòng 2 trở đi) để thực hiện!");
      return;
    }

    const rowValues = sheet.getRange(rowIndex, 1, 1, 22).getValues()[0];
    const record: BookingRecord = {
      rowIndex,
      bookingDate: rowValues[0],
      kocName: String(rowValues[1] || "").trim(),
      phoneZalo: String(rowValues[2] || "").trim(),
      representativeName: String(rowValues[3] || "").trim(),
      idCardNumber: String(rowValues[4] || "").trim(),
      idCardIssueDate: String(rowValues[5] || "").trim(),
      address: String(rowValues[6] || "").trim(),
      taxCode: String(rowValues[7] || "").trim(),
      bankAccountNumber: String(rowValues[8] || "").trim(),
      bankName: String(rowValues[9] || "").trim(),
      productCode: String(rowValues[10] || "").trim(),
      productName: String(rowValues[11] || "").trim(),
      showroomName: String(rowValues[12] || "").trim(),
      quantity: Number(rowValues[13] || 1),
      inventoryNote: String(rowValues[14] || "").trim(),
      contractType: (rowValues[15] as ContractType) || ContractType.GIFT,
      receivedValue: rowValues[16],
      castAmount: rowValues[17],
      paymentPhase: String(rowValues[18] || "Đợt 1").trim(),
      requestedPaymentAmount: rowValues[19]
    };

    if (!record.kocName) {
      Logger.alert("Dòng được chọn chưa có Tên KOC! Vui lòng kiểm tra lại.");
      return;
    }

    Logger.toast(`Đang xử lý tạo HĐ & Đồng bộ cho KOC: ${record.kocName}...`);
    const settings = loadHubSettings();

    try {
      // 1. Sinh Hợp Đồng & Phiếu ĐNTT vào thư mục chỉ định
      const result = ContractService.generateContractAndPaymentRequest(record, settings);

      // 2. Đồng bộ sang CSC Saga (OKRs) & CHECK TỒN KHO
      SheetsService.syncToCscSaga(record, settings);
      SheetsService.syncToCheckTonKho(record, settings);

      // 3. Ghi link kết quả ngược lại dòng hiện tại trên Sheet
      // Cột 20: Link Doc HĐ, Cột 21: Link PDF HĐ, Cột 22: Trạng thái
      sheet.getRange(rowIndex, 20).setValue(result.docUrl);
      sheet.getRange(rowIndex, 21).setValue(result.pdfUrl);
      sheet.getRange(rowIndex, 22).setValue("Đã hoàn tất HĐ & Đồng bộ");

      Logger.alert(`✅ Thành công! Đã tạo Hợp đồng và đồng bộ xong cho KOC: ${record.kocName}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      Logger.error(`Lỗi xử lý Booking: ${message}`, err);
      Logger.alert(`❌ Có lỗi xảy ra: ${message}`);
    }
  }
}
