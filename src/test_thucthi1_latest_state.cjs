const fs = require('fs');
const { google } = require('googleapis');
const { findStoreByAddressOrName } = require('./utils/store_lookup.util.cjs');
const { generateUnifiedDispatchEmail } = require('./utils/mail_template.cjs');

const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;

const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);

const docs = google.docs({ version: 'v1', auth });

/**
 * Đọc trực tiếp nội dung các hợp đồng ở trạng thái mới nhất từ Google Docs
 */
async function extractDataFromLiveContracts(contractIds) {
  console.log('1. Đang quét trực tiếp từ link Google Docs ở trạng thái mới nhất...');
  const extracted = {
    kocName: 'Minh Anh Daily',
    kocFullName: '',
    phone: '',
    cccd: '',
    targetShowroom: '',
    targetShowroomAddress: '',
    pickupDate: '',
    giftProducts: [],
    castAmount: 0
  };

  for (const docId of contractIds) {
    const res = await docs.documents.get({ documentId: docId });
    const content = res.data.body.content;

    let fullText = '';
    content.forEach(el => {
      if (el.paragraph) {
        fullText += el.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('') + '\n';
      } else if (el.table) {
        el.table.tableRows.forEach(r => {
          fullText += r.tableCells.map(c => c.content.map(p => p.paragraph ? p.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('').trim() : '').join(' ')).join(' | ') + '\n';
        });
      }
    });

    // Bóc tách Bên B
    const nameMatch = fullText.match(/BÊN B:\s*([^\n\r]+)/i);
    if (nameMatch && !extracted.kocFullName) extracted.kocFullName = nameMatch[1].trim();

    const cccdMatch = fullText.match(/Số căn cước công dân \(CCCD\):\s*([0-9]+)/i);
    if (cccdMatch && !extracted.cccd) extracted.cccd = cccdMatch[1].trim();

    const phoneMatch = fullText.match(/Số điện thoại:\s*([0-9]+)/i);
    if (phoneMatch && !extracted.phone) extracted.phone = phoneMatch[1].trim();

    // Bóc tách Showroom nhận và ngày nhận từ Điều 2.2
    const showroomMatch = fullText.match(/Tại Showroom Đồng Hồ Hải Triều:\s*([^\n\r]+)/i);
    if (showroomMatch && !extracted.targetShowroomAddress) {
      extracted.targetShowroomAddress = showroomMatch[1].trim();
      extracted.targetShowroom = `Showroom ${extracted.targetShowroomAddress.split(',')[0].trim()}`;
    }

    const pickupMatch = fullText.match(/Thời gian nhận sản phẩm dự kiến:\s*([^\n\r]+)/i);
    if (pickupMatch && !extracted.pickupDate) {
      extracted.pickupDate = pickupMatch[1].trim();
    }

    // Bóc tách sản phẩm từ bảng Điều 2.1
    const productMatches = fullText.matchAll(/\|\s*(53578-[A-Z0-9-]+|71836-[A-Z0-9-]+)\s*\|\s*([^|]+)\s*\|/gi);
    for (const pm of productMatches) {
      const code = pm[1].trim();
      const name = pm[2].trim();
      if (!extracted.giftProducts.find(p => p.code === code)) {
        extracted.giftProducts.push({ code, name, qty: '01' });
      }
    }
  }

  console.log('-> Dữ liệu bóc tách thời gian thực:', JSON.stringify(extracted, null, 2));
  return extracted;
}

async function test() {
  const last = JSON.parse(fs.readFileSync('d:/Booking/last_contract_result.json'));
  const contractIds = last.contracts.map(c => c.id);

  const liveData = await extractDataFromLiveContracts(contractIds);

  // Tra cứu Showroom Email từ Sheet danh sách cửa hàng
  const storeInfo = await findStoreByAddressOrName(liveData.targetShowroomAddress);
  console.log('\n2. Tra cứu Showroom từ Sheet:');
  console.log(storeInfo);

  // Sinh Email với tiêu đề chuẩn Marketing - Xuất sản phẩm tặng KOC <tên>
  const subject = `Marketing - Xuất sản phẩm tặng KOC ${liveData.kocName}`;
  const recipients = {
    to: [
      storeInfo ? storeInfo.email : '190tranquangkhai@donghohaitrieu.vn',
      'kimlien@donghohaitrieu.vn',
      'kimngoc@donghohaitrieu.vn'
    ],
    cc: [
      'levanviet@donghohaitrieu.vn',
      'giangtuyet@donghohaitrieu.vn'
    ]
  };

  console.log('\n3. Tiêu đề mail chuẩn:', subject);
  console.log('4. Người nhận (To):', recipients.to.join(', '));
  console.log('5. Người nhận (Cc):', recipients.cc.join(', '));
}

test().catch(console.error);
