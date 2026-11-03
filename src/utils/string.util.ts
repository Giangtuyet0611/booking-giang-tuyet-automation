export function extractGoogleDriveId(urlOrId: string): string {
  if (!urlOrId) return "";
  const match = urlOrId.match(/[-\w]{25,}/);
  return match ? match[0] : urlOrId.trim();
}

export function buildMediaFileName(
  kocName: string,
  productName: string,
  formatType: string,
  summary: string,
  extension: string
): string {
  const ext = extension ? (extension.startsWith(".") ? extension : `.${extension}`) : "";
  return `KOC SAGA, ${kocName.trim()}, ${productName.trim()}, ${formatType.trim()} - ${summary.trim()}${ext}`;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}
