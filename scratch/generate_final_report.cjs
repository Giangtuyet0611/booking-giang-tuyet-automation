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

const slotDefs = [
  { s: 1, typeCol: 8, viewCol: 12, likeCol: 13, cmtCol: 14, shareCol: 15 },
  { s: 2, typeCol: 17, viewCol: 21, likeCol: 22, cmtCol: 23, shareCol: 24 },
  { s: 3, typeCol: 26, viewCol: 30, likeCol: 31, cmtCol: 32, shareCol: 33 },
  { s: 4, typeCol: 35, viewCol: 39, likeCol: 40, cmtCol: 41, shareCol: 42 },
  { s: 5, typeCol: 44, viewCol: 48, likeCol: 49, cmtCol: 50, shareCol: 51 },
  { s: 6, typeCol: 53, viewCol: 57, likeCol: 58, cmtCol: 59, shareCol: 60 },
  { s: 7, typeCol: 62, viewCol: 66, likeCol: 67, cmtCol: 68, shareCol: 69 },
];

function classifySlot(rawType, channelG) {
  if (!rawType) return null;
  const t = rawType.trim();
  const lower = t.toLowerCase();

  if (lower.includes('tiktok')) return 'Tiktok';
  if (lower.includes('threads') || channelG === 'Threads') return 'Threads';
  if (lower.includes('youtube')) return 'Youtube';
  if (lower.includes('reels')) return 'FB/IG Reels';
  if (lower.includes('post') || lower.includes('facebook') || lower.includes('facbook') || lower.includes('instagram')) return 'FB/IG Post';
  return 'Other';
}

const report = WEEKS.map(w => ({
  week: w.name,
  // Detailed slot counts
  post_FB_IG: 0,
  post_FB_IG_Reels: 0,
  post_Tiktok: 0,
  post_Threads: 0,
  post_Youtube: 0,
  total_posts: 0,

  // Row counts
  rows_total: 0,
  rows_FB_IG: 0,
  rows_Tiktok: 0,
  rows_Threads: 0,
  rows_Youtube: 0,

  // Views
  view_FB_IG_Reels: 0,
  view_Tiktok: 0,
  view_FB_IG_Post: 0,
  total_views: 0,

  // Điểm tương tác (Chuẩn theo slot bài đăng thực tế)
  dtt_Tiktok_by_slot: 0,
  dtt_FB_IG_by_slot: 0, // bao gồm cả Reels và Post FB/IG
  dtt_FB_IG_Reels_slot: 0,
  dtt_FB_IG_Post_slot: 0,
  total_dtt_by_slot: 0,

  // Điểm tương tác (Theo Cột G & Cột H trên Sheet)
  dtt_Tiktok_colH: 0,
  dtt_FB_IG_colH: 0,
  total_dtt_colH: 0,
}));

for (let r = 0; r < formatted.length; r++) {
  const rowF = formatted[r];
  const rowU = unformatted[r];
  const dateStr = rowF[1];
  const date = parseDate(dateStr);
  if (!date) continue;

  const wIdx = WEEKS.findIndex(w => date >= w.start && date <= w.end);
  if (wIdx === -1) continue;

  const rep = report[wIdx];
  rep.rows_total++;

  const channelG = (rowF[6] || '').trim();
  if (channelG === 'FB / IG') rep.rows_FB_IG++;
  else if (channelG === 'Tiktok') rep.rows_Tiktok++;
  else if (channelG === 'Threads') rep.rows_Threads++;
  else if (channelG === 'Youtube') rep.rows_Youtube++;

  const dttColH = typeof rowU?.[7] === 'number' ? rowU[7] : (parseFloat(rowF[7]) || 0);
  rep.total_dtt_colH += dttColH;
  if (channelG === 'Tiktok') rep.dtt_Tiktok_colH += dttColH;
  if (channelG === 'FB / IG') rep.dtt_FB_IG_colH += dttColH;

  // Process slots
  slotDefs.forEach(slot => {
    const rawType = (rowF[slot.typeCol] || '').trim();
    if (!rawType) return;

    const cls = classifySlot(rawType, channelG);
    const view = typeof rowU?.[slot.viewCol] === 'number' ? rowU[slot.viewCol] : 0;
    const like = typeof rowU?.[slot.likeCol] === 'number' ? rowU[slot.likeCol] : 0;
    const cmt = typeof rowU?.[slot.cmtCol] === 'number' ? rowU[slot.cmtCol] : 0;
    const share = typeof rowU?.[slot.shareCol] === 'number' ? rowU[slot.shareCol] : 0;
    const dtt = like + cmt * 10 + share * 30;

    rep.total_posts++;
    rep.total_views += view;
    rep.total_dtt_by_slot += dtt;

    if (cls === 'FB/IG Post') {
      rep.post_FB_IG++;
      rep.view_FB_IG_Post += view;
      rep.dtt_FB_IG_Post_slot += dtt;
      rep.dtt_FB_IG_by_slot += dtt;
    } else if (cls === 'FB/IG Reels') {
      rep.post_FB_IG_Reels++;
      rep.view_FB_IG_Reels += view;
      rep.dtt_FB_IG_Reels_slot += dtt;
      rep.dtt_FB_IG_by_slot += dtt;
    } else if (cls === 'Tiktok') {
      rep.post_Tiktok++;
      rep.view_Tiktok += view;
      rep.dtt_Tiktok_by_slot += dtt;
    } else if (cls === 'Threads') {
      rep.post_Threads++;
    } else if (cls === 'Youtube') {
      rep.post_Youtube++;
    }
  });
}

console.log(JSON.stringify(report, null, 2));

