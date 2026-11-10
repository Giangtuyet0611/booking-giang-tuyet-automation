const fs = require('fs');
const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
console.log('Row 141:', formatted[140]);

