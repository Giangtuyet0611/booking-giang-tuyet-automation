const fs = require('fs');
function rw(f, fn) {
  let t = fs.readFileSync(f, 'utf8');
  const eol = t.includes('\r\n') ? '\r\n' : '\n';
  const L = t.split(/\r?\n/);
  const out = fn(L);
  fs.writeFileSync(f, out.join(eol), 'utf8');
}
const idx = (L, p, from = 0) => { const i = L.findIndex((l, k) => k >= from && l.startsWith(p)); if (i < 0) throw new Error('missing ' + p); return i; };

const KOC_BOOM = [
  '- **Ngừng ghi** vào Spreadsheet cũ (`1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0`) và 3 Tab `CSC - Saga`, `SL materials - Saga v1`, `2 SL post & ĐTT - Saga`. Chuyển sang 2 Sheet chung bên dưới.',
  '- **Nhận diện cột theo TÊN tiêu đề, KHÔNG theo địa chỉ cột/dòng** (team có thể đảo/thêm cột): tự dò dòng tiêu đề, chuẩn hóa tên cột (bỏ xuống dòng, khoảng trắng, hoa/thường); thiếu hoặc trùng cột bắt buộc thì dừng và báo.',
  '- **Sheet Data KOC**: [link](https://docs.google.com/spreadsheets/d/1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw/edit?gid=280295617#gid=280295617) (Tab `Data KOC (11/2026)`, gid `280295617`).',
  '- Khi tôi gửi thông tin hợp đồng KOC tên A: dò tên A ở cột `Tên kênh (Kênh chính booking, không trùng lặp)`.',
  '  - Chỉ cập nhật nếu cột `Người phụ trách` của dòng đó đúng là tôi; không tìm thấy / người phụ trách khác / trùng nhiều dòng thì KHÔNG ghi và báo lại.',
  '  - Không tạo dòng mới. Chỉ điền các cột sau của đúng dòng đó:',
  '    - `Trạng thái`: `Đã chốt`',
  '    - `Số sản phẩm tặng`',
  '    - `Mã sản phẩm`: nhiều sản phẩm cách nhau bởi dấu ; và khoảng trắng trước-sau, ví dụ `54510-GPGRGP-2 ; 53578-LGCRCR-2`',
  '    - `Tổng chi phí sản phẩm`',
  '    - `Tổng cast` (tiền mặt, số Net)',
];

const REPORT = [
  '- **Sheet Report**: [link](https://docs.google.com/spreadsheets/d/1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I/edit?gid=2134196678#gid=2134196678) (Tab `Report Saga`, gid `2134196678`). **Mỗi hàng là 1 kênh.** Nhận diện cột theo tên tiêu đề.',
  '- Chỉ ghi vào dòng trống đầu tiên (cột `Tên kênh` rỗng), không ghi đè dòng cũ; giữ nguyên các cột công thức/chỉ số (`View 3D`, `CPM`, `Cảm xúc 7D`...).',
  '- Các cột điền:',
  '  - `Ngày AIR`: ngày tôi gửi link (`DD/MM/YYYY`).',
  '  - `Liên hệ lần thứ`, `Tên kênh`: dò tên KOC ở Sheet Data KOC để đồng bộ.',
  '  - `Link UTM KOC`: tôi gửi cho bạn.',
  '  - `Materials`: link thành phẩm sau bước "Nhận Link Drive & Đổi Tên Chuẩn" ở trên.',
  '  - `Format`.',
  '  - `Thời gian SDHA`: theo hợp đồng.',
  '  - `Kênh đăng`: bóc tách từ link tôi gửi.',
  '  - `Link post`: hyperlink theo quy tắc nhãn bên dưới.',
  '- **Quy tắc nhãn hyperlink `Link post`** (`=HYPERLINK("url", "nhãn")`):',
  '  - Facebook: có `reel`/`reels` → `Facebook Reels`; khác → `Facebook`.',
  '  - TikTok: có `/photo/` → `Tiktok Photo`; khác → `Tiktok`.',
  '  - Instagram: có `reel`/`reels` → `Instagram Reels`; có `/p/` hoặc `photo` → `Instagram`; khác → `Instagram Video`.',
  '- Bỏ quy tắc gom FB + IG chung 1 dòng: mỗi kênh/link 1 hàng.',
];

// ---- curr-plan.md
rw('d:/Booking/curr-plan.md', (L) => {
  const a = idx(L, '### 4. Ghi D'); // CSC - Saga
  const aEnd = idx(L, '---', a);
  const b = idx(L, '### 2. Ghi nh'); // SL materials
  const bEnd = idx(L, '---', b);
  const cfg = L.findIndex((l) => l.startsWith('- Tab 1: `CSC - Saga`'));
  let out = [
    ...L.slice(0, a),
    '### 4. Cập nhật trạng thái chốt deal lên Sheet Data KOC (thay cho ghi dòng mới vào `CSC - Saga`):',
    ...KOC_BOOM, '',
    ...L.slice(aEnd, b),
    '### 2. Cập nhật Sheet Report (thay cho Tab 2 `SL materials - Saga v1` và Tab 3 `SL post & ĐTT - Saga`):',
    ...REPORT, '',
    ...L.slice(bEnd),
  ];
  return out;
});

// ---- SKILL.md
rw('d:/Booking/.agents/SKILL/koc-booking/SKILL.md', (L) => {
  const a = idx(L, '### 3.4.');
  const aEnd = idx(L, '---', a);
  const b = idx(L, '### 4.2.');
  const bEnd = idx(L, '---', b);
  return [
    ...L.slice(0, a),
    '### 3.4. Cập Nhật Trạng Thái Chốt Deal Trên Sheet Data KOC (thay cho ghi dòng mới vào `CSC - Saga`)',
    ...KOC_BOOM, '',
    ...L.slice(aEnd, b),
    '### 4.2. Cập Nhật Sheet Report (thay cho Tab 2 và Tab 3 cũ)',
    ...REPORT, '',
    ...L.slice(bEnd),
  ];
});
console.log('ok');

