hiện tại các step automation đã ok tuy nhiên đang gặp 1 vấn đề là đối với các lệnh run mà chỉ cần khác nhau 1 ký tự thôi là bạn sẽ hỏi lại quyền run và đợi tôi submit. Ví dụ tại step A truy cập dữ liệu - check file nào đó, vì dữ liệu mỗi files là khác nhau nên khi run các lệnh như node -e hay cmd/nodejs thì bạn sẽ liên tục hỏi lại tôi cấp quyền mặc dù step này đã được allow auto run trước đó rồi. Nếu như vậy thì project này đang chưa automation đúng vì phải liên tục hỏi tôi submit cấp quyền cho 1 step mà trước đó đã làm nhiều lần/được accept nhiều lượt rồi. Vậy lý do cho vấn đề này là gì? cách khắc phục tối ưu nhất là cách nào? bạn có gợi ý gì cho việc cải thiện tối ưu automation của workflow project này hiệu quả không?

bạn: **Nguyên nhân**

1. **Quyền chạy lệnh khớp theo tiền tố (prefix) của binary và subcommand.** "Always allow" áp dụng cho `node scratch/xxx.cjs` hoặc `node src/xxx.cjs`. Nó không áp dụng cho `node -e "<code>"`, vì phần code nằm trong chuỗi lệnh. Mỗi lần code khác một ký tự thì đó là một lệnh mới, và hệ thống hỏi lại.
2. **Cách tôi chạy lệnh trong buổi này làm vấn đề nặng thêm.** Tôi dùng nhiều lệnh `node -e "..."` có code inline khác nhau để đọc, kiểm tra và sửa Docs. Tôi cũng viết file scratch mới tên khác nhau cho từng bước. Tôi còn chạy `node -e` có `$`, dấu ngoặc và backtick trong chuỗi. Những cấu trúc này khiến hệ thống phải khớp toàn bộ chuỗi lệnh thay vì tiền tố.
3. **Các lệnh gọi Google API bị chạy ngoài sandbox.** Sandbox chặn mạng, nên `node` gọi Google API bị lỗi `EACCES` ở `oauth2.googleapis.com`. Tôi phải chạy lại với `BypassSandbox: true`, và mỗi lần như vậy cần bạn duyệt riêng. Trong buổi này tôi còn thử sandbox trước rồi mới bypass, nên mỗi bước tốn thêm một lần.
4. **Dự án chưa có một lệnh cố định cho từng nghiệp vụ.** Tôi viết script tạm cho từng deal (`create_contract_dmyne.cjs`, `fix_doc.cjs`, `fix_table.cjs`...) thay vì gọi một lệnh chuẩn có tham số. Vì vậy không có lệnh nào đủ ổn định để allow một lần dùng mãi.

**Cách khắc phục tối ưu**

Dùng **một CLI cố định, dữ liệu truyền qua file JSON**:

```
node src/cli.cjs contract   --input deals/2026-11-11-dmy.json
node src/cli.cjs thucthi1   --input deals/2026-11-11-dmy.json
node src/cli.cjs inspect-doc --id <docId>
node src/cli.cjs media      --input ...
node src/cli.cjs post-air   --input ...
```

- Phần đầu lệnh (`node src/cli.cjs contract`) luôn giống nhau, nên chỉ cần "Always allow" một lần cho mỗi subcommand.
- Dữ liệu của từng KOC nằm trong file JSON, do tôi ghi bằng `write_file` (không cần xin quyền chạy lệnh). Code không bao giờ nằm trong chuỗi lệnh nữa.
- Việc đọc và kiểm tra Docs, Sheet cũng thành subcommand cố định (`inspect-doc`, `inspect-sheet`, `verify-contract`). Các lệnh `node -e` tạm thời không còn cần thiết.
- Mạng cần cho Google API, nên có hai hướng:
  - Allow cố định `node src/cli.cjs` ở chế độ bypass sandbox. Đây là một tiền tố duy nhất, nên cũng chỉ duyệt một lần.
  - Hoặc whitelist domain `*.googleapis.com` cho sandbox, rồi chạy trong sandbox luôn. Cách này an toàn hơn, vì bạn không phải cho script quyền chạy ngoài sandbox.

**Đề xuất cải thiện workflow**

1. **Gom logic vào module và chuẩn hóa input**: một schema `deal.json` (KOC, sản phẩm, SOW, lịch air, showroom...). Từ đó:
   - Lệnh "tiến hành" sinh hợp đồng từ schema.
   - Lệnh "thực thi 1" đọc lại file schema và Docs live.
2. **Đưa bảng SOW và bảng sản phẩm vào generator**: việc xóa, chèn hàng và điền ô (đã làm tay buổi này) nên thành hàm chung trong `action_contract.cjs`. Hợp đồng mới sẽ đúng ngay lần đầu và không cần các bước sửa tiếp theo.
3. **Thêm bước `verify` tự động**: sau khi tạo, lệnh tự quét tên mẫu cũ (PHAN, 53578, waananh...), kiểm tra số hàng SOW khớp số hạng mục và kiểm tra số tiền. Kết quả in thành báo cáo ngắn, nên bạn chỉ phải xem một lần.
4. **Dọn thư mục gốc**: hiện có nhiều file `verify_*.txt`, `*_dump.txt`, `sample_*` và các script `fix_*`, `test_*` dùng một lần. Nên chuyển vào `scratch/` hoặc xóa để tránh nhầm lẫn.
5. **Ghi quy ước vào `AGENTS.md`**, ví dụ: "Không dùng `node -e` hay script ad-hoc. Chỉ dùng `node src/cli.cjs <subcommand> --input <file>`. Cần chức năng mới thì thêm subcommand." Quy ước này giữ cho các phiên sau đi đúng hướng.
6. **Cho phép dùng `/learn`**: lệnh này lưu quy ước trên thành hành vi cố định cho các phiên làm việc sau.

Bạn muốn tôi triển khai luôn không? Kế hoạch là:
1. Viết `src/cli.cjs` với các subcommand `contract`, `thucthi1`, `inspect-doc`, `verify-contract`, `media`, `post-air`.
2. Chuyển phần dựng bảng SOW và bảng sản phẩm vào generator.
3. Cập nhật `AGENTS.md`.

Sau đó bạn chỉ cần duyệt "Always allow" cho vài tiền tố lệnh đó, và workflow sẽ chạy liền mạch.


tôi: Đề xuất cải thiện workflow

Gom logic vào module và chuẩn hóa input: một schema deal.json (KOC, sản phẩm, SOW, lịch air, showroom...). Từ đó:
Lệnh "tiến hành" sinh hợp đồng từ schema.
Lệnh "thực thi 1" đọc lại file schema và Docs live.
Đưa bảng SOW và bảng sản phẩm vào generator: việc xóa, chèn hàng và điền ô (đã làm tay buổi này) nên thành hàm chung trong action_contract.cjs. Hợp đồng mới sẽ đúng ngay lần đầu và không cần các bước sửa tiếp theo.
Thêm bước verify tự động: sau khi tạo, lệnh tự quét tên mẫu cũ (PHAN, 53578, waananh...), kiểm tra số hàng SOW khớp số hạng mục và kiểm tra số tiền. Kết quả in thành báo cáo ngắn, nên bạn chỉ phải xem một lần.
Dọn thư mục gốc: hiện có nhiều file verify_*.txt, *_dump.txt, sample_* và các script fix_*, test_* dùng một lần. Nên chuyển vào scratch/ hoặc xóa để tránh nhầm lẫn.
Ghi quy ước vào AGENTS.md, ví dụ: "Không dùng node -e hay script ad-hoc. Chỉ dùng node src/cli.cjs <subcommand> --input <file>. Cần chức năng mới thì thêm subcommand." Quy ước này giữ cho các phiên sau đi đúng hướng.
Cho phép dùng /learn: lệnh này lưu quy ước trên thành hành vi cố định cho các phiên làm việc sau.

Bạn muốn tôi triển khai luôn không? Kế hoạch là:

Viết src/cli.cjs với các subcommand contract, thucthi1, inspect-doc, verify-contract, media, post-air.
Chuyển phần dựng bảng SOW và bảng sản phẩm vào generator.
Cập nhật AGENTS.md.

-->> tiến hành lập kế hoạch cụ thể cho giải pháp này cho tôi

bạn:L Created cli_automation_plan.md

Tôi đã lập xong kế hoạch triển khai và chưa sửa code nào. Bạn xem tại [cli_automation_plan.md](file:///C:/Users/ADmin/.gemini/antigravity/brain/e84dab20-cf9d-467d-8d0b-929ca43b493c/cli_automation_plan.md).

Kế hoạch chia thành 6 giai đoạn:
1. **Nền tảng:** `lib/google.cjs`, schema `deal.json` và khung `cli.cjs`.
2. **Generator:** dựng bảng SOW và bảng sản phẩm trong code, rồi tạo lại hợp đồng Dmy nè từ file deal.
3. **Verify:** tự động báo PASS/FAIL cho tên mẫu cũ, số hàng SOW, số tiền, Bên B và showroom.
4. **Bọc các lệnh còn lại:** `thucthi1`, `media`, `post-air` và `inspect-sheet`.
5. **Dọn dẹp và tài liệu:** chuyển file thừa vào `scratch/archive/`, cập nhật `AGENTS.md` và đồng bộ `RULES.md`.
6. **Nghiệm thu:** chạy trọn quy trình bằng một deal mẫu, không còn `node -e` nào.

Bạn cần quyết định 4 điểm (chi tiết ở mục 12 của kế hoạch):
1. Mạng cho Google API: whitelist `*.googleapis.com` cho sandbox (khuyên dùng), hay cho chạy ngoài sandbox?
2. File cũ ở thư mục gốc: chuyển vào `scratch/archive/` (khuyên dùng) hay xóa hẳn?
3. `RULES.md`: xóa, hay giữ và đồng bộ với `AGENTS.md`?
4. Có thêm lệnh `new-deal` để tạo khung `deal.json` từ mẫu text KOC không?

Nếu bạn bấm Proceed mà không trả lời, tôi sẽ chọn các phương án khuyên dùng.

Có một rủi ro cần lưu ý. Code `contract` hiện tự xóa file cùng tên trong thư mục đích. Bản mới sẽ dừng và báo lại, và chỉ ghi đè khi có cờ `--replace`.