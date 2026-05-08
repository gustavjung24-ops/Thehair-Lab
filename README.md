# The Hair Lab - Roadmap va Trang Thai

Website phan phoi san pham cho salon, theo huong mo rong tu one-page ban hang sang he thong quan tri tong va landing page theo tung salon.

## Phase Roadmap

- Phase 1 (done): One-page TheHairLab.top da hoan thanh va dang chay production.
- Phase 2 (in progress): Cloudflare Worker + D1 cho API backend tap trung.
- Phase 3 (in progress): Admin tong (khong dung Apps Script, khong dung Sanity Studio lam admin tong).
- Phase 4 (planned): Trang con salon theo slug (`/[slug]`) sau khi backend/admin on dinh.

## Cau truc hien tai

```
index.html          # Trang one-page chinh
script.js           # Logic frontend
styles.css          # Giao dien frontend
admin/              # Admin tong local (UI tinh)
worker/             # Cloudflare Worker + D1 schema
cms/                # Lop ket noi Sanity (giu lai)
studio/             # Sanity Studio (giu lai)
```

## API Worker (Phase 2)

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

### 1) Chay website tinh

```bash
npx --yes http-server . -p 5200 -c-1
```

### 2) Chay Worker local

```bash
cd worker
npm install
npm run dev
```

### 3) Khoi tao D1 local schema

```bash
cd worker
npx wrangler d1 execute thehairlab-main --local --file=schema.sql
```

## Secrets va Deploy

- Khong deploy Worker khi chua co du secret that.
- Chua xoa Sanity, chua xoa cac trang legacy.
- Chi push sau khi test local day du.

```bash
python3 -m http.server 8080
```

Mo `http://localhost:8080`.

### Sanity Studio (thu muc `studio`)

```bash
cd studio
cp .env.example .env
# cap nhat SANITY_STUDIO_PROJECT_ID va SANITY_STUDIO_DATASET
npm install
npm run dev
```

Mac dinh Studio chay o `http://localhost:3333`.

## 5) Tao project Sanity va lay projectId/dataset

Ban co the tao project theo 2 cach:

1. Truc tiep trong giao dien manage.sanity.io (khuyen nghi).
2. Qua CLI sau khi login (`sanity login`).

Lay thong tin:

- `projectId`: trong trang Project Settings (hoac URL project tren Sanity Manage).
- `dataset`: thuong dung `production`.

Cap nhat 2 noi:

1. Frontend public config: `cms/sanityConfig.js`
2. Studio env: `studio/.env` (tu `.env.example`)

## 6) Schema CMS da co

Da tao day du cac document type:

- `siteSettings`
- `homepageHero`
- `trustPoint`
- `brand`
- `productCategory`
- `testimonial`
- `contactBlock`

Frontend da map noi dung cho cac section chinh:

- Hero
- Trust section
- Nhom san pham
- Nhom thuong hieu
- Testimonial
- Contact info / contact block

Neu fetch loi hoac CMS chua co data, frontend tu dong dung fallback content de tranh trang trang.

## 7) Quy tac bao mat (quan trong)

- Frontend KHONG dung write token.
- Frontend chi dung public config (`projectId`, `dataset`, `apiVersion`, `useCdn`).
- Neu can mutate/server-side job sau nay, dung token chi o server env (Vercel Functions), KHONG dua vao JS frontend.

## 8) Deploy Vercel (2 project)

### Project A: Website tinh

- Import repo vao Vercel.
- Root Directory: `/` (mac dinh).
- Framework preset: `Other` (static).
- Khong can secret env bat buoc cho frontend.

Luu y frontend doc config tu `cms/sanityConfig.js` (public), nen can cap nhat file nay dung voi project Sanity that.

### Project B: Sanity Studio

- Tao project Vercel moi, import cung repo.
- Root Directory: `studio`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment Variables cho Project B:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`

## 9) TODO du lieu that can nhap tren Studio

Sau khi chay Studio, tao du lieu toi thieu:

1. 1 document `siteSettings`.
2. 1 document `homepageHero`.
3. It nhat 4 `trustPoint`.
4. It nhat 3 `brand`.
5. It nhat 4 `productCategory`.
6. It nhat 3 `testimonial`.
7. 1 document `contactBlock`.

Sau khi co data, website root se tu doc va render ngay ma khong can doi framework.