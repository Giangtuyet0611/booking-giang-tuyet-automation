const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));
const formulas = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formula.json', 'utf8'));

// Parse Date DD/MM/YYYY
function parseDate(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  return new Date(year, month - 1, day);
}

const WEEKS = [
  { name: 'Tuần 1 (11/10 - 17/10)', start: new Date(2026, 9, 11), end: new Date(2026, 9, 17, 23, 59, 59) },
  { name: 'Tuần 2 (18/10 - 24/10)', start: new Date(2026, 9, 18), end: new Date(2026, 9, 24, 23, 59, 59) },
  { name: 'Tuần 3 (25/10 - 31/10)', start: new Date(2026, 9, 25), end: new Date(2026, 9, 31, 23, 59, 59) },
  { name: 'Tuần 4 (01/11 - 07/11)', start: new Date(2026, 10, 1), end: new Date(2026, 10, 7, 23, 59, 59) }
];

const slotDefs = [
  { s: 1, typeCol: 8, viewCol: 12, likeCol: 13, cmtCol: 14, shareCol: 15, saveCol: 16 },
  { s: 2, typeCol: 17, viewCol: 21, likeCol: 22, cmtCol: 23, shareCol: 24, saveCol: 25 },
  { s: 3, typeCol: 26, viewCol: 30, likeCol: 31, cmtCol: 32, shareCol: 33, saveCol: 34 },
  { s: 4, typeCol: 35, viewCol: 39, likeCol: 40, cmtCol: 41, shareCol: 42, saveCol: 43 },
  { s: 5, typeCol: 44, viewCol: 48, likeCol: 49, cmtCol: 50, shareCol: 51, saveCol: 52 },
  { s: 6, typeCol: 53, viewCol: 57, likeCol: 58, cmtCol: 59, shareCol: 60, saveCol: 61 },
  { s: 7, typeCol: 62, viewCol: 66, likeCol: 67, cmtCol: 68, shareCol: 69, saveCol: 70 },
];

function classifySlot(rawType, channelG) {
  if (!rawType) return null;
  const t = rawType.trim();
  const lower = t.toLowerCase();

  // TikTok
  if (lower.includes('tiktok')) {
    return 'Tiktok';
  }

  // Threads
  if (lower.includes('threads') || channelG === 'Threads') {
    return 'Threads';
  }

  // Youtube
  if (lower.includes('youtube')) {
    return 'Youtube';
  }

  // FB / IG Reels
  if (lower.includes('reels')) {
    return 'FB/IG Reels';
  }

  // FB / IG Post (static/image/post)
  if (lower.includes('post') || lower.includes('facebook') || lower.includes('facbook') || lower.includes('instagram')) {
    return 'FB/IG Post';
  }

  return 'Unknown: ' + t;
}

const results = WEEKS.map(w => ({
  week: w.name,
  rowCount: 0,
  rowsByChannelG: {},
  // Counts by slot classification
  postsByType: {
    'FB/IG Post': 0,
    'FB/IG Reels': 0,
    'Tiktok': 0,
    'Threads': 0,
    'Youtube': 0
  },
  detailedTypes: {},
  // Views
  viewsBySlotType: {
    'FB/IG Reels': 0,
    'Tiktok': 0,
    'FB/IG Post': 0,
    'Threads': 0,
    'Youtube': 0
  },
  // Interaction points (from Col H)
  dttByChannelG: {
    'Tiktok': 0,
    'FB / IG': 0,
    'Threads': 0,
    'Youtube': 0
  },
  // Interaction points calculated from individual slots
  dttBySlotType: {
    'FB/IG Reels': 0,
    'FB/IG Post': 0,
    'Tiktok': 0,
    'Threads': 0,
    'Youtube': 0
  },
  totalDTT_ColH: 0,
  rows: []
}));

for (let r = 0; r < formatted.length; r++) {
  const rowF = formatted[r];
  const rowU = unformatted[r];
  const dateStr = rowF[1];
  const date = parseDate(dateStr);
  if (!date) continue;

  const weekObj = WEEKS.findIndex(w => date >= w.start && date <= w.end);
  if (weekObj === -1) {
    console.log(`Row ${r + 1} date ${dateStr} out of range!`);
    continue;
  }

  const res = results[weekObj];
  res.rowCount++;

  const channelG = (rowF[6] || '').trim();
  res.rowsByChannelG[channelG] = (res.rowsByChannelG[channelG] || 0) + 1;

  const dttColH = typeof rowU?.[7] === 'number' ? rowU[7] : parseFloat(rowF[7] || 0) || 0;
  res.totalDTT_ColH += dttColH;
  res.dttByChannelG[channelG] = (res.dttByChannelG[channelG] || 0) + dttColH;

  const rowSlots = [];
  slotDefs.forEach(slot => {
    const rawType = (rowF[slot.typeCol] || '').trim();
    if (!rawType) return;

    const classification = classifySlot(rawType, channelG);
    if (res.postsByType[classification] !== undefined) {
      res.postsByType[classification]++;
    } else {
      res.postsByType[classification] = 1;
    }

    res.detailedTypes[rawType] = (res.detailedTypes[rawType] || 0) + 1;

    // View
    const v = typeof rowU?.[slot.viewCol] === 'number' ? rowU[slot.viewCol] : 0;
    if (res.viewsBySlotType[classification] !== undefined) {
      res.viewsBySlotType[classification] += v;
    }

    // Interaction point for this slot: Like + Comment*10 + Share*30
    const like = typeof rowU?.[slot.likeCol] === 'number' ? rowU[slot.likeCol] : 0;
    const cmt = typeof rowU?.[slot.cmtCol] === 'number' ? rowU[slot.cmtCol] : 0;
    const share = typeof rowU?.[slot.shareCol] === 'number' ? rowU[slot.shareCol] : 0;
    const slotDTT = like + cmt * 10 + share * 30;

    if (res.dttBySlotType[classification] !== undefined) {
      res.dttBySlotType[classification] += slotDTT;
    }

    rowSlots.push({
      slot: slot.s,
      rawType,
      classification,
      view: v,
      like,
      cmt,
      share,
      slotDTT
    });
  });

  res.rows.push({
    rowIdx: r + 1,
    date: dateStr,
    koc: rowF[3],
    channelG,
    dttColH,
    slots: rowSlots
  });
}

console.log(JSON.stringify(results.map(r => ({
  week: r.week,
  rowCount: r.rowCount,
  rowsByChannelG: r.rowsByChannelG,
  postsByType: r.postsByType,
  detailedTypes: r.detailedTypes,
  viewsBySlotType: r.viewsBySlotType,
  dttByChannelG: r.dttByChannelG,
  dttBySlotType: r.dttBySlotType,
  totalDTT_ColH: r.totalDTT_ColH
})), null, 2));

