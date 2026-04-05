/* The Hair Lab – Main JavaScript */

(function () {
  'use strict';

  // ── Navbar: add .scrolled class on scroll ──────────────────────────────────
  const header = document.getElementById('header');

  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    toggleBackToTop();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // ── Mobile nav toggle ──────────────────────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = '&#9776;';
    });
  });

  // ── Back-to-top button ─────────────────────────────────────────────────────
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Booking form submission ────────────────────────────────────────────────
  const bookingForm  = document.getElementById('bookingForm');
  const formSuccess  = document.getElementById('formSuccess');

  // Set minimum date to today
  var dateInput = document.getElementById('date');
  if (dateInput) {
    var today = new Date();
    var yyyy  = today.getFullYear();
    var mm    = String(today.getMonth() + 1).padStart(2, '0');
    var dd    = String(today.getDate()).padStart(2, '0');
    dateInput.min = yyyy + '-' + mm + '-' + dd;
  }

  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic validation
    var name  = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var date  = document.getElementById('date').value;
    var time  = document.getElementById('time').value;

    if (!name || !phone || !date || !time) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (*).');
      return;
    }

    // Simulate form submission (replace with real endpoint if needed)
    var submitBtn = bookingForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang Gửi…';

    setTimeout(function () {
      bookingForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Xác Nhận Đặt Lịch';
      formSuccess.hidden = false;

      setTimeout(function () {
        formSuccess.hidden = true;
      }, 6000);
    }, 1000);
  });

  // ── Newsletter form ────────────────────────────────────────────────────────
  var newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = newsletterForm.querySelector('button');
      btn.textContent = '✓ Đã Đăng Ký!';
      btn.disabled = true;
      newsletterForm.querySelector('input').value = '';
      setTimeout(function () {
        btn.textContent = 'Đăng Ký';
        btn.disabled = false;
      }, 4000);
    });
  }

  // ── Intersection Observer – fade-in on scroll ──────────────────────────────
  var observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add fade-in style and observe elements
  var style = document.createElement('style');
  style.textContent = [
    '.fade-in { opacity: 0; transform: translateY(28px); transition: opacity .6s ease, transform .6s ease; }',
    '.fade-in.in-view { opacity: 1; transform: none; }',
    '.fade-in:nth-child(2) { transition-delay: .1s; }',
    '.fade-in:nth-child(3) { transition-delay: .2s; }',
    '.fade-in:nth-child(4) { transition-delay: .3s; }',
    '.fade-in:nth-child(5) { transition-delay: .4s; }',
    '.fade-in:nth-child(6) { transition-delay: .5s; }'
  ].join('\n');
  document.head.appendChild(style);

  var animTargets = document.querySelectorAll(
    '.service-card, .team-card, .testimonial, .gallery-item, .stat'
  );
  animTargets.forEach(function (el) {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ── Active nav link highlight on scroll ───────────────────────────────────
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navAnchors.forEach(function (a) {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + id) {
            a.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  // Add active link style
  var activeStyle = document.createElement('style');
  activeStyle.textContent = '.nav-links a.active { color: var(--gold) !important; }';
  document.head.appendChild(activeStyle);

  sections.forEach(function (s) { sectionObserver.observe(s); });
}());
