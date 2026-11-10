const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

const DEALS = [
  {
    id: 1,
    title: "100 ngày chuẩn bị đám cưới",
    searchKeys: ["100 ngày chuẩn bị đám cưới", "dcuiling2962", "1HcJbV3YAR"],
    tiktok: "https://www.tiktok.com/@dcuiling2962",
    facebook: "https://www.facebook.com/share/1HcJbV3YAR/?mibextid=wwXIfr",
    instagram: "",
    giftCount: 1,
    productCodes: "71924-TGYLTG-2L",
    totalProductCost: 9160000,
    cast: 0
  },
  {
    id: 2,
    title: "Nọc Long chuẩn bị đám cưới",
    searchKeys: ["Nọc Long", "noclong.daily", "1NAsLrXGVU"],
    tiktok: "https://www.tiktok.com/@noclong.daily",
    facebook: "https://www.facebook.com/share/1NAsLrXGVU/?mibextid=wwXIfr",
    instagram: "",
    giftCount: 1,
    productCodes: "53442-SVMWSV-2A",
    totalProductCost: 6680000,
    cast: 0
  },
  {
    id: 3,
    title: "Hậu Phương Tour Guide",
    searchKeys: ["Hậu Phương", "odaychungminhyeunhau", "1AJPxKoLqd", "ngocbicc1110"],
    tiktok: "https://www.tiktok.com/@odaychungminhyeunhau",
    facebook: "https://www.facebook.com/share/1AJPxKoLqd/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/ngocbicc1110/",
    giftCount: 1,
    productCodes: "72109-SVMWSV-2",
    totalProductCost: 8030000,
    cast: 0
  },
  {
    id: 4,
    title: "Thảo Vi",
    searchKeys: ["viihihii_", "1DCwSmnFwh", "Thảo Vi"],
    tiktok: "https://www.tiktok.com/@viihihii_",
    facebook: "https://www.facebook.com/share/1DCwSmnFwh/?mibextid=wwXIfr",
    instagram: "",
    giftCount: 1,
    productCodes: "53229-RGMWRG-4",
    totalProductCost: 8610000,
    cast: 0
  },
  {
    id: 5,
    title: "Quỳnh Musé",
    searchKeys: ["bemuseriview", "musemolly", "Quỳnh Musé", "Quỳnh Musé"],
    tiktok: "https://www.tiktok.com/@bemuseriview",
    facebook: "https://www.facebook.com/musemolly",
    instagram: "https://www.instagram.com/bemuseriview",
    giftCount: 1,
    productCodes: "71836-SVSVSV-2",
    totalProductCost: 6170000,
    cast: 0
  },
  {
    id: 6,
    title: "10 years 1 ending",
    searchKeys: ["10 years 1 ending", "10.years.1.ending", "19dMKQK3N6"],
    tiktok: "https://www.tiktok.com/@10.years.1.ending",
    facebook: "https://www.facebook.com/share/19dMKQK3N6/?mibextid=wwXIfr",
    instagram: "",
    giftCount: 1,
    productCodes: "53229-SVMWSV-7",
    totalProductCost: 8610000,
    cast: 0
  },
  {
    id: 7,
    title: "Cô BTV nhỏ xíu nè",
    searchKeys: ["Cô BTV nhỏ xíu nè", "btvqueanh", "nguyenqueanh68"],
    tiktok: "https://www.tiktok.com/@btvqueanh",
    facebook: "https://www.facebook.com/nguyenqueanh68",
    instagram: "",
    giftCount: 1,
    productCodes: "54295-RGPKRG-2",
    totalProductCost: 8570000,
    cast: 0
  },
  {
    id: 8,
    title: "Nguyễn Ngọc Bảo Như",
    searchKeys: ["Bảo Như", "baebaonhu", "nbaonnhu", "Nguyễn Ngọc Bảo Như"],
    tiktok: "https://www.tiktok.com/@baebaonhu",
    facebook: "https://www.facebook.com/nbaonnhu",
    instagram: "",
    giftCount: 2,
    productCodes: "53767-CGMWCG-2 ; K002.455.641.50.10.03",
    totalProductCost: 15220000,
    cast: 0
  },
  {
    id: 9,
    title: "Trang Hay Cười",
    searchKeys: ["Trang Hay Cười", "trahy0511", "tranhuyen.trang.752", "__trahy.hehee"],
    tiktok: "https://www.tiktok.com/@trahy0511",
    facebook: "https://www.facebook.com/tranhuyen.trang.752",
    instagram: "https://www.instagram.com/__trahy.hehee",
    giftCount: 1,
    productCodes: "72109-SVMWSV-2",
    totalProductCost: 8030000,
    cast: 0
  },
  {
    id: 10,
    title: "Chill with Phương",
    searchKeys: ["Chill with Phương", "dphuong0311", "1CFibxWCh2"],
    tiktok: "https://www.tiktok.com/@dphuong0311",
    facebook: "https://www.facebook.com/share/1CFibxWCh2/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/dphuong0311/?hl=en",
    giftCount: 1,
    productCodes: "71959-RGRGTTR-2",
    totalProductCost: 8950000,
    cast: 0
  },
  {
    id: 11,
    title: "Nguyễn Thúy An",
    searchKeys: ["Nguyễn Thúy An", "nguyenthuyan.97", "nguyen.thuy.an.939910", "Ricky Kun"],
    tiktok: "https://www.tiktok.com/@nguyenthuyan.97",
    facebook: "https://www.facebook.com/nguyen.thuy.an.939910",
    instagram: "",
    giftCount: 1,
    productCodes: "53375-SVMWBK-2",
    totalProductCost: 14910000,
    cast: 0
  },
  {
    id: 12,
    title: "Cô dâu Hạnh Dung",
    searchKeys: ["Hạnh Dung", "hanh.dung.89118", "iuduong.dt"],
    tiktok: "https://www.tiktok.com/@iuduong.dt",
    facebook: "https://www.facebook.com/hanh.dung.89118/",
    instagram: "",
    giftCount: 2,
    productCodes: "53766-SVSVSV-2 ; K008.503.17.2.05.03.01",
    totalProductCost: 14000000,
    cast: 0
  },
  {
    id: 13,
    title: "Mèo con cute",
    searchKeys: ["Mèo con cute", "_lloan61", "kimloan61"],
    tiktok: "https://www.tiktok.com/@_lloan61",
    facebook: "https://www.facebook.com/kimloan61?locale=vi_VN",
    instagram: "",
    giftCount: 1,
    productCodes: "54297-SVWTSV-2",
    totalProductCost: 9120000,
    cast: 0
  },
  {
    id: 14,
    title: "KOC Hằng và An",
    searchKeys: ["Hằng và An", ".hang.an", "19cQTZV8iu"],
    tiktok: "https://www.tiktok.com/@.hang.an",
    facebook: "https://www.facebook.com/share/19cQTZV8iu/",
    instagram: "",
    giftCount: 1,
    productCodes: "71959-GPGPGP-2",
    totalProductCost: 8540000,
    cast: 0
  },
  {
    id: 15,
    title: "Thảo phô mai",
    searchKeys: ["Thảo phô mai", "hellu.thaophomai", "nickysang1996"],
    tiktok: "https://www.tiktok.com/@hellu.thaophomai",
    facebook: "https://www.facebook.com/nickysang1996/",
    instagram: "",
    giftCount: 1,
    productCodes: "53442-GPMWGP-2A",
    totalProductCost: 7150000,
    cast: 0
  },
  {
    id: 16,
    title: "Cô dâu My Sa",
    searchKeys: ["My Sa", "samie.cutie", "samyneee", "emwaiesei"],
    tiktok: "https://www.tiktok.com/@samie.cutie",
    facebook: "https://www.facebook.com/samyneee",
    instagram: "https://www.instagram.com/emwaiesei/",
    giftCount: 1,
    productCodes: "71959-RGRGTTR-2",
    totalProductCost: 8950000,
    cast: 0
  },
  {
    id: 17,
    title: "Phạm Lụa",
    searchKeys: ["Phạm Lụa", "phammluaa", "buu.tatoo"],
    tiktok: "https://www.tiktok.com/@phammluaa",
    facebook: "https://www.facebook.com/buu.tatoo",
    instagram: "https://www.instagram.com/phammluaa",
    giftCount: 1,
    productCodes: "71836-SVSVSV-2",
    totalProductCost: 6170000,
    cast: 0
  }
];

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function findMatches() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';
  const res = await s.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A:AA`,
  });

  const rows = res.data.values || [];
  console.log(`Loaded ${rows.length} rows.`);

  const matchResults = [];

  for (const deal of DEALS) {
    const candidateRows = [];

    const normKeys = deal.searchKeys.map(k => normalize(k));

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;
      const rowFullText = row.join(' ');
      const normRow = normalize(rowFullText);

      // Check if any search key matches
      for (const k of deal.searchKeys) {
        const nk = normalize(k);
        if (nk.length >= 3 && normRow.includes(nk)) {
          candidateRows.push({
            rowIdx: r + 1,
            matchedKey: k,
            pic: row[1] || '',
            channel: row[4] || '',
            name: row[5] || '',
            tiktok: row[10] || '',
            facebook: row[11] || '',
            status: row[18] || '',
            rawRow: row
          });
          break;
        }
      }
    }

    matchResults.push({
      deal,
      candidateRows
    });
  }

  // Print summary
  for (const res of matchResults) {
    console.log(`\n======================================================`);
    console.log(`Deal #${res.deal.id}: "${res.deal.title}"`);
    console.log(`Found ${res.candidateRows.length} candidates:`);
    res.candidateRows.forEach(c => {
      console.log(`  Row ${c.rowIdx}: PIC="${c.pic}" | Channel="${c.channel}" | Name="${c.name}" | Status="${c.status}"`);
      if (c.tiktok) console.log(`      TikTok: ${c.tiktok}`);
      if (c.facebook) console.log(`      Facebook: ${c.facebook}`);
    });
  }

  fs.writeFileSync('d:/Booking/scratch/match_results.json', JSON.stringify(matchResults, null, 2), 'utf8');
}

findMatches().catch(console.error);
