# The Hair Lab - Static Web + Sanity CMS

Repo nay duoc toi uu theo huong "them CMS" + refactor UX tu one-page dai sang multi-page.

Kien truc deploy:

- GitHub: Luu ma nguon.
- Vercel Project 1 (root repo): Deploy website tinh.
- Vercel Project 2 (root directory = studio): Deploy Sanity Studio rieng.

## 1) Tong quan cau truc

- Website static da tach thanh nhieu route:
	- `index.html` (Trang chu - ban tom tat)
	- `thuong-hieu.html`
	- `san-pham.html`
	- `hop-tac.html`
	- `gioi-thieu.html`
	- `lien-he.html`
- `script.js`: renderer theo tung page, mobile nav, sticky header, back-to-top, form lead ngan.
- `styles.css`: style dung chung cho toan bo route.
- `cms/`: lop ket noi Sanity cho frontend (chi doc published content).
- `studio/`: Sanity Studio doc lap.

## 2) Refactor UX multi-page (2026-04)

Muc tieu chinh:

- Rut gon homepage thanh cac khoi tom tat de de scan.
- Tach noi dung chi tiet sang page chuyen biet.
- Tang kha nang dieu huong tren mobile voi sticky header + mobile menu + CTA ro rang.
- Giu visual tone hien tai (theme sang) nhung toi uu trai nghiem su dung.

File sua:

- `index.html`
- `script.js`
- `styles.css`
- `README.md`

File them:

- `thuong-hieu.html`
- `san-pham.html`
- `hop-tac.html`
- `gioi-thieu.html`
- `lien-he.html`

## 3) Cac file da them/sua (CMS + Studio)

Sua:

- `index.html`
- `styles.css`
- `README.md`

Them:

- `script.js`
- `cms/sanityConfig.js`
- `cms/client.js`
- `cms/queries.js`
- `cms/fallbackContent.js`
- `cms/contentService.js`
- `studio/package.json`
- `studio/sanity.config.ts`
- `studio/sanity.cli.ts`
- `studio/tsconfig.json`
- `studio/.env.example`
- `studio/.gitignore`
- `studio/vercel.json`
- `studio/README.md`
- `studio/schemaTypes/index.ts`
- `studio/schemaTypes/documents/siteSettingsType.ts`
- `studio/schemaTypes/documents/homepageHeroType.ts`
- `studio/schemaTypes/documents/trustPointType.ts`
- `studio/schemaTypes/documents/brandType.ts`
- `studio/schemaTypes/documents/productCategoryType.ts`
- `studio/schemaTypes/documents/testimonialType.ts`
- `studio/schemaTypes/documents/contactBlockType.ts`

## 4) Chay local

### Website tinh (root)

Tu root repo:

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