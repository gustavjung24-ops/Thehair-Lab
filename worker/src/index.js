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

const DEFAULT_HOMEPAGE_SETTINGS = {
  siteName: 'The Hair Lab',
  siteUrl: 'https://www.thehairlab.top/',
  quoteTelegramChatId: '-5104953507',
  googleSheetUrl: '',
  googleSheetId: '',
  googleSheetTab: 'homepage_quotes',
  googleAppsScriptUrl: '',
  quoteEnabled: true,
  internalNote: '',
};

function normalizeHomepageSettings(body) {
  const safeBody = body && typeof body === 'object' ? body : {};
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const bool = (value, fallback) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    }
    return fallback;
  };

  return {
    siteName: text(safeBody.siteName) || DEFAULT_HOMEPAGE_SETTINGS.siteName,
    siteUrl: text(safeBody.siteUrl) || DEFAULT_HOMEPAGE_SETTINGS.siteUrl,
    quoteTelegramChatId: text(safeBody.quoteTelegramChatId) || DEFAULT_HOMEPAGE_SETTINGS.quoteTelegramChatId,
    googleSheetUrl: text(safeBody.googleSheetUrl),
    googleSheetId: text(safeBody.googleSheetId),
    googleSheetTab: text(safeBody.googleSheetTab) || DEFAULT_HOMEPAGE_SETTINGS.googleSheetTab,
    googleAppsScriptUrl: text(safeBody.googleAppsScriptUrl),
    quoteEnabled: bool(safeBody.quoteEnabled, DEFAULT_HOMEPAGE_SETTINGS.quoteEnabled),
    internalNote: text(safeBody.internalNote),
  };
}

function resolveGoogleSheetIdFromUrl(sheetUrl) {
  const value = String(sheetUrl || '').trim();
  if (!value) {
    return '';
  }

  const byPath = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (byPath) {
    return byPath[1];
  }

  const byQuery = value.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (byQuery) {
    return byQuery[1];
  }

  return '';
}

function normalizeGoogleAppsScriptUrl(scriptUrl) {
  return String(scriptUrl || '').trim();
}

async function postToGoogleAppsScript(scriptUrl, payload) {
  const url = normalizeGoogleAppsScriptUrl(scriptUrl);
  if (!url) {
    return { ok: false, skipped: true, warning: 'Chưa cấu hình Google Apps Script Web App URL.' };
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { ok: false, warning: `Không kết nối được Google Apps Script: ${error?.message || error}` };
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.success === false) {
    return { ok: false, warning: data?.error || `HTTP ${response.status}` };
  }

  return { ok: true, response: data };
}

async function getSiteSettingsRow(env, key) {
  if (!env?.DB) {
    return null;
  }

  try {
    await ensureSiteSettingsSchema(env);
    return await env.DB.prepare('SELECT key, value_json, updated_at FROM site_settings WHERE key = ? LIMIT 1')
      .bind(key)
      .first();
  } catch {
    return null;
  }
}

async function upsertSiteSettingsRow(env, key, valueJson) {
  try {
    await ensureSiteSettingsSchema(env);
    await env.DB.prepare(`
      INSERT INTO site_settings (key, value_json, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = CURRENT_TIMESTAMP
    `).bind(key, valueJson).run();
  } catch (error) {
    throw new Error(`SITE_SETTINGS_SAVE_FAILED: ${error?.message || error}`);
  }
}

async function loadHomepageSettings(env) {
  const row = await getSiteSettingsRow(env, 'homepage');
  if (!row?.value_json) {
    return { ...DEFAULT_HOMEPAGE_SETTINGS };
  }

  try {
    return {
      ...DEFAULT_HOMEPAGE_SETTINGS,
      ...normalizeHomepageSettings(JSON.parse(row.value_json)),
    };
  } catch {
    return { ...DEFAULT_HOMEPAGE_SETTINGS };
  }
}

function publicHomepageSettings(settings) {
  return {
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    googleSheetUrl: settings.googleSheetUrl || '',
    googleSheetId: settings.googleSheetId || '',
    googleSheetTab: settings.googleSheetTab || DEFAULT_HOMEPAGE_SETTINGS.googleSheetTab,
    googleAppsScriptUrl: settings.googleAppsScriptUrl || '',
    quoteEnabled: Boolean(settings.quoteEnabled),
  };
}

function adminHomepageSettings(settings) {
  return {
    ...DEFAULT_HOMEPAGE_SETTINGS,
    ...settings,
  };
}

let siteSettingsSchemaEnsured = false;
let salonsSchemaEnsured = false;

async function ensureSiteSettingsSchema(env) {
  if (siteSettingsSchemaEnsured || !env?.DB) {
    return;
  }

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON site_settings(updated_at)
    `).run();
  } catch {
    return;
  }

  siteSettingsSchemaEnsured = true;
}

async function ensureSalonsSchema(env) {
  if (salonsSchemaEnsured || !env?.DB) {
    return;
  }

  try {
    const columnsResult = await env.DB.prepare('PRAGMA table_info(salons)').all();
    const columns = Array.isArray(columnsResult?.results) ? columnsResult.results : [];
    const hasAppsScriptUrl = columns.some((column) => column?.name === 'google_apps_script_url');

    if (!hasAppsScriptUrl) {
      await env.DB.prepare('ALTER TABLE salons ADD COLUMN google_apps_script_url TEXT').run();
    }
  } catch {
    return;
  }

  salonsSchemaEnsured = true;
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
    google_apps_script_url: nullableText(safeBody.google_apps_script_url),
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

function parseSalonAdminData(adminDataJson) {
  if (!adminDataJson || typeof adminDataJson !== 'string') {
    return null;
  }

  try {
    return JSON.parse(adminDataJson);
  } catch {
    return null;
  }
}

function resolveSalonTelegramChatId(salonRow) {
  const direct = typeof salonRow?.telegram_chat_id === 'string'
    ? salonRow.telegram_chat_id.trim()
    : '';
  if (direct) {
    return direct;
  }

  const adminData = parseSalonAdminData(salonRow?.admin_data_json);
  const nested = typeof adminData?.salon?.telegram_chat_id === 'string'
    ? adminData.salon.telegram_chat_id.trim()
    : '';
  if (nested) {
    return nested;
  }

  const root = typeof adminData?.telegram_chat_id === 'string'
    ? adminData.telegram_chat_id.trim()
    : '';
  return root || null;
}

async function tableExists(env, tableName) {
  const row = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
  ).bind(tableName).first();
  return Boolean(row?.name);
}

async function saveSalonLeadIfPossible(env, lead) {
  if (!env?.DB) {
    return { saved: false, warning: 'Worker chưa có binding D1.' };
  }

  const hasLeadsTable = await tableExists(env, 'leads');
  if (!hasLeadsTable) {
    return { saved: false, warning: 'Không tìm thấy bảng leads trong D1, đã bỏ qua lưu lead.' };
  }

  const noteLines = [];
  if (lead.preferredDate) {
    noteLines.push(`Ngay hen: ${lead.preferredDate}`);
  }
  if (lead.preferredTime) {
    noteLines.push(`Gio hen: ${lead.preferredTime}`);
  }
  if (lead.note) {
    noteLines.push(`Ghi chu: ${lead.note}`);
  }
  const mergedNote = noteLines.join('\n') || null;

  const result = await env.DB.prepare(`
    INSERT INTO leads
      (salon_id, salon_slug, salon_name, contact_name, phone_zalo, product_interest, note, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    lead.salonId,
    lead.salonSlug,
    lead.salonName,
    lead.name,
    lead.phone,
    lead.service || null,
    mergedNote,
    lead.sourceUrl || null,
  ).run();

  return {
    saved: true,
    leadId: result?.meta?.last_row_id || null,
  };
}

async function sendSalonLeadTelegram(env, chatId, lead) {
  const token = (env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!token) {
    return {
      ok: false,
      error: 'TELEGRAM_BOT_TOKEN chưa được cấu hình trong Worker secret.',
    };
  }

  if (!chatId) {
    return {
      ok: false,
      error: 'Salon chưa cấu hình Telegram Chat ID.',
    };
  }

  const lines = [
    `💇 <b>LỊCH HẸN MỚI - ${lead.salonName}</b>`,
    '',
    `Khách: ${lead.name}`,
    `SĐT: ${lead.phone}`,
    `Dịch vụ: ${lead.service || '(không ghi)'}`,
    `Ngày: ${lead.preferredDate || '(không ghi)'}`,
    `Giờ: ${lead.preferredTime || '(không ghi)'}`,
    `Ghi chú: ${lead.note || '(không ghi)'}`,
    '',
    `Nguồn: ${lead.sourceUrl || '(không ghi)'}`,
  ];

  let tgRes;
  try {
    tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    return {
      ok: false,
      error: `Không kết nối được Telegram API: ${err?.message || err}`,
    };
  }

  let tgData = null;
  try {
    tgData = await tgRes.json();
  } catch {
    tgData = null;
  }

  if (tgData?.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    error: tgData?.description || `HTTP ${tgRes.status}`,
  };
}

async function handleSalonLeadSubmit(request, env, origin, slug) {
  const normalizedSlug = (slug || '').trim().toLowerCase();
  if (!validateSlug(normalizedSlug)) {
    return errorResponse('Slug không hợp lệ.', 400, origin);
  }

  let body;
  try {
    body = await readJson(request);
  } catch {
    return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
  }

  const name = String(body?.name || '').trim();
  const phone = String(body?.phone || '').trim();
  const service = String(body?.service || '').trim();
  const preferredDate = String(body?.preferredDate || '').trim();
  const preferredTime = String(body?.preferredTime || '').trim();
  const note = String(body?.note || '').trim();
  const sourceUrl = String(body?.sourceUrl || '').trim();

  if (!name) {
    return errorResponse('Vui lòng nhập họ tên.', 422, origin);
  }

  if (!phone) {
    return errorResponse('Vui lòng nhập số điện thoại.', 422, origin);
  }

  if (!/^[0-9+()\s.\-]{7,20}$/.test(phone)) {
    return errorResponse('Số điện thoại không hợp lệ.', 422, origin);
  }

  const salon = await env.DB.prepare(
    'SELECT id, slug, salon_name, telegram_chat_id, google_sheet_url, google_sheet_id, google_sheet_tab, google_apps_script_url, admin_data_json FROM salons WHERE slug = ? LIMIT 1',
  ).bind(normalizedSlug).first();

  if (!salon) {
    return errorResponse('Không tìm thấy salon theo slug.', 404, origin);
  }

  const leadPayload = {
    salonId: salon.id || null,
    salonSlug: salon.slug || normalizedSlug,
    salonName: salon.salon_name || normalizedSlug,
    name,
    phone,
    service,
    preferredDate,
    preferredTime,
    note,
    sourceUrl: sourceUrl || request.url,
  };

  let saveResult;
  try {
    saveResult = await saveSalonLeadIfPossible(env, leadPayload);
  } catch (err) {
    return errorResponse(`Lỗi lưu lead vào D1: ${err?.message || err}`, 500, origin);
  }

  const telegramChatId = resolveSalonTelegramChatId(salon);
  const telegramResult = await sendSalonLeadTelegram(env, telegramChatId, leadPayload);

  if (telegramResult.ok) {
    const sheetResult = await appendSalonLeadToSheet(env, salon, leadPayload);
    return jsonResponse(
      {
        success: true,
        message: 'Đã gửi thông tin tư vấn. Salon sẽ liên hệ lại sớm.',
        leadSaved: Boolean(saveResult?.saved),
        telegramSent: true,
        sheetSaved: Boolean(sheetResult?.saved),
        warning: sheetResult?.warning || saveResult?.warning || null,
      },
      200,
      origin,
    );
  }

  if (saveResult?.saved) {
    return jsonResponse(
      {
        success: false,
        leadSaved: true,
        telegramSent: false,
        warning: `Đã lưu thông tin, nhưng gửi Telegram thất bại. ${telegramResult.error}`,
      },
      200,
      origin,
    );
  }

  return errorResponse(`Gửi Telegram thất bại: ${telegramResult.error}`, 502, origin);
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

  await appendRowToSheet(accessToken, sheetId, tabName, row);
}

async function appendRowToSheet(accessToken, sheetId, tabName, row) {
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

async function appendConfiguredSheetRow(env, config) {
  const sheetId = config.googleSheetId || resolveGoogleSheetIdFromUrl(config.googleSheetUrl);
  const tabName = config.googleSheetTab || config.defaultTab || 'Sheet1';
  const row = Array.isArray(config.row) ? config.row : [];
  const formLabel = config.formLabel || 'dữ liệu';
  const scriptUrl = normalizeGoogleAppsScriptUrl(config.googleAppsScriptUrl);

  if (scriptUrl) {
    const scriptResult = await postToGoogleAppsScript(scriptUrl, {
      formType: config.formType || 'unknown',
      spreadsheetId: sheetId,
      sheetTab: tabName,
      row,
      data: config.data || {},
    });

    if (scriptResult.ok) {
      return { ok: true, saved: true, transport: 'apps-script' };
    }

    if (sheetId) {
      const accessToken = await getGoogleAccessToken(env);
      if (accessToken) {
        try {
          await appendRowToSheet(accessToken, sheetId, tabName, row);
          return {
            ok: true,
            saved: true,
            transport: 'google-api',
            warning: `Apps Script thất bại: ${scriptResult.warning || 'Không rõ nguyên nhân'}. Đã fallback ghi trực tiếp Google Sheet.`,
          };
        } catch (error) {
          return {
            ok: false,
            saved: false,
            warning: `Apps Script thất bại: ${scriptResult.warning || 'Không rõ nguyên nhân'}. Fallback Google Sheet cũng thất bại: ${error?.message || error}`,
          };
        }
      }
    }

    return {
      ok: false,
      saved: false,
      warning: `Apps Script thất bại: ${scriptResult.warning || 'Không rõ nguyên nhân'}`,
    };
  }

  if (!sheetId) {
    return { ok: false, skipped: true, warning: `Chưa cấu hình Google Sheet ID cho ${formLabel}.` };
  }

  const accessToken = await getGoogleAccessToken(env);
  if (!accessToken) {
    return { ok: false, skipped: true, warning: 'Chưa cấu hình Google service account để ghi Google Sheet.' };
  }

  try {
    await appendRowToSheet(accessToken, sheetId, tabName, row);
    return { ok: true, saved: true, transport: 'google-api' };
  } catch (error) {
    return { ok: false, saved: false, warning: `Ghi Google Sheet thất bại: ${error?.message || error}` };
  }
}

async function appendHomepageQuoteToSheet(env, settings, quote) {
  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const row = [
    time,
    quote.sourceUrl || '',
    quote.businessName || '',
    quote.contactName || '',
    quote.phone || '',
    quote.area || '',
    quote.interest || '',
    quote.businessModel || '',
    quote.note || '',
  ];

  return appendConfiguredSheetRow(env, {
    formType: 'homepage',
    formLabel: 'trang chủ',
    googleAppsScriptUrl: settings.googleAppsScriptUrl,
    googleSheetUrl: settings.googleSheetUrl,
    googleSheetId: settings.googleSheetId,
    googleSheetTab: settings.googleSheetTab || DEFAULT_HOMEPAGE_SETTINGS.googleSheetTab,
    defaultTab: DEFAULT_HOMEPAGE_SETTINGS.googleSheetTab,
    row,
    data: quote,
  });
}

async function appendSalonLeadToSheet(env, salon, lead) {
  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const row = [
    time,
    lead.sourceUrl || '',
    lead.salonName || '',
    lead.name || '',
    lead.phone || '',
    lead.service || '',
    lead.preferredDate || '',
    lead.preferredTime || '',
    lead.note || '',
  ];

  return appendConfiguredSheetRow(env, {
    formType: 'salon',
    formLabel: `salon ${salon?.slug || ''}`.trim() || 'salon',
    googleAppsScriptUrl: salon?.google_apps_script_url,
    googleSheetUrl: salon?.google_sheet_url,
    googleSheetId: salon?.google_sheet_id,
    googleSheetTab: salon?.google_sheet_tab || 'appointments',
    defaultTab: 'appointments',
    row,
    data: {
      salonSlug: salon?.slug || '',
      salonName: lead.salonName || '',
      contactName: lead.name || '',
      phone: lead.phone || '',
      service: lead.service || '',
      preferredDate: lead.preferredDate || '',
      preferredTime: lead.preferredTime || '',
      note: lead.note || '',
      sourceUrl: lead.sourceUrl || '',
    },
  });
}

function buildHomepageQuoteMessage(quote) {
  return [
    '📩 <b>YÊU CẦU BÁO GIÁ MỚI - THE HAIR LAB</b>',
    '',
    `Tên salon: ${quote.businessName}`,
    `Người liên hệ: ${quote.contactName}`,
    `SĐT/Zalo: ${quote.phone}`,
    `Khu vực: ${quote.area || '(không ghi)'}`,
    `Nhóm sản phẩm quan tâm: ${quote.interest || '(không ghi)'}`,
    `Mẫu landing page muốn nhận: ${quote.businessModel || '(không ghi)'}`,
    `Ghi chú: ${quote.note || '(không ghi)'}`,
    '',
    `Nguồn: ${quote.sourceUrl || DEFAULT_HOMEPAGE_SETTINGS.siteUrl}`,
  ].join('\n');
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
      google_apps_script_url,
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
      google_apps_script_url,
      telegram_chat_id,
      admin_email,
      status,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
    payload.google_apps_script_url,
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
      google_apps_script_url = ?,
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
    payload.google_apps_script_url,
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

  const telegramChatId = typeof salonPayload.telegram_chat_id === 'string'
    ? (salonPayload.telegram_chat_id.trim() || null)
    : null;
  const googleSheetUrl = typeof salonPayload.google_sheet_url === 'string'
    ? (salonPayload.google_sheet_url.trim() || null)
    : null;
  const googleSheetId = typeof salonPayload.google_sheet_id === 'string'
    ? (salonPayload.google_sheet_id.trim() || null)
    : null;
  const googleSheetTab = typeof salonPayload.google_sheet_tab === 'string'
    ? (salonPayload.google_sheet_tab.trim() || null)
    : null;
  const googleAppsScriptUrl = typeof salonPayload.google_apps_script_url === 'string'
    ? (salonPayload.google_apps_script_url.trim() || null)
    : null;

  if (existing) {
    await env.DB.prepare(
      `UPDATE salons
       SET admin_data_json = ?,
           salon_name = COALESCE(?, salon_name),
           phone = COALESCE(?, phone),
           zalo_url = COALESCE(?, zalo_url),
           address = COALESCE(?, address),
           status = COALESCE(?, status),
           google_sheet_url = COALESCE(?, google_sheet_url),
           google_sheet_id = COALESCE(?, google_sheet_id),
           google_sheet_tab = COALESCE(?, google_sheet_tab),
           google_apps_script_url = COALESCE(?, google_apps_script_url),
           telegram_chat_id = COALESCE(?, telegram_chat_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE slug = ?`,
    ).bind(
      adminDataJson,
      salonName,
      phone,
      zalo,
      address,
      status,
      googleSheetUrl,
      googleSheetId,
      googleSheetTab,
      googleAppsScriptUrl,
      telegramChatId,
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
         google_sheet_url,
         google_sheet_id,
         google_sheet_tab,
         google_apps_script_url,
         admin_data_json,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    ).bind(
      normalizedSlug,
      salonName || normalizedSlug,
      phone,
      zalo,
      address,
      status || 'active',
      googleSheetUrl,
      googleSheetId,
      googleSheetTab,
      googleAppsScriptUrl,
      adminDataJson,
    ).run();
  }

  // Return updated salon
  const updated = await env.DB.prepare(
    'SELECT * FROM salons WHERE slug = ? LIMIT 1',
  ).bind(normalizedSlug).first();

  return jsonResponse({ success: true, salon: updated }, 200, origin);
}

// ─── Telegram Admin Test ──────────────────────────────────────────────────

async function handleAdminTelegramTest(request, env, origin) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
  }

  const chatId = String(body?.chatId || '').trim();
  const salonName = String(body?.salonName || '').trim();

  if (!chatId) {
    return errorResponse('Thiếu chatId.', 400, origin);
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return errorResponse('TELEGRAM_BOT_TOKEN chưa được cấu hình trong Worker secret.', 500, origin);
  }

  const text = [
    `✅ <b>Test Telegram - The Hair Lab</b>`,
    `🏪 Salon: ${salonName || '(không tên)'}`,
    `💬 Chat ID: <code>${chatId}</code>`,
    `🔗 Kết nối thành công.`,
  ].join('\n');

  let tgRes;
  try {
    tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    return errorResponse(`Không kết nối được Telegram API: ${err?.message || err}`, 502, origin);
  }

  let tgData;
  try {
    tgData = await tgRes.json();
  } catch {
    tgData = null;
  }

  if (tgData?.ok) {
    return jsonResponse({ success: true, message: 'Đã gửi Telegram thành công.' }, 200, origin);
  }

  const errDesc = tgData?.description || `HTTP ${tgRes.status}`;
  return jsonResponse({ success: false, error: `Telegram API lỗi: ${errDesc}` }, 200, origin);
}

async function handleAdminHomepageSettingsGet(env, origin) {
  const settings = adminHomepageSettings(await loadHomepageSettings(env));
  return jsonResponse({ success: true, settings }, 200, origin);
}

async function handleAdminHomepageSettingsPut(request, env, origin) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
  }

  const current = await loadHomepageSettings(env);
  const merged = normalizeHomepageSettings({ ...current, ...body });
  await upsertSiteSettingsRow(env, 'homepage', JSON.stringify(merged));
  return jsonResponse({ success: true, settings: adminHomepageSettings(merged) }, 200, origin);
}

async function handleAdminHomepageSettingsTestTelegram(env, origin) {
  const settings = await loadHomepageSettings(env);
  const token = (env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!token) {
    return errorResponse('TELEGRAM_BOT_TOKEN chưa được cấu hình trong Worker secret.', 500, origin);
  }

  const chatId = settings.quoteTelegramChatId || DEFAULT_HOMEPAGE_SETTINGS.quoteTelegramChatId;
  const text = [
    '🧪 <b>Test Telegram trang chủ - The Hair Lab</b>',
    '',
    `Site: ${settings.siteName}`,
    `Chat ID: <code>${chatId}</code>`,
    `Sheet tab: ${settings.googleSheetTab || DEFAULT_HOMEPAGE_SETTINGS.googleSheetTab}`,
  ].join('\n');

  let tgRes;
  try {
    tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    return errorResponse(`Không kết nối được Telegram API: ${err?.message || err}`, 502, origin);
  }

  const tgData = await tgRes.json().catch(() => null);
  if (!tgData?.ok) {
    return jsonResponse({ success: false, error: tgData?.description || `HTTP ${tgRes.status}` }, 200, origin);
  }

  return jsonResponse({ success: true, telegramSent: true }, 200, origin);
}

async function handleAdminHomepageSettingsTestSheet(env, origin) {
  const settings = await loadHomepageSettings(env);
  if (!settings.quoteEnabled) {
    return jsonResponse({ success: false, error: 'Báo giá trang chủ đang tắt.' }, 200, origin);
  }

  const result = await appendHomepageQuoteToSheet(env, settings, {
    businessName: 'Test Google Sheet - The Hair Lab',
    contactName: 'System Test',
    phone: '0000000000',
    area: 'homepage-settings',
    interest: 'test-sheet',
    businessModel: settings.googleSheetTab || DEFAULT_HOMEPAGE_SETTINGS.googleSheetTab,
    note: 'Test từ admin tổng',
    sourceUrl: settings.siteUrl,
  });

  if (result.ok || result.skipped) {
    return jsonResponse({ success: true, sheetSaved: Boolean(result.saved), warning: result.warning || null }, 200, origin);
  }

  return jsonResponse({ success: false, error: result.warning || 'Ghi Google Sheet thất bại.' }, 200, origin);
}

async function handleAdminSalonGoogleSheetTest(env, origin, slug) {
  const normalizedSlug = (slug || '').trim().toLowerCase();
  if (!validateSlug(normalizedSlug)) {
    return errorResponse('Slug không hợp lệ.', 400, origin);
  }

  const salon = await env.DB.prepare(
    'SELECT slug, salon_name, google_sheet_url, google_sheet_id, google_sheet_tab, google_apps_script_url FROM salons WHERE slug = ? LIMIT 1',
  ).bind(normalizedSlug).first();

  if (!salon) {
    return errorResponse('Không tìm thấy salon theo slug.', 404, origin);
  }

  const googleAppsScriptUrl = normalizeGoogleAppsScriptUrl(salon.google_apps_script_url);
  const googleSheetId = String(salon.google_sheet_id || '').trim() || resolveGoogleSheetIdFromUrl(salon.google_sheet_url);
  const googleSheetTab = String(salon.google_sheet_tab || '').trim();

  if (!googleAppsScriptUrl) {
    return jsonResponse({ success: false, sheetSaved: false, error: 'Thiếu google_apps_script_url trong cấu hình salon.' }, 200, origin);
  }

  if (!googleSheetId) {
    return jsonResponse({ success: false, sheetSaved: false, error: 'Thiếu google_sheet_id trong cấu hình salon.' }, 200, origin);
  }

  if (!googleSheetTab) {
    return jsonResponse({ success: false, sheetSaved: false, error: 'Thiếu google_sheet_tab trong cấu hình salon.' }, 200, origin);
  }

  const now = new Date();
  const createdAt = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const today = now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const currentTime = now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const payloadData = {
    created_at: createdAt,
    salon_slug: salon.slug || normalizedSlug,
    salon_name: salon.salon_name || normalizedSlug,
    customer_name: 'TEST GOOGLE SHEET ADMIN',
    phone: '0900000000',
    service: 'Test Sheet',
    preferred_date: today,
    preferred_time: currentTime,
    note: 'Test từ nút admin',
    source_url: 'https://www.thehairlab.top/admin/',
    status: 'test',
  };

  const scriptResult = await postToGoogleAppsScript(googleAppsScriptUrl, {
    type: 'salon_appointment',
    formType: 'salon',
    sheetId: googleSheetId,
    spreadsheetId: googleSheetId,
    sheetTab: googleSheetTab,
    data: payloadData,
    row: [
      payloadData.created_at,
      payloadData.source_url,
      payloadData.salon_name,
      payloadData.customer_name,
      payloadData.phone,
      payloadData.service,
      payloadData.preferred_date,
      payloadData.preferred_time,
      payloadData.note,
      payloadData.status,
    ],
  });

  if (!scriptResult.ok) {
    return jsonResponse({
      success: false,
      sheetSaved: false,
      error: scriptResult.warning || 'Apps Script ghi sheet thất bại.',
    }, 200, origin);
  }

  return jsonResponse({
    success: true,
    sheetSaved: true,
    sheetResult: scriptResult.response || null,
  }, 200, origin);
}

async function handlePublicQuote(request, env, origin) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    return errorResponse('Dữ liệu không hợp lệ.', 400, origin);
  }

  const businessName = String(body?.businessName || '').trim();
  const contactName = String(body?.contactName || '').trim();
  const phone = String(body?.phone || '').trim();
  const area = String(body?.area || '').trim();
  const interest = String(body?.interest || '').trim();
  const businessModel = String(body?.businessModel || '').trim();
  const note = String(body?.note || '').trim();
  const sourceUrl = String(body?.sourceUrl || '').trim() || 'https://www.thehairlab.top/';

  const settings = await loadHomepageSettings(env);
  if (!settings.quoteEnabled) {
    return errorResponse('Trang chủ hiện đang tạm tắt nhận báo giá.', 503, origin);
  }

  if (!businessName) {
    return errorResponse('Vui lòng nhập tên salon.', 422, origin);
  }

  if (!contactName) {
    return errorResponse('Vui lòng nhập người liên hệ.', 422, origin);
  }

  if (!phone) {
    return errorResponse('Vui lòng nhập số điện thoại.', 422, origin);
  }

  if (!/^[0-9+()\s.\-]{7,20}$/.test(phone)) {
    return errorResponse('Số điện thoại không hợp lệ.', 422, origin);
  }

  const token = (env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!token) {
    return errorResponse('TELEGRAM_BOT_TOKEN chưa được cấu hình trong Worker secret.', 500, origin);
  }

  const groupChatId = settings.quoteTelegramChatId || DEFAULT_HOMEPAGE_SETTINGS.quoteTelegramChatId;
  const lines = buildHomepageQuoteMessage({ businessName, contactName, phone, area, interest, businessModel, note, sourceUrl }).split('\n');

  let tgRes;
  try {
    tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupChatId,
        text: lines.join('\n'),
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    return jsonResponse(
      { success: false, error: `Không kết nối được Telegram API: ${err?.message || err}` },
      502,
      origin,
    );
  }

  let tgData = null;
  try {
    tgData = await tgRes.json();
  } catch {
    tgData = null;
  }

  if (!tgData?.ok) {
    const error = tgData?.description || `HTTP ${tgRes.status}`;
    return jsonResponse({ success: false, error }, 200, origin);
  }

  const sheetResult = await appendHomepageQuoteToSheet(env, settings, {
    businessName,
    contactName,
    phone,
    area,
    interest,
    businessModel,
    note,
    sourceUrl,
  });

  if (sheetResult.ok) {
    return jsonResponse({ success: true, telegramSent: true, sheetSaved: true }, 200, origin);
  }

  if (sheetResult.skipped) {
    return jsonResponse({ success: true, telegramSent: true, sheetSaved: false, warning: sheetResult.warning || null }, 200, origin);
  }

  return jsonResponse({ success: true, telegramSent: true, sheetSaved: false, warning: sheetResult.warning || null }, 200, origin);
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

    await ensureSalonsSchema(env);

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

    if (pathname === '/api/admin/telegram/test' && method === 'POST') {
      return handleAdminTelegramTest(request, env, origin);
    }

    if (pathname === '/api/admin/site-settings/homepage' && method === 'GET') {
      return handleAdminHomepageSettingsGet(env, origin);
    }

    if (pathname === '/api/admin/site-settings/homepage' && method === 'PUT') {
      return handleAdminHomepageSettingsPut(request, env, origin);
    }

    if (pathname === '/api/admin/site-settings/homepage/test-telegram' && method === 'POST') {
      return handleAdminHomepageSettingsTestTelegram(env, origin);
    }

    if (pathname === '/api/admin/site-settings/homepage/test-sheet' && method === 'POST') {
      return handleAdminHomepageSettingsTestSheet(env, origin);
    }

    if (segments.length === 6 && segments[0] === 'api' && segments[1] === 'admin' && segments[2] === 'salons' && segments[4] === 'google-sheet' && segments[5] === 'test' && method === 'POST') {
      return handleAdminSalonGoogleSheetTest(env, origin, decodeURIComponent(segments[3] || ''));
    }

    if (pathname === '/api/public/site-settings/homepage' && method === 'GET') {
      const settings = publicHomepageSettings(await loadHomepageSettings(env));
      return jsonResponse({ success: true, settings }, 200, origin);
    }

    if (pathname === '/api/public/quote' && method === 'POST') {
      return handlePublicQuote(request, env, origin);
    }

    if (segments.length === 4 && segments[0] === 'api' && segments[1] === 'salons' && segments[3] === 'leads' && method === 'POST') {
      return handleSalonLeadSubmit(request, env, origin, decodeURIComponent(segments[2] || ''));
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
