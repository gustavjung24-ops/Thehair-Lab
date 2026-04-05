document.documentElement.classList.add("js-enabled");

const APP_CONFIG = {
  brandName: "The Hair Lab",
  contact: {
    phone: "TODO_REPLACE_REAL_PHONE",
    email: "TODO_REPLACE_REAL_EMAIL",
    address: "TODO_REPLACE_REAL_ADDRESS",
    openingHours: ["TODO_REPLACE_REAL_OPENING_HOURS"],
    zaloLink: "TODO_REPLACE_REAL_ZALO_LINK",
    whatsappLink: "TODO_REPLACE_REAL_WHATSAPP_LINK",
    facebookLink: "TODO_REPLACE_REAL_FACEBOOK_LINK",
    instagramLink: "TODO_REPLACE_REAL_INSTAGRAM_LINK"
  },
  booking: {
    // Set webhookEnabled=true only when you have a real endpoint.
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

    if (field === "openingHoursInline") {
      value = formatDisplayValue(APP_CONFIG.contact.openingHours, "TODO_REPLACE_REAL_OPENING_HOURS");
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
    `YÊU CẦU ĐẶT LỊCH - ${APP_CONFIG.brandName}`,
    `- Họ tên: ${formData.name}`,
    `- Số điện thoại: ${formData.phone}`,
    `- Dịch vụ quan tâm: ${formData.service}`,
    `- Thời gian mong muốn: ${formData.preferredTime}`,
    `- Mô tả tình trạng tóc: ${formData.note || "Không có ghi chú thêm"}`
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

  const subject = `Dat lich tai ${APP_CONFIG.brandName}`;
  const base = `mailto:${email}`;
  return `${base}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

async function postToWebhook(payload) {
  const { webhookEnabled, webhookEndpoint, webhookMethod } = APP_CONFIG.booking;

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

function validateBookingForm(formData) {
  if (!formData.name || formData.name.length < 2) {
    return "Vui lòng nhập họ tên hợp lệ.";
  }

  if (!/^[0-9+()\s.-]{8,20}$/.test(formData.phone)) {
    return "Vui lòng nhập số điện thoại hợp lệ để salon liên hệ.";
  }

  if (!formData.service) {
    return "Vui lòng chọn dịch vụ bạn quan tâm.";
  }

  if (!formData.preferredTime) {
    return "Vui lòng cho biết khung giờ bạn muốn đặt lịch.";
  }

  return null;
}

function showBookingStatus(message, isError = false) {
  const statusNode = document.getElementById("booking-status");
  if (!statusNode) return;

  statusNode.textContent = message;
  statusNode.style.color = isError ? "#9b223e" : "#35643f";
}

async function handleBookingSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const formData = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    service: String(data.get("service") || "").trim(),
    preferredTime: String(data.get("preferredTime") || "").trim(),
    note: String(data.get("note") || "").trim()
  };

  const validationError = validateBookingForm(formData);
  if (validationError) {
    showBookingStatus(validationError, true);
    return;
  }

  const message = buildLeadMessage(formData);
  const payload = {
    source: "landing-page",
    brand: APP_CONFIG.brandName,
    ...formData,
    submittedAt: new Date().toISOString()
  };

  const chatLink = buildChatLink(message);
  if (chatLink) {
    window.open(chatLink, "_blank", "noopener");
    showBookingStatus("Yêu cầu đã được chuyển sang kênh xác nhận. Vui lòng gửi tin nhắn để salon chốt lịch.");
    return;
  }

  const mailtoLink = buildMailtoLink(message);
  if (mailtoLink) {
    window.location.href = mailtoLink;
    showBookingStatus("Yêu cầu đã được chuyển sang email xác nhận. Vui lòng gửi thư để salon chốt lịch.");
    return;
  }

  try {
    const webhookSent = await postToWebhook(payload);

    if (webhookSent) {
      showBookingStatus("Yêu cầu đã được chuyển sang hệ thống xác nhận. Salon sẽ liên hệ bạn sớm.");
      return;
    }
  } catch (error) {
    console.error("Booking webhook error:", error);
  }

  showBookingStatus(
    "Chưa có kênh liên hệ thật trong cấu hình. Vui lòng cập nhật APP_CONFIG.contact (Zalo/WhatsApp/email) để nhận lead.",
    true
  );
}

function setupBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;

  form.addEventListener("submit", handleBookingSubmit);
}

function setupServiceButtons() {
  const serviceButtons = document.querySelectorAll(".service-cta");
  const serviceSelect = document.getElementById("service-select");

  serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedService = button.getAttribute("data-service");

      if (serviceSelect && selectedService) {
        serviceSelect.value = selectedService;
      }

      const bookingSection = document.getElementById("booking");
      bookingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function setupQuickConsultLink() {
  const link = document.getElementById("quick-consult-link");
  if (!link) return;

  const message = `Tôi muốn được tư vấn nhanh về dịch vụ tại ${APP_CONFIG.brandName}.`;
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
  setupMobileNav();
  setupServiceButtons();
  setupBookingForm();
  setupRevealAnimations();
  setupFooterYear();
}

document.addEventListener("DOMContentLoaded", initLandingPage);
