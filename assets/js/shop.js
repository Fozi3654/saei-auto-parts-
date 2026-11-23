/* ==========================================================================
   shop.js - صفحه فروشگاه با فیلتر و جست‌وجو
   ========================================================================== */
(function () {
  'use strict';

  if (!document.getElementById('prodGrid') || !document.getElementById('filterMakers')) return;

  const { MAKERS, CATS, TAGS, PRODUCTS } = window.SAEI;
  const { $, $$, fa, toman, byId, norm, store } = SAEI.helpers;
  const state = SAEI.state;

  const PER_PAGE = 12;

  /* ── خواندن فیلترها از URL ── */
  function parseURL() {
    const params = new URLSearchParams(location.search);
    return {
      q: params.get('q') || '',
      maker: params.get('maker') || '',
      model: params.get('model') || '',
      cat: params.get('cat') || '',
      priceMin: params.get('pmin') ? parseInt(params.get('pmin'), 10) : null,
      priceMax: params.get('pmax') ? parseInt(params.get('pmax'), 10) : null,
      inStock: params.get('stock') === '1',
      fav: params.get('fav') === '1',
      sort: params.get('sort') || 'relevance',
      page: parseInt(params.get('page'), 10) || 1
    };
  }

  function updateURL() {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.maker) params.set('maker', filters.maker);
    if (filters.model) params.set('model', filters.model);
    if (filters.cat) params.set('cat', filters.cat);
    if (filters.priceMin) params.set('pmin', filters.priceMin);
    if (filters.priceMax) params.set('pmax', filters.priceMax);
    if (filters.inStock) params.set('stock', '1');
    if (filters.fav) params.set('fav', '1');
    if (filters.sort !== 'relevance') params.set('sort', filters.sort);
    if (filters.page > 1) params.set('page', filters.page);
    const qs = params.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  let filters = parseURL();

  /* ── فیلتر محصولات ── */
  function filterProducts() {
    const q = norm(filters.q);
    let list = PRODUCTS.filter(p => {
      const isUniversal = p.maker === 'all';
      if (filters.maker && !isUniversal && p.maker !== filters.maker) return false;
      if (filters.model && !isUniversal && Array.isArray(p.models) && !p.models.includes(filters.model)) return false;
      if (filters.cat && p.cat !== filters.cat) return false;
      if (filters.inStock && (p.stock === null || p.stock < 1)) return false;
      if (filters.fav && !state.favs.has(p.id)) return false;
      if (filters.priceMin && (!p.price || p.price < filters.priceMin)) return false;
      if (filters.priceMax && (!p.price || p.price > filters.priceMax)) return false;
      if (q && !norm(p.name).includes(q) && !norm(p.code).includes(q)) return false;
      return true;
    });

    // مرتب‌سازی (محصولات بدون قیمت در انتها قرار می‌گیرند)
    const sortByPrice = (a, b, dir) => {
      if (!a.price && !b.price) return 0;
      if (!a.price) return 1;
      if (!b.price) return -1;
      return dir === 'asc' ? a.price - b.price : b.price - a.price;
    };
    switch (filters.sort) {
      case 'price-asc':  list.sort((a, b) => sortByPrice(a, b, 'asc')); break;
      case 'price-desc': list.sort((a, b) => sortByPrice(a, b, 'desc')); break;
      case 'popular':    list.sort((a, b) => (b.tags.includes('best') ? 1 : 0) - (a.tags.includes('best') ? 1 : 0)); break;
      case 'newest':     list.sort((a, b) => b.id - a.id); break;
    }
    return list;
  }

  /* ── کارت محصول (استفاده از رندر مشترک) ── */
  const card = (p) => SAEI.renderCard(p);

  /* ── رندر سایدبار فیلترها ── */
  function renderSidebar() {
    // خودروساز
    $('#filterMakers').innerHTML = Object.entries(MAKERS).map(([k, m]) => `
      <label class="shop-check">
        <input type="radio" name="fm-maker" value="${k}" ${filters.maker === k ? 'checked' : ''}>
        <span>${m.name}</span>
      </label>
    `).join('') + `
      <label class="shop-check">
        <input type="radio" name="fm-maker" value="" ${!filters.maker ? 'checked' : ''}>
        <span>همه برندها</span>
      </label>
    `;

    // مدل‌ها (فقط اگر خودروساز انتخاب شده)
    if (filters.maker) {
      $('#filterModelsGroup').hidden = false;
      $('#filterModels').innerHTML = `
        <label class="shop-check">
          <input type="radio" name="fm-model" value="" ${!filters.model ? 'checked' : ''}>
          <span>همه مدل‌ها</span>
        </label>
      ` + MAKERS[filters.maker].models.map(m => `
        <label class="shop-check">
          <input type="radio" name="fm-model" value="${m}" ${filters.model === m ? 'checked' : ''}>
          <span>${m}</span>
        </label>
      `).join('');
    } else {
      $('#filterModelsGroup').hidden = true;
    }

    // دسته‌بندی
    $('#filterCats').innerHTML = `
      <label class="shop-check">
        <input type="radio" name="fm-cat" value="" ${!filters.cat ? 'checked' : ''}>
        <span>همه دسته‌ها</span>
      </label>
    ` + CATS.map(c => `
      <label class="shop-check">
        <input type="radio" name="fm-cat" value="${c.id}" ${filters.cat === c.id ? 'checked' : ''}>
        <span>${c.name}</span>
      </label>
    `).join('');

    // سایر فیلدها
    $('#filterQ').value = filters.q;
    $('#priceMin').value = filters.priceMin || '';
    $('#priceMax').value = filters.priceMax || '';
    $('#filterInStock').checked = filters.inStock;
    $('#filterFav').checked = filters.fav;
    $('#sortBy').value = filters.sort;

    // تعداد فیلتر فعال
    const active = countActive();
    const badge = $('#activeFilterCount');
    if (active > 0) {
      badge.textContent = fa(active);
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  function countActive() {
    let n = 0;
    if (filters.q) n++;
    if (filters.maker) n++;
    if (filters.model) n++;
    if (filters.cat) n++;
    if (filters.priceMin) n++;
    if (filters.priceMax) n++;
    if (filters.inStock) n++;
    if (filters.fav) n++;
    return n;
  }

  /* ── رندر عنوان صفحه ── */
  function renderTitle() {
    let title = 'فروشگاه قطعات';
    let sub = 'همه قطعات موجود در فروشگاه';
    if (filters.fav) {
      title = 'علاقه‌مندی‌های من';
      sub = 'قطعاتی که به‌عنوان علاقه‌مندی نشان کرده‌اید';
    } else if (filters.maker) {
      title = `قطعات ${MAKERS[filters.maker].name}`;
      sub = filters.model ? `قطعات مناسب ${filters.model}` : MAKERS[filters.maker].blurb;
    } else if (filters.cat) {
      const c = CATS.find(x => x.id === filters.cat);
      if (c) { title = c.name; sub = c.desc; }
    } else if (filters.q) {
      title = `نتایج جست‌وجو برای «${filters.q}»`;
      sub = '';
    }
    $('#shopTitle').textContent = title;
    $('#shopSub').textContent = sub;
    document.getElementById('docTitle').textContent = `${title} | محمدرسول ساعی`;

    // Breadcrumb
    const parts = ['<a href="index.html">خانه</a>', '<span class="sep">/</span>'];
    if (filters.fav) {
      parts.push('<span class="cur">علاقه‌مندی‌ها</span>');
    } else if (filters.maker) {
      parts.push('<a href="shop.html">فروشگاه</a>', '<span class="sep">/</span>');
      parts.push(`<span class="cur">${MAKERS[filters.maker].name}</span>`);
    } else if (filters.cat) {
      const c = CATS.find(x => x.id === filters.cat);
      parts.push('<a href="shop.html">فروشگاه</a>', '<span class="sep">/</span>');
      parts.push(`<span class="cur">${c.name}</span>`);
    } else {
      parts.push('<span class="cur">فروشگاه</span>');
    }
    $('#shopBreadcrumb').innerHTML = parts.join('');
  }

  /* ── چیپ‌های فیلتر فعال ── */
  function renderActiveChips() {
    const chips = [];
    if (filters.maker) chips.push({ label: MAKERS[filters.maker].name, key: 'maker' });
    if (filters.model) chips.push({ label: filters.model, key: 'model' });
    if (filters.cat) {
      const c = CATS.find(x => x.id === filters.cat);
      if (c) chips.push({ label: c.name, key: 'cat' });
    }
    if (filters.q) chips.push({ label: `«${filters.q}»`, key: 'q' });
    if (filters.inStock) chips.push({ label: 'فقط موجود', key: 'inStock' });
    if (filters.fav) chips.push({ label: 'علاقه‌مندی‌ها', key: 'fav' });
    if (filters.priceMin || filters.priceMax) {
      const from = filters.priceMin ? fa(filters.priceMin) : '۰';
      const to = filters.priceMax ? fa(filters.priceMax) : '∞';
      chips.push({ label: `${from} تا ${to} تومان`, key: 'price' });
    }

    $('#activeChips').innerHTML = chips.map(c =>
      `<button class="shop-chip-active" data-chip-rm="${c.key}">${c.label}<svg width="12" height="12"><use href="#i-x"/></svg></button>`
    ).join('');
  }

  /* ── رندر نتایج ── */
  function render() {
    renderTitle();
    renderSidebar();
    renderActiveChips();

    const list = filterProducts();
    $('#resultCount').textContent = `${fa(list.length)} قطعه پیدا شد`;

    // صفحه‌بندی
    const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (filters.page > totalPages) filters.page = totalPages;
    const start = (filters.page - 1) * PER_PAGE;
    const pageItems = list.slice(start, start + PER_PAGE);

    if (!list.length) {
      $('#prodGrid').innerHTML = `
        <div class="empty">
          <h3>قطعه‌ای با این مشخصات پیدا نشد</h3>
          <p>فیلترها را تغییر دهید یا با کارشناسان ما تماس بگیرید.</p>
          <div class="row">
            <button class="btn btn-outline" type="button" id="clearAllInline">پاک کردن فیلترها</button>
            <a class="btn btn-primary" href="contact.html">تماس با کارشناس</a>
          </div>
        </div>`;
      $('#pagination').hidden = true;
    } else {
      $('#prodGrid').innerHTML = pageItems.map(card).join('');
      renderPagination(totalPages);
    }

    updateURL();
  }

  function renderPagination(total) {
    if (total <= 1) { $('#pagination').hidden = true; return; }
    $('#pagination').hidden = false;
    const cur = filters.page;
    const pages = [];
    pages.push(`<button class="shop-page-btn" data-page="${Math.max(1, cur - 1)}" ${cur === 1 ? 'disabled' : ''} aria-label="صفحه قبل">قبلی</button>`);
    for (let i = 1; i <= total; i++) {
      pages.push(`<button class="shop-page-btn ${i === cur ? 'is-active' : ''}" data-page="${i}">${fa(i)}</button>`);
    }
    pages.push(`<button class="shop-page-btn" data-page="${Math.min(total, cur + 1)}" ${cur === total ? 'disabled' : ''} aria-label="صفحه بعد">بعدی</button>`);
    $('#pagination').innerHTML = pages.join('');
  }

  /* ── ایونت‌ها ── */
  let qTimer;
  $('#filterQ').addEventListener('input', e => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      filters.q = e.target.value;
      filters.page = 1;
      render();
    }, 260);
  });

  document.addEventListener('change', e => {
    const name = e.target.name;
    if (name === 'fm-maker') {
      filters.maker = e.target.value;
      filters.model = ''; // reset مدل وقتی برند عوض می‌شود
      filters.page = 1;
      render();
    }
    else if (name === 'fm-model') {
      filters.model = e.target.value;
      filters.page = 1;
      render();
    }
    else if (name === 'fm-cat') {
      filters.cat = e.target.value;
      filters.page = 1;
      render();
    }
    else if (e.target.id === 'filterInStock') {
      filters.inStock = e.target.checked;
      filters.page = 1;
      render();
    }
    else if (e.target.id === 'filterFav') {
      filters.fav = e.target.checked;
      filters.page = 1;
      render();
    }
    else if (e.target.id === 'sortBy') {
      filters.sort = e.target.value;
      filters.page = 1;
      render();
    }
  });

  // بازه قیمت
  let priceTimer;
  const priceHandler = () => {
    clearTimeout(priceTimer);
    priceTimer = setTimeout(() => {
      filters.priceMin = $('#priceMin').value ? parseInt($('#priceMin').value, 10) : null;
      filters.priceMax = $('#priceMax').value ? parseInt($('#priceMax').value, 10) : null;
      filters.page = 1;
      render();
    }, 400);
  };
  $('#priceMin').addEventListener('input', priceHandler);
  $('#priceMax').addEventListener('input', priceHandler);

  // صفحه‌بندی و حذف چیپ و پاک کردن
  document.addEventListener('click', e => {
    const page = e.target.closest('[data-page]');
    if (page && !page.disabled) {
      filters.page = +page.dataset.page;
      render();
      $('#prodGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const chip = e.target.closest('[data-chip-rm]');
    if (chip) {
      const k = chip.dataset.chipRm;
      if (k === 'price') { filters.priceMin = null; filters.priceMax = null; }
      else if (k === 'inStock') filters.inStock = false;
      else if (k === 'fav') filters.fav = false;
      else filters[k] = '';
      filters.page = 1;
      render();
      return;
    }
    if (e.target.id === 'clearFilters' || e.target.id === 'clearAllInline') {
      filters = { q: '', maker: '', model: '', cat: '', priceMin: null, priceMax: null, inStock: false, fav: false, sort: 'relevance', page: 1 };
      render();
    }
  });

  // باز و بسته کردن سایدبار موبایل
  const filterToggle = $('#filterToggle');
  const filtersSide = $('#shopFilters');
  filterToggle.addEventListener('click', () => filtersSide.classList.toggle('is-open'));
  document.addEventListener('click', e => {
    if (e.target.closest('.close-filters') || e.target.id === 'applyFilters') {
      filtersSide.classList.remove('is-open');
    }
  });

  /* ── Boot ── */
  render();
})();
