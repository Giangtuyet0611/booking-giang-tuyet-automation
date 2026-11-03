# NGUYÊN TẮC VẬN HÀNH (RULES)

1. **Lệnh kích hoạt**:
   - Khi tôi nhắn "tiến hành": Thực hiện bước làm hợp đồng.
   - Khi tôi nhắn "thực thi 1": Thực hiện bước 1 (Draft email gom chung + Phiếu ĐNTT + Ghi dòng mới Sheet CSC).

2. **Quy định tự động hóa sau Testing 1**:
   - Đối với workflow hoàn chỉnh sau khi được tôi cho phép ở "Testing 1" thì các lần sau KHÔNG CẦN HỎI LẠI để tránh mất nhiều thời gian.
   - Nếu thông tin tôi gửi chưa đủ (ví dụ thiếu CCCD, địa chỉ, số điện thoại, showroom, SOW...), hãy chủ động nhắc tôi ngay.

3. **Ghi Sheet**:
   - Ghi nhận vào Sheet `[0] Tổng hợp report & materials KOL/KOC`: CHỈ GHI MỚI, KHÔNG GHI ĐÈ trên dữ liệu có sẵn.

4. **Nội dung SOW trong Hợp đồng**:
   - SOW phải bám sát 100% yêu cầu được cung cấp, tuyệt đối KHÔNG tự ý giữ lại hoặc thêm các hạng mục từ file mẫu (như 01 bộ ảnh hoặc video ngoài deal).
   - Định dạng Điều 1.3:
     `Đăng 01 hạng mục -bộ ảnh/video- -nền tảng chính- (Reup -thể loại Reels/Story- -nền tảng phụ- ) (thời lượng) “rút gọn 1 câu khái quát từ định hướng kịch bản” vào ngày air`
   - Thời gian hiển thị bài đăng: Luôn là "Trọn đời".
   - Thời gian sử dụng hình ảnh (SDHA): Theo SOW, nếu có nhắc SDHA mà không có thời hạn cụ thể thì mặc định là "Trọn đời".

5. **Chi tiết sản phẩm**:
   - Bóc tách chuẩn hóa:
     - Thương hiệu: Saga
     - Số hiệu sản phẩm: [Mã sản phẩm]
     - Bộ sưu tập: [Tên BST]
     - Xuất xứ: Mỹ
     - Máy: Quartz (Pin)
     - Bảo Hành Quốc Tế: 2 Năm

6. **Cast & Thuế TNCN**:
   - Đối với hợp đồng có Cast >= 5M:
     - Câu văn bản Điều 2.1: `Bên A trả cho Bên B chi phí để thực hiện dịch vụ bằng hiện kim là: [Net] VNĐ đã khấu trừ thuế TNCN (Bằng chữ: [Bằng chữ số Net]) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)`
     - Bảng chi phí gồm các dòng:
       - Dòng hạng mục: `1 | Booking KOC [Tên] | [SOW] | 01 | Video/Gói | [Số tiền Net]`
       - Dòng TỔNG CỘNG: `TỔNG CỘNG | [Gross = Net + 10%] (Đã bao gồm thuế)`
       - Dòng Bên B thực nhận: `Bên B: [Họ và tên KOC] thực nhận | [Số tiền Net]`
       - Dòng Bên A nộp thuế: `Bên A: Công ty TNHH Hải Triều Việt Nam thực hiện nghĩa vụ đóng thuế thu nhập cá nhân cho bên B | [Tiền thuế 10%]`
   - Phiếu Đề Nghị Thanh Toán: Chỉ ghi giá trị THỰC NHẬN (Net), không ghi giá trị bao gồm thuế. Nếu hợp đồng tách thành các lần thì có các lần đề nghị thanh toán tương ứng.

7. **Người ký & Thông tin Hợp đồng**:
   - Người ký Bên B ở bảng cuối trang phải đồng bộ 100% với tên Bên B.
   - Ngày tháng ký tại TP. HCM: Cập nhật đúng ngày tháng năm booking.
   - Không lặp dòng "Là đại diện của kênh Tiktok".

8. **Email xuất sản phẩm & Đẩy Gmail Draft**:
   - Tiêu đề mail chuẩn: `Marketing - Xuất sản phẩm tặng KOC <tên KOC>`.
   - Danh sách mail cửa hàng: Tra cứu tự động từ Sheet `1G-S4EQ-HQHPMqdKk9V26yRVNQ_ZWn-dXezcZNogh-jY` theo địa chỉ/tên showroom.
   - Người nhận / CC:
     - To: Email showroom nhận hàng, `kimlien@donghohaitrieu.vn`, `kimngoc@donghohaitrieu.vn` (nếu có hàng xuất XNH).
     - Cc: Email showroom chuyển (nếu có), leader/quản lý showroom, team hỗ trợ showroom, PIC booking.
   - Xuất từ nhiều nguồn: Từng mục nguồn (Kho XNH, Showroom chuyển) chỉ ghi đúng sản phẩm của nguồn đó, trừ mục xuất tại showroom người nhận thì ghi tất cả sản phẩm KOC nhận.
   - Tự động tạo thư nháp (Draft) trong Gmail sau khi soạn thảo xong.

9. **Định dạng thời gian tên file**:
   - Tất cả các file được tạo (Hợp đồng, Phiếu đề nghị thanh toán, Biên bản...) đều phải đặt tên bắt đầu bằng `YYYY-MM-DD` (ISO format, ví dụ: `2026-10-28 - ...`).

10. **Phân bổ SOW khi tách hợp đồng (Cast & Gift)**:
    - Khi deal được tách thành nhiều hợp đồng (1 HĐ Cast + N HĐ Tặng SP): Mỗi hợp đồng CHỈ CHỨA DUY NHẤT hạng mục SOW tương ứng với hợp đồng đó (cả ở Bảng SOW Điều 1, quy chuẩn Điều 1.1/1.2, và câu đăng tải Điều 1.3).
    - Tuyệt đối loại bỏ toàn bộ các hàng/câu SOW của hợp đồng khác hoặc còn sót lại từ mẫu template, không để bất kỳ SOW nào bị dư thừa.

11. **Nguyên tắc "Thực thi 1" - Luôn đọc từ trạng thái hợp đồng mới nhất**:
    - Khi nhận lệnh "thực thi 1", hệ thống KHÔNG sử dụng cache hay bộ nhớ cũ, mà BẮT BUỘC đọc trực tiếp từ link Google Docs của các hợp đồng ở trạng thái mới nhất để bóc tách: Showroom nhận hàng, ngày nhận hàng, thông tin sản phẩm, chi phí cast... đảm bảo mọi chỉnh sửa thủ công của người dùng trên hợp đồng đều được phản ánh chính xác 100%.

12. **Cập nhật Báo cáo Post Air (Tab 3: `SL post & ĐTT - Saga`)**:
    - Khi KOC air bài và người dùng gửi link bài đăng kèm tên KOC:
      - **Đối chiếu Tab `CSC - Saga`**: Lấy `Ngày Book` (Cột C), `Người phụ trách` (Cột B), `Tên KOC` (Cột D), `Link SP UTM` (Cột E), `Giá trị SP` (Cột F) để cập nhật chính xác trùng khớp 100% vào các Cột A, C, D của Tab 3.
      - **Ngày Air (Cột B)**: Mặc định là ngày người dùng gửi link (`DD/MM/YYYY`) nếu không có ghi chú ngày cụ thể khác.
      - **Quy tắc gán nhãn Hyperlink (Cột I & Cột R)**:
        - Facebook: Chứa `reel`/`reels` $\rightarrow$ Nhãn `Facebook Reels`; bài viết khác $\rightarrow$ Nhãn `Facebook`.
        - TikTok: Chứa `/photo/` $\rightarrow$ Nhãn `Tiktok Photo`; khác $\rightarrow$ Nhãn `Tiktok`.
        - Instagram: Chứa `reel`/`reels` $\rightarrow$ Nhãn `Instagram Reels`; chứa `/p/` hoặc `photo` $\rightarrow$ Nhãn `Instagram`; khác $\rightarrow$ Nhãn `Instagram Video`.
      - **Phân loại kênh Cột G**: `Tiktok` cho Tiktok; `FB / IG` cho Facebook và Instagram; `Threads` cho Threads; `Youtube` cho Youtube.
      - **Gom dòng cùng ngày cho FB & IG**: Nếu cùng 1 ngày air có cả link FB và IG $\rightarrow$ Ghi nhận chung 1 dòng: Link 1 ở Cột I (`Link post 1`), Link 2 ở Cột R (`Link post 2`), Cột G là `FB / IG`.
      - **Chỉ ghi MỚI & bảo toàn công thức**: Luôn ghi vào dòng trống đầu tiên (cột D rỗng), không ghi đè, tự động kế thừa công thức tính toán tại Cột H, Cột L, Cột U.