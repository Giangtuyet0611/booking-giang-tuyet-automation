const fs = require('fs');
function rw(f, fn) {
  const t = fs.readFileSync(f, 'utf8');
  const eol = t.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(f, fn(t.split(/\r?\n/)).join(eol), 'utf8');
}
const idx = (L, p, from = 0) => { const i = L.findIndex((l, k) => k >= from && l.startsWith(p)); if (i < 0) throw new Error('missing ' + p); return i; };

const MAIL_FMT = [
  '- **Định dạng**: font **serif** (Times New Roman), cỡ chữ **Lớn** (Large), **in đậm** các thông tin quan trọng (lời chào, tên KOC, sản phẩm xuất, showroom, ngày cần nhận/ngày lấy, SĐT, CCCD, "Lưu ý", thao tác xuất giá 0 đồng).',
  '- **Người nhận**: **KHÔNG đề xuất người nhận** (để trống To) và **KHÔNG Cc**. Người dùng tự điền khi kiểm tra và gửi. (Việc tra cứu email showroom vẫn dùng để biết nơi nhận, không đưa vào tag To/Cc.)',
];

const REPORT_SECTION = `### 4.2. Cập nhật Sheet Report Saga
- **Sheet**: [Report](https://docs.google.com/spreadsheets/d/1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I/edit?gid=2134196678#gid=2134196678), ID \`1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I\`, tab \`Report Saga\` (gid \`2134196678\`). Tiêu đề hiện ở dòng 2 (dò động theo tên).
- **Kích hoạt**: người dùng gửi tên KOC + link bài đăng + Link UTM KOC (+ link thành phẩm Materials).

#### 4.2.1. Phân loại cột theo màu tiêu đề
| Màu tiêu đề | Cột | AI làm gì |
|---|---|---|
| **Xám** (khóa tra cứu) | \`Liên hệ lần thứ\`, \`Tên kênh\` | **Điền** (đồng bộ từ Sheet Data KOC). Khi 2 ô này có dữ liệu, các cột xanh tự đổ về |
| **Trắng** (nhập tay) | \`Ngày AIR\`, \`Link UTM KOC\`, \`Materials\`, \`Format\`, \`Thời gian SDHA\`, \`Kênh đăng\`, \`Link post\` | **Điền** |
| **Xanh lá/xanh đậm** (tự đổ công thức) | \`Ngày BOOK\`, \`Người phụ trách\`, \`Tên KOC / Nghệ danh\`, \`Tệp / nhóm KOC\`, \`Thương hiệu hợp tác\`, \`Dự án đã liên hệ\`, \`Mã sản phẩm\`, \`Tổng chi phí sau deal\`, \`View/CPM/Cảm xúc/Bình luận/Chia sẻ/Lưu trữ\`... | **KHÔNG điền**, chỉ đọc lại để kiểm tra |
| **Đỏ/hồng** | \`Nhắc nhở\` | Không đụng |
> Màu là nhãn nhận biết; AI vẫn xác định theo **tên cột** (mục 1.4). Nếu team đổi màu/đổi cột thì cập nhật lại bảng này.

#### 4.2.2. Quy tắc cấu trúc hàng: 1 Materials → nhiều bài đăng
- **Mỗi hàng = 1 link bài đăng (1 kênh)**.
- **Cột \`Materials\` lặp lại ở mọi hàng thuộc cùng bộ thành phẩm**; \`Liên hệ lần thứ\`, \`Tên kênh\`, \`Link UTM KOC\` cũng lặp. Không gộp nhiều link vào 1 ô, không để trống Materials ở các hàng sau (để lọc/pivot và chỉ số View/CPM theo từng bài vẫn đúng).
- Ví dụ: KOC A có Materials **B** với link post A, B, C và Materials **G** với link post H, K, M → ghi **6 hàng liên tiếp**:

| Liên hệ lần thứ | Tên kênh | Materials | Link post |
|---|---|---|---|
| 1 | KOC A | B | A |
| 1 | KOC A | B | B |
| 1 | KOC A | B | C |
| 1 | KOC A | G | H |
| 1 | KOC A | G | K |
| 1 | KOC A | G | M |

- Mỗi bộ Materials có thể có \`Format\` riêng (Video / Hình ảnh) → \`Format\` ghi theo từng bộ.
- Lưu ý khi làm báo cáo: các cột xanh như \`Tổng chi phí sau deal\` sẽ lặp ở mọi hàng của cùng KOC, nên khi tính tổng phải lọc theo \`Liên hệ lần thứ\` + \`Tên kênh\` (không cộng thẳng cột).

#### 4.2.3. Workflow tối ưu (AI thực hiện)
Người dùng gửi **1 tin nhắn cho mỗi bộ Materials** (hoặc nhiều khối liên tiếp), mẫu gợi ý:
\`\`\`
KOC <tên kênh> [lần <n>]
Materials: <link Drive>   Format: Video   UTM: <link UTM>
Link post: <link1>, <link2>, <link3>
\`\`\`
1. **Phân tích**: tách KOC, các khối Materials; mỗi khối có danh sách link post.
2. **Tra khóa**: dò Sheet Data KOC theo \`Tên kênh\` (và \`Người phụ trách\` hiện tại) để lấy \`Liên hệ lần thứ\` + \`Tên kênh\`.
   - KOC có nhiều lần hợp tác mà người dùng không nói lần nào → **hỏi lại**, không đoán.
3. **Dựng hàng**: mỗi link post 1 hàng; \`Kênh đăng\` và nhãn hyperlink bóc tách từ link; \`Ngày AIR\` = ngày người dùng gửi (trừ khi có ghi chú); \`Thời gian SDHA\` theo hợp đồng.
4. **Chống trùng**: nếu URL đã có trong cột \`Link post\` (đọc từ công thức HYPERLINK) → bỏ qua và báo; tránh ghi 2 lần khi người dùng gửi lại.
5. **Ghi**: tìm khối **dòng trống liên tiếp đủ N hàng** đầu tiên (cột \`Tên kênh\` rỗng), không ghi đè dòng có dữ liệu.
   - Ghi 2 ô xám (\`Liên hệ lần thứ\`, \`Tên kênh\`) **trước**, rồi các ô trắng. Chỉ cập nhật từng ô thuộc cột cho phép, không ghi cả dòng, không đụng ô xanh.
   - \`Kênh đăng\` là dropdown: lấy danh sách giá trị hợp lệ từ data validation của ô; giá trị không khớp → dừng và báo.
6. **Kiểm tra sau ghi**: đọc lại các cột xanh của từng hàng. Nếu \`Tên KOC / Nghệ danh\` vẫn rỗng (tra cứu thất bại: sai tên kênh hoặc sai lần hợp tác) → báo ngay, không tự sửa.
7. **Báo kết quả**: bảng các hàng đã ghi (số dòng, KOC, lần, Materials, kênh, link) + mục đã bỏ qua (trùng) + cảnh báo.

#### 4.2.4. Nguồn giá trị từng cột trắng
| Cột | Nguồn |
|---|---|
| \`Ngày AIR\` | ngày người dùng gửi link (\`DD/MM/YYYY\`), trừ khi có ghi chú ngày khác |
| \`Link UTM KOC\` | người dùng gửi |
| \`Materials\` | link thành phẩm từ bước 4.1 |
| \`Format\` | Video / Hình ảnh |
| \`Thời gian SDHA\` | theo hợp đồng (mặc định \`Trọn đời\` nếu HĐ nhắc SDHA mà không nêu thời hạn) |
| \`Kênh đăng\` | bóc tách từ link: Tiktok / Facebook / Instagram / Threads / Youtube |
| \`Link post\` | \`=HYPERLINK("url", "nhãn")\` theo bảng dưới |

**Nhãn hyperlink \`Link post\`**:
| Nền tảng | Điều kiện | Nhãn |
|---|---|---|
| Facebook | chứa \`reel\`/\`reels\` | \`Facebook Reels\` |
| Facebook | khác | \`Facebook\` |
| TikTok | chứa \`/photo/\` | \`Tiktok Photo\` |
| TikTok | khác | \`Tiktok\` |
| Instagram | chứa \`reel\`/\`reels\` | \`Instagram Reels\` |
| Instagram | chứa \`/p/\` hoặc \`photo\` | \`Instagram\` |
| Instagram | khác | \`Instagram Video\` |
`;

// ---- AGENTS.md & booking-rules.md
const AG_REPORT = `#### 3.2. Sheet Report - báo cáo materials & post air
- Spreadsheet: \`1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I\`, Tab \`Report Saga\` (gid \`2134196678\`). Chi tiết quy trình: \`curr-plan.md\` mục 4.2.
- **Phân loại cột theo màu**: ô **xám** (\`Liên hệ lần thứ\`, \`Tên kênh\`) và ô **trắng** (\`Ngày AIR\`, \`Link UTM KOC\`, \`Materials\`, \`Format\`, \`Thời gian SDHA\`, \`Kênh đăng\`, \`Link post\`) là cột AI điền. Cột **xanh** tự đổ công thức khi có \`Liên hệ lần thứ\` + \`Tên kênh\` → KHÔNG điền (chỉ đọc lại để kiểm tra). Cột \`Nhắc nhở\` không đụng.
- **MỖI HÀNG LÀ 1 LINK BÀI ĐĂNG (1 KÊNH)**. Cột \`Materials\`, \`Liên hệ lần thứ\`, \`Tên kênh\`, \`Link UTM KOC\` **lặp lại ở mọi hàng** cùng bộ thành phẩm. Một KOC có nhiều Materials (mỗi Materials nhiều link post) → ghi từng hàng liên tiếp, mỗi link 1 hàng, không gộp nhiều link vào 1 ô.
- Chỉ ghi vào khối dòng trống liên tiếp đầu tiên (cột \`Tên kênh\` rỗng), tuyệt đối không ghi đè dòng đã có dữ liệu. Chống trùng: URL đã có trong \`Link post\` thì bỏ qua và báo.
- Thứ tự ghi: 2 ô xám trước, rồi các ô trắng; sau đó đọc lại cột xanh. Nếu \`Tên KOC / Nghệ danh\` rỗng (sai tên kênh/lần hợp tác) → báo ngay, không tự sửa. KOC có nhiều lần hợp tác mà người dùng không nói → hỏi lại.
- \`Ngày AIR\`: ngày người dùng gửi link (\`DD/MM/YYYY\`), trừ khi có ghi chú ngày khác.
- \`Liên hệ lần thứ\` và \`Tên kênh\`: dò tên KOC ở Sheet Data KOC (mục 3.1) rồi đồng bộ y nguyên (ở Sheet Data KOC \`Liên hệ lần thứ\` là số đếm tự động: chỉ đọc, không ghi; ở Sheet Report thì ghi trùng khớp).
- \`Link UTM KOC\`: người dùng gửi. \`Materials\`: link thành phẩm từ bước Nhận Link Drive. \`Format\`: Video / Hình ảnh. \`Thời gian SDHA\`: theo hợp đồng (mặc định \`Trọn đời\` nếu hợp đồng nhắc SDHA mà không nêu thời hạn).
- \`Kênh đăng\` (dropdown): bóc tách từ link (Tiktok / Facebook / Instagram / Threads / Youtube); giá trị phải khớp danh sách data validation, nếu không thì dừng và báo.
- \`Link post\`: hyperlink bài đăng theo quy tắc nhãn bên dưới.
- **Nhãn hyperlink \`Link post\`** (công thức \`=HYPERLINK("url", "nhãn")\`):
  - Facebook: chứa \`reel\`/\`reels\` → \`Facebook Reels\`; khác → \`Facebook\`.
  - TikTok: chứa \`/photo/\` → \`Tiktok Photo\`; khác → \`Tiktok\`.
  - Instagram: chứa \`reel\`/\`reels\` → \`Instagram Reels\`; chứa \`/p/\` hoặc \`photo\` → \`Instagram\`; khác → \`Instagram Video\`.
- **Bỏ quy tắc gom FB + IG vào cùng 1 dòng**: mỗi kênh/link 1 hàng riêng.
`;
for (const f of ['d:/Booking/.agents/AGENTS.md', 'd:/Booking/.agents/RULE/booking-rules.md']) {
  rw(f, (L) => {
    const a = idx(L, '#### 3.2.');
    const b = idx(L, '---', a);
    let out = [...L.slice(0, a), ...AG_REPORT.split('\n'), ...L.slice(b)];
    const to = out.findIndex((l) => l.startsWith('  - **To**: Email showroom nhận hàng'));
    const cc = out.findIndex((l) => l.startsWith('  - **Cc**: Email showroom chuyển'));
    if (to < 0 || cc < 0) throw new Error('mail lines ' + f);
    out.splice(to - 1, cc - to + 2,
      '- **Định dạng email**: font **serif** (Times New Roman), cỡ chữ **Lớn**, **in đậm** các thông tin quan trọng (lời chào, tên KOC, sản phẩm xuất, showroom, ngày, SĐT, CCCD, "Lưu ý").',
      '- **Người nhận**: **KHÔNG đề xuất người nhận** (để trống To) và **KHÔNG Cc**. Người dùng tự điền khi kiểm tra và gửi.');
    return out;
  });
}

// ---- SKILL.md
rw('d:/Booking/.agents/SKILL/koc-booking/SKILL.md', (L) => {
  const a = idx(L, '### 4.2.');
  const b = idx(L, '---', a);
  let out = [...L.slice(0, a), ...REPORT_SECTION.split('\n').map((l) => l), ...L.slice(b)];
  const to = out.findIndex((l) => l.startsWith('  - **Người nhận (To)**'));
  const cc = out.findIndex((l) => l.startsWith('  - **Đồng gửi (Cc)**'));
  if (to < 0 || cc < 0) throw new Error('skill mail');
  out.splice(to, cc - to + 1,
    '  - **Định dạng**: font serif (Times New Roman), cỡ Lớn, in đậm thông tin quan trọng (`renderEmailHtml` trong `mail_template.cjs`).',
    '  - **Người nhận**: KHÔNG đề xuất To, KHÔNG Cc - người dùng tự điền khi gửi.');
  return out;
});
console.log('ok');
