// One-off: adds dropdowns, date formats, colours and frozen headers to the Content Plan
// (and the Project Checklist if CHECKLIST_SHEET_ID is set). Safe to run again.
import { sheets } from './google.mjs';
import { config } from './config.mjs';

const list = (values) => ({
  condition: { type: 'ONE_OF_LIST', values: values.map((v) => ({ userEnteredValue: v })) },
  showCustomUi: true,
  strict: false,
});
const rgb = (hex) => ({ red: parseInt(hex.slice(0, 2), 16) / 255, green: parseInt(hex.slice(2, 4), 16) / 255, blue: parseInt(hex.slice(4, 6), 16) / 255 });
const col = (sheetId, c, rows = 1000) => ({ sheetId, startRowIndex: 1, endRowIndex: rows, startColumnIndex: c, endColumnIndex: c + 1 });

function common(sheetId, colCount, statusCol, colours, title) {
  return [
    { updateSheetProperties: { properties: { sheetId, title }, fields: 'title' } },
    { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: colCount },
        cell: { userEnteredFormat: { backgroundColor: rgb('1F3A5F'), textFormat: { bold: true, foregroundColor: rgb('FFFFFF') }, wrapStrategy: 'WRAP' } },
        fields: 'userEnteredFormat(backgroundColor,textFormat,wrapStrategy)',
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: colCount },
        cell: { userEnteredFormat: { wrapStrategy: 'WRAP', verticalAlignment: 'TOP' } },
        fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)',
      },
    },
    ...Object.entries(colours).map(([value, hex], i) => ({
      addConditionalFormatRule: {
        index: i,
        rule: {
          ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: colCount }],
          booleanRule: {
            condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: `=$${String.fromCharCode(65 + statusCol)}2="${value}"` }] },
            format: { backgroundColor: rgb(hex) },
          },
        },
      },
    })),
  ];
}

async function firstSheetId(spreadsheetId) {
  const { data } = await sheets().spreadsheets.get({ spreadsheetId, fields: 'sheets(properties(sheetId,title),conditionalFormats)' });
  const s = data.sheets[0];
  // Drop old conditional rules so re-running doesn't stack duplicates.
  const clear = (s.conditionalFormats ?? []).map(() => ({ deleteConditionalFormatRule: { sheetId: s.properties.sheetId, index: 0 } }));
  return { sheetId: s.properties.sheetId, title: s.properties.title, clear };
}

async function setupContentPlan() {
  const spreadsheetId = config.sheetId();
  const { sheetId, title, clear } = await firstSheetId(spreadsheetId);
  const requests = [
    ...clear,
    ...common(sheetId, 16, 1, { 'Ready to publish': 'CFE2F3', Published: 'D9EAD3', 'Needs update': 'F4CCCC', 'Ready for review': 'FFF2CC' }, config.sheetTab),
    { setDataValidation: { range: col(sheetId, 1), rule: list(['Idea', 'Assigned', 'Drafting', 'Ready for review', 'Ready to publish', 'Published', 'Needs update', 'On hold']) } },
    { setDataValidation: { range: col(sheetId, 2), rule: list(['Hope Kids', 'Ablaze', 'Young Pro', 'Community']) } },
    { setDataValidation: { range: col(sheetId, 12), rule: list(['Yes', 'No', 'No photos']) } },
    ...[6, 7].map((c) => ({
      repeatCell: { range: col(sheetId, c), cell: { userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat.numberFormat' },
    })),
    ...[4, 8].map((c) => ({
      repeatCell: { range: col(sheetId, c), cell: { userEnteredFormat: { backgroundColor: rgb('F3F3F3'), textFormat: { italic: true } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' },
    })),
  ];
  await sheets().spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  // Auto columns: Slug (E) and Doc name (I) — one ARRAYFORMULA each fills the whole column.
  await sheets().spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: `'${config.sheetTab}'!E2`, values: [['=ARRAYFORMULA(IF(D2:D="","",LOWER(REGEXREPLACE(REGEXREPLACE(TRIM(D2:D),"[^A-Za-z0-9 ]",""),"\\s+","-"))))']] },
        { range: `'${config.sheetTab}'!I2`, values: [['=ARRAYFORMULA(IF(A2:A="","",A2:A&" - "&D2:D))']] },
      ],
    },
  });
  console.log(`✔ Content Plan formatted (tab "${title}" → "${config.sheetTab}")`);
}

async function setupChecklist() {
  const spreadsheetId = config.checklistSheetId;
  if (!spreadsheetId) return console.log('– CHECKLIST_SHEET_ID not set, skipped checklist');
  const { sheetId, clear } = await firstSheetId(spreadsheetId);
  const requests = [
    ...clear,
    ...common(sheetId, 9, 5, { Done: 'D9EAD3', Blocked: 'F4CCCC', 'In progress': 'FFF2CC' }, 'Checklist'),
    { setDataValidation: { range: col(sheetId, 5), rule: list(['To do', 'In progress', 'Blocked', 'Done', 'Skipped']) } },
    { setDataValidation: { range: col(sheetId, 6), rule: list(['P1', 'P2', 'P3', 'Weekly', 'Monthly']) } },
  ];
  await sheets().spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  console.log('✔ Checklist formatted');
}

await setupContentPlan();
await setupChecklist();
