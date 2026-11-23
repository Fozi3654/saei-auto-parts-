/* ==========================================================================
   data.js - داده‌های فروشگاه مبصر-ساعی
   ========================================================================== */
(function () {
  'use strict';

  window.SAEI = window.SAEI || {};

  /* ── برندهای خودرو (برای فایندر و دسته‌بندی) ── */
  SAEI.MAKERS = {
    ikco: {
      name: 'ایران‌خودرو',
      img: 'img/car-samand.webp',
      alt: 'سمند سفید',
      blurb: 'قطعات مصرفی و روغن‌های مناسب پژو ۲۰۶، ۴۰۵، پارس، سمند، دنا و رانا.',
      models: ['پژو ۲۰۶', 'پژو ۴۰۵', 'پژو پارس', 'سمند', 'دنا', 'رانا']
    },
    saipa: {
      name: 'سایپا',
      img: 'img/car-pride.webp',
      alt: 'پراید سفید',
      blurb: 'قطعات مصرفی و روغن‌های مناسب پراید، تیبا، ساینا، کوییک و شاهین.',
      models: ['پراید', 'تیبا', 'ساینا', 'کوییک', 'شاهین']
    }
  };

  /* ── دسته‌بندی‌ها (متناسب با محصولات واقعی فروشگاه) ── */
  SAEI.CATS = [
    { id: 'fluids', name: 'روغن و مایعات', desc: 'روغن ترمز، روغن موتور، ضدیخ', img: 'img/products/product-03.webp' },
    { id: 'spray',  name: 'اسپری و تمیزکننده', desc: 'اسپری داشبورد، پیچ، استارت، موتور شور', img: 'img/products/product-06.webp' },
    { id: 'grease', name: 'گریس و روانکار', desc: 'گریس‌های کاسپین و اترود در اندازه‌های مختلف', img: 'img/products/product-12.webp' },
    { id: 'light',  name: 'لامپ و روشنایی', desc: 'لامپ سه خار، یک کنتاکت، دو کنتاکت', img: 'img/products/product-16.webp' }
  ];

  SAEI.TAGS = {
    best: 'پرفروش',
    fast: 'ارسال فوری',
    genuine: 'تضمین اصالت',
    new: 'جدید',
    popular: 'محبوب'
  };

  /* ──
     ۱۸ محصول واقعی فروشگاه
     توضیح: قیمت‌ها هنوز مشخص نشده‌اند (null). تا تعیین قیمت، نمایش «استعلام قیمت»
     وقتی قیمت دریافت شد، فیلد price را پر کنید و priceStatus را حذف کنید
     ── */
  SAEI.PRODUCTS = [
    // روغن و مایعات
    { id: 1, name: 'روغن ترمز زرد فومن شیمی DOT 3', code: 'FS-BR-Y', maker: 'all', brand: 'فومن شیمی', models: 'همه خودروها',    cat: 'fluids', img: 'img/products/product-01.webp', price: null, stock: null, tags: ['popular', 'genuine'], desc: 'روغن ترمز زرد با استاندارد DOT 3، مناسب همه خودروهای ایران‌خودرو و سایپا. حجم و بسته‌بندی فومن شیمی.' },
    { id: 2, name: 'روغن ترمز آبی فومن شیمی DOT 4', code: 'FS-BR-B', maker: 'all', brand: 'فومن شیمی', models: 'همه خودروها',    cat: 'fluids', img: 'img/products/product-02.webp', price: null, stock: null, tags: ['best', 'genuine'],    desc: 'روغن ترمز آبی با استاندارد DOT 4 برای عملکرد بهتر در دمای بالا. مناسب خودروهای مدرن ایرانی.' },
    { id: 3, name: 'روغن موتور ۴ لیتری',             code: 'OIL-4L',  maker: 'all', brand: 'عمومی',       models: 'همه خودروها',    cat: 'fluids', img: 'img/products/product-03.webp', price: null, stock: null, tags: ['best', 'fast'],       desc: 'روغن موتور ۴ لیتری نیمه‌سینتتیک برای حفظ عملکرد و افزایش عمر موتور. طبق توصیه کارخانه خودرو تعویض شود.' },
    { id: 4, name: 'ضدیخ کاسپین',                    code: 'CSP-AF',  maker: 'all', brand: 'کاسپین',      models: 'همه خودروها',    cat: 'fluids', img: 'img/products/product-04.webp', price: null, stock: null, tags: ['popular'],            desc: 'ضدیخ مخصوص رادیاتور با فرمولاسیون کاسپین، مقاوم در برابر یخ‌زدگی و خوردگی. آماده استفاده.' },
    { id: 5, name: 'ضدیخ ایساکو',                    code: 'ISK-AF',  maker: 'all', brand: 'ایساکو',       models: 'همه خودروها',    cat: 'fluids', img: 'img/products/product-05.webp', price: null, stock: null, tags: ['genuine'],            desc: 'ضدیخ اصل ایساکو با تأیید سازنده خودرو. مناسب رادیاتور و سیستم خنک‌کاری همه خودروهای داخلی.' },

    // اسپری و تمیزکننده
    { id: 6, name: 'اسپری داشبورد',                   code: 'SPR-DB',  maker: 'all', brand: 'عمومی',       models: 'همه خودروها',    cat: 'spray',  img: 'img/products/product-06.webp', price: null, stock: null, tags: ['best'],               desc: 'اسپری برق و تمیزکننده داشبورد. محافظ از ترک‌خوردگی و رنگ‌پریدگی در برابر آفتاب.' },
    { id: 7, name: 'اسپری کاسپین',                    code: 'CSP-SPR', maker: 'all', brand: 'کاسپین',      models: 'همه خودروها',    cat: 'spray',  img: 'img/products/product-07.webp', price: null, stock: null, tags: ['popular'],            desc: 'اسپری چندمنظوره کاسپین برای روان‌کاری، تمیزکاری و محافظت از قطعات.' },
    { id: 8, name: 'اسپری پیچ (باز کردن پیچ‌های زنگ‌زده)', code: 'SPR-BLT', maker: 'all', brand: 'عمومی', models: 'همه خودروها', cat: 'spray', img: 'img/products/product-08.webp', price: null, stock: null, tags: ['fast'], desc: 'اسپری WD-۴۰ مانند برای باز کردن پیچ‌های زنگ‌زده و روغن‌کاری قطعات مکانیکی.' },
    { id: 9, name: 'اسپری استارت بنزین',              code: 'SPR-ST',  maker: 'all', brand: 'عمومی',       models: 'همه خودروها',    cat: 'spray',  img: 'img/products/product-09.webp', price: null, stock: null, tags: ['fast'],               desc: 'اسپری استارت برای راه‌اندازی موتور در هوای سرد یا پس از تعمیرات موتور.' },
    { id: 10, name: 'اسپری موتور شور',                code: 'SPR-WS',  maker: 'all', brand: 'عمومی',       models: 'همه خودروها',    cat: 'spray',  img: 'img/products/product-10.webp', price: null, stock: null, tags: [],                     desc: 'اسپری تمیزکننده بدنه و قطعات موتور. حلال چربی و گرد و غبار.' },
    { id: 11, name: 'اسپری لاستیک',                   code: 'SPR-TR',  maker: 'all', brand: 'عمومی',       models: 'همه خودروها',    cat: 'spray',  img: 'img/products/product-11.webp', price: null, stock: null, tags: ['popular'],            desc: 'اسپری محافظ و براق‌کننده لاستیک. حفظ انعطاف و رنگ مشکی.' },

    // گریس و روانکار
    { id: 12, name: 'گریس بزرگ کاسپین',               code: 'CSP-GR-L', maker: 'all', brand: 'کاسپین',     models: 'همه خودروها',    cat: 'grease', img: 'img/products/product-12.webp', price: null, stock: null, tags: ['best'],               desc: 'گریس چندمنظوره کاسپین در قوطی بزرگ، مناسب روانکاری جلوبندی و قطعات متحرک.' },
    { id: 13, name: 'گریس کوچک کاسپین',               code: 'CSP-GR-S', maker: 'all', brand: 'کاسپین',     models: 'همه خودروها',    cat: 'grease', img: 'img/products/product-13.webp', price: null, stock: null, tags: [],                     desc: 'گریس چندمنظوره کاسپین در اندازه کوچک برای مصرف خانگی.' },
    { id: 14, name: 'گریس بزرگ اترود',                code: 'ETR-GR-L', maker: 'all', brand: 'اترود',       models: 'همه خودروها',    cat: 'grease', img: 'img/products/product-14.webp', price: null, stock: null, tags: ['genuine'],            desc: 'گریس اترود در قوطی بزرگ. فرمولاسیون مقاوم به دمای بالا برای قطعات بیرینگ و جلوبندی.' },
    { id: 15, name: 'گریس کوچک اترود',                code: 'ETR-GR-S', maker: 'all', brand: 'اترود',       models: 'همه خودروها',    cat: 'grease', img: 'img/products/product-15.webp', price: null, stock: null, tags: [],                     desc: 'گریس اترود در اندازه کوچک برای مصرف نقطه‌ای.' },

    // لامپ و روشنایی
    { id: 16, name: 'لامپ سه خار (H4)',               code: 'BLB-H4',  maker: 'all', brand: 'عمومی',        models: 'همه خودروها',    cat: 'light',  img: 'img/products/product-16.webp', price: null, stock: null, tags: ['best', 'fast'],       desc: 'لامپ سه خار H4 برای چراغ جلوی انواع خودروهای ایرانی. نور بالا و نور پایین.' },
    { id: 17, name: 'لامپ یک کنتاکت',                 code: 'BLB-1C',  maker: 'all', brand: 'عمومی',        models: 'همه خودروها',    cat: 'light',  img: 'img/products/product-17.webp', price: null, stock: null, tags: ['popular'],            desc: 'لامپ یک کنتاکت برای چراغ ترمز، چراغ عقب و راهنما.' },
    { id: 18, name: 'لامپ دو کنتاکت',                 code: 'BLB-2C',  maker: 'all', brand: 'عمومی',        models: 'همه خودروها',    cat: 'light',  img: 'img/products/product-18.webp', price: null, stock: null, tags: [],                     desc: 'لامپ دو کنتاکت برای چراغ ترمز + چراغ عقب (یک لامپ، دو کارکرد).' }
  ];

  /* ── هات‌اسپات‌های روی عکس پژو ۴۰۵ ── */
  SAEI.SPOTS = [
    { x: 10, y: 51, pid: 16, label: 'لامپ و روشنایی' },
    { x: 30, y: 41, pid: 3,  label: 'روغن موتور' },
    { x: 60, y: 69, pid: 1,  label: 'روغن ترمز' },
    { x: 88, y: 61, pid: 14, label: 'گریس جلوبندی' }
  ];

  SAEI.YEARS = ['۱۴۰۵', '۱۴۰۴', '۱۴۰۳', '۱۴۰۲', '۱۴۰۱', '۱۴۰۰', '۱۳۹۹', '۱۳۹۸ و قبل‌تر'];

  /* ── توضیحات پیش‌فرض بر اساس دسته ── */
  SAEI.CAT_DEFAULTS = {
    fluids: {
      description: 'روغن‌ها و مایعات مصرفی خودرو برای حفظ عملکرد صحیح موتور، سیستم ترمز و رادیاتور ضروری هستند. استفاده از محصول اصل و تعویض به‌موقع، عمر خودرو را افزایش می‌دهد.',
      specs: [
        ['نوع', 'مایع مصرفی'],
        ['گارانتی', 'اصالت تضمین شده'],
        ['کشور سازنده', 'ایران'],
        ['دوره تعویض', 'طبق توصیه کارخانه خودرو'],
        ['نحوه نگهداری', 'دور از نور مستقیم و حرارت بالا']
      ]
    },
    spray: {
      description: 'اسپری‌های مراقبتی و تمیزکننده خودرو برای نگه‌داری منظم قطعات ضروری هستند. از خوردگی، زنگ‌زدگی و فرسایش جلوگیری می‌کنند.',
      specs: [
        ['نوع', 'اسپری قوطی'],
        ['گارانتی', 'اصالت تضمین شده'],
        ['کشور سازنده', 'ایران'],
        ['نحوه استفاده', 'قوطی را تکان دهید و از فاصله ۲۰ سانتی اسپری کنید'],
        ['نحوه نگهداری', 'دور از شعله و دمای بالای ۵۰ درجه']
      ]
    },
    grease: {
      description: 'گریس چندمنظوره برای روانکاری قطعات متحرک، جلوبندی، بیرینگ و اتصالات. مقاوم در برابر دمای بالا و رطوبت.',
      specs: [
        ['نوع', 'گریس لیتیوم'],
        ['گارانتی', 'اصالت تضمین شده'],
        ['کشور سازنده', 'ایران'],
        ['دمای کاری', 'تا ۱۲۰ درجه سانتی‌گراد'],
        ['کاربرد', 'جلوبندی، بیرینگ، اتصالات متحرک']
      ]
    },
    light: {
      description: 'لامپ‌های خودرو با سرپیچ‌های استاندارد ایرانی. شامل لامپ چراغ جلو (H4)، لامپ‌های چراغ عقب، ترمز و راهنما.',
      specs: [
        ['ولتاژ', '۱۲ ولت'],
        ['گارانتی', 'یک ماه تعویض در صورت نقص'],
        ['کشور سازنده', 'ایران / وارداتی'],
        ['عمر مفید', 'بسته به استفاده'],
        ['نحوه نصب', 'توسط مکانیک یا مطابق راهنمای خودرو']
      ]
    }
  };

  SAEI.SHIPPING_INFO = [
    { ico: 'truck', title: 'ارسال سریع تهران', desc: 'سفارش‌های ثبت‌شده تا ساعت ۱۴، همان روز ارسال می‌شوند.' },
    { ico: 'box',   title: 'ارسال به سراسر کشور', desc: 'با پست پیشتاز یا تیپاکس، ۲ تا ۴ روز کاری.' },
    { ico: 'shield', title: 'تضمین اصالت', desc: 'اگر قطعه با توصیف مغایرت داشت، وجه کامل بازگردانده می‌شود.' },
    { ico: 'return', title: 'امکان بازگشت کالا', desc: 'تا ۷ روز پس از تحویل، در صورت باز نشدن بسته.' }
  ];

  SAEI.PROVINCES = [
    'تهران', 'البرز', 'قم', 'مازندران', 'گیلان', 'اصفهان', 'فارس', 'خراسان رضوی',
    'آذربایجان شرقی', 'آذربایجان غربی', 'اردبیل', 'بوشهر', 'چهارمحال و بختیاری',
    'خراسان جنوبی', 'خراسان شمالی', 'خوزستان', 'زنجان', 'سمنان', 'سیستان و بلوچستان',
    'قزوین', 'کردستان', 'کرمان', 'کرمانشاه', 'کهگیلویه و بویراحمد', 'گلستان',
    'لرستان', 'مرکزی', 'هرمزگان', 'همدان', 'یزد', 'ایلام'
  ];

  SAEI.SHIPPING_METHODS = [
    { id: 'in-tehran',    name: 'پیک تهران (همان روز)', desc: 'ثبت تا ۱۴، تحویل همان روز؛ فقط داخل محدوده تهران.', price: 85000,  provinces: ['تهران'], eta: 'همان روز' },
    { id: 'post-express', name: 'پست پیشتاز',           desc: 'ارسال به سراسر کشور، ۲ تا ۴ روز کاری.',           price: 120000, provinces: null,       eta: '۲ تا ۴ روز کاری' },
    { id: 'tipax',        name: 'تیپاکس',                desc: 'بسته بزرگ یا سنگین؛ تحویل درب منزل. ۱ تا ۳ روز کاری.', price: 180000, provinces: null, eta: '۱ تا ۳ روز کاری' }
  ];

  SAEI.PAYMENT_METHODS = [
    { id: 'zarinpal', name: 'پرداخت آنلاین (زرین‌پال)', desc: 'پرداخت امن با تمام کارت‌های عضو شتاب.',           ico: 'card', enabled: true },
    { id: 'pod',      name: 'پرداخت در محل (فقط تهران)', desc: 'هنگام تحویل بسته، پول نقد یا کارتخوان.',          ico: 'cash', enabled: false, restrictedTo: ['تهران'] }
  ];

  SAEI.COUPONS = {
    'SAEI10':    { percent: 10, max: 300000, desc: '۱۰٪ تخفیف، حداکثر ۳۰۰ هزار تومان' },
    'MOBASSER':  { percent: 15, max: 500000, desc: '۱۵٪ تخفیف مبصر، حداکثر ۵۰۰ هزار تومان' },
    'FIRST50':   { fixed: 50000, desc: '۵۰٬۰۰۰ تومان تخفیف برای خرید اول' }
  };

  /* ── اطلاعات تماس واقعی فروشگاه ── */
  SAEI.CONTACT = {
    phone: '071-5251-3239',                  // تلفن ثابت مغازه
    mobile: '0917 907 0541',                  // موبایل (همان واتساپ)
    whatsapp: '989179070541',                 // فرمت بین‌المللی برای wa.me
    email: 'info@saei-parts.ir',
    address: 'اوز، خیابان شهید رجایی، دوراهی کوره، لوازم یدکی پیکان خودرو',
    hours: 'شنبه تا چهارشنبه ۸ تا ۱۳ و ۱۶ تا ۲۰ | پنجشنبه ۸ تا ۱۳',
    hoursShort: 'شنبه تا چهارشنبه ۸-۱۳ و ۱۶-۲۰ · پنجشنبه ۸-۱۳',
    hoursFun: 'پنجشنبه‌ها بعد از ظهر تعطیله، تیم ما به تفریح رفته 😊',
    owner: 'آقای فرخ مبصر',
    salesManager: 'آقای محمدرسول ساعی'
  };
})();
