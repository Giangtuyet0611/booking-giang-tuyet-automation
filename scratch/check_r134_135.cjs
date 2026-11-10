const fs = require('fs');
const formatted = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formatted.json', 'utf8'));
console.log('Row 134:', formatted[133].slice(0, 20));
console.log('Row 135:', formatted[134].slice(0, 20));

