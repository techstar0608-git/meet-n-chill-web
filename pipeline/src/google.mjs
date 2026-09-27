import fs from 'node:fs';
import { google } from 'googleapis';
import { config } from './config.mjs';

let auth;
function getAuth() {
  if (auth) return auth;
  if (!fs.existsSync(config.keyFile)) {
    throw new Error(`Service account key not found at ${config.keyFile}. See docs/SETUP.md step 2.`);
  }
  auth = new google.auth.GoogleAuth({
    keyFile: config.keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });
  return auth;
}

export const sheets = () => google.sheets({ version: 'v4', auth: getAuth() });
export const drive = () => google.drive({ version: 'v3', auth: getAuth() });

export function serviceAccountEmail() {
  return JSON.parse(fs.readFileSync(config.keyFile, 'utf8')).client_email;
}

const ALL = { supportsAllDrives: true, includeItemsFromAllDrives: true };

export async function listFiles(q, fields = 'files(id,name,mimeType,parents,modifiedTime)') {
  const out = [];
  let pageToken;
  do {
    const { data } = await drive().files.list({ q, fields: `nextPageToken,${fields}`, pageSize: 200, pageToken, ...ALL });
    out.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return out;
}

export async function exportDocMarkdown(fileId) {
  const { data } = await drive().files.export({ fileId, mimeType: 'text/markdown' }, { responseType: 'text' });
  return data;
}

export async function downloadFile(fileId) {
  const { data } = await drive().files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'arraybuffer' });
  return Buffer.from(data);
}

export async function getFileMeta(fileId) {
  const { data } = await drive().files.get({ fileId, fields: 'id,name,mimeType', supportsAllDrives: true });
  return data;
}

export const q = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
