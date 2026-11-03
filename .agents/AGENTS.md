# NGUYÊN TẮC VẬN HÀNH (CORE RULES) - WORKFLOW BOOKING KOC

Tài liệu này định nghĩa 11 nguyên tắc vận hành cốt lõi, bất biến mà AI Assistant BẮT BUỘC phải tuân thủ nghiêm ngặt trong mọi tình huống xử lý quy trình Booking KOC của Đồng Hồ Hải Triều.

---

### 1. LỆNH KÍCH HOẠT
- **"tiến hành"** (hoặc khi người dùng gửi mẫu thông tin KOC mới): Thực hiện bước **Làm hợp đồng** (bóc tách deal, kiểm tra split HĐ Cast / HĐ Tặng SP, định dạng SOW, bảng chi phí thuế TNCN, tạo thư mục KOC và sinh các tài liệu hợp đồng).
- **"thực thi 1"**: Thực hiện bước **Thực thi 1** (quét trạng thái Google Docs mới nhất, tra cứu email showroom, tạo Thư nháp trong Gmail, sinh Phiếu ĐNTT giá trị Net, ghi dòng MỚI vào Sheet `CSC - Saga`).

---

### 2. QUY ĐỊNH TỰ ĐỘNG HÓA (SAU TESTING 1)
- Đối với workflow hoàn chỉnh sau khi đã được chuẩn hóa ở giai đoạn "Testing 1", các lần chạy sau **TUYỆT ĐỐI KHÔNG CẦN HỎI LẠI** từng câu hỏi nhỏ để tránh mất thời gian.
- AI chủ động thực hiện trọn gói toàn bộ quy trình từ đầu đến cuối.
- **Ngoại lệ duy nhất**: Nếu dữ liệu đầu vào người dùng cung cấp bị thiếu thông tin bắt buộc (ví dụ thiếu số CCCD, địa chỉ, số điện thoại, showroom nhận, ngày nhận hoặc nội dung SOW), AI phải chủ động liệt kê rõ các mục còn thiếu và nhắc người dùng bổ sung ngay.

---

### 3. GHI NHẬN GOOGLE SHEET
- Khi ghi nhận dữ liệu vào Sheet `[0] Tổng hợp report & materials KOL/KOC` (Spreadsheet ID: `1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0`), tại tất cả các Tab (`CSC - Saga`, `SL materials - Saga v1`, `2 SL post & ĐTT - Saga`):
  - **CHỈ GHI MỚI**: Luôn tìm dòng trống đầu tiên sau dòng có dữ liệu cuối cùng để ghi dữ liệu mới.
  - **TUYỆT ĐỐI KHÔNG GHI ĐÈ** lên bất kỳ dòng nào đã có sẵn dữ liệu của các KOC trước đó.

---

### 4. NỘI DUNG SOW TRONG HỢP ĐỒNG
- SOW phải bám sát 100% thỏa thuận thực tế được cung cấp trong deal. Tuyệt đối KHÔNG tự ý giữ lại hoặc thêm bất kỳ hạng mục nào từ file mẫu (như 01 bộ ảnh hoặc video ngoài deal).
- **Cú pháp chuẩn cho câu văn bản tại Điều 1.3 (hoặc 1.2)**:
  `Đăng 01 hạng mục -bộ ảnh/video- -nền tảng chính- (Reup -thể loại Reels/Story- -nền tảng phụ- ) (thời lượng) “rút gọn 1 câu khái quát từ định hướng kịch bản” vào ngày air`
  *Ví dụ:* `Đăng 01 Video Tiktok (Reup Reels, Story Facebook, Instagram) (60-90s) “Tự thưởng cho bản thân một món trang sức để tỏa sáng trong những buổi tiệc cuối năm” vào ngày 29/10/2026`
- **Thời gian hiển thị bài đăng**: Luôn luôn là **"Trọn đời"**.
- **Thời hạn sử dụng hình ảnh (SDHA)**: Theo đúng SOW của deal. Nếu thỏa thuận có nhắc đến việc sử dụng hình ảnh mà không nêu rõ thời hạn cụ thể, mặc định là **"Trọn đời"**.

---

### 5. CHUẨN HÓA CHI TIẾT SẢN PHẨM TẶNG / MƯỢN
Mọi sản phẩm đồng hồ khi đưa vào hợp đồng (Điều 2.1) hoặc email xuất hàng phải được bóc tách và định dạng đủ 6 trường thông tin:
- Thương hiệu: Saga
- Số hiệu sản phẩm: [Mã sản phẩm, ví dụ: 53578-LGSVWH-2]
- Bộ sưu tập: [Tên BST, ví dụ: Saga Stella Chance]
- Xuất xứ: Mỹ
- Máy: Quartz (Pin)
- Bảo Hành Quốc Tế: 2 Năm

---

### 6. CHI PHÍ CAST & BẢNG THUẾ THU NHẬP CÁ NHÂN (TNCN)
- Đối với hợp đồng có phí Cast $\ge$ 5.000.000 VNĐ:
  - **Câu mở đầu Điều 2.1**: Ghi rõ số tiền thực nhận (Net):
    `Bên A trả cho Bên B chi phí để thực hiện dịch vụ bằng hiện kim là: [Net] VNĐ đã khấu trừ thuế TNCN (Bằng chữ: [Bằng chữ số Net]) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)`
  - **Bảng chi phí chuẩn hóa 5 dòng**:
    - Dòng tiêu đề (Header): `STT | Dịch vụ | Hạng mục | Số lượng/ Thời gian | Đơn vị tính | Số tiền`
    - Dòng 1 (Hạng mục): `1 | Booking KOC [Tên] | [SOW] | 01 | Video/Gói | [Số tiền Net]`
    - Dòng 2 (Tổng cộng): `TỔNG CỘNG | [Gross = Net + 10%] (Đã bao gồm thuế)`
    - Dòng 3 (Bên B thực nhận): `Bên B: [Họ và tên đầy đủ KOC] thực nhận | [Số tiền Net]`
    - Dòng 4 (Bên A nộp thuế): `Bên A: Công ty TNHH Hải Triều Việt Nam thực hiện nghĩa vụ đóng thuế thu nhập cá nhân cho bên B | [Tiền thuế 10%]`
    - Cuối bảng: `Đơn vị tính: VNĐ`
- **Phiếu Đề Nghị Thanh Toán (Phiếu ĐNTT)**:
  - **CHỈ GHI GIÁ TRỊ THỰC NHẬN (NET)**, không ghi giá trị bao gồm thuế.
  - Nếu hợp đồng thỏa thuận chia đợt thanh toán (ví dụ Đợt 1: 50% sau duyệt kịch bản, Đợt 2: 50% sau nghiệm thu), hệ thống sẽ tạo các phiếu ĐNTT riêng biệt theo từng đợt với số tiền thực nhận tương ứng của đợt đó.

---

### 7. ĐỒNG BỘ THÔNG TIN BÊN B & NGƯỜI KÝ HỢP ĐỒNG
- Tên người ký đại diện Bên B ở bảng chữ ký cuối hợp đồng phải **đồng bộ 100% với tên Bên B** (không được để sót tên KOC mẫu cũ như PHAN NGỌC VÂN ANH hay NGUYỄN PHƯƠNG DUNG).
- Câu ngày tháng ký kết tại đầu hợp đồng: Cập nhật chuẩn xác theo ngày booking:
  `Hôm nay, ngày [DD] tháng [MM] năm [YYYY], tại TP. Hồ Chí Minh, chúng tôi gồm có:`
- Triệt tiêu việc lặp dòng: Mỗi kênh mạng xã hội (TikTok, Facebook, Instagram, Threads) chỉ hiển thị duy nhất 1 dòng đại diện nếu KOC sở hữu kênh đó.

---

### 8. EMAIL XUẤT SẢN PHẨM & TỰ ĐỘNG TẠO GMAIL DRAFT
- **Tiêu đề email chuẩn**: `Marketing - Xuất sản phẩm tặng KOC <tên KOC>`.
- **Cơ sở dữ liệu cửa hàng**: Tra cứu tự động từ Google Sheet [Danh sách mail cửa hàng và người phụ trách](https://docs.google.com/spreadsheets/d/1G-S4EQ-HQHPMqdKk9V26yRVNQ_ZWn-dXezcZNogh-jY/edit?gid=0#gid=0) theo địa chỉ hoặc tên showroom nhận/chuyển.
- **Quy định Người nhận (Recipients)**:
  - **To**: Email showroom nhận hàng + `kimlien@donghohaitrieu.vn` + `kimngoc@donghohaitrieu.vn` (nếu có hàng xuất XNH).
  - **Cc**: Email showroom chuyển (nếu có), leader/quản lý phụ trách showroom (BA/HM/SD), team hỗ trợ showroom (Amber/Pearl/Sapphire/Zircon...), PIC booking.
- **Nguyên tắc phân bổ sản phẩm theo nguồn xuất**:
  - Từng mục nguồn (Kho XNH, Showroom chuyển) **CHỈ GHI ĐÚNG** sản phẩm của nguồn đó.
  - Riêng mục xuất tại showroom người nhận thì ghi **TẤT CẢ** các sản phẩm KOC nhận.
- **Tự động đẩy vào Thư nháp (Gmail Draft)**: Sau khi soạn xong, hệ thống đẩy thẳng vào mục Thư nháp (Drafts) của tài khoản Gmail để người dùng chỉ cần kiểm tra và bấm gửi.

---

### 9. ĐỊNH DẠNG THỜI GIAN TÊN FILE (ISO YYYY-MM-DD)
Tất cả các file được tạo ra trong hệ thống (Hợp đồng Thương mại, Hợp đồng Tặng sản phẩm, Phiếu đề nghị thanh toán, Biên bản...) đều **BẮT BUỘC đặt tên bắt đầu bằng `YYYY-MM-DD`** (ví dụ: `2026-10-28 - Minh Anh Daily - ...`, `2026-10-28 - Phiếu đề nghị thanh toán...`).

---

### 10. PHÂN BỔ SOW ĐỘC QUYỀN KHI TÁCH HỢP ĐỒNG (CAST & GIFT)
- Khi một deal được tách thành nhiều hợp đồng (01 HĐ Thương mại trả Cast + N HĐ Trao đổi tặng sản phẩm):
  - **Mỗi hợp đồng CHỈ CHỨA DUY NHẤT hạng mục SOW tương ứng** được phân bổ cho nó (cả ở Bảng SOW Điều 1, quy chuẩn Điều 1.1/1.2, và câu đăng tải Điều 1.3).
  - **Tuyệt đối loại bỏ toàn bộ** các hàng hoặc câu SOW thuộc về hợp đồng khác, hoặc còn sót lại từ mẫu template, không để bất kỳ SOW nào bị dư thừa hay trùng lặp chéo giữa các hợp đồng.

---

### 11. NGUYÊN TẮC "THỰC THI 1" - LUÔN ĐỌC TỪ TRẠNG THÁI HỢP ĐỒNG MỚI NHẤT
- Khi nhận lệnh "thực thi 1", hệ thống **KHÔNG sử dụng dữ liệu cũ hay cache bộ nhớ**, mà **BẮT BUỘC truy cập trực tiếp link Google Docs của các hợp đồng ở trạng thái thời gian thực mới nhất (Live State)** để bóc tách:
  - Showroom nhận hàng và ngày nhận hàng dự kiến (Điều 2.2).
  - Danh sách mã sản phẩm và tên sản phẩm (Điều 2.1).
  - Thông tin cá nhân KOC (Họ tên, CCCD, SĐT).
  - Chi phí Cast thực nhận và các đợt thanh toán.
- Đảm bảo mọi chỉnh sửa thủ công của người dùng trực tiếp trên link Google Docs đều được hệ thống nhận diện và phản ánh chính xác 100%.

---

### 12. CẬP NHẬT BÁO CÁO POST AIR (TAB 3: SL POST & ĐTT - SAGA)
- Khi KOC air bài và người dùng gửi link bài đăng kèm tên KOC:
  - **Đối chiếu Tab `CSC - Saga`**: Trích xuất Cột C (`Ngày Book`), Cột B (`Người phụ trách`), Cột D (`Tên KOC`), Cột E (`Link SP UTM`), Cột F (`Giá trị SP`). Đảm bảo thông tin Cột A, C, D trên Tab 3 trùng khớp 100% với `CSC - Saga`.
  - **Ngày Air (Cột B)**: Mặc định là ngày người dùng gửi link (`DD/MM/YYYY`) nếu không có ghi chú ngày cụ thể.
  - **Quy tắc gán nhãn Hyperlink (Cột I & Cột R)**:
    - **Facebook**:
      - Chứa `reel` hoặc `reels`: Nhãn `Facebook Reels`.
      - Các bài viết khác: Nhãn `Facebook`.
    - **TikTok**:
      - Chứa `/photo/`: Nhãn `Tiktok Photo`.
      - Video / khác: Nhãn `Tiktok`.
    - **Instagram**:
      - Chứa `reel` hoặc `reels`: Nhãn `Instagram Reels`.
      - Ảnh / post album (`/p/` hoặc `photo`): Nhãn `Instagram`.
      - Video khác: Nhãn `Instagram Video`.
  - **Phân loại kênh (Cột G)**: `Tiktok` cho Tiktok; `FB / IG` cho Facebook và Instagram; `Threads` cho Threads; `Youtube` cho Youtube.
  - **Gom dòng cùng ngày cho FB & IG**:
    - Nếu có cả link FB và IG cùng ngày air, ghi nhận trên cùng 1 dòng: Link 1 tại Cột I (`Link post 1`), Link 2 tại Cột R (`Link post 2`), Cột G là `FB / IG`.
  - **Ghi dòng MỚI & bảo toàn công thức**:
    - Luôn ghi vào dòng trống đầu tiên (cột D rỗng), tuyệt đối không ghi đè.
    - Kế thừa và bảo toàn công thức tính tự động tại Cột H (`Tổng điểm tương tác`), Cột L (`Giá trị nhận diện đem lại post 1`), Cột U (`Giá trị nhận diện đem lại post 2`).
