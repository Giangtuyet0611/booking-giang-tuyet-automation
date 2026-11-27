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

const kocs = [
  {
    channelName: 'han.daily11',
    realName: 'không có',
    tier: 'Nano (1K - 10K followers)',
    field: 'Gia đình/ Nhà cửa đời sống',
    style: 'Daily Vlog/ Life Style',
    location: '',
    tiktokUrl: 'https://www.tiktok.com/@han.daily11',
    fbUrl: 'không có',
    igUrl: 'không có',
    ytUrl: 'không có',
    contact: 'lemon8-app.com/han.daily11',
    brand: 'Saga',
    project: 'Cô dâu Saga',
    pic: 'Tuyết',
    date: '27/11/2026'
  },
  {
    channelName: 'Bông iuuu 🐰',
    realName: 'Thúy Hoa',
    tier: 'Nano (1K - 10K followers)',
    field: 'Gia đình/ Nhà cửa đời sống',
    style: 'Daily Vlog/ Life Style',
    location: '',
    tiktokUrl: 'https://www.tiktok.com/@bebong3280',
    fbUrl: 'không có',
    igUrl: 'không có',
    ytUrl: 'không có',
    contact: 'không có',
    brand: 'Saga',
    project: 'Cô dâu Saga',
    pic: 'Tuyết',
    date: '27/11/2026'
  },
  {
    channelName: 'Bống Và Bin',
    realName: 'không có',
    tier: 'Nano (1K - 10K followers)',
    field: 'Couple',
    style: 'Couple',
    location: 'Hà Nội',
    tiktokUrl: 'https://www.tiktok.com/@bin.va.bong',
    fbUrl: 'không có',
    igUrl: 'không có',
    ytUrl: 'không có',
    contact: 'TikTok @Bống',
    brand: 'Saga',
    project: 'Cô dâu Saga',
    pic: 'Tuyết',
    date: '27/11/2026'
  }
];

async function run() {
  const { sheets } = getClients();

  // Điền vào các hàng trống 3, 4, 5
  const startRow = 3;
  const requests = [];

  kocs.forEach((koc, idx) => {
    const targetRowNumber = startRow + idx;
    const targetRowIndex = targetRowNumber - 1;

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
        userEnteredFormat: cellFmt('LEFT', 'CLIP'),
      },
      {
        userEnteredValue: { stringValue: koc.igUrl },
        userEnteredFormat: cellFmt('LEFT', 'CLIP'),
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
  });

  console.log(`Executing batchUpdate for ${kocs.length} KOCs...`);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  console.log('Update completed successfully!');

  // Verify rows 3-6
  const verifyRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A3:Q6`,
  });

  console.log('Verified Rows:');
  (verifyRes.data.values || []).forEach((r, i) => {
    console.log(`Row ${startRow + i}: [STT] ${r[0]} | [PIC] ${r[1]} | [Date] ${r[2]} | [Lần] ${r[3]} | [Kênh] ${r[4]} | [Dự án] ${r[16]}`);
  });
}

run().catch(console.error);
