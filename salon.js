const THL_WORKER_API_BASE = "https://thehairlab-leads-worker.khuongbinh-info.workers.dev";
const API_BASE = `${THL_WORKER_API_BASE}/api/public/salons`;
const TEMPLATE_CONFIGS = {
  "01": {
    slug: "salon-test-mau-01",
    assetPrefix: "salon.mau01",
    name: "Salon Test Mẫu 01 - Lavender Beauty",
    subtitle: "Lavender Beauty",
    monogram: "M01",
    phone: "0900000000",
    zalo: "https://zalo.me/0900000000",
    address: "123 Lavender Beauty, Phường Salon, TP. Hồ Chí Minh",
    theme: {
      primary: "#8b5cf6",
      secondary: "#6d28d9",
      accent: "#ede9fe",
      background: "#fffaf5",
      textDark: "#221b35",
      heroGradient: "linear-gradient(118deg, rgba(237, 233, 254, 0.88) 0%, rgba(217, 199, 255, 0.82) 28%, rgba(167, 139, 250, 0.76) 58%, rgba(139, 92, 246, 0.72) 100%)",
    },
  },
  "02": {
    slug: "salon-test-mau-02",
    assetPrefix: "salon.mau02",
    name: "Salon Test Mẫu 02 - Green Natural Care",
    subtitle: "Green Natural",
    monogram: "M02",
    phone: "0900000000",
    zalo: "https://zalo.me/0900000000",
    address: "98 Green Garden, Quận 7, TP. Hồ Chí Minh",
    theme: {
      primary: "#6E8F62",
      secondary: "#A8BF8A",
      accent: "#DDE8CF",
      background: "#F6F8F2",
      textDark: "#2F3A2C",
      heroGradient: "linear-gradient(135deg, #F6F8F2 0%, #DDE8CF 45%, #A8BF8A 100%)",
    },
  },
  "03": {
    slug: "salon-test-mau-03",
    assetPrefix: "salon.mau03",
    name: "Salon Test Mẫu 03 - Black Gold Luxury",
    subtitle: "Black Gold Luxury",
    monogram: "M03",
    phone: "0900000000",
    zalo: "https://zalo.me/0900000000",
    address: "15 Gold Tower, Quận 1, TP. Hồ Chí Minh",
    theme: {
      primary: "#171717",
      secondary: "#C8A96B",
      accent: "#E7D3A8",
      background: "#F8F5EF",
      textDark: "#1F1A17",
      heroGradient: "linear-gradient(135deg, #171717 0%, #2B241B 48%, #C8A96B 100%)",
    },
  },
  "04": {
    slug: "salon-test-mau-04",
    assetPrefix: "salon.mau04",
    name: "Salon Test Mẫu 04 - Spring Fresh Studio",
    subtitle: "Spring Fresh",
    monogram: "M04",
    phone: "0900000000",
    zalo: "https://zalo.me/0900000000",
    address: "52 Blossom Avenue, Phú Nhuận, TP. Hồ Chí Minh",
    theme: {
      primary: "#E8A7B5",
      secondary: "#F7C9B6",
      accent: "#FFF1D9",
      background: "#FFF8F6",
      textDark: "#5C4A4F",
      heroGradient: "linear-gradient(135deg, #FFF8F6 0%, #FFF1D9 42%, #F7C9B6 100%)",
    },
  },
  "05": {
    slug: "salon-test-mau-05",
    assetPrefix: "salon.mau05",
    name: "Salon Test Mẫu 05 - Gold Luxury Professional",
    subtitle: "Gold Luxury Pro",
    monogram: "M05",
    phone: "0900000000",
    zalo: "https://zalo.me/0900000000",
    address: "28 Prestige Center, Quận 3, TP. Hồ Chí Minh",
    theme: {
      primary: "#B8924A",
      secondary: "#E5D2A2",
      accent: "#F7EED5",
      background: "#FFFCF5",
      textDark: "#4C3A1E",
      heroGradient: "linear-gradient(135deg, #FFFCF5 0%, #F7EED5 45%, #E5D2A2 100%)",
    },
  },
};

const DEFAULT_TEMPLATE_ID = "01";

const TEMPLATE_SALON_OVERRIDES = {
  "salon-test-mau-02": {
    slug: "salon-test-mau-02",
    templateId: "02",
    salon_name: "Salon Test Mẫu 02 - Green Natural",
    status: "active",
    themeName: "Green Natural",
    phone: "0902 964 685",
    zalo_url: "https://zalo.me/0902964685",
    address: "The Hair Lab - Mẫu giao diện salon thiên nhiên",
    description: "Mẫu landing page salon phong cách thiên nhiên, phục hồi và chăm sóc tóc lành tính.",
  },
  "salon-test-mau-03": {
    slug: "salon-test-mau-03",
    templateId: "03",
    salon_name: "Salon Test Mẫu 03 - Black Gold Luxury",
    status: "active",
    themeName: "Black Gold Luxury",
    phone: "0902 964 685",
    zalo_url: "https://zalo.me/0902964685",
    address: "The Hair Lab - Mẫu giao diện salon cao cấp",
    description: "Mẫu landing page salon phong cách premium, sang trọng, uốn nhuộm cao cấp.",
  },
  "salon-test-mau-04": {
    slug: "salon-test-mau-04",
    templateId: "04",
    salon_name: "Salon Test Mẫu 04 - Spring Fresh",
    status: "active",
    themeName: "Spring Fresh",
    phone: "0902 964 685",
    zalo_url: "https://zalo.me/0902964685",
    address: "The Hair Lab - Mẫu giao diện salon trẻ trung",
    description: "Mẫu landing page salon phong cách tươi sáng, nữ tính, gần gũi với khách trẻ.",
  },
  "salon-test-mau-05": {
    slug: "salon-test-mau-05",
    templateId: "05",
    salon_name: "Salon Test Mẫu 05 - Gold Luxury Professional",
    status: "active",
    themeName: "Gold Luxury Professional",
    phone: "0902 964 685",
    zalo_url: "https://zalo.me/0902964685",
    address: "The Hair Lab - Mẫu giao diện salon chuyên nghiệp",
    description: "Mẫu landing page salon phong cách gold sáng, chuyên nghiệp, phục hồi cao cấp.",
  },
  "salon-demo-test": {
    slug: "salon-demo-test",
    templateId: "02",
    salon_name: "Salon Demo Test",
    status: "active",
    themeName: "Green Natural",
    phone: "0902 964 685",
    zalo_url: "https://zalo.me/0902964685",
    address: "Tan An, Long An",
    description: "Salon demo dung de kiem tra quy trinh nhan ban tu template.",
  },
  "salon-hung-saigon": {
    slug: "salon-hung-saigon",
    templateId: "02",
    salon_name: "Salon Hưng Saigon",
    status: "active",
    themeName: "Green Natural",
    phone: "0938212878",
    zalo_url: "https://zalo.me/0938212878",
    address: "Tân An, Long An",
    description: "Dat lich tu van mien phi kieu toc phu hop guong mat tai Salon Hưng Saigon.",
  },
};

const DEFAULT_SALON = {
  salon_name: TEMPLATE_CONFIGS[DEFAULT_TEMPLATE_ID].name,
  phone: TEMPLATE_CONFIGS[DEFAULT_TEMPLATE_ID].phone,
  zalo_url: TEMPLATE_CONFIGS[DEFAULT_TEMPLATE_ID].zalo,
  facebook_url: "https://facebook.com/thehairlab.top",
  address: TEMPLATE_CONFIGS[DEFAULT_TEMPLATE_ID].address,
  working_hours: "08:00 - 20:00 mỗi ngày",
  theme_color: TEMPLATE_CONFIGS[DEFAULT_TEMPLATE_ID].theme.primary,
  logo_url: "",
};

function resolveAsset(key, fallback) {
  if (typeof window.thlAsset === "function") {
    return window.thlAsset(key, fallback);
  }
  return fallback;
}

function getTemplateIdFromSlug(slug) {
  const match = String(slug || "").match(/salon-test-mau-(\d{2})/i);
  return match ? match[1] : DEFAULT_TEMPLATE_ID;
}

function normalizeTemplateId(value) {
  const match = String(value || "").match(/^(\d{2})$/);
  return match ? match[1] : "";
}

function getTemplateIdForSlug(slug, apiSalon, adminData) {
  const explicitTemplateId = normalizeTemplateId(
    adminData?.templateId || adminData?.template_id || apiSalon?.template_id
  );
  const overrideTemplateId = normalizeTemplateId(TEMPLATE_SALON_OVERRIDES[slug]?.templateId);
  return explicitTemplateId || overrideTemplateId || getTemplateIdFromSlug(slug) || DEFAULT_TEMPLATE_ID;
}

function getTemplateConfigById(templateId) {
  const resolvedTemplateId = normalizeTemplateId(templateId) || DEFAULT_TEMPLATE_ID;
  const config = TEMPLATE_CONFIGS[resolvedTemplateId] || TEMPLATE_CONFIGS[DEFAULT_TEMPLATE_ID];
  return JSON.parse(JSON.stringify(config));
}

function getTemplateConfig(slug, apiSalon, adminData) {
  return getTemplateConfigById(getTemplateIdForSlug(slug, apiSalon, adminData));
}

function hasRenderableValue(value) {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }
  return true;
}

function shouldUseAdminTheme(slug, apiSalon, adminData) {
  const explicitTemplateId = normalizeTemplateId(
    adminData?.templateId || adminData?.template_id || apiSalon?.template_id
  );
  if (explicitTemplateId) {
    return true;
  }
  return !/^salon-test-mau-\d{2}$/i.test(String(slug || ""));
}

function mergeThemeData(baseTheme, adminTheme, allowOverride) {
  const mergedTheme = { ...baseTheme };
  if (!allowOverride || !adminTheme || typeof adminTheme !== "object") {
    return mergedTheme;
  }

  ["primary", "secondary", "accent", "background", "textDark", "heroGradient"].forEach((key) => {
    if (hasRenderableValue(adminTheme[key])) {
      mergedTheme[key] = String(adminTheme[key]).trim();
    }
  });

  return mergedTheme;
}

function getLocalAssetsByTemplate(templateId) {
  if (templateId !== "01") {
    return {
      logo: "/public/image/logo.png",
      hero: "",
      hero02: "",
      consultation: "",
      colorService: "",
      stylingService: "",
      treatmentService: "",
      space01: "",
      space02: "",
      space03: "",
      experience: "",
      products: "",
      services: {
        cut: "",
        color: "",
        fashionColor: "",
        perm: "",
        straight: "",
        treatment: "",
      },
    };
  }

  return {
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
}

function buildSalonAssets(templateConfig, localAssets) {
  const prefix = templateConfig.assetPrefix;
  return {
    hero: resolveAsset(`${prefix}.hero`, localAssets.hero),
    hero02: resolveAsset(`${prefix}.hero02`, localAssets.hero02),
    consultation: resolveAsset(`${prefix}.consultation`, localAssets.consultation),
    colorService: resolveAsset(`${prefix}.colorService`, localAssets.colorService),
    stylingService: resolveAsset(`${prefix}.stylingService`, localAssets.stylingService),
    treatmentService: resolveAsset(`${prefix}.treatmentService`, localAssets.treatmentService),
    space01: resolveAsset(`${prefix}.space01`, localAssets.space01),
    space02: resolveAsset(`${prefix}.space02`, localAssets.space02),
    space03: resolveAsset(`${prefix}.space03`, localAssets.space03),
    experience: resolveAsset(`${prefix}.experience`, localAssets.experience),
    productLineup: resolveAsset(`${prefix}.products`, localAssets.products),
    services: {
      cut: resolveAsset(`${prefix}.services.cut`, localAssets.services.cut),
      color: resolveAsset(`${prefix}.services.color`, localAssets.services.color),
      fashionColor: resolveAsset(`${prefix}.services.fashionColor`, localAssets.services.fashionColor),
      perm: resolveAsset(`${prefix}.services.perm`, localAssets.services.perm),
      straight: resolveAsset(`${prefix}.services.straight`, localAssets.services.straight),
      treatment: resolveAsset(`${prefix}.services.treatment`, localAssets.services.treatment),
    },
  };
}

let activeTemplateConfig = TEMPLATE_CONFIGS[DEFAULT_TEMPLATE_ID];
let LOCAL_ASSETS = getLocalAssetsByTemplate(DEFAULT_TEMPLATE_ID);
let SALON_ASSETS = buildSalonAssets(activeTemplateConfig, LOCAL_ASSETS);

const CUSTOMER_IMAGE_MANIFEST_OVERRIDES = {
  "salon-hung-saigon": {
    missingKeys: ["space-01"],
    images: {
      hero: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/hero.png",
      hero02: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/hero-02.png",
      consultation: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/consultation.png?v=20260509b",
      colorService: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/color-service.png",
      stylingService: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/styling-service.png",
      treatmentService: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/treatment-service.jpg",
      space02: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/space-02.png",
      space03: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/space-03.png",
      experience: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/experience.png?v=20260509b",
      products: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/products.png",
      services: {
        cut: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/dv-cat-tao-kieu.png",
        color: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/dv-mau-toc.png?v=20260509b",
        fashionColor: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/dv-nhuom-thoi-trang.png",
        perm: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/dv-uon-setting.png",
        straight: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/dv-duoi-phuc-hoi.jpg",
        treatment: "https://cdn.thehairlab.top/thehairlab/salon/customers/salon-hung-saigon/dv-cham-soc-phuc-hoi.png",
      },
    },
  },
};

function getCustomerImageOverride(slug) {
  return CUSTOMER_IMAGE_MANIFEST_OVERRIDES[String(slug || "")] || null;
}

function applyCustomerImageOverrides(slug) {
  const override = getCustomerImageOverride(slug);
  if (!override || !override.images) {
    return;
  }

  const images = override.images;
  const services = images.services || {};

  SALON_ASSETS = {
    ...SALON_ASSETS,
    hero: images.hero || SALON_ASSETS.hero,
    hero02: images.hero02 || SALON_ASSETS.hero02,
    consultation: images.consultation || SALON_ASSETS.consultation,
    colorService: images.colorService || SALON_ASSETS.colorService,
    stylingService: images.stylingService || SALON_ASSETS.stylingService,
    treatmentService: images.treatmentService || SALON_ASSETS.treatmentService,
    space01: images.space01 || SALON_ASSETS.space01,
    space02: images.space02 || SALON_ASSETS.space02,
    space03: images.space03 || SALON_ASSETS.space03,
    experience: images.experience || SALON_ASSETS.experience,
    productLineup: images.products || SALON_ASSETS.productLineup,
    services: {
      ...SALON_ASSETS.services,
      cut: services.cut || SALON_ASSETS.services.cut,
      color: services.color || SALON_ASSETS.services.color,
      fashionColor: services.fashionColor || SALON_ASSETS.services.fashionColor,
      perm: services.perm || SALON_ASSETS.services.perm,
      straight: services.straight || SALON_ASSETS.services.straight,
      treatment: services.treatment || SALON_ASSETS.services.treatment,
    },
  };

  const missingKeys = new Set((override.missingKeys || []).map((item) => String(item)));
  if (missingKeys.has("consultation")) {
    SALON_ASSETS.consultation = "";
  }
  if (missingKeys.has("space-01")) {
    SALON_ASSETS.space01 = "";
  }
  if (missingKeys.has("experience")) {
    SALON_ASSETS.experience = "";
  }
  if (missingKeys.has("dv-mau-toc")) {
    SALON_ASSETS.services.color = "";
  }
}

function applyMissingCardVisibility(slug) {
  const override = getCustomerImageOverride(slug);
  const missingKeys = new Set(((override && override.missingKeys) || []).map((item) => String(item)));

  if (els.consultVisualCard) {
    els.consultVisualCard.hidden = missingKeys.has("consultation");
  }
  if (els.gallerySpace01Card) {
    els.gallerySpace01Card.hidden = missingKeys.has("space-01");
  }
  if (els.gallerySpace04Card) {
    els.gallerySpace04Card.hidden = missingKeys.has("experience");
  }
  if (els.serviceVisualConsultCard) {
    els.serviceVisualConsultCard.hidden = missingKeys.has("dv-mau-toc");
  }
}

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

function applyTheme(templateTheme, themeColorOverride) {
  const color = themeColorOverride || templateTheme.primary;
  const deep = templateTheme.secondary;
  const soft = templateTheme.accent;
  const cream = templateTheme.background;
  const textDark = templateTheme.textDark;
  const heroGradient = templateTheme.heroGradient;
  const { r, g, b } = hexToRgb(color);
  const deepRgb = hexToRgb(deep);
  const textDarkRgb = hexToRgb(textDark);

  document.documentElement.style.setProperty("--primary", color);
  document.documentElement.style.setProperty("--deep", deep);
  document.documentElement.style.setProperty("--soft", soft);
  document.documentElement.style.setProperty("--cream", cream);
  document.documentElement.style.setProperty("--champagne", templateTheme.secondary);
  document.documentElement.style.setProperty("--text-dark", textDark);
  document.documentElement.style.setProperty("--text-soft", `rgba(${deepRgb.r}, ${deepRgb.g}, ${deepRgb.b}, 0.8)`);
  document.documentElement.style.setProperty("--line", `rgba(${r}, ${g}, ${b}, 0.18)`);
  document.documentElement.style.setProperty("--shadow", `0 20px 45px rgba(${r}, ${g}, ${b}, 0.14)`);
  document.documentElement.style.setProperty("--salon-hero-gradient", heroGradient);
  document.documentElement.style.setProperty(
    "--salon-hero-panel-gradient",
    `linear-gradient(145deg, rgba(${textDarkRgb.r}, ${textDarkRgb.g}, ${textDarkRgb.b}, 0.82) 0%, rgba(${deepRgb.r}, ${deepRgb.g}, ${deepRgb.b}, 0.74) 100%)`
  );
  document.documentElement.style.setProperty(
    "--salon-monogram-gradient",
    `linear-gradient(140deg, ${deep} 0%, ${color} 62%, ${textDark} 100%)`
  );
  document.documentElement.style.setProperty("--salon-hero-glow", `rgba(${r}, ${g}, ${b}, 0.16)`);

  document.body.style.background =
    `radial-gradient(circle at 12% -8%, rgba(${r}, ${g}, ${b}, 0.18) 0%, rgba(${r}, ${g}, ${b}, 0) 36%),` +
    `radial-gradient(circle at 88% 2%, rgba(${deepRgb.r}, ${deepRgb.g}, ${deepRgb.b}, 0.16) 0%, rgba(${deepRgb.r}, ${deepRgb.g}, ${deepRgb.b}, 0) 30%),` +
    `linear-gradient(145deg, ${cream} 0%, ${soft} 52%, #ffffff 100%)`;
}

function updateSeo(salon) {
  const title = `${salon.salon_name} | Tư vấn kiểu tóc phù hợp`;
  const description = `Đặt lịch tư vấn miễn phí kiểu tóc phù hợp với gương mặt tại ${salon.salon_name}. Tư vấn màu tóc, uốn, duỗi, nhuộm và chăm sóc phục hồi tóc.`;

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
    card.hidden = true;
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

  const canLoadImage = (url) =>
    new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }

      const testImage = new Image();
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) {
          return;
        }
        settled = true;
        resolve(false);
      }, 6000);

      testImage.onload = () => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        resolve(true);
      };

      testImage.onerror = () => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        resolve(false);
      };

      testImage.src = url;
    });

  let resolvedSrc = "";
  if (await canLoadImage(finalSrc)) {
    resolvedSrc = finalSrc;
  } else if (finalFallback && finalFallback !== finalSrc && (await canLoadImage(finalFallback))) {
    resolvedSrc = finalFallback;
  }

  if (!resolvedSrc) {
    img.hidden = true;
    img.removeAttribute("src");
    card.hidden = true;
    card.classList.add("is-fallback");
    return;
  }

  img.src = resolvedSrc;
  card.hidden = false;
  img.hidden = false;
  card.classList.remove("is-fallback");
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

  // Hide Zalo in top navigation only; keep hero and sticky Zalo actions.
  if (els.navZalo) {
    els.navZalo.hidden = true;
    els.navZalo.style.display = "none";
    els.navZalo.removeAttribute("href");
  }

  [els.ctaZalo, els.stickyZalo].forEach((node) => {
    if (!node) {
      return;
    }
    node.hidden = !setHref(node, zaloLink);
  });
}

function mergeSalonData(apiSalon, templateConfig) {
  const templateSalon = {
    salon_name: templateConfig.name,
    phone: templateConfig.phone,
    zalo_url: templateConfig.zalo,
    address: templateConfig.address,
    theme_color: templateConfig.theme.primary,
  };

  const candidateSalon = apiSalon || {};

  return {
    ...DEFAULT_SALON,
    ...templateSalon,
    ...Object.fromEntries(
      Object.entries(candidateSalon).filter(([, value]) => hasRenderableValue(value))
    ),
  };
}

function renderSalon(salon, slug, themeConfig = activeTemplateConfig.theme) {
  applyTheme(themeConfig, salon.theme_color);
  updateSeo(salon);

  const subtitle = activeTemplateConfig.subtitle;
  if (els.navBrandSubtitle) {
    els.navBrandSubtitle.textContent = subtitle;
  }

  if (els.navMonogram) {
    els.navMonogram.textContent = activeTemplateConfig.monogram;
  }
  if (els.salonMonogram) {
    const codeNode = els.salonMonogram.querySelector("strong");
    const subNode = els.salonMonogram.querySelector("span");
    if (codeNode) {
      codeNode.textContent = activeTemplateConfig.monogram;
    }
    if (subNode) {
      subNode.textContent = activeTemplateConfig.subtitle;
    }
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
  applyMissingCardVisibility(slug);
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

function setAppointmentFeedback(message, type = "info") {
  if (!els.appointmentFeedback) {
    return;
  }

  els.appointmentFeedback.textContent = message;

  if (type === "error") {
    els.appointmentFeedback.style.color = "#b91c1c";
    return;
  }

  if (type === "warning") {
    els.appointmentFeedback.style.color = "#b45309";
    return;
  }

  if (type === "success") {
    els.appointmentFeedback.style.color = "#065f46";
    return;
  }

  els.appointmentFeedback.style.color = "";
}

function bindPublicLeadForm(salon, slug) {
  if (!els.appointmentForm || !els.appointmentFeedback) {
    return;
  }

  const submitButton = els.appointmentForm.querySelector('button[type="submit"]');

  els.appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(els.appointmentForm);

    const payload = {
      name: String(formData.get("customer_name") || "").trim(),
      phone: String(formData.get("customer_phone") || "").trim(),
      service: String(formData.get("service_name") || "").trim(),
      preferredDate: String(formData.get("appointment_date") || "").trim(),
      preferredTime: String(formData.get("appointment_time") || "").trim(),
      note: String(formData.get("customer_note") || "").trim(),
      sourceUrl: window.location.href,
    };

    if (!payload.name) {
      setAppointmentFeedback("Vui lòng nhập họ tên.", "error");
      return;
    }

    if (!payload.phone) {
      setAppointmentFeedback("Vui lòng nhập số điện thoại.", "error");
      return;
    }

    if (!/^[0-9+()\s.\-]{7,20}$/.test(payload.phone)) {
      setAppointmentFeedback("Số điện thoại không hợp lệ.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    setAppointmentFeedback("Đang gửi thông tin tư vấn...");

    try {
      const response = await fetch(
        `${THL_WORKER_API_BASE}/api/salons/${encodeURIComponent(slug)}/leads`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const serverError = data?.error || `HTTP ${response.status}`;
        setAppointmentFeedback(`Gửi thất bại: ${serverError}`, "error");
        return;
      }

      if (data?.success) {
        if (data?.warning) {
          setAppointmentFeedback(
            `Đã gửi thông tin tư vấn. Salon sẽ liên hệ lại sớm. Lưu ý: ${data.warning}`,
            "warning"
          );
        } else {
          setAppointmentFeedback("Đã gửi thông tin tư vấn. Salon sẽ liên hệ lại sớm.", "success");
        }
        renderQuickActions(salon);
        return;
      }

      if (data?.leadSaved) {
        const detail = data?.warning || data?.error || "Lỗi không xác định từ Telegram.";
        setAppointmentFeedback(
          `Đã lưu thông tin, nhưng gửi Telegram thất bại. Vui lòng kiểm tra cấu hình Telegram. Chi tiết: ${detail}`,
          "warning"
        );
        renderQuickActions(salon);
        return;
      }

      setAppointmentFeedback(
        `Gửi thất bại: ${data?.error || data?.warning || "Lỗi không xác định."}`,
        "error"
      );
    } catch (error) {
      setAppointmentFeedback(`Không kết nối được hệ thống: ${error?.message || error}`, "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
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

  const demoOverride = TEMPLATE_SALON_OVERRIDES[slug];
  const initialTemplateId = demoOverride?.templateId || getTemplateIdForSlug(slug) || DEFAULT_TEMPLATE_ID;
  activeTemplateConfig = getTemplateConfigById(initialTemplateId);
  LOCAL_ASSETS = getLocalAssetsByTemplate(initialTemplateId);
  SALON_ASSETS = buildSalonAssets(activeTemplateConfig, LOCAL_ASSETS);
  applyCustomerImageOverrides(slug);

  // Try to fetch from D1 via Worker API first
  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 8000);

  try {
    // Try new GET /api/salons/:slug endpoint (D1-backed)
    const response = await fetch(`${THL_WORKER_API_BASE}/api/salons/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    });
    clearTimeout(fetchTimeout);

    if (response.ok) {
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (data?.success && data?.salon) {
        // D1 has this salon - use it
        const salonData = data.salon;
        const resolvedTemplateId = getTemplateIdForSlug(slug, salonData, salonData.admin_data);
        activeTemplateConfig = getTemplateConfigById(resolvedTemplateId);
        LOCAL_ASSETS = getLocalAssetsByTemplate(resolvedTemplateId);
        SALON_ASSETS = buildSalonAssets(activeTemplateConfig, LOCAL_ASSETS);
        applyCustomerImageOverrides(slug);
        let salonToRender = null;
        const resolvedTheme = mergeThemeData(
          activeTemplateConfig.theme,
          salonData.admin_data?.theme,
          shouldUseAdminTheme(slug, salonData, salonData.admin_data)
        );

        // If D1 has admin_data JSON, use it (includes theme, services, etc)
        if (salonData.admin_data && typeof salonData.admin_data === 'object') {
          // admin_data has full version 3 structure
          salonToRender = {
            salon_name: salonData.admin_data.salon?.name || salonData.salon_name,
            phone: salonData.admin_data.salon?.phone || salonData.phone,
            zalo_url: salonData.admin_data.salon?.zalo ? `https://zalo.me/${salonData.admin_data.salon.zalo}` : salonData.zalo_url,
            address: salonData.admin_data.salon?.address || salonData.address,
            working_hours: salonData.working_hours || DEFAULT_SALON.working_hours,
            theme_color: resolvedTheme.primary,
            logo_url: salonData.logo_url || '',
            facebook_url: salonData.facebook_url || DEFAULT_SALON.facebook_url,
          };
          // Merge and apply full admin data rendering
          const mergedSalon = mergeSalonData(salonToRender, activeTemplateConfig);
          renderSalon(mergedSalon, slug, resolvedTheme);
          bindPublicLeadForm(mergedSalon, slug);
          return;
        } else {
          // Only basic salon info in D1, no admin customization yet
          salonToRender = mergeSalonData(
            {
              salon_name: salonData.salon_name,
              phone: salonData.phone,
              zalo_url: salonData.zalo_url,
              address: salonData.address,
              working_hours: salonData.working_hours,
              theme_color: salonData.theme_color,
              logo_url: salonData.logo_url,
              facebook_url: salonData.facebook_url,
            },
            activeTemplateConfig
          );
          renderSalon(salonToRender, slug, activeTemplateConfig.theme);
          bindPublicLeadForm(salonToRender, slug);
          return;
        }
      }
    }
  } catch (error) {
    // /api/salons/:slug failed or timeout - will fallback below
  }

  clearTimeout(fetchTimeout);

  // Fallback: try old API_BASE endpoint if available
  const controller2 = new AbortController();
  const fetchTimeout2 = setTimeout(() => controller2.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`, {
      signal: controller2.signal,
    });
    clearTimeout(fetchTimeout2);
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok && data?.success && data?.salon) {
      const salon = mergeSalonData(data.salon, activeTemplateConfig);
      renderSalon(salon, slug);
      bindPublicLeadForm(salon, slug);
      return;
    }
  } catch (error) {
    // Old API also failed
  }

  clearTimeout(fetchTimeout2);

  // Final fallback: use static config if any defined
  const fallbackSalon = mergeSalonData(demoOverride || null, activeTemplateConfig);
  renderSalon(fallbackSalon, slug);
  bindPublicLeadForm(fallbackSalon, slug);
}

showState("loading");
loadSalon();
