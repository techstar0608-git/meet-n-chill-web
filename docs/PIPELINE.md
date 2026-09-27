# Pipeline: Google Docs → Blog

```
Giáo viên                    Content Plan sheet            Claude Code (/publish-weekly)             GitHub → Cloudflare
─────────                    ──────────────────            ─────────────────────────────             ──────────────────
Doc "YP-001 - Title"   ─┐    Row YP-001                    1. npm run sync
 trong 02_Blog Drafts   │     Status = Ready to publish ─►     • đọc rows đến hạn
Ảnh trong               │     Publish date ≤ hôm nay           • tìm Doc theo Post ID → export Markdown
 03_Blog Assets/YP-001 ─┘     Photo consent = Yes              • tải ảnh Drive → .webp (≤1600px)
                                                               • ghi site/src/content/blog/<slug>/
                                                            2. npm run build (site) — phải pass
                                                            3. git commit + push main  ───────────────►  auto build + deploy
                                                            4. npm run mark-published
                              Status = Published  ◄────────     • ghi Status, Live URL, Last published
```

## Quy ước
| Thứ | Quy ước |
|---|---|
| Post ID | `HK-###` / `AB-###` / `YP-###` / `CM-###`, không bao giờ dùng lại |
| Tên Doc | bắt đầu bằng Post ID: `YP-001 - English Dinner Night` (Doc có thể nằm ở bất kỳ đâu trong folder Meet n Chill) |
| Folder ảnh | `03_Blog Assets/YP-001/` |
| Chèn ảnh | dòng riêng `[[image: dinner-1.jpg \| caption]]`, hoặc link Drive 1 dòng, hoặc dán ảnh trực tiếp |
| Cover | cột "Cover image" (tên file trong folder ảnh) — trống thì lấy ảnh đầu tiên |
| URL | `/blog/<category>/<slug>/`; slug lấy từ Title lần đầu publish, sau đó cố định theo Post ID |
| Cập nhật bài | sửa Doc → Status = `Needs update` (bỏ qua Publish date) |

## Chặn lỗi
Row bị bỏ qua (báo trong report, không làm hỏng bài khác) khi: Post ID sai format / không khớp category, thiếu Title/Excerpt/Publish date, không tìm thấy Doc hoặc có 2 Doc cùng Post ID, ảnh không tìm thấy, bài có ảnh mà consent ≠ Yes, Doc gần như trống.
Mỗi bài được dựng trong `pipeline/.staging/` trước rồi mới copy vào `site/`, nên lỗi giữa chừng không để lại bài hỏng.

## Lệnh
| Lệnh (trong `pipeline/`) | Tác dụng |
|---|---|
| `npm run check` | kiểm tra quyền truy cập Sheet + 2 folder |
| `npm run sync:dry` | xem trước, không ghi gì |
| `npm run sync` | sinh bài vào `site/src/content/blog/` + `.last-run.json` |
| `npm run sync -- --id=YP-003` | chỉ 1 bài (bỏ qua Publish date) |
| `npm run mark-published` | cập nhật sheet sau khi push thành công |
| `npm run setup-sheets` | format sheet (chạy 1 lần, chạy lại vẫn an toàn) |
| `npm test` | unit test chuyển đổi Markdown |
