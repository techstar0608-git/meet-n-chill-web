# Meet n Chill website

Community website (English) for Hope Kids, Ablaze and Young Pro, with a blog fed from Google Docs.

- `site/` — Astro 7 static site, deployed by Cloudflare from the `main` branch (root dir `site`, `npm run build`, output `dist`).
- `pipeline/` — Node scripts: Content Plan sheet + Google Docs + Drive photos → `site/src/content/blog/`.
- `docs/SETUP.md` — one-time setup (GitHub, Google service account, Cloudflare).
- `docs/PIPELINE.md` — how the weekly blog pipeline works.
- `CLAUDE.md` — project context for Claude Code. Weekly run: `/publish-weekly`.
