const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

async function inspectTargetRows() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';
  const res = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A:AA`,
  });

  const rows = res.data.values || [];
  console.log(`Loaded ${rows.length} rows.`);

  // Let's search all rows for exact tokens from each of the unresolved deals:
  // Deal 4: Thảo Vi - tiktok: @viihihii_
  // Deal 11: Nguyễn Thúy An - tiktok: @nguyenthuyan.97, Ricky Kun
  // Deal 12: Cô dâu Hạnh Dung - tiktok: @iuduong.dt, hanh.dung.89118
  // Deal 13: Mèo con cute - tiktok: @_lloan61, kimloan61
  // Deal 14: KOC Hằng và An - tiktok: @.hang.an
  // Deal 16: Cô dâu My Sa - tiktok: @samie.cutie, samyneee, emwaiesei
  // Deal 17: Phạm Lụa - Row 494 (Tuyết) or Row 8950?

  const specificSearches = [
    { deal: 4, query: "viihihii" },
    { deal: 4, query: "1DCwSmnFwh" },
    { deal: 11, query: "nguyenthuyan" },
    { deal: 11, query: "Ricky Kun" },
    { deal: 12, query: "iuduong" },
    { deal: 12, query: "Hạnh Dung" },
    { deal: 13, query: "lloan61" },
    { deal: 13, query: "Mèo con cute" },
    { deal: 14, query: "hang.an" },
    { deal: 14, query: "Hằng và An" },
    { deal: 16, query: "samie" },
    { deal: 16, query: "samyneee" },
    { deal: 16, query: "My Sa" },
    { deal: 17, query: "phammluaa" },
    { deal: 17, query: "buu.tatoo" },
  ];

  for (const s of specificSearches) {
    console.log(`\n--- Searching for "${s.query}" (Deal ${s.deal}) ---`);
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const text = (row || []).join(' ');
      if (text.toLowerCase().includes(s.query.toLowerCase())) {
        console.log(`Row ${r + 1} | PIC="${row[1]}" | Channel="${row[4]}" | Name="${row[5]}" | Contact="${row[14]}" | Project="${row[16]}" | Status="${row[18]}"`);
      }
    }
  }

  // Also list all rows of Thanh Hà with "Cô dâu Saga"
  console.log(`\n--- All rows of Thanh Hà with Project 'Cô dâu Saga' or similar ---`);
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row[1] === 'Thanh Hà') {
      const proj = row[16] || '';
      const chan = row[4] || '';
      const stat = row[18] || '';
      if (/cô dâu|saga/i.test(proj) || /đã chốt/i.test(stat)) {
        console.log(`Row ${r + 1}: Channel="${chan}" | Status="${stat}" | Project="${proj}"`);
      }
    }
  }
}

inspectTargetRows().catch(console.error);
