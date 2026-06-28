/* ===========================================================
   1-Vision landing — interactions
   =========================================================== */
(function () {
  'use strict';

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  function setScrolled(v) { if (nav) nav.classList.toggle('scrolled', v); }
  function onScroll() { setScrolled((window.scrollY || 0) > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // cross-origin-safe scroll detection via a top sentinel
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none;';
    document.body.appendChild(sentinel);
    new IntersectionObserver(function (es) {
      setScrolled(!es[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  })();
  // liquid-glass cursor highlight
  if (nav && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var navInner = nav.querySelector('.nav-inner');
    nav.addEventListener('pointermove', function (e) {
      var r = (navInner || nav).getBoundingClientRect();
      (navInner || nav).style.setProperty('--nx', (e.clientX - r.left) + 'px');
      (navInner || nav).style.setProperty('--ny', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- sticky mobile CTA + drawer (scroll-locked) ---------- */
  var mcta = document.querySelector('.m-cta');
  var mctaState = { pastHero: false, atContact: false };
  function updateMCTA() {
    if (!mcta) return;
    mcta.classList.toggle('show',
      mctaState.pastHero && !mctaState.atContact && !document.body.classList.contains('nav-open'));
  }
  if (mcta) {
    var onMctaScroll = function () {
      mctaState.pastHero = (window.scrollY || 0) > (window.innerHeight * 0.66);
      updateMCTA();
    };
    window.addEventListener('scroll', onMctaScroll, { passive: true }); onMctaScroll();
    if ('IntersectionObserver' in window) {
      var contactSec = document.getElementById('contact');
      if (contactSec) new IntersectionObserver(function (es) {
        mctaState.atContact = es[0].isIntersecting; updateMCTA();
      }, { threshold: 0 }).observe(contactSec);
    }
  }

  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  function setNavOpen(open) {
    var wasOpen = document.body.classList.contains('nav-open');
    document.body.classList.toggle('nav-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';   // lock background scroll
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (drawer) drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    // move focus into the drawer on open; return it to the burger only if it was
    // genuinely open (guards against the resize>900 handler stealing focus on desktop)
    if (open) { var first = drawer && drawer.querySelector('.sheet a'); if (first) first.focus(); }
    else if (wasOpen && burger) { burger.focus(); }
    updateMCTA();
  }
  if (burger) burger.addEventListener('click', function () {
    setNavOpen(!document.body.classList.contains('nav-open'));
  });
  document.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', function () { setNavOpen(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNavOpen(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setNavOpen(false); }, { passive: true });

  /* ---------- counters ---------- */
  function fmt(val, dec) {
    var parts = Number(val).toFixed(dec).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    return dec > 0 ? parts.join(',') : parts[0];
  }
  function runCounter(el) {
    if (el.dataset.done === '1') return;
    el.dataset.done = '1';
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var dur = 1500, start = performance.now();
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e, dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target, dec);
    }
    requestAnimationFrame(step);
  }
  function animateScope(scope) {
    if (!scope) return;
    scope.querySelectorAll('[data-count]').forEach(function (el) { el.dataset.done = '0'; runCounter(el); });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        if (en.target.hasAttribute('data-count')) runCounter(en.target);
        en.target.classList.add('in');
        if (en.target.classList.contains('reveal')) io.unobserve(en.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  document.querySelectorAll('.stats [data-count]').forEach(function (el) { io.observe(el); });
  // stamp-in: QC plate triggers plateStamp when scrolled into view
  var plate = document.querySelector('.sp-plate');
  if (plate) io.observe(plate);
  // hero counters on first load
  setTimeout(function () { animateScope(document.querySelector('.hv-a')); }, 350);

  /* ---------- use-case tabs ---------- */
  var tabs = document.querySelectorAll('.case-tab');
  var panels = document.querySelectorAll('.case-panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var i = +tab.getAttribute('data-case');
      tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      if (panels[i]) panels[i].classList.add('active');
    });
  });

  /* ---------- form ---------- */
  var form = document.getElementById('leadForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var errBox = document.getElementById('formErr');
    var okEl = document.getElementById('formOk');
    if (errBox) errBox.style.display = 'none';
    var origLabel = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо…'; }
    function fail() {
      if (btn) { btn.disabled = false; btn.textContent = origLabel; }
      if (errBox) errBox.style.display = '';
    }
    fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
    }).then(function (r) {
      return r.json().then(function (j) { return r.ok && j && j.success; });
    }).then(function (success) {
      if (success) { form.style.display = 'none'; if (okEl) okEl.classList.add('show'); }
      else fail();
    }).catch(fail);
  });

  /* ---------- cursor-reactive grids (hero + any .grid-zone) ---------- */
  (function () {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var zones = document.querySelectorAll('.hero, .grid-zone');
    zones.forEach(function (zone) {
      // independent spotlight overlay — created for EVERY zone (sections that have no
      // permanent grid still reveal one on hover; hero/made keep their base grid as-is)
      var spot = zone.querySelector(':scope > .grid-spot');
      if (!spot) {
        spot = document.createElement('div');
        spot.className = 'grid-spot';
        var gl = zone.querySelector('.gridlines');
        if (gl && gl.parentNode === zone) zone.insertBefore(spot, gl.nextSibling);
        else zone.appendChild(spot);
      }
      var rect = null, tick = false, mx = 0, my = 0;
      function measure() { rect = zone.getBoundingClientRect(); }
      measure();
      window.addEventListener('resize', measure, { passive: true });
      window.addEventListener('scroll', measure, { passive: true, capture: true });
      zone.addEventListener('pointermove', function (e) {
        if (!rect) measure();
        mx = e.clientX - rect.left; my = e.clientY - rect.top;
        if (tick) return; tick = true;
        requestAnimationFrame(function () {
          tick = false;
          zone.style.setProperty('--mx', mx.toFixed(1) + 'px');
          zone.style.setProperty('--my', my.toFixed(1) + 'px');
          zone.style.setProperty('--spot', '1');
          zone.style.setProperty('--gx', ((mx / rect.width - 0.5) * -12).toFixed(1) + 'px');
          zone.style.setProperty('--gy', ((my / rect.height - 0.5) * -12).toFixed(1) + 'px');
        });
      }, { passive: true });
      zone.addEventListener('pointerleave', function () {
        zone.style.setProperty('--spot', '0');
        zone.style.setProperty('--gx', '0px');
        zone.style.setProperty('--gy', '0px');
      });
    });
  })();

  /* grid seam alignment is now handled purely in CSS via background-attachment:fixed */

  /* ---------- click ripple on buttons / case-tabs ---------- */
  (function () {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    document.addEventListener('pointerdown', function (e) {
      var t = e.target.closest && e.target.closest('.btn, .case-tab');
      if (!t) return;
      var r = t.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2.1;
      var s = document.createElement('span');
      s.className = 'ripple';
      s.style.width = s.style.height = size + 'px';
      s.style.left = (e.clientX - r.left) + 'px';
      s.style.top = (e.clientY - r.top) + 'px';
      t.appendChild(s);
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 640);
    }, { passive: true });
  })();

  /* ---------- «Виробництво» grid parallax — drifts at ~0.85x scroll as its own depth screen ---------- */
  (function () {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var made = document.querySelector('.made');
    if (!made) return;
    var ticking = false;
    function update() {
      ticking = false;
      var r = made.getBoundingClientRect();
      var p = ((window.innerHeight / 2) - (r.top + r.height / 2)) * 0.12;
      made.style.setProperty('--paray', p.toFixed(1) + 'px');
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  })();
})();

/* ---------- model carousel dots ---------- */
(function () {
  var grid = document.querySelector('.model-grid');
  var dots = document.querySelectorAll('.mdot');
  if (!grid || !dots.length) return;
  function update() {
    var cards = grid.querySelectorAll('.model');
    if (!cards.length) return;
    var gap = parseFloat(getComputedStyle(grid).gap) || 14;
    var cardW = cards[0].offsetWidth + gap;
    var idx = Math.min(Math.round(grid.scrollLeft / cardW), dots.length - 1);
    dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
  }
  grid.addEventListener('scroll', update, { passive: true });
  update();
})();
