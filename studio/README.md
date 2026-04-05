# The Hair Lab Sanity Studio

Studio CMS riêng cho website tĩnh ở thư mục gốc.

## Chạy local

1. Cài dependencies:

   ```bash
   cd studio
   npm install
   ```

2. Tạo file `.env` từ `.env.example` và điền:

   - `SANITY_STUDIO_PROJECT_ID`
   - `SANITY_STUDIO_DATASET`

3. Chạy Studio:

   ```bash
   npm run dev
   ```

## Build/deploy

```bash
npm run build
npm run deploy
```

Trên Vercel (project trỏ vào thư mục `studio`):

- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `SANITY_STUDIO_PROJECT_ID`
  - `SANITY_STUDIO_DATASET`
