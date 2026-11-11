# 📖 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG BOOKING KOC AUTOMATION
> **Thương hiệu:** Saga - Đồng Hồ Hải Triều  
> **Người phụ trách mặc định:** Giáng Tuyết (Team Social Media / Marketing)  
> **Kho lưu trữ GitHub:** [booking-giang-tuyet-automation](https://github.com/Giangtuyet0611/booking-giang-tuyet-automation.git)

---

## 🧭 BẠN THUỘC TRƯỜNG HỢP NÀO?

Hệ thống được thiết kế tối ưu hóa theo mô hình **AI Agentic Workflow**. Vui lòng chọn đúng trường hợp của bạn để xem hướng dẫn phù hợp:

- 🟢 [**TRƯỜNG HỢP 1: BẠN ĐANG SỬ DỤNG ANTIGRAVITY**](#1-trường-hợp-1-bạn-đang-sử-dụng-antigravity-khuyên-dùng---dễ-nhất) *(Khuyên dùng - Thao tác 100% bằng ngôn ngữ tự nhiên trong khung chat, không cần đụng đến dòng lệnh)*
- 🟡 [**TRƯỜNG HỢP 2: BẠN CHƯA TỪNG SỬ DỤNG ANTIGRAVITY**](#2-trường-hợp-2-bạn-chưa-từng-sử-dụng-antigravity-người-mới) *(Hướng dẫn cài đặt nhanh Antigravity HOẶC cách chạy độc lập bằng Terminal / Node.js)*

---

## 📑 MỤC LỤC
1. [Trường hợp 1: Bạn đang sử dụng Antigravity](#1-trường-hợp-1-bạn-đang-sử-dụng-antigravity-khuyên-dùng---dễ-nhất)
2. [Trường hợp 2: Bạn chưa từng sử dụng Antigravity](#2-trường-hợp-2-bạn-chưa-từng-sử-dụng-antigravity-người-mới)
3. [Cài đặt & Cấp quyền Google Workspace (Bắt buộc cho cả 2 trường hợp)](#3-cài-đặt--cấp-quyền-google-workspace-bắt-buộc-cho-cả-2-trường-hợp)
4. [Bảng cấu hình tài nguyên tập trung (`config.json`)](#4-bảng-cấu-hình-tài-nguyên-tập-trung-configjson)
5. [Chi tiết 4 Quy trình nghiệp vụ cốt lõi](#5-chi-tiết-4-quy-trình-nghiệp-vụ-cốt-lõi)
   - [Quy trình 1: Làm hợp đồng (Lệnh "tiến hành")](#51-quy-trình-1-làm-hợp-đồng-lệnh-tiến-hành)
   - [Quy trình 2: Thực thi 1 (Lệnh "thực thi 1")](#52-quy-trình-2-thực-thi-1-lệnh-thực-thi-1)
   - [Quy trình 3: Xử lý Media Materials (Source trả bài)](#53-quy-trình-3-xử-lý-media-materials-source-trả-bài)
   - [Quy trình 4: Báo cáo bài đăng Post Air](#54-quy-trình-4-báo-cáo-bài-đăng-post-air)
6. [Cơ chế làm việc với 2 Google Sheets của Team](#6-cơ-chế-làm-việc-với-2-google-sheets-của-team)
7. [12 Nguyên tắc vận hành bất biến (Core Rules)](#7-12-nguyên-tắc-vận-hành-bất-biến-core-rules)
8. [Khắc phục sự cố thường gặp (Troubleshooting)](#8-khắc-phục-sự-cố-thường-gặp-troubleshooting)

---

## 1. TRƯỜNG HỢP 1: BẠN ĐANG SỬ DỤNG ANTIGRAVITY (KHUYÊN DÙNG - DỄ NHẤT)

Nếu bạn đang mở thư mục dự án này bên trong **Antigravity IDE**, xin chúc mừng! Bạn **không cần phải gõ bất kỳ câu lệnh code nào**, không cần nhớ cú pháp script hay tạo file dữ liệu phức tạp. Toàn bộ hệ thống tri thức, quy tắc vận hành và kịch bản đã được tích hợp sẵn tại `.agents/AGENTS.md` và `.agents/SKILL/koc-booking/SKILL.md`.

### 🚀 Cách làm việc hàng ngày với AI Assistant

```
[Khung chat Antigravity] 
       │
       ├──► Nhắn: "tiến hành" + Dán deal KOC ──► AI tự sinh Hợp đồng Docs trên Drive
       │
       ├──► Nhắn: "thực thi 1" ───────────────► AI tự tạo Gmail Draft & cập nhật Sheet Data KOC
       │
       ├──► Gửi link Google Drive media ──────► AI tự tạo folder 2026 & đổi tên file chuẩn
       │
       └──► Gửi link bài đăng Post Air ──────► AI tự gán hyperlink & ghi Sheet Report Saga
```

#### Bước 1: Mở dự án trong Antigravity
1. Khởi động Antigravity.
2. Chọn **File** $\rightarrow$ **Open Folder...** (hoặc mở Workspace) $\rightarrow$ Trỏ đến thư mục `d:\Booking` (hoặc thư mục mã nguồn vừa clone).
3. Hệ thống sẽ tự động nạp toàn bộ cấu hình, rules và skills mà không cần cấu hình thêm.

#### Bước 2: Thao tác thông qua khung Chat
Bạn chỉ cần giao tiếp bằng tiếng Việt tự nhiên trong khung trò chuyện của Antigravity:

| Bạn nhắn | AI Assistant sẽ làm gì? |
| :--- | :--- |
| **`"tiến hành"`** + thông tin KOC | Tự bóc tách deal: Tách riêng HĐ Cast và HĐ Tặng SP ($\le$ 20 triệu/HĐ), tính thuế TNCN 10% (Cast $\ge$ 5M), chuẩn hóa 6 thông số kỹ thuật sản phẩm Saga, tạo thư mục KOC và trả link Google Docs ngay trong chat. |
| **`"thực thi 1"`** | Quét trực tiếp Google Docs mới nhất (Live State), tra cứu email showroom từ danh bạ cửa hàng, tạo Thư nháp (Gmail Draft) với font Times New Roman (để trống To/Cc), sinh Phiếu ĐNTT (giá trị Net), và cập nhật trạng thái `Đã chốt` trên Sheet `Data KOC`. |
| **Gửi Link Drive Media** | KOC gửi source $\rightarrow$ Bạn dán link vào chat. AI tự động tạo cấu trúc folder `2026/Video/Hình ảnh` và đổi tên file chuẩn 100%: `KOC SAGA, [TÊN KOC], [tên SP], [thể loại] - [nội dung]`. |
| **Gửi Link Post Air** | Bài đã đăng $\rightarrow$ Dán link kèm tên KOC vào chat. AI tự dò Sheet Data KOC, phân loại nền tảng (TikTok, FB Reels, IG Reels...), gán nhãn hyperlink và ghi dòng mới vào Sheet `Report Saga`. |

> [!TIP]
> **Nếu bạn là nhân sự mới thay thế Giáng Tuyết:**  
> Chỉ cần nhắn một câu duy nhất trong khung chat: `Tôi là [Tên bạn]` (ví dụ: `Tôi là Minh Anh`). AI sẽ tự động ghi nhớ và sử dụng tên này để đối chiếu với cột `Người phụ trách` trên Sheet Data KOC trong suốt quá trình làm việc!

---

## 2. TRƯỜNG HỢP 2: BẠN CHƯA TỪNG SỬ DỤNG ANTIGRAVITY (NGƯỜI MỚI)

Nếu bạn là nhân viên mới của team hoặc chưa từng cài đặt Antigravity, bạn có 2 lựa chọn:

### 🌟 LỰA CHỌN 1 (KHUYÊN DÙNG): Cài đặt Antigravity để có trải nghiệm tự động 100%
Vì toàn bộ logic bóc tách ngôn ngữ tự nhiên (hiểu hợp đồng, đọc kịch bản SOW, nhận diện nền tảng mạng xã hội) được hỗ trợ tốt nhất bởi Antigravity AI Agent, việc cài đặt Antigravity sẽ giúp bạn tiết kiệm 95% thời gian làm việc thủ công:

1. **Tải và cài đặt Antigravity**: Tải bộ cài đặt Antigravity IDE phù hợp với hệ điều hành của bạn.
2. **Clone mã nguồn dự án**:
   ```bash
   git clone https://github.com/Giangtuyet0611/booking-giang-tuyet-automation.git
   cd booking-giang-tuyet-automation
   ```
3. **Cài đặt thư viện**:
   ```bash
   npm install
   ```
4. **Cấp quyền tài khoản Google Workspace**:
   - Nhấp đúp vào file `authenticate.bat` (trên Windows).
   - Đăng nhập tài khoản Google công việc trên trình duyệt để cấp quyền.
5. **Mở dự án trên Antigravity** và làm việc theo hướng dẫn tại [**Trường hợp 1**](#1-trường-hợp-1-bạn-đang-sử-dụng-antigravity-khuyên-dùng---dễ-nhất).

---

### 💻 LỰA CHỌN 2: Sử dụng độc lập bằng Terminal / Node.js (Không cần Antigravity)
Dành cho lập trình viên (Developer) hoặc người muốn chạy script trực tiếp bằng dòng lệnh:

#### 1. Yêu cầu môi trường
- Đã cài đặt **Node.js** (v18.x hoặc v20.x trở lên) từ [nodejs.org](https://nodejs.org).
- Đã cài đặt **Git**.

#### 2. Cài đặt và cấu hình
```bash
# 1. Clone repository
git clone https://github.com/Giangtuyet0611/booking-giang-tuyet-automation.git
cd booking-giang-tuyet-automation

# 2. Cài đặt các thư viện cần thiết (googleapis, etc.)
npm install

# 3. Chạy xác thực Google OAuth
node src/auth_full.cjs
# (Trình duyệt sẽ mở lên để bạn xác nhận quyền và sinh ra file .gdrive-server-credentials.json)
```

#### 3. Chạy các chức năng bằng mã nguồn Node.js
Bạn có thể tham khảo hoặc trực tiếp thực thi các script sẵn có trong thư mục `src/`:

- **Tạo Hợp đồng Docs**:
  Khởi tạo tham số JSON và gọi hàm `generateSplittedContracts(params)` từ `src/action_contract.cjs`:
  ```bash
  node src/run_testing1_minhanh.cjs
  ```
  *(Xem file `src/run_testing1_minhanh.cjs` để biết cấu trúc đầy đủ của object `params`).*

- **Chạy Thực thi 1 (Soạn mail draft + ĐNTT + Sheet Data KOC)**:
  Khởi tạo thông tin showroom, KOC và gọi hàm `executeThucThi1(data)` từ `src/action_thucthi1.cjs`:
  ```bash
  node src/run_thucthi1_minhanh.cjs
  ```

- **Xử lý Media Materials**:
  Chạy module `src/action_materials.cjs` hoặc gọi qua `src/booking_agent.cjs`.

- **Cập nhật Báo cáo Post Air**:
  Chạy module `src/action_post_air.cjs` với dữ liệu bài đăng.

---

## 3. CÀI ĐẶT & CẤP QUYỀN GOOGLE WORKSPACE (BẮT BUỘC CHO CẢ 2 TRƯỜNG HỢP)

Dù bạn dùng Antigravity hay chạy bằng Terminal, máy tính của bạn cần được kết nối và cấp quyền với tài khoản Google Workspace (chứa Drive, Docs, Sheets và Gmail):

1. **Chuẩn bị file OAuth Client ID**: Đảm bảo file cấu hình Google Cloud `gcp-oauth.keys.json` nằm tại thư mục gốc của dự án.
2. **Kích hoạt trình cấp quyền**:
   - Trên **Windows**: Nhấp đúp chuột vào file `authenticate.bat`.
   - Hoặc chạy qua Terminal: `node src/auth_full.cjs`.
3. **Ủy quyền trên trình duyệt**:
   - Trình duyệt mặc định sẽ tự động mở lên.
   - Chọn tài khoản Google của bạn $\rightarrow$ Bấm **Continue / Cho phép** các quyền truy cập: Drive, Docs, Sheets, Gmail Drafts.
4. **Kết quả**:
   - Terminal hiện thông báo xác thực thành công.
   - Hệ thống tự sinh file `.gdrive-server-credentials.json` để lưu trữ token.
   - File token này đã nằm trong `.gitignore` nên an toàn tuyệt đối, không lo bị đẩy lên GitHub.

---

## 4. BẢNG CẤU HÌNH TÀI NGUYÊN TẬP TRUNG (`config.json`)

Toàn bộ ID tài nguyên của hệ sinh thái Google Drive và Google Sheets được quản lý tập trung tại file `config.json` ở thư mục gốc:

| Tên biến cấu hình | Giá trị ID mặc định | Ý nghĩa & Mục đích sử dụng |
| :--- | :--- | :--- |
| `CONTRACT_TARGET_ROOT_FOLDER_ID` | `117T7PVrbn48hc97-02JMj3K4ApYeSDPZ` | Thư mục cha `[0] File mềm` chứa các thư mục tháng |
| `CONTRACT_TEMPLATE_DOC_ID` | `1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8` | Mẫu Google Docs HĐ Trao đổi tặng sản phẩm |
| `CONTRACT_TEMPLATE_CAST_DOC_ID` | `19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V` | Mẫu HĐ Dịch vụ Thương mại trả Cast (.docx) |
| `PAYMENT_REQUEST_TEMPLATE_DOC_ID`| `143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg` | Mẫu Google Docs Phiếu Đề Nghị Thanh Toán |
| `PAYMENT_REQUEST_TARGET_FOLDER_ID`| `12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku` | Thư mục lưu Phiếu ĐNTT: `[6] Kết toán tháng` |
| `SPREADSHEET_DATA_KOC_ID` | `1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw` | Google Sheet quản lý data KOC toàn team |
| `TAB_DATA_KOC` | `Data KOC (11/2026)` | Tên tab dữ liệu theo tháng đang làm việc |
| `SPREADSHEET_REPORT_SAGA_ID` | `1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I` | Google Sheet báo cáo post air toàn team |
| `TAB_REPORT_SAGA` | `Report Saga` | Tên tab báo cáo post air |
| `MEDIA_ROOT_FOLDER_ID` | `1haQ5DK8FYMHJ-7bDzmR5SldEIHyePVDl` | Thư mục cha chứa folder năm `2026` của media |
| `SHEET_STORE_CONTACTS` | `1G-S4EQ-HQHPMqdKk9V26yRVNQ_ZWn-dXezcZNogh-jY` | Sheet danh sách email, SĐT và Leader các showroom |

---

## 5. CHI TIẾT 4 QUY TRÌNH NGHIỆP VỤ CỐT LÕI

### 5.1. Quy trình 1: Làm hợp đồng (Lệnh "tiến hành")

#### 🔹 Mẫu dữ liệu KOC đầu vào
```text
tiến hành
Họ và tên: NGUYỄN LÊ MINH ANH
Số điện thoại: 0901234567
CCCD: 079123456789 (Ngày cấp: 01/01/2021 - Nơi cấp: Cục CSQLHC về TTXH)
Địa chỉ: 123 Đường Nguyễn Văn Linh, Phường Tân Hưng, TP. Hồ Chí Minh
Kênh chính: Tiktok @minhanhdaily (Link: https://www.tiktok.com/@minhanhdaily)
Kênh phụ: Facebook (Link: ...), Instagram (Link: ...)

Deal hợp tác:
- Chi phí Cast: 7.000.000 VNĐ (Thanh toán 1 đợt sau nghiệm thu)
- Sản phẩm tặng:
  1. Mã 53578-LGSVWH-2 (BST Saga Stella Chance, Giá: 12.590.000 VNĐ)
  2. Mã 71836-SVSVSV-2 (BST Saga Stella Rectangle, Giá: 8.900.000 VNĐ)
- Showroom nhận: 190D Trần Quang Khải, Phường Tân Định, Quận 1, TP.HCM
- Ngày nhận dự kiến: 20/11/2026
- SOW:
  + Video 01: Video Storytelling TikTok (60-90s) "Tự thưởng đồng hồ đi tiệc", reup Reels FB & IG, air ngày 28/11/2026
  + Photo Post 01: Bộ ảnh Lifestyle 6-8 ảnh đăng Facebook & Instagram, air ngày 30/11/2026
```

#### 🔹 Logic tự động hóa của hệ thống
1. **Tách Hợp đồng độc lập**:
   - Nếu có Cast $\rightarrow$ Tạo **01 HĐ Thương mại trả Cast**.
   - Nếu có Tặng SP $\rightarrow$ Nhóm sản phẩm sao cho **mỗi HĐ $\le$ 20.000.000 VNĐ**. Ví dụ deal trên tổng giá trị $12.590.000 + 8.900.000 = 21.490.000$ VNĐ ($> 20$ triệu) $\rightarrow$ Tự động tách thành **02 HĐ Tặng SP riêng biệt**.
2. **Chuẩn hóa SOW độc quyền**:
   - Hợp đồng Cast chỉ chứa SOW video chính.
   - Mỗi Hợp đồng Tặng SP chỉ chứa duy nhất SOW phân bổ cho sản phẩm đó.
   - Tuyệt đối không để sót các hạng mục thừa từ file mẫu.
3. **Bảng Thuế TNCN 10% (Cast $\ge$ 5.000.000 VNĐ)**:
   - Câu văn bản Điều 2.1: Ghi rõ số tiền Net thực nhận.
   - Bảng chuẩn 5 dòng: STT/Hạng mục $\rightarrow$ **TỔNG CỘNG** (Gross = Net + 10%) $\rightarrow$ **Bên B thực nhận** (Net) $\rightarrow$ **Bên A nộp thuế thay** (10%).
4. **Bóc tách chuẩn 6 thông số sản phẩm**: Thương hiệu, Số hiệu sản phẩm, Bộ sưu tập, Xuất xứ (Mỹ), Máy (Quartz Pin), Bảo hành quốc tế (2 Năm).
5. **Định dạng file theo ISO `YYYY-MM-DD`**:
   - Thư mục tổng: `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng tổng hợp - Đồng Hồ Hải Triều`.
   - Các hợp đồng giãn cách ngày ký $\pm 3$ ngày để tự phân biệt (tuyệt đối không đánh số `(1)`, `(2)` và không đưa mã SP vào tiêu đề).

---

### 5.2. Quy trình 2: Thực thi 1 (Lệnh "thực thi 1")

Sau khi bạn đã kiểm tra hoặc chỉnh sửa trực tiếp trên link Google Docs, nhắn:
```text
thực thi 1
```

Hệ thống sẽ thực hiện tuần tự:
1. **Quét dữ liệu thời gian thực (Live State)**: Đọc nội dung Google Docs mới nhất (không dùng cache) để nhận diện mọi thay đổi của bạn về Showroom, Ngày nhận, Mã sản phẩm, Số tiền cast.
2. **Tra cứu email showroom**: Dò tìm tự động từ Sheet danh bạ cửa hàng.
3. **Tạo Thư nháp (Gmail Draft)**:
   - Tự động tạo email trong mục **Drafts** của Gmail.
   - Font chữ: Times New Roman, cỡ lớn, bôi đậm thông tin quan trọng.
   - Phân luồng rõ ràng: Kho XNH, Showroom chuyển, Showroom nhận.
   - Người nhận: Để trống cả To và Cc để bạn tự kiểm tra và điền trước khi gửi.
4. **Sinh Phiếu Đề Nghị Thanh Toán (Phiếu ĐNTT)**:
   - Chỉ ghi giá trị Net thực nhận.
   - Hỗ trợ chia nhiều đợt nếu deal thỏa thuận thanh toán từng đợt.
   - Lưu vào thư mục `[6] Kết toán tháng`.
5. **Cập nhật trạng thái chốt deal trên Sheet Data KOC**: Xem chi tiết ở [Mục 6.1](#61-sheet-data-koc-cập-nhật-trạng-thái-chốt-deal).

---

### 5.3. Quy trình 3: Xử lý Media Materials (Source trả bài)

Khi KOC gửi link Drive chứa video/hình ảnh, bạn nhắn vào chat:
```text
KOC Minh Anh Daily gửi link source: https://drive.google.com/drive/folders/xxxxxx
Sản phẩm: Saga Stella Chance 53578-LGSVWH-2
Thể loại: Video storytelling
Nội dung tóm tắt: Tự thưởng đồng hồ đi tiệc
```

Hệ thống sẽ:
1. Tạo folder KOC trong thư mục năm `2026` của Media Root.
2. Tạo 2 folder con: `Video` và `Hình ảnh`.
3. Tải/Copy và đổi tên file theo chuẩn 100%:  
   `KOC SAGA, [TÊN KOC], [tên sản phẩm], [thể loại] - [tóm tắt nội dung video]`
4. Cung cấp đường dẫn folder thành phẩm (Materials) để làm bước báo cáo post air.

---

### 5.4. Quy trình 4: Báo cáo bài đăng Post Air

Khi bài đăng được lên sóng, bạn nhắn thông tin:
```text
KOC Minh Anh Daily [lần 1]
Materials: https://drive.google.com/drive/folders/xxxxxx
Format: Video
UTM: https://donghohaitrieu.com/...utm_source=koc_minhanh
Link post:
- https://www.tiktok.com/@minhanh/video/123456789
- https://www.facebook.com/reel/987654321
- https://www.instagram.com/reel/abcdefghi
```

Hệ thống sẽ:
1. Tra cứu Sheet Data KOC để lấy `Liên hệ lần thứ` và `Tên kênh`.
2. Ghi mỗi bài đăng trên 1 hàng độc lập vào dòng trống đầu tiên của Sheet `Report Saga`.
3. Phân loại kênh và gán nhãn hyperlink tự động:
   - TikTok video $\rightarrow$ `Tiktok`
   - TikTok ảnh $\rightarrow$ `Tiktok Photo`
   - Facebook Reels $\rightarrow$ `Facebook Reels`
   - Instagram Reels $\rightarrow$ `Instagram Reels`
4. Bảo toàn nguyên vẹn mọi cột công thức (View, CPM, Chi phí sau deal...).

---

## 6. CƠ CHẾ LÀM VIỆC VỚI 2 GOOGLE SHEETS CỦA TEAM

> [!IMPORTANT]
> **Nhận diện cột theo TÊN TIÊU ĐỀ**: Team có thể tùy ý đảo thứ tự cột hoặc thêm cột mới. Hệ thống sẽ tự động quét dòng tiêu đề để tìm đúng tên cột, không cố định vị trí cột A, B, C.

### 6.1. Sheet Data KOC (Cập nhật trạng thái chốt deal)
- **ID:** `1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw` | **Tab:** DUY NHẤT Tab `Data KOC (11/2026)`.
- **QUY ĐỊNH BẮT BUỘC**: Tuyệt đối **chỉ điền vào tab `Data KOC (11/2026)` này, KHÔNG tự tạo thêm tab tháng mới**.
- **Quy tắc:** **KHÔNG THÊM DÒNG MỚI**, chỉ CẬP NHẬT dòng KOC đã có sẵn:
  1. Dò tìm tên KOC ở cột `Tên kênh (Kênh chính booking, không trùng lặp)`.
  2. Chỉ cập nhật khi cột `Người phụ trách` khớp với người đang vận hành (mặc định: `Giáng Tuyết`).
  3. Chỉ điền 5 cột:
     - `Trạng thái`: `Đã chốt`
     - `Số sản phẩm tặng`: Số lượng đồng hồ
     - `Mã sản phẩm`: Các mã cách nhau bởi ` ; ` (ví dụ: `53578-LGSVWH-2 ; 71836-SVSVSV-2`)
     - `Tổng chi phí sản phẩm`: Tổng giá trị đồng hồ tặng
     - `Tổng cast`: Tiền mặt thực nhận (Net)

### 6.2. Sheet Report Saga (Báo cáo Post Air)
- **ID:** `1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I` | **Tab:** `Report Saga`.
- **Quy tắc:**
  - **Mỗi bài đăng là 1 hàng độc lập**.
  - Chỉ ghi vào dòng trống đầu tiên (cột `Tên kênh` rỗng), tuyệt đối không ghi đè dòng đã có dữ liệu.
  - Điền các cột: `Liên hệ lần thứ`, `Tên kênh`, `Ngày AIR`, `Link UTM KOC`, `Materials`, `Format`, `Thời gian SDHA` (mặc định `Trọn đời`), `Kênh đăng`, `Link post` (hyperlink).
  - Không đụng vào các cột có công thức tính tự động.

---

## 7. 12 NGUYÊN TẮC VẬN HÀNH BẤT BIẾN (CORE RULES)

1. **Lệnh kích hoạt**: `"tiến hành"` (làm HĐ), `"thực thi 1"` (xuất hàng, ĐNTT, cập nhật sheet).
2. **Tự động hóa hoàn toàn**: Không hỏi lại từng bước nhỏ sau Testing 1; chỉ nhắc khi thiếu thông tin bắt buộc (CCCD, SĐT, showroom, SOW).
3. **Cơ chế 2 Sheet mới**: Ngừng ghi vào Sheet cũ `[0] Tổng hợp report...`; chuyển sang Sheet `Data KOC` và Sheet `Report Saga`.
4. **SOW độc quyền**: Mỗi hợp đồng chỉ chứa duy nhất SOW của nó, không để sót mục thừa.
5. **Thông số sản phẩm Saga**: Luôn đủ 6 trường: Thương hiệu, Số hiệu, BST, Xuất xứ (Mỹ), Máy (Quartz Pin), BHQT (2 Năm).
6. **Thuế TNCN**: Cast $\ge$ 5M phải có bảng thuế 5 dòng; Điều 2.1 và Phiếu ĐNTT chỉ ghi số tiền thực nhận (Net).
7. **Đồng bộ Bên B**: Tên người ký ở cuối HĐ phải khớp 100% với tên Bên B.
8. **Email xuất sản phẩm**: Tiêu đề chuẩn, để trống To/Cc, đẩy tự động vào Gmail Drafts.
9. **Định dạng file ISO**: Mọi thư mục và file đều bắt đầu bằng `YYYY-MM-DD`. Tiêu đề HĐ Tặng SP không chứa mã sản phẩm và không đánh số (1), (2).
10. **Phân bổ SOW khi tách HĐ**: Tách biệt hoàn toàn giữa HĐ Cast và các HĐ Tặng SP.
11. **Nguyên tắc Live State**: Khi "thực thi 1", luôn đọc từ Google Docs mới nhất, không dùng cache.
12. **Cập nhật Post Air**: Mỗi kênh 1 hàng, tự động gán nhãn hyperlink chuẩn nền tảng.

---

## 8. KHẮC PHỤC SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

| Hiện tượng / Lỗi | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| Báo lỗi `invalid_grant` hoặc `Token expired` | Token OAuth của Google Workspace bị hết hạn hoặc thu hồi | Nhấp đúp vào file `authenticate.bat` (hoặc chạy `node src/auth_full.cjs`) và đăng nhập lại trên trình duyệt. |
| Quy định tab Sheet Data KOC | Nhầm lẫn sang tháng mới | Luôn chỉ điền vào tab `Data KOC (11/2026)`, tuyệt đối không tự tạo thêm tab tháng mới. |
| Không cập nhật được dòng KOC trên Sheet Data KOC | Cột `Người phụ trách` không khớp tên của bạn | Nhắn trong chat Antigravity: `Tôi là [Tên bạn]`. AI sẽ tự động đồng bộ theo tên mới. |
| Không thấy email xuất hàng gửi đi | Hệ thống chỉ tạo bản nháp để bạn kiểm tra trước | Mở mục **Thư nháp (Drafts)** trong Gmail của bạn, kiểm tra nội dung, điền To/Cc và bấm Gửi. |
| Báo thiếu thông tin khi nhắn "tiến hành" | Deal KOC gửi vào bị thiếu trường bắt buộc | Bổ sung ngay các trường mà AI thông báo (ví dụ số CCCD, showroom nhận, ngày nhận hàng...). |

---

*Tài liệu được biên soạn và bảo trì bởi đội ngũ Marketing / Social Media - Đồng Hồ Hải Triều.*
