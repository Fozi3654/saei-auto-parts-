/* ==========================================================================
   compare.js - مقایسه تا ۳ قطعه کنار هم
   ========================================================================== */
(function () {
  'use strict';

  if (!document.getElementById('cmpTable')) return;

  const { MAKERS, CATS, PRODUCTS, CAT_DEFAULTS } = window.SAEI;
  const { $, fa, toman, byId, store } = SAEI.helpers;
  const state = SAEI.state;

  const KEY = 'saei-compare';
  const MAX = 3;

  /* ── ids را از URL یا localStorage بخوان ── */
  const params = new URLSearchParams(location.search);
  let ids = [];
  if (params.get('ids')) {
    ids = params.get('ids').split(',').map(x => parseInt(x, 10)).filter(x => byId(x)).slice(0, MAX);
  } else {
    ids = store.get(KEY, []).filter(x => byId(x)).slice(0, MAX);
  }

  function save() {
    store.set(KEY, ids);
    // به‌روز URL
    if (ids.length) {
      history.replaceState(null, '', `?ids=${ids.join(',')}`);
    } else {
      history.replaceState(null, '', location.pathname);
    }
  }

  /* ── پر کردن منوی انتخاب ── */
  function renderPicker() {
    const avail = PRODUCTS.filter(p => !ids.includes(p.id));
    const picker = $('#cmpPicker');
    picker.innerHTML = '<option value="">یک قطعه انتخاب کنید…</option>' +
      avail.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    picker.disabled = ids.length >= MAX;
    $('#cmpAdd').disabled = ids.length >= MAX;
    if (ids.length >= MAX) {
      $('#cmpAdd').textContent = 'حداکثر ۳ قطعه';
    } else {
      $('#cmpAdd').innerHTML = '<svg width="16" height="16"><use href="#i-plus"/></svg>اضافه';
    }
  }

  /* ── رندر جدول مقایسه ── */
  function render() {
    renderPicker();
    const items = ids.map(byId).filter(Boolean);
    const empty = items.length === 0;
    $('#cmpEmpty').hidden = !empty;
    $('#cmpTableWrap').hidden = empty;
    if (empty) return;

    // ستون‌های خالی برای رسیدن به حداکثر ۳
    const slots = [...items];
    while (slots.length < MAX) slots.push(null);

    // سطرهای مشخصات
    const rowDefs = [
      { key: 'img', label: 'تصویر' },
      { key: 'code', label: 'کد فنی' },
      { key: 'maker', label: 'برند خودرو' },
      { key: 'cat', label: 'دسته‌بندی' },
      { key: 'models', label: 'خودروهای سازگار' },
      { key: 'price', label: 'قیمت' },
      { key: 'old', label: 'قیمت قبلی' },
      { key: 'stock', label: 'موجودی' },
      { key: 'warranty', label: 'گارانتی' },
      { key: 'origin', label: 'کشور سازنده' }
    ];

    const getCellValue = (p, key) => {
      if (!p) return '—';
      const def = CAT_DEFAULTS[p.cat] || {};
      const specs = def.specs || [];
      const getSpec = (k) => {
        const row = specs.find(([label]) => label === k);
        return row ? row[1] : null;
      };
      const isUni = p.maker === 'all';
      switch (key) {
        case 'img':      return `<img src="${p.img}" alt="${p.name}" width="120" height="120">`;
        case 'code':     return `<span class="ltr">${p.code}</span>`;
        case 'maker':    return isUni ? (p.brand || 'عمومی') : (MAKERS[p.maker] ? MAKERS[p.maker].name : '-');
        case 'cat':      return (CATS.find(c => c.id === p.cat) || {}).name || '-';
        case 'models':   return Array.isArray(p.models) ? p.models.join('، ') : (p.models || 'همه خودروها');
        case 'price':    return p.price ? `<b>${toman(p.price)}</b>` : `<span class="price-ask">استعلام قیمت</span>`;
        case 'old':      return p.old ? `<span class="old">${fa(p.old)} تومان</span>` : '—';
        case 'stock':
          if (p.stock === null || p.stock === undefined) return '<span class="muted">تماس بگیرید</span>';
          if (p.stock <= 0) return 'ناموجود';
          if (p.stock <= 3) return `<span class="warn">فقط ${fa(p.stock)}</span>`;
          return fa(p.stock) + ' عدد';
        case 'warranty': return getSpec('گارانتی') || '—';
        case 'origin':   return getSpec('کشور سازنده') || '—';
        default: return '—';
      }
    };

    // سر جدول: نام محصول و دکمه حذف
    const headerCols = slots.map((p, i) => {
      if (!p) return `<th class="cmp-add"><a href="shop.html" class="cmp-add-link"><svg width="20" height="20"><use href="#i-plus"/></svg>افزودن قطعه</a></th>`;
      return `
        <th class="cmp-col-head">
          <button class="cmp-remove" type="button" data-rm="${p.id}" aria-label="حذف">×</button>
          <a href="product.html?id=${p.id}" class="cmp-name">${p.name}</a>
        </th>
      `;
    }).join('');

    // سطرها
    const rowsHtml = rowDefs.map(rd => `
      <tr>
        <th>${rd.label}</th>
        ${slots.map(p => `<td>${getCellValue(p, rd.key)}</td>`).join('')}
      </tr>
    `).join('');

    // سطر خرید (یا استعلام)
    const buyRow = `
      <tr class="cmp-buy-row">
        <th></th>
        ${slots.map(p => {
          if (!p) return '<td></td>';
          if (!p.price) {
            const wa = (SAEI.CONTACT && SAEI.CONTACT.whatsapp) || '989179070541';
            const msg = encodeURIComponent(`سلام، قیمت و موجودی «${p.name}» (کد: ${p.code}) را می‌خواستم.`);
            return `<td><a class="btn btn-primary" href="https://wa.me/${wa}?text=${msg}" target="_blank" rel="noopener">استعلام قیمت</a></td>`;
          }
          return `<td><button class="btn btn-primary add" type="button" data-add="${p.id}"><svg width="16" height="16"><use href="#i-cart"/></svg>افزودن به سبد</button></td>`;
        }).join('')}
      </tr>
    `;

    $('#cmpTable').innerHTML = `
      <table>
        <thead>
          <tr>
            <th></th>
            ${headerCols}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          ${buyRow}
        </tbody>
      </table>
    `;
  }

  /* ── ایونت‌ها ── */
  $('#cmpAdd').addEventListener('click', () => {
    const v = parseInt($('#cmpPicker').value, 10);
    if (!v) return;
    if (ids.includes(v)) { SAEI.toast('این قطعه از قبل اضافه شده.', false); return; }
    if (ids.length >= MAX) { SAEI.toast(`حداکثر ${fa(MAX)} قطعه قابل مقایسه است.`, false); return; }
    ids.push(v);
    save();
    render();
  });

  $('#cmpClear').addEventListener('click', () => {
    ids = [];
    save();
    render();
  });

  document.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      ids = ids.filter(x => x !== +rm.dataset.rm);
      save();
      render();
    }
  });

  /* ── Boot ── */
  render();
})();
