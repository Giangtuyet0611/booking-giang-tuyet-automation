export interface PostReportRecord {
  rowIndex: number;
  kocName: string;
  platform: string;
  postUrl: string;
  caption: string;
  views: number;
  engagement: number | string;
  status: string;
}

export interface MaterialRecord {
  rowIndex: number;
  publicDriveUrl: string;
  selectedFileNames: string[];
  kocName: string;
  productName: string;
  formatType: "Video" | "Hình ảnh";
  summaryContent: string;
  qualityRating: string;
  deliveryDate: Date | string;
  sdhaDuration: string;
  status?: string;
  copiedFilesUrls?: string[];
}
