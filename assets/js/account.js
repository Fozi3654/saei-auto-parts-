/* ==========================================================================
   account.js - پنل کاربری
   ========================================================================== */
(function () {
  'use strict';

  if (!document.getElementById('accountWrap')) return;

  const { MAKERS, CATS, PRODUCTS, PROVINCES, SHIPPING_METHODS, PAYMENT_METHODS } = window.SAEI;
  const { $, $$, fa, toman, byId, store } = SAEI.helpers;
  const state = SAEI.state;

  /* ── بررسی ورود ── */
  if (!SAEI.auth.isLoggedIn()) {
    $('#notLogged').hidden = false;
    return;
  }
  $('#accountWrap').hidden = false;

  const user = SAEI.auth.getUser();

  /* ── اطلاعات کاربر در سایدبار ── */
  function renderUserCard() {
    const u = SAEI.auth.getUser();
    const initials = (u.name || 'ک').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2);
    $('#accAvatar').textContent = initials;
    $('#accName').textContent = u.name || 'کاربر';
    $('#accPhone').textContent = u.phone;
    $('#dashName').textContent = u.name ? u.name.split(' ')[0] : 'دوست عزیز';
  }

  /* ── پیمایش بخش‌ها (hash-based) ── */
  function showSection(name) {
    $$('.account-tab').forEach(t => t.classList.toggle('is-active', t.dataset.sec === name));
    $$('.account-section').forEach(s => s.classList.toggle('is-active', s.dataset.sec === name));
    // اسکرول بالا
    if (window.scrollY > 100) {
      $('#top').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  function currentSection() {
    const h = location.hash.replace('#', '');
    return ['dashboard', 'orders', 'addresses', 'favorites', 'profile'].includes(h) ? h : 'dashboard';
  }
  window.addEventListener('hashchange', () => showSection(currentSection()));

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-sec]');
    if (t && t.dataset.sec) {
      e.preventDefault();
      location.hash = t.dataset.sec;
      showSection(t.dataset.sec);
    }
  });

  /* ── داشبورد ── */
  function renderDashboard() {
    const orders = SAEI.auth.getOrders();
    const addrs = SAEI.auth.getAddresses();
    const favs = Array.from(state.favs);

    $('#dashSub').textContent = orders.length
      ? `شما تا امروز ${fa(orders.length)} سفارش ثبت کرده‌اید.`
      : 'شما هنوز سفارشی ثبت نکرده‌اید.';

    const totalSpent = orders.reduce((a, o) => a + (o.total || 0), 0);

    $('#dashStats').innerHTML = `
      <div class="acc-stat">
        <div class="acc-stat-ico" style="background: color-mix(in oklab, var(--blue-fg) 15%, transparent); color: var(--blue-fg);"><svg width="20" height="20"><use href="#i-box"/></svg></div>
        <b>${fa(orders.length)}</b>
        <span>سفارش ثبت‌شده</span>
      </div>
      <div class="acc-stat">
        <div class="acc-stat-ico" style="background: color-mix(in oklab, var(--success) 15%, transparent); color: var(--success);"><svg width="20" height="20"><use href="#i-check"/></svg></div>
        <b>${fa(totalSpent.toLocaleString('fa-IR'))}</b>
        <span>مجموع خرید (تومان)</span>
      </div>
      <div class="acc-stat">
        <div class="acc-stat-ico" style="background: color-mix(in oklab, var(--yellow) 25%, transparent); color: var(--warn);"><svg width="20" height="20"><use href="#i-heart"/></svg></div>
        <b>${fa(favs.length)}</b>
        <span>قطعه در علاقه‌مندی</span>
      </div>
      <div class="acc-stat">
        <div class="acc-stat-ico" style="background: color-mix(in oklab, var(--danger) 10%, transparent); color: var(--danger);"><svg width="20" height="20"><use href="#i-pin"/></svg></div>
        <b>${fa(addrs.length)}</b>
        <span>آدرس ذخیره‌شده</span>
      </div>
    `;

    $('#quickOrder').textContent = orders.length
      ? `#${orders[orders.length - 1].id}`
      : 'سفارشی ندارید';
    $('#quickAddrs').textContent = `${fa(addrs.length)} آدرس`;
    $('#quickFavs').textContent = `${fa(favs.length)} قطعه`;
  }

  /* ── سفارش‌ها ── */
  function renderOrders() {
    const orders = SAEI.auth.getOrders();
    const list = $('#ordersList');
    $('#ordersSub').textContent = orders.length
      ? `${fa(orders.length)} سفارش ثبت‌شده`
      : 'شما هنوز سفارشی ندارید';

    if (!orders.length) {
      list.innerHTML = `
        <div class="empty cart-empty-box">
          <svg width="56" height="56" style="opacity:.4"><use href="#i-box"/></svg>
          <h3>سفارشی ندارید</h3>
          <p>اولین سفارش خود را ثبت کنید.</p>
          <div class="row">
            <a class="btn btn-primary" href="shop.html">مشاهده فروشگاه</a>
          </div>
        </div>
      `;
      return;
    }

    // سفارش‌های جدید بالا
    const sorted = [...orders].reverse();
    list.innerHTML = sorted.map(o => {
      const d = new Date(o.date);
      const faDate = d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
      const faTime = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      const itemsCount = o.items.reduce((a, i) => a + i.qty, 0);
      const itemNames = o.items.slice(0, 2).map(i => i.name).join('، ');
      const more = o.items.length > 2 ? ` و ${fa(o.items.length - 2)} مورد دیگر` : '';
      const ship = SHIPPING_METHODS.find(s => s.id === o.shipping);
      return `
        <article class="order-card">
          <div class="order-head">
            <div>
              <b>سفارش #${o.id}</b>
              <small>${faDate} · ${faTime}</small>
            </div>
            <span class="order-status success"><svg width="14" height="14"><use href="#i-check"/></svg>ثبت شده</span>
          </div>
          <div class="order-body">
            <div class="order-items">
              <svg width="16" height="16"><use href="#i-box"/></svg>
              <span><b>${fa(itemsCount)} کالا:</b> ${itemNames}${more}</span>
            </div>
            <div class="order-ship">
              <svg width="16" height="16"><use href="#i-pin"/></svg>
              <span>${o.address.city}، ${o.address.address.slice(0, 40)}${o.address.address.length > 40 ? '...' : ''}</span>
            </div>
            ${ship ? `<div class="order-ship"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/></svg><span>${ship.name}</span></div>` : ''}
          </div>
          <div class="order-foot">
            <div class="order-total">
              <span>مبلغ کل:</span>
              <b>${toman(o.total)}</b>
            </div>
            <a class="btn btn-outline" href="#" onclick="event.preventDefault(); SAEI.toast('جزئیات کامل سفارش به‌زودی اضافه می‌شود', false)">جزئیات سفارش</a>
          </div>
        </article>
      `;
    }).join('');
  }

  /* ── آدرس‌ها ── */
  function renderAddresses() {
    const list = SAEI.auth.getAddresses();
    const container = $('#addressesList');
    if (!list.length) {
      container.innerHTML = `
        <div class="addr-empty">
          <svg width="48" height="48" style="opacity:.3"><use href="#i-pin"/></svg>
          <p>هنوز آدرسی ذخیره نکرده‌اید</p>
          <p style="font-size:12.5px;color:var(--fg-muted)">دکمه «افزودن آدرس جدید» را بزنید</p>
        </div>
      `;
      return;
    }
    container.innerHTML = list.map(a => `
      <article class="addr-card" data-addr-id="${a.id}">
        <div class="addr-top">
          <div>
            <b>${a.title}</b>
            <small>${a.name} · <span class="ltr">${a.phone}</span></small>
          </div>
          <div class="addr-actions">
            <button class="btn-text" type="button" data-edit="${a.id}">ویرایش</button>
            <button class="btn-text addr-rm" type="button" data-rm="${a.id}">حذف</button>
          </div>
        </div>
        <p class="addr-body">${a.province}، ${a.city}، ${a.address}</p>
        <small class="addr-postal">کد پستی: <span class="ltr">${a.postal}</span></small>
      </article>
    `).join('');
  }

  // فرم آدرس
  $('#addrProvince').innerHTML = PROVINCES.map(p => `<option>${p}</option>`).join('');

  function openAddrForm(addrId) {
    const list = SAEI.auth.getAddresses();
    const addr = list.find(a => a.id === addrId);
    $('#addrFormTitle').textContent = addr ? 'ویرایش آدرس' : 'افزودن آدرس جدید';
    $('#addrId').value = addr ? addr.id : '';
    $('#addrTitle').value = addr ? addr.title : '';
    $('#addrName').value = addr ? addr.name : SAEI.auth.getUser().name || '';
    $('#addrPhone').value = addr ? addr.phone : SAEI.auth.getUser().phone || '';
    $('#addrProvince').value = addr ? addr.province : PROVINCES[0];
    $('#addrCity').value = addr ? addr.city : '';
    $('#addrFull').value = addr ? addr.address : '';
    $('#addrPostal').value = addr ? addr.postal : '';
    $('#addrFormWrap').hidden = false;
    setTimeout(() => $('#addrTitle').focus(), 50);
  }
  function closeAddrForm() {
    $('#addrFormWrap').hidden = true;
  }

  $('#btnAddAddress').addEventListener('click', () => openAddrForm(null));
  $('#btnCancelAddr').addEventListener('click', closeAddrForm);
  $('#btnCancelAddr2').addEventListener('click', closeAddrForm);

  $('#addrForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      title: $('#addrTitle').value.trim(),
      name: $('#addrName').value.trim(),
      phone: $('#addrPhone').value.trim(),
      province: $('#addrProvince').value,
      city: $('#addrCity').value.trim(),
      address: $('#addrFull').value.trim(),
      postal: $('#addrPostal').value.trim()
    };
    if (!data.title || !data.name || !data.phone || !data.city || !data.address || !data.postal) {
      SAEI.toast('لطفاً همه فیلدها را پر کنید', false);
      return;
    }
    const id = $('#addrId').value;
    if (id) {
      SAEI.auth.updateAddress(parseInt(id, 10), data);
      SAEI.toast('آدرس به‌روز شد', false);
    } else {
      SAEI.auth.addAddress(data);
      SAEI.toast('آدرس اضافه شد', false);
    }
    closeAddrForm();
    renderAddresses();
    renderDashboard();
  });

  document.addEventListener('click', e => {
    const edit = e.target.closest('[data-edit]');
    if (edit) { openAddrForm(parseInt(edit.dataset.edit, 10)); return; }
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      if (confirm('این آدرس حذف شود؟')) {
        SAEI.auth.removeAddress(parseInt(rm.dataset.rm, 10));
        renderAddresses();
        renderDashboard();
        SAEI.toast('آدرس حذف شد', false);
      }
    }
  });

  /* ── علاقه‌مندی‌ها ── */
  function renderFavorites() {
    const favs = Array.from(state.favs).map(id => byId(id)).filter(Boolean);
    const container = $('#favsGrid');
    if (!favs.length) {
      container.innerHTML = `
        <div class="empty cart-empty-box" style="grid-column: 1/-1;">
          <svg width="56" height="56" style="opacity:.4"><use href="#i-heart"/></svg>
          <h3>فعلاً هیچ قطعه‌ای در علاقه‌مندی ندارید</h3>
          <p>روی قلب هر محصول کلیک کنید تا اینجا ذخیره شود.</p>
          <div class="row">
            <a class="btn btn-primary" href="shop.html">مشاهده فروشگاه</a>
          </div>
        </div>
      `;
      return;
    }
    container.innerHTML = favs.map(p => SAEI.renderCard(p)).join('');
  }

  /* ── پروفایل ── */
  function renderProfile() {
    const u = SAEI.auth.getUser();
    $('#pfName').value = u.name || '';
    $('#pfPhone').value = u.phone || '';
    $('#pfEmail').value = u.email || '';
  }
  $('#profileEdit').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#pfName').value.trim();
    const email = $('#pfEmail').value.trim();
    if (!name) { SAEI.toast('نام را وارد کنید', false); return; }
    SAEI.auth.updateProfile({ name, email });
    renderUserCard();
    renderDashboard();
    SAEI.toast('اطلاعات حساب به‌روز شد', false);
  });

  /* ── خروج ── */
  $('#btnLogout').addEventListener('click', () => {
    if (confirm('از حساب کاربری خارج می‌شوید؟')) {
      SAEI.auth.logout();
      location.href = 'index.html';
    }
  });

  /* ── Boot ── */
  renderUserCard();
  renderDashboard();
  renderOrders();
  renderAddresses();
  renderFavorites();
  renderProfile();
  showSection(currentSection());

  // به‌روزرسانی علاقه‌مندی‌ها وقتی تغییر کند
  document.addEventListener('click', e => {
    if (e.target.closest('[data-fav]')) {
      setTimeout(() => { renderFavorites(); renderDashboard(); }, 50);
    }
  });
})();
