---
name: publish-weekly
description: Weekly blog run for the Meet n Chill website — pulls every due post from the Content Plan sheet and its Google Doc, builds the site, pushes to GitHub (Cloudflare auto-deploys) and marks rows Published. Use when the user says "đăng bài tuần này", "publish weekly", "chạy pipeline", "up blog", or /publish-weekly.
---

# Weekly publish

Run from the project root `Meet n Chill/`. Stop and report at the first failing step — never push a site that fails to build.

1. **Preconditions**
   - `git status --porcelain` must be clean except `site/src/content/blog/`. If there are other uncommitted changes, ask the user before continuing.
   - `git pull --ff-only` (skip if no remote yet and say so).

2. **Preview** — `cd pipeline && npm run sync:dry`
   - If "Nothing to publish": tell the user which rows are closest (Status "Ready for review" / future Publish date) and stop.

3. **Sync** — `cd pipeline && npm run sync` (or `npm run sync -- --id=XX-000` if the user named one post).
   - Exit code 2 = some rows failed; the others are still written. Keep going with the successful ones, list the failures.

4. **Review what was generated** — for each new/changed `site/src/content/blog/<slug>/index.md`, skim it:
   - Leftover template help text ("Delete this", "PHOTO RULES", "XX-000"), empty headings, broken `[[image` tokens, Vietnamese text in an English post, full names/school names of children (Hope Kids / Ablaze). If found, do NOT publish that post: `git checkout`/delete its folder, and tell the user what the teacher must fix in the Doc.

5. **Build** — `cd site && npm run build`. Must pass. If it fails, fix only pipeline-generated issues (e.g. bad frontmatter), otherwise stop and report.

6. **Commit + push**
   ```
   git add site/src/content/blog
   git commit -m "blog: publish YP-004, HK-002 (weekly run YYYY-MM-DD)"
   git push
   ```

7. **Mark published** — `cd pipeline && npm run mark-published` (only after push succeeded).

8. **Report to the user (Vietnamese)**: table of published posts (Post ID, title, live URL, new/update), failed rows with the exact fix the teacher needs to make, and anything skipped in step 4. Cloudflare needs ~1–2 minutes before URLs are live.
