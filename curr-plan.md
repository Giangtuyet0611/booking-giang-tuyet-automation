# KẾ HOẠCH CHI TIẾT (V4.0): WORKFLOW AUTOMATION BOOKING KOC SAGA
*(Kiến trúc AI Agent trung tâm: Antigravity + Google Docs/Sheets/Drive APIs + Config tập trung)*

---

## 1. NGUYÊN TẮC VẬN HÀNH TƯƠNG TÁC (THEO RULES.MD)

### 📌 Nguyên Tắc Chung & Phản Hồi:
1. **Lệnh kích hoạt**:
   - Khi nhận được lệnh **"tiến hành"** $\rightarrow$ Bắt đầu xử lý Bước Tạo Hợp Đồng.
   - Khi nhận được lệnh **"thực thi 1"** $\rightarrow$ Bắt đầu xử lý Bước 1 (Draft mail xuất hàng + Phiếu ĐNTT + Ghi Sheet CSC).
2. **Quy định sau Testing 1**:
   - Đối với workflow hoàn chỉnh sau khi đã được bạn cho phép ở "Testing 1" thì **các lần sau không cần hỏi lại** để tránh mất nhiều thời gian.
   - **Nhắc thiếu thông tin**: Nếu thông tin KOC/deal bạn gửi chưa đủ (ví dụ thiếu CCCD, địa chỉ, showroom nhận, ngày air, SOW...), hệ thống sẽ chủ động nhắc ngay các trường còn thiếu để bạn bổ sung kịp thời.
3. **Nguyên tắc ghi Sheet**:
   - Ghi nhận vào Sheet `[0] Tổng hợp report & materials KOL/KOC`: **CHỈ GHI MỚI, TUYỆT ĐỐI KHÔNG GHI ĐÈ** trên các dòng đã có sẵn.

---

## 2. QUY CHUẨN SOẠN THẢO HỢP ĐỒNG (KHI NHẮN "TIẾN HÀNH")

### 1. Phân Tách Hợp Đồng Thông Minh:
- **Tách riêng Cast & Sản phẩm**: Nếu 1 KOC vừa có Cast vừa được tặng sản phẩm $\rightarrow$ Tách tối thiểu thành:
  - 01 Hợp đồng Thương mại (Trả cast).
  - 01 hoặc nhiều Hợp đồng Trao đổi tặng sản phẩm.
- **Giới hạn 20 Triệu / Hợp Đồng Tặng SP**: Nếu tổng giá trị sản phẩm $> 20.000.000$ VNĐ $\rightarrow$ Tự động phân bổ vào các Hợp đồng tặng sản phẩm sao cho **mỗi hợp đồng $\le 20.000.000$ VNĐ**.
- **Quản lý Thư mục**:
  - Dùng lại thư mục Tháng có sẵn (`Tháng MM`), không tạo trùng lặp.
  - KOC có $\ge 2$ HĐ: Tạo 1 thư mục riêng cho KOC bên trong thư mục Tháng:  
    `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng tổng hợp - Đồng Hồ Hải Triều`
  - KOC chỉ có 1 HĐ: Lưu file Doc lẻ trực tiếp trong thư mục Tháng, không tạo thư mục tổng hợp.
  - **Chỉ tạo file Google Doc** và gửi link duyệt, không xuất PDF.

### 2. Quy Chuẩn SOW (Hạng Mục Hợp Tác) - Tuyệt Đối Bám Sát Yêu Cầu:
- **KHÔNG sử dụng mẫu SOW có sẵn làm phát sinh dư hạng mục** (ví dụ SOW chỉ có 01 video TikTok, Reup Reels Story FB thì KHÔNG tự ý giữ lại 01 bộ ảnh hay video thứ hai từ mẫu cũ).
- **Cấu trúc câu chuẩn xác tại Điều 1.3 (Thời gian đăng tải)**:
  $$\text{Đăng 01 hạng mục -bộ ảnh/video- -nền tảng chính- (Reup -thể loại Reels/Story- -nền tảng phụ- ) (thời lượng) “rút gọn 1 câu khái quát từ định hướng kịch bản” vào ngày air}$$
  *Ví dụ chuẩn*:
  - `Đăng 01 Video Tiktok (Reup Reels, Story Instagram) (60-90s) “Trend Loan Niệm” vào ngày 27/10/2026`
  - `Đăng 01 photo post Instagram (Reup Threads, Tiktok - trend Loan Niệm) (6-8 ảnh) concept 20/10 vào ngày 27/10/2026 - 15/10/2026`
  - `Đăng 01 Video Tiktok (Reup Reels, Story Facebook) (60-90s) “Một dấu mốc tự thưởng cho sự kiên trì của bản thân, bé cùng bạn unbox và cảm nhận của bé khi mẹ đeo phụ kiện mới” vào ngày 11/10/2026`
- **Bảng Điều 1 (Nội dung hợp đồng)**: Bảng STT, Hạng mục, Kênh, Số lượng hình ảnh/video, Số link đính kèm, Thời gian đăng tải phải khớp 100% với SOW thực tế. Bỏ các dòng dư thừa.

### 3. Quy Chuẩn Thời Gian Hiển Thị & SDHA:
- **Thời gian hiển thị bài đăng (Điều 1.4)**: **LUÔN LÀ TRỌN ĐỜI** (`Trọn đời`).
- **Thời hạn sử dụng hình ảnh SDHA (Điều 1.7)**:
  - Tùy thuộc vào SOW cụ thể (ví dụ 1 tháng, 3 tháng, 6 tháng, trọn đời...).
  - Nếu trong SOW có nhắc đến SDHA nhưng **không đề cập thời gian cụ thể** $\rightarrow$ Mặc định là **`Trọn đời`**.

### 4. Quy Chuẩn Chi Tiết Sản Phẩm Trong Hợp Đồng:
Khi có tên/mã sản phẩm, thông tin chi tiết trong bảng sản phẩm phải được bóc tách và điền đầy đủ chuẩn hóa:
*Ví dụ*: Sản phẩm `Saga Stella 55757-hggvh-2`
- **Thương hiệu**: Saga
- **Số hiệu sản phẩm**: 55757-hggvh-2
- **Bộ sưu tập**: Saga Stella
- **Xuất xứ**: Mỹ
- **Máy**: Quartz (Pin)
- **Bảo Hành Quốc Tế**: 2 Năm

### 5. Quy Chuẩn Hợp Đồng Có Cast $\ge$ 5.000.000 VNĐ:
- Trong bảng chi phí (Điều 2.1 của HĐ Cast), bắt buộc phải có đầy đủ các dòng:
  1. Phí dịch vụ booking KOC (hoặc Tổng chi phí thỏa thuận).
  2. **Thuế TNCN khấu trừ 10%** (tính theo công thức đã chốt):
     - *Nếu deal là Gross*: Thuế = Deal $\times$ 10%; Thực nhận = Deal $-$ Thuế.
     - *Nếu deal là Net*: Tổng chi phí = Deal / 0.9; Thuế = Tổng chi phí $-$ Deal; Thực nhận = Deal.
  3. **Số tiền thực nhận** mà KOC được chuyển khoản.
- Điều 2.3 (Các đợt thanh toán): Thể hiện rõ các đợt thanh toán tương ứng với giá trị thực nhận.

### 6. Quy Chuẩn Phần Người Ký Cuối Hợp Đồng & Thông Tin Pháp Lý:
- **Tên người ký Bên B ở cuối hợp đồng**: Phải **đồng bộ 100% với Tên Bên B** (ví dụ BÊN B: PHẠM THU PHƯƠNG THẢO VI $\rightarrow$ Dưới bảng chữ ký Bên B phải là PHẠM THU PHƯƠNG THẢO VI, không để sót tên người mẫu cũ như PHAN NGỌC VÂN ANH hay NGUYỄN PHƯƠNG DUNG).
- **Ngày tháng ký**: Đổi chuẩn xác:  
  `Hôm nay, ngày [DD] tháng [MM] năm [YYYY], tại TP. Hồ Chí Minh, chúng tôi gồm có:`
- **Loại bỏ lặp kênh**: Xóa bỏ triệt để việc lặp 2 lần dòng *"Là đại diện của kênh Tiktok"*. Mỗi kênh mạng xã hội (TikTok, Facebook, Instagram, Threads) chỉ hiển thị 1 dòng đại diện nếu KOC có kênh đó.

---

## 3. QUY TRÌNH XỬ LÝ LỆNH "THỰC THI 1" (KHI BẠN NHẮN "THỰC THI 1")

### 1. Bóc Tách Dữ Liệu Từ Hợp Đồng Ở Trạng Thái Mới Nhất:
- **KHÔNG DÙNG CACHE CŨ**: Hệ thống quét trực tiếp link Google Docs của các hợp đồng ở trạng thái mới nhất ngay khi nhận lệnh "thực thi 1" để lấy thông tin KOC, sản phẩm, showroom nhận, ngày nhận dự kiến, và phương thức thanh toán. Mọi chỉnh sửa thủ công của bạn trên Docs đều được hệ thống nhận diện tức thì.

### 2. Soạn Thảo & Tự Động Đẩy Draft Vào Hộp Thư Gmail:
- **Tiêu đề email chuẩn**: `Marketing - Xuất sản phẩm tặng KOC <tên KOC>`
- **Cơ sở tra cứu thông tin showroom**: Tra cứu trực tiếp từ Sheet [Danh sách mail cửa hàng và người phụ trách](https://docs.google.com/spreadsheets/d/1G-S4EQ-HQHPMqdKk9V26yRVNQ_ZWn-dXezcZNogh-jY/edit?gid=0#gid=0) theo địa chỉ hoặc tên showroom nhận/chuyển.
- **Người nhận (Recipients)**:
  - **To**: Email showroom nhận hàng (tra từ Sheet) + `kimlien@donghohaitrieu.vn` (Chị Kim Liên Liềng) + `kimngoc@donghohaitrieu.vn` (Chị Thị Kim Ngọc Trần nếu có hàng xuất XNH).
  - **Cc**: Email showroom chuyển (nếu có), leader/quản lý phụ trách showroom (BA/HM/SD), team hỗ trợ showroom (Amber/Pearl/Sapphire/Zircon...), PIC booking.
- **Nội dung email**: Gom tất cả các nguồn (Kho XNH, Showroom chuyển, Xuất tại showroom nhận) vào **1 email duy nhất**, phân tách rõ ràng bằng `----------------`.
  - Từng mục nguồn chỉ ghi đúng sản phẩm của nguồn đó, riêng showroom nhận ghi tất cả sản phẩm KOC nhận.
- **Tự động đẩy vào Thư nháp (Gmail Draft)**: Sau khi soạn xong, hệ thống đẩy trực tiếp vào mục Thư nháp (Drafts) của Gmail để người dùng chỉ cần mở Gmail xem lại và bấm gửi.

### 3. Sinh Phiếu Đề Nghị Thanh Toán (Nếu có Cast > 0đ):
- Template Doc: `143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg`.
- Thư mục lưu: **`[6] Kết toán tháng`** (ID: `12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku`).
- Tên file: `YYYY-MM-DD - Phiếu đề nghị thanh toán - Team Social - [Tên KOC]`.
- **Giá trị trên phiếu ĐNTT**: **CHỈ GHI GIÁ TRỊ THỰC NHẬN (NET)**, KHÔNG ghi giá trị bao gồm thuế!
- **Tách theo đợt thanh toán**: Nếu hợp đồng có tách thành các lần thanh toán (ví dụ Đợt 1: 50% sau duyệt kịch bản, Đợt 2: 50% sau nghiệm thu), hệ thống sẽ tạo các phiếu ĐNTT theo từng lần với số tiền thực nhận của đợt đó.

### 4. Ghi Dòng Mới Sang Sheet `CSC - Saga` (Tab 1):
- **CHỈ GHI MỚI, KHÔNG GHI ĐÈ**: Tìm dòng trống đầu tiên tiếp theo trên Sheet để ghi mới dòng dữ liệu KOC.

---

## 4. QUY TRÌNH MEDIA MATERIALS (KHI KOC GỬI LINK DRIVE) & POST AIR

### 1. Nhận Link Drive & Đổi Tên Chuẩn:
- Dùng lại thư mục năm `2026` (ID: `1pfe51QxlMM5H0BBXh3wb5eRqQBJWOgXI`), không tạo năm mới.
- Tạo thư mục KOC và 2 folder con `Video`, `Hình ảnh`.
- Đổi tên file chuẩn 100%:
  $$\text{KOC SAGA, TÊN KOC, tên sản phẩm, thể loại - tóm tắt nội dung video}$$

### 2. Ghi nhận vào Sheet `SL materials - Saga v1` (Tab 2, Cột A $\rightarrow$ J):
- **CHỈ GHI MỚI**: Append vào dòng trống tiếp theo.
- Cột C dùng công thức `=XLOOKUP(B..., 'CSC - Saga'!D:D, 'CSC - Saga'!E:E, "")` liên kết tự động.
- Cột F: Hyperlink source Drive vào cụm *"thể loại - tóm tắt nội dung video"*.
- Cột K $\rightarrow$ Q: Loại bỏ hoàn toàn, không can thiệp.

### 3. Cập nhật Báo cáo Post Air (Tab 3: `SL post & ĐTT - Saga`):
- **Cơ chế kích hoạt**: Khi KOC air bài đăng và người dùng gửi link bài đăng kèm tên KOC (ví dụ: *"KOC Bs GenZ đã air bài: <link tiktok>, <link fb reel>"*).
- **Đối chiếu dữ liệu với Sheet `CSC - Saga`**:
  - Dựa vào tên KOC người dùng cung cấp, tìm kiếm dòng tương ứng trong Tab `CSC - Saga`.
  - Cập nhật chính xác 100%:
    - **Cột A (Ngày book)**: Lấy từ Cột C (`Ngày Book`) của `CSC - Saga`.
    - **Cột B (Ngày Air post)**: Mặc định là ngày người dùng gửi link (`DD/MM/YYYY`) nếu không có ghi chú ngày cụ thể khác.
    - **Cột C (Người phụ trách)**: Lấy từ Cột B (`Người phụ trách`) của `CSC - Saga` (hoặc ghi nhận theo người phụ trách thực tế).
    - **Cột D (Tên KOC)**: Trùng khớp 100% với Cột D (`Tên KOC`) của `CSC - Saga` (không cần gắn link).
    - **Cột E (Link SP UTM)** & **Cột F (Giá trị SP)**: Lấy tương ứng từ Cột E và F của `CSC - Saga`.
- **Quy tắc phân loại Kênh & Nhãn Hyperlink (Cột G, Cột I, Cột R)**:
  - **Facebook (FB / IG)**:
    - Link có chứa chữ `reel` hoặc `reels` $\rightarrow$ Nhãn: `Facebook Reels`.
    - Link bài viết/ảnh/video khác $\rightarrow$ Nhãn: `Facebook`.
  - **TikTok (Tiktok)**:
    - Link có chứa `/photo/` $\rightarrow$ Nhãn: `Tiktok Photo`.
    - Link video thông thường $\rightarrow$ Nhãn: `Tiktok` (khớp chuẩn hiển thị trên Sheet).
  - **Instagram (FB / IG)**:
    - Link có chứa `reel` hoặc `reels` $\rightarrow$ Nhãn: `Instagram Reels`.
    - Link ảnh thông thường (`/p/` hoặc `photo`) $\rightarrow$ Nhãn: `Instagram`.
    - Link video khác $\rightarrow$ Nhãn: `Instagram Video`.
  - **Gom dòng cùng ngày cho FB & IG**:
    - Nếu bài đăng air cùng ngày có cả link FB và IG $\rightarrow$ Ghi nhận chung trên 1 dòng:
      - Cột G: `FB / IG`.
      - Cột I (`Link post 1`): Nhãn + Link 1 gắn công thức `=HYPERLINK("...", "...")`.
      - Cột R (`Link post 2`): Nhãn + Link 2 gắn công thức `=HYPERLINK("...", "...")`.
  - **Bảo toàn công thức tính tự động**:
    - Luôn ghi vào dòng trống đầu tiên (cột D rỗng).
    - Bảo toàn và tự động kế thừa công thức tính toán tại Cột H (`Tổng điểm tương tác`), Cột L (`Giá trị nhận diện đem lại post 1`), Cột U (`Giá trị nhận diện đem lại post 2`).

---

## 5. THÔNG TIN CẤU HÌNH HỆ THỐNG (`config.json`)

- **Spreadsheet Tổng Report & Materials**: `1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0`
  - Tab 1: `CSC - Saga`
  - Tab 2: `SL materials - Saga v1`
  - Tab 3: `2 SL post & ĐTT - Saga`
- **Thư mục Hợp Đồng Gốc ([0] File mềm)**: `117T7PVrbn48hc97-02JMj3K4ApYeSDPZ`
- **Mẫu HĐ Trao Đổi Tặng SP**: `1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8`
- **Mẫu HĐ Thương Mại (Trả Cast)**: `19l_CHO87DnaqywnA9Tv6lhbGO87xNG6V`
- **Template Phiếu ĐNTT**: `143CRzJxFh6b15IMZ0S4Zm9zCINJpwJ-b3Fo8mn_xDbg`
- **Folder Lưu Phiếu ĐNTT**: `[6] Kết toán tháng` (ID: `12DVbLp0eUvDQXgPcy_PwGpi68a_D9cku`)
- **Thư Mục Media Root**: `[0] Tổng hợp hình ảnh và video KOC Saga` (ID: `1haQ5DK8FYMHJ-7bDzmR5SldEIHyePVDl`)
- **Sheet Check Tồn Kho**: `1jqSBCvOJNjrMKjlJuxKDVJQ1xY0KcNfZgo_zFKWIJuc`

---

## 6. KẾT QUẢ KIỂM THỬ TESTING 1 (HOÀN TẤT & ĐÃ CHUẨN HÓA 100%)

- **Thư mục KOC**: `2026-10-28 - Minh Anh Daily - [Booking KOC/KOL] Hợp đồng tổng hợp - Đồng Hồ Hải Triều`
- **Tất cả các tệp đều bắt đầu bằng ngày `YYYY-MM-DD` chuẩn xác**:
  1. **HĐ Thương mại (Trả cast 7M Net - Gross 7.777.778)**: [Xem tài liệu](https://docs.google.com/document/d/1d2AT5R1hlTsb9vWKYeL5Jh2Rcs3zrJTJ0-g6vTsKbTA/edit)
     - SOW độc quyền: `01 Video Tiktok (60-90s) (Reup Reels, Story FB, IG)` air 29/10/2026.
     - Đã bóc tách thuế TNCN 10%, bảng chi phí, 2 đợt thanh toán (3.5M/đợt).
  2. **HĐ Trao đổi tặng sản phẩm 1 (Saga Stella Chance 12.59M)**: [Xem tài liệu](https://docs.google.com/document/d/1SNQe5TyaqeFIDj9hyG1dZG6RVRcZSTiU3MH2KlxrGfc/edit)
     - SOW độc quyền: `01 photo post Tiktok (Reup Facebook, Instagram) (6-8 ảnh)` air 29/10/2026.
     - Bảng SOW và Điều 1.3 chỉ có DUY NHẤT 1 hạng mục Photo Post, đã xóa sạch toàn bộ các hạng mục video thừa của template.
  3. **HĐ Trao đổi tặng sản phẩm 2 (Saga Stella Rectangle 8.9M)**: [Xem tài liệu](https://docs.google.com/document/d/1kNEdCXmUrgJPI0APC5W02WPLvS2Mhi3BHZXv9Jx-s5o/edit)
     - SOW độc quyền: `01 Video Tiktok (30-45s) (Reup Reels FB, IG) quay lifestyle` air 30/10/2026.
     - Bảng SOW và Điều 1.3 chỉ có DUY NHẤT 1 hạng mục Video Lifestyle, đã xóa sạch toàn bộ các hạng mục thừa của template.
  4. **Phiếu ĐNTT Đợt 1 (3.500.000 VNĐ Net)**: [Xem tài liệu](https://docs.google.com/document/d/1o6ZJJLnUhTtn8r5_Cuc33wMaK9kNZb0gm6hZ0ueZCwA/edit)
     - Tên file: `2026-10-28 - Phiếu đề nghị thanh toán (Đợt 1 - 50% sau duyệt kịch bản) - Team Social - NGUYỄN LÊ MINH ANH`
  5. **Phiếu ĐNTT Đợt 2 (3.500.000 VNĐ Net)**: [Xem tài liệu](https://docs.google.com/document/d/13AoOvvIDFyg0ftFLtJ14gYL2KaU4I-XIFl9NdEefXi0/edit)
     - Tên file: `2026-10-28 - Phiếu đề nghị thanh toán (Đợt 2 - 50% sau nghiệm thu) - Team Social - NGUYỄN LÊ MINH ANH`