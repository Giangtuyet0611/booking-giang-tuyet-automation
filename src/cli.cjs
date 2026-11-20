#!/usr/bin/env node

/**
 * CLI Điều Phối Tập Trung Workflow Booking KOC - Đồng Hồ Hải Triều
 * 
 * Cách sử dụng:
 *   node src/cli.cjs contract --input deals/2026-11-11-dmy.json [--replace]
 *   node src/cli.cjs thucthi1 --input deals/2026-11-11-dmy.json [--dry-run]
 *   node src/cli.cjs verify-contract --id <docId>
 *   node src/cli.cjs new-deal --input <raw_text_file> [--output <json_file>]
 *   node src/cli.cjs inspect-doc --id <docId>
 */

const fs = require('fs');
const path = require('path');
const { validateDeal } = require('./lib/deal.schema.cjs');
const { handleContractCommand } = require('./commands/contract.cjs');
const { handleThucThi1Command } = require('./commands/thucthi1.cjs');
const { verifyContract } = require('./commands/verify_contract.cjs');
const { handleNewDealCommand } = require('./commands/new_deal.cjs');
const { handleMediaCommand } = require('./commands/media.cjs');
const { syncReportMaterials } = require('./commands/report_materials.cjs');
const { inspectReportSheets } = require('./commands/inspect_report.cjs');
const { getClients } = require('./lib/google.cjs');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = argv[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function printHelp() {
  console.log(`
========================================================================
    CLI WORKFLOW BOOKING KOC - ĐỒNG HỒ HẢI TRIỀU (SAGA AUTOMATION)
========================================================================

CÁC LỆNH CHÍNH:

1. Làm hợp đồng (Lệnh "tiến hành"):
   node src/cli.cjs contract --input deals/<file>.json [--replace]
   -> Tự động tạo HĐ, dựng bảng SOW, bảng sản phẩm, và tự động verify chất lượng.

2. Thực thi 1 (Lệnh "thực thi 1"):
   node src/cli.cjs thucthi1 --input deals/<file>.json [--dry-run]
   -> Đọc live doc, tra showroom, đẩy Gmail Draft, cập nhật Sheet Data KOC.

3. Kiểm tra hợp đồng đã tạo:
   node src/cli.cjs verify-contract --id <docId>
   -> Quét sót mẫu cũ, kiểm tra bảng SOW, tên Bên B, chữ ký, showroom...

4. Tạo file Deal chuẩn từ văn bản thô:
   node src/cli.cjs new-deal --input <raw_file.txt> [--output deals/<file>.json]

5. Đọc trực tiếp Google Doc:
   node src/cli.cjs inspect-doc --id <docId>

6. Tra cứu danh sách cửa hàng:
   node src/cli.cjs store-lookup --query "<địa chỉ hoặc tên showroom>"

7. Xử lý hình ảnh / Media KOC (Copy & Chuẩn hóa tên):
   node src/cli.cjs media --source <folderId> [--koc "<Tên>"] [--product "<Mã SP>"]

8. Ghi nhận Report Materials:
   node src/cli.cjs report-materials [--koc "<Tên>"] [--folder "<Drive_Folder_URL>"]

========================================================================
`);
}

async function main() {
  const args = parseArgs(process.argv);
  const command = args._[0];

  if (!command || command === 'help' || args.help) {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case 'contract': {
        if (!args.input) {
          console.error('❌ Lỗi: Thiếu tham số --input <file_deal.json>');
          process.exit(1);
        }
        const dealRaw = JSON.parse(fs.readFileSync(args.input, 'utf8'));
        const validation = validateDeal(dealRaw);
        if (!validation.valid) {
          console.error('❌ Lỗi xác thực dữ liệu Deal:');
          validation.errors.forEach(e => console.error(`  - ${e}`));
          process.exit(1);
        }
        await handleContractCommand(validation.deal, { replace: Boolean(args.replace), docId: args['doc-id'] });
        break;
      }

      case 'thucthi1': {
        let dealData = {};
        if (args.input && fs.existsSync(args.input)) {
          dealData = JSON.parse(fs.readFileSync(args.input, 'utf8'));
        } else if (fs.existsSync('d:/Booking/last_contract_result.json')) {
          dealData = JSON.parse(fs.readFileSync('d:/Booking/last_contract_result.json', 'utf8'));
        }
        await handleThucThi1Command(dealData, { dryRun: Boolean(args['dry-run']) });
        break;
      }

      case 'verify-contract': {
        if (!args.id) {
          console.error('❌ Lỗi: Thiếu tham số --id <docId>');
          process.exit(1);
        }
        await verifyContract(args.id);
        break;
      }

      case 'new-deal': {
        if (!args.input) {
          console.error('❌ Lỗi: Thiếu tham số --input <file_path>');
          process.exit(1);
        }
        handleNewDealCommand(args.input, args.output);
        break;
      }

      case 'inspect-doc': {
        if (!args.id) {
          console.error('❌ Lỗi: Thiếu tham số --id <docId>');
          process.exit(1);
        }
        const { docs } = getClients();
        const res = await docs.documents.get({ documentId: args.id });
        console.log(`Document Title: ${res.data.title}`);
        console.log(`Body Elements: ${res.data.body.content.length}`);
        let text = '';
        const tables = [];
        res.data.body.content.forEach((el, idx) => {
          if (el.paragraph) {
            text += el.paragraph.elements.map(e => e.textRun?.content || '').join('');
          } else if (el.table) {
            const rows = el.table.tableRows.map((r, ri) => {
              const cells = r.tableCells.map(c => {
                let t = '';
                c.content.forEach(co => {
                  if (co.paragraph) t += co.paragraph.elements.map(e => e.textRun?.content || '').join('');
                });
                return t.trim().replace(/\n+/g, ' / ');
              });
              return `  [Row ${ri}] ${cells.join(' | ')}`;
            });
            tables.push(`Table ${tables.length} (index=${idx}, rowCount=${el.table.tableRows.length}):\n${rows.join('\n')}`);
          }
        });
        console.log('--- NỘI DUNG VĂN BẢN ---');
        console.log(text.slice(0, 6000));
        console.log('\n--- CÁC BẢNG ---');
        console.log(tables.join('\n\n'));
        break;
      }

      case 'store-lookup': {
        const query = args.query || args._[1] || '634 Quang Trung';
        const { findStoreByAddressOrName } = require('./utils/store_lookup.util.cjs');
        const store = await findStoreByAddressOrName(query);
        console.log('\n--- KẾT QUẢ TRA CỨU SHOWROOM ---');
        console.log(store || 'Không tìm thấy showroom phù hợp');
        break;
      }

      case 'media': {
        await handleMediaCommand({
          source: args.source || args._[1],
          koc: args.koc,
          product: args.product
        });
        break;
      }

      case 'report-materials': {
        await syncReportMaterials({
          koc: args.koc,
          bookingDate: args.date,
          product: args.product,
          folderUrl: args.folder,
          title: args.title,
          format: args.format,
          quality: args.quality,
          receiveDate: args['receive-date'],
          sdha: args.sdha
        });
        break;
      }

      case 'inspect-report': {
        await inspectReportSheets(args.query || args._[1]);
        break;
      }

      case 'test-table': {
        require('../scratch/test_row_debug.cjs');
        break;
      }

      case 'list-contracts': {
        require('../scratch/test_list_contracts.cjs');
        break;
      }

      case 'find-loan': {
        require('../scratch/find_loan.cjs');
        break;
      }

      case 'test-in-place': {
        require('../scratch/inspect_doc_now.cjs');
        break;
      }

      case 'list-hau-phuong': {
        require('../scratch/inspect_row1154.cjs');
        break;
      }

      default:
        console.error(`❌ Lệnh không hợp lệ: "${command}"`);
        printHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(`\n❌ LỖI THỰC THI [${command}]:`, err.message);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

main();

