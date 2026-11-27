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

const newKocs = [
  {
    channelName: 'Thuong9x sắp lấy chồng Tháng 1',
    realName: 'Thương',
    tier: 'Nano (1K - 10K followers)',
    field: 'Gia đình/ Nhà cửa đời sống',
    style: 'Daily Vlog/ Life Style',
    location: '',
    tiktokUrl: 'https://www.tiktok.com/@chiso.nguyen',
    fbUrl: 'không có',
    igUrl: 'không có',
    ytUrl: 'không có',
    contact: 'không có',
    brand: 'Saga',
    project: 'Cô dâu Saga',
    pic: 'Tuyết',
    date: '23/11/2026'
  },
  {
    channelName: 'Anh Thơ M72 💗',
    realName: 'Anh Thơ',
    tier: 'Macro (300K đến 1 TRIỆU followers)',
    field: 'Nghệ sĩ/ Người nổi tiếng',
    style: 'Daily Vlog/ Life Style',
    location: '',
    tiktokUrl: 'https://www.tiktok.com/@anhthomet72',
    fbUrl: 'không có',
    igUrl: 'không có',
    ytUrl: 'không có',
    contact: 'anhtho63work@gmail.com',
    brand: 'Saga',
    project: 'Cô dâu Saga',
    pic: 'Tuyết',
    date: '23/11/2026'
  }
];

async function insertBatch4() {
  const { sheets } = getClients();

  const requests = [];

  // Chèn 2 hàng mới tại vị trí Hàng 2 (startIndex 1, endIndex 3)
  requests.push({
    insertDimension: {
      range: {
        sheetId: sheetId,
        dimension: 'ROWS',
        startIndex: 1,
        endIndex: 3,
      },
      inheritFromBefore: false,
    },
  });

  // Format và điền dữ liệu cho 2 hàng: Hàng 2, 3
  newKocs.forEach((koc, idx) => {
    const targetRowNumber = 2 + idx;
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

  console.log(`Executing batchUpdate for ${newKocs.length} new KOCs...`);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  console.log('Update completed successfully!');

  // Verify rows 2-5
  const verifyRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A2:Q5`,
  });

  console.log('Verified Rows:');
  (verifyRes.data.values || []).forEach((r, i) => {
    console.log(`Row ${2 + i}: [STT] ${r[0]} | [PIC] ${r[1]} | [Date] ${r[2]} | [Lần] ${r[3]} | [Kênh] ${r[4]} | [Dự án] ${r[16]}`);
  });
}

insertBatch4().catch(console.error);
