const fs = require('fs');
const { generateUnifiedDispatchEmail } = require('../src/utils/mail_template.cjs');
const { createGmailDraft } = require('../src/utils/gmail_draft.util.cjs');

async function run() {
  const mailResult = generateUnifiedDispatchEmail({
    kocName: 'Hana Sắp Cưới',
    kocFullName: 'Huỳnh Thị Mỹ Hiền',
    kocPhone: '0385683144',
    kocCccd: '072199009144',
    targetShowroom: 'Showroom Dương Bá Trạc',
    targetShowroomAddress: '81 Dương Bá Trạc, Phường Chánh Hưng, TP. Hồ Chí Minh',
    storePic: 'anh BA - Phạm Lê Thanh Tùng',
    pickupDate: '10/11/2026',
    needDate: '09/11/2026',
    transferShowrooms: [
      {
        sourceShowroom: 'Showroom Nguyễn Thị Định',
        products: [
          {
            name: 'Đồng hồ Saga Lunar Watch 71959-RGRGTTR-2',
            qty: '01'
          }
        ]
      }
    ],
    giftProducts: [
      {
        name: 'Đồng hồ Saga Lunar Watch 71959-RGRGTTR-2',
        qty: '01'
      }
    ]
  });

  const subject = 'Marketing - Xuất sản phẩm tặng KOC Hana Sắp Cưới';
  const htmlBody = `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
${mailResult.body.replace(/\n/g, '<br/>')}
</div>`;

  const toRecipients = [
    'duongbatrac@donghohaitrieu.vn',
    'kimlien@donghohaitrieu.vn'
  ];

  const ccRecipients = [
    'nguyenthidinh@donghohaitrieu.vn',
    'diamond.hotro@donghohaitrieu.vn',
    'sapphire.hotro@donghohaitrieu.vn',
    'trainee.giangtuyet@donghohaitrieu.vn'
  ];

  console.log('Creating Gmail draft...');
  console.log('Subject:', subject);
  console.log('To:', toRecipients.join(', '));
  console.log('Cc:', ccRecipients.join(', '));

  const draft = await createGmailDraft({
    to: toRecipients,
    cc: ccRecipients,
    subject: subject,
    htmlBody: htmlBody
  });

  console.log('Draft created successfully! Draft ID:', draft.id);
  return draft;
}

run().catch(console.error);
