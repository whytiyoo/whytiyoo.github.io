/* =========================================================================
   V1 · 学术经典版交互脚本
   功能：深浅色主题、移动端导航、滚动高亮当前栏目、
        论文分类筛选、BibTeX 显示与复制。
   依赖：无。全部原生 JavaScript，可直接在 file:// 下运行。
   ========================================================================= */
(function () {
  'use strict';

  /* ----------------------------- 深浅色主题 ----------------------------- */
  var THEME_KEY = 'v1-scholar-theme';
  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function preferredTheme() {
    try {
      var saved = window.localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (err) { /* 隐私模式下 localStorage 不可用，忽略 */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#14171b' : '#ffffff');
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
      themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
    if (persist) {
      try { window.localStorage.setItem(THEME_KEY, theme); } catch (err) { /* 忽略 */ }
    }
  }

  applyTheme(preferredTheme(), false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  }

  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSchemeChange = function (event) {
      var saved = null;
      try { saved = window.localStorage.getItem(THEME_KEY); } catch (err) { /* 忽略 */ }
      if (!saved) applyTheme(event.matches ? 'dark' : 'light', false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  }

  /* ----------------------------- 移动端导航 ----------------------------- */
  var navToggle = document.querySelector('.nav__toggle');
  var navMenu = document.getElementById('nav-menu');
  var isNarrow = function () { return window.matchMedia('(max-width: 720px)').matches; };

  function setMenuOpen(open) {
    if (!navToggle || !navMenu) return;
    navMenu.hidden = !open;
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (navToggle && navMenu) {
    // 桌面端默认展开；窄屏默认收起
    setMenuOpen(!isNarrow());

    navToggle.addEventListener('click', function () {
      setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navMenu.addEventListener('click', function (event) {
      if (event.target.closest('a') && isNarrow()) setMenuOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isNarrow()) setMenuOpen(false);
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { setMenuOpen(!isNarrow()); }, 150);
    });
  }

  /* --------------------------- 滚动高亮当前栏目 --------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a[href^="#"]'));
  var sectionMap = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (target) sectionMap[id] = link;
  });

  if ('IntersectionObserver' in window && Object.keys(sectionMap).length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) { link.classList.remove('is-current'); });
        var active = sectionMap[entry.target.id];
        if (active) active.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(sectionMap).forEach(function (id) {
      spy.observe(document.getElementById(id));
    });
  }

  /* ----------------------------- 论文分类筛选 ----------------------------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter .chip'));
  var pubs = Array.prototype.slice.call(document.querySelectorAll('#pub-list .pub'));
  var pubEmpty = document.getElementById('pub-empty');

  function applyFilter(filter) {
    var visible = 0;
    pubs.forEach(function (pub) {
      var show = filter === 'all' || pub.getAttribute('data-type') === filter;
      pub.hidden = !show;
      if (show) visible += 1;
    });
    if (pubEmpty) pubEmpty.hidden = visible !== 0;
    chips.forEach(function (chip) {
      var active = chip.getAttribute('data-filter') === filter;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  chips.forEach(function (chip) {
    chip.setAttribute('aria-pressed', chip.classList.contains('is-active') ? 'true' : 'false');
    chip.addEventListener('click', function () {
      applyFilter(chip.getAttribute('data-filter') || 'all');
    });
  });

  /* ---------------------------- BibTeX 显示 / 复制 ---------------------------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    // file:// 或非安全上下文下的降级方案
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(area);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function flash(button, text, revertText, className) {
    if (button.dataset.timerId) window.clearTimeout(Number(button.dataset.timerId));
    button.textContent = text;
    button.classList.add(className);
    button.dataset.timerId = String(window.setTimeout(function () {
      button.textContent = revertText;
      button.classList.remove(className);
      delete button.dataset.timerId;
    }, 1800));
  }

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest('[data-bibtex-toggle]');
    if (toggle) {
      var holder = toggle.closest('.pub');
      var pre = holder && holder.querySelector('.pub__bibtex');
      if (pre) {
        pre.hidden = !pre.hidden;
        toggle.setAttribute('aria-expanded', pre.hidden ? 'false' : 'true');
        toggle.textContent = pre.hidden ? 'BibTeX' : '隐藏 BibTeX';
      }
      return;
    }

    var copyBtn = event.target.closest('[data-bibtex-copy]');
    if (copyBtn) {
      var pub = copyBtn.closest('.pub');
      var source = pub && pub.querySelector('.pub__bibtex');
      if (!source) return;
      var label = copyBtn.textContent;
      copyText(source.textContent.trim()).then(function () {
        flash(copyBtn, '已复制 ✓', label, 'is-copied');
      }).catch(function () {
        flash(copyBtn, '请手动复制', label, 'is-copied');
        source.hidden = false;
      });
    }
  });
})();
