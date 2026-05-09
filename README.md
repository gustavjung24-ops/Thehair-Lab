# The Hair Lab — Trạng thái dự án

Website phân phối sản phẩm tóc cho salon, kết hợp landing page demo theo từng mẫu và hệ thống quản trị tập trung.

## Trạng thái hiện tại (May 2026)

| Hạng mục | Trạng thái |
|---|---|
| Trang chủ thehairlab.top | ✅ Production |
| Landing salon Mẫu 01–05 (`/s/salon-test-mau-0X/`) | ✅ Hoàn thành, chạy được local + Vercel |
| CDN/R2 cho ảnh landing salon 01–05 | ✅ Hoàn thành, 100% ảnh qua `cdn.thehairlab.top` |
| Ảnh trang chủ (product + thumbnail mẫu) | ⏳ Vẫn dùng `public/image/` local — map R2 ở phase sau |
| Nút "Xem mẫu" 5 card trang chủ | ✅ Đã link đúng `/s/salon-test-mau-0X/` |
| OG image trang chủ | ✅ `hien-thi-tim-kiem.png` qua CDN |
| OG image landing 01–05 | ✅ Hero CDN theo từng mẫu |
| Admin tổng | 🔧 `admin/` + Cloudflare Worker D1 (đang xây) |
| Backend API Worker | 🔧 Phase 2 — schema D1 đã có, đang deploy |

## Roadmap Phase

- **Phase 1** ✅: Trang chủ one-page TheHairLab.top — production.
- **Phase 2** 🔧: Cloudflare Worker + D1 — API backend tập trung.
- **Phase 3** 🔧: Admin tổng (`admin/` + Worker, không dùng Sanity Studio làm admin tổng).
- **Phase 4** ⏳: Landing salon theo slug thực (`/[slug]`) sau khi backend/admin ổn định.
- **Phase 5** ⏳: Map toàn bộ ảnh trang chủ từ `public/image/` sang R2/CDN.

## Cấu trúc hiện tại

```
index.html                      # Trang chủ one-page
script.js                       # Logic frontend trang chủ
styles.css                      # Giao diện trang chủ
salon.js                        # Runtime renderer landing salon
salon.css                       # Giao diện landing salon
assets/
  cloudflare-assets.js          # Map CDN key → URL cho mẫu 01–05
s/
  salon-test-mau-01/            # Demo Mẫu 01 — Lavender Beauty
  salon-test-mau-02/            # Demo Mẫu 02 — Green Natural
  salon-test-mau-03/            # Demo Mẫu 03 — Black Gold Luxury
  salon-test-mau-04/            # Demo Mẫu 04 — Spring Fresh
  salon-test-mau-05/            # Demo Mẫu 05 — Gold Luxury
admin/                          # Admin tổng (UI tĩnh, kết nối Worker)
worker/                         # Cloudflare Worker + D1 schema
public/image/                   # Ảnh local trang chủ (sẽ map CDN phase sau)
cms/                            # Kết nối Sanity (giữ lại — legacy CMS)
studio/                         # Sanity Studio (giữ lại — legacy)
scripts/                        # Helper upload R2
```

> **Lưu ý:** `studio/`, `cms/`, `worker/`, `public/image/` không xóa.

## CDN / Cloudflare R2

Tất cả ảnh landing salon đã upload R2 và phục vụ qua `cdn.thehairlab.top`:

| Mẫu | Hero | Trạng thái |
|-----|------|------------|
| Mẫu 01 — Lavender Beauty | `mau-01/salon-mau-01-hero.png` | ✅ 200 |
| Mẫu 02 — Green Natural | `mau-02/salon-mau-02-hero.jpg` | ✅ 200 |
| Mẫu 03 — Black Gold Luxury | `mau-03/salon-mau-03-hero.png` | ✅ 200 |
| Mẫu 04 — Spring Fresh | `mau-04/salon-mau-04-hero.png` | ✅ 200 |
| Mẫu 05 — Gold Luxury | `mau-05/salon-mau-05-hero.png` | ✅ 200 |
| Site OG | `site/hien-thi-tim-kiem.png` | ✅ 200 |

Ảnh fallback local cho mẫu 01 vẫn trong `public/image/` (dùng khi CDN không trả về).
Ảnh trang chủ (`public/image/thehairlab-*.png`) vẫn local — sẽ map CDN ở phase 5.

## API Worker (Phase 2)

> Admin tổng dùng `admin/` + Worker D1. **Không dùng Sanity Studio làm admin tổng.**

Worker endpoint duoc thiet ke:

- `POST /api/leads`
- `POST /api/booking`
- `POST /api/admin/login`
- `GET /api/admin/me`
- `POST /api/admin/logout`
- `GET /api/admin/salons`
- `POST /api/admin/salons`
- `GET /api/admin/salons/:id`
- `PUT /api/admin/salons/:id`
- `POST /api/admin/salons/:id/test-telegram`
- `POST /api/admin/salons/:id/test-sheet`
- `GET /api/public/salons/:slug`

## D1 Schema (Phase 2)

Bang du lieu backend:

- `leads`
- `salons`
- `salon_services`
- `appointments`
- `admin_users`

## Local Development

### Chạy website (trang chủ + landing salon)

```bash
npx --yes http-server . -p 5200 -c-1
```

Mở `http://127.0.0.1:5200/` — trang chủ.
Mở `http://127.0.0.1:5200/s/salon-test-mau-01/` ... `mau-05/` — demo salon.

### Chạy Worker local

```bash
cd worker
npm install
npm run dev
```

### Khởi tạo D1 local schema

```bash
cd worker
npx wrangler d1 execute thehairlab-main --local --file=schema.sql
```

## Legacy CMS (Sanity)

`studio/` và `cms/` giữ lại, không xóa. **Không dùng cho admin tổng.** Dùng khi cần fallback CMS hoặc nội dung tĩnh.

### Chạy Studio local

```bash
cd studio
npm install
npm run dev
```

Mặc định `http://localhost:3333`.

## Quy tắc bảo mật

- Frontend **không** dùng write token.
- Frontend chỉ dùng public config (`projectId`, `dataset`, `apiVersion`, `useCdn`).
- Token chỉ để ở server env (Vercel Functions / Worker secrets), không đưa vào JS frontend.
- Không deploy Worker khi chưa có đủ secret thật.
- Chỉ push sau khi test local đầy đủ.

## Deploy Vercel

### Project A: Website tĩnh

- Root Directory: `/`
- Framework preset: `Other` (static)
- Không cần secret env bắt buộc cho frontend

### Project B: Sanity Studio (legacy)

- Root Directory: `studio`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env vars: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`