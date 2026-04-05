document.documentElement.classList.add("js-enabled");

const APP_CONFIG = {
  brandName: "The Hair Lab",
  contact: {
    phone: "TODO_REPLACE_REAL_PHONE",
    email: "TODO_REPLACE_REAL_EMAIL",
    zaloLink: "TODO_REPLACE_REAL_ZALO_LINK",
    whatsappLink: "TODO_REPLACE_REAL_WHATSAPP_LINK",
    address: "TODO_REPLACE_REAL_ADDRESS",
    distributionArea: "TODO_REPLACE_REAL_DISTRIBUTION_AREA",
    businessHours: ["TODO_REPLACE_REAL_BUSINESS_HOURS"],
    facebookLink: "TODO_REPLACE_REAL_FACEBOOK_LINK",
    instagramLink: "TODO_REPLACE_REAL_INSTAGRAM_LINK"
  },
  lead: {
    // Set webhookEnabled=true only when a real lead endpoint is ready.
    webhookEnabled: false,
    webhookEndpoint: "TODO_REPLACE_REAL_WEBHOOK_ENDPOINT",
    webhookMethod: "POST"
  }
};

function isTodoValue(value) {
  return typeof value === "string" && value.includes("TODO_REPLACE");
}

function hasUsableValue(value) {
  return typeof value === "string" && value.trim() !== "" && !isTodoValue(value);
}

function formatDisplayValue(value, fallbackTodoLabel) {
  if (Array.isArray(value)) {
    const sanitized = value.filter((item) => item && item.trim() !== "");
    return sanitized.length ? sanitized.join(" | ") : fallbackTodoLabel;
  }

  if (!hasUsableValue(value)) {
    return fallbackTodoLabel;
  }

  return value;
}

function updateTextBindings() {
  const textNodes = document.querySelectorAll("[data-contact]");

  textNodes.forEach((node) => {
    const field = node.getAttribute("data-contact");
    let value;

    if (field === "businessHoursInline") {
      value = formatDisplayValue(APP_CONFIG.contact.businessHours, "TODO_REPLACE_REAL_BUSINESS_HOURS");
    } else {
      value = formatDisplayValue(APP_CONFIG.contact[field], `TODO_REPLACE_REAL_${field.toUpperCase()}`);
    }

    node.textContent = value;
  });
}

function buildHrefFromField(field) {
  const value = APP_CONFIG.contact[field];

  if (!hasUsableValue(value)) {
    return null;
  }

  if (field === "phone") {
    const phoneDigits = value.replace(/[^\d+]/g, "");
    return phoneDigits ? `tel:${phoneDigits}` : null;
  }

  if (field === "email") {
    return `mailto:${value}`;
  }

  return value;
}

function updateLinkBindings() {
  const linkNodes = document.querySelectorAll("[data-contact-link]");

  linkNodes.forEach((link) => {
    const field = link.getAttribute("data-contact-link");
    const href = buildHrefFromField(field);

    if (href) {
      link.setAttribute("href", href);
      link.removeAttribute("aria-disabled");
      return;
    }

    link.setAttribute("href", "#contact");
    link.setAttribute("aria-disabled", "true");
  });
}

function buildLeadMessage(formData) {
  return [
    `YÊU CẦU LEAD KINH DOANH - ${APP_CONFIG.brandName}`,
    `- Mục tiêu liên hệ: ${formData.leadType}`,
    `- Từ CTA hero: ${formData.heroIntent || "Không có"}`,
    `- Họ tên người liên hệ: ${formData.contactName}`,
    `- Tên đơn vị: ${formData.businessName}`,
    `- Số điện thoại: ${formData.phone}`,
    `- Khu vực: ${formData.area}`,
    `- Mô hình kinh doanh: ${formData.businessModel}`,
    `- Nhu cầu quan tâm: ${formData.interest}`,
    `- Ghi chú: ${formData.note || "Không có ghi chú thêm"}`
  ].join("\n");
}

function appendQuery(baseUrl, key, value) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${key}=${encodeURIComponent(value)}`;
}

function buildChatLink(message) {
  const { zaloLink, whatsappLink } = APP_CONFIG.contact;

  if (hasUsableValue(zaloLink)) {
    return appendQuery(zaloLink, "text", message);
  }

  if (hasUsableValue(whatsappLink)) {
    return appendQuery(whatsappLink, "text", message);
  }

  return null;
}

function buildMailtoLink(message) {
  const { email } = APP_CONFIG.contact;

  if (!hasUsableValue(email)) {
    return null;
  }

  const subject = `Lead kinh doanh từ website ${APP_CONFIG.brandName}`;
  const base = `mailto:${email}`;
  return `${base}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

async function postToWebhook(payload) {
  const { webhookEnabled, webhookEndpoint, webhookMethod } = APP_CONFIG.lead;

  if (!webhookEnabled || !hasUsableValue(webhookEndpoint)) {
    return false;
  }

  const response = await fetch(webhookEndpoint, {
    method: webhookMethod,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response.ok;
}

function validateLeadForm(formData) {
  if (!formData.contactName || formData.contactName.length < 2) {
    return "Vui lòng nhập họ tên người liên hệ hợp lệ.";
  }

  if (!formData.businessName || formData.businessName.length < 2) {
    return "Vui lòng nhập tên đơn vị hợp lệ.";
  }

  if (!/^[0-9+()\s.-]{8,20}$/.test(formData.phone)) {
    return "Vui lòng nhập số điện thoại hợp lệ để đội kinh doanh liên hệ.";
  }

  if (!formData.area) {
    return "Vui lòng nhập khu vực hoạt động.";
  }

  if (!formData.businessModel) {
    return "Vui lòng chọn mô hình kinh doanh.";
  }

  if (!formData.interest) {
    return "Vui lòng chọn nhu cầu quan tâm.";
  }

  return null;
}

function showLeadStatus(message, isError = false) {
  const statusNode = document.getElementById("lead-status");
  if (!statusNode) return;

  statusNode.textContent = message;
  statusNode.style.color = isError ? "#9b223e" : "#35643f";
}

async function handleLeadSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const clickedAction = event.submitter?.value || "Nhận tư vấn";
  const formData = {
    leadType: clickedAction,
    heroIntent: String(data.get("heroIntent") || "").trim(),
    contactName: String(data.get("contactName") || "").trim(),
    businessName: String(data.get("businessName") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    area: String(data.get("area") || "").trim(),
    businessModel: String(data.get("businessModel") || "").trim(),
    interest: String(data.get("interest") || "").trim(),
    note: String(data.get("note") || "").trim()
  };

  const validationError = validateLeadForm(formData);
  if (validationError) {
    showLeadStatus(validationError, true);
    return;
  }

  const message = buildLeadMessage(formData);
  const payload = {
    source: "landing-page",
    leadKind: "business-distribution",
    brand: APP_CONFIG.brandName,
    ...formData,
    submittedAt: new Date().toISOString()
  };

  const chatLink = buildChatLink(message);
  if (chatLink) {
    window.open(chatLink, "_blank", "noopener");
    showLeadStatus("Yêu cầu đã được chuyển sang kênh tư vấn. Vui lòng gửi tin nhắn để đội kinh doanh xác nhận.");
    return;
  }

  const mailtoLink = buildMailtoLink(message);
  if (mailtoLink) {
    window.location.href = mailtoLink;
    showLeadStatus("Yêu cầu đã được chuyển sang email báo giá. Vui lòng gửi thư để đội kinh doanh xử lý.");
    return;
  }

  try {
    const webhookSent = await postToWebhook(payload);

    if (webhookSent) {
      showLeadStatus("Yêu cầu đã được chuyển sang hệ thống lead. Đội kinh doanh sẽ liên hệ bạn sớm.");
      return;
    }
  } catch (error) {
    console.error("Lead webhook error:", error);
  }

  showLeadStatus(
    "Chưa có kênh liên hệ thật trong cấu hình. Vui lòng cập nhật APP_CONFIG.contact (Zalo/WhatsApp/email) để nhận lead.",
    true
  );
}

function setupLeadForm() {
  const form = document.getElementById("lead-form");
  if (!form) return;

  form.addEventListener("submit", handleLeadSubmit);
}

function setupProductInterestButtons() {
  const serviceButtons = document.querySelectorAll(".service-cta");
  const interestSelect = document.getElementById("interest-select");

  serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedInterest = button.getAttribute("data-interest");

      if (interestSelect && selectedInterest) {
        interestSelect.value = selectedInterest;
      }

      const leadSection = document.getElementById("lead");
      leadSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function setupQuickConsultLink() {
  const link = document.getElementById("quick-consult-link");
  if (!link) return;

  const message = `Tôi muốn được tư vấn nhanh về danh mục phân phối tại ${APP_CONFIG.brandName}.`;
  const chatLink = buildChatLink(message);
  const mailtoLink = buildMailtoLink(message);

  if (chatLink) {
    link.setAttribute("href", chatLink);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener");
    return;
  }

  if (mailtoLink) {
    link.setAttribute("href", mailtoLink);
    return;
  }

  link.setAttribute("href", "#contact");
}

function setupHeroIntentLinks() {
  const links = document.querySelectorAll(".lead-intent-link");
  const intentInput = document.getElementById("hero-intent");
  const interestSelect = document.getElementById("interest-select");

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const intent = link.getAttribute("data-lead-intent") || "";

      if (intentInput) {
        intentInput.value = intent;
      }

      if (interestSelect && ["Nhận catalog", "Yêu cầu báo giá", "Đăng ký làm đại lý"].includes(intent)) {
        interestSelect.value = intent;
      }
    });
  });
}

function setupMobileNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");

  if (!navToggle || !nav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupRevealAnimations() {
  const revealNodes = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function setupFooterYear() {
  const year = document.getElementById("current-year");
  if (!year) return;

  year.textContent = String(new Date().getFullYear());
}

function initLandingPage() {
  updateTextBindings();
  updateLinkBindings();
  setupQuickConsultLink();
  setupHeroIntentLinks();
  setupMobileNav();
  setupProductInterestButtons();
  setupLeadForm();
  setupRevealAnimations();
  setupFooterYear();
}

document.addEventListener("DOMContentLoaded", initLandingPage);
