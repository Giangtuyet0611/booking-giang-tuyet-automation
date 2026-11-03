const { google } = require('googleapis');
const fs = require('fs');

async function checkDoc() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const docs = google.docs({ version: 'v1', auth });

  const castDoc = await docs.documents.get({ documentId: '1cqfXf9skhYIh-IWVCfh-f16dWwxjuCDYmAarF8oidkc' });
  console.log('--- CAST DOC VERIFY ---');
  console.log('Title:', castDoc.data.title);
  const castStr = JSON.stringify(castDoc.data.body);
  console.log('Contains NGUYỄN THỊ MINH ANH:', castStr.includes('NGUYỄN THỊ MINH ANH'));
  console.log('Contains 15.000.000:', castStr.includes('15.000.000'));
  console.log('Contains 000123456789:', castStr.includes('000123456789'));
  console.log('Contains Vietcombank:', castStr.includes('Vietcombank'));

  const gift1Doc = await docs.documents.get({ documentId: '1I3UqN15nFHtfSG11PThe3Es-c7-xTcsmJd0H2fbOYdc' });
  console.log('--- GIFT 1 DOC VERIFY ---');
  console.log('Title:', gift1Doc.data.title);
  const gift1Str = JSON.stringify(gift1Doc.data.body);
  console.log('Contains NGUYỄN THỊ MINH ANH:', gift1Str.includes('NGUYỄN THỊ MINH ANH'));
  console.log('Contains SAG-TEST-001:', gift1Str.includes('SAG-TEST-001'));
  console.log('Contains 12.900.000:', gift1Str.includes('12.900.000'));
}

checkDoc().catch(console.error);
