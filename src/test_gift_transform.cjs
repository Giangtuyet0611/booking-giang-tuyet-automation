const fs = require('fs');
const { google } = require('googleapis');
const creds = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const keys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const auth = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0]);
auth.setCredentials(creds);
const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

async function testGiftTransform() {
  const copyRes = await drive.files.copy({
    fileId: '1ODq7piHW8reZeQe8ERbGY9REmZpzVZlOdgRukGvUZ-8',
    supportsAllDrives: true,
    requestBody: { name: 'TEST_GIFT_TRANSFORM' }
  });
  const docId = copyRes.data.id;
  const doc = await docs.documents.get({ documentId: docId });

  // Tìm Table 1 (SOW table) và các đoạn P 31, P 32, P 33
  let sowTable = null;
  let p30 = null, p31 = null, p32 = null, p33 = null, p34 = null;

  for (const el of doc.data.body.content) {
    if (el.table && !sowTable) {
      sowTable = el;
    } else if (el.paragraph) {
      const text = el.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
      if (text.includes('1.3. Thời gian đăng tải:')) p30 = el;
      else if (text.includes('Trend Loan Niệm') && text.includes('Video')) p31 = el;
      else if (text.includes('trend Loan Niệm') && text.includes('photo')) p32 = el;
      else if (text.includes('Lifestyle tại không gian')) p33 = el;
      else if (text.includes('1.4. Thời gian hiển thị bài đăng:')) p34 = el;
    }
  }

  console.log('sowTable:', sowTable ? sowTable.startIndex + '->' + sowTable.endIndex : 'none');
  console.log('p31:', p31 ? p31.startIndex + '->' + p31.endIndex : 'none');
  console.log('p32:', p32 ? p32.startIndex + '->' + p32.endIndex : 'none');
  console.log('p33:', p33 ? p33.startIndex + '->' + p33.endIndex : 'none');

  // Xóa P 31, P 32, P 33 (từ p31.startIndex đến p34.startIndex)
  // và chèn câu SOW duy nhất vào vị trí đó!
  if (p31 && p34) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: {
                startIndex: p31.startIndex,
                endIndex: p34.startIndex
              }
            }
          },
          {
            insertText: {
              location: { index: p31.startIndex },
              text: 'Đăng 01 photo post Tiktok (Reup Facebook, Instagram) (6-8 ảnh) “đeo Saga đi sự kiện, không gian sang trọng,... (Có ảnh cận đồng hồ)” vào ngày 29/10/2026\n'
            }
          }
        ]
      }
    });
    console.log('-> Đã xóa sạch P31, P32, P33 và chèn 1 câu duy nhất thành công!');
  }

  // Đọc lại document để kiểm tra kết quả đoạn 1.3
  const updatedDoc = await docs.documents.get({ documentId: docId });
  let checkText = '';
  updatedDoc.data.body.content.forEach((el, idx) => {
    if (el.paragraph) {
      const pText = el.paragraph.elements.map(e => e.textRun ? e.textRun.content : '').join('');
      if (pText.includes('Thời gian đăng tải') || pText.includes('Đăng 01') || pText.includes('Thời gian hiển thị')) {
        checkText += `[${idx}] ${pText}`;
      }
    }
  });
  console.log('Check result:\n' + checkText);

  await drive.files.delete({ fileId: docId, supportsAllDrives: true });
}

testGiftTransform().catch(console.error);
