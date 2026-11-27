const { getClients } = require('../src/lib/google.cjs');

const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
const sheetId = 280295617;
const sheetTitle = 'Data KOC (11/2026)';

const cellFmt = (align = 'CENTER', wrap = 'WRAP') => ({
  horizontalAlignment: align,
  verticalAlignment: 'MIDDLE',
  wrapStrategy: wrap,
  textFormat: { fontFamily: 'Nunito', fontSize: 9 },
});

const koc = {
  channelName: 'ánh minh',
  realName: 'Ánh Minh',
  tier: 'Nano (1K - 10K followers)',
  field: 'Gia đình/ Nhà cửa đời sống',
  style: 'Daily Vlog/ Life Style',
  location: '',
  tiktokUrl: 'https://www.tiktok.com/@lenanhminh',
  fbUrl: 'https://www.facebook.com/aminhxdnmt',
  igUrl: 'https://www.instagram.com/lnaminh/',
  ytUrl: 'không có',
  contact: 'không có',
  brand: 'Saga',
  project: 'Cô dâu Saga',
  pic: 'Tuyết',
  date: '27/11/2026'
};

async function insertKoc() {
  const { sheets } = getClients();

  const requests = [];

  // Chèn 1 hàng mới tại vị trí Hàng 2 (startIndex 1, endIndex 2)
  requests.push({
    insertDimension: {
      range: {
        sheetId: sheetId,
        dimension: 'ROWS',
        startIndex: 1,
        endIndex: 2,
      },
      inheritFromBefore: false,
    },
  });

  const targetRowNumber = 2;
  const targetRowIndex = 1;

  // Chiều cao hàng 32px
  requests.push({
    updateDimensionProperties: {
      range: {
        sheetId: sheetId,
        dimension: 'ROWS',
        startIndex: targetRowIndex,
        endIndex: targetRowIndex + 1,
      },
      properties: {
        pixelSize: 32,
      },
      fields: 'pixelSize',
    },
  });

  const colsBC = [
    {
      userEnteredValue: { stringValue: koc.pic },
      userEnteredFormat: cellFmt('CENTER', 'OVERFLOW_CELL'),
    },
    {
      userEnteredValue: { stringValue: koc.date },
      userEnteredFormat: cellFmt('CENTER', 'OVERFLOW_CELL'),
    },
  ];

  const colsEQ = [
    {
      userEnteredValue: { stringValue: koc.channelName },
      userEnteredFormat: cellFmt('LEFT', 'WRAP'),
    },
    {
      userEnteredValue: { stringValue: koc.realName },
      userEnteredFormat: cellFmt('LEFT', 'OVERFLOW_CELL'),
    },
    {
      userEnteredValue: { stringValue: koc.tier },
      userEnteredFormat: cellFmt('CENTER', 'WRAP'),
    },
    {
      userEnteredValue: { stringValue: koc.field },
      userEnteredFormat: cellFmt('CENTER', 'WRAP'),
    },
    {
      userEnteredValue: { stringValue: koc.style },
      userEnteredFormat: cellFmt('CENTER', 'WRAP'),
    },
    {
      userEnteredValue: { stringValue: koc.location },
      userEnteredFormat: cellFmt('CENTER', 'WRAP'),
    },
    {
      userEnteredValue: { stringValue: koc.tiktokUrl },
      userEnteredFormat: {
        ...cellFmt('LEFT', 'CLIP'),
        textFormat: {
          fontFamily: 'Nunito',
          fontSize: 9,
          link: { uri: koc.tiktokUrl },
          underline: true,
        },
      },
    },
    {
      userEnteredValue: { stringValue: koc.fbUrl },
      userEnteredFormat: {
        ...cellFmt('LEFT', 'CLIP'),
        textFormat: {
          fontFamily: 'Nunito',
          fontSize: 9,
          link: { uri: koc.fbUrl },
          underline: true,
        },
      },
    },
    {
      userEnteredValue: { stringValue: koc.igUrl },
      userEnteredFormat: {
        ...cellFmt('LEFT', 'CLIP'),
        textFormat: {
          fontFamily: 'Nunito',
          fontSize: 9,
          link: { uri: koc.igUrl },
          underline: true,
        },
      },
    },
    {
      userEnteredValue: { stringValue: koc.ytUrl },
      userEnteredFormat: cellFmt('LEFT', 'CLIP'),
    },
    {
      userEnteredValue: { stringValue: koc.contact },
      userEnteredFormat: cellFmt('CENTER', 'WRAP'),
    },
    {
      userEnteredValue: { stringValue: koc.brand },
      userEnteredFormat: cellFmt('CENTER', 'OVERFLOW_CELL'),
    },
    {
      userEnteredValue: { stringValue: koc.project },
      userEnteredFormat: cellFmt('CENTER', 'WRAP'),
    },
  ];

  // Cập nhật Cột B:C
  requests.push({
    updateCells: {
      range: {
        sheetId: sheetId,
        startRowIndex: targetRowIndex,
        endRowIndex: targetRowIndex + 1,
        startColumnIndex: 1,
        endColumnIndex: 3,
      },
      rows: [{ values: colsBC }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // Cập nhật Cột E:Q
  requests.push({
    updateCells: {
      range: {
        sheetId: sheetId,
        startRowIndex: targetRowIndex,
        endRowIndex: targetRowIndex + 1,
        startColumnIndex: 4,
        endColumnIndex: 17,
      },
      rows: [{ values: colsEQ }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  console.log('Executing batchUpdate for ánh minh...');
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  console.log('Update completed successfully!');

  // Verify row 2
  const verifyRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A2:Q3`,
  });

  console.log('Verified Rows:');
  (verifyRes.data.values || []).forEach((r, i) => {
    console.log(`Row ${2 + i}: [STT] ${r[0]} | [PIC] ${r[1]} | [Date] ${r[2]} | [Lần] ${r[3]} | [Kênh] ${r[4]} | [FB] ${r[11]} | [IG] ${r[12]} | [Dự án] ${r[16]}`);
  });
}

insertKoc().catch(console.error);
