const fs = require('fs');
const src = fs.readFileSync(__dirname + '/apply_rules3.cjs', 'utf8');
const head = src.slice(0, src.indexOf('// ---- AGENTS.md'));
const { REPORT_SECTION, MAIL_FMT, idx, rw } = new Function('require', head + '\nreturn { REPORT_SECTION, MAIL_FMT, idx, rw };')(require);

rw('d:/Booking/curr-plan.md', (L) => {
  const a = idx(L, '### 4.2.');
  const b = idx(L, '---', a);
  const out = [...L.slice(0, a), ...REPORT_SECTION.split('\n'), ...L.slice(b)];
  const h = out.findIndex((l) => l.startsWith('- **Người nhận (Recipients)**'));
  const to = out.findIndex((l) => l.includes('**To**: Email showroom nhận hàng'));
  const cc = out.findIndex((l) => l.includes('**Cc**: Email showroom chuyển'));
  if (h < 0 || to < 0 || cc < 0) throw new Error('mail lines ' + [h, to, cc]);
  out.splice(h, cc - h + 1, ...MAIL_FMT);
  return out;
});
console.log('ok');

