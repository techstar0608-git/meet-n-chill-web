---
name: deploy
description: Deploy a new version of the Meet n Chill website — build check, commit, push to GitHub main; Cloudflare Workers Builds then deploys automatically. Use when the user says "deploy", "đưa lên web", "cập nhật web", "push lên", "public bản mới".
---

# Deploy

Repo: https://github.com/techstar0608-git/meet-n-chill-web (branch `main`).
Cloudflare Workers project `meet-n-chill` is connected to this repo (root dir `site`, build `npm run build`,
deploy `npx wrangler deploy`, config `site/wrangler.jsonc`). Every push to `main` deploys in ~1–2 minutes.

1. `git status` — show the user what changed. Only commit files related to the requested change; if unrelated
   edits are present (e.g. from another session), leave them out and mention them.
2. `cd site && npm run build` — must pass. Never push a failing build.
3. `git add <files>` → `git commit -m "<area>: <what changed>"` (end with the Co-Authored-By line) → `git pull --rebase` → `git push`.
4. Verify after ~90s: `curl -s -o /dev/null -w "%{http_code}" <live URL>` should be 200
   (live URL: custom domain in `site/wrangler.jsonc` routes, else https://meet-n-chill.<account>.workers.dev).
   If it is not live after ~5 minutes, ask the user to check Cloudflare → Workers & Pages → meet-n-chill → Deployments for the build log.
5. Report in Vietnamese: commit hash, what changed, live URL.

## Custom domain
To add/change the domain, edit `routes` in `site/wrangler.jsonc`:
`"routes": [{ "pattern": "meetnchill.starmartech.com", "custom_domain": true }]`
and update `SITE.url` (site/src/config/site.ts), `site` (site/astro.config.mjs), `SITE_URL` (pipeline/.env). Then deploy.
The zone (starmartech.com) must be on the same Cloudflare account; Cloudflare creates the DNS record + SSL itself —
do not also create a manual CNAME for the same hostname.
