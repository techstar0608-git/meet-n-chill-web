// Step 3 of the weekly run (after the site is pushed): mark rows as Published in the Content Plan.
import fs from 'node:fs';
import { MANIFEST } from './config.mjs';
import { readContentPlan, updateCells } from './sheet.mjs';

async function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.log('No .last-run.json — nothing to mark. Run `npm run sync` first.');
    return;
  }
  const { posts } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const { index, rows } = await readContentPlan();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  for (const p of posts) {
    // Re-locate by Post ID in case rows were moved since the sync.
    const row = rows.find((r) => String(r.postId).trim().toUpperCase() === p.postId);
    if (!row) {
      console.log(`⚠ ${p.postId} not found in the sheet anymore — skipped`);
      continue;
    }
    await updateCells(index, row.rowNumber, { status: 'Published', liveUrl: p.url, lastPublished: now });
    console.log(`✔ ${p.postId} → Published (${p.url})`);
  }
  fs.rmSync(MANIFEST);
}

main().catch((e) => {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
});
