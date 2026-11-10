const fs = require('fs');
const formulas = JSON.parse(fs.readFileSync('d:/Booking/scratch/sheet_formula.json', 'utf8'));
console.log('Row 37 Col H formula:', formulas[36][7]);

