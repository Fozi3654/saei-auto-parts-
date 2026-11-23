/* ==========================================================================
   app.js - منطق مخصوص صفحه اصلی
   وابسته به: data.js، app-shared.js
   ========================================================================== */
(function () {
  'use strict';

  const { MAKERS, CATS, TAGS, PRODUCTS, SPOTS, YEARS } = window.SAEI;
  const { $, $$, fa, toman, byId, norm, store } = SAEI.helpers;
  const state = SAEI.state;

  /* ── Finder ── */
  const fMaker = $('#fMaker'), fModel = $('#fModel'), fYear = $('#fYear'), fPart = $('#fPart');
  if (!fMaker) return; // اگر عناصر صفحه اصلی نیستند، اجرا نکن

  fYear.innerHTML = YEARS.map(y => `<option>${y}</option>`).join('');
  const fillModels = (maker, sel) => {
    fModel.innerHTML = MAKERS[maker].models.map(m => `<option${m === sel ? ' selected' : ''}>${m}</option>`).join('');
  };
  if (state.car) {
    fMaker.value = state.car.maker;
    fillModels(state.car.maker, state.car.model);
    if (state.car.year) fYear.value = state.car.year;
  } else {
    fillModels('ikco');
  }
  fMaker.addEventListener('change', () => fillModels(fMaker.value));
  $('#finder').addEventListener('submit', e => {
    e.preventDefault();
    setCar({ maker: fMaker.value, model: fModel.value, year: fYear.value });
    state.q = fPart.value;
    state.cat = 'all';
    renderProducts();
    goProducts();
  });
  const focusFinder = () => {
    $('#finder').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => fPart.focus({ preventScroll: true }), 400);
  };
  $('#heroFind').addEventListener('click', e => { e.preventDefault(); focusFinder(); });

  function setCar(car) {
    state.car = car;
    store.set('saei-car', car);
    renderMakers();
  }
  function goProducts() {
    $('#products').scrollIntoView({ behavior: 'smooth' });
  }

  /* ── Makers ── */
  function renderMakers() {
    $('#makerCards').innerHTML = Object.entries(MAKERS).map(([k, m]) => {
      // محصولات سازگار = مخصوص این برند + محصولات عمومی
      const count = PRODUCTS.filter(p => p.maker === k || p.maker === 'all').length;
      return `
      <article class="maker ${k}">
        <div class="maker-photo">
          <img src="${m.img}" width="960" height="720" alt="${m.alt}" loading="lazy">
          <div class="maker-title"><h3>${m.name}</h3><span>${fa(count)} قطعه سازگار</span></div>
        </div>
        <div class="maker-body">
          <p>${m.blurb}</p>
          <div class="chips">${m.models.map(md => `<button class="chip" type="button" data-pick="${k}|${md}" aria-pressed="${!!(state.car && state.car.model === md)}">${md}</button>`).join('')}</div>
          <div class="maker-foot">
            <span class="hint">مدل را بزنید یا همه را ببینید</span>
            <a class="btn btn-outline" href="#products" data-maker="${k}">مشاهده قطعات<svg class="arr" width="15" height="15"><use href="#i-arrow"/></svg></a>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  /* ── Categories ── */
  $('#catGrid').innerHTML = CATS.map((c, i) => `
    <a class="cat" href="#products" data-cat="${c.id}">
      <img src="${c.img}" alt="" loading="lazy" width="600" height="600">
      <span class="num">${fa(i + 1).padStart(2, '۰')}</span>
      <h3>${c.name}</h3><p>${c.desc}</p>
      <span class="go">مشاهده دسته<svg width="14" height="14"><use href="#i-arrow"/></svg></span>
    </a>`).join('');

  /* ── Products ── */
  function renderChips() {
    const all = [{ id: 'all', name: 'همه' }, ...CATS];
    $('#catChips').innerHTML = all.map(c =>
      `<button class="chip" type="button" data-chip="${c.id}" aria-pressed="${state.cat === c.id}">${c.id === 'all' ? 'همه' : c.name.split(' و ')[0]}</button>`
    ).join('');
  }
  function renderPill() {
    const c = state.car, el = $('#carPill');
    if (c && (c.model || c.maker)) {
      const label = c.model ? `${c.model}${c.year ? ' · ' + c.year : ''}` : `همه قطعات ${MAKERS[c.maker].name}`;
      el.innerHTML = `<span class="car-pill"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 17h14M6 17l1.5-5h9L18 17"/></svg>خودروی شما: ${label}<button type="button" id="clearCar" aria-label="حذف خودرو"><svg width="13" height="13"><use href="#i-x"/></svg></button></span>`;
    } else {
      el.innerHTML = `<span class="car-pill empty">خودرو انتخاب نشده · <a href="#makers">انتخاب خودرو</a></span>`;
    }
  }
  function filtered() {
    const c = state.car || {}, q = norm(state.q || '');
    return PRODUCTS.filter(p => {
      // محصولات عمومی (maker='all') با همه خودروها سازگارند
      const isUniversal = p.maker === 'all';
      if (c.maker && !isUniversal && p.maker !== c.maker) return false;
      if (c.model && !isUniversal && Array.isArray(p.models) && !p.models.includes(c.model)) return false;
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (q && !norm(p.name).includes(q) && !norm(p.code).includes(q)) return false;
      return true;
    });
  }
  function card(p) {
    return SAEI.renderCard(p);
  }
  SAEI.cardHTML = card;

  function skeletonCards(n) {
    const one = `
      <div class="skeleton">
        <div class="skeleton-media"></div>
        <div class="skeleton-body">
          <div class="skeleton-line sm"></div>
          <div class="skeleton-line lg"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line sm"></div>
          <div class="skeleton-line btn"></div>
        </div>
      </div>`;
    return Array(n).fill(one).join('');
  }

  function renderProducts(opts) {
    renderChips();
    renderPill();
    const grid = $('#prodGrid');
    const useSkeleton = opts && opts.skeleton;
    if (useSkeleton) {
      grid.innerHTML = skeletonCards(6);
      $('#resultCount').textContent = 'در حال بارگذاری…';
      setTimeout(() => renderProducts(), 320);
      return;
    }
    const list = filtered();
    $('#resultCount').textContent = `${fa(list.length)} قطعه`;
    grid.innerHTML = list.length ? list.map(card).join('') : `
      <div class="empty">
        <h3>قطعه‌ای با این مشخصات در این صفحه نیست</h3>
        <p>کاتالوگ کامل را کارشناس‌های ما دارند. کد فنی یا عکس قطعه را بفرستید تا قطعه سازگار را پیدا کنند.</p>
        <div class="row"><button class="btn btn-outline" type="button" id="resetFilters">پاک کردن فیلترها</button><a class="btn btn-primary" href="#contact">نیاز به مشاوره دارم</a></div>
      </div>`;
  }
  SAEI.renderProducts = renderProducts;

  /* ── Hotspots ── */
  const SPOT_HINT_KEY = 'saei-spot-hint-seen';
  function positionSpotHint(spotIndex) {
    const hint = $('#spotHint');
    if (!hint) return;
    const s = SPOTS[spotIndex];
    if (!s) return;
    hint.style.left = s.x + '%';
    hint.style.top = s.y + '%';
  }
  function hideSpotHint() {
    const hint = $('#spotHint');
    if (!hint) return;
    hint.classList.add('hidden');
    store.set(SPOT_HINT_KEY, true);
  }
  function renderSpots(active) {
    $('#spots').innerHTML = SPOTS.map((s, i) =>
      `<button class="spot" type="button" style="left:${s.x}%;top:${s.y}%" data-spot="${i}" aria-pressed="${i === active}" aria-label="${s.label}"></button>`
    ).join('');
    const s = SPOTS[active], p = byId(s.pid);
    if (!p) return;
    const priceText = p.price ? `${fa(p.price)} تومان` : 'استعلام قیمت';
    const actionBtn = p.price
      ? `<button class="btn btn-primary" type="button" data-add="${p.id}">افزودن</button>`
      : `<a class="btn btn-primary" href="product.html?id=${p.id}">مشاهده</a>`;
    $('#spotCard').innerHTML = `<img src="${p.img}" alt="" width="64" height="64"><div><div class="m">${s.label}</div><div class="t">${p.name}</div><div class="r"><span class="p">${priceText}</span>${actionBtn}</div></div>`;

    // راهنما را روی اولین نقطه (چراغ جلو) بگذار تا توجه جلب شود
    if (!store.get(SPOT_HINT_KEY, false)) {
      positionSpotHint(0);
    } else {
      hideSpotHint();
    }
  }
  SAEI.hideSpotHint = hideSpotHint;

  /* ── Delegated handlers مخصوص صفحه اصلی ── */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-pick],[data-maker],[data-cat],[data-chip],[data-spot],#clearCar,#resetFilters');
    if (!t) return;
    const d = t.dataset;
    if (d.pick) {
      const [mk, md] = d.pick.split('|');
      setCar({ maker: mk, model: md, year: null });
      fMaker.value = mk;
      fillModels(mk, md);
      state.cat = 'all';
      state.q = '';
      fPart.value = '';
      renderProducts();
      goProducts();
    }
    else if (d.maker) {
      e.preventDefault();
      SAEI.closeDrawers();
      setCar({ maker: d.maker, model: null, year: null });
      state.cat = 'all';
      state.q = '';
      renderProducts();
      goProducts();
    }
    else if (d.cat) { e.preventDefault(); state.cat = d.cat; renderProducts(); goProducts(); }
    else if (d.chip) { state.cat = d.chip; renderProducts(); }
    else if (d.spot) { renderSpots(+d.spot); hideSpotHint(); }
    else if (t.id === 'clearCar') { setCar(null); renderProducts(); }
    else if (t.id === 'resetFilters') { setCar(null); state.cat = 'all'; state.q = ''; fPart.value = ''; renderProducts(); }
  });

  /* ── موج (Ripple) روی دکمه افزودن ── */
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.add');
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--rx', ((e.clientX - r.left) / r.width * 100) + '%');
    b.style.setProperty('--ry', ((e.clientY - r.top) / r.height * 100) + '%');
  });

  /* ── Boot ── */
  renderMakers();
  renderProducts({ skeleton: true });
  renderSpots(2);
})();
