/* ==========================================================================
   product.js - منطق صفحه جزئیات محصول
   وابسته به: data.js، app-shared.js
   ========================================================================== */
(function () {
  'use strict';

  const { MAKERS, CATS, TAGS, PRODUCTS, YEARS, CAT_DEFAULTS } = window.SAEI;
  const { $, $$, fa, toman, byId, store } = SAEI.helpers;
  const state = SAEI.state;

  // اگر این صفحه نیست، خارج شو
  if (!$('#pdName')) return;

  /* ── خواندن id محصول از آدرس ── */
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'), 10);
  const p = id ? byId(id) : null;

  if (!p) {
    $('#pdNotFound').hidden = false;
    document.title = 'محصول پیدا نشد | محمدرسول ساعی';
    return;
  }

  /* ── متا داده ── */
  document.title = `${p.name} | محمدرسول ساعی`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    const priceTxt = p.price ? toman(p.price).replace(/<[^>]+>/g, '') : 'استعلام قیمت';
    metaDesc.content = `${p.name} — کد فنی ${p.code}. ${priceTxt}. ارسال سریع از فروشگاه مبصر-ساعی.`;
  }

  const cat = CATS.find(c => c.id === p.cat);
  const isUniversal = p.maker === 'all';
  const maker = isUniversal ? { name: p.brand || 'همه خودروها', models: [] } : (MAKERS[p.maker] || { name: '-', models: [] });
  const modelsList = Array.isArray(p.models) ? p.models : [];
  const modelsLabel = Array.isArray(p.models) ? p.models.join('، ') : (p.models || 'همه خودروها');
  const catDefault = CAT_DEFAULTS[p.cat] || {};

  /* ── Breadcrumb ── */
  $('#breadcrumb').innerHTML = `
    <a href="index.html">خانه</a>
    <span class="sep">/</span>
    <a href="index.html#products">فروشگاه</a>
    <span class="sep">/</span>
    <a href="index.html#products" data-cat="${p.cat}">${cat ? cat.name : ''}</a>
    <span class="sep">/</span>
    <span class="cur">${p.name}</span>
  `;

  /* ── نشان دادن بخش‌های اصلی ── */
  $('#pdMain').hidden = false;
  $('#pdTabs').hidden = false;
  $('#pdRelated').hidden = false;

  /* ── گالری ── */
  // تا وقتی کاربر عکس‌های واقعی چندگانه بدهد، همان عکس اصلی چند بار استفاده می‌شود
  // در آینده p.gallery = ['img1.webp', 'img2.webp', ...] جایگزین می‌شود
  const gallery = p.gallery && p.gallery.length ? p.gallery : [p.img, p.img, p.img, p.img];

  const mainImg = $('#pdMainImg');
  mainImg.src = gallery[0];
  mainImg.alt = p.name;

  $('#pdTags').innerHTML = p.tags.map(t => `<span class="tag ${t}">${TAGS[t]}</span>`).join('');

  $('#pdThumbs').innerHTML = gallery.map((g, i) => `
    <button class="pd-thumb${i === 0 ? ' is-active' : ''}" type="button" data-thumb="${i}" aria-label="عکس ${fa(i+1)}">
      <img src="${g}" alt="" width="100" height="100" loading="lazy">
    </button>
  `).join('');

  let activeThumb = 0;
  $('#pdThumbs').addEventListener('click', e => {
    const btn = e.target.closest('[data-thumb]');
    if (!btn) return;
    const i = +btn.dataset.thumb;
    activeThumb = i;
    mainImg.src = gallery[i];
    $$('.pd-thumb').forEach((el, idx) => el.classList.toggle('is-active', idx === i));
  });

  /* ── Lightbox ── */
  const lb = $('#pdLightbox');
  const lbImg = $('#pdLbImg');
  const openLB = () => {
    lbImg.src = gallery[activeThumb];
    lbImg.alt = p.name;
    lb.showModal();
  };
  $('#pdZoom').addEventListener('click', openLB);
  mainImg.addEventListener('click', openLB);
  $('#pdLbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  /* ── اطلاعات ── */
  const catTxt = cat ? cat.name : '';
  $('#pdCat').textContent = isUniversal
    ? (p.brand ? `${p.brand} · ${catTxt}` : catTxt)
    : `${maker.name} · ${catTxt}`;
  $('#pdName').textContent = p.name;
  $('#pdCode').textContent = p.code;

  // امتیاز نمادین (برای هر محصول ثابت است، بر اساس id)
  const rating = (4.0 + ((p.id * 7) % 10) / 10).toFixed(1);
  const reviewCount = 8 + (p.id * 13) % 42;
  const stars = Math.round(parseFloat(rating));
  $('#pdRating').innerHTML = `
    <span class="pd-stars" aria-hidden="true">${[1,2,3,4,5].map(s => `<svg width="16" height="16" class="${s <= stars ? 'on' : ''}"><use href="#i-star"/></svg>`).join('')}</span>
    <span class="pd-rate">${fa(rating)}</span>
    <span class="pd-reviews">(${fa(reviewCount)} نظر)</span>
  `;

  /* ── قیمت ── */
  if (p.price) {
    $('#pdPrice').innerHTML = toman(p.price);
    if (p.old) {
      $('#pdOld').textContent = fa(p.old);
      $('#pdOld').hidden = false;
      const off = Math.round((1 - p.price / p.old) * 100);
      $('#pdOff').textContent = `٪${fa(off)}`;
      $('#pdOff').hidden = false;
    }
  } else {
    $('#pdPrice').innerHTML = '<span class="price-ask">استعلام قیمت</span>';
  }

  /* ── موجودی ── */
  const stockEl = $('#pdStock');
  if (p.stock === null || p.stock === undefined) {
    stockEl.className = 'stock pending';
    stockEl.innerHTML = `<i></i>برای اطلاع از موجودی با ما تماس بگیرید`;
  } else if (p.stock <= 0) {
    stockEl.className = 'stock out';
    stockEl.innerHTML = `<i></i>فعلاً ناموجود`;
  } else if (p.stock <= 3) {
    stockEl.className = 'stock low';
    stockEl.innerHTML = `<i></i>فقط ${fa(p.stock)} عدد در انبار باقی مانده`;
  } else {
    stockEl.className = 'stock';
    stockEl.innerHTML = `<i></i>${fa(p.stock)} عدد موجود · آماده ارسال`;
  }

  /* ── سازگاری با خودرو ── */
  const pdcMaker = $('#pdcMaker');
  const pdcModel = $('#pdcModel');
  const pdcYear = $('#pdcYear');
  pdcYear.innerHTML = YEARS.map(y => `<option>${y}</option>`).join('');

  const fillPdcModels = (mk, sel) => {
    pdcModel.innerHTML = MAKERS[mk].models.map(m => `<option${m === sel ? ' selected' : ''}>${m}</option>`).join('');
  };
  if (state.car) {
    pdcMaker.value = state.car.maker;
    fillPdcModels(state.car.maker, state.car.model);
    if (state.car.year) pdcYear.value = state.car.year;
  } else {
    fillPdcModels('ikco');
  }
  pdcMaker.addEventListener('change', () => fillPdcModels(pdcMaker.value));

  // بررسی خودکار اگر خودرو انتخاب شده
  function checkCompat() {
    const result = $('#pdCompatResult');
    const mk = pdcMaker.value;
    const md = pdcModel.value;
    const yr = pdcYear.value;

    // محصولات عمومی با همه خودروها سازگارند
    if (isUniversal) {
      result.hidden = false;
      result.className = 'pd-compat-result fit';
      result.innerHTML = `<svg width="18" height="18"><use href="#i-check"/></svg>این محصول عمومی است و با <b>${md}${yr ? ' سال ' + yr : ''}</b> و همه خودروها سازگار است.`;
      state.car = { maker: mk, model: md, year: yr };
      store.set('saei-car', state.car);
      return;
    }

    if (p.maker !== mk) {
      result.hidden = false;
      result.className = 'pd-compat-result not-fit';
      result.innerHTML = `<svg width="18" height="18"><use href="#i-x"/></svg>این قطعه برای <b>${MAKERS[mk].name}</b> سازگار نیست. مخصوص <b>${maker.name}</b> است.`;
      return;
    }
    if (modelsList.includes(md)) {
      result.hidden = false;
      result.className = 'pd-compat-result fit';
      result.innerHTML = `<svg width="18" height="18"><use href="#i-check"/></svg>عالی! این قطعه با <b>${md}${yr ? ' سال ' + yr : ''}</b> کاملاً سازگار است.`;
      state.car = { maker: mk, model: md, year: yr };
      store.set('saei-car', state.car);
    } else {
      result.hidden = false;
      result.className = 'pd-compat-result not-fit';
      result.innerHTML = `<svg width="18" height="18"><use href="#i-x"/></svg>این قطعه برای <b>${md}</b> نیست. مناسب: <b>${modelsLabel}</b>`;
    }
  }
  $('#pdCheck').addEventListener('click', checkCompat);
  if (state.car && state.car.model) {
    setTimeout(checkCompat, 100);
  }

  /* ── تعداد و افزودن به سبد / استعلام قیمت ── */
  let qty = 1;
  const qtyEl = $('#pdQty');
  const maxQty = p.stock || 10;
  $('#pdQtyInc').addEventListener('click', () => { qty = Math.min(maxQty, qty + 1); qtyEl.textContent = fa(qty); });
  $('#pdQtyDec').addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyEl.textContent = fa(qty); });

  if (p.price) {
    $('#pdAdd').addEventListener('click', () => {
      SAEI.addToCart(p.id, qty);
      const btn = $('#pdAdd');
      btn.classList.add('done');
      const prev = btn.innerHTML;
      btn.textContent = '✓ به سبد اضافه شد';
      setTimeout(() => { btn.classList.remove('done'); btn.innerHTML = prev; }, 1500);
    });
  } else {
    // قیمت مشخص نیست → دکمه را به استعلام قیمت از واتساپ تبدیل کن
    const btn = $('#pdAdd');
    const wa = (SAEI.CONTACT && SAEI.CONTACT.whatsapp) || '989179070541';
    const msg = encodeURIComponent(`سلام، قیمت و موجودی «${p.name}» (کد: ${p.code}) را می‌خواستم.`);
    btn.outerHTML = `<a class="btn btn-primary pd-add" href="https://wa.me/${wa}?text=${msg}" target="_blank" rel="noopener" id="pdAdd"><svg width="17" height="17"><use href="#i-chat"/></svg>استعلام قیمت از واتساپ</a>`;
    // پنهان کردن کنترل تعداد چون سبد غیرفعال است
    const qtyWrap = qtyEl && qtyEl.parentElement;
    if (qtyWrap) qtyWrap.style.display = 'none';
  }

  /* ── علاقه‌مندی ── */
  const favBtn = $('#pdFav');
  favBtn.setAttribute('aria-pressed', state.favs.has(p.id));
  favBtn.addEventListener('click', () => {
    state.favs.has(p.id) ? state.favs.delete(p.id) : state.favs.add(p.id);
    store.set('saei-favs', [...state.favs]);
    favBtn.setAttribute('aria-pressed', state.favs.has(p.id));
    SAEI.toast(state.favs.has(p.id) ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد', false);
  });

  /* ── کپی کد فنی ── */
  $('#pdCopy').addEventListener('click', () => {
    const done = () => {
      $('#pdCopy').textContent = '✓ کپی شد';
      setTimeout(() => $('#pdCopy').textContent = 'کپی', 1500);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(p.code).then(done).catch(done);
    } else {
      done();
    }
  });

  /* ── اشتراک‌گذاری ── */
  $('#pdShare').addEventListener('click', async () => {
    const url = location.href;
    const shareData = { title: p.name, text: `${p.name} - ${p.code}`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      SAEI.toast('لینک محصول کپی شد', false);
    }
  });

  /* ── تب‌ها ── */
  // پنل توضیحات (ترجیح: توضیح محصول خاص، در غیر این صورت توضیح دسته)
  const desc = p.desc || catDefault.description || 'توضیحات این محصول به‌زودی تکمیل می‌شود.';
  $('#pdPanelDesc').innerHTML = `
    <p>${desc}</p>
    <ul class="pd-bullets">
      <li><svg width="16" height="16"><use href="#i-check"/></svg>بسته‌بندی مطمئن برای ارسال</li>
      <li><svg width="16" height="16"><use href="#i-check"/></svg>فاکتور رسمی همراه بسته</li>
      <li><svg width="16" height="16"><use href="#i-check"/></svg>گارانتی اصالت فروشگاه مبصر-ساعی</li>
      <li><svg width="16" height="16"><use href="#i-check"/></svg>مشاوره تخصصی قبل از خرید</li>
    </ul>
  `;

  // پنل مشخصات فنی
  const specs = catDefault.specs || [['کد فنی', p.code]];
  const allSpecs = [
    ['نام محصول', p.name],
    ['کد فنی', p.code],
    isUniversal ? ['برند محصول', p.brand || 'عمومی'] : ['برند خودرو', maker.name],
    ['خودروهای سازگار', modelsLabel],
    ['دسته‌بندی', cat ? cat.name : '-'],
    ...specs
  ];
  $('#pdPanelSpecs').innerHTML = `
    <table class="pd-specs">
      <tbody>
        ${allSpecs.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
      </tbody>
    </table>
  `;

  // پنل تطابق خودرو
  const fitBody = isUniversal
    ? `<p>این محصول <b>عمومی</b> است و با <b>همه خودروهای سواری</b> (ایران‌خودرو و سایپا) سازگار است.</p>
       <div class="pd-fit-models">
         <span class="pd-fit-chip"><svg width="14" height="14"><use href="#i-check"/></svg>همه مدل‌های ایران‌خودرو</span>
         <span class="pd-fit-chip"><svg width="14" height="14"><use href="#i-check"/></svg>همه مدل‌های سایپا</span>
       </div>`
    : `<p>این قطعه برای مدل‌های زیر از <b>${maker.name}</b> سازگار است:</p>
       <div class="pd-fit-models">
         ${modelsList.map(m => `<span class="pd-fit-chip"><svg width="14" height="14"><use href="#i-check"/></svg>${m}</span>`).join('')}
       </div>`;
  $('#pdPanelFit').innerHTML = `
    ${fitBody}
    <p class="pd-fit-note">
      اگر مدل خودروی شما در لیست نیست یا شک دارید، کد فنی قطعه فعلی خودروی خود را به کارشناسان ما بفرستید تا بهترین گزینه را معرفی کنند.
    </p>
    <a class="btn btn-primary" href="contact.html">
      <svg width="16" height="16"><use href="#i-chat"/></svg>
      مشاوره رایگان
    </a>
  `;

  // پنل نظرات (دمو - تا وقتی سیستم نظرات واقعی اضافه شود)
  const demoReviews = [
    { name: 'محمد ر.', rating: 5, date: '۱۴۰۵/۰۷/۱۲', text: 'کیفیت عالی و ارسال سریع. دقیقاً همان کد فنی خودروم بود.' },
    { name: 'علی ک.', rating: 4, date: '۱۴۰۵/۰۶/۲۸', text: 'بسته‌بندی خوب، قیمت مناسب. فقط کمی زود رسید که دمی رو دیر دیدم.' },
    { name: 'حسین م.', rating: 5, date: '۱۴۰۵/۰۵/۱۸', text: 'دومین باره که از اینجا خرید می‌کنم. مطمئن و حرفه‌ای.' }
  ];
  $('#pdPanelReviews').innerHTML = `
    <div class="pd-reviews-head">
      <div>
        <div class="pd-reviews-avg">${fa(rating)} <small>از ۵</small></div>
        <div class="pd-stars big" aria-hidden="true">${[1,2,3,4,5].map(s => `<svg width="20" height="20" class="${s <= stars ? 'on' : ''}"><use href="#i-star"/></svg>`).join('')}</div>
        <p>${fa(reviewCount)} نظر ثبت شده</p>
      </div>
      <button class="btn btn-outline" type="button" id="pdWriteReview">ثبت نظر شما</button>
    </div>
    <div class="pd-reviews-list">
      ${demoReviews.map(r => `
        <div class="pd-review">
          <div class="pd-review-top">
            <b>${r.name}</b>
            <span class="pd-stars" aria-label="${r.rating} از ۵">${[1,2,3,4,5].map(s => `<svg width="14" height="14" class="${s <= r.rating ? 'on' : ''}"><use href="#i-star"/></svg>`).join('')}</span>
            <time>${r.date}</time>
          </div>
          <p>${r.text}</p>
        </div>
      `).join('')}
    </div>
  `;
  const writeBtn = document.getElementById('pdWriteReview');
  if (writeBtn) writeBtn.addEventListener('click', () => SAEI.toast('ثبت نظر پس از راه‌اندازی حساب کاربری فعال می‌شود.', false));

  /* ── سوئیچ تب ── */
  $('#pdTabsHead').addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    const tab = btn.dataset.tab;
    $$('.pd-tab').forEach(t => {
      const active = t.dataset.tab === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
    });
    $$('.pd-panel').forEach(pn => pn.classList.toggle('is-active', pn.dataset.panel === tab));
  });

  /* ── محصولات مرتبط ── */
  // محصولات با همان دسته یا همان خودروساز (به جز خودش)
  const related = PRODUCTS
    .filter(x => x.id !== p.id && (x.cat === p.cat || x.maker === p.maker))
    .slice(0, 4);
  // اگر cardHTML توسط app.js تعریف نشده، تابع ساده‌تری بسازیم
  const relCard = (prod) => {
    const off = prod.old ? Math.round((1 - prod.price / prod.old) * 100) : 0;
    const href = `product.html?id=${prod.id}`;
    return `
      <article class="prod">
        <a class="prod-media" href="${href}" aria-label="${prod.name}">
          <img src="${prod.img}" alt="${prod.name}" loading="lazy" width="640" height="640">
          <span class="tags">${prod.tags.map(t => `<span class="tag ${t}">${TAGS[t]}</span>`).join('')}</span>
          <span class="maker-chip">${MAKERS[prod.maker].name}</span>
        </a>
        <button class="fav" type="button" data-fav="${prod.id}" aria-pressed="${state.favs.has(prod.id)}" aria-label="علاقه‌مندی"><svg width="18" height="18" fill="none"><use href="#i-heart"/></svg></button>
        <div class="prod-body">
          <div class="prod-code">کد فنی: <span class="ltr">${prod.code}</span></div>
          <h3><a href="${href}">${prod.name}</a></h3>
          <span class="stock ${prod.stock <= 3 ? 'low' : ''}"><i></i>${prod.stock <= 3 ? `فقط ${fa(prod.stock)} عدد` : 'موجود'}</span>
          <div class="price-row">
            <span class="price">${toman(prod.price)}</span>
            ${prod.old ? `<span class="old">${fa(prod.old)}</span><span class="off">٪${fa(off)}</span>` : ''}
          </div>
          <button class="btn btn-primary add" type="button" data-add="${prod.id}"><svg width="16" height="16"><use href="#i-cart"/></svg>افزودن</button>
        </div>
      </article>`;
  };
  $('#pdRelatedGrid').innerHTML = related.length
    ? related.map(relCard).join('')
    : `<p style="color:var(--fg-muted)">محصول مرتبطی یافت نشد.</p>`;
})();
