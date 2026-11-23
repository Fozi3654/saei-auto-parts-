/* ==========================================================================
   app-shared.js - کد مشترک بین همه صفحات
   وابسته به: data.js
   در این فایل: Helpers، State، Theme، Header، Cart، Drawer، Toast
   ========================================================================== */
(function () {
  'use strict';

  const { MAKERS, CATS, TAGS, PRODUCTS } = window.SAEI;

  /* ── Helpers ── */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fa = n => n.toLocaleString('fa-IR');
  const toman = n => fa(n) + ' <small>تومان</small>';
  const byId = id => PRODUCTS.find(p => p.id === id);
  const norm = s => (s || '').toLowerCase().replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').trim();
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  SAEI.helpers = { $, $$, fa, toman, byId, norm, store };

  /* ── State ── */
  const state = {
    car: store.get('saei-car', null),
    cat: 'all',
    q: '',
    cart: store.get('saei-cart', []),
    favs: new Set(store.get('saei-favs', [])),
    user: store.get('saei-user', null)   // { phone, name, loggedInAt }
  };
  SAEI.state = state;

  /* ── Auth helpers ── */
  SAEI.auth = {
    isLoggedIn() { return !!(state.user && state.user.phone); },
    getUser() { return state.user; },
    login(user) {
      state.user = Object.assign({ loggedInAt: Date.now() }, user);
      store.set('saei-user', state.user);
    },
    logout() {
      state.user = null;
      store.set('saei-user', null);
    },
    updateProfile(fields) {
      if (!state.user) return;
      Object.assign(state.user, fields);
      store.set('saei-user', state.user);
    },
    // آدرس‌های ذخیره شده کاربر
    getAddresses() { return store.get('saei-addresses', []); },
    addAddress(addr) {
      const list = this.getAddresses();
      addr.id = Date.now();
      list.push(addr);
      store.set('saei-addresses', list);
      return addr;
    },
    updateAddress(id, fields) {
      const list = this.getAddresses();
      const i = list.findIndex(a => a.id === id);
      if (i >= 0) {
        Object.assign(list[i], fields);
        store.set('saei-addresses', list);
      }
    },
    removeAddress(id) {
      const list = this.getAddresses().filter(a => a.id !== id);
      store.set('saei-addresses', list);
    },
    getOrders() { return store.get('saei-orders', []); }
  };

  /* ── Theme ── */
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');
  const SUN = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  root.setAttribute('data-theme', store.get('saei-theme', 'light') === 'dark' ? 'dark' : 'light');
  const syncTheme = () => {
    if (!themeBtn) return;
    const d = root.getAttribute('data-theme') === 'dark';
    themeBtn.innerHTML = d ? SUN : MOON;
    themeBtn.setAttribute('aria-label', d ? 'تم روشن' : 'تم تیره');
  };
  syncTheme();
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('saei-theme', next);
      syncTheme();
    });
  }

  /* ── Header behavior ── */
  const header = $('#header'), hero = $('.hero');
  if (header && hero) {
    const onScroll = () => header.classList.toggle('on-hero', hero.getBoundingClientRect().bottom > header.offsetHeight + 40);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
  } else if (header) {
    // در صفحات بدون هیرو، هدر همیشه حالت لایت دارد
    header.classList.remove('on-hero');
  }

  /* ── Toast ── */
  let tt;
  function toast(msg, withBtn = true) {
    const el = $('#toast');
    if (!el) return;
    $('#toastText').textContent = msg;
    $('#toastBtn').hidden = !withBtn;
    el.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => el.classList.remove('show'), 2600);
  }
  SAEI.toast = toast;

  /* ── رندر مشترک کارت محصول (استفاده در صفحه اصلی، فروشگاه، مرتبط‌ها) ── */
  SAEI.renderCard = function (p) {
    const match = state.car && state.car.model && Array.isArray(p.models) && p.models.includes(state.car.model);
    const isUniversal = p.maker === 'all';
    const makerLabel = isUniversal ? (p.brand || 'همه خودروها') : (MAKERS[p.maker] ? MAKERS[p.maker].name : '');
    const modelsLabel = Array.isArray(p.models) ? p.models.join('، ') : (p.models || 'همه خودروها');
    const off = p.old && p.price ? Math.round((1 - p.price / p.old) * 100) : 0;
    const href = `product.html?id=${p.id}`;

    // قیمت‌گذاری — null یعنی نیاز به استعلام
    const priceBlock = p.price
      ? `<div class="price-row">
          <span class="price">${toman(p.price)}</span>
          ${p.old ? `<span class="old">${fa(p.old)}</span><span class="off">٪${fa(off)}</span>` : ''}
        </div>`
      : `<div class="price-row price-inquiry">
          <span class="price-ask">استعلام قیمت</span>
        </div>`;

    // وضعیت موجودی
    let stockBlock;
    if (p.stock === null || p.stock === undefined) {
      stockBlock = `<span class="stock pending"><i></i>برای موجودی تماس بگیرید</span>`;
    } else if (p.stock <= 0) {
      stockBlock = `<span class="stock out"><i></i>ناموجود</span>`;
    } else if (p.stock <= 3) {
      stockBlock = `<span class="stock low"><i></i>فقط ${fa(p.stock)} عدد در انبار</span>`;
    } else {
      stockBlock = `<span class="stock"><i></i>موجود در انبار</span>`;
    }

    // دکمه افزودن/استعلام
    const action = p.price
      ? `<button class="btn btn-primary add" type="button" data-add="${p.id}"><svg width="16" height="16"><use href="#i-cart"/></svg>افزودن به سبد</button>`
      : `<a class="btn btn-primary add" href="https://wa.me/${SAEI.CONTACT ? SAEI.CONTACT.whatsapp : '989179070541'}?text=${encodeURIComponent('سلام، قیمت و موجودی ' + p.name + ' (کد: ' + p.code + ') را می‌خواستم.')}" target="_blank" rel="noopener"><svg width="16" height="16"><use href="#i-chat"/></svg>استعلام از واتساپ</a>`;

    const tagsBlock = (p.tags || []).map(t => TAGS[t] ? `<span class="tag ${t}">${TAGS[t]}</span>` : '').join('');

    return `
    <article class="prod">
      <a class="prod-media" href="${href}" aria-label="جزئیات ${p.name}">
        <img src="${p.img}" alt="${p.name}" loading="lazy" width="640" height="640">
        <span class="tags">${tagsBlock}</span>
        <span class="maker-chip">${makerLabel}</span>
      </a>
      <button class="fav" type="button" data-fav="${p.id}" aria-pressed="${state.favs.has(p.id)}" aria-label="افزودن به علاقه‌مندی"><svg width="18" height="18" fill="none"><use href="#i-heart"/></svg></button>
      <div class="prod-body">
        <div class="prod-code">کد فنی: <span class="ltr">${p.code}</span></div>
        <h3><a href="${href}">${p.name}</a></h3>
        <div class="fit ${match ? 'match' : ''}">${match ? '✓ سازگار با خودروی شما' : 'مناسب: ' + modelsLabel}</div>
        ${stockBlock}
        ${priceBlock}
        ${action}
      </div>
    </article>`;
  };

  /* ── Cart ── */
  const saveCart = () => store.set('saei-cart', state.cart);
  const cartCount = () => state.cart.reduce((a, x) => a + x.qty, 0);
  function addToCart(id, qty = 1) {
    const p = byId(id);
    if (!p) return;
    if (!p.price) {
      toast('این محصول نیاز به استعلام قیمت دارد. لطفاً از دکمه واتساپ استفاده کنید.', false);
      return;
    }
    const row = state.cart.find(x => x.id === id);
    row ? row.qty += qty : state.cart.push({ id, qty });
    saveCart();
    renderCart();
    const b = $('#cartCount');
    if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    toast(`«${p.name}» به سبد اضافه شد`);
  }
  SAEI.addToCart = addToCart;

  function renderCart() {
    const n = cartCount();
    const countBadge = $('#cartCount');
    if (countBadge) countBadge.textContent = fa(n);
    const headCount = $('#cartHeadCount');
    if (headCount) headCount.textContent = n ? `(${fa(n)} کالا)` : '';

    const list = $('#cartList'), foot = $('#cartFoot');
    if (!list || !foot) return;

    if (!state.cart.length) {
      list.innerHTML = `<div class="cart-empty"><svg width="44" height="44" style="opacity:.5"><use href="#i-cart"/></svg>سبد خرید شما خالی است.<a class="btn btn-outline" href="index.html#products" data-close>مشاهده محصولات</a></div>`;
      foot.innerHTML = '';
      return;
    }
    list.innerHTML = state.cart.map(x => {
      const p = byId(x.id);
      if (!p) return '';
      const priceLine = p.price ? `${fa(p.price)} تومان` : 'استعلام قیمت';
      return `
      <div class="cart-item">
        <img src="${p.img}" alt="" width="64" height="64">
        <div><h4>${p.name}</h4><div class="u">${priceLine} · <span class="ltr">${p.code}</span></div></div>
        <div class="qty"><button type="button" data-inc="${p.id}" aria-label="افزایش">+</button><span>${fa(x.qty)}</span><button type="button" data-dec="${p.id}" aria-label="کاهش">−</button></div>
      </div>`;
    }).join('');
    const total = state.cart.reduce((a, x) => {
      const p = byId(x.id);
      return p && p.price ? a + p.price * x.qty : a;
    }, 0);
    foot.innerHTML = `<div class="cart-total"><span>جمع کل</span><b>${toman(total)}</b></div><a class="btn btn-primary" href="cart.html" id="checkout">مشاهده سبد و تسویه حساب</a><div class="cart-note">هزینه ارسال در مرحله تسویه حساب محاسبه می‌شود.</div>`;
  }
  SAEI.renderCart = renderCart;

  /* ── Drawers ── */
  const scrim = $('#scrim');
  function openDrawer(el) {
    if (!el) return;
    closeDrawers();
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    if (scrim) scrim.classList.add('show');
    setTimeout(() => {
      const close = el.querySelector('[data-close]');
      if (close) close.focus();
    }, 50);
  }
  function closeDrawers() {
    document.querySelectorAll('.drawer.open').forEach(d => {
      d.classList.remove('open');
      d.setAttribute('aria-hidden', 'true');
    });
    if (scrim) scrim.classList.remove('show');
  }
  SAEI.openDrawer = openDrawer;
  SAEI.closeDrawers = closeDrawers;

  if (scrim) scrim.addEventListener('click', closeDrawers);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawers(); });

  const menuBtn = $('#menuBtn');
  const cartBtn = $('#cartBtn');
  const navDrawer = $('#navDrawer');
  const cartDrawer = $('#cartDrawer');
  if (menuBtn && navDrawer) menuBtn.addEventListener('click', () => openDrawer(navDrawer));
  if (cartBtn && cartDrawer) cartBtn.addEventListener('click', () => openDrawer(cartDrawer));

  const toastBtn = $('#toastBtn');
  if (toastBtn) {
    toastBtn.addEventListener('click', () => {
      $('#toast').classList.remove('show');
      openDrawer(cartDrawer);
    });
  }

  const accountBtn = $('#accountBtn');
  if (accountBtn) {
    // اگر وارد شده، نشانه کوچک سبز اضافه کن
    if (SAEI.auth.isLoggedIn()) {
      accountBtn.classList.add('is-logged-in');
      accountBtn.title = SAEI.auth.getUser().name || SAEI.auth.getUser().phone;
    }
    accountBtn.addEventListener('click', () => {
      location.href = SAEI.auth.isLoggedIn() ? 'account.html' : 'login.html';
    });
  }

  // دکمه جست‌وجوی هدر: روی صفحه اصلی فایندر، روی بقیه به صفحه اصلی می‌رود
  const searchBtn = $('#searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if ($('#finder')) {
        $('#finder').scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => $('#fPart').focus({ preventScroll: true }), 400);
      } else {
        location.href = 'index.html#finder';
      }
    });
  }

  /* ── Delegated click handler for shared actions ── */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-add],[data-fav],[data-inc],[data-dec],[data-close],#checkout');
    if (!t) return;
    const d = t.dataset;
    if (d.add !== undefined) {
      addToCart(+d.add);
      if (t.classList.contains('add')) {
        t.classList.add('done');
        const prev = t.innerHTML;
        t.textContent = '✓ اضافه شد';
        setTimeout(() => {
          t.classList.remove('done');
          t.innerHTML = prev;
        }, 1300);
      }
    }
    else if (d.fav !== undefined) {
      const id = +d.fav;
      state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
      store.set('saei-favs', [...state.favs]);
      t.setAttribute('aria-pressed', state.favs.has(id));
      toast(state.favs.has(id) ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد', false);
    }
    else if (d.inc !== undefined) {
      const row = state.cart.find(x => x.id === +d.inc);
      if (row) { row.qty++; saveCart(); renderCart(); }
    }
    else if (d.dec !== undefined) {
      const row = state.cart.find(x => x.id === +d.dec);
      if (row) {
        row.qty--;
        if (row.qty < 1) state.cart = state.cart.filter(x => x !== row);
        saveCart();
        renderCart();
      }
    }
    else if ('close' in d) closeDrawers();
  });

  /* بوت اولیه سبد */
  renderCart();
})();
