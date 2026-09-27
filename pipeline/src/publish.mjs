// Step 1 of the weekly run: Content Plan rows → Google Docs → site/src/content/blog/<slug>/.
// Does NOT touch git or the sheet; after the site builds and is pushed, run mark-published.mjs.
//
//   node src/publish.mjs            publish every due row
//   node src/publish.mjs --dry      show what would happen, write nothing
//   node src/publish.mjs --id=YP-003  only this Post ID (ignores Publish date)
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { config, BLOG_DIR, PIPELINE_DIR, MANIFEST, STATUS, CATEGORY_KEYS, ID_PREFIX } from './config.mjs';
import { readContentPlan, toDate, isoDate } from './sheet.mjs';
import { listFiles, exportDocMarkdown, q } from './google.mjs';
import { parseDocMarkdown, stripTitle, fillImages, tidy, slugify } from './markdown.mjs';
import { listAssetFiles, findAsset, fetchImage, saveImage, emptyDir } from './images.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const DRY = Boolean(args.dry);
const ONLY = args.id ? String(args.id).toUpperCase() : null;
const today = new Date();

// postId → existing folder name, so re-publishing keeps the same URL.
function existingPosts() {
  const map = {};
  if (!fs.existsSync(BLOG_DIR)) return map;
  for (const dir of fs.readdirSync(BLOG_DIR)) {
    const file = path.join(BLOG_DIR, dir, 'index.md');
    if (!fs.existsSync(file)) continue;
    const m = fs.readFileSync(file, 'utf8').match(/^postId:\s*["']?([A-Z]{2}-\d+)/m);
    if (m) map[m[1]] = dir;
  }
  return map;
}

function validate(row) {
  const errors = [];
  const postId = String(row.postId).trim().toUpperCase();
  const category = CATEGORY_KEYS[String(row.category).trim().toLowerCase()];
  if (!/^(HK|AB|YP|CM)-\d{3,}$/.test(postId)) errors.push(`Post ID "${row.postId}" must look like YP-001`);
  if (!category) errors.push(`Category "${row.category}" is not Hope Kids / Ablaze / Young Pro / Community`);
  else if (postId && !postId.startsWith(ID_PREFIX[category])) errors.push(`Post ID ${postId} does not match category ${row.category} (${ID_PREFIX[category]}-###)`);
  if (String(row.title).trim().length < 3) errors.push('Title is empty');
  const excerpt = String(row.excerpt).trim();
  if (!excerpt) errors.push('Excerpt is empty');
  if (excerpt.length > 200) errors.push(`Excerpt is ${excerpt.length} characters (max 160 recommended, 200 hard limit)`);
  if (!toDate(row.publishDate)) errors.push('Publish date is empty or invalid');
  return { errors, postId, category, excerpt };
}

function isDue(row) {
  const status = String(row.status).trim();
  const id = String(row.postId).trim().toUpperCase();
  if (ONLY) return id === ONLY && [STATUS.ready, STATUS.update].includes(status);
  if (status === STATUS.update) return true;
  if (status !== STATUS.ready) return false;
  const d = toDate(row.publishDate);
  return d && d <= today;
}

async function findDoc(postId) {
  const docs = await listFiles(
    `name contains '${q(postId)}' and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
  );
  const hits = docs.filter((d) => d.name.trim().toUpperCase().startsWith(postId));
  if (hits.length === 0) throw new Error(`no Google Doc named "${postId} - …" shared with the service account`);
  if (hits.length > 1) throw new Error(`${hits.length} Docs start with ${postId}: ${hits.map((h) => h.name).join(' | ')}`);
  return hits[0];
}

async function buildPost(row, v, slug) {
  const doc = await findDoc(v.postId);
  const md = await exportDocMarkdown(doc.id);
  const { body, images } = parseDocMarkdown(md);
  const assets = await listAssetFiles(v.postId);
  const title = String(row.title).trim();

  const consent = String(row.consent).trim().toLowerCase();
  const hasImages = images.length > 0 || String(row.cover).trim();
  if (hasImages && consent !== 'yes') throw new Error(`post has photos but "Photo consent OK" is "${row.consent || 'empty'}"`);

  const stage = path.join(PIPELINE_DIR, '.staging', slug);
  if (!DRY) emptyDir(stage);
  const used = new Set();
  const resolved = [];
  const warnings = [];
  for (const img of images) {
    try {
      const { buffer, baseName } = await fetchImage(img, assets);
      resolved.push({ caption: img.caption, file: DRY ? baseName : await saveImage(buffer, stage, baseName, used) });
    } catch (e) {
      throw new Error(`image problem — ${e.message}`);
    }
  }

  let cover;
  const coverName = String(row.cover).trim();
  if (coverName) {
    const f = findAsset(assets, coverName);
    if (!f) throw new Error(`cover "${coverName}" not found in 03_Blog Assets/${v.postId}/`);
    const { buffer, baseName } = await fetchImage({ kind: 'asset', name: f.name }, assets);
    cover = DRY ? baseName : await saveImage(buffer, stage, `cover-${baseName}`, used);
  } else if (resolved[0]) {
    cover = resolved[0].file;
  } else {
    warnings.push('no images — post will have no cover');
  }

  const content = tidy(fillImages(stripTitle(body, title, v.postId), resolved, title));
  if (content.trim().length < 50) throw new Error('Doc body is (almost) empty');

  const eventDate = toDate(row.eventDate);
  const fm = {
    postId: v.postId,
    title,
    description: v.excerpt,
    date: isoDate(toDate(row.publishDate)),
    ...(eventDate && { eventDate: isoDate(eventDate) }),
    category: v.category,
    author: String(row.author).trim() || 'Meet n Chill Team',
    ...(cover && { cover: `./${cover}`, coverAlt: title }),
    tags: String(row.tags).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    sourceDoc: `https://docs.google.com/document/d/${doc.id}`,
  };
  const file = `---\n${YAML.stringify(fm).trim()}\n---\n\n${content}`;

  if (!DRY) {
    fs.writeFileSync(path.join(stage, 'index.md'), file);
    const target = path.join(BLOG_DIR, slug);
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(BLOG_DIR, { recursive: true });
    fs.cpSync(stage, target, { recursive: true });
    fs.rmSync(stage, { recursive: true, force: true });
  }
  return { doc: doc.name, images: resolved.length, cover, warnings };
}

async function main() {
  const { rows } = await readContentPlan();
  const due = rows.filter(isDue);
  const existing = existingPosts();
  const done = [];
  const failed = [];

  if (due.length === 0) console.log('Nothing to publish: no rows with Status "Ready to publish" (Publish date ≤ today) or "Needs update".');

  for (const row of due) {
    const v = validate(row);
    const label = `row ${row.rowNumber} ${v.postId || '?'} "${row.title}"`;
    if (v.errors.length) {
      failed.push({ label, reason: v.errors.join('; ') });
      continue;
    }
    let slug = existing[v.postId];
    if (!slug) {
      slug = slugify(String(row.title));
      if (fs.existsSync(path.join(BLOG_DIR, slug))) slug = `${slug}-${v.postId.toLowerCase()}`;
    }
    try {
      const r = await buildPost(row, v, slug);
      const url = `${config.siteUrl}/blog/${v.category}/${slug}/`;
      done.push({ rowNumber: row.rowNumber, postId: v.postId, title: String(row.title).trim(), url, slug, isUpdate: Boolean(existing[v.postId]), ...r });
    } catch (e) {
      failed.push({ label, reason: e.message });
    }
  }

  if (!DRY) fs.writeFileSync(MANIFEST, JSON.stringify({ createdAt: new Date().toISOString(), posts: done }, null, 2));

  console.log(`\n=== ${DRY ? 'DRY RUN — nothing written' : 'Publish'} report ===`);
  for (const p of done) {
    console.log(`✔ ${p.postId} ${p.isUpdate ? '(update)' : '(new)'} "${p.title}" — ${p.images} image(s)${p.cover ? '' : ', no cover'}\n    Doc: ${p.doc}\n    URL: ${p.url}`);
    for (const w of p.warnings) console.log(`    ⚠ ${w}`);
  }
  for (const f of failed) console.log(`✘ ${f.label}\n    ${f.reason}`);
  console.log(`\n${done.length} ready, ${failed.length} failed.${!DRY && done.length ? ' Next: build site, commit, push, then `npm run mark-published`.' : ''}`);
  if (failed.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
});
