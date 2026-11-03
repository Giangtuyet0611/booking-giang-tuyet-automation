export function formatDateIso(dateInput: Date | string | number): string {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  }
  return Utilities.formatDate(d, "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
}

export function getCurrentYear(): string {
  return Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy");
}

export function getCurrentMonthFormatted(): string {
  return "Tháng " + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "MM");
}
