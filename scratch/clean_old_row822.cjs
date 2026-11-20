const { getClients } = require('../src/lib/google.cjs');

async function cleanOldSheetRow822() {
  const { sheets } = getClients();

  const spreadsheetId = '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0';
  const range = `'SL materials - Saga v1'!A822:J822`;

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range
  });
  console.log(`Đã xóa sạch dòng 822 tại sheet cũ: ${range}`);
}

cleanOldSheetRow822().catch(e => console.error(e));

