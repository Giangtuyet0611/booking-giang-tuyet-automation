const fs = require('fs');

const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
const unformatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_unformatted.json', 'utf8'));

// Check each row: what is Col G, and what are the types in the slots?
for (let i = 0; i < formatted.length; i++) {
  const row = formatted[i];
  const channelG = row[6]; // Col G
  
  // Collect all slot types
  const slotIndices = [8, 17, 26, 35, 44, 53, 62];
  const types = slotIndices.map(idx => row[idx]).filter(Boolean);

  // Check if any slot type contradicts channelG
  const hasTikTok = types.some(t => /tiktok/i.test(t));
  const hasFBIG = types.some(t => /facebook|facbook|instagram|reels|post/i.test(t));
  const hasYoutube = types.some(t => /youtube/i.test(t));
  const hasThreads = types.some(t => /threads/i.test(t));

  if (channelG === 'Tiktok' && hasFBIG) {
    console.log(`Row ${i + 1}: Col G is Tiktok but has FB/IG slots:`, types);
  }
  if (channelG === 'FB / IG' && hasTikTok) {
    console.log(`Row ${i + 1}: Col G is FB/IG but has TikTok slots:`, types);
  }
}

