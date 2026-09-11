/* 风之岚官网交互：滚动揭示、对号入座定位闪烁、年份 */
(function () {
  'use strict';

  var FORM_URL = 'https://qcnrt01y72yf.feishu.cn/share/base/form/shrcn53nHKog9UxwnaIaE82swZe';

  // 页脚年份
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 滚动揭示
  var revealEls = document.querySelectorAll('[data-reveal]');
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
  bindJump('.hero-row');
})();
