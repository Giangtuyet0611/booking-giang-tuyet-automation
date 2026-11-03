# SAGA BOOKING AUTOMATION SYSTEM
> Hệ thống tự động hóa toàn diện quy trình Booking KOC Saga (Docs - Sheets - Drive) được viết bằng **TypeScript** và triển khai trên **Google Apps Script**.

---

## 📁 CẤU TRÚC THƯ MỤC CHUẨN (STANDARD FOLDER STRUCTURE)

```text
d:\Booking\
├── src/                               # Toàn bộ mã nguồn TypeScript chính
│   ├── config/                        # Cấu hình, ánh xạ và hằng số
│   │   ├── constants.ts               # Tên các sheet, mẫu hợp đồng, quy tắc đặt tên
│   │   └── settings.ts                # Đọc cấu hình động từ Sheet '⚙️ Cấu hình'
│   ├── core/                          # Các dịch vụ xử lý Google Workspace
│   │   ├── drive.service.ts           # Quản lý cấu trúc folder Drive động & lưu trữ
│   │   ├── contract.service.ts        # Nhân bản 5 mẫu HĐ Docs, xuất PDF & Phiếu ĐNTT
│   │   ├── sheets.service.ts          # Đồng bộ dữ liệu sang CSC Saga, Check Tồn Kho, SL Materials, SL Post
│   │   └── media.service.ts           # Tải source từ link Drive KOC, đổi tên chuẩn 100%
│   ├── handlers/                      # Bộ điều phối sự kiện giao diện (UI Handlers)
│   │   ├── booking.handler.ts         # Xử lý tạo Hợp đồng + Phiếu ĐNTT + Sync Tồn Kho/CSC
│   │   └── media.handler.ts           # Xử lý copy file media + Sync báo cáo Post & Materials
│   ├── types/                         # TypeScript Type Definitions
│   │   ├── booking.types.ts           # Kiểu dữ liệu KOC, 5 loại Hợp đồng, kết quả sinh file
│   │   ├── media.types.ts             # Kiểu dữ liệu Media materials, Post report, SDHA
│   │   └── config.types.ts            # Kiểu dữ liệu cài đặt Hub Controller
│   ├── utils/                         # Các hàm tiện ích dùng chung
│   │   ├── date.util.ts               # Xử lý định dạng ngày YYYY-MM-DD (GMT+7)
│   │   ├── string.util.ts             # Tạo tên file chuẩn Saga, trích xuất ID Drive
│   │   └── logger.util.ts             # Ghi log hoạt động và Toast thông báo trên Sheet UI
│   └── index.ts                       # Entry point: Khởi tạo Menu trên Google Sheets
├── dist/                              # Thư mục output build
│   └── Code.js                        # File JS bundle sẵn sàng dán hoặc push lên Apps Script
├── appsscript.json                    # File Manifest cấu hình Google Apps Script (múi giờ GMT+7, OAuth Scopes)
├── package.json                       # Quản lý thư viện & scripts (build, typecheck, push)
├── tsconfig.json                      # Cấu hình trình biên dịch TypeScript
└── curr-plan.md                       # Bản kế hoạch chi tiết V2.2 của quy trình
```

---

## 🚀 CÁC LỆNH VẬN HÀNH (SCRIPTS)

| Lệnh | Chức năng |
| :--- | :--- |
| `npm run typecheck` | Kiểm tra toàn bộ kiểu dữ liệu TypeScript (Zero errors) |
| `npm run build` | Biên dịch toàn bộ TypeScript thành 1 file bundle duy nhất `dist/Code.js` |
| `npm run watch` | Tự động biên dịch khi có bất kỳ thay đổi code nào |

---

## 🎯 CÁC NÚT ĐIỀU KHIỂN TRÊN GOOGLE SHEETS MENU

Sau khi gắn script vào Sheet Hub Controller, thanh Menu sẽ tự động xuất hiện:
- **`[ 🚀 SAGA Booking Automation ]`**
  - `▶ 1. Tạo HĐ & Đồng Bộ Tồn Kho/CSC (Dòng đang chọn)`: Đọc dòng KOC đang chọn, sinh HĐ Docs + PDF vào thư mục chỉ định, tạo Phiếu ĐNTT (nếu có Cast), đồng bộ CSC Saga và Check Tồn Kho (chỉ cập nhật Số lượng & Nhận xét).
  - `▶ 2. Tải, Đổi Tên Materials & Ghi Sheet (Dòng đang chọn)`: Đọc link Drive KOC gửi, copy đúng các file đã chọn vào thư mục năm `YYYY / YYYY-MM-DD - KOC / Video & Hình ảnh`, đổi tên theo chuẩn:  
    `KOC SAGA, [TÊN KOC], [tên sản phẩm], [thể loại] - [tóm tắt nội dung video]`  
    đồng thời ghi vào Sheet `SL materials - Saga v1`.
  - `▶ 3. Cập Nhật Báo Cáo Bài Đăng (Dòng đang chọn)`: Ghi nhận view, engagement, link bài sang Sheet `SL post & ĐTT - Saga`.
