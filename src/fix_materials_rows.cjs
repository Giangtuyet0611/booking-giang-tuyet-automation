const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const credentials = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json', 'utf8'));
  const oauthKeys = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json', 'utf8')).installed;
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret, oauthKeys.redirect_uris[0]);
  auth.setCredentials(credentials);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';
  const tabName = 'SL materials - Saga v1';

  const videoFolderUrl = 'https://drive.google.com/drive/folders/1kOdAB1SBCEgH4cw7rHwYRkJqdx9QsieK';
  const imageFolderUrl = 'https://drive.google.com/drive/folders/1x4ZioRMi8fr3AFwDQGPOeaKmhSfpohd6';

  const rows = [
    [
      '03/10/2026',
      'giadinhthaovi (20/10)',
      '=IFERROR(XLOOKUP(B812; \'CSC - Saga\'!D:D; \'CSC - Saga\'!E:E; "Saga Dancing Heart 53766-GPMWGP-2"); "Saga Dancing Heart 53766-GPMWGP-2")',
      '',
      'Video',
      `=HYPERLINK("${videoFolderUrl}"; "Video review, storytelling")`,
      'V: Review + Storytelling',
      'Bằng kỳ vọng',
      '19/10/2026',
      'Trọn đời'
    ],
    [
      '03/10/2026',
      'giadinhthaovi (20/10)',
      '=IFERROR(XLOOKUP(B813; \'CSC - Saga\'!D:D; \'CSC - Saga\'!E:E; "Saga Dancing Heart 53766-GPMWGP-2"); "Saga Dancing Heart 53766-GPMWGP-2")',
      '',
      'Hình',
      `=HYPERLINK("${imageFolderUrl}"; "Bộ ảnh concept 20/10")`,
      'H: Lookbook/Concept',
      'Bằng kỳ vọng',
      '19/10/2026',
      'Trọn đời'
    ],
    [
      '03/10/2026',
      'giadinhthaovi (20/10)',
      '=IFERROR(XLOOKUP(B814; \'CSC - Saga\'!D:D; \'CSC - Saga\'!E:E; "Saga Dancing Heart 53766-GPMWGP-2"); "Saga Dancing Heart 53766-GPMWGP-2")',
      '',
      'Video',
      `=HYPERLINK("${videoFolderUrl}"; "Video daily, lifestyle")`,
      'V: Daily/Lifestyle',
      'Bằng kỳ vọng',
      '19/10/2026',
      'Trọn đời'
    ]
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A812:J814`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows }
  });

  console.log('Updated rows 812-814 with semicolon delimiter!');

  const verify = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A812:J814`,
    valueRenderOption: 'FORMATTED_VALUE'
  });

  console.log('Formatted verify:');
  verify.data.values.forEach((r, idx) => console.log(812 + idx, JSON.stringify(r)));
}

main().catch(console.error);
