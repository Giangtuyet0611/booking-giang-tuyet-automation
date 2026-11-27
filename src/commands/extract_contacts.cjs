const fs = require('fs');
const zlib = require('zlib');
const { getClients } = require('../lib/google.cjs');

function extractDocxText(buf) {
  // Tìm End of Central Directory (PK\x05\x06)
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error('Không tìm thấy EOCD trong file .docx');
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const totalEntries = buf.readUInt16LE(eocdOffset + 10);

  let pos = cdOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break;
    const method = buf.readUInt16LE(pos + 10);
    const compSize = buf.readUInt32LE(pos + 20);
    const fnLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localOffset = buf.readUInt32LE(pos + 42);
    const fileName = buf.toString('utf8', pos + 46, pos + 46 + fnLen);

    if (fileName === 'word/document.xml') {
      const lFnLen = buf.readUInt16LE(localOffset + 26);
      const lExtraLen = buf.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + lFnLen + lExtraLen;
      const compData = buf.subarray(dataStart, dataStart + compSize);
      const xmlBuf = method === 8 ? zlib.inflateRawSync(compData) : compData;
      const xml = xmlBuf.toString('utf8');
      return xml
        .replace(/<\/w:p>/g, '\n')
        .replace(/<w:br[^>]*\/>/g, '\n')
        .replace(/<w:tab[^>]*\/>/g, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    }
    pos += 46 + fnLen + extraLen + commentLen;
  }
  throw new Error('Không tìm thấy word/document.xml trong .docx');
}

function stripAccents(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function listDocsRecursive(drive, folderId, pathPrefix = '') {
  let results = [];
  let pageToken = null;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 200,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken
    });
    for (const f of res.data.files || []) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        const sub = await listDocsRecursive(drive, f.id, `${pathPrefix}${f.name}/`);
        results = results.concat(sub);
      } else {
        results.push({ id: f.id, name: f.name, mimeType: f.mimeType, path: `${pathPrefix}${f.name}` });
      }
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return results;
}

function extractBodyText(elements) {
  let text = '';
  for (const el of elements || []) {
    if (el.paragraph) {
      for (const p of el.paragraph.elements || []) {
        if (p.textRun) text += p.textRun.content;
      }
    } else if (el.table) {
      for (const row of el.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          text += extractBodyText(cell.content);
        }
      }
    }
  }
  return text;
}

function matchDocForKoc(kocQuery, allDocs) {
  const qNorm = stripAccents(kocQuery);
  const qTokens = qNorm.split(' ').filter(Boolean);
  const isGdoc = d => d.mimeType === 'application/vnd.google-apps.document';

  // 1. Exact substring match in file/path name (ưu tiên Google Docs trước)
  const exact = allDocs.filter(d => stripAccents(d.path).includes(qNorm));
  if (exact.length > 0) {
    return exact.find(isGdoc) || exact[0];
  }

  // 2. Token match (ưu tiên Google Docs trước)
  let best = null;
  let bestScore = 0;
  for (const d of allDocs) {
    const dNorm = stripAccents(d.name);
    let hits = 0;
    for (const t of qTokens) {
      if (dNorm.includes(t)) hits++;
    }
    const ratio = hits / qTokens.length;
    const score = ratio + (isGdoc(d) ? 0.01 : 0);
    if (ratio >= 0.75 && score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

async function handleExtractContactsCommand(kocList) {
  const { drive, docs, config } = getClients();
  const rootId = config.CONTRACT_TARGET_ROOT_FOLDER_ID;

  console.log(`Đang quét toàn bộ hợp đồng trong folder gốc (${rootId})...`);
  const allDocs = await listDocsRecursive(drive, rootId);
  console.log(`Tìm thấy ${allDocs.length} Google Docs hợp đồng.\n`);

  const results = [];
  for (const kocName of kocList) {
    const doc = matchDocForKoc(kocName, allDocs);
    if (!doc) {
      results.push({ query: kocName, found: false, fullName: '', phone: '', docName: '', docId: '' });
      continue;
    }
    try {
      let fullText = '';
      if (doc.mimeType === 'application/vnd.google-apps.document') {
        const docRes = await docs.documents.get({ documentId: doc.id });
        fullText = extractBodyText(docRes.data.body.content);
      } else if (doc.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const dl = await drive.files.get(
          { fileId: doc.id, alt: 'media', supportsAllDrives: true },
          { responseType: 'arraybuffer' }
        );
        fullText = extractDocxText(Buffer.from(dl.data));
      } else {
        results.push({
          query: kocName,
          found: false,
          error: `Định dạng chưa hỗ trợ (${doc.mimeType})`,
          docName: doc.name,
          docId: doc.id
        });
        continue;
      }
      const benBBlockMatch = fullText.match(/BÊN B:[\s\S]*?(?=ĐIỀU 1:|$)/i);
      const benBBlock = benBBlockMatch ? benBBlockMatch[0] : '';

      const nameMatch = benBBlock.match(/BÊN B:\s*([^\n]+)/i);
      const phoneMatch = benBBlock.match(/Số điện thoại:\s*([0-9.\s-]+)/i);

      results.push({
        query: kocName,
        found: true,
        fullName: nameMatch ? nameMatch[1].trim() : '(Không thấy)',
        phone: phoneMatch ? phoneMatch[1].replace(/[\s.-]+/g, '').trim() : '(Không thấy)',
        rawPhone: phoneMatch ? phoneMatch[1].trim() : '',
        docName: doc.name,
        docId: doc.id
      });
    } catch (err) {
      results.push({ query: kocName, found: false, error: err.message, docName: doc.name, docId: doc.id });
    }
  }

  console.log('=== KẾT QUẢ LỌC HỌ TÊN & SĐT KOC ===');
  results.forEach((r, idx) => {
    if (r.found) {
      console.log(`${idx + 1}. ${r.query} | ${r.fullName} | ${r.rawPhone || r.phone} | [${r.docId}] ${r.docName}`);
    } else {
      console.log(`${idx + 1}. ${r.query} | KHÔNG TÌM THẤY ${r.error ? `(${r.error})` : ''}`);
    }
  });

  fs.writeFileSync('d:/Booking/deals/extract-contacts-result.json', JSON.stringify(results, null, 2), 'utf8');
  return results;
}

module.exports = { handleExtractContactsCommand };
