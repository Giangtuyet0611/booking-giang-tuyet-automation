const fs = require('fs');

const rows = JSON.parse(fs.readFileSync('d:/Booking/scratch/early_rows.json', 'utf8'));

const targets = [
  { id: 1, name: "100 ngày chuẩn bị đám cưới", key: "100" },
  { id: 2, name: "Nọc Long", key: "Nọc Long" },
  { id: 3, name: "Hậu Phương Tour Guide", key: "Hậu Phương" },
  { id: 4, name: "Thảo Vi", key: "Thảo Vi" },
  { id: 5, name: "Quỳnh Musé", key: "Musé" },
  { id: 6, name: "10 years 1 ending", key: "10 years" },
  { id: 7, name: "Cô BTV nhỏ xíu nè", key: "BTV" },
  { id: 8, name: "Nguyễn Ngọc Bảo Như", key: "Bảo Như" },
  { id: 9, name: "Trang Hay Cười", key: "Trang Hay Cười" },
  { id: 10, name: "Chill with Phương", key: "Phương" },
  { id: 11, name: "Nguyễn Thúy An", key: "Thuý An" },
  { id: 12, name: "Cô dâu Hạnh Dung", key: "Hạnh Dung" },
  { id: 13, name: "Mèo con cute", key: "Mèo" },
  { id: 14, name: "Hằng và An", key: "Hằng" },
  { id: 15, name: "Thảo phô mai", key: "phô mai" },
  { id: 16, name: "Cô dâu My Sa", key: "Sa" },
  { id: 17, name: "Phạm Lụa", key: "Phạm Lụa" },
];

targets.forEach(t => {
  console.log(`\n=== Target #${t.id}: ${t.name} (Key: "${t.key}") ===`);
  const matches = rows.filter(r => {
    const full = `${r.chan} ${r.proj} ${r.contact} ${r.tiktok} ${r.fb}`.toLowerCase();
    return full.includes(t.key.toLowerCase());
  });
  matches.forEach(m => {
    console.log(`Row ${m.rowNum} | PIC="${m.pic}" | Channel="${m.chan}" | Status="${m.stat}" | Proj="${m.proj}"`);
  });
});
