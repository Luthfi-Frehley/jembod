# Simple Gateway & Referral Redirect Page (rutofi.store)

Web redirect / bridge page ultra-ringan dan responsif yang dirancang khusus untuk memfasilitasi pengalihan pengunjung ke link referral (**DAFTAR**) dan portal resmi (**LOGIN**) secara instan.

Tampilan mengusung tema *carbon fiber seamless* gelap dengan tombol aksen ungu menyala (*purple running light*) yang elegan.

---

## 📁 Struktur File

```
webhook/
│
├── CNAME                   # Custom domain pointer untuk GitHub Pages (rutofi.store)
├── config.js               # Pusat konfigurasi: Link DAFTAR (referral), link LOGIN, nama brand
├── index.html              # Struktur gateway redirect + fallback link statis jika JS mati
├── style.css               # Desain tekstur carbon fiber seamless & tombol purple running light
├── script.js               # Hydration dinamis dari config & otomatis meneruskan parameter UTM
├── robots.txt              # File perayapan search engine untuk https://rutofi.store
├── sitemap.xml             # Peta situs XML dengan ekstensi gambar Google
├── README.md               # Panduan penggunaan & deployment
│
└── assets/
    ├── logo.png            # Logo transparan ROYAL123
    ├── banner.png          # Gambar flyer / promo banner tengah (1080p)
    ├── bg-carbon.png       # Seamless carbon fiber tile (3.1 KB, 0 seam)
    ├── logo-r.png          # Mahkota R Favicon
    └── favicon.svg         # Favicon vector SVG
```

---

## 🌐 Arsitektur Deployment (GitHub ➔ Cloudflare ➔ rutofi.store)

Proyek ini telah dikonfigurasi untuk alur:
`Repository GitHub ➔ Cloudflare (Pages / DNS Proxy) ➔ rutofi.store`

### Opsi A: Cloudflare Pages (Direkomendasikan)
1. Buka dashboard [Cloudflare](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages**.
2. Pilih **Connect to Git** dan hubungkan repository GitHub Anda.
3. Konfigurasi build:
   - **Framework preset**: None
   - **Build command**: *(kosongkan)*
   - **Build output directory**: `/` (root)
4. Klik **Save and Deploy**.
5. Buka tab **Custom domains** di project Pages, lalu masukkan `rutofi.store`. Cloudflare akan otomatis mengonfigurasi DNS dan sertifikat SSL/TLS gratis.

### Opsi B: GitHub Pages + Cloudflare DNS Proxy
1. Di GitHub repository: buka **Settings** ➔ **Pages**.
2. Di bagian *Build and deployment*, pilih branch `main` / `master` dan folder `/ (root)`.
3. Di bagian *Custom domain*, masukkan `rutofi.store` (file `CNAME` sudah tersedia di repository).
4. Di dashboard DNS Cloudflare untuk domain `rutofi.store`:
   - Buat record **CNAME** `@` mengarah ke `<username>.github.io` dengan status Proxy (Orange cloud) aktif.
   - Atur SSL/TLS di Cloudflare ke mode **Full** atau **Full (Strict)**.

---

## ⚙️ Cara Mengganti Link Referral & Login

Cukup buka file [**`config.js`**](file:///d:/VSC/webhook/config.js) dan ubah bagian ini:

```javascript
urls: {
  // Ganti dengan link referral pendaftaran Anda:
  referralUrl: "https://websiteutama.com/register?ref=KODE_REFERRAL_ANDA",

  // Link login resmi (sudah terpasang ke linkjp.lol):
  loginUrl: "https://linkjp.lol/royal123"
}
```

> **Catatan Penting**: Anda **tidak perlu mengedit `index.html`** setiap kali mengganti link referral. Cukup edit `config.js`, dan tombol **DAFTAR** serta **LOGIN** akan otomatis terbarui!

---

## 🔍 SEO, Robots.txt & Sitemap.xml

- **Domain Utama**: `https://rutofi.store/`
- **Robots.txt**: Mengizinkan perayapan search bot dan mengarahkan ke `https://rutofi.store/sitemap.xml`.
- **Sitemap.xml**: Menyertakan metadata halaman utama dan Google Image Sitemap untuk flyer banner.
- **Canonical & Open Graph**: Sudah dikonfigurasi menggunakan absolute URL `https://rutofi.store/` agar preview kartu WhatsApp, Telegram, dan Facebook tampil optimal.
