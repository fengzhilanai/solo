/* 风之岚科技官网交互：滚动揭示、对号入座定位闪烁、年份 */
(function () {
  'use strict';

  document.documentElement.classList.add('js-ready');

  var FORM_URL = 'https://qcnrt01y72yf.feishu.cn/share/base/form/shrcn53nHKog9UxwnaIaE82swZe';

  // 页脚年份
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nav = document.querySelector('.nav');
  var backToTop = document.querySelector('.back-to-top');
  var scrollTicking = false;
  function updateScrollState() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
    if (backToTop) {
      var canShowBackToTop = window.scrollY > 480;
      backToTop.classList.toggle('is-visible', canShowBackToTop);
      backToTop.setAttribute('aria-hidden', String(!canShowBackToTop));
      backToTop.tabIndex = canShowBackToTop ? 0 : -1;
    }
    scrollTicking = false;
  }
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });
  updateScrollState();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      try {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      } catch (error) {
        window.scrollTo(0, 0);
      }
      var top = document.getElementById('top');
      if (top) {
        try {
          top.focus({ preventScroll: true });
        } catch (error) {
          top.focus();
        }
      }
    });
  }

  // 当前章节导航高亮
  var sectionLinks = document.querySelectorAll('[data-section-link]');
  var trackedSections = Array.prototype.map.call(sectionLinks, function (link) {
    return document.getElementById(link.getAttribute('data-section-link'));
  }).filter(Boolean);
  if ('IntersectionObserver' in window && sectionLinks.length) {
    var activeSection = null;
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activeSection = entry.target.id;
      });
      sectionLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('data-section-link') === activeSection);
      });
    }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
    trackedSections.forEach(function (section) { sectionObserver.observe(section); });
  }

  // 滚动揭示
  var revealEls = document.querySelectorAll('[data-reveal]:not(.secondary-details):not(.rule-details)');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // 对号入座卡片 / hero 卡片：跳转后闪烁目标区块
  function bindJump(selector) {
    document.querySelectorAll(selector).forEach(function (link) {
      link.addEventListener('click', function () {
        var id = link.getAttribute('href');
        if (!id || id.charAt(0) !== '#' || id === FORM_URL) return;
        var target = document.querySelector(id);
        if (!target) return;
        setTimeout(function () {
          target.classList.remove('flash');
          void target.offsetWidth;
          target.classList.add('flash');
        }, 450);
      });
    });
  }
  bindJump('.hero-row, .quick-compare-grid a, .mobile-nav a');

  // 移动端固定 CTA：只在首屏和最终 CTA 不可见时出现，避免遮挡正文
  var fixedCta = document.querySelector('.mobile-fixed-cta');
  var primaryCta = document.querySelector('[data-primary-cta]');
  var finalCta = document.querySelector('[data-final-cta]');
  if (fixedCta && primaryCta && finalCta && 'IntersectionObserver' in window) {
    var primaryVisible = false;
    var finalVisible = false;
    var showOnScrollUp = false;
    var lastScrollY = window.scrollY;
    function updateFixedCta() {
      var shouldShow = showOnScrollUp && !primaryVisible && !finalVisible;
      fixedCta.classList.toggle('is-visible', shouldShow);
    }
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === primaryCta) primaryVisible = entry.isIntersecting;
        if (entry.target === finalCta) finalVisible = entry.isIntersecting;
      });
      updateFixedCta();
    }, { threshold: 0.12 });
    ctaObserver.observe(primaryCta);
    ctaObserver.observe(finalCta);
    window.addEventListener('scroll', function () {
      var currentScrollY = window.scrollY;
      if (currentScrollY < 120) {
        showOnScrollUp = false;
      } else if (currentScrollY < lastScrollY - 2) {
        showOnScrollUp = true;
      } else if (currentScrollY > lastScrollY + 2) {
        showOnScrollUp = false;
      }
      lastScrollY = currentScrollY;
      updateFixedCta();
    }, { passive: true });
  } else if (fixedCta) {
    fixedCta.classList.add('is-visible');
  }

  // sticky 价格栏状态：仅桌面端提供轻微视觉提示
  if ('IntersectionObserver' in window && !reduceMotion.matches && window.matchMedia('(min-width: 801px)').matches) {
    document.querySelectorAll('.product-aside').forEach(function (aside) {
      var sentinel = document.createElement('span');
      sentinel.className = 'sticky-sentinel';
      sentinel.setAttribute('aria-hidden', 'true');
      var productGrid = aside.closest('.product-grid');
      if (!productGrid || !productGrid.parentNode) return;
      productGrid.parentNode.insertBefore(sentinel, productGrid);
      var stickyObserver = new IntersectionObserver(function (entries) {
        aside.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }, { rootMargin: '-89px 0px 0px 0px', threshold: 0 });
      stickyObserver.observe(sentinel);
    });
  }

  // FAQ 仅做轻量淡入，避免 max-height 测量和布局重排造成顿挫
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var summary = item.querySelector('.faq-q');
    if (!summary) return;
    summary.addEventListener('click', function (event) {
      event.preventDefault();
      item.open = !item.open;
    });
  });

  // 移动端导航：保持键盘和触屏都可用
  var menuToggle = document.querySelector('.mobile-menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  function closeMenu() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.hidden = true;
  }
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      var open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
      if (!open) {
        var firstLink = mobileNav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
    mobileNav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', function (event) {
      if (!mobileNav.hidden && !mobileNav.contains(event.target) && event.target !== menuToggle) closeMenu();
    });
  }
})();
