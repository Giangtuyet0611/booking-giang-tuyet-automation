const { generateUnifiedDispatchEmail, renderEmailHtml } = require('../src/utils/mail_template.cjs');
const p = {
  kocName: 'Minh Anh Daily', kocFullName: 'Nguyễn Minh Anh', kocPhone: '0901234567', kocCccd: '079300000000',
  xnhProducts: [{ name: 'Saga Stella 55757-HGGVH-2', qty: '01' }],
  giftProducts: [{ name: 'Saga Stella 55757-HGGVH-2', qty: '01' }, { name: 'Saga Charm 53229-SVMWSV-8', qty: '01' }],
  targetShowroom: 'Showroom 190D', pickupDate: '12/11/2026', needDate: '11/11/2026'
};
const r = generateUnifiedDispatchEmail(p);
console.log(Object.keys(r).join(','));
require('fs').writeFileSync(__dirname + '/mail_preview.html', renderEmailHtml(r.body, p), 'utf8');
console.log(renderEmailHtml(r.body, p).slice(0, 900));
const { makeRawEmail } = require('../src/utils/gmail_draft.util.cjs');
console.log(Buffer.from(makeRawEmail({ subject: 'x', htmlBody: 'y' }), 'base64').toString().split('\r\n')[0]);

