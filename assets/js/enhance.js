/* ==========================================================================
   enhance.js - ارتقاهای تجربه کاربری فاز A
   وابسته به: app.js (برای SAEI)
   ویژگی‌ها:
     1) نوار پیشرفت اسکرول
     2) ظاهر شدن بخش‌ها هنگام اسکرول (IntersectionObserver)
     3) دکمه برگشت به بالا
     4) دکمه شناور واتساپ
     5) بهبود کیفیت لمس روی موبایل (جلوگیری از دابل‌تاپ)
   ========================================================================== */
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1) نوار پیشرفت اسکرول */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  let rafScroll = null;
  const updateProgress = () => {
    rafScroll = null;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.setProperty('--sp', p + '%');
    // دکمه برگشت به بالا
    if (toTop) toTop.classList.toggle('show', h.scrollTop > 420);
  };
  addEventListener('scroll', () => {
    if (!rafScroll) rafScroll = requestAnimationFrame(updateProgress);
  }, { passive: true });

  /* 2) Reveal — ظاهر شدن بخش‌ها */
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // بخش‌های اصلی که انیمیشن ظاهر شدن دارند
    document.querySelectorAll('section.block, .trust').forEach(el => {
      el.classList.add('reveal');
      io.observe(el);
    });

    // گریدهایی که بچه‌هایشان پشت سر هم ظاهر می‌شوند
    // توجه: #prodGrid عمداً خارج شد چون skeleton + اسکرول افقی با stagger تداخل می‌کند
    ['#catGrid', '#makerCards', '.bene-list', '.trust-card', '.foot-grid'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.classList.add('reveal-stagger');
        io.observe(el);
      }
    });
  } else {
    // وقتی کاربر motion را کاهش داده، همه چیز بی‌انیمیشن قابل مشاهده
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('in'));
  }

  /* 3) دکمه برگشت به بالا */
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'بازگشت به بالای صفحه');
  toTop.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  toTop.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
  document.body.appendChild(toTop);

  /* 4) دکمه شناور واتساپ */
  const WA_NUMBER = (window.SAEI && SAEI.CONTACT && SAEI.CONTACT.whatsapp) || '989179070541';
  const wa = document.createElement('a');
  wa.className = 'wa-float';
  wa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('سلام، سوال درباره قطعه خودرو داشتم.')}`;
  wa.target = '_blank';
  wa.rel = 'noopener';
  wa.setAttribute('aria-label', 'تماس در واتساپ');
  wa.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.1L2 22l5-1.6a11 11 0 0 0 5 1.3h0a11 11 0 0 0 11-11 10.9 10.9 0 0 0-2.5-7.2zm-8.5 17a9 9 0 0 1-4.6-1.2l-.3-.2-3 1 .8-3-.2-.3A9 9 0 1 1 12 20.5zm5-6.7c-.3-.2-1.7-.8-2-.9s-.4-.2-.6.2-.7.9-.9 1.1-.3.2-.6 0a7.3 7.3 0 0 1-2.2-1.4 8.3 8.3 0 0 1-1.5-1.9c-.2-.3 0-.5.1-.6s.3-.3.4-.5l.3-.4a.6.6 0 0 0 0-.5c0-.2-.6-1.6-.9-2.2s-.5-.5-.7-.5h-.5a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.2 6.2 0 0 0 1.3 3.3 14.3 14.3 0 0 0 5.5 4.8 6.6 6.6 0 0 0 1.9.6 4.5 4.5 0 0 0 2-.2 3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.4z"/></svg>';
  document.body.appendChild(wa);

  /* 5) پاس دادن کلید Enter روی chip و spot برای دسترس‌پذیری */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target;
    if (t.matches && (t.matches('.chip') || t.matches('.spot') || t.matches('.fav'))) {
      e.preventDefault();
      t.click();
    }
  });

  /* بوت اولیه برای به روز کردن پیشرفت */
  updateProgress();

  /* علامت گذاری که ارتقاها بار شدند */
  document.documentElement.classList.add('enhanced');
})();
