# Meet n Chill — Community website

> Dự án này KHÔNG thuộc Affiliate. Các quy tắc affiliate trong ~/.claude/CLAUDE.md (disclosure #ad, giọng Anh-Úc, Remotion, `_shared/scripts`…) KHÔNG áp dụng ở đây.

Website giới thiệu hoạt động của nhóm + mời người tham gia. **Toàn bộ nội dung web bằng tiếng Anh.**

## 3 nhóm đối tượng
| Key / URL | Tên | Đối tượng | Mã Post ID |
|---|---|---|---|
| `/hope-kids/` | Hope Kids | trẻ em | `HK-###` |
| `/ablaze/` | Ablaze | 9–16 tuổi | `AB-###` |
| `/young-pro/` | Young Pro | 18–30, chưa lập gia đình | `YP-###` |
| (blog only) | Community | bài chung | `CM-###` |

Hoạt động: workshop, outdoor, ăn tối cùng nhau, luyện tiếng Anh, chia sẻ vấn đề cuộc sống/công việc.

## Cấu trúc thư mục
```
Meet n Chill/
├─ CLAUDE.md               ← file này
├─ docs/                   ← SETUP.md (setup 1 lần), PIPELINE.md (cách pipeline chạy)
├─ .claude/skills/         ← /publish-weekly, /site-update
├─ .secrets/               ← service-account.json (git-ignored)
├─ site/                   ← Astro 7 website (Cloudflare build từ đây)
│  └─ src/
│     ├─ config/site.ts    ← MỌI copy text: tên, tagline, 3 nhóm, activities, FAQ, link join
│     ├─ content/blog/<slug>/index.md + ảnh  ← do pipeline sinh ra, KHÔNG sửa tay
│     ├─ components/ layouts/ styles/global.css (design tokens, màu từng nhóm)
│     └─ pages/            ← /, /hope-kids, /ablaze, /young-pro, /blog/[category]/[slug], /about, /privacy
└─ pipeline/               ← Node script: Content Plan sheet + Google Docs → site/src/content/blog
   ├─ .env                 ← Sheet ID, folder ID (git-ignored)
   └─ src/ publish.mjs, mark-published.mjs, check.mjs, setup-sheets.mjs
```

## Google Drive (folder gốc `1ZqnKLYQtbOGxsn9gvjdSLqOaUTn8AMbX`)
| Folder / file | ID |
|---|---|
| 01_Project Management | `11Ij8jB_9-pE2GY_kXBNi5mfRTwPzFX6-` |
| ├ MNC - Project Checklist (sheet) | `1pxoJWcfCwWB0UZMGudBwpqIYYR7xAIMXqUcyQno4e8o` |
| ├ MNC - Content Plan (sheet) | `1gLKrKob7w85GYD6Lg95dwHwE9SnMkoUmw-IDdMBw5F4` |
| └ MNC - Teacher Guide (doc) | `1Pq6fuDEKcjh_IJit96Bw5RA8WXDcAvr9ptHpUjC15M8` |
| 02_Blog Drafts (Google Docs) | `1Il0bbWhAbxSHRsmYGiQKoHBSgYUXJKR2` (có `_TEMPLATE - Blog Post`) |
| 03_Blog Assets (mỗi Post ID 1 folder) | `1Q--oQTpPDdo2ecNY747SkWig2BNuOmAP` |
| 04_Website Assets (logo, ảnh landing) | `1GGeNZ2YzrBDu0L0BvrMZ82MU2EezI_bf` |
| 05_Published Archive | `1wvltpNnDbSwjDDIm7InMlV2ZfZkje8Lu` |

## Quy tắc
- Tên Google Doc phải bắt đầu bằng Post ID: `YP-001 - Title`. Ảnh: `03_Blog Assets/YP-001/…`, chèn trong Doc bằng `[[image: file.jpg | caption]]`.
- Bài có ảnh chỉ được publish khi cột "Photo consent OK" = Yes. Trẻ em/teen: chỉ tên (first name), không trường học/địa chỉ.
- Không sửa tay `site/src/content/blog/*` — sửa Google Doc rồi set Status = "Needs update".
- Không đổi slug/folder của bài đã publish (URL sẽ gãy).
- Sửa giao diện/copy → dùng skill `/site-update`. Đăng bài hàng tuần → `/publish-weekly`.
- Deploy: push `main` lên GitHub → Cloudflare tự build (root `site`, `npm run build`, output `dist`).

## Lệnh
```
cd site && npm run dev            # xem web local http://localhost:4321
cd site && npm run build          # build kiểm tra
cd pipeline && npm run check      # test quyền Google
cd pipeline && npm run sync:dry   # xem trước bài sẽ đăng
cd pipeline && npm test           # unit test chuyển Doc → Markdown
```
