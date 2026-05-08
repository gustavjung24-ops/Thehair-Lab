const API_BASE = "https://thehairlab-leads-worker.khuongbinh-thehairlab.workers.dev/api/public/salons";
const DEFAULT_THEME = "#8b5cf6";
const DEFAULT_BANNER = "/public/image/mau-01.jpg";
const DEFAULT_PRODUCT_IMAGE = "/public/image/thehairlab-hero-product-lineup.png";

const els = {
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  errorTitle: document.getElementById("error-title"),
  errorCopy: document.getElementById("error-copy"),
  salonPage: document.getElementById("salon-page"),
  metaDescription: document.getElementById("salon-description"),
  salonName: document.getElementById("salon-name"),
  navSalonName: document.getElementById("nav-salon-name"),
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
  salonMonogram: document.getElementById("salon-monogram"),
  heroMedia: document.getElementById("hero-media"),
  heroBanner: document.getElementById("hero-banner"),
  galleryMainImage: document.getElementById("gallery-main-image"),
  galleryProductImage: document.getElementById("gallery-product-image"),
  productLineupImage: document.getElementById("product-lineup-image"),
  infoZaloRow: document.getElementById("info-zalo-row"),
  infoFacebookRow: document.getElementById("info-facebook-row"),
  salonZaloLink: document.getElementById("salon-zalo-link"),
  salonFacebookLink: document.getElementById("salon-facebook-link"),
  appointmentForm: document.getElementById("appointment-form"),
  appointmentFeedback: document.getElementById("appointment-feedback"),
  appointmentQuickActions: document.getElementById("appointment-quick-actions"),
};

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

function setText(node, value, fallback = "Đang cập nhật") {
  if (!node) {
    return;
  }
  node.textContent = value && String(value).trim() ? value : fallback;
}

function setHref(node, value) {
  if (!node) {
    return false;
  }
  if (!value || !String(value).trim()) {
    node.removeAttribute("href");
    return false;
  }
  node.href = value;
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
  document.documentElement.style.setProperty("--primary-deep", color === DEFAULT_THEME ? "#6d28d9" : color);
  document.documentElement.style.setProperty("--line", `rgba(${r}, ${g}, ${b}, 0.16)`);
}

function updateSeo(salon) {
  document.title = `${salon.salon_name} | The Hair Lab`;
  if (els.metaDescription) {
    els.metaDescription.setAttribute(
      "content",
      `Đặt lịch và tư vấn kiểu tóc phù hợp tại ${salon.salon_name}.`
    );
  }
  const canonical = document.querySelector("link[rel='canonical']");
  if (canonical) {
    canonical.setAttribute("href", window.location.href);
  }
}

function bindImageWithFallback(img, primary, fallback) {
  if (!img) {
    return;
  }

  const finalFallback = fallback || "";
  img.onerror = () => {
    if (finalFallback && img.dataset.fallbackApplied !== "true") {
      img.dataset.fallbackApplied = "true";
      img.src = finalFallback;
      return;
    }
    img.removeAttribute("src");
    if (els.heroMedia && img === els.heroBanner) {
      els.heroMedia.classList.add("no-image");
    }
  };

  if (!primary && finalFallback) {
    img.src = finalFallback;
    return;
  }

  if (primary) {
    img.src = primary;
    return;
  }

  img.removeAttribute("src");
}

function setupLogo(logoUrl) {
  if (!els.salonLogo || !els.salonMonogram) {
    return;
  }

  if (!logoUrl || !logoUrl.trim()) {
    els.salonLogo.hidden = true;
    els.salonLogo.removeAttribute("src");
    els.salonMonogram.hidden = false;
    return;
  }

  els.salonLogo.hidden = false;
  els.salonMonogram.hidden = true;
  els.salonLogo.onerror = () => {
    els.salonLogo.hidden = true;
    els.salonLogo.removeAttribute("src");
    els.salonMonogram.hidden = false;
  };
  els.salonLogo.src = logoUrl;
}

function renderQuickActions(salon) {
  if (!els.appointmentQuickActions) {
    return;
  }
  els.appointmentQuickActions.innerHTML = "";

  if (salon.zalo_url) {
    els.appointmentQuickActions.insertAdjacentHTML(
      "beforeend",
      `<a class="btn btn-soft" href="${escapeHtml(salon.zalo_url)}" target="_blank" rel="noreferrer">Gửi qua Zalo salon</a>`
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
    if (setHref(node, callLink)) {
      node.hidden = false;
    } else {
      node.hidden = true;
    }
  });

  [els.ctaZalo, els.navZalo, els.stickyZalo].forEach((node) => {
    if (!node) {
      return;
    }
    if (setHref(node, zaloLink)) {
      node.hidden = false;
    } else {
      node.hidden = true;
    }
  });
}

function renderSalon(salon, slug) {
  applyTheme(salon.theme_color);
  updateSeo(salon);

  setText(els.salonName, salon.salon_name, "Salon đang cập nhật");
  setText(els.navSalonName, salon.salon_name, "Salon đang cập nhật");
  setText(
    els.heroSubheadline,
    "Đặt lịch để được phân tích gương mặt, tư vấn màu tóc và chọn kiểu uốn/duỗi/nhuộm phù hợp phong cách cá nhân."
  );
  setText(els.salonAddressChip, salon.address);
  setText(els.salonHoursChip, salon.working_hours);
  setText(els.salonPhone, salon.phone);
  setText(els.salonPhoneDetail, salon.phone);
  setText(els.salonAddress, salon.address);
  setText(els.salonHours, salon.working_hours);

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

  els.infoZaloRow.hidden = !setHref(els.salonZaloLink, salon.zalo_url || "");
  els.infoFacebookRow.hidden = !setHref(els.salonFacebookLink, salon.facebook_url || "");

  const bannerUrl = salon.banner_url || DEFAULT_BANNER;
  bindImageWithFallback(els.heroBanner, bannerUrl, DEFAULT_BANNER);
  bindImageWithFallback(els.galleryMainImage, bannerUrl, DEFAULT_BANNER);
  bindImageWithFallback(els.galleryProductImage, DEFAULT_PRODUCT_IMAGE, DEFAULT_PRODUCT_IMAGE);
  bindImageWithFallback(els.productLineupImage, DEFAULT_PRODUCT_IMAGE, DEFAULT_PRODUCT_IMAGE);

  setupLogo(salon.logo_url || "");
  updateContactActions(salon);
  renderQuickActions(salon);
  showState("ready");
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

function handleLocalShim(slug) {
  const hasFullDom = Boolean(els.loadingState && els.salonPage && els.appointmentForm);
  if (hasFullDom) {
    return false;
  }
  const target = `/salon.html?slug=${encodeURIComponent(slug)}`;
  const same = window.location.pathname === "/salon.html" && window.location.search === `?slug=${encodeURIComponent(slug)}`;
  if (!same) {
    window.location.replace(target);
  }
  return true;
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

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`);
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

    renderSalon(data.salon, slug);
    bindDemoForm(data.salon);
  } catch {
    showError(
      "Không thể tải thông tin salon",
      "Không thể tải thông tin salon. Vui lòng thử lại sau."
    );
  }
}

showState("loading");
loadSalon();