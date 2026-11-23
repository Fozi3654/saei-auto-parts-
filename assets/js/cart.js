/* ==========================================================================
   cart.js - صفحه سبد خرید
   وابسته به: data.js، app-shared.js
   ========================================================================== */
(function () {
  'use strict';

  if (!document.getElementById('cartPage')) return;

  const { COUPONS } = window.SAEI;
  const { $, $$, fa, toman, byId, store } = SAEI.helpers;
  const state = SAEI.state;

  const COUPON_KEY = 'saei-coupon';

  /* ── خواندن کد تخفیف ذخیره‌شده ── */
  let appliedCoupon = store.get(COUPON_KEY, null);

  /* ── محاسبات ── */
  function subtotal() {
    return state.cart.reduce((a, x) => {
      const p = byId(x.id);
      return p ? a + p.price * x.qty : a;
    }, 0);
  }
  function discountAmount(sub) {
    if (!appliedCoupon) return 0;
    const c = COUPONS[appliedCoupon];
    if (!c) return 0;
    if (c.fixed) return Math.min(c.fixed, sub);
    const amount = Math.floor(sub * c.percent / 100);
    return c.max ? Math.min(amount, c.max) : amount;
  }
  function finalTotal() {
    const sub = subtotal();
    return sub - discountAmount(sub);
  }

  /* ── رندر آیتم سبد ── */
  function renderItems() {
    const container = $('#cartItems');
    const empty = state.cart.length === 0;

    $('#cartEmpty').hidden = !empty;
    $('#cartPage').hidden = empty;

    if (empty) return;

    container.innerHTML = state.cart.map(x => {
      const p = byId(x.id);
      if (!p) return '';
      const lineTotal = p.price * x.qty;
      return `
        <article class="cart-row" role="listitem" data-row="${p.id}">
          <a class="cart-row-img" href="product.html?id=${p.id}">
            <img src="${p.img}" alt="${p.name}" loading="lazy" width="96" height="96">
          </a>
          <div class="cart-row-info">
            <a class="cart-row-name" href="product.html?id=${p.id}">${p.name}</a>
            <div class="cart-row-meta">
              <span>کد فنی: <span class="ltr">${p.code}</span></span>
              <span>· ${SAEI.MAKERS[p.maker].name}</span>
            </div>
            <div class="cart-row-stock">
              <i></i>
              ${p.stock <= 3 ? `<span class="low">فقط ${fa(p.stock)} عدد در انبار</span>` : 'موجود در انبار'}
            </div>
          </div>
          <div class="cart-row-qty">
            <div class="qty">
              <button type="button" data-inc="${p.id}" aria-label="افزایش">+</button>
              <span>${fa(x.qty)}</span>
              <button type="button" data-dec="${p.id}" aria-label="کاهش">−</button>
            </div>
            <button class="cart-row-remove" type="button" data-remove="${p.id}" aria-label="حذف">
              <svg width="16" height="16"><use href="#i-trash"/></svg>
              حذف
            </button>
          </div>
          <div class="cart-row-price">
            <b>${toman(lineTotal)}</b>
            <small>${fa(x.qty)} × ${fa(p.price)} تومان</small>
          </div>
        </article>
      `;
    }).join('');

    const totalItems = state.cart.reduce((a, x) => a + x.qty, 0);
    $('#cartSummaryLine').textContent = `${fa(totalItems)} قطعه در سبد شما قرار دارد.`;
  }

  /* ── رندر خلاصه ── */
  function renderSummary() {
    const sub = subtotal();
    const disc = discountAmount(sub);
    const total = sub - disc;
    const rows = [];
    rows.push(`<div class="cart-sum-row"><span>جمع کالاها</span><b>${toman(sub)}</b></div>`);
    if (disc > 0) {
      const c = COUPONS[appliedCoupon];
      rows.push(`<div class="cart-sum-row discount">
        <span>تخفیف <small>(${appliedCoupon})</small> <button type="button" id="removeCoupon" aria-label="حذف کد تخفیف">×</button></span>
        <b>−${toman(disc)}</b>
      </div>`);
    }
    rows.push(`<div class="cart-sum-row total"><span>مبلغ قابل پرداخت</span><b>${toman(total)}</b></div>`);
    $('#summaryRows').innerHTML = rows.join('');
  }

  /* ── اعمال کد تخفیف ── */
  function applyCoupon(code) {
    code = code.trim().toUpperCase();
    const msg = $('#couponMsg');
    msg.hidden = false;
    if (!code) {
      msg.className = 'cart-coupon-msg error';
      msg.textContent = 'لطفاً یک کد وارد کنید.';
      return;
    }
    if (!COUPONS[code]) {
      msg.className = 'cart-coupon-msg error';
      msg.textContent = 'کد وارد شده معتبر نیست.';
      return;
    }
    appliedCoupon = code;
    store.set(COUPON_KEY, code);
    const c = COUPONS[code];
    msg.className = 'cart-coupon-msg success';
    msg.innerHTML = `✓ کد «<b>${code}</b>» اعمال شد — ${c.desc}`;
    renderSummary();
  }

  function removeCoupon() {
    appliedCoupon = null;
    store.set(COUPON_KEY, null);
    $('#couponInput').value = '';
    $('#couponMsg').hidden = true;
    renderSummary();
  }

  /* ── Events ── */
  $('#couponForm').addEventListener('submit', e => {
    e.preventDefault();
    applyCoupon($('#couponInput').value);
  });

  // حذف آیتم و حذف کوپن
  document.addEventListener('click', e => {
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      const id = +rm.dataset.remove;
      const name = byId(id)?.name || 'قطعه';
      state.cart = state.cart.filter(x => x.id !== id);
      store.set('saei-cart', state.cart);
      SAEI.renderCart();
      renderItems();
      renderSummary();
      SAEI.toast(`«${name}» از سبد حذف شد`, false);
      return;
    }
    if (e.target.id === 'removeCoupon') {
      removeCoupon();
    }
  });

  // بعد از inc/dec در app-shared.js، صفحه هم به‌روز می‌شود
  // یک handler اضافه برای به‌روزرسانی رندر محلی
  document.addEventListener('click', e => {
    if (e.target.closest('[data-inc], [data-dec]')) {
      // کمی تأخیر که state به‌روز شود
      setTimeout(() => { renderItems(); renderSummary(); }, 0);
    }
  });

  // دکمه ادامه و تسویه
  $('#goCheckout').addEventListener('click', () => {
    if (!state.cart.length) {
      SAEI.toast('سبد خالی است. ابتدا محصولی اضافه کنید.', false);
      return;
    }
    location.href = 'checkout.html';
  });

  /* ── نمایش کد تخفیف اگر قبلاً اعمال شده ── */
  if (appliedCoupon) {
    $('#couponInput').value = appliedCoupon;
    const c = COUPONS[appliedCoupon];
    const msg = $('#couponMsg');
    msg.hidden = false;
    msg.className = 'cart-coupon-msg success';
    msg.innerHTML = `✓ کد «<b>${appliedCoupon}</b>» اعمال شده — ${c.desc}`;
  }

  /* ── Boot ── */
  renderItems();
  renderSummary();
})();
