const fs = require('fs');
const { google } = require('googleapis');
const { findStoreByAddressOrName } = require('./utils/store_lookup.util.cjs');
const { generateUnifiedDispatchEmail } = require('./utils/mail_template.cjs');
const { createGmailDraft } = require('./utils/gmail_draft.util.cjs');

async function testCreateDraft() {
  console.log('1. Đang soạn nội dung email...');
  const kocName = 'Minh Anh Daily';
  const kocFullName = 'NGUYỄN LÊ MINH ANH';

  const mailResult = generateUnifiedDispatchEmail({
    kocName,
    kocFullName,
    kocPhone: '0900000000',
    kocCccd: '000000000000',
    xnhProducts: [
      { name: 'Đồng hồ SAGA 53578-LGSVWH-2', qty: '01' }
    ],
    transferShowrooms: [
      {
        sourceShowroom: 'Showroom Lê Văn Việt',
        transferTarget: 'Showroom 190 Trần Quang Khải',
        products: [
          { name: 'Đồng hồ SAGA 71836-SVSVSV-2', qty: '01' }
        ],
        needDate: '04/11/2026'
      }
    ],
    giftProducts: [
      { name: 'Đồng hồ SAGA 53578-LGSVWH-2', qty: '01' },
      { name: 'Đồng hồ SAGA 71836-SVSVSV-2', qty: '01' }
    ],
    hasBorrow: false,
    targetShowroom: 'Showroom 190 Trần Quang Khải',
    targetShowroomAddress: '190D Trần Quang Khải, Phường Tân Định, TP. Hồ Chí Minh',
    storePic: 'BA - Trần Thùy My (0933 634 741)',
    pickupDate: '05/11/2026',
    needDate: '04/11/2026'
  });

  const subject = `Marketing - Xuất sản phẩm tặng KOC ${kocName}`;

  // Chuyển plain text sang html có ngắt dòng
  const htmlBody = `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
${mailResult.body.replace(/\n/g, '<br/>')}
</div>`;

  const recipients = {
    to: [
      '190tranquangkhai@donghohaitrieu.vn',
      'kimlien@donghohaitrieu.vn',
      'kimngoc@donghohaitrieu.vn'
    ],
    cc: [
      'levanviet@donghohaitrieu.vn',
      'amber.hotro@donghohaitrieu.vn'
    ],
    subject,
    htmlBody
  };

  console.log('2. Đang tạo Draft vào Gmail...');
  const draft = await createGmailDraft(recipients);
  console.log('-> Tạo Draft thành công! Draft ID:', draft.id);
  console.log('Tiêu đề:', subject);
  console.log('Gửi tới (To):', recipients.to.join(', '));
  console.log('Đồng gửi (Cc):', recipients.cc.join(', '));
}

testCreateDraft().catch(console.error);
