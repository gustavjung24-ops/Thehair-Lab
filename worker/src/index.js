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
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

// ─── Main Handler ──────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname !== '/api/leads' || request.method !== 'POST') {
      return jsonResponse({ error: 'Not found' }, 404, origin);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ success: false, error: 'Dữ liệu không hợp lệ.' }, 400, origin);
    }

    // Validate
    const validationError = validateLead(body);
    if (validationError) {
      return jsonResponse({ success: false, error: validationError }, 422, origin);
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
      return jsonResponse({ success: false, error: 'Lỗi lưu dữ liệu. Vui lòng thử lại.' }, 500, origin);
    }

    // Fire-and-forget: Telegram + Google Sheets (không block response)
    const ctx = { waitUntil: (p) => p }; // fallback nếu không có execution context
    Promise.allSettled([
      sendTelegram(env, lead),
      appendToSheet(env, lead),
    ]).catch(() => {});

    return jsonResponse({ success: true, message: 'Đã nhận thông tin, bên em sẽ liên hệ tư vấn.' }, 200, origin);
  },
};
