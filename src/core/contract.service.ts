import { BookingRecord, ContractGenerationResult } from "../types/booking.types";
import { HubSettings } from "../types/config.types";
import { CONTRACT_TEMPLATE_NAMES } from "../config/constants";
import { formatDateIso } from "../utils/date.util";
import { Logger } from "../utils/logger.util";

export class ContractService {
  /**
   * Tạo bộ Hợp Đồng (Docs + PDF) và Phiếu Đề Nghị Thanh Toán (nếu có Cast) trong thư mục chỉ định
   */
  static generateContractAndPaymentRequest(
    record: BookingRecord,
    settings: HubSettings
  ): ContractGenerationResult {
    const targetFolder = DriveApp.getFolderById(settings.contractTargetFolderId);
    const templateFileName = CONTRACT_TEMPLATE_NAMES[record.contractType];
    if (!templateFileName) {
      throw new Error(`Không xác định được mẫu template cho loại hợp đồng: '${record.contractType}'`);
    }

    const templatesFolder = DriveApp.getFolderById(settings.contractTemplatesFolderId);
    const templateFiles = templatesFolder.getFilesByName(templateFileName);
    if (!templateFiles.hasNext()) {
      throw new Error(`Không tìm thấy file mẫu '${templateFileName}' trong thư mục template!`);
    }

    const templateFile = templateFiles.next();
    const dateStr = formatDateIso(record.bookingDate);
    const contractBaseName = `${dateStr} - ${record.kocName} - Hợp Đồng Booking Saga`;

    // 1. Nhân bản file mẫu Google Docs vào thư mục chỉ định
    const newDocFile = templateFile.makeCopy(contractBaseName, targetFolder);
    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();

    // 2. Điền các biến thay thế
    body.replaceText("{{NGAY_BOOK}}", dateStr);
    body.replaceText("{{TEN_KOC}}", record.kocName || "");
    body.replaceText("{{DAI_DIEN_B}}", record.representativeName || record.kocName || "");
    body.replaceText("{{CCCD}}", record.idCardNumber || "");
    body.replaceText("{{NGAY_CAP}}", record.idCardIssueDate || "");
    body.replaceText("{{DIA_CHI}}", record.address || "");
    body.replaceText("{{MST}}", record.taxCode || "");
    body.replaceText("{{STK}}", record.bankAccountNumber || "");
    body.replaceText("{{NGAN_HANG}}", record.bankName || "");
    body.replaceText("{{MA_SP}}", record.productCode || "");
    body.replaceText("{{SAN_PHAM}}", record.productName || "");
    body.replaceText("{{GIA_TRI_NHAN}}", String(record.receivedValue || "0"));
    body.replaceText("{{CAST}}", String(record.castAmount || "0"));
    doc.saveAndClose();

    // 3. Xuất file PDF cùng tên
    const pdfBlob = newDocFile.getAs("application/pdf");
    pdfBlob.setName(`${contractBaseName}.pdf`);
    const pdfFile = targetFolder.createFile(pdfBlob);

    let paymentRequestUrl: string | undefined = undefined;

    // 4. Nếu có Cast: Tạo Phiếu Đề Nghị Thanh Toán vào cùng thư mục
    if (record.castAmount && Number(record.castAmount) > 0 && settings.paymentRequestTemplateId) {
      paymentRequestUrl = this.generatePaymentRequest(record, settings, targetFolder, dateStr);
    }

    Logger.info(`Đã tạo thành công Hợp đồng cho KOC: ${record.kocName}`);
    return {
      docUrl: newDocFile.getUrl(),
      pdfUrl: pdfFile.getUrl(),
      paymentRequestUrl
    };
  }

  private static generatePaymentRequest(
    record: BookingRecord,
    settings: HubSettings,
    targetFolder: GoogleAppsScript.Drive.Folder,
    dateStr: string
  ): string {
    const templateFile = DriveApp.getFileById(settings.paymentRequestTemplateId);
    const docName = `${dateStr} - ${record.kocName} - Phiếu Đề Nghị Thanh Toán`;
    const newDocFile = templateFile.makeCopy(docName, targetFolder);

    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();

    body.replaceText("{{NGAY}}", dateStr);
    body.replaceText("{{TEN_KOC}}", record.kocName || "");
    body.replaceText("{{STK}}", record.bankAccountNumber || "");
    body.replaceText("{{NGAN_HANG}}", record.bankName || "");
    body.replaceText("{{DOT_THANH_TOAN}}", record.paymentPhase || "Đợt 1");
    body.replaceText("{{SO_TIEN}}", String(record.requestedPaymentAmount || record.castAmount || "0"));
    body.replaceText("{{MST}}", record.taxCode || "");
    doc.saveAndClose();

    return newDocFile.getUrl();
  }
}
