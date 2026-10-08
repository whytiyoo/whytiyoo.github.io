/* =========================================================================
   V1 · 学术经典版交互脚本
   功能：中英双语切换、深浅色主题、移动端导航、滚动高亮当前栏目、
        论文分类筛选、BibTeX 显示与复制。
   依赖：无。全部原生 JavaScript，可直接在 file:// 下运行。
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ======================= 文案表（与语言相关的运行时字符串） ======================= */
  var LANG_KEY = 'v1-scholar-lang';
  var THEME_KEY = 'v1-scholar-theme';

  var TEXT = {
    zh: {
      title: '吴怀宇 · 个人主页 | 上海交通大学人工智能学院',
      description: '吴怀宇，上海交通大学人工智能学院硕士研究生（2026 级），导师崔少波教授，研究方向为世界模型与因果推理。',
      locale: 'zh_CN',
      themeToDark: '切换到深色模式',
      themeToLight: '切换到浅色模式',
      copied: '已复制 ✓',
      copyFailed: '复制失败，请手动选择',
      bibtexHide: '隐藏 BibTeX'
    },
    en: {
      title: 'Huaiyu Wu · Homepage | School of Artificial Intelligence, SJTU',
      description: 'Huaiyu Wu is an M.S. student at the School of Artificial Intelligence, Shanghai Jiao Tong University, advised by Prof. Shaobo Cui. His research focuses on world models and causal reasoning.',
      locale: 'en_US',
      themeToDark: 'Switch to dark mode',
      themeToLight: 'Switch to light mode',
      copied: 'Copied ✓',
      copyFailed: 'Copy failed — select manually',
      bibtexHide: 'Hide BibTeX'
    }
  };

  function currentLang() {
    return root.getAttribute('data-lang') === 'en' ? 'en' : 'zh';
  }
  function t(key) {
    return TEXT[currentLang()][key];
  }

  /* ================================ 语言切换 ================================ */
  var langButtons = Array.prototype.slice.call(document.querySelectorAll('[data-set-lang]'));
  var heroAvatar = document.querySelector('.hero__avatar');

  function applyLang(lang, persist) {
    var next = lang === 'en' ? 'en' : 'zh';
    root.setAttribute('data-lang', next);
    root.setAttribute('lang', next === 'zh' ? 'zh-CN' : 'en');

    document.title = TEXT[next].title;

    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', TEXT[next].description);

    var locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.setAttribute('content', TEXT[next].locale);

    if (heroAvatar) {
      var alt = heroAvatar.getAttribute(next === 'zh' ? 'data-alt-zh' : 'data-alt-en');
      if (alt) heroAvatar.setAttribute('alt', alt);
    }

    langButtons.forEach(function (button) {
      var active = button.getAttribute('data-set-lang') === next;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    updateThemeLabel();

    if (persist) {
      try { window.localStorage.setItem(LANG_KEY, next); } catch (err) { /* 忽略 */ }
    }
  }

  langButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyLang(button.getAttribute('data-set-lang'), true);
    });
  });

  /* ================================ 深浅色主题 ================================ */
  var themeToggle = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function preferredTheme() {
    try {
      var saved = window.localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (err) { /* 隐私模式下 localStorage 不可用，忽略 */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function updateThemeLabel() {
    if (!themeToggle) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-label', dark ? t('themeToLight') : t('themeToDark'));
    themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#14171b' : '#ffffff');
    updateThemeLabel();
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

  /* ================================ 移动端导航 ================================ */
  var navToggle = document.querySelector('.nav__toggle');
  var navMenu = document.getElementById('nav-menu');
  var isNarrow = function () { return window.matchMedia('(max-width: 720px)').matches; };

  function setMenuOpen(open) {
    if (!navToggle || !navMenu) return;
    navMenu.hidden = !open;
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (navToggle && navMenu) {
    setMenuOpen(!isNarrow());   // 桌面默认展开，窄屏默认收起

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

  /* ============================= 滚动高亮当前栏目 =============================
     用「读数线」判定：取最后一个顶边已越过视口 35% 高度的区块；
     滑到底部时高亮最后一段。这样页面内容较少（多个区块同时可见）时也不会乱跳。 */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a[href^="#"]'));
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (target) sections.push({ link: link, el: target });
  });

  function updateActiveSection() {
    if (!sections.length) return;
    var current = sections[0].link;
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) {
      current = sections[sections.length - 1].link;
    } else {
      var line = window.innerHeight * 0.35;
      for (var i = 0; i < sections.length; i += 1) {
        if (sections[i].el.getBoundingClientRect().top <= line) current = sections[i].link;
      }
    }
    navLinks.forEach(function (link) {
      var isCurrent = link === current;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  if (sections.length) {
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    updateActiveSection();
  }

  /* =============================== 论文分类筛选 =============================== */
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

  /* ============================ BibTeX 显示 / 复制 ============================ */
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
        toggle.textContent = pre.hidden ? 'BibTeX' : t('bibtexHide');
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
        flash(copyBtn, t('copied'), label, 'is-copied');
      }).catch(function () {
        flash(copyBtn, t('copyFailed'), label, 'is-copied');
        source.hidden = false;
      });
    }
  });

  /* ============================ 初始化 ============================ */
  applyLang(currentLang(), false);
})();
