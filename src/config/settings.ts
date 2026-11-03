import { HubSettings } from "../types/config.types";
import { SHEET_NAMES } from "./constants";
import { extractGoogleDriveId } from "../utils/string.util";

export function loadHubSettings(): HubSettings {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!sheet) {
    throw new Error(`Không tìm thấy sheet cấu hình '${SHEET_NAMES.SETTINGS}'. Vui lòng kiểm tra lại!`);
  }

  const data = sheet.getDataRange().getValues();
  const configMap: Record<string, string> = {};

  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    const value = String(data[i][1]).trim();
    if (key) {
      configMap[key] = value;
    }
  }

  return {
    contractTargetFolderId: extractGoogleDriveId(configMap["CONTRACT_TARGET_FOLDER_ID"] || ""),
    mediaRootFolderId: extractGoogleDriveId(configMap["MEDIA_ROOT_FOLDER_ID"] || ""),
    contractTemplatesFolderId: extractGoogleDriveId(configMap["CONTRACT_TEMPLATES_FOLDER_ID"] || ""),
    paymentRequestTemplateId: extractGoogleDriveId(configMap["PAYMENT_REQUEST_TEMPLATE_ID"] || ""),
    sheetCscSagaUrl: configMap["SHEET_CSC_SAGA_URL"] || "",
    sheetCscSagaTabName: configMap["SHEET_CSC_SAGA_TAB_NAME"] || "CSC Saga",
    sheetCheckTonKhoUrl: configMap["SHEET_CHECK_TON_KHO_URL"] || "",
    sheetCheckTonKhoTabName: configMap["SHEET_CHECK_TON_KHO_TAB_NAME"] || "Tồn Kho",
    sheetSlPostUrl: configMap["SHEET_SL_POST_URL"] || "",
    sheetSlPostTabName: configMap["SHEET_SL_POST_TAB_NAME"] || "SL post & ĐTT - Saga",
    sheetSlMaterialsUrl: configMap["SHEET_SL_MATERIALS_URL"] || "",
    sheetSlMaterialsTabName: configMap["SHEET_SL_MATERIALS_TAB_NAME"] || "SL materials - Saga v1"
  };
}
