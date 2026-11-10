const { google } = require('googleapis');
const fs = require('fs');
const c = JSON.parse(fs.readFileSync('d:/Booking/.gdrive-server-credentials.json'));
const k = JSON.parse(fs.readFileSync('d:/Booking/gcp-oauth.keys.json')).installed;
const a = new google.auth.OAuth2(k.client_id, k.client_secret);
a.setCredentials(c);
const s = google.sheets({ version: 'v4', auth: a });
const out = [];
(async () => {
  const id = '1KiSpOuGezhePNSQDPx-xz-_KxfzRzltpR-gI1aQdD3I';
  const m = await s.spreadsheets.get({ spreadsheetId: id, fields: 'properties.title,sheets.properties' });
  out.push('## ' + m.data.properties.title);
  for (const sh of m.data.sheets) {
    const t = sh.properties.title;
    out.push('TAB ' + sh.properties.sheetId + ' | ' + t + ' | rows=' + sh.properties.gridProperties.rowCount);
    if (sh.properties.sheetId !== 2134196678) continue;
    const r = await s.spreadsheets.values.get({ spreadsheetId: id, range: "'" + t + "'!1:6" });
    (r.data.values || []).forEach((row, i) => out.push((i + 1) + ' ' + JSON.stringify(row.map((x) => String(x).slice(0, 60)))));
  }
  // KOC Boom tab: sample tracked columns for rows with status
  const id2 = '1J7pUE_SV-ToO8jNuZZYktu8HsYhYVHVO5GjNwOWJolw';
  const r2 = await s.spreadsheets.values.get({ spreadsheetId: id2, range: "'Data KOC (11/2026)'!A1:AA3" });
  out.push('--- KOC Boom headers full');
  (r2.data.values[0] || []).forEach((h, i) => out.push(i + ': ' + JSON.stringify(h)));
})()
  .catch((e) => out.push('ERR ' + e.message))
  .finally(() => fs.writeFileSync('d:/Booking/scratch/headers_out.txt', out.join('\n'), 'utf8'));
