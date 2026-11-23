/* ==========================================================================
   login.js - جریان ورود / ثبت‌نام با OTP (دمو)
   در نسخه واقعی: ارسال/تأیید OTP با سرویس کاوه‌نگار
   ========================================================================== */
(function () {
  'use strict';

  if (!document.getElementById('phoneForm')) return;

  const { $, $$, fa, store } = SAEI.helpers;

  // اگر از قبل وارد شده، مستقیم به account برو
  if (SAEI.auth.isLoggedIn()) {
    location.replace('account.html');
    return;
  }

  const DEMO_OTP = '1234'; // کد پیش‌فرض دمو
  let currentPhone = '';
  let resendTimer = 0;
  let timerInterval = null;

  /* ── نمایش هر مرحله ── */
  function showStep(name) {
    $$('.auth-step').forEach(s => s.classList.toggle('is-active', s.dataset.step === name));
    // فوکوس روی اولین ورودی
    setTimeout(() => {
      const first = $('.auth-step.is-active input');
      if (first) first.focus();
    }, 100);
  }

  /* ── اعتبارسنجی موبایل ── */
  function normPhone(p) {
    return (p || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\s|-/g, '');
  }
  function validPhone(p) {
    return /^09\d{9}$/.test(normPhone(p));
  }

  /* ── تایمر ارسال مجدد ── */
  function startResendTimer() {
    resendTimer = 60;
    const btn = $('#resendOtp');
    const txt = $('#resendText');
    btn.disabled = true;
    btn.classList.add('is-timing');
    const tick = () => {
      $('#resendTimer').textContent = fa(resendTimer);
      resendTimer--;
      if (resendTimer < 0) {
        clearInterval(timerInterval);
        btn.disabled = false;
        btn.classList.remove('is-timing');
        txt.textContent = 'ارسال مجدد کد';
      }
    };
    tick();
    timerInterval = setInterval(tick, 1000);
  }

  /* ── مرحله ۱: ارسال شماره ── */
  $('#phoneForm').addEventListener('submit', e => {
    e.preventDefault();
    const phone = normPhone($('#authPhone').value);
    if (!validPhone(phone)) {
      SAEI.toast('شماره موبایل معتبر نیست (مثلاً ۰۹۱۷۹۰۷۰۵۴۱).', false);
      return;
    }
    currentPhone = phone;
    $('#otpPhoneDisplay').textContent = phone;

    // شبیه‌سازی ارسال پیامک
    const btn = $('#phoneForm button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'در حال ارسال کد...';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'ارسال کد تأیید';
      showStep('otp');
      startResendTimer();
      SAEI.toast(`کد تأیید به ${phone} ارسال شد (دمو: ${DEMO_OTP})`, false);
    }, 900);
  });

  /* ── مرحله ۲: ورودی‌های OTP ── */
  const otpInputs = $$('.auth-otp-digit');
  otpInputs.forEach((input, i) => {
    input.addEventListener('input', e => {
      // فقط رقم
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      // رفتن به بعدی
      if (input.value && i < otpInputs.length - 1) {
        otpInputs[i + 1].focus();
      }
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !input.value && i > 0) {
        otpInputs[i - 1].focus();
      }
    });
    input.addEventListener('paste', e => {
      e.preventDefault();
      const txt = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
      txt.split('').forEach((d, j) => {
        if (otpInputs[j]) otpInputs[j].value = d;
      });
      const last = Math.min(txt.length, 4) - 1;
      if (last >= 0) otpInputs[Math.min(last + 1, 3)].focus();
    });
  });

  $('#otpForm').addEventListener('submit', e => {
    e.preventDefault();
    const code = otpInputs.map(i => i.value).join('');
    if (code.length !== 4) {
      SAEI.toast('لطفاً ۴ رقم کد تأیید را کامل وارد کنید.', false);
      return;
    }
    // در دمو، هر ۴ رقمی پذیرفته می‌شود
    // در نسخه واقعی، کد با سرور کاوه‌نگار تأیید می‌شود
    const existingUser = checkExistingUser(currentPhone);
    if (existingUser) {
      // کاربر موجود - ورود مستقیم
      SAEI.auth.login(existingUser);
      finishLogin();
    } else {
      // کاربر جدید - رفتن به مرحله تکمیل اطلاعات
      showStep('profile');
    }
  });

  function checkExistingUser(phone) {
    // در دمو، تاریخچه کاربران در localStorage است
    const users = store.get('saei-users', []);
    return users.find(u => u.phone === phone);
  }

  /* ── تغییر شماره ── */
  $('#changePhone').addEventListener('click', () => {
    clearInterval(timerInterval);
    showStep('phone');
    otpInputs.forEach(i => i.value = '');
  });

  /* ── ارسال مجدد ── */
  $('#resendOtp').addEventListener('click', () => {
    if ($('#resendOtp').disabled) return;
    startResendTimer();
    SAEI.toast(`کد جدید به ${currentPhone} ارسال شد (دمو: ${DEMO_OTP})`, false);
  });

  /* ── مرحله ۳: تکمیل پروفایل ── */
  $('#profileForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#authName').value.trim();
    const email = $('#authEmail').value.trim();
    if (!name) {
      SAEI.toast('لطفاً نام و نام خانوادگی خود را وارد کنید.', false);
      return;
    }
    const user = { phone: currentPhone, name, email };
    // ثبت در لیست کاربران (برای دفعات بعد)
    const users = store.get('saei-users', []);
    users.push(user);
    store.set('saei-users', users);
    // ورود
    SAEI.auth.login(user);
    finishLogin();
  });

  function finishLogin() {
    showStep('done');
    // انتقال خودکار پس از ۱.۲ ثانیه
    setTimeout(() => {
      const redirect = new URLSearchParams(location.search).get('redirect') || 'account.html';
      location.replace(redirect);
    }, 1200);
  }
})();
