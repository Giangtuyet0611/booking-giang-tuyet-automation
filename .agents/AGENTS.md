# NGUYÊN TẮC VẬN HÀNH (CORE RULES) - WORKFLOW BOOKING KOC

Tài liệu này định nghĩa 11 nguyên tắc vận hành cốt lõi, bất biến mà AI Assistant BẮT BUỘC phải tuân thủ nghiêm ngặt trong mọi tình huống xử lý quy trình Booking KOC của Đồng Hồ Hải Triều.

---

### 1. LỆNH KÍCH HOẠT
- **"tiến hành"** (hoặc khi người dùng gửi mẫu thông tin KOC mới): Thực hiện bước **Làm hợp đồng** (bóc tách deal, kiểm tra split HĐ Cast / HĐ Tặng SP, định dạng SOW, bảng chi phí thuế TNCN, tạo thư mục KOC và sinh các tài liệu hợp đồng).
- **"thực thi 1"**: Thực hiện bước **Thực thi 1** (quét trạng thái Google Docs mới nhất, tra cứu email showroom, tạo Thư nháp trong Gmail, sinh Phiếu ĐNTT giá trị Net, cập nhật trạng thái chốt deal trên Sheet Data KOC, xem Mục 3.1).

---

### 2. QUY ĐỊNH TỰ ĐỘNG HÓA (SAU TESTING 1)
- Đối với workflow hoàn chỉnh sau khi đã được chuẩn hóa ở giai đoạn "Testing 1", các lần chạy sau **TUYỆT ĐỐI KHÔNG CẦN HỎI LẠI** từng câu hỏi nhỏ để tránh mất thời gian.
- AI chủ động thực hiện trọn gói toàn bộ quy trình từ đầu đến cuối.
- **Ngoại lệ duy nhất**: Nếu dữ liệu đầu vào người dùng cung cấp bị thiếu thông tin bắt buộc (ví dụ thiếu số CCCD, địa chỉ, số điện thoại, showroom nhận, ngày nhận hoặc nội dung SOW), AI phải chủ động liệt kê rõ các mục còn thiếu và nhắc người dùng bổ sung ngay.

---

### 3. GHI NHẬN GOOGLE SHEET (CƠ CHẾ MỚI - 2 SHEET DÙNG CHUNG CỦA TEAM)
- **Ngừng ghi** vào Spreadsheet cũ `[0] Tổng hợp report & materials KOL/KOC` (ID `1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0`) cùng 3 Tab `CSC - Saga`, `SL materials - Saga v1`, `2 SL post & ĐTT - Saga`. Mọi ghi nhận chuyển sang 2 Sheet bên dưới.
- **NHẬN DIỆN CỘT THEO TÊN TIÊU ĐỀ, KHÔNG THEO VỊ TRÍ CỘT/DÒNG**: Team có thể đảo cột, thêm cột bất cứ lúc nào.
  - Tự dò dòng tiêu đề mỗi lần chạy (dòng chứa các tên cột cần dùng), không mặc định là dòng 1.
  - So khớp tên cột đã chuẩn hóa: bỏ xuống dòng/khoảng trắng thừa, không phân biệt hoa/thường, khớp theo phần đầu của tiêu đề (ví dụ `Tên kênh`, `Mã sản phẩm`).
  - Nếu thiếu hoặc trùng tên cột bắt buộc: DỪNG, báo người dùng, không đoán cột.
  - Không sửa các cột có công thức hoặc ghi chú `(Auto)`; không đụng cột ngoài danh sách bên dưới.

#### 3.1. Sheet Data KOC - cập nhật trạng thái chốt deal

- Spreadsheet: `1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw`, Tab: DUY NHẤT Tab `Data KOC (11/2026)` (gid `280295617`).
- **QUY TẮC BẤT BIẾN**: TUYỆT ĐỐI CHỈ ĐIỀN VÀO TAB NÀY, KHÔNG TỰ TẠO THÊM TAB THÁNG MỚI.
- **Kích hoạt**: Khi người dùng gửi thông tin hợp đồng của KOC tên A.
- **KHÔNG thêm dòng mới, chỉ CẬP NHẬT dòng đã có**:
  1. Dò tên A ở cột `Tên kênh (Kênh chính booking, không trùng lặp)` (so khớp đã chuẩn hóa, bỏ dấu @, hoa/thường).
  2. Chỉ cập nhật khi cột `Người phụ trách` của dòng đó đúng là **người phụ trách hiện tại** (mặc định `Giáng Tuyết`; nếu người khác sử dụng và nhắn "tôi là [Tên]" thì áp dụng tên đó từ lúc đó đến khi họ báo đổi; nếu chưa rõ ai đang dùng thì phải hỏi trước khi ghi). Nếu người phụ trách khác, không tìm thấy, hoặc trùng nhiều dòng: KHÔNG ghi, báo lại để người dùng quyết định.
  3. Khi khớp, điền các cột sau:
     - `Trạng thái`: `Đã chốt`
     - `Số sản phẩm tặng`: số lượng sản phẩm tặng
     - `Mã sản phẩm`: các mã nối nhau bằng ` ; ` (có khoảng trắng trước và sau dấu chấm phẩy), ví dụ `54510-GPGRGP-2 ; 53578-LGCRCR-2`
     - `Tổng chi phí sản phẩm`: tổng giá trị các sản phẩm tặng
     - `Tổng cast`: chi phí cast **tiền mặt** (số Net thực nhận theo hợp đồng)
- Ghi đè chỉ được phép trên các ô thuộc 5 cột trên của đúng dòng KOC A.

#### 3.2. Sheet Report - báo cáo materials & post air
- Spreadsheet: `1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I`, Tab `Report Saga` (gid `2134196678`).
- **MỖI HÀNG LÀ 1 KÊNH**. Chỉ ghi vào dòng trống đầu tiên (cột `Tên kênh` rỗng), tuyệt đối không ghi đè dòng đã có dữ liệu.
- Các cột cần điền: 
  - `Ngày AIR`: ngày người dùng gửi link (`DD/MM/YYYY`), trừ khi có ghi chú ngày khác.
  - `Liên hệ lần thứ` và `Tên kênh`: dò tên KOC ở Sheet Data KOC (mục 3.1) rồi đồng bộ y nguyên 2 giá trị này.
  - `Liên hệ lần thứ` và `Tên kênh`: dò tên KOC ở Sheet Data KOC (mục 3.1) rồi đồng bộ y nguyên 2 giá trị này (ở Sheet Data KOC, `Liên hệ lần thứ` là số đếm tự động: chỉ đọc, không ghi; ở Sheet Report thì ghi trùng khớp).
  - `Link UTM KOC`: người dùng gửi.
  - `Materials`: link thành phẩm lấy từ bước Nhận Link Drive (Quy trình Media Materials).
  - `Format`: định dạng của bài (ví dụ Video / Hình ảnh).
  - `Thời gian SDHA`: theo hợp đồng (mặc định `Trọn đời` nếu hợp đồng nhắc SDHA mà không nêu thời hạn).
  - `Kênh đăng`: bóc tách từ link người dùng gửi (Tiktok / Facebook / Instagram / Threads / Youtube).
  - `Link post`: hyperlink bài đăng theo quy tắc nhãn bên dưới.
- Các cột đã có công thức tự động (`Ngày BOOK`, `Người phụ trách`, `Tên KOC / Nghệ danh`, `Tệp / nhóm KOC`, `Mã sản phẩm`, `Tổng chi phí sau deal`...) KHÔNG điền.
- Các cột còn lại (`View 3D`, `CPM`, `Cảm xúc 7D`... và mọi cột công thức) giữ nguyên, không can thiệp. Nếu dòng trống đã có sẵn công thức thì bảo toàn.
- **Nhãn hyperlink `Link post`** (công thức `=HYPERLINK("url", "nhãn")`):
  - Facebook: chứa `reel`/`reels` → `Facebook Reels`; khác → `Facebook`.
  - TikTok: chứa `/photo/` → `Tiktok Photo`; khác → `Tiktok`.
  - Instagram: chứa `reel`/`reels` → `Instagram Reels`; chứa `/p/` hoặc `photo` → `Instagram`; khác → `Instagram Video`.
- **Bỏ quy tắc gom FB + IG vào cùng 1 dòng**: mỗi kênh/link 1 hàng riêng; các hàng cùng KOC dùng chung `Liên hệ lần thứ`, `Tên kênh`, `Link UTM KOC`, `Materials`.
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
- **Người nhận (Recipients)**: **KHÔNG điền người nhận** (để trống cả To và Cc). Người dùng sẽ tự điền To và Cc khi kiểm tra và gửi mail.
- **Nguyên tắc phân bổ sản phẩm theo nguồn xuất**:
  - Từng mục nguồn (Kho XNH, Showroom chuyển) **CHỈ GHI ĐÚNG** sản phẩm của nguồn đó.
  - Riêng mục xuất tại showroom người nhận thì ghi **TẤT CẢ** các sản phẩm KOC nhận.
- **Tự động đẩy vào Thư nháp (Gmail Draft)**: Sau khi soạn xong, hệ thống đẩy thẳng vào mục Thư nháp (Drafts) của tài khoản Gmail để người dùng chỉ cần kiểm tra và bấm gửi.

---

### 9. ĐỊNH DẠNG TÊN FILE & THƯ MỤC (ISO YYYY-MM-DD)
- Tất cả các file và thư mục được tạo ra trong hệ thống đều **BẮT BUỘC đặt tên bắt đầu bằng `YYYY-MM-DD`**:
  - Thư mục KOC (khi $\ge$ 2 HĐ): `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng tổng hợp - Đồng Hồ Hải Triều` (sử dụng ngày booking theo yêu cầu; tất cả các hợp đồng của KOC đều nằm trong thư mục tổng này).
  - HĐ Thương mại: `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng Thương mại (Trả cast) - Đồng Hồ Hải Triều`
  - HĐ Tặng SP: `YYYY-MM-DD - [Tên KOC] - [Booking KOC/KOL] Hợp đồng Trao đổi tặng sản phẩm - Đồng Hồ Hải Triều`
    - **TUYỆT ĐỐI KHÔNG đưa mã sản phẩm vào tiêu đề hợp đồng**.
    - **KHÔNG đánh số thứ tự (1), (2)...**: Nếu 1 bạn có nhiều hợp đồng, các hợp đồng sẽ được giãn cách ra các ngày ký khác nhau ($\pm 3$ ngày so với ngày yêu cầu tạo hợp đồng), do đó ngày tháng `YYYY-MM-DD` ở đầu tên file tự động phân biệt các hợp đồng mà không cần đánh số.
  - Phiếu ĐNTT: `YYYY-MM-DD - Phiếu đề nghị thanh toán cast KOC [Tên KOC]` (hoặc đợt 1 / đợt 2 nếu chia đợt).

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

### 12. CẬP NHẬT BÁO CÁO POST AIR (SHEET REPORT - `Report Saga`)
- Khi KOC air bài và người dùng gửi link bài đăng kèm tên KOC, thực hiện đúng mục **3.2** (nhận diện cột theo tên, mỗi hàng 1 kênh, ghi vào dòng trống đầu tiên, không ghi đè).
- Không còn đối chiếu Tab `CSC - Saga` cũ; thông tin KOC lấy từ Sheet Data KOC (mục 3.1).
