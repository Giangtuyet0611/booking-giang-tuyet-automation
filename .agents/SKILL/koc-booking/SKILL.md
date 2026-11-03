---
name: koc-booking-workflow
description: Quy trình tự động hóa toàn diện cho nghiệp vụ Booking KOC Đồng Hồ Hải Triều (Tạo hợp đồng chuẩn SOW/Thuế, Thực thi 1 - Soạn mail xuất sản phẩm đẩy Gmail Drafts + tạo Phiếu ĐNTT + ghi Sheet CSC, và Xử lý Media Materials). Kích hoạt khi người dùng cung cấp thông tin KOC mới, hoặc nhắn lệnh "tiến hành", "thực thi 1", "media materials".
---

# WORKFLOW BOOKING KOC - ĐỒNG HỒ HẢI TRIỀU

Quy trình tự động hóa toàn diện dành cho nhân sự Marketing / Social Media phụ trách booking KOL/KOC thương hiệu Saga tại Đồng Hồ Hải Triều. Hệ thống tích hợp xử lý tài liệu Google Workspace (Docs, Drive, Sheets, Gmail API).

---

## 1. CÁC LỆNH KÍCH HOẠT VÀ ĐIỀU KIỆN KÍCH HOẠT

| Lệnh người dùng | Hành động của AI | Script thực thi tương ứng |
| :--- | :--- | :--- |
| **"tiến hành"** (hoặc gửi thông tin KOC mới) | Bóc tách deal, phân loại hợp đồng (Cast / Tặng SP), tạo thư mục KOC, nhân bản và điền thông tin hợp đồng chuẩn SOW độc lập, chuẩn thuế TNCN. | `src/action_contract.cjs` |
| **"thực thi 1"** | Quét trạng thái Google Docs mới nhất, tra cứu email showroom từ Sheet cửa hàng, tự động tạo Thư nháp (Draft) trong Gmail, sinh Phiếu ĐNTT (giá trị Net), ghi dòng MỚI vào Sheet `CSC - Saga`. | `src/action_thucthi1.cjs` |
| **Gửi Link Drive Media** (KOC trả bài) | Tạo thư mục KOC theo năm `2026`, tạo folder con `Video`/`Hình ảnh`, đổi tên file theo cú pháp chuẩn, ghi nhận Tab 2 `SL materials - Saga v1` bằng công thức `=XLOOKUP`. | `src/action_media.cjs` |
| **Gửi Link Post Air** (Bài đã đăng) | Kiểm tra link bài đăng công khai, cập nhật dòng mới vào Tab 3 `2 SL post & ĐTT - Saga`. | `src/action_media.cjs` |

> [!IMPORTANT]
> **Quy định tự động hóa sau Testing 1**: AI tự động thực hiện trọn gói toàn bộ quy trình, KHÔNG hỏi lại từng bước nhỏ. Nếu thông tin người dùng gửi bị thiếu thông tin bắt buộc (CCCD, SĐT, địa chỉ, showroom nhận, ngày nhận, SOW), AI chủ động nhắc người dùng bổ sung ngay.

---

## 2. QUY TRÌNH 1: TIẾP NHẬN THÔNG TIN & TẠO HỢP ĐỒNG (LỆNH "TIẾN HÀNH")

### 2.1. Logic Bóc Tách & Tách Hợp Đồng
Mỗi KOC có thể có nhiều quyền lợi (vừa có Cast, vừa được tặng nhiều sản phẩm đồng hồ). AI áp dụng quy tắc tách hợp đồng độc lập:
1. **Nếu có Phí Cast > 0đ**:
   - Tạo **01 Hợp đồng Thương mại (Trả cast)**.
   - Template file (.docx): `19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V`.
   - Phân bổ hạng mục SOW chính (ví dụ: Video Storytelling 60-90s) cho hợp đồng này.
2. **Nếu có Tặng sản phẩm hiện vật**:
   - Mỗi sản phẩm đồng hồ được tặng tạo **01 Hợp đồng Trao đổi tặng sản phẩm riêng biệt**.
   - Template file (Google Doc): `1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8`.
   - Phân bổ đúng 01 hạng mục SOW tương ứng cho sản phẩm đó (ví dụ: HĐ SP 1 gán Photo Post 6-8 ảnh; HĐ SP 2 gán Video Lifestyle 30-45s).

### 2.2. Chuẩn Hóa SOW Độc Lập Cho Từng Hợp Đồng (Không Dư Thừa)
- **Bảng SOW tại Điều 1**: Chỉ giữ đúng 01 dòng tương ứng với hạng mục được phân bổ cho hợp đồng đó. Xóa sạch toàn bộ các dòng còn lại của file mẫu hoặc của hợp đồng khác.
- **Quy chuẩn Điều 1.1 / 1.2**:
  - Hợp đồng Video: Chỉ giữ thời lượng video (`1.1. Thời lượng video: ...`).
  - Hợp đồng Photo Post: Chỉ giữ số lượng ảnh (`1.1. Số lượng hình ảnh/một bộ: Từ 6 đến 8 ảnh...`).
- **Câu văn bản Điều 1.3**: Đúng cấu trúc chuẩn:
  `Đăng 01 hạng mục -bộ ảnh/video- -nền tảng chính- (Reup -thể loại Reels/Story- -nền tảng phụ- ) (thời lượng) “rút gọn 1 câu khái quát từ định hướng kịch bản” vào ngày air`
- **Thời gian hiển thị bài đăng**: Luôn là **"Trọn đời"**.
- **Thời hạn sử dụng hình ảnh (SDHA)**: Theo deal; nếu có nhắc SDHA mà không rõ thời hạn thì mặc định là **"Trọn đời"**.

### 2.3. Bảng Chi Phí Cast & Thuế Thu Nhập Cá Nhân (TNCN)
Đối với hợp đồng có phí Cast $\ge$ 5.000.000 VNĐ:
- **Câu văn bản Điều 2.1**:
  `Bên A trả cho Bên B chi phí để thực hiện dịch vụ bằng hiện kim là: [Net] VNĐ đã khấu trừ thuế TNCN (Bằng chữ: [Bằng chữ số Net]) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)`
- **Bảng chi phí 5 dòng chuẩn hóa**:

| STT | Dịch vụ | Hạng mục | Số lượng / Thời gian | Đơn vị tính | Số tiền |
| :---: | :--- | :--- | :---: | :---: | :---: |
| 1 | Booking<br>KOC [Tên KOC] | [Tên hạng mục SOW] | 01 | Video (hoặc Gói) | [Net] |
| **TỔNG CỘNG** | | | | | **[Gross = Net + 10%] (Đã bao gồm thuế)** |
| **Bên B: [Họ và tên KOC] thực nhận** | | | | | **[Net]** |
| **Bên A: Công ty TNHH Hải Triều Việt Nam thực hiện nghĩa vụ đóng thuế thu nhập cá nhân cho bên B** | | | | | **[Thuế = 10% Net]** |

*Đơn vị tính: VNĐ*

### 2.4. Bóc Tách Sản Phẩm (Điều 2.1 HĐ Tặng SP)
Đủ 6 thuộc tính:
- Thương hiệu: Saga
- Số hiệu sản phẩm: [Mã sản phẩm]
- Bộ sưu tập: [Tên BST]
- Xuất xứ: Mỹ
- Máy: Quartz (Pin)
- Bảo Hành Quốc Tế: 2 Năm

### 2.5. Định Dạng Tên Thư Mục & File
- Tất cả các file và thư mục tạo ra đều bắt đầu bằng **`YYYY-MM-DD`**:
  - Thư mục KOC: `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng tổng hợp - Đồng Hồ Hải Triều` (Lưu tại thư mục tháng tương ứng trong `117T7PVrbn48hc97-02JMj3K4ApYeSDPZ`).
  - HĐ Thương mại: `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng Thương mại (Trả cast) - Đồng Hồ Hải Triều`
  - HĐ Tặng SP: `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - [Mã SP] - Đồng Hồ Hải Triều`

---

## 3. QUY TRÌNH 2: THỰC THI 1 (LỆNH "THỰC THI 1")

Khi người dùng nhắn **"thực thi 1"**, AI thực hiện tuần tự 4 tác vụ sau:

### 3.1. Bóc Tách Dữ Liệu Thời Gian Thực Từ Link Google Docs
- **TUYỆT ĐỐI KHÔNG DÙNG CACHE**: AI quét trực tiếp nội dung các file Google Docs hợp đồng vừa tạo ở trạng thái mới nhất:
  - Bóc tách Showroom nhận hàng và Ngày nhận hàng dự kiến từ Điều 2.2.
  - Bóc tách danh sách sản phẩm từ Điều 2.1.
  - Bóc tách thông tin cá nhân KOC từ Bên B.
  - Bóc tách chi phí Cast và các đợt thanh toán từ HĐ Cast.
  - *Mọi chỉnh sửa thủ công của người dùng trên Docs đều được hệ thống nhận diện tức thì.*

### 3.2. Tra Cứu Email Cửa Hàng & Tự Động Đẩy Thư Nháp Gmail
- **Cơ sở tra cứu**: Tra cứu tự động từ Sheet [Danh sách mail cửa hàng và người phụ trách](https://docs.google.com/spreadsheets/d/1G-S4EQ-HQHPMqdKk9V26yRVNQ_ZWn-dXezcZNogh-jY/edit?gid=0#gid=0) bằng tiện ích `src/utils/store_lookup.util.cjs`:
  - Lấy email chính thức của showroom nhận hàng (ví dụ: `190tranquangkhai@donghohaitrieu.vn`).
  - Lấy thông tin Leader/BA/HM phụ trách showroom và SĐT liên hệ.
  - Lấy email showroom chuyển hàng (nếu có điều hàng từ showroom khác).
- **Soạn nội dung email gom chung**: Dùng `src/utils/mail_template.cjs`:
  - Phân tách các đoạn bằng dòng gạch ngang `----------------`.
  - Đoạn Kho XNH (gửi chị Ngọc): Chỉ ghi sản phẩm xuất từ XNH.
  - Đoạn Showroom chuyển hàng: Chỉ ghi sản phẩm điều từ showroom đó.
  - Đoạn Showroom nhận hàng: Ghi tất cả sản phẩm KOC nhận tại đây.
  - Ghi chú: Xuất trình CCCD gốc, xuất hóa đơn 0đ, kèm hộp BOM túi giấy không bảo hành mở rộng.
- **Tự động tạo Thư nháp trong Gmail**: Dùng `src/utils/gmail_draft.util.cjs`:
  - **Tiêu đề email**: `Marketing - Xuất sản phẩm tặng KOC <tên KOC>`.
  - **Người nhận (To)**: Email showroom nhận hàng, `kimlien@donghohaitrieu.vn`, `kimngoc@donghohaitrieu.vn` (nếu có hàng xuất XNH).
  - **Đồng gửi (Cc)**: Email showroom chuyển (nếu có), leader/quản lý phụ trách showroom, team hỗ trợ showroom, PIC booking.
  - *Bản nháp xuất hiện ngay lập tức trong mục Drafts của hộp thư Gmail.*

### 3.3. Sinh Phiếu Đề Nghị Thanh Toán (Phiếu ĐNTT)
- Nếu có chi phí Cast > 0đ:
  - Template Doc: `143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg`.
  - Thư mục lưu: `[6] Kết toán tháng` (ID: `12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku`).
  - Tên file chuẩn `YYYY-MM-DD`: `YYYY-MM-DD - Phiếu đề nghị thanh toán (Đợt X - ...) - Team Social - [Tên KOC]`.
  - **Số tiền trên phiếu**: **CHỈ GHI GIÁ TRỊ THỰC NHẬN (NET)**, không ghi giá trị bao gồm thuế.
  - Nếu hợp đồng chia nhiều đợt thanh toán (ví dụ 50% duyệt kịch bản, 50% nghiệm thu), sinh phiếu ĐNTT tương ứng cho từng đợt với số tiền thực nhận của đợt đó.

### 3.4. Ghi Dòng MỚI Vào Sheet `CSC - Saga` (Tab 1)
- Truy cập Spreadsheet Tổng: `1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0`, Tab `CSC - Saga`.
- Quét cột D để tìm dòng có dữ liệu cuối cùng.
- **CHỈ GHI MỚI, KHÔNG GHI ĐÈ**: Ghi thông tin booking KOC vào dòng trống tiếp theo. Cột A (STT) dùng công thức `=A[row-1]+1`.

---

## 4. QUY TRÌNH 3: XỬ LÝ MEDIA MATERIALS & POST AIR

Khi KOC hoàn thành sản xuất và gửi link Google Drive chứa video/hình ảnh:

### 4.1. Nhận Link Drive & Đổi Tên File Chuẩn
- Thư mục gốc lưu trữ Media: `[0] Tổng hợp hình ảnh và video KOC Saga` (ID: `1haQ5DK8FYMHJ-7bDzmR5SldEIHyePVDl`).
- Sử dụng thư mục năm **`2026`** (ID: `1pfe51QxlMM5H0BBXh3wb5eRqQBJWOgXI`), không tạo năm mới.
- Tạo thư mục KOC và 2 folder con: `Video` và `Hình ảnh`.
- Đổi tên toàn bộ file media theo chuẩn 100%:
  `KOC SAGA, TÊN KOC, tên sản phẩm, thể loại - tóm tắt nội dung video`
  *(Ví dụ: `KOC SAGA, Minh Anh Daily, Saga Stella Chance 53578-LGSVWH-2, Video storytelling - Tự thưởng đồng hồ đi tiệc cuối năm`)*.

### 4.2. Ghi Nhận Vào Sheet `SL materials - Saga v1` (Tab 2, Cột A $\rightarrow$ J)
- Truy cập Spreadsheet Tổng, Tab `SL materials - Saga v1`.
- **CHỈ GHI MỚI**: Tìm dòng trống cuối cùng để append.
- **Cột C (Họ và tên)**: Bắt buộc dùng công thức tự động liên kết:
  `=XLOOKUP(B..., 'CSC - Saga'!D:D, 'CSC - Saga'!E:E, "")`
- **Cột F (Tên thành phẩm)**: Gắn Hyperlink trỏ trực tiếp về file trên Drive với văn bản hiển thị là cụm *"thể loại - tóm tắt nội dung video"*.
- **Cột K $\rightarrow$ Q**: Không can thiệp, giữ nguyên cấu trúc.

### 4.3. Cập Nhật Báo Cáo Post Air (Tab 3: `SL post & ĐTT - Saga`)
- **Khi KOC air bài**: Người dùng gửi link bài đăng kèm tên KOC (kịch bản: *"KOC [Tên KOC] đã air bài: [Link 1], [Link 2]..."*).
- **Thực thi qua script**: `src/action_post_air.cjs`.
- **Quy trình chi tiết**:
  1. **Tra cứu Tab `CSC - Saga`**:
     - Tìm kiếm dòng tương ứng của KOC theo tên.
     - Lấy: `Ngày Book` (Cột C), `Người phụ trách` (Cột B), `Tên KOC` (Cột D), `Link SP UTM` (Cột E), `Giá trị SP` (Cột F).
  2. **Gán Ngày Air Post (Cột B)**:
     - Mặc định là ngày người dùng gửi bài (`DD/MM/YYYY`) nếu không có ghi chú cụ thể.
  3. **Phân tích nhãn Hyperlink bài đăng**:
     - **Facebook**: Chứa `reel`/`reels` $\rightarrow$ Nhãn `Facebook Reels`; khác $\rightarrow$ Nhãn `Facebook`. Nhóm: `FB / IG`.
     - **TikTok**: Chứa `/photo/` $\rightarrow$ Nhãn `Tiktok Photo`; khác $\rightarrow$ Nhãn `Tiktok`. Nhóm: `Tiktok`.
     - **Instagram**: Chứa `reel`/`reels` $\rightarrow$ Nhãn `Instagram Reels`; chứa `/p/` hoặc `photo` $\rightarrow$ Nhãn `Instagram`; khác $\rightarrow$ Nhãn `Instagram Video`. Nhóm: `FB / IG`.
  4. **Ghi nhận & gom dòng cùng ngày**:
     - Nếu có cả link FB và IG trong cùng ngày $\rightarrow$ Gom trên 1 dòng: Link 1 ở Cột I (`Link post 1`), Link 2 ở Cột R (`Link post 2`), Cột G là `FB / IG`.
     - Nếu là TikTok hoặc các kênh độc lập khác $\rightarrow$ Ghi trên dòng riêng, Cột G tương ứng (`Tiktok`, `Threads`, `Youtube`).
  5. **Bảo toàn công thức & chỉ ghi mới**:
     - Quét tìm dòng trống đầu tiên (cột D rỗng). Tuyệt đối không ghi đè.
     - Kế thừa và bảo toàn công thức tự động tại Cột H (`Tổng điểm tương tác`), Cột L (`Giá trị nhận diện đem lại post 1`), Cột U (`Giá trị nhận diện đem lại post 2`).

---

## 5. BẢNG CẤU HÌNH TÀI NGUYÊN HỆ THỐNG CỐ ĐỊNH

Tất cả các ID dưới đây được quản lý tập trung tại `config.json` và code base `src/`:

| Tên tài nguyên | ID Google Workspace | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Spreadsheet Tổng Report & Materials** | `1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0` | Quản lý 3 Tab: `CSC - Saga`, `SL materials - Saga v1`, `2 SL post & ĐTT - Saga` |
| **Sheet Danh sách mail cửa hàng & PIC** | `1G-S4EQ-HQHPMqdKk9V26yRVNQ_ZWn-dXezcZNogh-jY` | Tra cứu tự động email showroom, leader BA/HM, team hỗ trợ |
| **Sheet Kiểm tra Tồn kho Showroom** | `1jqSBCvOJNjrMKjlJuxKDVJQ1xY0KcNfZgo_zFKWIJuc` | Kiểm tra tồn kho sản phẩm tại các chi nhánh Hải Triều |
| **Thư mục Hợp Đồng Gốc ([0] File mềm)** | `117T7PVrbn48hc97-02JMj3K4ApYeSDPZ` | Chứa các thư mục tháng (Tháng 10: `1L_w9zOlQtul_EXviyK83ZTBVRomsdLC4`...) |
| **Thư mục Lưu Phiếu ĐNTT ([6] Kết toán tháng)** | `12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku` | Lưu trữ toàn bộ các file Phiếu đề nghị thanh toán của team Social |
| **Thư mục Media Root KOC Saga** | `1haQ5DK8FYMHJ-7bDzmR5SldEIHyePVDl` | Thư mục cha chứa folder năm `2026` (`1pfe51QxlMM5H0BBXh3wb5eRqQBJWOgXI`) |
| **Mẫu HĐ Trao Đổi Tặng SP (Doc)** | `1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8` | Template HĐ Tặng đồng hồ Saga |
| **Mẫu HĐ Thương Mại Trả Cast (.docx)** | `19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V` | Template HĐ Dịch vụ trả phí Cast |
| **Mẫu Phiếu ĐNTT (Doc)** | `143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg` | Template Phiếu Đề Nghị Thanh Toán |
