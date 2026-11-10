const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));

function parseDate(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
}

const WEEKS = [
  { id: 'W1', name: 'Tuần 11/10 - 17/10', start: new Date(2026, 9, 11), end: new Date(2026, 9, 17, 23, 59, 59) },
  { id: 'W2', name: 'Tuần 18/10 - 24/10', start: new Date(2026, 9, 18), end: new Date(2026, 9, 24, 23, 59, 59) },
  { id: 'W3', name: 'Tuần 25/10 - 31/10', start: new Date(2026, 9, 25), end: new Date(2026, 9, 31, 23, 59, 59) },
  { id: 'W4', name: 'Tuần 01/11 - 07/11', start: new Date(2026, 10, 1), end: new Date(2026, 10, 7, 23, 59, 59) }
];

function classifySlot(rawType) {
  if (!rawType) return null;
  const t = rawType.trim().toLowerCase();
  if (t.includes('tiktok')) return 'Tiktok';
  if (t.includes('reels')) return 'FB/IG Reels';
  if (t.includes('post') || t.includes('facebook') || t.includes('instagram')) return 'FB/IG Post';
  return 'Other';
}

const report = WEEKS.map(w => ({
  week: w.name,
  kocList: [],
  rows_total: 0,
  post_FB_IG: 0,
  post_FB_IG_Reels: 0,
  post_Tiktok: 0,
  total_posts: 0,
  view_FB_IG_Reels: 0,
  view_Tiktok: 0,
  dtt_Tiktok: 0,
  dtt_FB_IG: 0,
  details: []
}));

for (let r = 0; r < formatted.length; r++) {
  const koc = (formatted[r][3] || '').trim();
  if (!/cô dâu saga/i.test(koc)) continue;

  const rowF = formatted[r];
  const rowU = unformatted[r];
  const dateStr = rowF[1];
  const date = parseDate(dateStr);
  if (!date) continue;

  const wIdx = WEEKS.findIndex(w => date >= w.start && date <= w.end);
  if (wIdx === -1) continue;

  const rep = report[wIdx];
  rep.rows_total++;
  if (!rep.kocList.includes(koc)) rep.kocList.push(koc);

  // Slot 1
  const rawType = (rowF[8] || '').trim();
  const cls = classifySlot(rawType);
  const view = typeof rowU?.[12] === 'number' ? rowU[12] : 0;
  const like = typeof rowU?.[13] === 'number' ? rowU[13] : 0;
  const cmt = typeof rowU?.[14] === 'number' ? rowU[14] : 0;
  const share = typeof rowU?.[15] === 'number' ? rowU[15] : 0;
  const dtt = like + cmt * 10 + share * 30;

  if (cls) {
    rep.total_posts++;
    if (cls === 'FB/IG Post') {
      rep.post_FB_IG++;
      rep.dtt_FB_IG += dtt;
    } else if (cls === 'FB/IG Reels') {
      rep.post_FB_IG_Reels++;
      rep.view_FB_IG_Reels += view;
      rep.dtt_FB_IG += dtt;
    } else if (cls === 'Tiktok') {
      rep.post_Tiktok++;
      rep.view_Tiktok += view;
      rep.dtt_Tiktok += dtt;
    }
  }

  rep.details.push({
    rowIdx: r + 1,
    date: dateStr,
    koc,
    channelG: rowF[6],
    type: rawType,
    cls,
    view,
    like,
    cmt,
    share,
    dtt,
    colH: rowU?.[7]
  });
}

console.log(JSON.stringify(report, null, 2));

