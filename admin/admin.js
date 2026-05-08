const SALONS_KEY = "thehairlab_admin_salons";
const SESSION_KEY = "thehairlab_admin_session";
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
			salon_name: "Salon Hung Sai Gon",
			slug: "salon-hung-sai-gon",
			phone: "0909123456",
			zalo_url: "",
			facebook_url: "",
			address: "Quan 1, TP.HCM",
			working_hours: "08:30 - 20:00",
			logo_url: "",
			banner_url: "",
			theme_color: "#8b5cf6",
			google_sheet_url: "",
			google_sheet_id: "",
			google_sheet_tab: "appointments",
			telegram_chat_id: "-1001234567890",
			admin_email: "hung@salon.vn",
			status: "active",
			created_at: nowIso(),
			updated_at: nowIso(),
		},
		{
			id: createId(),
			salon_name: "Minh Anh Hair",
			slug: "minh-anh-hair",
			phone: "0911222333",
			zalo_url: "",
			facebook_url: "",
			address: "Quan 3, TP.HCM",
			working_hours: "09:00 - 21:00",
			logo_url: "",
			banner_url: "",
			theme_color: "#8b5cf6",
			google_sheet_url: "",
			google_sheet_id: "",
			google_sheet_tab: "appointments",
			telegram_chat_id: "",
			admin_email: "minhanh@salon.vn",
			status: "inactive",
			created_at: nowIso(),
			updated_at: nowIso(),
		},
	];

	salons = seed;
	persistSalons();
}

function loadSalons() {
	try {
		const raw = localStorage.getItem(SALONS_KEY);
		salons = raw ? JSON.parse(raw) : [];
	} catch {
		salons = [];
	}

	if (!Array.isArray(salons) || salons.length === 0) {
		seedSalons();
	}
}

function persistSalons() {
	localStorage.setItem(SALONS_KEY, JSON.stringify(salons));
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

	const duplicated = salons.find((item) => item.slug === slug && item.id !== editingId);
	if (duplicated) {
		return "Slug da ton tai, vui long dung slug khac.";
	}
	return "";
}

function getStatusCounts() {
	const total = salons.length;
	const active = salons.filter((item) => item.status === "active").length;
	const inactive = total - active;
	const missingTelegram = salons.filter((item) => !item.telegram_chat_id.trim()).length;
	const missingSheet = salons.filter((item) => !item.google_sheet_id.trim()).length;

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
						<button class="btn btn-ghost" data-action="edit" data-id="${item.id}">Sua</button>
						<button class="btn btn-danger" data-action="delete" data-id="${item.id}">Xoa demo</button>
						<button class="btn btn-ghost" data-action="copy-landing" data-link="${escapeHtml(publicLink)}">Copy link landing page</button>
						<button class="btn btn-ghost" data-action="copy-admin" data-link="${escapeHtml(customerAdminLink)}">Copy link admin khach</button>
						<button class="btn btn-ghost" data-action="test-telegram" data-id="${item.id}">Test Telegram demo</button>
						<button class="btn btn-ghost" data-action="test-sheet" data-id="${item.id}">Test Sheet demo</button>
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

function onLoginSubmit(event) {
	event.preventDefault();
	const email = els.loginEmail.value.trim().toLowerCase();
	const password = els.loginPassword.value;

	if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
		setSession({ email, logged_in_at: nowIso() });
		showLoginMessage("Dang nhap thanh cong.", false);
		showView(true);
		renderAll();
		return;
	}
	showLoginMessage("Sai email hoac mat khau demo.");
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

function onSalonSubmit(event) {
	event.preventDefault();
	els.sheetParseMessage.textContent = "";

	const payload = buildSalonPayload();
	if (!payload.salon_name || !payload.phone || !payload.slug) {
		showFormMessage("Vui long nhap du Ten salon, Slug va So dien thoai.", true);
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
			els.sheetParseMessage.textContent =
				"Khong nhan dien duoc Google Sheet ID. Vui long kiem tra lai link.";
			showFormMessage("Link Google Sheet khong hop le.", true);
			return;
		}
	}

	const existing = salons.find((item) => item.id === payload.id);
	if (existing) {
		payload.created_at = existing.created_at || nowIso();
		salons = salons.map((item) => (item.id === payload.id ? payload : item));
		showFormMessage("Cap nhat salon thanh cong.");
	} else {
		payload.created_at = nowIso();
		salons.unshift(payload);
		showFormMessage("Tao salon moi thanh cong.");
	}

	persistSalons();
	renderAll();
	resetForm();
}

function findSalonById(id) {
	return salons.find((item) => item.id === id);
}

function onSalonListClick(event) {
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
		salons = salons.filter((item) => item.id !== id);
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
		if (salon.telegram_chat_id) {
			window.alert(
				`Demo OK: sau nay lich hen cua salon nay se gui ve Telegram Chat ID nay. (${salon.telegram_chat_id})`,
			);
		} else {
			window.alert("Chua nhap Telegram Chat ID.");
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

function onSeedClick() {
	const ok = window.confirm("Nap lai 2 salon seed demo? Du lieu hien tai se bi thay the.");
	if (!ok) {
		return;
	}
	seedSalons();
	renderAll();
	resetForm();
	showFormMessage("Da nap lai du lieu seed demo.");
}

function onClearStorageClick() {
	const ok = window.confirm("Xoa toan bo du lieu salon demo trong localStorage?");
	if (!ok) {
		return;
	}
	localStorage.removeItem(SALONS_KEY);
	seedSalons();
	renderAll();
	resetForm();
	showFormMessage("Da reset localStorage va tao lai seed demo.");
}

function init() {
	loadSalons();

	const session = getSession();
	showView(Boolean(session?.email === DEMO_EMAIL));
	if (session?.email === DEMO_EMAIL) {
		renderAll();
	}

	els.loginForm.addEventListener("submit", onLoginSubmit);
	els.logoutBtn.addEventListener("click", onLogout);
	els.seedBtn.addEventListener("click", onSeedClick);
	els.resetFormBtn.addEventListener("click", resetForm);
	els.clearStorageBtn.addEventListener("click", onClearStorageClick);

	els.fields.salon_name.addEventListener("input", onSalonNameInput);
	els.fields.slug.addEventListener("input", onSlugInput);
	els.fields.google_sheet_url.addEventListener("input", onSheetUrlInput);
	els.salonForm.addEventListener("submit", onSalonSubmit);
	els.salonList.addEventListener("click", onSalonListClick);

	updateSlugPreview("");
}

init();
