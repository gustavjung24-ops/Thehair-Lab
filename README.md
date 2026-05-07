# The Hair Lab - One-Page Landing Page + Cloudflare Worker

Website ban hang cho salon chuyen nghiep. Trang chinh la one-page landing page ban san pham + chuong trinh tang landing page rieng cho salon.

## Kien truc hien tai

- **GitHub**: Luu ma nguon.
- **Vercel** (root repo): Deploy website tinh (index.html + assets).
- **Cloudflare Worker** (`worker/`): API nhan lead tu form trang chinh.
- **Cloudflare D1**: Luu tru lead.
- **Telegram Bot**: Thong bao lead ve nhom quan tri.
- **Google Sheets API**: Luu lead vao sheet THEHAIRLAB_LEADS.

## 1) Trang chinh (index.html)

One-page landing page chuyen dung ban san pham + tang landing page salon.

Cac section:
- Hero: USP chinh + form dat lich thu nho (mockup)
- Van de thuong gap cua salon
- Uu dai salon (mua hang tu 2tr, tang landing page)
- 5 nhom san pham chinh (anh thuc te)
- Mau landing page tang kem (3 mau)
- Cach form hoat dong
- Admin rieng cho salon
- Quy trinh trien khai
- Form nhan bao gia (POST /api/leads)
- FAQ

## 2) Cau truc file

```
index.html          # One-page landing chinh
script.js           # Logic frontend: mobile nav, form submit, animations
styles.css          # Style toan trang
public/image/       # Anh san pham thuc te (PNG/JPG da duoc chup)
worker/             # Cloudflare Worker cho /api/leads
	src/index.js      # Entry point Worker
	schema.sql        # D1 schema
	wrangler.toml     # Config deploy
cms/                # Lop ket noi Sanity (du phong, hien khong dung)
studio/             # Sanity Studio doc lap (chua deploy)
```

## 3) API /api/leads (Cloudflare Worker)

**Endpoint**: `POST /api/leads`

**Fields**:
- `salon_name` - Ten salon
- `contact_name` - Nguoi lien he
- `phone_zalo` - So dien thoai / Zalo (bat buoc)
- `area` - Khu vuc
- `product_interest` - Nhom san pham quan tam
- `landing_page_sample` - Mau landing page muon nhan
- `note` - Ghi chu
- `source_url` - URL trang gui form

**Xu ly**:
1. Validate: `phone_zalo` hoac `contact_name` bat buoc
2. Luu vao Cloudflare D1 bang `leads`
3. Gui Telegram ve nhom lead tong
4. Ghi vao Google Sheet `THEHAIRLAB_LEADS` tab `leads`
5. Tra JSON `{ success: true }` hoac `{ success: false, error: "..." }`

## 4) D1 Schema

```sql
CREATE TABLE IF NOT EXISTS leads (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	salon_name TEXT,
	contact_name TEXT,
	phone_zalo TEXT NOT NULL,
	area TEXT,
	product_interest TEXT,
	landing_page_sample TEXT,
	note TEXT,
	source_url TEXT,
	status TEXT DEFAULT 'new',
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 5) Cloudflare Secrets can cau hinh

| Secret | Mo ta |
|--------|-------|
| `TELEGRAM_BOT_TOKEN` | Token bot Telegram |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email service account GCP |
| `GOOGLE_PRIVATE_KEY` | Private key service account (PEM) |
| `GOOGLE_PROJECT_ID` | Project ID GCP |
| `GOOGLE_LEADS_SHEET_ID` | Sheet ID cua THEHAIRLAB_LEADS |

## 6) Cloudflare Variables

| Variable | Gia tri mac dinh |
|----------|-----------------|
| `TELEGRAM_LEADS_CHAT_ID` | ID nhom Telegram nhan lead |
| `GOOGLE_LEADS_SHEET_TAB` | `leads` |

## 7) Google Sheet THEHAIRLAB_LEADS

Tab: `leads`

Columns:
1. Thoi gian
2. Nguon trang
3. Ten salon
4. Nguoi lien he
5. So dien thoai / Zalo
6. Khu vuc
7. Nhom san pham quan tam
8. Mau landing page muon nhan
9. Ghi chu
10. Trang thai xu ly
11. Nguoi phu trach
12. Ngay hen goi lai
13. Ghi chu cham soc

## 8) Deploy

### Website (Vercel)
- Output Directory: `.` (root)
- Framework: Other
- Domain: thehairlab.top, www.thehairlab.top

### Worker (Cloudflare)
```bash
cd worker
npm install
wrangler d1 create thehairlab-leads
wrangler d1 execute thehairlab-leads --file=schema.sql
wrangler deploy
```

### Sau khi deploy Worker, cap nhat bien:
```
VITE_LEADS_API_URL=https://thehairlab-worker.YOUR_SUBDOMAIN.workers.dev/api/leads
```
hoac set trong script.js (window.THEHAIRLAB_CONFIG.lead.apiEndpoint).

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