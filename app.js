/* ===========================================================
   1-Vision landing — interactions + Tweaks
   =========================================================== */
(function () {
  'use strict';
  var T = window.TWEAKS || { palette: 'graphite', showPrices: true };

  /* ---------- palette (КАЛІБР — single committed theme; mirrors CSS :root) ---------- */
  var PALETTES = {
    graphite: { label: 'Інструмент', accent: '#41576C', accentDeep: '#2B3A49', accentSoft: '#8295A8',
      ink: '#161A20', slate: '#586470', slate2: '#8893A0', sky: '#E7EAEE', sky2: '#D6DCE3', sky3: '#F3F5F8',
      line: '#D3D9E0', line2: '#E4E8ED', navy: '#13181E', navy2: '#0B0F14', navyCard: '#1A222B',
      cobalt: '#2A333D', cobalt2: '#3A4550' }
  };
  var PAL_ORDER = ['graphite'];
  function applyPalette(name) {
    var p = PALETTES[name] || PALETTES.graphite;
    var s = document.documentElement.style;
    s.setProperty('--accent', p.accent); s.setProperty('--accent-deep', p.accentDeep); s.setProperty('--accent-soft', p.accentSoft);
    s.setProperty('--ink', p.ink); s.setProperty('--slate', p.slate); s.setProperty('--slate-2', p.slate2);
    s.setProperty('--sky', p.sky); s.setProperty('--sky-2', p.sky2); s.setProperty('--sky-3', p.sky3);
    s.setProperty('--line', p.line); s.setProperty('--line-2', p.line2);
    s.setProperty('--navy', p.navy); s.setProperty('--navy-2', p.navy2); s.setProperty('--navy-card', p.navyCard);
    s.setProperty('--cobalt', p.cobalt); s.setProperty('--cobalt-2', p.cobalt2);
    T.palette = name;
  }

  function applyPrices(on) {
    document.body.classList.toggle('prices-off', !on);
    document.querySelectorAll('[data-price-amt]').forEach(function (el) {
      var hasContent = el.textContent.trim().length > 0;
      el.style.display = (on && hasContent) ? '' : 'none';
    });
    document.querySelectorAll('.model .price [data-price]').forEach(function (el) {
      if (!on) { if (!el.dataset.orig) el.dataset.orig = el.textContent; el.textContent = 'Ціна за запитом'; }
      else if (el.dataset.orig) { el.textContent = el.dataset.orig; }
    });
  }

  applyPalette(T.palette || 'graphite');
  applyPrices(T.showPrices !== false);

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

  var burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  document.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  });

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
      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
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

  /* ===========================================================
     Tweaks panel (vanilla) — host protocol
     =========================================================== */
  function setTweak(key, val) {
    T[key] = val;
    var edits = {}; edits[key] = val;
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: edits }, '*'); } catch (e) {}
    if (key === 'palette') applyPalette(val);
    else if (key === 'showPrices') applyPrices(val);
  }

  var STYLE = '\
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:264px;\
    background:rgba(250,246,238,.82);color:#241D14;-webkit-backdrop-filter:blur(22px) saturate(150%);\
    backdrop-filter:blur(22px) saturate(150%);border:.5px solid rgba(255,255,255,.7);border-radius:14px;\
    box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 14px 44px rgba(40,30,16,.22);\
    font:12px/1.4 "IBM Plex Sans",system-ui,sans-serif;overflow:hidden}\
  .twk-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 10px 12px 15px;cursor:move;user-select:none}\
  .twk-hd b{font:600 12.5px "Sora",sans-serif;letter-spacing:.01em}\
  .twk-hd .x{appearance:none;border:0;background:transparent;color:rgba(36,29,20,.5);width:24px;height:24px;border-radius:7px;cursor:pointer;font-size:13px}\
  .twk-hd .x:hover{background:rgba(0,0,0,.06);color:#241D14}\
  .twk-body{padding:2px 15px 16px;display:flex;flex-direction:column;gap:14px}\
  .twk-sect{font:600 10px "JetBrains Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,29,20,.45)}\
  .twk-row{display:flex;flex-direction:column;gap:8px;margin-top:6px}\
  .twk-chips{display:flex;gap:7px}\
  .twk-chip{flex:1;height:38px;border:0;border-radius:9px;cursor:pointer;position:relative;\
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 3px rgba(0,0,0,.08);transition:transform .12s,box-shadow .12s}\
  .twk-chip:hover{transform:translateY(-1px)}\
  .twk-chip[data-on="1"]{box-shadow:0 0 0 2px #241D14,0 2px 6px rgba(0,0,0,.18)}\
  .twk-chip svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:15px;height:15px}\
  .twk-seg{display:flex;padding:3px;border-radius:10px;background:rgba(36,29,20,.07);gap:2px}\
  .twk-seg button{flex:1;border:0;background:transparent;border-radius:7px;padding:7px 4px;cursor:pointer;\
    font:600 12px "Sora",sans-serif;color:rgba(36,29,20,.6)}\
  .twk-seg button[data-on="1"]{background:#fff;color:#241D14;box-shadow:0 1px 3px rgba(0,0,0,.12)}\
  .twk-tg{display:flex;align-items:center;justify-content:space-between}\
  .twk-tg .lbl{font-weight:500}\
  .twk-toggle{position:relative;width:38px;height:22px;border:0;border-radius:999px;background:rgba(36,29,20,.18);cursor:pointer;transition:background .15s}\
  .twk-toggle[data-on="1"]{background:#22B26B}\
  .twk-toggle i{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}\
  .twk-toggle[data-on="1"] i{transform:translateX(16px)}';

  function chk(light) {
    return '<svg viewBox="0 0 14 14"><path d="M3 7.2 5.8 10 11 4.2" fill="none" stroke="' +
      (light ? 'rgba(0,0,0,.8)' : '#fff') + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function isLight(hex) {
    var h = hex.replace('#', ''); var n = parseInt(h, 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return r * 299 + g * 587 + b * 114 > 148000;
  }

  function buildPanel() {
    var root = document.getElementById('twkRoot');
    if (!root) return;
    var st = document.createElement('style'); st.textContent = STYLE; root.appendChild(st);

    var panel = document.createElement('div');
    panel.className = 'twk-panel'; panel.setAttribute('data-noncommentable', '');
    panel.innerHTML =
      '<div class="twk-hd"><b>Tweaks</b><button class="x" aria-label="Закрити">✕</button></div>' +
      '<div class="twk-body">' +
        '<div><div class="twk-sect">Палітра</div><div class="twk-row"><div class="twk-chips" id="twkAccent"></div></div></div>' +
        '<div><div class="twk-sect">Ціни</div><div class="twk-row"><div class="twk-tg"><span class="lbl">Показувати «від … ₴»</span>' +
          '<button class="twk-toggle" id="twkPrice" data-on="' + (T.showPrices !== false ? '1' : '0') + '"><i></i></button></div></div></div>' +
      '</div>';
    root.appendChild(panel);

    var accentWrap = panel.querySelector('#twkAccent');
    PAL_ORDER.forEach(function (name) {
      var p = PALETTES[name];
      var b = document.createElement('button');
      b.className = 'twk-chip'; b.style.background = p.accent;
      b.setAttribute('data-on', name === (T.palette || 'graphite') ? '1' : '0');
      b.title = p.label;
      if (b.getAttribute('data-on') === '1') b.innerHTML = chk(isLight(p.accent));
      b.addEventListener('click', function () {
        setTweak('palette', name);
        accentWrap.querySelectorAll('.twk-chip').forEach(function (x) { x.setAttribute('data-on', '0'); x.innerHTML = ''; });
        b.setAttribute('data-on', '1'); b.innerHTML = chk(isLight(p.accent));
      });
      accentWrap.appendChild(b);
    });

    var priceBtn = panel.querySelector('#twkPrice');
    priceBtn.addEventListener('click', function () {
      var on = priceBtn.getAttribute('data-on') !== '1';
      priceBtn.setAttribute('data-on', on ? '1' : '0');
      setTweak('showPrices', on);
    });

    // drag
    var hd = panel.querySelector('.twk-hd');
    hd.addEventListener('mousedown', function (e) {
      if (e.target.closest('.x')) return;
      var r = panel.getBoundingClientRect();
      var sx = e.clientX, sy = e.clientY;
      var sr = window.innerWidth - r.right, sb = window.innerHeight - r.bottom;
      function mv(ev) {
        panel.style.right = Math.max(8, sr - (ev.clientX - sx)) + 'px';
        panel.style.bottom = Math.max(8, sb - (ev.clientY - sy)) + 'px';
      }
      function up() { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); }
      window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    });

    panel.querySelector('.x').addEventListener('click', function () {
      panel.style.display = 'none';
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });

    return panel;
  }

  var twkPanel = null;
  function showPanel(show) {
    if (!twkPanel) twkPanel = buildPanel();
    if (twkPanel) twkPanel.style.display = show ? '' : 'none';
  }
  showPanel(false);

  window.addEventListener('message', function (e) {
    var t = e && e.data && e.data.type;
    if (t === '__activate_edit_mode') showPanel(true);
    else if (t === '__deactivate_edit_mode') showPanel(false);
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
})();
