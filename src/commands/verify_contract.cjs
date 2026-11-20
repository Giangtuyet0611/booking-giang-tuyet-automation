const { getClients } = require('../lib/google.cjs');

/**
 * Tự động kiểm tra chất lượng tài liệu hợp đồng sau khi khởi tạo
 */
async function verifyContract(docId, expectedData = {}) {
  const { docs } = getClients();

  const res = await docs.documents.get({ documentId: docId });
  const content = res.data.body.content;

  let fullText = '';
  const tables = [];

  for (const el of content) {
    if (el.paragraph) {
      for (const p of el.paragraph.elements) {
        if (p.textRun) fullText += p.textRun.content;
      }
    } else if (el.table) {
      const rows = [];
      for (const r of el.table.tableRows) {
        const cells = r.tableCells.map(c => {
          let t = '';
          for (const co of c.content) {
            if (co.paragraph) t += co.paragraph.elements.map(e => e.textRun?.content || '').join('');
          }
          return t.trim();
        });
        rows.push(cells);
      }
      tables.push(rows);
    }
  }

  const checks = [];

  // 1. Kiểm tra sót placeholder mẫu cũ
  const forbiddenPlaceholders = [
    'PHAN NGỌC VÂN ANH',
    'PHAN NGỌC VÂN ANH',
    'NGUYỄN PHƯƠNG DUNG',
    'NGUYỄN THỊ PHƯƠNG DUNG',
    '53578-LGSVLG-2',
    '056302005986',
    '0385169915',
    'alicephan109@gmail.com',
    'alice.109_',
    'waananh',
    '79 Lê Văn Việt',
    'Trend Loan Niệm'
  ];

  const foundPlaceholders = [];
  forbiddenPlaceholders.forEach(ph => {
    if (fullText.toLowerCase().includes(ph.toLowerCase())) {
      foundPlaceholders.push(ph);
    }
  });

  checks.push({
    title: 'Xóa sạch mẫu template cũ',
    status: foundPlaceholders.length === 0 ? 'PASS' : 'FAIL',
    details: foundPlaceholders.length === 0 ? 'Không sót placeholder cũ nào' : `Sót: ${foundPlaceholders.join(', ')}`
  });

  // 2. Kiểm tra Bảng SOW (Table 1)
  if (tables.length >= 1) {
    const sowTable = tables[0];
    const dataRows = sowTable.length - 1; // trừ Header
    const expectedCount = expectedData.sowCount || (expectedData.sow ? expectedData.sow.length : null);
    
    let isSowOk = dataRows > 0;
    if (expectedCount !== null) {
      isSowOk = (dataRows === expectedCount);
    }

    checks.push({
      title: 'Bảng SOW (Điều 1)',
      status: isSowOk ? 'PASS' : 'FAIL',
      details: expectedCount !== null 
        ? `${dataRows}/${expectedCount} hàng dữ liệu tương ứng các hạng mục`
        : `${dataRows} hàng dữ liệu`
    });
  } else {
    checks.push({ title: 'Bảng SOW (Điều 1)', status: 'FAIL', details: 'Không tìm thấy bảng SOW' });
  }

  // 3. Kiểm tra Bảng Sản phẩm (Table 2 nếu là HĐ Tặng SP)
  if (tables.length >= 2) {
    const prodTable = tables[1];
    let hasCorrectFormat = false;
    if (prodTable.length >= 2) {
      const prodNameCell = prodTable[1][1] || '';
      hasCorrectFormat = prodNameCell.startsWith('Đồng hồ SAGA ');
    }

    checks.push({
      title: 'Format Tên SP (Đồng hồ SAGA + mã)',
      status: hasCorrectFormat ? 'PASS' : 'FAIL',
      details: hasCorrectFormat ? 'Đúng format "Đồng hồ SAGA + mã"' : 'Chưa đúng format chuẩn'
    });
  }

  // 4. Kiểm tra Bên B và chữ ký
  const benBMatch = fullText.match(/BÊN B:\s*([^\n]+)/i);
  const benBName = benBMatch ? benBMatch[1].trim() : '';

  let signatureMatch = false;
  if (tables.length >= 3) {
    const sigTable = tables[tables.length - 1];
    const benBSigCell = sigTable[sigTable.length - 1][1] || '';
    if (benBName && benBSigCell.includes(benBName)) {
      signatureMatch = true;
    }
  }

  checks.push({
    title: 'Đồng bộ tên Bên B và Người ký',
    status: signatureMatch ? 'PASS' : 'FAIL',
    details: signatureMatch ? `Đồng bộ: ${benBName}` : 'Chưa đồng bộ tên người ký Bên B'
  });

  // 5. Kiểm tra thời hạn hiển thị bài đăng
  const hasDisplayLifetime = fullText.includes('Thời gian hiển thị bài đăng: Trọn đời');
  checks.push({
    title: 'Thời gian hiển thị bài đăng (Trọn đời)',
    status: hasDisplayLifetime ? 'PASS' : 'FAIL',
    details: hasDisplayLifetime ? 'Luôn là "Trọn đời"' : 'Chưa cập nhật "Trọn đời"'
  });

  console.log(`\n================ KẾT QUẢ VERIFY HỢP ĐỒNG: ${docId} ================`);
  checks.forEach(c => {
    const icon = c.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon} [${c.status}] ${c.title}: ${c.details}`);
  });
  console.log(`========================================================================\n`);

  const allPass = checks.every(c => c.status === 'PASS');
  return {
    allPass,
    checks
  };
}

module.exports = { verifyContract };

