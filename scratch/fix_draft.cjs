const { google } = require('googleapis');
const fs = require('fs');
const { generateUnifiedDispatchEmail, renderEmailHtml } = require('../src/utils/mail_template.cjs');
const { createGmailDraft } = require('../src/utils/gmail_draft.util.cjs');

function getClients() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);

  return {
    gmail: google.gmail({ version: 'v1', auth })
  };
}

async function fixDraft() {
  const { gmail } = getClients();

  // Delete wrong draft if exists
  try {
    await gmail.users.drafts.delete({
      userId: 'me',
      id: 'r7504449681656773715'
    });
    console.log('Deleted draft r7504449681656773715');
  } catch (err) {
    console.warn('Draft delete note:', err.message);
  }

  // Create new draft with correct KOC phone: 0939720264
  const mailParams = {
    kocName: 'Dmy nè',
    kocFullName: 'NGUYỄN THỊ THANH NGÂN',
    kocPhone: '0939720264',
    kocCccd: '079301014286',
    targetShowroom: 'Showroom Quang Trung (049QT1)',
    targetShowroomAddress: '634 Quang Trung, phường Thông Tây Hội, quận Gò Vấp, TP. Hồ Chí Minh',
    storePic: 'BA - Trần Thị Quỳnh Như',
    pickupDate: '12/11/2026',
    needDate: '11/11/2026',
    xnhProducts: [
      { name: 'Đồng hồ SAGA 71959-RGRGTTR-2', qty: '01' }
    ],
    transferShowrooms: [],
    giftProducts: [
      { name: 'Đồng hồ SAGA 71959-RGRGTTR-2', qty: '01' }
    ],
    hasBorrow: false
  };

  const mailResult = generateUnifiedDispatchEmail(mailParams);
  const subject = `Marketing - Xuất sản phẩm tặng KOC Dmy nè`;
  const htmlBody = renderEmailHtml(mailResult.body, mailParams);

  const draftRes = await createGmailDraft({
    subject,
    htmlBody
  });

  console.log('-> RE-CREATED GMAIL DRAFT WITH CORRECT SĐT (0939720264):', draftRes.id);

  // Update last_thucthi1_result.json
  const resData = JSON.parse(fs.readFileSync('d:/Booking/last_thucthi1_result.json', 'utf8'));
  resData.gmailDraftId = draftRes.id;
  fs.writeFileSync('d:/Booking/last_thucthi1_result.json', JSON.stringify(resData, null, 2), 'utf8');
}

fixDraft().catch(console.error);

