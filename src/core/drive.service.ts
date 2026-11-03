import { getCurrentYear, formatDateIso } from "../utils/date.util";
import { Logger } from "../utils/logger.util";

export class DriveService {
  /**
   * Lấy hoặc tạo thư mục theo tên bên trong thư mục cha
   */
  static getOrCreateFolder(parent: GoogleAppsScript.Drive.Folder, name: string): GoogleAppsScript.Drive.Folder {
    const folders = parent.getFoldersByName(name);
    if (folders.hasNext()) {
      return folders.next();
    }
    return parent.createFolder(name);
  }

  /**
   * Tạo cấu trúc thư mục Media:
   * [Root Media] -> [YYYY] -> [YYYY-MM-DD - KOC] -> [Video], [Hình ảnh]
   */
  static prepareMediaFolderStructure(
    mediaRootFolderId: string,
    bookingDate: Date | string,
    kocName: string
  ): { kocFolder: GoogleAppsScript.Drive.Folder; videoFolder: GoogleAppsScript.Drive.Folder; imageFolder: GoogleAppsScript.Drive.Folder } {
    const rootFolder = DriveApp.getFolderById(mediaRootFolderId);
    const currentYear = getCurrentYear();
    const yearFolder = this.getOrCreateFolder(rootFolder, currentYear);

    const kocFolderName = `${formatDateIso(bookingDate)} - ${kocName.trim()}`;
    const kocFolder = this.getOrCreateFolder(yearFolder, kocFolderName);

    const videoFolder = this.getOrCreateFolder(kocFolder, "Video");
    const imageFolder = this.getOrCreateFolder(kocFolder, "Hình ảnh");

    Logger.info(`Đã chuẩn bị thư mục Media cho KOC: ${kocFolderName}`);
    return { kocFolder, videoFolder, imageFolder };
  }

  /**
   * Lấy thư mục lưu trữ Hợp Đồng được chỉ định
   */
  static getContractTargetFolder(folderId: string): GoogleAppsScript.Drive.Folder {
    return DriveApp.getFolderById(folderId);
  }
}
