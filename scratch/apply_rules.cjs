// Áp dụng quy tắc Sheet mới vào AGENTS.md và booking-rules.md (2 file giống hệt nhau)
const fs = require('fs');
const files = ['d:/Booking/.agents/AGENTS.md', 'd:/Booking/.agents/RULE/booking-rules.md'];

const S3 = `### 3. GHI NHẬN GOOGLE SHEET (CƠ CHẾ MỚI - 2 SHEET DÙNG CHUNG CỦA TEAM)
- **Ngừng ghi** vào Spreadsheet cũ \`[0] Tổng hợp report & materials KOL/KOC\` (ID \`1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0\`) cùng 3 Tab \`CSC - Saga\`, \`SL materials - Saga v1\`, \`2 SL post & ĐTT - Saga\`. Mọi ghi nhận chuyển sang 2 Sheet bên dưới.
- **NHẬN DIỆN CỘT THEO TÊN TIÊU ĐỀ, KHÔNG THEO VỊ TRÍ CỘT/DÒNG**: Team có thể đảo cột, thêm cột bất cứ lúc nào.
  - Tự dò dòng tiêu đề mỗi lần chạy (dòng chứa các tên cột cần dùng), không mặc định là dòng 1.
  - So khớp tên cột đã chuẩn hóa: bỏ xuống dòng/khoảng trắng thừa, không phân biệt hoa/thường, khớp theo phần đầu của tiêu đề (ví dụ \`Tên kênh\`, \`Mã sản phẩm\`).
  - Nếu thiếu hoặc trùng tên cột bắt buộc: DỪNG, báo người dùng, không đoán cột.
  - Không sửa các cột có công thức hoặc ghi chú \`(Auto)\`; không đụng cột ngoài danh sách bên dưới.

#### 3.1. Sheet Data KOC - cập nhật trạng thái chốt deal
- Spreadsheet: \`1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw\`, Tab \`Data KOC (11/2026)\` (gid \`280295617\`). Tab theo tháng: tháng mới ưu tiên Tab \`Data KOC (MM/YYYY)\` mới nhất, nếu không chắc phải hỏi lại.
- **Kích hoạt**: Khi người dùng gửi thông tin hợp đồng của KOC tên A.
- **KHÔNG thêm dòng mới, chỉ CẬP NHẬT dòng đã có**:
  1. Dò tên A ở cột \`Tên kênh (Kênh chính booking, không trùng lặp)\` (so khớp đã chuẩn hóa, bỏ dấu @, hoa/thường).
  2. Chỉ cập nhật khi cột \`Người phụ trách\` của dòng đó đúng là người dùng. Nếu người phụ trách khác, không tìm thấy, hoặc trùng nhiều dòng: KHÔNG ghi, báo lại để người dùng quyết định.
  3. Khi khớp, điền các cột sau:
     - \`Trạng thái\`: \`Đã chốt\`
     - \`Số sản phẩm tặng\`: số lượng sản phẩm tặng
     - \`Mã sản phẩm\`: các mã nối nhau bằng \` ; \` (có khoảng trắng trước và sau dấu chấm phẩy), ví dụ \`54510-GPGRGP-2 ; 53578-LGCRCR-2\`
     - \`Tổng chi phí sản phẩm\`: tổng giá trị các sản phẩm tặng
     - \`Tổng cast\`: chi phí cast **tiền mặt** (số Net thực nhận theo hợp đồng)
- Ghi đè chỉ được phép trên các ô thuộc 5 cột trên của đúng dòng KOC A.

#### 3.2. Sheet Report - báo cáo materials & post air
- Spreadsheet: \`1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I\`, Tab \`Report Saga\` (gid \`2134196678\`).
- **MỖI HÀNG LÀ 1 KÊNH**. Chỉ ghi vào dòng trống đầu tiên (cột \`Tên kênh\` rỗng), tuyệt đối không ghi đè dòng đã có dữ liệu.
- Các cột cần điền: 
  - \`Ngày AIR\`: ngày người dùng gửi link (\`DD/MM/YYYY\`), trừ khi có ghi chú ngày khác.
  - \`Liên hệ lần thứ\` và \`Tên kênh\`: dò tên KOC ở Sheet Data KOC (mục 3.1) rồi đồng bộ y nguyên 2 giá trị này.
  - \`Link UTM KOC\`: người dùng gửi.
  - \`Materials\`: link thành phẩm lấy từ bước Nhận Link Drive (Quy trình Media Materials).
  - \`Format\`: định dạng của bài (ví dụ Video / Hình ảnh).
  - \`Thời gian SDHA\`: theo hợp đồng (mặc định \`Trọn đời\` nếu hợp đồng nhắc SDHA mà không nêu thời hạn).
  - \`Kênh đăng\`: bóc tách từ link người dùng gửi (Tiktok / Facebook / Instagram / Threads / Youtube).
  - \`Link post\`: hyperlink bài đăng theo quy tắc nhãn bên dưới.
- Các cột còn lại (\`View 3D\`, \`CPM\`, \`Cảm xúc 7D\`... và mọi cột công thức) giữ nguyên, không can thiệp. Nếu dòng trống đã có sẵn công thức thì bảo toàn.
- **Nhãn hyperlink \`Link post\`** (công thức \`=HYPERLINK("url", "nhãn")\`):
  - Facebook: chứa \`reel\`/\`reels\` → \`Facebook Reels\`; khác → \`Facebook\`.
  - TikTok: chứa \`/photo/\` → \`Tiktok Photo\`; khác → \`Tiktok\`.
  - Instagram: chứa \`reel\`/\`reels\` → \`Instagram Reels\`; chứa \`/p/\` hoặc \`photo\` → \`Instagram\`; khác → \`Instagram Video\`.
- **Bỏ quy tắc gom FB + IG vào cùng 1 dòng**: mỗi kênh/link 1 hàng riêng; các hàng cùng KOC dùng chung \`Liên hệ lần thứ\`, \`Tên kênh\`, \`Link UTM KOC\`, \`Materials\`.`;

const S12 = `### 12. CẬP NHẬT BÁO CÁO POST AIR (SHEET REPORT - \`Report Saga\`)
- Khi KOC air bài và người dùng gửi link bài đăng kèm tên KOC, thực hiện đúng mục **3.2** (nhận diện cột theo tên, mỗi hàng 1 kênh, ghi vào dòng trống đầu tiên, không ghi đè).
- Không còn đối chiếu Tab \`CSC - Saga\` cũ; thông tin KOC lấy từ Sheet Data KOC (mục 3.1).`;

for (const f of files) {
  let t = fs.readFileSync(f, 'utf8');
  const eol = t.includes('\r\n') ? '\r\n' : '\n';
  const L = t.split(/\r?\n/);
  // locate sections by heading
  const i3 = L.findIndex((l) => l.startsWith('### 3. GHI NH'));
  const i4 = L.findIndex((l) => l.startsWith('### 4. N'));
  const i12 = L.findIndex((l) => l.startsWith('### 12. C'));
  if (i3 < 0 || i4 < 0 || i12 < 0) throw new Error('anchor not found in ' + f);
  // find separator '---' before section 4
  const end3 = i4 - 2; // line index of blank before '---'
  const out = [...L.slice(0, i3), ...S3.split('\n'), ...L.slice(i4 - 2, i12), ...S12.split('\n')];
  let res = out.join(eol);
  res = res.replace(/ghi dòng MỚI vào Sheet `CSC - Saga`\)/, 'cập nhật trạng thái chốt deal trên Sheet Data KOC, xem Mục 3.1)');
  fs.writeFileSync(f, res + eol, 'utf8');
  console.log('updated', f, 'i3', i3, 'i4', i4, 'i12', i12);
}
