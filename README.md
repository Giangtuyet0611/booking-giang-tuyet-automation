# ⌚ SAGA BOOKING KOC AUTOMATION SYSTEM
> **Hệ thống tự động hóa toàn diện quy trình Booking KOC Saga (Google Docs, Drive, Sheets, Gmail)**  
> **Thương hiệu:** Saga - Đồng Hồ Hải Triều  
> **Người phụ trách mặc định:** Giáng Tuyết  
> **Tài liệu hướng dẫn sử dụng chi tiết:** 👉 [**Xem file HUONG_DAN_SU_DUNG.md**](./HUONG_DAN_SU_DUNG.md)

---

## 🧭 BẠN THUỘC TRƯỜNG HỢP NÀO?

Hệ thống được thiết kế tối ưu hóa theo mô hình **AI Agentic Workflow**. Vui lòng chọn hướng dẫn phù hợp với bạn:

| Trường hợp | Mô tả | Hướng dẫn bắt đầu |
| :--- | :--- | :--- |
| 🟢 **Trường hợp 1: Bạn ĐANG sử dụng Antigravity** *(Khuyên dùng)* | Thao tác 100% bằng ngôn ngữ tự nhiên tiếng Việt trong khung Chat (nhắn `"tiến hành"`, `"thực thi 1"`, dán link Drive, dán link bài đăng). Không cần gõ lệnh code hay terminal. | 👉 [**Xem hướng dẫn Trường hợp 1**](./HUONG_DAN_SU_DUNG.md#1-trường-hợp-1-bạn-đang-sử-dụng-antigravity-khuyên-dùng---dễ-nhất) |
| 🟡 **Trường hợp 2: Bạn CHƯA TỪNG sử dụng Antigravity** | Người mới bắt đầu: Có thể cài đặt Antigravity IDE để được tự động hóa hoàn toàn **HOẶC** chạy độc lập bằng Terminal / Node.js. | 👉 [**Xem hướng dẫn Trường hợp 2**](./HUONG_DAN_SU_DUNG.md#2-trường-hợp-2-bạn-chưa-từng-sử-dụng-antigravity-người-mới) |

---

## 🚀 GIỚI THIỆU HỆ THỐNG

Kho lưu trữ này chứa toàn bộ mã nguồn và tri thức vận hành (Agentic AI Workflow) tự động hóa nghiệp vụ Booking KOL/KOC thương hiệu Saga cho team Marketing - Đồng Hồ Hải Triều:

- 📝 **Tạo hợp đồng chuẩn pháp lý & SOW độc quyền**: Tự động tách HĐ Cast và HĐ Tặng SP, chia nhỏ deal $\le$ 20 triệu/HĐ, tự động tạo bảng thuế TNCN 10% chuẩn 5 dòng cho deal Cast $\ge$ 5 triệu.
- ✉️ **Soạn Gmail xuất hàng tự động**: Đọc trạng thái Docs mới nhất (Live State), tra cứu danh bạ showroom và tạo Thư nháp (Drafts) trong Gmail với định dạng font chữ Times New Roman chuyên nghiệp.
- 💳 **Sinh Phiếu Đề Nghị Thanh Toán**: Tự động tạo phiếu theo giá trị Net thực nhận (hỗ trợ chia nhiều đợt) và lưu vào thư mục `[6] Kết toán tháng`.
- 📊 **Cơ chế ghi nhận Google Sheets thông minh**: Nhận diện cột theo tên tiêu đề (không phụ thuộc vị trí cột), tự động cập nhật trạng thái chốt deal trên Sheet `Data KOC` và ghi nhận bài đăng vào Sheet `Report Saga` mà không ghi đè dữ liệu.
- 📂 **Xử lý Media Materials**: Chuẩn hóa tên file 100% theo cú pháp Saga và phân loại vào cây thư mục Drive theo năm.

---

## ⚡ CÀI ĐẶT & CẤP QUYỀN (QUICK SETUP)

Dù bạn dùng Antigravity hay chạy bằng Terminal, hãy thực hiện 2 bước cài đặt ban đầu:

### 1. Cài đặt thư viện
```bash
git clone https://github.com/Giangtuyet0611/booking-giang-tuyet-automation.git
cd booking-giang-tuyet-automation
npm install
```

### 2. Cấp quyền Google Workspace (Chạy 1 lần duy nhất)
- **Trên Windows:** Nhấp đúp vào file `authenticate.bat`.
- **Hoặc chạy lệnh:**
  ```bash
  node src/auth_full.cjs
  ```
Trình duyệt sẽ tự động mở lên để bạn đăng nhập tài khoản Google công việc và cấp quyền truy cập Drive, Docs, Sheets, Gmail Drafts.

---

## 🎯 CÁC LỆNH KÍCH HOẠT CHÍNH TRONG CHAT ANTIGRAVITY

| Lệnh / Tin nhắn | Hành động của AI Assistant |
| :--- | :--- |
| **`"tiến hành"`** (hoặc gửi thông tin KOC) | Bóc tách deal, tách hợp đồng, định dạng SOW & thuế TNCN, tạo thư mục và sinh Google Docs trên Drive. |
| **`"thực thi 1"`** | Đọc dữ liệu mới nhất từ Docs, tra cứu email showroom, tạo Thư nháp (Gmail Draft), sinh Phiếu ĐNTT, cập nhật trạng thái "Đã chốt" trên Sheet Data KOC. |
| **Gửi Link Drive Media** | Tải và đổi tên file chuẩn Saga, phân bổ vào thư mục năm `2026/Video/Hình ảnh`. |
| **Gửi Link Post Air** | Bóc tách link bài đăng (TikTok, Facebook Reels, Instagram...), tạo hyperlink chuẩn nhãn và ghi dòng mới vào Sheet Report Saga. |

---

## 📁 CẤU TRÚC DỰ ÁN

```text
├── src/                                  # Mã nguồn nghiệp vụ Node.js
│   ├── action_contract.cjs               # Xử lý bóc tách & sinh Hợp đồng Google Docs
│   ├── action_thucthi1.cjs               # Xử lý Thực thi 1 (Live docs, mail draft, ĐNTT, sheet)
│   ├── action_dntt.cjs                   # Xử lý sinh Phiếu Đề Nghị Thanh Toán
│   ├── action_post_air.cjs               # Bóc tách link post & ghi Sheet Report Saga
│   ├── action_materials.cjs              # Tải & chuẩn hóa tên file Media
│   ├── auth_full.cjs                     # Xác thực cấp quyền Google OAuth 2.0
│   ├── booking_agent.cjs                 # Bộ điều phối trung tâm
│   └── utils/                            # Các thư viện tiện ích (thuế, mail template, store lookup...)
├── .agents/                              # Tri thức & Nguyên tắc AI Agent
│   ├── AGENTS.md                         # 12 Nguyên tắc vận hành cốt lõi
│   └── SKILL/koc-booking/SKILL.md        # Kịch bản chi tiết quy trình KOC Booking
├── authenticate.bat                      # Phím tắt cấp quyền 1-click trên Windows
├── config.json                           # Bảng quản lý ID thư mục, file mẫu, Sheet ID
├── HUONG_DAN_SU_DUNG.md                  # Tài liệu hướng dẫn vận hành chi tiết từ A-Z
└── package.json                          # Cấu hình gói và dependencies
```

---

## 📖 TÀI LIỆU CHI TIẾT

Vui lòng đọc file [**HUONG_DAN_SU_DUNG.md**](./HUONG_DAN_SU_DUNG.md) để xem chi tiết toàn bộ các quy trình, cơ chế vận hành của 2 Google Sheets và hướng dẫn khắc phục sự cố!
