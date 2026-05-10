/**
 * salon-hung-search.js
 * Ô tìm kiếm riêng cho Salon Hưng Saigon.
 *
 * Chỉ được import từ s/salon-hung-saigon/index.html.
 * Không sửa/import bất kỳ file shared nào (salon.js, salon.css, …).
 *
 * Chiến lược:
 *  1. Chờ salon.js render xong (#salon-page được unhide) qua MutationObserver.
 *  2. Sau đó quét DOM để xây dựng search index.
 *  3. Chỉ index element đang hiển thị (không có hidden attr, không display:none).
 *  4. Search không phân biệt hoa/thường, hỗ trợ Unicode cơ bản.
 *  5. Click kết quả → smooth scroll đến section tương ứng.
 */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────
     Tiện ích
  ────────────────────────────────────────────────────────────── */

  /**
   * Chuẩn hóa chuỗi để so sánh:
   *  - Về lowercase
   *  - Bỏ dấu (NFD decompose rồi strip combining marks)
   * Giúp "phục hồi" khớp với "phuc hoi", "Nhuộm" khớp "nhuom", v.v.
   */
  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Kiểm tra element có đang hiển thị không.
   * Loại trừ:
   *  - element có thuộc tính `hidden`
   *  - element bị ẩn bằng display:none (offsetParent === null)
   *  - element bị ẩn bằng visibility:hidden
   */
  function isVisible(el) {
    if (!el) return false;
    if (el.hidden) return false;
    // Traverse lên tree để kiểm tra hidden cha
    var cur = el;
    while (cur && cur !== document.body) {
      if (cur.hidden) return false;
      cur = cur.parentElement;
    }
    if (el.offsetParent === null) return false;
    var style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  /** Lấy text sạch của một element */
  function t(el) {
    return el ? el.textContent.trim() : '';
  }

  /** Escape HTML để tránh XSS khi render kết quả */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ──────────────────────────────────────────────────────────────
     Chờ salon.js render xong
  ────────────────────────────────────────────────────────────── */

  /**
   * Đợi #salon-page hết hidden (salon.js đã render và populate DOM xong),
   * rồi gọi callback sau một khoảng chờ nhỏ để các bước ẩn/hiện card
   * cuối cùng của salon.js có thời gian hoàn thành.
   */
  function waitForSalonReady(cb) {
    var page = document.getElementById('salon-page');
    if (!page) return; // fallback: không làm gì

    if (!page.hidden) {
      setTimeout(cb, 300);
      return;
    }

    var observer = new MutationObserver(function () {
      if (!page.hidden) {
        observer.disconnect();
        setTimeout(cb, 300);
      }
    });
    observer.observe(page, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ──────────────────────────────────────────────────────────────
     Xây dựng search index từ DOM
  ────────────────────────────────────────────────────────────── */

  /** @type {Array<{category:string, title:string, desc:string, targetId:string|null, targetEl:Element|null, searchText:string}>} */
  var searchIndex = [];

  function buildIndex() {
    searchIndex = [];

    /* 1. Dịch vụ ─────────────────────────────────────────────── */
    var serviceCards = document.querySelectorAll('#services .service-card');
    serviceCards.forEach(function (card) {
      if (!isVisible(card)) return;
      var title = t(card.querySelector('h3'));
      var desc  = t(card.querySelector('p'));
      var price = t(card.querySelector('.service-foot strong'));
      if (!title) return;
      var displayDesc = [price, desc].filter(Boolean).join(' — ');
      searchIndex.push({
        category:   'Dịch vụ',
        title:      title,
        desc:       displayDesc,
        targetId:   'services',
        targetEl:   card,
        searchText: normalize([title, desc, price].join(' ')),
      });
    });

    /* 2. Sản phẩm ────────────────────────────────────────────── */
    var productSection = document.getElementById('product-section');
    if (productSection && isVisible(productSection)) {
      var pTitle = t(productSection.querySelector('h2'));
      var pDesc  = t(productSection.querySelector('p'));
      if (pTitle) {
        searchIndex.push({
          category:   'Sản phẩm',
          title:      pTitle,
          desc:       pDesc.slice(0, 90),
          targetId:   'product-section',
          targetEl:   null,
          searchText: normalize([pTitle, pDesc, 'san pham'].join(' ')),
        });
      }
    }

    /* 3. Không gian / Gallery ────────────────────────────────── */
    var galleryCards = document.querySelectorAll('.gallery-section .gallery-card');
    galleryCards.forEach(function (card) {
      if (!isVisible(card)) return; // bỏ qua card bị admin ẩn
      var caption = t(card.querySelector('.gallery-caption'));
      if (!caption) return;
      searchIndex.push({
        category:   'Không gian',
        title:      caption,
        desc:       'Không gian tại salon',
        targetId:   null,
        targetEl:   card,
        searchText: normalize(caption + ' không gian salon gallery'),
      });
    });

    /* 4. Thông tin / Liên hệ ────────────────────────────────── */
    var contactFields = [
      { el: document.getElementById('salon-name-detail'),  label: 'Tên salon' },
      { el: document.getElementById('salon-phone-detail'), label: 'Điện thoại' },
      { el: document.getElementById('salon-address'),      label: 'Địa chỉ' },
      { el: document.getElementById('salon-hours'),        label: 'Giờ làm việc' },
    ];
    var contactLines = [];
    contactFields.forEach(function (f) {
      if (f.el && isVisible(f.el)) {
        contactLines.push(f.label + ': ' + t(f.el));
      }
    });
    if (contactLines.length > 0) {
      searchIndex.push({
        category:   'Liên hệ',
        title:      'Thông tin & Liên hệ',
        desc:       contactLines.slice(0, 2).join(' | '),
        targetId:   'salon-info',
        targetEl:   null,
        searchText: normalize(contactLines.join(' ') + ' liên hệ địa chỉ điện thoại'),
      });
    }

    /* 5. Đặt lịch – keyword phổ biến ────────────────────────── */
    searchIndex.push({
      category:   'Liên hệ',
      title:      'Đặt lịch tư vấn',
      desc:       'Điền form đặt lịch nhanh hoặc gọi thẳng salon',
      targetId:   'salon-info',
      targetEl:   null,
      searchText: normalize('đặt lịch tư vấn hẹn giờ form đặt hẹn booking'),
    });

    /* 6. Bảng giá – keyword phổ biến ───────────────────────── */
    var allPrices = [];
    serviceCards.forEach(function (card) {
      if (!isVisible(card)) return;
      var price = t(card.querySelector('.service-foot strong'));
      if (price) allPrices.push(price);
    });
    if (allPrices.length > 0) {
      searchIndex.push({
        category:   'Dịch vụ',
        title:      'Bảng giá dịch vụ',
        desc:       'Xem giá các dịch vụ tại salon ↓',
        targetId:   'services',
        targetEl:   null,
        searchText: normalize('bảng giá giá dịch vụ giá tiền chi phí price'),
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────
     UI – Search logic
  ────────────────────────────────────────────────────────────── */

  var inputEl, clearBtn, resultsPanel, listEl, emptyEl;
  var debounceTimer = null;

  function initUI() {
    inputEl      = document.getElementById('hung-search-input');
    clearBtn     = document.getElementById('hung-search-clear');
    resultsPanel = document.getElementById('hung-search-results');
    listEl       = document.getElementById('hung-search-list');
    emptyEl      = document.getElementById('hung-search-empty');

    if (!inputEl) return; // không tìm thấy markup → bỏ

    // Hiện search bar (ban đầu ẩn để tránh flash trước khi salon.js sẵn sàng)
    var bar = document.getElementById('hung-search-bar');
    if (bar) bar.hidden = false;

    inputEl.addEventListener('input', handleInput);
    inputEl.addEventListener('keydown', handleKeydown);
    clearBtn.addEventListener('click', clearSearch);

    // Click bên ngoài → đóng kết quả
    document.addEventListener('click', function (e) {
      if (
        !resultsPanel.hidden &&
        !resultsPanel.contains(e.target) &&
        e.target !== inputEl &&
        e.target !== clearBtn
      ) {
        hideResults();
      }
    });
  }

  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 180);
  }

  function runSearch() {
    var q = inputEl.value.trim();
    clearBtn.hidden = q.length === 0;
    if (q.length === 0) {
      hideResults();
      return;
    }
    var qNorm = normalize(q);
    var hits = searchIndex.filter(function (item) {
      return item.searchText.indexOf(qNorm) !== -1;
    });
    renderResults(hits);
  }

  function renderResults(hits) {
    listEl.innerHTML = '';
    emptyEl.hidden   = true;
    resultsPanel.hidden = false;

    if (hits.length === 0) {
      emptyEl.hidden = false;
      return;
    }

    hits.forEach(function (item) {
      var li = document.createElement('li');
      li.className   = 'hung-search-item';
      li.setAttribute('tabindex', '0');
      li.setAttribute('role', 'button');
      li.innerHTML =
        '<span class="hung-search-item-category">' + escHtml(item.category) + '</span>' +
        '<p class="hung-search-item-title">'    + escHtml(item.title)    + '</p>' +
        (item.desc
          ? '<p class="hung-search-item-desc">' + escHtml(item.desc) + '</p>'
          : '');

      li.addEventListener('click', function () { goToItem(item); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToItem(item);
        }
      });
      listEl.appendChild(li);
    });
  }

  function goToItem(item) {
    hideResults();
    inputEl.value   = '';
    clearBtn.hidden = true;

    var target = item.targetEl || (item.targetId ? document.getElementById(item.targetId) : null);
    if (!target) return;

    // Thêm delay nhỏ để dropdown đóng trước khi scroll
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Highlight nhẹ 1.5s
      var prevOutline = target.style.outline;
      target.style.outline = '2px solid #6e8f62';
      setTimeout(function () { target.style.outline = prevOutline; }, 1500);
    }, 60);
  }

  function clearSearch() {
    inputEl.value   = '';
    clearBtn.hidden = true;
    hideResults();
    inputEl.focus();
  }

  function hideResults() {
    resultsPanel.hidden = true;
    listEl.innerHTML    = '';
    emptyEl.hidden      = true;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      clearSearch();
    } else if (e.key === 'ArrowDown') {
      // Di chuyển focus vào item đầu tiên
      var first = listEl.querySelector('.hung-search-item');
      if (first) { e.preventDefault(); first.focus(); }
    }
  }

  /* ──────────────────────────────────────────────────────────────
     Boot
  ────────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    waitForSalonReady(function () {
      buildIndex();
      initUI();
    });
  });

})();
