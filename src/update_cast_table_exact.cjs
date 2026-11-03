const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const docs = google.docs({ version: 'v1', auth });

async function updateCastTableExact() {
  const last = JSON.parse(fs.readFileSync('d:/Booking/last_contract_result.json'));
  const castDocId = last.contracts[0].id;
  console.log('Updating Cast Doc:', castDocId);

  // Lấy doc hiện tại
  const doc = await docs.documents.get({ documentId: castDocId });

  // 1. Cập nhật câu văn bản 2.1
  const netAmount = 7000000;
  const taxAmount = Math.round(netAmount * 0.1); // 700.000
  const grossAmount = netAmount + taxAmount;     // 7.700.000
  const kocFullName = 'NGUYỄN LÊ MINH ANH';
  const kocDisplayName = 'Minh Anh Daily';

  // Tìm bảng chi phí
  // Trong template Cast, bảng chi phí là bảng thứ 2 (bảng đầu tiên là bảng Điều 1 SOW)
  let costTable = null;
  let tableCount = 0;
  for (const el of doc.data.body.content) {
    if (el.table) {
      tableCount++;
      if (tableCount === 2) {
        costTable = el;
        break;
      }
    }
  }

  if (!costTable) {
    console.error('Could not find cost table!');
    return;
  }

  console.log('Found cost table:', costTable.startIndex, 'to', costTable.endIndex);

  // Xóa bảng chi phí cũ và chèn bảng 5 hàng mới theo đúng ảnh mẫu của User
  const insertIdx = costTable.startIndex;
  await docs.documents.batchUpdate({
    documentId: castDocId,
    requestBody: {
      requests: [
        {
          deleteContentRange: {
            range: { startIndex: costTable.startIndex, endIndex: costTable.endIndex }
          }
        },
        {
          insertTable: {
            rows: 5,
            columns: 6,
            location: { index: insertIdx }
          }
        }
      ]
    }
  });

  // Lấy lại doc để lấy chỉ mục các ô
  const updatedDoc = await docs.documents.get({ documentId: castDocId });
  let newCostTable = null;
  tableCount = 0;
  for (const el of updatedDoc.data.body.content) {
    if (el.table) {
      tableCount++;
      if (tableCount === 2) {
        newCostTable = el.table;
        break;
      }
    }
  }

  // Điền nội dung vào bảng 5 hàng x 6 cột theo đúng mẫu:
  // Row 0: STT | Dịch vụ | Hạng mục | Số lượng/ Thời gian | Đơn vị tính | Số tiền
  // Row 1: 1 | Booking KOC Minh Anh Daily | 01 Video Tiktok (60-90s) (Reup Reels, Story FB, IG) | 01 | Video | 7.000.000
  // Row 2: TỔNG CỘNG | | | | | 7.700.000 (Đã bao gồm thuế)
  // Row 3: Bên B: NGUYỄN LÊ MINH ANH  thực nhận | | | | | 7.000.000
  // Row 4: Bên A: Công ty TNHH Hải Triều Việt Nam thực hiện nghĩa vụ đóng thuế thu nhập cá nhân cho bên B | | | | | 700.000
  const cellData = [
    { r: 0, c: 0, text: 'STT' },
    { r: 0, c: 1, text: 'Dịch vụ' },
    { r: 0, c: 2, text: 'Hạng mục' },
    { r: 0, c: 3, text: 'Số lượng/\nThời gian' },
    { r: 0, c: 4, text: 'Đơn vị\ntính' },
    { r: 0, c: 5, text: 'Số tiền' },

    { r: 1, c: 0, text: '1' },
    { r: 1, c: 1, text: `Booking\nKOC ${kocDisplayName}` },
    { r: 1, c: 2, text: '01 Video Tiktok (60-90s) (Reup Reels, Story FB, IG)' },
    { r: 1, c: 3, text: '01' },
    { r: 1, c: 4, text: 'Video' },
    { r: 1, c: 5, text: '7.000.000' },

    { r: 2, c: 0, text: 'TỔNG CỘNG' },
    { r: 2, c: 5, text: '7.700.000 (Đã bao gồm thuế)' },

    { r: 3, c: 0, text: `Bên B:  ${kocFullName}  thực nhận` },
    { r: 3, c: 5, text: '7.000.000' },

    { r: 4, c: 0, text: 'Bên A: Công ty TNHH Hải Triều Việt Nam thực hiện nghĩa vụ đóng thuế thu nhập cá nhân cho bên B' },
    { r: 4, c: 5, text: '700.000' }
  ];

  const textInserts = [];
  cellData.forEach(item => {
    const cell = newCostTable.tableRows[item.r].tableCells[item.c];
    const cellIndex = cell.content[0].startIndex;
    textInserts.push({ index: cellIndex, text: item.text });
  });

  textInserts.sort((a, b) => b.index - a.index);

  await docs.documents.batchUpdate({
    documentId: castDocId,
    requestBody: {
      requests: textInserts.map(ti => ({ insertText: { location: { index: ti.index }, text: ti.text } }))
    }
  });

  // Cập nhật câu 2.1 và 2.3
  const textUpdates = [
    {
      replaceAllText: {
        containsText: {
          text: 'Bên A trả cho Bên B tổng chi phí để thực hiện dịch vụ bằng hiện kim là: 7.777.778 VNĐ (Bằng chữ: Bảy triệu bảy trăm bảy mươi bảy nghìn bảy trăm bảy mươi tám đồng. Trong đó: Thuế TNCN (10%) khấu trừ: 777.778 VNĐ; KOC thực nhận: 7.000.000 VNĐ) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)',
          matchCase: false
        },
        replaceText: 'Bên A trả cho Bên B chi phí để thực hiện dịch vụ bằng hiện kim là: 7.000.000 VNĐ đã khấu trừ thuế TNCN (Bằng chữ: Bảy triệu Việt Nam Đồng) sau đây gọi là “Tổng Giá Trị Hợp Đồng”)'
      }
    },
    {
      replaceAllText: {
        containsText: {
          text: '100% Giá trị hợp đồng tương đương: 7.777.778 VNĐ (Bằng chữ: Bảy triệu bảy trăm bảy mươi bảy nghìn bảy trăm bảy mươi tám đồng. Trong đó: Thuế TNCN (10%) khấu trừ: 777.778 VNĐ; KOC thực nhận: 7.000.000 VNĐ) thành các đợt như sau:',
          matchCase: false
        },
        replaceText: '100% Giá trị hợp đồng tương đương: 7.000.000 VNĐ (Bằng chữ: Bảy triệu Việt Nam Đồng đã khấu trừ thuế TNCN) thành các đợt như sau:'
      }
    }
  ];

  await docs.documents.batchUpdate({
    documentId: castDocId,
    requestBody: { requests: textUpdates }
  });

  console.log('-> Đã cập nhật Bảng Cast + Thuế chuẩn 100% theo mẫu của User!');
}

updateCastTableExact().catch(console.error);
