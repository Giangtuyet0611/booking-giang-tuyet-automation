const fs = require('fs');

const text = fs.readFileSync('d:/Booking/scratch/doc_full_inspect.txt', 'utf8');

const startD1 = text.indexOf('ĐIỀU 1:');
const startD3 = text.indexOf('ĐIỀU 3:');

console.log(text.substring(startD1, startD3));
