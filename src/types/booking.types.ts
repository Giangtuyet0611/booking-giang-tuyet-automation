export enum ContractType {
  GIFT = "Tặng sản phẩm",
  GIFT_AND_BORROW = "Tặng sản phẩm + mượn thêm sản phẩm",
  ONLY_CAST = "Only Cast",
  ONLY_CAST_TAX = "Only Cast + Thuế",
  CAST_AND_BORROW = "Cast + mượn sản phẩm"
}

export interface BookingRecord {
  rowIndex: number;
  bookingDate: Date | string;
  kocName: string;
  phoneZalo: string;
  representativeName: string;
  idCardNumber: string;
  idCardIssueDate: string;
  address: string;
  taxCode: string;
  bankAccountNumber: string;
  bankName: string;
  productCode: string;
  productName: string;
  showroomName: string;
  quantity: number;
  inventoryNote: string;
  contractType: ContractType;
  receivedValue: number | string;
  castAmount: number | string;
  paymentPhase: string;
  requestedPaymentAmount: number | string;
  contractDocUrl?: string;
  contractPdfUrl?: string;
  paymentRequestDocUrl?: string;
  status?: string;
}

export interface ContractGenerationResult {
  docUrl: string;
  pdfUrl: string;
  paymentRequestUrl?: string;
}
