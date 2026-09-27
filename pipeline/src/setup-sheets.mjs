// Formats the Content Plan (and the Project Checklist if CHECKLIST_SHEET_ID is set) to the shared
// "Content Plan sheet" standard (Lotus gsheet-content-plan-format skill):
//   row 1 spacer, row 2 header, data from row 3 · column A spacer, table from column B
//   freeze 2 rows, gridlines hidden, grey borders, white background (no fills / banding)
//   vertical MIDDLE everywhere · short/enum columns CENTER, long-text columns LEFT · wrap · Google Sans 10pt
//   per-column widths · strict dropdowns on enum columns
// Safe to run again: the spacer row/column are inserted only once and formats are re-applied.
import { sheets } from './google.mjs';
import { config } from './config.mjs';

const HEADER_ROW = 1; // 0-based → row 2
const FIRST_COL = 1; // 0-based → column B
const BUFFER_ROWS = 200;
const MIN_ROWS = 300;

const BORDER = { style: 'SOLID', width: 1, color: { red: 0.6, green: 0.6, blue: 0.6 } };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const WHITE = { red: 1, green: 1, blue: 1 };
const GREY_TEXT = { red: 0.4, green: 0.4, blue: 0.4 };
const FONT = 'Google Sans';

// match = prefix the existing header must start with (case-insensitive); the pipeline matches the same way.
// long = free text → LEFT; otherwise CENTER. auto = filled by formula → grey italic.
const CONTENT_PLAN = [
  { match: 'Post ID', label: 'POST ID', width: 95 },
  { match: 'Status', label: 'STATUS', width: 140, list: ['Idea', 'Assigned', 'Drafting', 'Ready for review', 'Ready to publish', 'Published', 'Needs update', 'On hold'] },
  { match: 'Category', label: 'CATEGORY', width: 115, list: ['Hope Kids', 'Ablaze', 'Young Pro', 'Community'] },
  { match: 'Title', label: 'TITLE', width: 320, long: true },
  { match: 'Slug', label: 'SLUG (AUTO)', width: 230, long: true, auto: true },
  { match: 'Author', label: 'AUTHOR', width: 120 },
  { match: 'Event date', label: 'EVENT DATE', width: 105, date: 'yyyy-mm-dd' },
  { match: 'Publish date', label: 'PUBLISH DATE', width: 105, date: 'yyyy-mm-dd' },
  { match: 'Doc name', label: 'DOC NAME (AUTO)', width: 280, long: true, auto: true },
  { match: 'Excerpt', label: 'EXCERPT (MAX 160 CHARS)', width: 340, long: true },
  { match: 'Cover image', label: 'COVER IMAGE', width: 130 },
  { match: 'Tags', label: 'TAGS', width: 160 },
  { match: 'Photo consent', label: 'PHOTO CONSENT OK', width: 110, list: ['Yes', 'No', 'No photos'] },
  { match: 'Live URL', label: 'LIVE URL', width: 220, long: true },
  { match: 'Last published', label: 'LAST PUBLISHED', width: 130, date: 'yyyy-mm-dd hh:mm' },
  { match: 'Notes', label: 'NOTES', width: 260, long: true },
];

const CHECKLIST = [
  { match: 'ID', label: 'ID', width: 60 },
  {
    match: 'Phase', label: 'PHASE', width: 190,
    list: ['0. Setup & accounts', '1. Brand & content foundation', '2. Website build (Astro)', '3. Blog system', '4. Google Docs -> Blog pipeline', '5. GitHub + Cloudflare deploy', '6. QA & launch', '7. Weekly operations'],
  },
  { match: 'Task', label: 'TASK', width: 300, long: true },
  { match: 'Details', label: 'DETAILS / DONE WHEN...', width: 360, long: true },
  { match: ['PIC', 'Owner'], label: 'PIC', width: 130, list: ['Mr. Hữu', 'Teacher', 'Mr. Hữu + Teacher'] },
  { match: 'Status', label: 'STATUS', width: 110, list: ['To do', 'In progress', 'Blocked', 'Done', 'Skipped'] },
  { match: 'Priority', label: 'PRIORITY', width: 90, list: ['P1', 'P2', 'P3', 'Weekly', 'Monthly'] },
  { match: 'Due', label: 'DUE', width: 100, date: 'yyyy-mm-dd' },
  { match: 'Notes', label: 'NOTES', width: 280, long: true },
];

const colLetter = (i) => {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};
// prefix may be a list of accepted names (current + old header, so a renamed column still matches).
const starts = (cell, prefix) => [prefix].flat().some((p) => String(cell ?? '').trim().toLowerCase().startsWith(p.toLowerCase()));

async function format(spreadsheetId, tabTitle, columns) {
  const api = sheets().spreadsheets;
  const { data: meta } = await api.get({ spreadsheetId, fields: 'sheets(properties,conditionalFormats)' });
  const sheet = meta.sheets[0];
  const { sheetId, title, gridProperties: grid } = sheet.properties;

  // 1) Locate the current header (row 1/col A before the first run, row 2/col B after) and add the spacers.
  const { data: top } = await api.values.get({ spreadsheetId, range: `'${title}'!A1:C3` });
  const topRows = top.values ?? [];
  const hr = topRows.findIndex((r) => r.some((c) => starts(c, columns[0].match)));
  const hc = hr === -1 ? -1 : topRows[hr].findIndex((c) => starts(c, columns[0].match));
  if (hr === -1 || hr > HEADER_ROW || hc > FIRST_COL) throw new Error(`"${title}": header "${columns[0].match}" not found in A1:C3 — sheet layout unexpected, nothing changed.`);
  const insert = [];
  if (hr < HEADER_ROW) insert.push({ insertDimension: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, inheritFromBefore: false } });
  if (hc < FIRST_COL) insert.push({ insertDimension: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, inheritFromBefore: false } });
  if (insert.length) await api.batchUpdate({ spreadsheetId, requestBody: { requests: insert } });

  // 2) Check the column order matches before touching anything else (never reorder live data).
  const { data: all } = await api.values.get({ spreadsheetId, range: `'${title}'` });
  const rows = all.values ?? [];
  const header = (rows[HEADER_ROW] ?? []).slice(FIRST_COL);
  columns.forEach((c, i) => {
    if (!starts(header[i], c.match)) throw new Error(`"${title}": column ${colLetter(FIRST_COL + i)} is "${header[i] ?? ''}", expected "${c.match}…". Fix the header order, then re-run.`);
  });
  const dataRows = Math.max(0, rows.length - HEADER_ROW - 1);

  const lastCol = FIRST_COL + columns.length;
  const rowCount = grid.rowCount + (hr < HEADER_ROW ? 1 : 0);
  const colCount = grid.columnCount + (hc < FIRST_COL ? 1 : 0);
  const endRow = Math.max(HEADER_ROW + 1 + dataRows + BUFFER_ROWS, MIN_ROWS);
  const range = (r0, r1, c0, c1) => ({ sheetId, startRowIndex: r0, endRowIndex: r1, startColumnIndex: c0, endColumnIndex: c1 });

  const requests = [
    // Drop old colour rules, old dropdowns and old formats (e.g. filled header) so re-runs start clean.
    ...(sheet.conditionalFormats ?? []).map(() => ({ deleteConditionalFormatRule: { sheetId, index: 0 } })),
    { setDataValidation: { range: range(0, rowCount, 0, colCount) } },
    { repeatCell: { range: range(0, rowCount, 0, colCount), cell: {}, fields: 'userEnteredFormat' } },
    ...(rowCount < endRow ? [{ appendDimension: { sheetId, dimension: 'ROWS', length: endRow - rowCount } }] : []),
    {
      updateSheetProperties: {
        properties: { sheetId, title: tabTitle, gridProperties: { frozenRowCount: HEADER_ROW + 1, frozenColumnCount: 0, hideGridlines: true } },
        fields: 'title,gridProperties.frozenRowCount,gridProperties.frozenColumnCount,gridProperties.hideGridlines',
      },
    },
    {
      repeatCell: {
        range: range(HEADER_ROW, HEADER_ROW + 1, FIRST_COL, lastCol),
        cell: { userEnteredFormat: { backgroundColor: WHITE, borders: BORDERS, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { fontFamily: FONT, bold: true, fontSize: 10 } } },
        fields: 'userEnteredFormat(backgroundColor,borders,horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)',
      },
    },
    ...columns.map((c, i) => ({
      repeatCell: {
        range: range(HEADER_ROW + 1, endRow, FIRST_COL + i, FIRST_COL + i + 1),
        cell: {
          userEnteredFormat: {
            backgroundColor: WHITE,
            borders: BORDERS,
            horizontalAlignment: c.long ? 'LEFT' : 'CENTER',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'WRAP',
            textFormat: { fontFamily: FONT, bold: false, fontSize: 10, italic: Boolean(c.auto), ...(c.auto ? { foregroundColor: GREY_TEXT } : {}) },
            ...(c.date ? { numberFormat: { type: 'DATE_TIME', pattern: c.date } } : {}),
          },
        },
        fields: 'userEnteredFormat',
      },
    })),
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 20 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 12 }, fields: 'pixelSize' } },
    ...columns.map((c, i) => ({
      updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: FIRST_COL + i, endIndex: FIRST_COL + i + 1 }, properties: { pixelSize: c.width }, fields: 'pixelSize' },
    })),
    ...columns.flatMap((c, i) =>
      c.list
        ? [{
            setDataValidation: {
              range: range(HEADER_ROW + 1, endRow, FIRST_COL + i, FIRST_COL + i + 1),
              rule: { condition: { type: 'ONE_OF_LIST', values: c.list.map((v) => ({ userEnteredValue: v })) }, strict: true, showCustomUi: true },
            },
          }]
        : [],
    ),
  ];
  await api.batchUpdate({ spreadsheetId, requestBody: { requests } });

  // 3) Canonical header labels (row 2, from column B).
  await api.values.update({
    spreadsheetId,
    range: `'${tabTitle}'!${colLetter(FIRST_COL)}${HEADER_ROW + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: [columns.map((c) => c.label)] },
  });

  // 4) Values that break a strict dropdown would be rejected on edit — report them.
  columns.forEach((c, i) => {
    if (!c.list) return;
    rows.slice(HEADER_ROW + 1).forEach((r, k) => {
      const v = r[FIRST_COL + i];
      if (v !== undefined && v !== '' && !c.list.includes(v)) console.log(`  ⚠ ${colLetter(FIRST_COL + i)}${HEADER_ROW + 2 + k}: "${v}" is not in the ${c.label} dropdown`);
    });
  });

  return { title, sheetId, dataRows, col: (match) => colLetter(FIRST_COL + columns.findIndex((c) => c.match === match)) };
}

async function setupContentPlan() {
  const spreadsheetId = config.sheetId();
  const t = await format(spreadsheetId, config.sheetTab, CONTENT_PLAN);
  // Auto columns: one ARRAYFORMULA in the first data row fills the whole column, so clear the cells below it.
  const first = HEADER_ROW + 2;
  const [id, title, slug, doc] = ['Post ID', 'Title', 'Slug', 'Doc name'].map(t.col);
  const tab = `'${config.sheetTab}'`;
  await sheets().spreadsheets.values.batchClear({ spreadsheetId, requestBody: { ranges: [`${tab}!${slug}${first + 1}:${slug}`, `${tab}!${doc}${first + 1}:${doc}`] } });
  await sheets().spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: `${tab}!${slug}${first}`, values: [[`=ARRAYFORMULA(IF(${title}${first}:${title}="","",LOWER(REGEXREPLACE(REGEXREPLACE(TRIM(${title}${first}:${title}),"[^A-Za-z0-9 ]",""),"\\s+","-"))))`]] },
        { range: `${tab}!${doc}${first}`, values: [[`=ARRAYFORMULA(IF(${id}${first}:${id}="","",${id}${first}:${id}&" - "&${title}${first}:${title}))`]] },
      ],
    },
  });
  console.log(`✔ Content Plan formatted (tab "${t.title}" → "${config.sheetTab}", ${t.dataRows} rows)`);
}

async function setupChecklist() {
  const spreadsheetId = config.checklistSheetId;
  if (!spreadsheetId) return console.log('– CHECKLIST_SHEET_ID not set, skipped checklist');
  const t = await format(spreadsheetId, 'Checklist', CHECKLIST);
  console.log(`✔ Checklist formatted (tab "${t.title}" → "Checklist", ${t.dataRows} rows)`);
}

await setupContentPlan();
await setupChecklist();
