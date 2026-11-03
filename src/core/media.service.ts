import { MaterialRecord } from "../types/media.types";
import { HubSettings } from "../types/config.types";
import { DriveService } from "./drive.service";
import { buildMediaFileName, extractGoogleDriveId } from "../utils/string.util";
import { Logger } from "../utils/logger.util";

export class MediaService {
  /**
   * Tải và sao chép các file materials được duyệt từ link Drive public của KOC
   * Đổi tên chuẩn: KOC SAGA, TÊN KOC, tên sản phẩm, thể loại - tóm tắt nội dung video
   */
  static processAndRenameMaterials(
    record: MaterialRecord,
    bookingDate: Date | string,
    settings: HubSettings
  ): string[] {
    const { videoFolder, imageFolder } = DriveService.prepareMediaFolderStructure(
      settings.mediaRootFolderId,
      bookingDate,
      record.kocName
    );

    const targetFolder = record.formatType === "Video" ? videoFolder : imageFolder;
    const sourceFolderId = extractGoogleDriveId(record.publicDriveUrl);
    const sourceFolder = DriveApp.getFolderById(sourceFolderId);

    const copiedUrls: string[] = [];
    const files = sourceFolder.getFiles();

    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();

      // Kiểm tra xem file này có nằm trong danh sách Brand đã chọn duyệt không
      const isSelected =
        record.selectedFileNames.length === 0 ||
        record.selectedFileNames.some((selected) => fileName.toLowerCase().includes(selected.toLowerCase().trim()));

      if (isSelected) {
        const fileExt = fileName.includes(".") ? fileName.substring(fileName.lastIndexOf(".")) : "";
        const standardizedName = buildMediaFileName(
          record.kocName,
          record.productName,
          record.formatType,
          record.summaryContent,
          fileExt
        );

        // Copy file trực tiếp sang thư mục công ty và đổi tên chuẩn
        const copiedFile = file.makeCopy(standardizedName, targetFolder);
        copiedUrls.push(copiedFile.getUrl());
        Logger.info(`Đã copy và đổi tên thành công: ${standardizedName}`);
      }
    }

    return copiedUrls;
  }
}
