const fs = require('fs');

const text = fs.readFileSync('d:/Booking/scratch/live_doc_hana.txt', 'utf8');

const startB = text.indexOf('BÊN B:');
const startD3 = text.indexOf('ĐIỀU 3:');

console.log(text.substring(startB, startD3));
