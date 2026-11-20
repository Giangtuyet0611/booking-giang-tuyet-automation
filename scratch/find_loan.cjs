const { getClients } = require('../src/lib/google.cjs');

async function findLoan() {
  const { docs } = getClients();
  const res = await docs.documents.get({ documentId: '1lzQudr2G0jpvP1Kq9M19_Vby7SsYQfpu27Zg8XoXFNc' });
  res.data.body.content.forEach((el, idx) => {
    if (el.paragraph) {
      const text = el.paragraph.elements.map(e => e.textRun?.content || '').join('');
      if (text.includes('Loan')) {
        console.log(`Found in Element ${idx}: ${JSON.stringify(text)}`);
      }
    }
  });
}

findLoan().catch(console.error);

