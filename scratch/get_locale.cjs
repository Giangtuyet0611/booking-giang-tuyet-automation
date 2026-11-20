const { getClients } = require('../src/lib/google.cjs');

async function getSpreadsheetLocale() {
  const { sheets } = getClients();

  const res = await sheets.spreadsheets.get({
    spreadsheetId: '1ShViO4aj-nHXS8-OTmYd56Y-KzImHSvpgHE7DqPgCO0',
    fields: 'properties.locale'
  });
  console.log('Locale:', res.data.properties.locale);
}

getSpreadsheetLocale().catch(e => console.error(e));

