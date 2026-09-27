# Setup 1 lần (việc anh cần tự làm)

Theo thứ tự. Mỗi bước tương ứng 1 dòng trong sheet **MNC - Project Checklist**.

## 1. GitHub (P0.1)
1. Tạo repo **private** `meet-n-chill-web` trên github.com (không tick README/.gitignore).
2. Nhắn Claude: *"push lên https://github.com/<user>/meet-n-chill-web"* — Claude sẽ `git remote add origin … && git push -u origin main`. Lần đầu Windows sẽ bật cửa sổ đăng nhập GitHub (Git Credential Manager).
3. (Khuyên dùng) cài GitHub CLI: `winget install GitHub.cli` rồi `gh auth login`.

## 2. Google service account (P0.4–P0.6)
Chọn 1 trong 2:
- **Nhanh:** dùng lại SA của Affiliate: copy `Affiliate\_shared\credentials\service-account.json` → `Meet n Chill\.secrets\service-account.json`. Email: `aff-aus@openclaw01-490609.iam.gserviceaccount.com`.
- **Tách biệt (khuyên dùng nếu giáo viên/người khác sẽ quản lý):** Google Cloud Console → tạo project mới → bật **Google Drive API** + **Google Sheets API** → IAM → Service Accounts → Create → Keys → Add key → JSON → lưu thành `.secrets\service-account.json`.

Sau đó: mở folder Drive **Meet n Chill** → Share → dán email service account → quyền **Editor** (1 lần là đủ, mọi file con kế thừa).

Rồi nhắn Claude *"chạy setup pipeline"* — Claude sẽ chạy:
```
cd pipeline
npm run check          # phải ra 3 dấu ✔
npm run setup-sheets   # format 2 sheet theo chuẩn Lotus (header hàng 2, bảng từ cột B, border, dropdown), sửa 2 cột auto (Slug, Doc name)
```

## 3. Cloudflare (P0.3, P5.2, P5.3)
1. Tạo tài khoản Cloudflare, add domain, đổi nameserver tại nơi mua domain.
2. Dashboard → **Workers & Pages** → Create → **Import a repository** → chọn GitHub `meet-n-chill-web`.
3. Build settings:
   - Root directory: `site`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Env var: `NODE_VERSION` = `22`
4. Deploy. Từ giờ mỗi lần push `main` là web tự cập nhật (~1–2 phút).
5. Custom domains → thêm domain. Sau đó báo Claude domain để cập nhật `SITE.url`, `astro.config.mjs` và `SITE_URL` trong `pipeline/.env`.
6. (Tuỳ chọn) Bật **Web Analytics** cho site.

## 4. Nội dung (P1.x)
Gửi Claude (tiếng Việt cũng được, Claude sẽ viết tiếng Anh): tagline, giới thiệu, lịch sinh hoạt, địa điểm, link đăng ký, FAQ cho từng nhóm → Claude cập nhật `site/src/config/site.ts`. Ảnh landing/logo bỏ vào Drive `04_Website Assets`.
