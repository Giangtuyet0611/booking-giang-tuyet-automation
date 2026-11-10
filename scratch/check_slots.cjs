const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));
const formulas = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formula.json', 'utf8'));

// Post slots:
// Slot 1: Col I (8) = type/platform, Col M (12) = views, Col N (13) = like, Col O (14) = comment, Col P (15) = share, Col Q (16) = save
// Slot 2: Col R (17) = type/platform, Col V (21) = views, Col W (22) = like, Col X (23) = comment, Col Y (24) = share, Col Z (25) = save
// Slot 3: Col AA (26) = type/platform, Col AE (30) = views, Col AF (31) = like, Col AG (32) = comment, Col AH (33) = share, Col AI (34) = save
// Slot 4: Col AJ (35) = type/platform, Col AN (39) = views, Col AO (40) = like, Col AP (41) = comment, Col AQ (42) = share, Col AR (43) = save
// Slot 5: Col AS (44) = type/platform, Col AW (48) = views, Col AX (49) = like, Col AY (50) = comment, Col AZ (51) = share, Col BA (52) = save

// Let's check which slots are populated across the rows
const slotsSummary = [];

for (let i = 0; i < formatted.length; i++) {
  const row = formatted[i];
  const rowUn = unformatted[i];
  const rowForm = formulas[i];

  const slots = [
    { slot: 1, typeCol: 8, viewCol: 12, likeCol: 13, cmtCol: 14, shareCol: 15 },
    { slot: 2, typeCol: 17, viewCol: 21, likeCol: 22, cmtCol: 23, shareCol: 24 },
    { slot: 3, typeCol: 26, viewCol: 30, likeCol: 31, cmtCol: 32, shareCol: 33 },
    { slot: 4, typeCol: 35, viewCol: 39, likeCol: 40, cmtCol: 41, shareCol: 42 },
    { slot: 5, typeCol: 44, viewCol: 48, likeCol: 49, cmtCol: 50, shareCol: 51 },
  ];

  const activeSlots = [];
  slots.forEach(s => {
    const typeVal = row[s.typeCol];
    const viewVal = rowUn?.[s.viewCol];
    const likeVal = rowUn?.[s.likeCol];
    if (typeVal || viewVal !== undefined || likeVal !== undefined) {
      activeSlots.push({
        slot: s.slot,
        type: typeVal,
        views: viewVal,
        viewsFormatted: row[s.viewCol],
        like: likeVal,
        cmt: rowUn?.[s.cmtCol],
        share: rowUn?.[s.shareCol]
      });
    }
  });

  // Also check if any column beyond 52 has data
  const extraCols = [];
  for (let c = 53; c < row.length; c++) {
    if (row[c] !== '' && row[c] !== undefined) {
      extraCols.push({ col: c, val: row[c] });
    }
  }

  slotsSummary.push({
    row: i + 1,
    date: row[1],
    channelG: row[6],
    totalDTT_H: rowUn?.[7],
    activeSlots,
    extraCols
  });
}

// Print rows with > 1 slot
const multiSlotRows = slotsSummary.filter(r => r.activeSlots.length > 1);
console.log(`Rows with > 1 slot: ${multiSlotRows.length}`);
multiSlotRows.forEach(r => {
  console.log(`Row ${r.row} (${r.date}, G=${r.channelG}, H=${r.totalDTT_H}): ${r.activeSlots.map(s => `[Slot ${s.slot}: ${s.type}, view=${s.views}]`).join(' | ')}`);
});

// Check if any extra cols exist
const hasExtra = slotsSummary.filter(r => r.extraCols.length > 0);
console.log(`Rows with extra cols beyond Col 52: ${hasExtra.length}`);

