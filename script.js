/**
 * SCRIPT.JS - Simple Gateway Redirect Engine
 * 
 * Bertanggung jawab atas:
 * 1. Menghidrasi URL referral (DAFTAR) dan LOGIN dari config.js
 * 2. Meneruskan parameter UTM tanpa merusak link rujukan tujuan
 * 3. Mengisi informasi teks & gambar banner secara dinamis
 * 4. Hook pelacakan klik (analytics event dispatcher)
 */

(function () {
  'use strict';

  /**
   * Helper: Membangun URL tujuan dengan menggabungkan query param UTM dari pengunjung
   * @param {string} baseUrl - URL tujuan dari config.js
   * @param {string[]} allowedParams - Daftar parameter yang diizinkan untuk diteruskan
   * @returns {string} URL lengkap yang telah digabungkan dengan UTM
   */
  function buildForwardedUrl(baseUrl, allowedParams) {
    if (!baseUrl) return '#';

    try {
      const targetUrl = new URL(baseUrl, window.location.href);
      const currentSearchParams = new URLSearchParams(window.location.search);

      if (Array.isArray(allowedParams)) {
        allowedParams.forEach(function (param) {
          if (currentSearchParams.has(param)) {
            const paramVal = currentSearchParams.get(param);
            if (paramVal !== null && paramVal.trim() !== '') {
              targetUrl.searchParams.set(param, paramVal.trim());
            }
          }
        });
      }

      return targetUrl.toString();
    } catch (e) {
      console.warn('[Redirect Engine] Gagal mem-parse URL, menggunakan link default:', e);
      return baseUrl;
    }
  }

  /**
   * Hidrasi link dan elemen tampilan dari APP_CONFIG
   */
  function hydrateFromConfig() {
    if (typeof window.APP_CONFIG === 'undefined') {
      console.info('[Redirect Engine] APP_CONFIG tidak ditemukan. Menggunakan link fallback HTML.');
      return;
    }

    const config = window.APP_CONFIG;

    // 1. Hitung URL Referral final (dengan UTM forwarding jika aktif)
    let finalReferralUrl = config.urls && config.urls.referralUrl ? config.urls.referralUrl : '';
    if (config.tracking && config.tracking.forwardUtmParams) {
      finalReferralUrl = buildForwardedUrl(finalReferralUrl, config.tracking.allowedParams);
    }

    const finalLoginUrl = config.urls && config.urls.loginUrl ? config.urls.loginUrl : '';

    // 2. Set href pada tombol tindakan
    const referralLinks = document.querySelectorAll('[data-target="referral"]');
    referralLinks.forEach(function (el) {
      if (finalReferralUrl) {
        el.setAttribute('href', finalReferralUrl);
      }
    });

    const loginLinks = document.querySelectorAll('[data-target="login"]');
    loginLinks.forEach(function (el) {
      if (finalLoginUrl) {
        el.setAttribute('href', finalLoginUrl);
      }
    });

    // 3. Set gambar Logo & Banner jika ditentukan di config
    if (config.brand) {
      const logoEl = document.getElementById('brandLogo');
      if (logoEl && config.brand.logoImage) {
        logoEl.src = config.brand.logoImage;
        if (config.brand.name) logoEl.alt = config.brand.name;
      }

      const bannerEl = document.getElementById('promoBanner');
      if (bannerEl && config.brand.bannerImage) {
        bannerEl.src = config.brand.bannerImage;
      }

      // Teks dinamis
      if (config.brand.welcomeText) {
        document.querySelectorAll('[data-bind="welcomeText"]').forEach(function (el) {
          el.textContent = config.brand.welcomeText;
        });
      }

      if (config.brand.name) {
        document.querySelectorAll('[data-bind="brandName"]').forEach(function (el) {
          el.textContent = config.brand.name;
        });
      }

      if (config.brand.footerCredit) {
        document.querySelectorAll('[data-bind="footerCredit"]').forEach(function (el) {
          el.textContent = config.brand.footerCredit;
        });
      }
    }
  }

  /**
   * Setup pelacakan klik (Analytics Hook)
   */
  function setupClickTracking() {
    document.addEventListener('click', function (event) {
      const target = event.target.closest('[data-target]');
      if (!target) return;

      const targetType = target.getAttribute('data-target');
      const destinationUrl = target.getAttribute('href');

      // Dispatch event kustom untuk extensibility
      const trackingEvent = new CustomEvent('landing:cta_click', {
        bubbles: true,
        cancelable: true,
        detail: {
          type: targetType,
          url: destinationUrl,
          timestamp: new Date().toISOString()
        }
      });
      target.dispatchEvent(trackingEvent);

      // Support dataLayer jika menggunakan Google Tag Manager
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: 'redirect_cta_click',
          target_type: targetType,
          destination_url: destinationUrl
        });
      }
    });
  }

  /**
   * Update Tahun Hak Cipta Secara Otomatis
   */
  function updateCopyrightYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear().toString();
    }
  }

  // Jalankan inisialisasi saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    hydrateFromConfig();
    setupClickTracking();
    updateCopyrightYear();
  }
})();
