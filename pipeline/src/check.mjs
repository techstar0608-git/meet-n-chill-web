// Verifies the service account can reach the Content Plan and both Drive folders.
import { config } from './config.mjs';
import { serviceAccountEmail, drive, listFiles } from './google.mjs';
import { readContentPlan } from './sheet.mjs';

const ok = (m) => console.log(`✔ ${m}`);
const bad = (m) => {
  console.log(`✘ ${m}`);
  process.exitCode = 1;
};

console.log(`Service account: ${serviceAccountEmail()}\n(share the Drive folder "Meet n Chill" with this email as Editor)\n`);

try {
  const { rows } = await readContentPlan();
  ok(`Content Plan readable — ${rows.filter((r) => r.postId).length} posts`);
} catch (e) {
  bad(`Content Plan: ${e.message}`);
}

for (const [label, id] of [['Blog Drafts folder', config.draftsFolderId()], ['Blog Assets folder', config.assetsFolderId()]]) {
  try {
    const { data } = await drive().files.get({ fileId: id, fields: 'name', supportsAllDrives: true });
    const n = (await listFiles(`'${id}' in parents and trashed = false`)).length;
    ok(`${label} "${data.name}" — ${n} item(s)`);
  } catch (e) {
    bad(`${label}: ${e.message}`);
  }
}
