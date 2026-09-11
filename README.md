# Simple Gateway & Referral Redirect Page

Web redirect / bridge page ultra-ringan dan responsif yang dirancang khusus untuk memfasilitasi pengalihan pengunjung ke link referral (**DAFTAR**) dan portal resmi (**LOGIN**) secara instan.

Tampilan mengusung tema *carbon fiber* gelap dengan tombol aksen emas menyala (*glowing gold*) yang elegan, persis sesuai format gateway link rujukan.

---

## 📁 Struktur File

```
webhook/
│
├── config.js               # Pusat konfigurasi: Link DAFTAR (referral), link LOGIN, nama brand
├── index.html              # Struktur gateway redirect + fallback link statis jika JS mati
├── style.css               # Desain tekstur carbon fiber & tombol glowing gold
├── script.js               # Hydration dinamis dari config & otomatis meneruskan parameter UTM
├── robots.txt              # File perayapan search engine
├── sitemap.xml             # Peta situs
├── README.md               # Panduan penggunaan
│
└── assets/
    ├── logo.png            # Logo brand (ROYAL123)
    ├── banner.png          # Gambar flyer / promo banner tengah
    └── favicon.svg         # Favicon browser
```

---

## ⚙️ Cara Mengganti Link Referral & Login

Cukup buka file [**`config.js`**](file:///d:/VSC/webhook/config.js) dan ubah bagian ini:

```javascript
urls: {
  // Ganti dengan link referral Anda:
  referralUrl: "https://websiteutama.com/register?ref=KODE_REFERRAL_ANDA",

  // Ganti dengan link login resmi:
  loginUrl: "https://websiteutama.com/login"
}
```

> **Catatan Penting**: Anda **tidak perlu mengedit `index.html`** setiap kali mengganti link referral. Cukup edit `config.js`, dan tombol **DAFTAR** serta **LOGIN** akan otomatis terbarui!

---

## 🚀 Fitur Unggulan

1. **Ultra Cepat**: Ukuran total halaman < 30 KB, terbuka dalam sekejap tanpa render-blocking.
2. **Anti-Gagal (Progressive Fallback)**: Jika pengunjung menggunakan browser tanpa JavaScript atau memblokir skrip, link tetap bekerja langsung dari atribut `href` HTML.
3. **UTM Parameter Forwarding**: Jika pengunjung datang melalui iklan berbayar (misal: `https://landing-kamu.com/?utm_source=fb&utm_campaign=promo`), parameter tersebut otomatis disambungkan ke link tujuan pendaftaran referral Anda.
4. **Mobile-First**: Tampilan otomatis pas di layar smartphone maupun komputer desktop tanpa perlu scroll berlebih.

---

## 💻 Cara Menjalankan (Preview Lokal)

Gunakan ekstensi **Live Server** di VS Code, atau jalankan melalui terminal:

```bash
# Menggunakan Python
python -m http.server 3000
```
Lalu buka `http://localhost:3000` di browser Anda.
