const SALONS_KEY = "thehairlab_admin_salons";
const SESSION_KEY = "thehairlab_admin_session";
const API_CONFIG_KEY = "thehairlab_admin_api_config";
const HOMEPAGE_SETTINGS_DEFAULTS = {
	siteName: "The Hair Lab",
	siteUrl: "https://www.thehairlab.top/",
	quoteTelegramChatId: "-5104953507",
	googleSheetUrl: "",
	googleSheetId: "",
	googleSheetTab: "homepage_quotes",
	quoteEnabled: true,
	internalNote: "",
};
const WORKER_BASES = [
	"https://thehairlab-leads-worker.khuongbinh-info.workers.dev",
	"https://thehairlab-leads-worker.khuongbinh-thehairlab.workers.dev",
];
const DEMO_EMAIL = "admin@thehairlab.top";
const DEMO_PASSWORD = "admin123";
const RESERVED_SLUGS = new Set([
	"admin",
	"api",
	"image",
	"public",
	"css",
	"js",
	"worker",
	"san-pham",
	"lien-he",
	"gioi-thieu",
	"mau-demo",
	"s",
]);

const els = {
	loginView: document.getElementById("login-view"),
	dashboardView: document.getElementById("dashboard-view"),
	loginForm: document.getElementById("login-form"),
	loginEmail: document.getElementById("login-email"),
	loginPassword: document.getElementById("login-password"),
	loginMessage: document.getElementById("login-message"),
	logoutBtn: document.getElementById("btn-logout"),
	seedBtn: document.getElementById("btn-seed"),
	apiBaseUrl: document.getElementById("api-base-url"),
	apiToken: document.getElementById("api-token"),
	saveApiConfigBtn: document.getElementById("btn-save-api-config"),
	apiModeStatus: document.getElementById("api-mode-status"),
	homepageSiteUrl: document.getElementById("homepage-site-url"),
	homepageQuoteTelegramChatId: document.getElementById("homepage-quote-telegram-chat-id"),
	homepageGoogleSheetUrl: document.getElementById("homepage-google-sheet-url"),
	homepageGoogleSheetId: document.getElementById("homepage-google-sheet-id"),
	homepageGoogleSheetTab: document.getElementById("homepage-google-sheet-tab"),
	homepageQuoteEnabled: document.getElementById("homepage-quote-enabled"),
	homepageInternalNote: document.getElementById("homepage-internal-note"),
	homepageSettingsMessage: document.getElementById("homepage-settings-message"),
	saveHomepageSettingsBtn: document.getElementById("btn-save-homepage-settings"),
	testHomepageTelegramBtn: document.getElementById("btn-test-homepage-telegram"),
	testHomepageSheetBtn: document.getElementById("btn-test-homepage-sheet"),
	statsGrid: document.getElementById("stats-grid"),
	salonList: document.getElementById("salon-list"),
	salonForm: document.getElementById("salon-form"),
	formTitle: document.getElementById("form-title"),
	resetFormBtn: document.getElementById("btn-reset-form"),
	clearStorageBtn: document.getElementById("btn-clear-storage"),
	formMessage: document.getElementById("form-message"),
	slugPreview: document.getElementById("slug-preview"),
	slugError: document.getElementById("slug-error"),
	sheetParseMessage: document.getElementById("sheet-parse-message"),
	fields: {
		id: document.getElementById("salon-id"),
		salon_name: document.getElementById("salon-name"),
		slug: document.getElementById("salon-slug"),
		phone: document.getElementById("salon-phone"),
		zalo_url: document.getElementById("salon-zalo"),
		facebook_url: document.getElementById("salon-facebook"),
		address: document.getElementById("salon-address"),
		working_hours: document.getElementById("salon-working-hours"),
		logo_url: document.getElementById("salon-logo"),
		banner_url: document.getElementById("salon-banner"),
		theme_color: document.getElementById("salon-theme-color"),
		google_sheet_url: document.getElementById("salon-google-sheet-url"),
		google_sheet_id: document.getElementById("salon-google-sheet-id"),
		google_sheet_tab: document.getElementById("salon-google-sheet-tab"),
		telegram_chat_id: document.getElementById("salon-telegram-chat-id"),
		admin_email: document.getElementById("salon-admin-email"),
		status: document.getElementById("salon-status"),
	},
};

let salons = [];
let slugWasManual = false;
let apiConfig = null;
let activeWorkerBase = "";
let homepageSettings = {...HOMEPAGE_SETTINGS_DEFAULTS};

function nowIso() {
	return new Date().toISOString();
}

function createId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(value) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function parseGoogleSheetId(url) {
	if (!url) {
		return "";
	}

	const byPath = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
	if (byPath) {
		return byPath[1];
	}

	const byQuery = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
	if (byQuery) {
		return byQuery[1];
	}

	return "";
}

function getSession() {
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function setSession(session) {
	localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
	localStorage.removeItem(SESSION_KEY);
}

function seedSalons() {
	const seed = [
		{
			id: createId(),
			salon_name: "Salon Hưng Saigon",
			slug: "salon-hung-saigon",
			phone: "0938212878",
			zalo_url: "https://zalo.me/0938212878",
			facebook_url: "",
			address: "Tân An, Long An",
			working_hours: "08:30 - 20:00",
			logo_url: "",
			banner_url: "",
			theme_color: "#6E8F62",
			google_sheet_url: "",
			google_sheet_id: "",
			google_sheet_tab: "appointments",
			telegram_chat_id: "",
			admin_email: "hung@salon.vn",
			status: "active",
			created_at: nowIso(),
			updated_at: nowIso(),
		},
	];

	salons = seed;
	persistSalons();
}

function normalizeSalonRecord(item) {
	const normalized = {
		...item,
		id: item?.id || createId(),
		salon_name: String(item?.salon_name || "").trim(),
		slug: String(item?.slug || "").trim().toLowerCase(),
		phone: String(item?.phone || "").trim(),
		zalo_url: String(item?.zalo_url || "").trim(),
		facebook_url: String(item?.facebook_url || "").trim(),
		address: String(item?.address || "").trim(),
		working_hours: String(item?.working_hours || "").trim(),
		logo_url: String(item?.logo_url || "").trim(),
		banner_url: String(item?.banner_url || "").trim(),
		theme_color: String(item?.theme_color || "#8b5cf6").trim() || "#8b5cf6",
		google_sheet_url: String(item?.google_sheet_url || "").trim(),
		google_sheet_id: String(item?.google_sheet_id || "").trim(),
		google_sheet_tab: String(item?.google_sheet_tab || "appointments").trim() || "appointments",
		telegram_chat_id: String(item?.telegram_chat_id || "").trim(),
		admin_email: String(item?.admin_email || "").trim(),
		status: item?.status === "active" ? "active" : "inactive",
		created_at: item?.created_at || nowIso(),
		updated_at: item?.updated_at || nowIso(),
	};

	if (normalized.slug === "salon-hung-sai-gon") {
		normalized.slug = "salon-hung-saigon";
		normalized.salon_name = "Salon Hưng Saigon";
		normalized.phone = "0938212878";
		normalized.address = "Tân An, Long An";
		normalized.status = "active";
		normalized.theme_color = "#6E8F62";
		normalized.updated_at = nowIso();
	}

	return normalized;
}

function dedupeBySlug(list) {
	const map = new Map();
	list.forEach((item) => {
		if (!item?.slug) {
			return;
		}
		map.set(item.slug, item);
	});
	return Array.from(map.values());
}

function loadSalons() {
	try {
		const raw = localStorage.getItem(SALONS_KEY);
		salons = raw ? JSON.parse(raw) : [];
	} catch {
		salons = [];
	}

	if (!Array.isArray(salons)) {
		salons = [];
	}

	salons = dedupeBySlug(salons.map(normalizeSalonRecord).filter((item) => Boolean(item.slug)));

	if (!Array.isArray(salons) || salons.length === 0) {
		seedSalons();
		return;
	}

	persistSalons();
}

function persistSalons() {
	localStorage.setItem(SALONS_KEY, JSON.stringify(salons));
}

function loadApiConfig() {
	try {
		const raw = localStorage.getItem(API_CONFIG_KEY);
		apiConfig = raw ? JSON.parse(raw) : null;
	} catch {
		apiConfig = null;
	}

	if (!apiConfig || typeof apiConfig !== "object") {
		apiConfig = null;
		return;
	}

	apiConfig.baseUrl = (apiConfig.baseUrl || "").trim().replace(/\/+$/, "");
	apiConfig.token = (apiConfig.token || "").trim();
	if (!apiConfig.baseUrl) {
		apiConfig = null;
	}
}

function hasApiBaseUrl() {
	return Boolean(apiConfig?.baseUrl);
}

function hasAdminToken() {
	return Boolean(apiConfig?.token);
}

function saveApiConfig(baseUrl, token) {
	const normalized = {
		baseUrl: (baseUrl || "").trim().replace(/\/+$/, ""),
		token: (token || "").trim(),
	};
	localStorage.setItem(API_CONFIG_KEY, JSON.stringify(normalized));
	apiConfig = normalized;
}

function normalizeHomepageSettings(value) {
	const source = value && typeof value === "object" ? value : {};
	return {
		...HOMEPAGE_SETTINGS_DEFAULTS,
		siteName: String(source.siteName || HOMEPAGE_SETTINGS_DEFAULTS.siteName).trim(),
		siteUrl: String(source.siteUrl || HOMEPAGE_SETTINGS_DEFAULTS.siteUrl).trim(),
		quoteTelegramChatId: String(source.quoteTelegramChatId || HOMEPAGE_SETTINGS_DEFAULTS.quoteTelegramChatId).trim(),
		googleSheetUrl: String(source.googleSheetUrl || "").trim(),
		googleSheetId: String(source.googleSheetId || "").trim(),
		googleSheetTab: String(source.googleSheetTab || HOMEPAGE_SETTINGS_DEFAULTS.googleSheetTab).trim() || HOMEPAGE_SETTINGS_DEFAULTS.googleSheetTab,
		quoteEnabled: source.quoteEnabled === false ? false : true,
		internalNote: String(source.internalNote || "").trim(),
	};
}

function setHomepageSettingsMessage(message, isError = false) {
	if (!els.homepageSettingsMessage) {
		return;
	}
	els.homepageSettingsMessage.textContent = message;
	els.homepageSettingsMessage.style.color = isError ? "#b62439" : "#4e42a8";
}

function syncHomepageSettingsInputs() {
	homepageSettings = normalizeHomepageSettings(homepageSettings);
	if (els.homepageSiteUrl) {
		els.homepageSiteUrl.value = homepageSettings.siteUrl;
	}
	if (els.homepageQuoteTelegramChatId) {
		els.homepageQuoteTelegramChatId.value = homepageSettings.quoteTelegramChatId;
	}
	if (els.homepageGoogleSheetUrl) {
		els.homepageGoogleSheetUrl.value = homepageSettings.googleSheetUrl;
	}
	if (els.homepageGoogleSheetId) {
		els.homepageGoogleSheetId.value = homepageSettings.googleSheetId;
	}
	if (els.homepageGoogleSheetTab) {
		els.homepageGoogleSheetTab.value = homepageSettings.googleSheetTab;
	}
	if (els.homepageQuoteEnabled) {
		els.homepageQuoteEnabled.checked = Boolean(homepageSettings.quoteEnabled);
	}
	if (els.homepageInternalNote) {
		els.homepageInternalNote.value = homepageSettings.internalNote;
	}
}

function readHomepageSettingsForm() {
	return normalizeHomepageSettings({
		siteName: els.homepageSiteUrl?.value ? HOMEPAGE_SETTINGS_DEFAULTS.siteName : HOMEPAGE_SETTINGS_DEFAULTS.siteName,
		siteUrl: els.homepageSiteUrl?.value || HOMEPAGE_SETTINGS_DEFAULTS.siteUrl,
		quoteTelegramChatId: els.homepageQuoteTelegramChatId?.value || HOMEPAGE_SETTINGS_DEFAULTS.quoteTelegramChatId,
		googleSheetUrl: els.homepageGoogleSheetUrl?.value || "",
		googleSheetId: els.homepageGoogleSheetId?.value || "",
		googleSheetTab: els.homepageGoogleSheetTab?.value || HOMEPAGE_SETTINGS_DEFAULTS.googleSheetTab,
		quoteEnabled: Boolean(els.homepageQuoteEnabled?.checked),
		internalNote: els.homepageInternalNote?.value || "",
	});
}

function syncHomepageSettingsDerivedFields() {
	if (els.homepageGoogleSheetId && els.homepageGoogleSheetUrl && !els.homepageGoogleSheetId.value.trim()) {
		const parsed = parseGoogleSheetId(els.homepageGoogleSheetUrl.value.trim());
		if (parsed) {
			els.homepageGoogleSheetId.value = parsed;
		}
	}
}

async function loadHomepageSettings() {
	try {
		let data = null;
		if (hasApiBaseUrl() && hasAdminToken()) {
			data = await requestApi("/api/admin/site-settings/homepage", { method: "GET" });
		} else {
			data = await requestWorkerPublic("/api/public/site-settings/homepage");
		}
		homepageSettings = normalizeHomepageSettings(data?.settings || data?.homepage || data || HOMEPAGE_SETTINGS_DEFAULTS);
		syncHomepageSettingsInputs();
		setHomepageSettingsMessage(`Da tai cau hinh trang chu (${homepageSettings.siteUrl}).`);
	} catch (error) {
		homepageSettings = {...HOMEPAGE_SETTINGS_DEFAULTS};
		syncHomepageSettingsInputs();
		setHomepageSettingsMessage(`Khong tai duoc cau hinh trang chu: ${error?.message || error}`, true);
	}
}

async function saveHomepageSettings() {
	if (!hasApiBaseUrl() || !hasAdminToken()) {
		setHomepageSettingsMessage("Can cau hinh API Base URL va Admin API Token de luu trang chu.", true);
		return;
	}

	syncHomepageSettingsDerivedFields();
	homepageSettings = readHomepageSettingsForm();
	const result = await requestApi("/api/admin/site-settings/homepage", {
		method: "PUT",
		body: JSON.stringify(homepageSettings),
	});
	homepageSettings = normalizeHomepageSettings(result?.settings || homepageSettings);
	syncHomepageSettingsInputs();
	setHomepageSettingsMessage("Da luu cau hinh trang chu thanh cong.");
}

async function testHomepageTelegram() {
	if (!hasApiBaseUrl() || !hasAdminToken()) {
		setHomepageSettingsMessage("Can cau hinh API de test Telegram trang chu.", true);
		return;
	}

	setHomepageSettingsMessage("Dang gui Telegram test trang chu...");
	try {
		const data = await requestApi("/api/admin/site-settings/homepage/test-telegram", {
			method: "POST",
		});
		if (data?.success) {
			setHomepageSettingsMessage(`Da gui Telegram test trang chu thanh cong den Chat ID: ${homepageSettings.quoteTelegramChatId || HOMEPAGE_SETTINGS_DEFAULTS.quoteTelegramChatId}`);
			return;
		}
		setHomepageSettingsMessage(`Gui Telegram trang chu that bai: ${data?.error || "Loi khong xac dinh"}`, true);
	} catch (error) {
		setHomepageSettingsMessage(`Loi ket noi Worker: ${error?.message || error}`, true);
	}
}

async function testHomepageSheet() {
	if (!hasApiBaseUrl() || !hasAdminToken()) {
		setHomepageSettingsMessage("Can cau hinh API de test Google Sheet trang chu.", true);
		return;
	}

	setHomepageSettingsMessage("Dang test Google Sheet trang chu...");
	try {
		const data = await requestApi("/api/admin/site-settings/homepage/test-sheet", {
			method: "POST",
		});
		if (data?.success) {
			setHomepageSettingsMessage(data?.warning ? `Test Google Sheet xong: ${data.warning}` : "Test Google Sheet trang chu thanh cong.");
			return;
		}
		setHomepageSettingsMessage(`Test Google Sheet that bai: ${data?.error || "Loi khong xac dinh"}`, true);
	} catch (error) {
		setHomepageSettingsMessage(`Loi ket noi Worker: ${error?.message || error}`, true);
	}
}

function setApiModeStatus(message, isError = false) {
	if (!els.apiModeStatus) {
		return;
	}
	els.apiModeStatus.textContent = message;
	els.apiModeStatus.style.color = isError ? "#b62439" : "#4e42a8";
}

function syncApiConfigInputs() {
	if (!els.apiBaseUrl || !els.apiToken) {
		return;
	}
	els.apiBaseUrl.value = apiConfig?.baseUrl || "";
	els.apiToken.value = apiConfig?.token || "";

	if (hasApiBaseUrl() && hasAdminToken()) {
		setApiModeStatus("Che do API dang bat (co token admin).");
	} else if (hasApiBaseUrl()) {
		setApiModeStatus("Che do API dang bat (chua co token admin, chi sync theo slug).", true);
	} else {
		setApiModeStatus("Chua cau hinh API, dang dung localStorage.");
	}
}

async function requestApi(path, options = {}) {
	if (!hasApiBaseUrl() || !hasAdminToken()) {
		throw new Error("NO_API_CONFIG");
	}

	const headers = {
		Authorization: `Bearer ${apiConfig.token}`,
		"Content-Type": "application/json",
		...(options.headers || {}),
	};

	const response = await fetch(`${apiConfig.baseUrl}${path}`, {
		...options,
		headers,
	});

	let data = null;
	try {
		data = await response.json();
	} catch {
		data = null;
	}

	if (!response.ok || data?.success === false) {
		const msg = data?.error || `HTTP ${response.status}`;
		throw new Error(msg);
	}

	return data;
}

async function requestWorkerPublic(path) {
	let lastError = null;

	for (const base of WORKER_BASES) {
		try {
			const response = await fetch(`${base}${path}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			let data = null;
			try {
				data = await response.json();
			} catch {
				data = null;
			}

			if (!response.ok || data?.success === false) {
				lastError = new Error(data?.error || `HTTP ${response.status}`);
				continue;
			}

			activeWorkerBase = base;
			return data;
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError || new Error("WORKER_UNAVAILABLE");
}

function normalizeRemoteSalons(items) {
	const list = Array.isArray(items) ? items : [];
	return dedupeBySlug(
		list
			.map((item) => normalizeSalonRecord(item))
			.filter((item) => Boolean(item.slug))
			.filter((item) => item.slug !== "salon-hung-sai-gon"),
	);
}

async function loadSalonsFromWorkerPublic() {
	const data = await requestWorkerPublic("/api/public/salons");
	const remoteSalons = normalizeRemoteSalons(data.salons);
	if (!remoteSalons.length) {
		throw new Error("NO_REMOTE_SALONS");
	}
	salons = remoteSalons;
	persistSalons();
	setApiModeStatus(`Dang dung du lieu Worker (${activeWorkerBase}).`);
}

async function loadSalonsFromWorkerBySlugFallback() {
	loadSalons();
	const slugSet = new Set(["salon-hung-saigon"]);
	salons.forEach((item) => {
		if (item?.slug) {
			slugSet.add(String(item.slug).trim().toLowerCase());
		}
	});

	const fetched = [];
	for (const slug of slugSet) {
		try {
			const data = await requestWorkerPublic(`/api/salons/${encodeURIComponent(slug)}`);
			if (data?.salon) {
				fetched.push(normalizeSalonRecord(data.salon));
			}
		} catch {}
	}

	const normalized = normalizeRemoteSalons(fetched);
	if (!normalized.length) {
		throw new Error("NO_REMOTE_SLUG_DATA");
	}

	salons = normalized;
	persistSalons();
	setApiModeStatus(`Dang dung du lieu Worker theo slug (${activeWorkerBase}).`);
}

async function loadSalonsData() {
	try {
		await loadSalonsFromWorkerPublic();
		return;
	} catch {}

	try {
		await loadSalonsFromWorkerBySlugFallback();
		return;
	} catch {}

	if (hasApiBaseUrl() && hasAdminToken()) {
		try {
			const data = await requestApi("/api/admin/salons", { method: "GET" });
			salons = normalizeRemoteSalons(data.salons);
			persistSalons();
			setApiModeStatus("Dang dung du lieu API Worker (admin token).");
			return;
		} catch {}
	}

	loadSalons();
	setApiModeStatus("Khong ket noi duoc Worker API. Dang fallback local cache/seed.", true);
	showFormMessage("Khong ket noi duoc Worker API. Dang fallback local cache/seed.", true);
}

function showView(isLoggedIn) {
	els.loginView.classList.toggle("active", !isLoggedIn);
	els.dashboardView.classList.toggle("active", isLoggedIn);
}

function showLoginMessage(message, isError = true) {
	els.loginMessage.textContent = message;
	els.loginMessage.style.color = isError ? "#b62439" : "#187d54";
}

function showFormMessage(message, isError = false) {
	els.formMessage.textContent = message;
	els.formMessage.style.color = isError ? "#b62439" : "#4e42a8";
}

function updateSlugPreview(slug) {
	els.slugPreview.textContent = `https://thehairlab.top/s/${slug || ""}`;
}

function validateSlug(slug, editingId = "") {
	if (!slug) {
		return "Slug la truong bat buoc.";
	}
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return "Slug chi duoc gom chu thuong a-z, so 0-9 va dau gach ngang (-).";
	}
	if (RESERVED_SLUGS.has(slug)) {
		return "Slug trung voi slug he thong, vui long chon slug khac.";
	}

	const duplicated = salons.find((item) => item.slug === slug && String(item.id) !== String(editingId));
	if (duplicated) {
		return "Slug da ton tai, vui long dung slug khac.";
	}
	return "";
}

function getStatusCounts() {
	const total = salons.length;
	const active = salons.filter((item) => item.status === "active").length;
	const inactive = total - active;
	const missingTelegram = salons.filter((item) => !(item.telegram_chat_id || "").trim()).length;
	const missingSheet = salons.filter((item) => !(item.google_sheet_id || "").trim()).length;

	return {
		total,
		active,
		inactive,
		missingTelegram,
		missingSheet,
	};
}

function renderStats() {
	const c = getStatusCounts();
	const stats = [
		{ label: "Tong so salon", value: c.total },
		{ label: "Salon active", value: c.active },
		{ label: "Salon inactive", value: c.inactive },
		{ label: "Thieu Telegram Chat ID", value: c.missingTelegram },
		{ label: "Thieu Google Sheet ID", value: c.missingSheet },
	];

	els.statsGrid.innerHTML = stats
		.map(
			(item) => `
			<article class="stat-card">
				<p>${item.label}</p>
				<strong>${item.value}</strong>
			</article>
		`,
		)
		.join("");
}

function escapeHtml(str) {
	return String(str || "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function renderSalonList() {
	if (salons.length === 0) {
		els.salonList.innerHTML = "<p class=\"muted\">Chua co salon nao.</p>";
		return;
	}

	els.salonList.innerHTML = salons
		.map((item) => {
			const publicLink = `https://thehairlab.top/s/${item.slug}`;
			const customerAdminLink = `https://thehairlab.top/s/${item.slug}/admin`;
			return `
				<article class="salon-card" data-id="${item.id}">
					<div class="salon-head">
						<div>
							<h4>${escapeHtml(item.salon_name)}</h4>
							<p class="muted">Slug: ${escapeHtml(item.slug)}</p>
						</div>
						<span class="status-badge ${item.status}">${item.status}</span>
					</div>

					<div class="salon-meta">
						<div><strong>Link public:</strong> ${escapeHtml(publicLink)}</div>
						<div><strong>So dien thoai:</strong> ${escapeHtml(item.phone)}</div>
						<div><strong>Telegram Chat ID:</strong> ${escapeHtml(item.telegram_chat_id || "(chua co)")}</div>
						<div><strong>Google Sheet ID:</strong> ${escapeHtml(item.google_sheet_id || "(chua co)")}</div>
					</div>

					<div class="salon-actions">
						<button type="button" class="btn btn-ghost" data-action="edit" data-id="${item.id}">Sua</button>
						<button type="button" class="btn btn-danger" data-action="delete" data-id="${item.id}">Xoa demo</button>
						<button type="button" class="btn btn-ghost" data-action="copy-landing" data-link="${escapeHtml(publicLink)}">Copy link landing page</button>
						<button type="button" class="btn btn-ghost" data-action="copy-admin" data-link="${escapeHtml(customerAdminLink)}">Copy link admin khach</button>
						<button type="button" class="btn btn-ghost" data-action="test-telegram" data-id="${item.id}">Test Telegram demo</button>
						<button type="button" class="btn btn-ghost" data-action="test-sheet" data-id="${item.id}">Test Sheet demo</button>
					</div>
				</article>
			`;
		})
		.join("");
}

function resetForm() {
	els.salonForm.reset();
	els.fields.id.value = "";
	els.fields.theme_color.value = "#8b5cf6";
	els.fields.status.value = "inactive";
	els.fields.google_sheet_tab.value = "appointments";
	els.formTitle.textContent = "Tao salon moi";
	els.sheetParseMessage.textContent = "";
	els.slugError.textContent = "";
	showFormMessage("");
	slugWasManual = false;
	updateSlugPreview("");
}

function fillForm(item) {
	els.fields.id.value = item.id;
	els.fields.salon_name.value = item.salon_name;
	els.fields.slug.value = item.slug;
	els.fields.phone.value = item.phone;
	els.fields.zalo_url.value = item.zalo_url;
	els.fields.facebook_url.value = item.facebook_url;
	els.fields.address.value = item.address;
	els.fields.working_hours.value = item.working_hours;
	els.fields.logo_url.value = item.logo_url;
	els.fields.banner_url.value = item.banner_url;
	els.fields.theme_color.value = item.theme_color || "#8b5cf6";
	els.fields.google_sheet_url.value = item.google_sheet_url;
	els.fields.google_sheet_id.value = item.google_sheet_id;
	els.fields.google_sheet_tab.value = item.google_sheet_tab || "appointments";
	els.fields.telegram_chat_id.value = item.telegram_chat_id;
	els.fields.admin_email.value = item.admin_email;
	els.fields.status.value = item.status;
	els.formTitle.textContent = `Chinh sua salon: ${item.salon_name}`;
	updateSlugPreview(item.slug);
	els.slugError.textContent = "";
	els.sheetParseMessage.textContent = "";
	showFormMessage("Dang o che do chinh sua.");
	slugWasManual = true;
}

async function copyText(text) {
	if (!navigator.clipboard || !window.isSecureContext) {
		window.prompt("Sao chep link thu cong:", text);
		return;
	}
	await navigator.clipboard.writeText(text);
}

function renderAll() {
	renderStats();
	renderSalonList();
}

async function onLoginSubmit(event) {
	event.preventDefault();
	const email = els.loginEmail.value.trim().toLowerCase();
	const password = els.loginPassword.value;

	if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
		setSession({ email, logged_in_at: nowIso() });
		showLoginMessage("Dang nhap thanh cong.", false);
		showView(true);
		await loadHomepageSettings();
		await loadSalonsData();
		renderAll();
		return;
	}
	showLoginMessage("Sai email hoac mat khau demo.");
}

async function onSaveApiConfig() {
	const baseUrl = (els.apiBaseUrl?.value || "").trim();
	const token = (els.apiToken?.value || "").trim();

	if (!baseUrl) {
		setApiModeStatus("Can nhap API Base URL.", true);
		return;
	}

	saveApiConfig(baseUrl, token);
	syncApiConfigInputs();
	await loadHomepageSettings();
	await loadSalonsData();
	renderAll();
}

function onLogout() {
	clearSession();
	showView(false);
	els.loginForm.reset();
	showLoginMessage("Da dang xuat.", false);
}

function onSalonNameInput() {
	if (slugWasManual) {
		return;
	}
	const generated = slugify(els.fields.salon_name.value);
	els.fields.slug.value = generated;
	updateSlugPreview(generated);
	els.slugError.textContent = "";
}

function onSlugInput() {
	slugWasManual = true;
	const slug = els.fields.slug.value.trim();
	updateSlugPreview(slug);
	const editingId = els.fields.id.value;
	els.slugError.textContent = validateSlug(slug, editingId);
}

function onSheetUrlInput() {
	const url = els.fields.google_sheet_url.value.trim();
	if (!url) {
		els.sheetParseMessage.textContent = "";
		return;
	}
	const id = parseGoogleSheetId(url);
	if (!id) {
		els.sheetParseMessage.textContent =
			"Khong nhan dien duoc Google Sheet ID. Vui long kiem tra lai link.";
		return;
	}
	els.fields.google_sheet_id.value = id;
	els.sheetParseMessage.textContent = "";
}

function buildSalonPayload() {
	return {
		id: els.fields.id.value || createId(),
		salon_name: els.fields.salon_name.value.trim(),
		slug: els.fields.slug.value.trim(),
		phone: els.fields.phone.value.trim(),
		zalo_url: els.fields.zalo_url.value.trim(),
		facebook_url: els.fields.facebook_url.value.trim(),
		address: els.fields.address.value.trim(),
		working_hours: els.fields.working_hours.value.trim(),
		logo_url: els.fields.logo_url.value.trim(),
		banner_url: els.fields.banner_url.value.trim(),
		theme_color: els.fields.theme_color.value || "#8b5cf6",
		google_sheet_url: els.fields.google_sheet_url.value.trim(),
		google_sheet_id: els.fields.google_sheet_id.value.trim(),
		google_sheet_tab: (els.fields.google_sheet_tab.value.trim() || "appointments"),
		telegram_chat_id: els.fields.telegram_chat_id.value.trim(),
		admin_email: els.fields.admin_email.value.trim(),
		status: els.fields.status.value,
		created_at: "",
		updated_at: nowIso(),
	};
}

async function syncSalonToWorkerBySlug(payload) {
	const slug = String(payload?.slug || "").trim().toLowerCase();
	if (!slug) {
		return { ok: false, error: "THIEU_SLUG" };
	}

	const candidateBases = [];
	if (apiConfig?.baseUrl) {
		candidateBases.push(apiConfig.baseUrl);
	}
	if (activeWorkerBase && !candidateBases.includes(activeWorkerBase)) {
		candidateBases.push(activeWorkerBase);
	}
	for (const base of WORKER_BASES) {
		if (!candidateBases.includes(base)) {
			candidateBases.push(base);
		}
	}

	let lastError = "SYNC_WORKER_FAILED";

	for (const base of candidateBases) {
		try {
			const getResponse = await fetch(`${base}/api/salons/${encodeURIComponent(slug)}`);
			if (!getResponse.ok) {
				lastError = `Khong doc du lieu salon tu Worker (${base})`;
				continue;
			}

			const getData = await getResponse.json();
			const currentAdminData =
				(getData?.salon && getData.salon.admin_data && typeof getData.salon.admin_data === "object"
					? getData.salon.admin_data
					: null) || {};

			const merged = JSON.parse(JSON.stringify(currentAdminData));
			if (!merged.salon || typeof merged.salon !== "object") {
				merged.salon = {};
			}

			merged.version = merged.version || 3;
			merged.salon.name = payload.salon_name || merged.salon.name || "";
			merged.salon.phone = payload.phone || merged.salon.phone || "";
			merged.salon.zalo = payload.zalo_url || merged.salon.zalo || "";
			merged.salon.address = payload.address || merged.salon.address || "";
			merged.salon.status = payload.status || merged.salon.status || "inactive";
			merged.salon.telegram_chat_id = payload.telegram_chat_id !== undefined
				? String(payload.telegram_chat_id)
				: (merged.salon.telegram_chat_id || "");

			const headers = {
				"Content-Type": "application/json",
			};
			if (apiConfig?.token) {
				headers.Authorization = `Bearer ${apiConfig.token}`;
				headers["x-admin-token"] = apiConfig.token;
			}

			const putResponse = await fetch(`${base}/api/admin/salons/${encodeURIComponent(slug)}`, {
				method: "PUT",
				headers,
				body: JSON.stringify(merged),
			});

			if (putResponse.ok) {
				activeWorkerBase = base;
				return { ok: true, base };
			}

			let errorMessage = `HTTP ${putResponse.status}`;
			try {
				const errData = await putResponse.json();
				if (errData?.error) {
					errorMessage = errData.error;
				}
			} catch {}

			lastError = `${errorMessage} (${base})`;
		} catch (error) {
			lastError = error?.message || "SYNC_WORKER_FAILED";
		}
	}

	return { ok: false, error: lastError };
}

function saveSalonToLocal(payload) {
	const existing = salons.find((item) => String(item.id) === String(payload.id));
	const isEdit = Boolean(existing);
	if (existing) {
		payload.created_at = existing.created_at || nowIso();
		salons = salons.map((item) => (String(item.id) === String(payload.id) ? payload : item));
	} else {
		payload.created_at = nowIso();
		salons.unshift(payload);
	}

	persistSalons();
	renderAll();
	resetForm();
	return { isEdit };
}

async function onSalonSubmit(event) {
	event.preventDefault();
	els.sheetParseMessage.textContent = "";

	const payload = buildSalonPayload();
	if (!payload.salon_name || !payload.phone || !payload.slug || !payload.status) {
		showFormMessage("Vui long nhap du Ten salon, So dien thoai, Slug va Trang thai.", true);
		return;
	}

	if (payload.status !== "active" && payload.status !== "inactive") {
		showFormMessage("Trang thai khong hop le.", true);
		return;
	}

	const slugErr = validateSlug(payload.slug, payload.id);
	if (slugErr) {
		els.slugError.textContent = slugErr;
		showFormMessage("Slug khong hop le, vui long kiem tra lai.", true);
		return;
	}
	els.slugError.textContent = "";

	if (payload.google_sheet_url && !payload.google_sheet_id) {
		const parsed = parseGoogleSheetId(payload.google_sheet_url);
		if (parsed) {
			payload.google_sheet_id = parsed;
			els.fields.google_sheet_id.value = parsed;
		} else {
			// Google Sheet ID remains optional; warn only and still allow saving.
			els.sheetParseMessage.textContent = "Khong nhan dien duoc Google Sheet ID, van co the luu salon.";
		}
	}

	const localResult = saveSalonToLocal(payload);
	showFormMessage(localResult.isEdit ? "Da luu local: Cap nhat salon thanh cong." : "Da luu local: Tao salon moi thanh cong.");

	if (!hasApiBaseUrl()) {
		setApiModeStatus("Chua cau hinh API Base URL, dang chi luu localStorage.", true);
		return;
	}

	const syncResult = await syncSalonToWorkerBySlug(payload);
	if (!syncResult.ok) {
		setApiModeStatus("Luu local thanh cong, nhung dong bo Worker that bai.", true);
		showFormMessage(`Da luu local, NHUNG dong bo Worker that bai: ${syncResult.error}`, true);
		return;
	}

	setApiModeStatus(`Da dong bo Worker thanh cong (${syncResult.base}).`);
	showFormMessage(`Da luu local va dong bo Worker/D1 thanh cong (${syncResult.base}).`);
	await loadSalonsData();
	renderAll();
}

function findSalonById(id) {
	return salons.find((item) => String(item.id) === String(id));
}

async function onSalonListClick(event) {
	const target = event.target;
	if (!(target instanceof HTMLElement)) {
		return;
	}
	const action = target.dataset.action;
	if (!action) {
		return;
	}

	const id = target.dataset.id || "";
	const link = target.dataset.link || "";

	if (action === "edit") {
		const salon = findSalonById(id);
		if (salon) {
			fillForm(salon);
			els.fields.salon_name.focus();
		}
		return;
	}

	if (action === "delete") {
		const salon = findSalonById(id);
		if (!salon) {
			return;
		}
		const ok = window.confirm(`Xoa demo salon '${salon.salon_name}'?`);
		if (!ok) {
			return;
		}
		salons = salons.filter((item) => String(item.id) !== String(id));
		persistSalons();
		renderAll();
		showFormMessage("Da xoa salon demo.");
		return;
	}

	if (action === "copy-landing" || action === "copy-admin") {
		copyText(link)
			.then(() => {
				showFormMessage(`Da copy link: ${link}`);
			})
			.catch(() => {
				showFormMessage("Khong the copy tu dong, vui long copy thu cong.", true);
			});
		return;
	}

	if (action === "test-telegram") {
		const salon = findSalonById(id);
		if (!salon) {
			return;
		}
		if (!salon.telegram_chat_id) {
			window.alert("Chua nhap Telegram Chat ID.");
			return;
		}
		if (!hasApiBaseUrl()) {
			window.alert("Chua cau hinh API Base URL. Vao o API config phia tren de nhap Worker URL.");
			return;
		}
		showFormMessage("Dang gui Telegram test...");
		try {
			const res = await fetch(`${apiConfig.baseUrl}/api/admin/telegram/test`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					slug: salon.slug,
					chatId: salon.telegram_chat_id,
					salonName: salon.salon_name,
				}),
			});
			const data = await res.json();
			if (data?.success) {
				showFormMessage(`Da gui Telegram test thanh cong den Chat ID: ${salon.telegram_chat_id}`);
			} else {
				showFormMessage(`Gui Telegram that bai: ${data?.error || "Loi khong xac dinh"}`, true);
			}
		} catch (err) {
			showFormMessage(`Loi ket noi Worker: ${err?.message || err}`, true);
		}
		return;
	}

	if (action === "test-sheet") {
		const salon = findSalonById(id);
		if (!salon) {
			return;
		}
		if (salon.google_sheet_id) {
			window.alert(
				`Demo OK: sau nay lich hen se ghi vao Google Sheet nay. (${salon.google_sheet_id})`,
			);
		} else {
			window.alert("Chua nhap Google Sheet ID.");
		}
	}
}

async function onSeedClick() {
	await loadSalonsData();
	renderAll();
	resetForm();

	if (activeWorkerBase) {
		showFormMessage("Da tai lai danh sach salon tu Worker.");
		return;
	}

	showFormMessage("Dang fallback local cache/seed vi Worker khong kha dung.", true);
}

async function onClearStorageClick() {
	if (hasApiBaseUrl()) {
		showFormMessage("Dang o che do API, khong xoa local cache de tranh mat cache.");
		return;
	}

	const ok = window.confirm("Xoa local cache salon tren trinh duyet nay?");
	if (!ok) {
		return;
	}
	localStorage.removeItem(SALONS_KEY);
	seedSalons();
	renderAll();
	resetForm();
	showFormMessage("Da xoa local cache va tao seed du phong.");
}

async function init() {
	loadApiConfig();
	syncApiConfigInputs();
	await loadHomepageSettings();
	await loadSalonsData();

	const session = getSession();
	showView(Boolean(session?.email === DEMO_EMAIL));
	if (session?.email === DEMO_EMAIL) {
		renderAll();
	}

	els.loginForm.addEventListener("submit", onLoginSubmit);
	els.logoutBtn.addEventListener("click", onLogout);
	els.seedBtn.addEventListener("click", onSeedClick);
	els.saveApiConfigBtn.addEventListener("click", onSaveApiConfig);
	els.resetFormBtn.addEventListener("click", resetForm);
	els.clearStorageBtn.addEventListener("click", onClearStorageClick);
	els.saveHomepageSettingsBtn.addEventListener("click", saveHomepageSettings);
	els.testHomepageTelegramBtn.addEventListener("click", testHomepageTelegram);
	els.testHomepageSheetBtn.addEventListener("click", testHomepageSheet);

	els.fields.salon_name.addEventListener("input", onSalonNameInput);
	els.fields.slug.addEventListener("input", onSlugInput);
	els.fields.google_sheet_url.addEventListener("input", onSheetUrlInput);
	els.salonForm.addEventListener("submit", onSalonSubmit);
	els.salonList.addEventListener("click", onSalonListClick);

	updateSlugPreview("");
}

init();
