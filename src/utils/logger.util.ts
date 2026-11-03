export class Logger {
  static info(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  }

  static error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  }

  static toast(message: string, title = "SAGA Automation", timeoutSeconds = 5): void {
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast(message, title, timeoutSeconds);
    } catch {
      console.log(`[TOAST] ${title}: ${message}`);
    }
  }

  static alert(message: string): void {
    try {
      SpreadsheetApp.getUi().alert(message);
    } catch {
      console.log(`[ALERT] ${message}`);
    }
  }
}
