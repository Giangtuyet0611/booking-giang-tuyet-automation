const { google } = require('googleapis');
const fs = require('fs');

const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });

const UPDATES = [
  {
    row: 307,
    name: "100 ngày chuẩn bị đám cưới",
    tiktok: "https://www.tiktok.com/@dcuiling2962",
    fb: "https://www.facebook.com/share/1HcJbV3YAR/?mibextid=wwXIfr",
    ig: "",
    giftCount: 1,
    products: "71924-TGYLTG-2L",
    cost: 9160000,
    cast: 0
  },
  {
    row: 1040,
    name: "Nọc Long chuẩn bị đám cưới",
    tiktok: "https://www.tiktok.com/@noclong.daily",
    fb: "https://www.facebook.com/share/1NAsLrXGVU/?mibextid=wwXIfr",
    ig: "",
    giftCount: 1,
    products: "53442-SVMWSV-2A",
    cost: 6680000,
    cast: 0
  },
  {
    row: 1063,
    name: "Hậu Phương Tour Guide",
    tiktok: "https://www.tiktok.com/@odaychungminhyeunhau",
    fb: "https://www.facebook.com/share/1AJPxKoLqd/?mibextid=wwXIfr",
    ig: "https://www.instagram.com/ngocbicc1110/",
    giftCount: 1,
    products: "72109-SVMWSV-2",
    cost: 8030000,
    cast: 0
  },
  {
    row: 685,
    name: "Quỳnh Musé",
    tiktok: "https://www.tiktok.com/@bemuseriview",
    fb: "https://www.facebook.com/musemolly",
    ig: "https://www.instagram.com/bemuseriview",
    giftCount: 1,
    products: "71836-SVSVSV-2",
    cost: 6170000,
    cast: 0
  },
  {
    row: 306,
    name: "10 years 1 ending",
    tiktok: "https://www.tiktok.com/@10.years.1.ending",
    fb: "https://www.facebook.com/share/19dMKQK3N6/?mibextid=wwXIfr",
    ig: "",
    giftCount: 1,
    products: "53229-SVMWSV-7",
    cost: 8610000,
    cast: 0
  },
  {
    row: 279,
    name: "Cô BTV nhỏ xíu nè",
    tiktok: "https://www.tiktok.com/@btvqueanh",
    fb: "https://www.facebook.com/nguyenqueanh68",
    ig: "",
    giftCount: 1,
    products: "54295-RGPKRG-2",
    cost: 8570000,
    cast: 0
  },
  {
    row: 416,
    name: "Nguyễn Ngọc Bảo Như",
    tiktok: "https://www.tiktok.com/@baebaonhu",
    fb: "https://www.facebook.com/nbaonnhu",
    ig: "",
    giftCount: 2,
    products: "53767-CGMWCG-2 ; K002.455.641.50.10.03",
    cost: 15220000,
    cast: 0
  },
  {
    row: 305,
    name: "Trang Hay Cười",
    tiktok: "https://www.tiktok.com/@trahy0511",
    fb: "https://www.facebook.com/tranhuyen.trang.752",
    ig: "https://www.instagram.com/__trahy.hehee",
    giftCount: 1,
    products: "72109-SVMWSV-2",
    cost: 8030000,
    cast: 0
  },
  {
    row: 1066,
    name: "chill with Phương",
    tiktok: "https://www.tiktok.com/@dphuong0311",
    fb: "https://www.facebook.com/share/1CFibxWCh2/?mibextid=wwXIfr",
    ig: "https://www.instagram.com/dphuong0311/?hl=en",
    giftCount: 1,
    products: "71959-RGRGTTR-2",
    cost: 8950000,
    cast: 0
  },
  {
    row: 977,
    name: "Á hậu Nguyễn Thuý An",
    tiktok: "https://www.tiktok.com/@nguyenthuyan.97",
    fb: "https://www.facebook.com/nguyen.thuy.an.939910",
    ig: "",
    giftCount: 1,
    products: "53375-SVMWBK-2",
    cost: 14910000,
    cast: 0
  },
  {
    row: 2463,
    name: "Cô dâu Hạnh Dung (Kẻ săn hồng hài nhi)",
    tiktok: "https://www.tiktok.com/@iuduong.dt",
    fb: "https://www.facebook.com/hanh.dung.89118/",
    ig: "",
    giftCount: 2,
    products: "53766-SVSVSV-2 ; K008.503.17.2.05.03.01",
    cost: 14000000,
    cast: 0
  },
  {
    row: 592,
    name: "Mèo Con Cute",
    tiktok: "https://www.tiktok.com/@_lloan61",
    fb: "https://www.facebook.com/kimloan61?locale=vi_VN",
    ig: "",
    giftCount: 1,
    products: "54297-SVWTSV-2",
    cost: 9120000,
    cast: 0
  },
  {
    row: 1037,
    name: "Hằng ☋ An",
    tiktok: "https://www.tiktok.com/@.hang.an",
    fb: "https://www.facebook.com/share/19cQTZV8iu/",
    ig: "",
    giftCount: 1,
    products: "71959-GPGPGP-2",
    cost: 8540000,
    cast: 0
  },
  {
    row: 1099,
    name: "hellu thaophomai",
    tiktok: "https://www.tiktok.com/@hellu.thaophomai",
    fb: "https://www.facebook.com/nickysang1996/",
    ig: "",
    giftCount: 1,
    products: "53442-GPMWGP-2A",
    cost: 7150000,
    cast: 0
  },
  {
    row: 494,
    name: "Phạm Lụa",
    tiktok: "https://www.tiktok.com/@phammluaa",
    fb: "https://www.facebook.com/buu.tatoo",
    ig: "https://www.instagram.com/phammluaa",
    giftCount: 1,
    products: "71836-SVSVSV-2",
    cost: 6170000,
    cast: 0
  }
];

async function runBatch() {
  const spreadsheetId = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const tabName = 'Data KOC (11/2026)';

  const data = [];

  for (const u of UPDATES) {
    const r = u.row;
    // 1. Column B: PIC -> Tuyết
    data.push({
      range: `'${tabName}'!B${r}`,
      values: [['Tuyết']]
    });

    // 2. Column K: TikTok, Column L: FB, Column M: IG
    if (u.tiktok || u.fb || u.ig) {
      if (u.ig) {
        data.push({
          range: `'${tabName}'!K${r}:M${r}`,
          values: [[u.tiktok || '', u.fb || '', u.ig || '']]
        });
      } else {
        data.push({
          range: `'${tabName}'!K${r}:L${r}`,
          values: [[u.tiktok || '', u.fb || '']]
        });
      }
    }

    // 3. Column S: Trạng thái -> 'Đã chốt'
    data.push({
      range: `'${tabName}'!S${r}`,
      values: [['Đã chốt']]
    });

    // 4. Column U: Số SP, V: Mã SP, W: Tổng chi phí SP
    data.push({
      range: `'${tabName}'!U${r}:W${r}`,
      values: [[u.giftCount, u.products, u.cost]]
    });

    // 5. Column Y: Tổng cast -> 0
    data.push({
      range: `'${tabName}'!Y${r}`,
      values: [[u.cast]]
    });
  }

  console.log(`Sending batchUpdate with ${data.length} ranges...`);
  const res = await s.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data
    }
  });

  console.log('Batch update success:', {
    totalUpdatedRows: res.data.totalUpdatedRows,
    totalUpdatedCells: res.data.totalUpdatedCells
  });
}

runBatch().catch(console.error);
