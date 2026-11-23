/* ==========================================================================
   checkout.js - فرایند تسویه حساب چندمرحله‌ای
   وابسته به: data.js، app-shared.js
   ========================================================================== */
(function () {
  'use strict';

  if (!document.getElementById('ckPage')) return;

  const { PROVINCES, SHIPPING_METHODS, PAYMENT_METHODS, COUPONS } = window.SAEI;
  const { $, $$, fa, toman, byId, store } = SAEI.helpers;
  const state = SAEI.state;

  const ADDRESS_KEY = 'saei-address';
  const COUPON_KEY = 'saei-coupon';
  const ORDERS_KEY = 'saei-orders';

  /* ── سبد خالی؟ به صفحه سبد بفرست ── */
  if (!state.cart.length) {
    $('#ckEmpty').hidden = false;
    return;
  }
  $('#ckPage').hidden = false;

  /* ── حالت داخلی ── */
  // اگر کاربر وارد شده، از اطلاعات حساب و آدرس‌های ذخیره‌شده استفاده کن
  const user = SAEI.auth.isLoggedIn() ? SAEI.auth.getUser() : null;
  const savedAddresses = user ? SAEI.auth.getAddresses() : [];
  const defaultAddress = savedAddresses.length
    ? { name: savedAddresses[0].name, phone: savedAddresses[0].phone, province: savedAddresses[0].province, city: savedAddresses[0].city, address: savedAddresses[0].address, postal: savedAddresses[0].postal }
    : store.get(ADDRESS_KEY, {});
  // اگر کاربر وارد شده ولی هنوز آدرس نگذاشته، نام و تلفن را از حساب پر کن
  if (user && !defaultAddress.name) defaultAddress.name = user.name;
  if (user && !defaultAddress.phone) defaultAddress.phone = user.phone;

  const ck = {
    step: 1,
    address: defaultAddress,
    shippingId: null,
    paymentId: null,
    selectedSavedAddr: savedAddresses.length ? savedAddresses[0].id : null
  };

  /* ── کمک‌تابع ── */
  function subtotal() {
    return state.cart.reduce((a, x) => {
      const p = byId(x.id);
      return p ? a + p.price * x.qty : a;
    }, 0);
  }
  function appliedCoupon() {
    const c = store.get(COUPON_KEY, null);
    return c && COUPONS[c] ? c : null;
  }
  function discountAmount(sub) {
    const code = appliedCoupon();
    if (!code) return 0;
    const c = COUPONS[code];
    if (c.fixed) return Math.min(c.fixed, sub);
    const amount = Math.floor(sub * c.percent / 100);
    return c.max ? Math.min(amount, c.max) : amount;
  }
  function shippingCost() {
    if (!ck.shippingId) return 0;
    const m = SHIPPING_METHODS.find(s => s.id === ck.shippingId);
    return m ? m.price : 0;
  }
  function grandTotal() {
    const sub = subtotal();
    return sub - discountAmount(sub) + shippingCost();
  }

  function availableShipping(province) {
    return SHIPPING_METHODS.filter(s => !s.provinces || s.provinces.includes(province));
  }

  /* ── مدیریت مراحل ── */
  function goStep(n) {
    ck.step = n;
    // به‌روزرسانی نشانگر
    $$('.ck-step').forEach(el => {
      const s = +el.dataset.step;
      el.classList.toggle('is-active', s === n);
      el.classList.toggle('is-done', s < n);
    });
    // به‌روزرسانی پنل‌ها
    $$('.ck-panel').forEach(el => {
      el.classList.toggle('is-active', +el.dataset.panel === n);
    });
    // اسکرول به بالا
    document.getElementById('top').scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderSide();
  }

  /* ── مرحله ۱: فرم آدرس ── */
  // پر کردن استان‌ها
  $('#ckProvince').innerHTML = PROVINCES.map(p => `<option>${p}</option>`).join('');

  // بازیابی مقادیر ذخیره شده
  const addr = ck.address;
  if (addr.name)     $('#ckName').value = addr.name;
  if (addr.phone)    $('#ckPhone').value = addr.phone;
  if (addr.province) $('#ckProvince').value = addr.province;
  if (addr.city)     $('#ckCity').value = addr.city;
  if (addr.address)  $('#ckAddress').value = addr.address;
  if (addr.postal)   $('#ckPostal').value = addr.postal;
  if (addr.note)     $('#ckNote').value = addr.note;

  function validatePhone(p) {
    return /^09\d{9}$/.test(p.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  }
  function validatePostal(p) {
    return /^\d{10}$/.test(p.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  }

  $('#formAddress').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#ckName').value.trim();
    const phone = $('#ckPhone').value.trim();
    const province = $('#ckProvince').value;
    const city = $('#ckCity').value.trim();
    const address = $('#ckAddress').value.trim();
    const postal = $('#ckPostal').value.trim();
    const note = $('#ckNote').value.trim();

    if (!name || !phone || !city || !address || !postal) {
      SAEI.toast('لطفاً همه فیلدهای اجباری را پر کنید.', false);
      return;
    }
    if (!validatePhone(phone)) {
      SAEI.toast('شماره موبایل معتبر نیست (مثلاً ۰۹۱۲۱۲۳۴۵۶۷).', false);
      $('#ckPhone').focus();
      return;
    }
    if (!validatePostal(postal)) {
      SAEI.toast('کد پستی باید ۱۰ رقم باشد.', false);
      $('#ckPostal').focus();
      return;
    }

    ck.address = { name, phone, province, city, address, postal, note };
    store.set(ADDRESS_KEY, ck.address);

    renderShipping();
    goStep(2);
  });

  /* ── مرحله ۲: روش ارسال ── */
  function renderShipping() {
    const province = ck.address.province;
    const list = availableShipping(province);
    const container = $('#ckShipping');

    // اگر گزینه قبلی برای این استان معتبر نیست، پاک کن
    if (ck.shippingId && !list.find(s => s.id === ck.shippingId)) ck.shippingId = null;

    // اگر چیزی انتخاب نشده، گزینه اول را پیش‌فرض کن
    if (!ck.shippingId && list.length) ck.shippingId = list[0].id;

    container.innerHTML = list.map(s => `
      <label class="ck-ship ${ck.shippingId === s.id ? 'is-active' : ''}">
        <input type="radio" name="ship" value="${s.id}" ${ck.shippingId === s.id ? 'checked' : ''}>
        <div class="ck-ship-info">
          <b>${s.name}</b>
          <p>${s.desc}</p>
          <span class="ck-ship-eta">تحویل: ${s.eta}</span>
        </div>
        <div class="ck-ship-price">${toman(s.price)}</div>
      </label>
    `).join('');

    if (!list.length) {
      container.innerHTML = `<div class="ck-ship-none">برای استان <b>${province}</b> فعلاً روش ارسالی تعریف نشده است. با پشتیبانی تماس بگیرید.</div>`;
    }

    container.addEventListener('change', e => {
      if (e.target.name === 'ship') {
        ck.shippingId = e.target.value;
        renderShipping();
        renderSide();
      }
    }, { once: true });
  }

  $('#goPayment').addEventListener('click', () => {
    if (!ck.shippingId) {
      SAEI.toast('لطفاً روش ارسال را انتخاب کنید.', false);
      return;
    }
    renderPayment();
    goStep(3);
  });

  /* ── مرحله ۳: روش پرداخت ── */
  function renderPayment() {
    const province = ck.address.province;
    const list = PAYMENT_METHODS.map(pm => {
      const available = pm.enabled && (!pm.restrictedTo || pm.restrictedTo.includes(province));
      return { ...pm, available };
    });

    // اگر گزینه قبلی در دسترس نیست پاک کن
    if (ck.paymentId && !list.find(x => x.id === ck.paymentId && x.available)) ck.paymentId = null;
    if (!ck.paymentId) {
      const first = list.find(x => x.available);
      if (first) ck.paymentId = first.id;
    }

    const container = $('#ckPayment');
    container.innerHTML = list.map(pm => `
      <label class="ck-pay ${pm.available ? '' : 'is-disabled'} ${ck.paymentId === pm.id ? 'is-active' : ''}">
        <input type="radio" name="pay" value="${pm.id}" ${ck.paymentId === pm.id ? 'checked' : ''} ${pm.available ? '' : 'disabled'}>
        <div class="ck-pay-info">
          <b>${pm.name}</b>
          <p>${pm.desc}</p>
          ${!pm.available ? `<span class="ck-pay-note">${pm.restrictedTo ? 'فقط ' + pm.restrictedTo.join('، ') : 'به‌زودی فعال می‌شود'}</span>` : ''}
        </div>
      </label>
    `).join('');

    container.addEventListener('change', e => {
      if (e.target.name === 'pay') {
        ck.paymentId = e.target.value;
        renderPayment();
        renderSide();
      }
    }, { once: true });
  }

  $('#goConfirm').addEventListener('click', () => {
    if (!ck.paymentId) {
      SAEI.toast('لطفاً روش پرداخت را انتخاب کنید.', false);
      return;
    }
    renderConfirm();
    goStep(4);
  });

  /* ── مرحله ۴: تأیید ── */
  function renderConfirm() {
    const addr = ck.address;
    const ship = SHIPPING_METHODS.find(s => s.id === ck.shippingId);
    const pay = PAYMENT_METHODS.find(p => p.id === ck.paymentId);

    $('#ckConfirm').innerHTML = `
      <div class="ck-confirm-section">
        <div class="ck-confirm-head">
          <h3>اطلاعات تحویل</h3>
          <button class="ck-edit" type="button" data-goto="1">ویرایش</button>
        </div>
        <div class="ck-confirm-body">
          <p><b>${addr.name}</b></p>
          <p class="ltr" dir="ltr">${addr.phone}</p>
          <p>${addr.province}، ${addr.city}</p>
          <p>${addr.address}</p>
          <p>کد پستی: <span class="ltr">${addr.postal}</span></p>
          ${addr.note ? `<p class="muted">یادداشت: ${addr.note}</p>` : ''}
        </div>
      </div>
      <div class="ck-confirm-section">
        <div class="ck-confirm-head">
          <h3>روش ارسال</h3>
          <button class="ck-edit" type="button" data-goto="2">ویرایش</button>
        </div>
        <div class="ck-confirm-body">
          <p><b>${ship.name}</b> — ${toman(ship.price)}</p>
          <p class="muted">${ship.desc}</p>
        </div>
      </div>
      <div class="ck-confirm-section">
        <div class="ck-confirm-head">
          <h3>روش پرداخت</h3>
          <button class="ck-edit" type="button" data-goto="3">ویرایش</button>
        </div>
        <div class="ck-confirm-body">
          <p><b>${pay.name}</b></p>
          <p class="muted">${pay.desc}</p>
        </div>
      </div>
    `;
  }

  /* ── ثبت نهایی سفارش ── */
  function placeOrder() {
    const btn = $('#placeOrder');
    btn.disabled = true;
    btn.innerHTML = '<svg width="16" height="16"><use href="#i-lock"/></svg>در حال ثبت سفارش...';

    // شبیه‌سازی اتصال به درگاه پرداخت
    setTimeout(() => {
      const orderId = genOrderId();
      const total = grandTotal();

      // ذخیره سفارش در localStorage (دمو)
      const orders = store.get(ORDERS_KEY, []);
      orders.push({
        id: orderId,
        date: new Date().toISOString(),
        userPhone: user ? user.phone : null,  // ارتباط با حساب کاربر
        items: state.cart.map(x => ({ id: x.id, qty: x.qty, price: byId(x.id).price, name: byId(x.id).name })),
        address: ck.address,
        shipping: ck.shippingId,
        payment: ck.paymentId,
        subtotal: subtotal(),
        discount: discountAmount(subtotal()),
        shippingCost: shippingCost(),
        total,
        coupon: appliedCoupon(),
        status: 'placed'
      });
      store.set(ORDERS_KEY, orders);

      // اگر کاربر وارد شده و این آدرس در لیست نبود، به آدرس‌هایش اضافه کن
      if (user) {
        const existing = SAEI.auth.getAddresses();
        const matched = existing.find(a =>
          a.address === ck.address.address && a.postal === ck.address.postal
        );
        if (!matched) {
          SAEI.auth.addAddress({
            title: 'آدرس تحویل',
            name: ck.address.name,
            phone: ck.address.phone,
            province: ck.address.province,
            city: ck.address.city,
            address: ck.address.address,
            postal: ck.address.postal
          });
        }
      }

      // پاک کردن سبد و کوپن
      state.cart = [];
      store.set('saei-cart', []);
      store.set(COUPON_KEY, null);
      SAEI.renderCart();

      // نمایش صفحه موفقیت
      $('#ckSuccessBox').innerHTML = `
        <div class="ck-success-rows">
          <div class="ck-success-row"><span>شماره سفارش</span><b class="ltr">${orderId}</b></div>
          <div class="ck-success-row"><span>گیرنده</span><b>${ck.address.name}</b></div>
          <div class="ck-success-row"><span>شماره تماس</span><b class="ltr" dir="ltr">${ck.address.phone}</b></div>
          <div class="ck-success-row"><span>مبلغ پرداخت‌شده</span><b>${toman(total)}</b></div>
        </div>
      `;
      goStep(5);

      // پنهان کردن ستون کناری در مرحله موفقیت
      $('#ckSide').hidden = true;
      // پنهان کردن نشانگر مرحله هم
      $('#ckSteps').style.opacity = '.5';
    }, 1400);
  }

  function genOrderId() {
    const d = new Date();
    const y = d.getFullYear().toString().slice(-2);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = Math.floor(Math.random() * 90000 + 10000);
    return `${y}${m}-${r}`;
  }

  $('#placeOrder').addEventListener('click', placeOrder);

  /* ── دکمه‌های برگشت و ویرایش ── */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-goto]');
    if (!t) return;
    goStep(+t.dataset.goto);
  });

  /* ── خلاصه کناری ── */
  function renderSide() {
    // آیتم‌های سبد (فشرده)
    const itemsHtml = state.cart.map(x => {
      const p = byId(x.id);
      if (!p) return '';
      return `
        <div class="ck-side-item">
          <img src="${p.img}" alt="" width="48" height="48">
          <div>
            <h4>${p.name}</h4>
            <small>${fa(x.qty)} × ${fa(p.price)} تومان</small>
          </div>
          <b>${toman(p.price * x.qty)}</b>
        </div>
      `;
    }).join('');
    $('#ckSideItems').innerHTML = itemsHtml;

    // ردیف‌های جمع
    const sub = subtotal();
    const disc = discountAmount(sub);
    const ship = shippingCost();
    const total = sub - disc + ship;
    const code = appliedCoupon();

    const rows = [];
    rows.push(`<div class="cart-sum-row"><span>جمع کالاها</span><b>${toman(sub)}</b></div>`);
    if (disc > 0) {
      rows.push(`<div class="cart-sum-row discount"><span>تخفیف ${code ? `(${code})` : ''}</span><b>−${toman(disc)}</b></div>`);
    }
    rows.push(`<div class="cart-sum-row"><span>هزینه ارسال</span><b>${ship ? toman(ship) : '<em style="color:var(--fg-muted)">بعد از انتخاب</em>'}</b></div>`);
    rows.push(`<div class="cart-sum-row total"><span>مبلغ قابل پرداخت</span><b>${toman(total)}</b></div>`);
    $('#ckSummaryRows').innerHTML = rows.join('');
  }

  /* ── Boot ── */
  renderSide();
})();
