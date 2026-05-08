const API_BASE = "https://thehairlab-leads-worker.khuongbinh-thehairlab.workers.dev/api/public/salons";
const DEFAULT_THEME = "#8b5cf6";

const DEFAULT_SALON = {
  salon_name: "Salon Test Mẫu 01 - Lavender Beauty",
  phone: "0900000000",
  zalo_url: "https://zalo.me/0900000000",
  facebook_url: "https://facebook.com/thehairlab.top",
  address: "123 Lavender Beauty, Phường Salon, TP. Hồ Chí Minh",
  working_hours: "08:00 - 20:00 mỗi ngày",
  theme_color: "#8b5cf6",
  logo_url: "",
};

function resolveAsset(key, fallback) {
  if (typeof window.thlAsset === "function") {
    return window.thlAsset(key, fallback);
  }
  return fallback;
}

const LOCAL_ASSETS = {
  logo: "/public/image/logo.png",
  hero: "/public/image/salon-mau-01-hero.png",
  hero02: "/public/image/salon-mau-01-hero-02.png",
  consultation: "/public/image/salon-mau-01-consultation.png",
  colorService: "/public/image/salon-mau-01-color-service.png",
  stylingService: "/public/image/salon-mau-01-styling-service.png",
  treatmentService: "/public/image/salon-mau-01-treatment-service.png",
  space01: "/public/image/salon-mau-01-space-01.png",
  space02: "/public/image/salon-mau-01-space-02.png",
  space03: "/public/image/salon-mau-01-space-03.png",
  experience: "/public/image/salon-mau-01-experience.png",
  products: "/public/image/salon-mau-01-products.png",
  services: {
    cut: "/public/image/dv-cat-tao-kieu.png",
    color: "/public/image/dv-mau-toc.png",
    fashionColor: "/public/image/dv-nhuom-thoi-trang.png",
    perm: "/public/image/dv-uon-setting.png",
    straight: "/public/image/dv-duoi-phuc-hoi.png",
    treatment: "/public/image/dv-cham-soc-phuc-hoi.png",
  },
};

const DEFAULT_BANNER = resolveAsset("salon.mau01.hero", LOCAL_ASSETS.hero);
const DEFAULT_PRODUCT_IMAGE = resolveAsset(
  "site.productLineup",
  "/public/image/thehairlab-hero-product-lineup.png"
);

const SALON_ASSETS = {
  hero: DEFAULT_BANNER,
  hero02: resolveAsset("salon.mau01.hero02", LOCAL_ASSETS.hero02),
  consultation: resolveAsset("salon.mau01.consultation", LOCAL_ASSETS.consultation),
  colorService: resolveAsset("salon.mau01.colorService", LOCAL_ASSETS.colorService),
  stylingService: resolveAsset("salon.mau01.stylingService", LOCAL_ASSETS.stylingService),
  treatmentService: resolveAsset("salon.mau01.treatmentService", LOCAL_ASSETS.treatmentService),
  space01: resolveAsset("salon.mau01.space01", LOCAL_ASSETS.space01),
  space02: resolveAsset("salon.mau01.space02", LOCAL_ASSETS.space02),
  space03: resolveAsset("salon.mau01.space03", LOCAL_ASSETS.space03),
  experience: resolveAsset("salon.mau01.experience", LOCAL_ASSETS.experience),
  productLineup: resolveAsset("salon.mau01.products", DEFAULT_PRODUCT_IMAGE),
  services: {
    cut: resolveAsset("salon.mau01.services.cut", LOCAL_ASSETS.services.cut),
    color: resolveAsset("salon.mau01.services.color", LOCAL_ASSETS.services.color),
    fashionColor: resolveAsset("salon.mau01.services.fashionColor", LOCAL_ASSETS.services.fashionColor),
    perm: resolveAsset("salon.mau01.services.perm", LOCAL_ASSETS.services.perm),
    straight: resolveAsset("salon.mau01.services.straight", LOCAL_ASSETS.services.straight),
    treatment: resolveAsset("salon.mau01.services.treatment", LOCAL_ASSETS.services.treatment),
  },
};

const PRODUCT_IMAGE_PATTERN =
  /thehairlab-hero-product-lineup|thehairlab-|care-oil|collagen|professional-hair-color|salon-technical-products/i;

const els = {
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  errorTitle: document.getElementById("error-title"),
  errorCopy: document.getElementById("error-copy"),
  salonPage: document.getElementById("salon-page"),
  metaDescription: document.getElementById("salon-description"),

  salonName: document.getElementById("salon-name"),
  salonNameDetail: document.getElementById("salon-name-detail"),
  navSalonName: document.getElementById("nav-salon-name"),
  navBrandSubtitle: document.getElementById("nav-brand-subtitle"),
  heroSubheadline: document.querySelector(".hero-subheadline"),

  salonAddressChip: document.getElementById("salon-address-chip"),
  salonHoursChip: document.getElementById("salon-hours-chip"),
  salonPhone: document.getElementById("salon-phone"),
  salonPhoneDetail: document.getElementById("salon-phone-detail"),
  salonAddress: document.getElementById("salon-address"),
  salonHours: document.getElementById("salon-hours"),
  salonPublicLink: document.getElementById("salon-public-link"),

  ctaCall: document.getElementById("cta-call"),
  ctaZalo: document.getElementById("cta-zalo"),
  navCall: document.getElementById("nav-call"),
  navZalo: document.getElementById("nav-zalo"),
  stickyCall: document.getElementById("sticky-call"),
  stickyZalo: document.getElementById("sticky-zalo"),
  stickyBook: document.getElementById("sticky-book"),
  mobileSticky: document.getElementById("mobile-sticky"),

  salonLogo: document.getElementById("salon-logo"),
  navLogo: document.getElementById("nav-logo"),
  salonMonogram: document.getElementById("salon-monogram"),
  navMonogram: document.getElementById("nav-monogram"),

  heroVisualImage: document.getElementById("hero-visual-image"),
  heroVisualCard: document.getElementById("hero-visual-card"),
  consultVisualImage: document.getElementById("consult-visual-image"),
  consultVisualCard: document.getElementById("consult-visual-card"),

  serviceVisualCut: document.getElementById("service-visual-cut"),
  serviceVisualCutCard: document.getElementById("service-visual-cut-card"),
  serviceVisualConsult: document.getElementById("service-visual-consult"),
  serviceVisualConsultCard: document.getElementById("service-visual-consult-card"),
  serviceVisualColor: document.getElementById("service-visual-color"),
  serviceVisualColorCard: document.getElementById("service-visual-color-card"),
  serviceVisualStyling: document.getElementById("service-visual-styling"),
  serviceVisualStylingCard: document.getElementById("service-visual-styling-card"),
  serviceVisualStraight: document.getElementById("service-visual-straight"),
  serviceVisualStraightCard: document.getElementById("service-visual-straight-card"),
  serviceVisualTreatment: document.getElementById("service-visual-treatment"),
  serviceVisualTreatmentCard: document.getElementById("service-visual-treatment-card"),

  gallerySpace01: document.getElementById("gallery-space-01"),
  gallerySpace01Card: document.getElementById("gallery-space-01-card"),
  gallerySpace02: document.getElementById("gallery-space-02"),
  gallerySpace02Card: document.getElementById("gallery-space-02-card"),
  gallerySpace03: document.getElementById("gallery-space-03"),
  gallerySpace03Card: document.getElementById("gallery-space-03-card"),
  gallerySpace04: document.getElementById("gallery-space-04"),
  gallerySpace04Card: document.getElementById("gallery-space-04-card"),

  productLineupImage: document.getElementById("product-lineup-image"),
  productLineupCard: document.getElementById("product-lineup-card"),

  infoZaloRow: document.getElementById("info-zalo-row"),
  infoFacebookRow: document.getElementById("info-facebook-row"),
  salonZaloLink: document.getElementById("salon-zalo-link"),
  salonFacebookLink: document.getElementById("salon-facebook-link"),

  appointmentForm: document.getElementById("appointment-form"),
  appointmentFeedback: document.getElementById("appointment-feedback"),
  appointmentQuickActions: document.getElementById("appointment-quick-actions"),
};

let heroVisualSyncBound = false;

function getSlugFromUrl() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] === "s" && parts[1]) {
    return decodeURIComponent(parts[1]);
  }

  const bodySlug = document.body?.dataset?.localSlug;
  if (bodySlug && bodySlug.trim()) {
    return bodySlug.trim();
  }

  const querySlug = new URLSearchParams(window.location.search).get("slug");
  return querySlug ? querySlug.trim() : "";
}

function handleLocalShim(slug) {
  const hasFullDom = Boolean(els.loadingState && els.salonPage && els.appointmentForm);
  if (hasFullDom) {
    return false;
  }

  const target = `/salon.html?slug=${encodeURIComponent(slug)}`;
  const sameTarget =
    window.location.pathname === "/salon.html" &&
    window.location.search === `?slug=${encodeURIComponent(slug)}`;

  if (!sameTarget) {
    window.location.replace(target);
  }

  return true;
}

function showState(state) {
  if (els.loadingState) {
    els.loadingState.classList.toggle("state-panel-active", state === "loading");
    els.loadingState.hidden = state !== "loading";
  }
  if (els.errorState) {
    els.errorState.classList.toggle("state-panel-active", state === "error");
    els.errorState.hidden = state !== "error";
  }
  if (els.salonPage) {
    els.salonPage.hidden = state !== "ready";
  }
}

function setText(node, value, fallback) {
  if (!node) {
    return;
  }
  const finalValue = value && String(value).trim() ? String(value).trim() : fallback;
  node.textContent = finalValue;
}

function setHref(node, value) {
  if (!node) {
    return false;
  }
  if (!value || !String(value).trim()) {
    node.removeAttribute("href");
    return false;
  }
  node.href = String(value).trim();
  return true;
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char] || char;
  });
}

function hexToRgb(hex) {
  const normalized = String(hex || "").trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return { r: 139, g: 92, b: 246 };
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function applyTheme(themeColor) {
  const color = themeColor || DEFAULT_THEME;
  const { r, g, b } = hexToRgb(color);
  document.documentElement.style.setProperty("--primary", color);
  document.documentElement.style.setProperty("--deep", color === DEFAULT_THEME ? "#6d28d9" : color);
  document.documentElement.style.setProperty("--line", `rgba(${r}, ${g}, ${b}, 0.18)`);
}

function getBrandSubtitle(name) {
  if (!name) {
    return "Lavender Beauty";
  }
  const parts = String(name).split("-");
  if (parts.length > 1) {
    return parts.slice(1).join("-").trim() || "Lavender Beauty";
  }
  return "Lavender Beauty";
}

function updateSeo(salon) {
  const title = `${salon.salon_name} | Tư vấn kiểu tóc phù hợp`;
  const description =
    "Đặt lịch tư vấn miễn phí kiểu tóc phù hợp với gương mặt tại Salon Test Mẫu 01 - Lavender Beauty. Tư vấn màu tóc, uốn, duỗi, nhuộm và chăm sóc phục hồi tóc.";

  document.title = title;
  if (els.metaDescription) {
    els.metaDescription.setAttribute("content", description);
  }
}

function showMonograms() {
  if (els.salonMonogram) {
    els.salonMonogram.hidden = false;
  }
  if (els.navMonogram) {
    els.navMonogram.hidden = false;
  }
  if (els.salonLogo) {
    els.salonLogo.hidden = true;
    els.salonLogo.removeAttribute("src");
  }
  if (els.navLogo) {
    els.navLogo.hidden = true;
    els.navLogo.removeAttribute("src");
  }
}

function setupLogo(logoUrl) {
  if (!logoUrl || !logoUrl.trim()) {
    showMonograms();
    return;
  }

  if (!els.salonLogo || !els.navLogo) {
    return;
  }

  const finalLogo = logoUrl.trim();
  els.salonLogo.hidden = false;
  els.navLogo.hidden = false;
  if (els.salonMonogram) {
    els.salonMonogram.hidden = true;
  }
  if (els.navMonogram) {
    els.navMonogram.hidden = true;
  }

  const fallback = () => showMonograms();
  els.salonLogo.onerror = fallback;
  els.navLogo.onerror = fallback;
  els.salonLogo.src = finalLogo;
  els.navLogo.src = finalLogo;
}

async function setMediaWithFallback(img, card, src, fallbackSrc, allowCompanyImage) {
  if (!img || !card) {
    return;
  }

  const preferredSrc = src && String(src).trim() ? String(src).trim() : "";
  const finalFallback = fallbackSrc && String(fallbackSrc).trim() ? String(fallbackSrc).trim() : "";

  let finalSrc = preferredSrc || finalFallback;
  if (!finalSrc) {
    img.hidden = true;
    img.removeAttribute("src");
    card.classList.add("is-fallback");
    return;
  }

  if (!allowCompanyImage && PRODUCT_IMAGE_PATTERN.test(finalSrc)) {
    if (!finalFallback || PRODUCT_IMAGE_PATTERN.test(finalFallback)) {
      img.hidden = true;
      img.removeAttribute("src");
      card.classList.add("is-fallback");
      return;
    }
    finalSrc = finalFallback;
  }

  img.hidden = false;
  card.classList.remove("is-fallback");
  img.onerror = () => {
    if (finalFallback && img.src !== new URL(finalFallback, window.location.origin).href) {
      img.src = finalFallback;
      return;
    }
    img.hidden = true;
    img.removeAttribute("src");
    card.classList.add("is-fallback");
  };
  img.src = finalSrc;
}

function updateHeroBackdropImage() {
  const backdrop = SALON_ASSETS.hero || LOCAL_ASSETS.hero;
  document.documentElement.style.setProperty("--salon-hero-backdrop-image", `url('${backdrop}')`);
}

async function renderMediaBlocks() {
  updateHeroBackdropImage();

  await Promise.all([
    setMediaWithFallback(els.heroVisualImage, els.heroVisualCard, SALON_ASSETS.hero, LOCAL_ASSETS.hero, false),
    setMediaWithFallback(
      els.consultVisualImage,
      els.consultVisualCard,
      SALON_ASSETS.consultation,
      LOCAL_ASSETS.consultation,
      false
    ),

    setMediaWithFallback(els.serviceVisualCut, els.serviceVisualCutCard, SALON_ASSETS.services.cut, LOCAL_ASSETS.services.cut, false),
    setMediaWithFallback(
      els.serviceVisualConsult,
      els.serviceVisualConsultCard,
      SALON_ASSETS.services.color,
      LOCAL_ASSETS.services.color,
      false
    ),
    setMediaWithFallback(
      els.serviceVisualColor,
      els.serviceVisualColorCard,
      SALON_ASSETS.services.fashionColor,
      LOCAL_ASSETS.services.fashionColor,
      false
    ),
    setMediaWithFallback(
      els.serviceVisualStyling,
      els.serviceVisualStylingCard,
      SALON_ASSETS.services.perm,
      LOCAL_ASSETS.services.perm,
      false
    ),
    setMediaWithFallback(
      els.serviceVisualStraight,
      els.serviceVisualStraightCard,
      SALON_ASSETS.services.straight,
      LOCAL_ASSETS.services.straight,
      false
    ),
    setMediaWithFallback(
      els.serviceVisualTreatment,
      els.serviceVisualTreatmentCard,
      SALON_ASSETS.services.treatment,
      LOCAL_ASSETS.services.treatment,
      false
    ),

    setMediaWithFallback(els.gallerySpace01, els.gallerySpace01Card, SALON_ASSETS.space01, LOCAL_ASSETS.space01, false),
    setMediaWithFallback(els.gallerySpace02, els.gallerySpace02Card, SALON_ASSETS.space02, LOCAL_ASSETS.space02, false),
    setMediaWithFallback(els.gallerySpace03, els.gallerySpace03Card, SALON_ASSETS.space03, LOCAL_ASSETS.space03, false),
    setMediaWithFallback(els.gallerySpace04, els.gallerySpace04Card, SALON_ASSETS.experience, LOCAL_ASSETS.experience, false),

    setMediaWithFallback(
      els.productLineupImage,
      els.productLineupCard,
      SALON_ASSETS.productLineup,
      LOCAL_ASSETS.products,
      true
    ),
  ]);
}

function syncHeroVisualCardHeight() {
  if (!els.heroVisualCard) {
    return;
  }

  if (window.matchMedia("(max-width: 1040px)").matches) {
    els.heroVisualCard.style.removeProperty("height");
    return;
  }

  const leftCard = document.querySelector(".hero-left");
  const heroRight = document.querySelector(".hero-right");
  const quickCard = document.querySelector(".hero-right .quick-card");
  if (!leftCard || !heroRight || !quickCard) {
    return;
  }

  const leftHeight = Math.round(leftCard.getBoundingClientRect().height);
  const quickHeight = Math.round(quickCard.getBoundingClientRect().height);
  const rowGap = parseFloat(getComputedStyle(heroRight).rowGap || "0") || 0;

  // Keep left and quick cards unchanged; shrink/grow only the image card to balance total column height.
  const targetImageHeight = Math.round(leftHeight - quickHeight - rowGap);
  if (targetImageHeight > 0) {
    els.heroVisualCard.style.height = `${targetImageHeight}px`;
  }
}

function bindHeroVisualSync() {
  if (heroVisualSyncBound) {
    return;
  }

  const runSync = () => {
    requestAnimationFrame(syncHeroVisualCardHeight);
  };

  window.addEventListener("resize", runSync, { passive: true });
  heroVisualSyncBound = true;
}

function renderQuickActions(salon) {
  if (!els.appointmentQuickActions) {
    return;
  }
  els.appointmentQuickActions.innerHTML = "";

  if (salon.zalo_url) {
    els.appointmentQuickActions.insertAdjacentHTML(
      "beforeend",
      `<a class="btn btn-soft" href="${escapeHtml(salon.zalo_url)}" target="_blank" rel="noreferrer">Nhắn Zalo salon</a>`
    );
  }
  if (salon.phone) {
    els.appointmentQuickActions.insertAdjacentHTML(
      "beforeend",
      `<a class="btn btn-soft" href="tel:${escapeHtml(salon.phone)}">Gọi salon</a>`
    );
  }
}

function updateContactActions(salon) {
  const callLink = salon.phone ? `tel:${salon.phone}` : "";
  const zaloLink = salon.zalo_url || "";

  [els.ctaCall, els.navCall, els.stickyCall].forEach((node) => {
    if (!node) {
      return;
    }
    node.hidden = !setHref(node, callLink);
  });

  [els.ctaZalo, els.navZalo, els.stickyZalo].forEach((node) => {
    if (!node) {
      return;
    }
    node.hidden = !setHref(node, zaloLink);
  });
}

function mergeSalonData(apiSalon) {
  return {
    ...DEFAULT_SALON,
    ...(apiSalon || {}),
  };
}

function renderSalon(salon, slug) {
  applyTheme(salon.theme_color);
  updateSeo(salon);

  const subtitle = getBrandSubtitle(salon.salon_name);
  if (els.navBrandSubtitle) {
    els.navBrandSubtitle.textContent = subtitle;
  }

  setText(els.salonName, salon.salon_name, DEFAULT_SALON.salon_name);
  setText(els.salonNameDetail, salon.salon_name, DEFAULT_SALON.salon_name);
  setText(els.navSalonName, salon.salon_name, DEFAULT_SALON.salon_name);
  setText(
    els.heroSubheadline,
    "Đặt lịch để được phân tích gương mặt, tư vấn màu tóc và chọn kiểu uốn/duỗi/nhuộm phù hợp phong cách cá nhân.",
    "Đặt lịch để được tư vấn kiểu tóc phù hợp."
  );

  setText(els.salonPhone, salon.phone, DEFAULT_SALON.phone);
  setText(els.salonPhoneDetail, salon.phone, DEFAULT_SALON.phone);
  setText(els.salonAddressChip, salon.address, DEFAULT_SALON.address);
  setText(els.salonAddress, salon.address, DEFAULT_SALON.address);
  setText(els.salonHoursChip, salon.working_hours, DEFAULT_SALON.working_hours);
  setText(els.salonHours, salon.working_hours, DEFAULT_SALON.working_hours);

  const publicLink = `${window.location.origin}/s/${slug}`;
  if (els.salonPublicLink) {
    els.salonPublicLink.href = publicLink;
    els.salonPublicLink.textContent = publicLink;
  }

  if (els.stickyBook) {
    els.stickyBook.href = "#salon-info";
  }
  if (els.mobileSticky) {
    els.mobileSticky.hidden = false;
  }

  if (els.infoZaloRow && els.salonZaloLink) {
    els.infoZaloRow.hidden = !setHref(els.salonZaloLink, salon.zalo_url || "");
  }
  if (els.infoFacebookRow && els.salonFacebookLink) {
    els.infoFacebookRow.hidden = !setHref(els.salonFacebookLink, salon.facebook_url || "");
  }

  setupLogo(salon.logo_url || LOCAL_ASSETS.logo);
  updateContactActions(salon);
  renderQuickActions(salon);
  renderMediaBlocks();
  showState("ready");
  bindHeroVisualSync();
  syncHeroVisualCardHeight();
  setTimeout(syncHeroVisualCardHeight, 300);
  setTimeout(syncHeroVisualCardHeight, 900);
}

function showError(title, copy) {
  if (els.errorTitle) {
    els.errorTitle.textContent = title;
  }
  if (els.errorCopy) {
    els.errorCopy.textContent = copy;
  }
  showState("error");
}

function bindDemoForm(salon) {
  if (!els.appointmentForm || !els.appointmentFeedback) {
    return;
  }

  els.appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    els.appointmentFeedback.textContent =
      "Thông tin đã được ghi nhận demo. Phase sau sẽ nối form này về Telegram và Google Sheet riêng của salon.";
    renderQuickActions(salon);
  });
}

async function loadSalon() {
  const slug = getSlugFromUrl();
  if (!slug) {
    showError(
      "Salon không tồn tại hoặc đang tạm ngưng",
      "Không tìm thấy slug salon trong đường dẫn hiện tại."
    );
    return;
  }

  if (handleLocalShim(slug)) {
    return;
  }

  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    });
    clearTimeout(fetchTimeout);
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || !data?.success || !data?.salon) {
      showError(
        "Salon không tồn tại hoặc đang tạm ngưng",
        "Salon không tồn tại hoặc đang tạm ngưng. Vui lòng quay về The Hair Lab để xem thêm thông tin."
      );
      return;
    }

    const salon = mergeSalonData(data.salon);
    renderSalon(salon, slug);
    bindDemoForm(salon);
  } catch {
    clearTimeout(fetchTimeout);
    const fallbackSalon = mergeSalonData(null);
    renderSalon(fallbackSalon, slug);
    bindDemoForm(fallbackSalon);
  }
}

showState("loading");
loadSalon();
