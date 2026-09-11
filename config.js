/**
 * CONFIG.JS - Single Source of Truth (SSOT)
 * 
 * Pengaturan terpusat untuk Web Redirect / Gateway.
 * Cukup edit file ini untuk memperbarui link referral (DAFTAR),
 * link LOGIN, gambar banner, atau nama brand.
 */

const APP_CONFIG = {
  // --- INFORMASI BRAND & TAMPILAN ---
  brand: {
    name: "ROYAL123",
    landingDomain: "https://rutofi.store",
    welcomeText: "SELAMAT DATANG DI",
    logoImage: "assets/logo.png",
    bannerImage: "assets/banner.png",
    footerCredit: "SEO NGUYENSU"
  },

  // --- TAUTAN TUJUAN (REDIRECT TARGETS) ---
  urls: {
    // Tombol DAFTAR (Link Referral / Afiliasi Anda)
    referralUrl: "https://websiteutama.com/register?ref=KODE_REFERRAL_ANDA",

    // Tombol LOGIN (Link Login Resmi)
    loginUrl: "https://linkjp.lol/royal123"
  },

  // --- PENGATURAN TRACKING & UTM FORWARDING ---
  tracking: {
    // Otomatis meneruskan query parameter UTM dari pengunjung ke link referral
    forwardUtmParams: true,
    allowedParams: [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "subid"
    ]
  }
};

// Bekukan objek agar aman dari modifikasi tak disengaja di runtime
if (typeof Object.freeze === "function") {
  Object.freeze(APP_CONFIG);
  Object.freeze(APP_CONFIG.brand);
  Object.freeze(APP_CONFIG.urls);
  Object.freeze(APP_CONFIG.tracking);
}

// Ekspor ke window browser dan Node.js environment
if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = APP_CONFIG;
}
