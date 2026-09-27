---
name: site-update
description: Change the Meet n Chill website's copy, landing pages, layout or visual design (Astro, in site/). Use when the user asks to update text, group info, schedule, join links, FAQ, colours, fonts, sections, or add a page.
---

# Updating the website

## Where things live
- **All copy** (site name, tagline, 3 groups: ages, intro, activities, schedule, location, join link, FAQ; blog categories) → `site/src/config/site.ts`. Change text here, not in pages.
- Design tokens (colours per group, radius, font) → `site/src/styles/global.css` (`:root`, `[data-group=…]`).
- Landing template shared by the 3 groups → `site/src/components/GroupLanding.astro`.
- Home → `site/src/pages/index.astro`; blog → `site/src/pages/blog/`.
- Blog posts are generated — never hand-edit `site/src/content/blog/*` (use the Google Doc + "Needs update").

## Rules
- Website language is **English**. The user may write in Vietnamese; translate into natural, warm, simple English (readers include parents, teens and non-native speakers).
- Tone: friendly, welcoming, inclusive; invite people to join. No exaggerated claims.
- Child safety: never add children's full names, schools, or private addresses.
- Keep URLs stable: `/hope-kids/`, `/ablaze/`, `/young-pro/`, `/blog/<category>/<slug>/`.
- Mobile-first: check 375px width; no horizontal scroll. Keep contrast AA; every image needs alt text.
- For bigger visual redesigns, use the `frontend-design` plugin skill (installed at project scope).

## Finish
1. `cd site && npm run build` must pass.
2. Optionally preview: `npx astro dev --background` then open http://localhost:4321 (stop with `npx astro dev stop`).
3. Commit with a clear message (`site: update Young Pro schedule`) and push only if the user asked to publish.
