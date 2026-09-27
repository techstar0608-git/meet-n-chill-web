import { sheets } from './google.mjs';
import { config, COLS } from './config.mjs';

const colLetter = (i) => {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

// Sheets returns dates as serial numbers with UNFORMATTED_VALUE; text dates are parsed too.
export function toDate(v) {
  if (v === '' || v == null) return null;
  if (typeof v === 'number') return new Date(Date.UTC(1899, 11, 30) + Math.round(v * 86400000));
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); // dd/mm/yyyy
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  const d = new Date(s);
  return Number.isNaN(d.valueOf()) ? null : d;
}

export const isoDate = (d) => d.toISOString().slice(0, 10);

export async function readContentPlan() {
  const { data } = await sheets().spreadsheets.values.get({
    spreadsheetId: config.sheetId(),
    range: `'${config.sheetTab}'`,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER',
  });
  const [header = [], ...values] = data.values ?? [];
  const index = {};
  for (const [key, label] of Object.entries(COLS)) {
    const i = header.findIndex((h) => String(h).trim().toLowerCase().startsWith(label.toLowerCase()));
    if (i === -1) throw new Error(`Content Plan is missing column "${label}".`);
    index[key] = i;
  }
  const rows = values.map((v, i) => {
    const row = { rowNumber: i + 2 };
    for (const [key, ci] of Object.entries(index)) row[key] = v[ci] ?? '';
    return row;
  });
  return { index, rows };
}

export async function updateCells(index, rowNumber, values) {
  const data = Object.entries(values).map(([key, value]) => ({
    range: `'${config.sheetTab}'!${colLetter(index[key])}${rowNumber}`,
    values: [[value]],
  }));
  await sheets().spreadsheets.values.batchUpdate({
    spreadsheetId: config.sheetId(),
    requestBody: { valueInputOption: 'USER_ENTERED', data },
  });
}
