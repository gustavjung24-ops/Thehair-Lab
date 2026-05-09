/**
 * Cloudflare Worker – POST /api/leads
 *
 * Nhận lead từ form trang chính TheHairLab.top.
 * 1. Validate fields
 * 2. Lưu vào D1
 * 3. Gửi Telegram
 * 4. Ghi Google Sheet
 */

const ALLOWED_ORIGINS = [
  'https://www.thehairlab.top',
  'https://thehairlab.top',
  'https://thehair-lab.vercel.app',
  'http://127.0.0.1:5200',
  'http://localhost:5200',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

function errorResponse(message, status = 400, origin = '') {
  return jsonResponse({ success: false, error: message }, status, origin);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('INVALID_JSON');
  }
}

function validateSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

function normalizeSalonPayload(body) {
  const safeBody = body && typeof body === 'object' ? body : {};
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const nullableText = (value) => {
    const v = text(value);
    return v || null;
  };

  const statusRaw = text(safeBody.status).toLowerCase();
  const status = statusRaw || 'inactive';

  const themeColorRaw = text(safeBody.theme_color);
  const googleSheetTabRaw = text(safeBody.google_sheet_tab);

  return {
    salon_name: text(safeBody.salon_name),
    slug: text(safeBody.slug).toLowerCase(),
    phone: nullableText(safeBody.phone),
    zalo_url: nullableText(safeBody.zalo_url),
    facebook_url: nullableText(safeBody.facebook_url),
    address: nullableText(safeBody.address),
    working_hours: nullableText(safeBody.working_hours),
    logo_url: nullableText(safeBody.logo_url),
    banner_url: nullableText(safeBody.banner_url),
    theme_color: themeColorRaw || '#8b5cf6',
    google_sheet_url: nullableText(safeBody.google_sheet_url),
    google_sheet_id: nullableText(safeBody.google_sheet_id),
    google_sheet_tab: googleSheetTabRaw || 'appointments',
    telegram_chat_id: nullableText(safeBody.telegram_chat_id),
    admin_email: nullableText(safeBody.admin_email),
    status,
  };
}

function parsePath(requestUrl) {
  const url = new URL(requestUrl);
  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  return { pathname, segments };
}

function getAdminToken(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const bearerPrefix = 'Bearer ';
  if (authHeader.startsWith(bearerPrefix)) {
    return authHeader.slice(bearerPrefix.length).trim();
  }

  return (request.headers.get('x-admin-token') || '').trim();
}

function requireAdminAuth(request, env) {
  const expectedToken = (env.ADMIN_API_TOKEN || '').trim();
  if (!expectedToken) {
    return false;
  }

  const providedToken = getAdminToken(request);
  if (!providedToken || providedToken !== expectedToken) {
    return false;
  }

  return true;
}

// ─── Validation ────────────────────────────────────────────────────────────

function validateLead(body) {
  const phoneZalo = (body.phone_zalo || '').trim();
  const contactName = (body.contact_name || '').trim();

  if (!phoneZalo && !contactName) {
    return 'Vui lòng cung cấp số điện thoại / Zalo hoặc tên người liên hệ.';
  }

  if (phoneZalo && !/^[0-9+()\s.\-]{7,20}$/.test(phoneZalo)) {
    return 'Số điện thoại / Zalo không hợp lệ.';
  }

  return null;
}

// ─── D1 ────────────────────────────────────────────────────────────────────

async function saveToD1(env, lead) {
  const stmt = env.DB.prepare(`
    INSERT INTO leads
      (salon_name, contact_name, phone_zalo, area, product_interest, landing_page_sample, note, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = await stmt.bind(
    lead.salon_name || null,
    lead.contact_name || null,
    lead.phone_zalo,
    lead.area || null,
    lead.product_interest || null,
    lead.landing_page_sample || null,
    lead.note || null,
    lead.source_url || null,
  ).run();

  return result;
}

// ─── Telegram ──────────────────────────────────────────────────────────────

async function sendTelegram(env, lead) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_LEADS_CHAT_ID;

  if (!token || !chatId) return;

  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const lines = [
    `📋 <b>LEAD MỚI - The Hair Lab</b>`,
    `🕐 ${time}`,
    ``,
    lead.salon_name     ? `🏪 Salon: ${lead.salon_name}` : null,
    lead.contact_name   ? `👤 Liên hệ: ${lead.contact_name}` : null,
    lead.phone_zalo     ? `📱 SĐT/Zalo: <code>${lead.phone_zalo}</code>` : null,
    lead.area           ? `📍 Khu vực: ${lead.area}` : null,
    lead.product_interest ? `📦 Sản phẩm: ${lead.product_interest}` : null,
    lead.landing_page_sample ? `🎨 Mẫu web: ${lead.landing_page_sample}` : null,
    lead.note           ? `📝 Ghi chú: ${lead.note}` : null,
    lead.source_url     ? `🔗 Nguồn: ${lead.source_url}` : null,
  ].filter(Boolean).join('\n');

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines,
      parse_mode: 'HTML',
    }),
  });
}

// ─── Google Sheets ─────────────────────────────────────────────────────────

async function getGoogleAccessToken(env) {
  const serviceEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = env.GOOGLE_PRIVATE_KEY;

  if (!serviceEmail || !rawKey) return null;

  // Normalize PEM key (escaped \n in env var → real newline)
  const privateKeyPem = rawKey.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const unsignedToken = `${encode(header)}.${encode(claim)}`;

  // Import private key
  const keyData = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');

  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken),
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const jwt = `${unsignedToken}.${sig}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) return null;
  const tokenData = await tokenRes.json();
  return tokenData.access_token || null;
}

async function appendToSheet(env, lead) {
  const sheetId = env.GOOGLE_LEADS_SHEET_ID;
  const tabName = env.GOOGLE_LEADS_SHEET_TAB || 'leads';

  if (!sheetId) return;

  const accessToken = await getGoogleAccessToken(env);
  if (!accessToken) return;

  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const row = [
    time,
    lead.source_url || '',
    lead.salon_name || '',
    lead.contact_name || '',
    lead.phone_zalo || '',
    lead.area || '',
    lead.product_interest || '',
    lead.landing_page_sample || '',
    lead.note || '',
    'new',   // Trạng thái xử lý
    '',      // Người phụ trách
    '',      // Ngày hẹn gọi lại
    '',      // Ghi chú chăm sóc
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [row] }),
  });
}

// ─── Admin/Public Salons API ──────────────────────────────────────────────

async function getSalonById(env, id) {
  return env.DB.prepare('SELECT * FROM salons WHERE id = ? LIMIT 1').bind(id).first();
}

async function findSalonBySlug(env, slug) {
  return env.DB.prepare('SELECT id FROM salons WHERE slug = ? LIMIT 1').bind(slug).first();
}

async function listAdminSalons(env, origin) {
  const result = await env.DB.prepare('SELECT * FROM salons ORDER BY created_at DESC').all();
  return jsonResponse({ success: true, salons: result.results || [] }, 200, origin);
}

async function listPublicSalons(env, origin) {
  const result = await env.DB.prepare(`
    SELECT
      id,
      slug,
      salon_name,
      phone,
      zalo_url,
      facebook_url,
      address,
      working_hours,
      logo_url,
      banner_url,
      theme_color,
      google_sheet_url,
      google_sheet_id,
      google_sheet_tab,
      telegram_chat_id,
      admin_email,
      status,
      created_at,
      updated_at
    FROM salons
    ORDER BY updated_at DESC
  `).all();

  return jsonResponse({ success: true, salons: result.results || [] }, 200, origin);
}

function validateSalonPayload(payload) {
  if (!payload.salon_name) {
    return 'Tên salon là bắt buộc';
  }

  if (!payload.slug) {
    return 'Slug là bắt buộc';
  }

  if (!validateSlug(payload.slug)) {
    return 'Slug chỉ được gồm chữ thường a-z, số 0-9 và dấu -';
  }

  if (payload.status !== 'active' && payload.status !== 'inactive') {
    return 'Trạng thái không hợp lệ';
  }

  return null;
}

async function createAdminSalon(request, env, origin) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
  }

  const payload = normalizeSalonPayload(body);
  const validationError = validateSalonPayload(payload);
  if (validationError) {
    return errorResponse(validationError, 422, origin);
  }

  const duplicated = await findSalonBySlug(env, payload.slug);
  if (duplicated) {
    return errorResponse('Slug đã tồn tại', 409, origin);
  }

  const insertResult = await env.DB.prepare(`
    INSERT INTO salons (
      slug,
      salon_name,
      phone,
      zalo_url,
      facebook_url,
      address,
      working_hours,
      logo_url,
      banner_url,
      theme_color,
      google_sheet_url,
      google_sheet_id,
      google_sheet_tab,
      telegram_chat_id,
      admin_email,
      status,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    payload.slug,
    payload.salon_name,
    payload.phone,
    payload.zalo_url,
    payload.facebook_url,
    payload.address,
    payload.working_hours,
    payload.logo_url,
    payload.banner_url,
    payload.theme_color,
    payload.google_sheet_url,
    payload.google_sheet_id,
    payload.google_sheet_tab,
    payload.telegram_chat_id,
    payload.admin_email,
    payload.status,
  ).run();

  const salon = await getSalonById(env, insertResult.meta.last_row_id);
  return jsonResponse({ success: true, salon }, 201, origin);
}

async function updateAdminSalon(request, env, origin, id) {
  const salonId = Number.parseInt(id, 10);
  if (!Number.isInteger(salonId) || salonId <= 0) {
    return errorResponse('ID salon không hợp lệ', 400, origin);
  }

  const currentSalon = await getSalonById(env, salonId);
  if (!currentSalon) {
    return errorResponse('Salon không tồn tại', 404, origin);
  }

  let body;
  try {
    body = await readJson(request);
  } catch {
    return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
  }

  const payload = normalizeSalonPayload(body);
  const validationError = validateSalonPayload(payload);
  if (validationError) {
    return errorResponse(validationError, 422, origin);
  }

  const duplicated = await env.DB.prepare(
    'SELECT id FROM salons WHERE slug = ? AND id != ? LIMIT 1',
  ).bind(payload.slug, salonId).first();

  if (duplicated) {
    return errorResponse('Slug đã tồn tại', 409, origin);
  }

  await env.DB.prepare(`
    UPDATE salons
    SET
      slug = ?,
      salon_name = ?,
      phone = ?,
      zalo_url = ?,
      facebook_url = ?,
      address = ?,
      working_hours = ?,
      logo_url = ?,
      banner_url = ?,
      theme_color = ?,
      google_sheet_url = ?,
      google_sheet_id = ?,
      google_sheet_tab = ?,
      telegram_chat_id = ?,
      admin_email = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    payload.slug,
    payload.salon_name,
    payload.phone,
    payload.zalo_url,
    payload.facebook_url,
    payload.address,
    payload.working_hours,
    payload.logo_url,
    payload.banner_url,
    payload.theme_color,
    payload.google_sheet_url,
    payload.google_sheet_id,
    payload.google_sheet_tab,
    payload.telegram_chat_id,
    payload.admin_email,
    payload.status,
    salonId,
  ).run();

  const salon = await getSalonById(env, salonId);
  return jsonResponse({ success: true, salon }, 200, origin);
}

async function getPublicSalonBySlug(env, origin, slug) {
  const normalizedSlug = (slug || '').trim().toLowerCase();
  const salon = await env.DB.prepare(
    'SELECT * FROM salons WHERE slug = ? AND status = ? LIMIT 1',
  ).bind(normalizedSlug, 'active').first();

  if (!salon) {
    return errorResponse('Salon không tồn tại hoặc đang tạm ngưng', 404, origin);
  }

  // If admin_data_json exists, parse and merge with basic salon info
  let adminData = null;
  if (salon.admin_data_json) {
    try {
      adminData = JSON.parse(salon.admin_data_json);
    } catch {
      // If JSON parse fails, return basic salon info only
      adminData = null;
    }
  }

  const returnData = {
    ...salon,
    admin_data: adminData, // Include parsed admin data for public page rendering
  };

  return jsonResponse({ success: true, salon: returnData }, 200, origin);
}

async function saveAdminSalonBySlug(request, env, origin, slug) {
  const normalizedSlug = (slug || '').trim().toLowerCase();
  
  if (!normalizedSlug || !/^[a-z0-9-]+$/.test(normalizedSlug)) {
    return errorResponse('Slug không hợp lệ', 400, origin);
  }

  let body;
  try {
    body = await readJson(request);
  } catch {
    return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
  }

  // body should contain full admin version 3 data:
  // { salon, theme, hero, trustBadges, services, consultation, gallery, products, feedback, booking }
  if (!body || typeof body !== 'object') {
    return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
  }

  const salonPayload = body.salon && typeof body.salon === 'object' ? body.salon : {};
  const salonName = typeof salonPayload.name === 'string' && salonPayload.name.trim()
    ? salonPayload.name.trim()
    : null;
  const phone = typeof salonPayload.phone === 'string' && salonPayload.phone.trim()
    ? salonPayload.phone.trim()
    : null;
  const zalo = typeof salonPayload.zalo === 'string' && salonPayload.zalo.trim()
    ? salonPayload.zalo.trim()
    : null;
  const address = typeof salonPayload.address === 'string' && salonPayload.address.trim()
    ? salonPayload.address.trim()
    : null;
  const status = salonPayload.status === 'active' || salonPayload.status === 'inactive'
    ? salonPayload.status
    : null;

  // Check if salon exists by slug
  const existing = await env.DB.prepare(
    'SELECT id AS salon_id FROM salons WHERE slug = ? LIMIT 1',
  ).bind(normalizedSlug).first();

  // Serialize admin data to JSON
  let adminDataJson;
  try {
    adminDataJson = JSON.stringify(body);
  } catch {
    return errorResponse('Không thể serialize dữ liệu admin', 400, origin);
  }

  if (existing) {
    await env.DB.prepare(
      `UPDATE salons
       SET admin_data_json = ?,
           salon_name = COALESCE(?, salon_name),
           phone = COALESCE(?, phone),
           zalo_url = COALESCE(?, zalo_url),
           address = COALESCE(?, address),
           status = COALESCE(?, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE slug = ?`,
    ).bind(
      adminDataJson,
      salonName,
      phone,
      zalo,
      address,
      status,
      normalizedSlug,
    ).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO salons (
         slug,
         salon_name,
         phone,
         zalo_url,
         address,
         status,
         admin_data_json,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    ).bind(
      normalizedSlug,
      salonName || normalizedSlug,
      phone,
      zalo,
      address,
      status || 'active',
      adminDataJson,
    ).run();
  }

  // Return updated salon
  const updated = await env.DB.prepare(
    'SELECT * FROM salons WHERE slug = ? LIMIT 1',
  ).bind(normalizedSlug).first();

  return jsonResponse({ success: true, salon: updated }, 200, origin);
}

// ─── Main Handler ──────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const { pathname, segments } = parsePath(request.url);
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // GET /api/salons/:slug (public, trả admin data từ D1)
    if (segments.length === 3 && segments[0] === 'api' && segments[1] === 'salons' && method === 'GET') {
      return getPublicSalonBySlug(env, origin, decodeURIComponent(segments[2] || ''));
    }

    // PUT /api/admin/salons/:slug (admin saves to D1)
    if (segments.length === 4 && segments[0] === 'api' && segments[1] === 'admin' && segments[2] === 'salons' && method === 'PUT') {
      return saveAdminSalonBySlug(request, env, origin, decodeURIComponent(segments[3] || ''));
    }

    if (pathname === '/api/admin/salons' && method === 'GET') {
      if (!requireAdminAuth(request, env)) {
        return errorResponse('Unauthorized', 401, origin);
      }
      return listAdminSalons(env, origin);
    }

    if (pathname === '/api/public/salons' && method === 'GET') {
      return listPublicSalons(env, origin);
    }

    if (pathname === '/api/admin/salons' && method === 'POST') {
      if (!requireAdminAuth(request, env)) {
        return errorResponse('Unauthorized', 401, origin);
      }
      return createAdminSalon(request, env, origin);
    }

    if (segments.length === 4 && segments[0] === 'api' && segments[1] === 'admin' && segments[2] === 'salons' && method === 'PUT') {
      if (!requireAdminAuth(request, env)) {
        return errorResponse('Unauthorized', 401, origin);
      }
      return updateAdminSalon(request, env, origin, segments[3]);
    }

    if (segments.length === 4 && segments[0] === 'api' && segments[1] === 'public' && segments[2] === 'salons' && method === 'GET') {
      return getPublicSalonBySlug(env, origin, decodeURIComponent(segments[3] || ''));
    }

    if (pathname !== '/api/leads' || method !== 'POST') {
      return errorResponse('Not found', 404, origin);
    }

    // Parse body
    let body;
    try {
      body = await readJson(request);
    } catch {
      return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
    }

    // Validate
    const validationError = validateLead(body);
    if (validationError) {
      return errorResponse(validationError, 422, origin);
    }

    const lead = {
      salon_name: (body.salon_name || '').trim(),
      contact_name: (body.contact_name || '').trim(),
      phone_zalo: (body.phone_zalo || '').trim(),
      area: (body.area || '').trim(),
      product_interest: (body.product_interest || '').trim(),
      landing_page_sample: (body.landing_page_sample || '').trim(),
      note: (body.note || '').trim(),
      source_url: (body.source_url || '').trim(),
    };

    // Save to D1
    try {
      await saveToD1(env, lead);
    } catch (err) {
      return errorResponse('Lỗi lưu dữ liệu. Vui lòng thử lại.', 500, origin);
    }

    // Fire-and-forget: Telegram + Google Sheets (không block response)
    Promise.allSettled([
      sendTelegram(env, lead),
      appendToSheet(env, lead),
    ]).catch(() => {});

    return jsonResponse({ success: true, message: 'Đã nhận thông tin, bên em sẽ liên hệ tư vấn.' }, 200, origin);
  },
};
