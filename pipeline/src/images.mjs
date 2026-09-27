import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { listFiles, downloadFile, getFileMeta, q } from './google.mjs';
import { config } from './config.mjs';
import { slugify } from './markdown.mjs';

const IMAGE_MIME = /^image\//;

// sharp's file cache keeps handles open on Windows → EPERM when cleaning the staging folder.
sharp.cache(false);

// Files inside 03_Blog Assets/<Post ID>/ (folder name must start with the Post ID).
export async function listAssetFiles(postId) {
  const folders = await listFiles(
    `'${config.assetsFolderId()}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false and name contains '${q(postId)}'`,
  );
  const folder = folders.find((f) => f.name.trim().toUpperCase().startsWith(postId));
  if (!folder) return [];
  return listFiles(`'${folder.id}' in parents and trashed = false`);
}

const stem = (n) => n.toLowerCase().replace(/\.[a-z0-9]+$/, '');

export function findAsset(assets, name) {
  const want = name.trim().toLowerCase();
  return assets.find((f) => f.name.toLowerCase() === want) ?? assets.find((f) => stem(f.name) === stem(want));
}

// Writes an optimised .webp (max 1600px wide) into outDir; returns the file name.
export async function saveImage(buffer, outDir, baseName, used) {
  const base = slugify(baseName.replace(/\.[a-z0-9]+$/i, '')) || 'image';
  let name = base;
  for (let n = 2; used.has(name); n++) name = `${base}-${n}`;
  used.add(name);
  const file = `${name}.webp`;
  await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(outDir, file));
  return file;
}

// Resolves one placeholder from parseDocMarkdown() to image bytes.
export async function fetchImage(img, assets) {
  if (img.kind === 'asset') {
    const f = findAsset(assets, img.name);
    if (!f) throw new Error(`image "${img.name}" not found in the asset folder`);
    return { buffer: await downloadFile(f.id), baseName: f.name };
  }
  if (img.kind === 'drive') {
    const meta = await getFileMeta(img.id).catch(() => null);
    if (!meta) throw new Error(`Drive image ${img.id} is not shared with the service account`);
    if (!IMAGE_MIME.test(meta.mimeType)) throw new Error(`Drive link ${meta.name} is not an image`);
    return { buffer: await downloadFile(img.id), baseName: meta.name };
  }
  const b64 = img.dataUri.split(',')[1];
  return { buffer: Buffer.from(b64, 'base64'), baseName: 'photo' };
}

export function emptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}
