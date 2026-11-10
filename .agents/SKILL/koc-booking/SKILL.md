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
| **"thực thi 1"** | Quét trạng thái Google Docs mới nhất, tra cứu email showroom từ Sheet cửa hàng, tự động tạo Thư nháp (Draft) trong Gmail, sinh Phiếu ĐNTT (giá trị Net), cập nhật trạng thái chốt deal trên Sheet Data KOC (mục 3.4). | `src/action_thucthi1.cjs` |
| **Gửi Link Drive Media** (KOC trả bài) | Tạo thư mục KOC theo năm `2026`, tạo folder con `Video`/`Hình ảnh`, đổi tên file theo cú pháp chuẩn, ghi nhận vào Sheet Report (mục 4.2). | `src/action_media.cjs` |
| **Gửi Link Post Air** (Bài đã đăng) | Kiểm tra link bài đăng công khai, cập nhật dòng mới vào Sheet Report (mục 4.2). | `src/action_media.cjs` |

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
  - Thư mục KOC (nếu $\ge 2$ HĐ): `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng tổng hợp - Đồng Hồ Hải Triều` (Lưu tại thư mục tháng tương ứng trong `117T7PVrbn48hc97-02JMj3K4ApYeSDPZ`).
  - HĐ Thương mại: `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng Thương mại (Trả cast) - Đồng Hồ Hải Triều`
  - HĐ Tặng SP: `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều` (**Tuyệt đối KHÔNG đưa mã sản phẩm và KHÔNG đánh số (1), (2)**. Nếu $\ge 2$ HĐ thì giãn cách ngày ký $\pm 3$ ngày so với ngày yêu cầu để ngày `YYYY-MM-DD` tự phân biệt).

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
  - **Định dạng**: font serif (Times New Roman), cỡ Lớn, in đậm thông tin quan trọng (`renderEmailHtml` trong `mail_template.cjs`).
  - **Người nhận**: KHÔNG đề xuất To, KHÔNG Cc - người dùng tự điền khi gửi.
  - *Bản nháp xuất hiện ngay lập tức trong mục Drafts của hộp thư Gmail.*

### 3.3. Sinh Phiếu Đề Nghị Thanh Toán (Phiếu ĐNTT)
- Nếu có chi phí Cast > 0đ:
  - Template Doc: `143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg`.
  - Thư mục lưu: `[6] Kết toán tháng` (ID: `12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku`).
  - Tên file chuẩn `YYYY-MM-DD`: `YYYY-MM-DD - Phiếu đề nghị thanh toán (Đợt X - ...) - Team Social - [Tên KOC]`.
  - **Số tiền trên phiếu**: **CHỈ GHI GIÁ TRỊ THỰC NHẬN (NET)**, không ghi giá trị bao gồm thuế.
  - Nếu hợp đồng chia nhiều đợt thanh toán (ví dụ 50% duyệt kịch bản, 50% nghiệm thu), sinh phiếu ĐNTT tương ứng cho từng đợt với số tiền thực nhận của đợt đó.

### 3.4. Cập Nhật Trạng Thái Chốt Deal Trên Sheet Data KOC (thay cho ghi dòng mới vào `CSC - Saga`)
- **Ngừng ghi** vào Spreadsheet cũ (`1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0`) và 3 Tab `CSC - Saga`, `SL materials - Saga v1`, `2 SL post & ĐTT - Saga`. Chuyển sang 2 Sheet chung bên dưới.
- **Nhận diện cột theo TÊN tiêu đề, KHÔNG theo địa chỉ cột/dòng** (team có thể đảo/thêm cột): tự dò dòng tiêu đề, chuẩn hóa tên cột (bỏ xuống dòng, khoảng trắng, hoa/thường); thiếu hoặc trùng cột bắt buộc thì dừng và báo.
- **Sheet Data KOC**: [link](https://docs.google.com/spreadsheets/d/1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw/edit?gid=280295617#gid=280295617) (Tab `Data KOC (11/2026)`, gid `280295617`).
- Khi tôi gửi thông tin hợp đồng KOC tên A: dò tên A ở cột `Tên kênh (Kênh chính booking, không trùng lặp)`.
  - Chỉ cập nhật nếu cột `Người phụ trách` của dòng đó đúng là tôi; không tìm thấy / người phụ trách khác / trùng nhiều dòng thì KHÔNG ghi và báo lại.
  - Không tạo dòng mới. Chỉ điền các cột sau của đúng dòng đó:
    - `Trạng thái`: `Đã chốt`
    - `Số sản phẩm tặng`
    - `Mã sản phẩm`: nhiều sản phẩm cách nhau bởi dấu ; và khoảng trắng trước-sau, ví dụ `54510-GPGRGP-2 ; 53578-LGCRCR-2`
    - `Tổng chi phí sản phẩm`
    - `Tổng cast` (tiền mặt, số Net)

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

### 4.2. Cập nhật Sheet Report Saga
- **Sheet**: [Report](https://docs.google.com/spreadsheets/d/1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I/edit?gid=2134196678#gid=2134196678), ID `1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I`, tab `Report Saga` (gid `2134196678`). Tiêu đề hiện ở dòng 2 (dò động theo tên).
- **Kích hoạt**: người dùng gửi tên KOC + link bài đăng + Link UTM KOC (+ link thành phẩm Materials).

#### 4.2.1. Phân loại cột theo màu tiêu đề
| Màu tiêu đề | Cột | AI làm gì |
|---|---|---|
| **Xám** (khóa tra cứu) | `Liên hệ lần thứ`, `Tên kênh` | **Điền** (đồng bộ từ Sheet Data KOC). Khi 2 ô này có dữ liệu, các cột xanh tự đổ về |
| **Trắng** (nhập tay) | `Ngày AIR`, `Link UTM KOC`, `Materials`, `Format`, `Thời gian SDHA`, `Kênh đăng`, `Link post` | **Điền** |
| **Xanh lá/xanh đậm** (tự đổ công thức) | `Ngày BOOK`, `Người phụ trách`, `Tên KOC / Nghệ danh`, `Tệp / nhóm KOC`, `Thương hiệu hợp tác`, `Dự án đã liên hệ`, `Mã sản phẩm`, `Tổng chi phí sau deal`, `View/CPM/Cảm xúc/Bình luận/Chia sẻ/Lưu trữ`... | **KHÔNG điền**, chỉ đọc lại để kiểm tra |
| **Đỏ/hồng** | `Nhắc nhở` | Không đụng |
> Màu là nhãn nhận biết; AI vẫn xác định theo **tên cột** (mục 1.4). Nếu team đổi màu/đổi cột thì cập nhật lại bảng này.

#### 4.2.2. Quy tắc cấu trúc hàng: 1 Materials → nhiều bài đăng
- **Mỗi hàng = 1 link bài đăng (1 kênh)**.
- **Cột `Materials` lặp lại ở mọi hàng thuộc cùng bộ thành phẩm**; `Liên hệ lần thứ`, `Tên kênh`, `Link UTM KOC` cũng lặp. Không gộp nhiều link vào 1 ô, không để trống Materials ở các hàng sau (để lọc/pivot và chỉ số View/CPM theo từng bài vẫn đúng).
- Ví dụ: KOC A có Materials **B** với link post A, B, C và Materials **G** với link post H, K, M → ghi **6 hàng liên tiếp**:

| Liên hệ lần thứ | Tên kênh | Materials | Link post |
|---|---|---|---|
| 1 | KOC A | B | A |
| 1 | KOC A | B | B |
| 1 | KOC A | B | C |
| 1 | KOC A | G | H |
| 1 | KOC A | G | K |
| 1 | KOC A | G | M |

- Mỗi bộ Materials có thể có `Format` riêng (Video / Hình ảnh) → `Format` ghi theo từng bộ.
- Lưu ý khi làm báo cáo: các cột xanh như `Tổng chi phí sau deal` sẽ lặp ở mọi hàng của cùng KOC, nên khi tính tổng phải lọc theo `Liên hệ lần thứ` + `Tên kênh` (không cộng thẳng cột).

#### 4.2.3. Workflow tối ưu (AI thực hiện)
Người dùng gửi **1 tin nhắn cho mỗi bộ Materials** (hoặc nhiều khối liên tiếp), mẫu gợi ý:
```
KOC <tên kênh> [lần <n>]
Materials: <link Drive>   Format: Video   UTM: <link UTM>
Link post: <link1>, <link2>, <link3>
```
1. **Phân tích**: tách KOC, các khối Materials; mỗi khối có danh sách link post.
2. **Tra khóa**: dò Sheet Data KOC theo `Tên kênh` (và `Người phụ trách` hiện tại) để lấy `Liên hệ lần thứ` + `Tên kênh`.
   - KOC có nhiều lần hợp tác mà người dùng không nói lần nào → **hỏi lại**, không đoán.
3. **Dựng hàng**: mỗi link post 1 hàng; `Kênh đăng` và nhãn hyperlink bóc tách từ link; `Ngày AIR` = ngày người dùng gửi (trừ khi có ghi chú); `Thời gian SDHA` theo hợp đồng.
4. **Chống trùng**: nếu URL đã có trong cột `Link post` (đọc từ công thức HYPERLINK) → bỏ qua và báo; tránh ghi 2 lần khi người dùng gửi lại.
5. **Ghi**: tìm khối **dòng trống liên tiếp đủ N hàng** đầu tiên (cột `Tên kênh` rỗng), không ghi đè dòng có dữ liệu.
   - Ghi 2 ô xám (`Liên hệ lần thứ`, `Tên kênh`) **trước**, rồi các ô trắng. Chỉ cập nhật từng ô thuộc cột cho phép, không ghi cả dòng, không đụng ô xanh.
   - `Kênh đăng` là dropdown: lấy danh sách giá trị hợp lệ từ data validation của ô; giá trị không khớp → dừng và báo.
6. **Kiểm tra sau ghi**: đọc lại các cột xanh của từng hàng. Nếu `Tên KOC / Nghệ danh` vẫn rỗng (tra cứu thất bại: sai tên kênh hoặc sai lần hợp tác) → báo ngay, không tự sửa.
7. **Báo kết quả**: bảng các hàng đã ghi (số dòng, KOC, lần, Materials, kênh, link) + mục đã bỏ qua (trùng) + cảnh báo.

#### 4.2.4. Nguồn giá trị từng cột trắng
| Cột | Nguồn |
|---|---|
| `Ngày AIR` | ngày người dùng gửi link (`DD/MM/YYYY`), trừ khi có ghi chú ngày khác |
| `Link UTM KOC` | người dùng gửi |
| `Materials` | link thành phẩm từ bước 4.1 |
| `Format` | Video / Hình ảnh |
| `Thời gian SDHA` | theo hợp đồng (mặc định `Trọn đời` nếu HĐ nhắc SDHA mà không nêu thời hạn) |
| `Kênh đăng` | bóc tách từ link: Tiktok / Facebook / Instagram / Threads / Youtube |
| `Link post` | `=HYPERLINK("url", "nhãn")` theo bảng dưới |

**Nhãn hyperlink `Link post`**:
| Nền tảng | Điều kiện | Nhãn |
|---|---|---|
| Facebook | chứa `reel`/`reels` | `Facebook Reels` |
| Facebook | khác | `Facebook` |
| TikTok | chứa `/photo/` | `Tiktok Photo` |
| TikTok | khác | `Tiktok` |
| Instagram | chứa `reel`/`reels` | `Instagram Reels` |
| Instagram | chứa `/p/` hoặc `photo` | `Instagram` |
| Instagram | khác | `Instagram Video` |

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
