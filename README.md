# PatraTani — Dokumen Handoff Frontend ke Backend

Dokumen ini merupakan panduan handoff resmi bagi Tim Backend untuk memahami arsitektur antarmuka, struktur kode, state global, serta alur integrasi API pada aplikasi **PatraTani**.

---

## 1. Informasi Proyek & Stack Teknologi

**PatraTani** adalah platform *reverse marketplace* dan *pre-order* hasil pertanian langsung dari kebun ke dapur usaha lokal (UMKM & kuliner) tanpa perantara gudang sentral, dilengkapi sistem pengamanan rekening bersama (*smart escrow*), verifikasi serah-terima foto geotag realtime, serta pengantaran mandiri oleh petani.

### Stack Teknologi:
- **Framework & Runtime:** [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Ikonografi:** [Lucide React](https://lucide.dev/)
- **Web Browser APIs Terintegrasi:** 
  - MediaDevices API (`getUserMedia`) untuk kamera in-app
  - HTML5 Canvas API untuk penangkapan frame foto serah-terima
  - Geolocation API (`getCurrentPosition`) untuk stempel koordinat GPS otomatis
  - File API & Object URL untuk pratinjau berkas gambar lokal

### Cara Menjalankan Proyek Lokal:
```bash
# 1. Masuk ke direktori frontEnd
cd frontEnd

# 2. Instalasi dependensi (jika baru melakukan clone)
npm install

# 3. Jalankan server pengembangan lokal
npm run dev

# 4. Bangun berkas produksi (Production Build)
npm run build
```
Aplikasi akan berjalan di `http://localhost:5173/`.

---

## 2. Struktur Direktori

Kode sumber antarmuka berpusat di folder `src/` dengan pembagian modul berikut:

```
frontEnd/
├── public/                 # Aset statis publik (ikon, gambar)
├── src/
│   ├── components/         # Komponen UI modular & reusable
│   │   ├── Button.jsx          # Komponen tombol serbaguna (primary, outline, destructive)
│   │   ├── Chip.jsx            # Tag filter kategori & status
│   │   ├── EtalaseCard.jsx     # Kartu komoditas panen di halaman pasar
│   │   ├── Footer.jsx          # Navigasi kaki halaman & legalitas
│   │   ├── Navbar.jsx          # Header navigasi dinamis berbasis role AppContext
│   │   ├── ProtectedRoute.jsx  # Guard pembatas rute bagi pengguna terautentikasi
│   │   ├── StatusBadge.jsx     # Indikator status transaksi (AWARDED, PAID_HELD, dll.)
│   │   ├── TenderCard.jsx      # Kartu permintaan tender UMKM di pasar
│   │   └── Toast.jsx           # Komponen notifikasi melayang di atas layar
│   ├── context/            # State management global React Context
│   │   └── AppContext.jsx      # Provider autentikasi, transaksi aktif, & sistem toast
│   ├── data/               # Data simulasi terpusat (Mock Data)
│   │   └── mockData.js         # Koleksi dummy komoditas, tender, user, & riwayat
│   ├── pages/              # Halaman antarmuka utama (Views)
│   │   ├── HomePage.jsx                 # Beranda landing page
│   │   ├── ExplorePage.jsx              # Pasar 2 mode (Etalase & Tender) + Filter
│   │   ├── DetailEtalasePage.jsx        # Deskripsi komoditas & pemesanan kuota pasti
│   │   ├── CreateEtalasePage.jsx        # Formulir pendaftaran panen baru petani
│   │   ├── CreateTenderPage.jsx         # Formulir tender pengadaan UMKM
│   │   ├── TenderDetailPage.jsx         # Detail tender dari sudut pandang petani penawar
│   │   ├── DetailTenderPembeliPage.jsx  # Manajemen penawaran masuk dari sudut pandang pembeli
│   │   ├── CheckoutEscrowPage.jsx       # Formulir kesepakatan fixed & setor dana escrow
│   │   ├── HandoverPage.jsx             # Serah-terima kamera in-app, GPS, & konfirmasi 2 pihak
│   │   ├── CompletedPage.jsx            # Pencairan dana escrow, komisi 3-5%, & ulasan
│   │   ├── ProfilePage.jsx              # Akun pengguna, saldo kas, & riwayat
│   │   ├── FarmerDashboardPage.jsx      # Dasbor petani & pengaturan delivery mandiri
│   │   ├── BuyerDashboardPage.jsx       # Dasbor pengadaan bahan baku pembeli UMKM
│   │   ├── AdminDisputeDashboardPage.jsx# Dasbor mediasi sengketa transaksi komoditas
│   │   ├── LoginPage.jsx                # Autentikasi masuk akun (Petani/Pembeli)
│   │   └── RegisterPage.jsx             # Pendaftaran akun baru
│   ├── App.jsx             # Registrasi routing & integrasi ProtectedRoute
│   ├── index.css           # Konfigurasi Tailwind dasar & custom utilitas
│   └── main.jsx            # Titik masuk rendering DOM React
├── package.json            # Daftar dependensi & script runner
├── tailwind.config.js      # Palet warna tema, font, & styling kustom
└── vite.config.js          # Konfigurasi bundler Vite
```

---

## 3. Panduan Integrasi API (Tim Backend)

Saat ini seluruh antarmuka berjalan mulus menggunakan data simulasi di sisi klien (*client-side state*). Berikut langkah-langkah transisi ke API HTTP riil:

### A. Migrasi `src/data/mockData.js`
1. Seluruh dataset dummy (komoditas panen, daftar tender, profil pengguna, riwayat pesanan, dan daftar sengketa) berpusat di `src/data/mockData.js`.
2. **Tindakan Tim Backend:**
   - Siapkan endpoint RESTful API / GraphQL yang mengembalikan struktur JSON identik dengan objek di `mockData.js`.
   - Hapus berkas `src/data/mockData.js` secara bertahap dan gantikan dengan modul pemanggil HTTP (misal: Axios client atau fungsi Fetch di folder `src/services/api.js`).

### B. State Manajemen Global (`src/context/AppContext.jsx`)
`AppContext.jsx` bertanggung jawab atas dua domain data penting:
1. **Otentikasi Pengguna (`currentUser`):**
   - Fungsi `login()`, `logout()`, dan `register()` saat ini memodifikasi state lokal.
   - **Tindakan Tim Backend:** Hubungkan fungsi-fungsi ini ke endpoint autentikasi autentik (`POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`) menggunakan token JWT (Bearer Token) atau HTTP-only Cookies.
2. **Siklus Transaksi Aktif (`activeTransaction`):**
   - Mengelola transisi status transaksi escrow:
     - `AWARDED`: Pemenang tender terpilih atau pre-order dikunci.
     - `PAID_HELD`: Pembeli menyetor nominal ke rekening escrow penampung.
     - `HANDOVER`: Proses serah-terima fisik, verifikasi timbangan, dan foto geotag.
     - `COMPLETED`: Pelepasan dana escrow ke dompet kas petani setelah konfirmasi dua pihak.
     - `DISPUTED`: Penahanan dana escrow jika timbangan/kualitas dilaporkan bermasalah.
   - **Tindakan Tim Backend:** Gantikan fungsi lokal `payEscrow()`, `completeHandover()`, dan `fileDispute()` dengan pemanggilan endpoint mutasi (`PATCH /api/transactions/:id/status`).

### C. Penanganan Payload Hardware & Berkas (Kamera & GPS)
- **Unggah Foto Panen & Serah-Terima:**
  Antarmuka di `CreateEtalasePage.jsx` dan `HandoverPage.jsx` menghasilkan berkas foto riil (objek `File` dan `Data URL base64`). Backend diharapkan menyediakan endpoint `multipart/form-data` (misal via Amazon S3 / Google Cloud Storage / Cloudinary) untuk menyimpan gambar hasil panen dan bukti serah-terima.
- **Validasi Geotag:**
  Antarmuka mengirimkan koordinat latitude dan longitude presisi dari GPS peramban (misal: `"-6.860451, 107.589923"`). Backend dapat memvalidasi apakah titik koordinat pembeli dan kebun petani berada dalam radius yang disepakati (< 15-20 km).

### D. Logika Finansial & Komisi Platform
Sistem keuangan di frontend mengacu pada formula:
- **Setoran Pembeli:** `Subtotal Panen + Ongkos Kirim Tetap` (Biaya penanganan escrow: Rp 0).
- **Pencairan Petani:** `(Subtotal Panen - Komisi Platform 3-5%) + (100% Ongkos Kirim)`.
- *Catatan:* Komisi platform hanya dipotong dari harga hasil panen, sedangkan ongkos kirim diberikan utuh 100% ke petani.

---

## 4. Daftar Rute Tersedia (Routing Table)

Seluruh rute telah didaftarkan pada [src/App.jsx](src/App.jsx). Halaman penting dilindungi menggunakan guard [ProtectedRoute.jsx](src/components/ProtectedRoute.jsx) yang otomatis mengarahkan pengguna ke `/login` jika sesi autentikasi belum tersedia:

| Path URL | Komponen Halaman | Tipe Akses | Deskripsi & Hak Akses |
|---|---|---|---|
| `/` | `HomePage` | Publik | Halaman Beranda (Landing page), pencarian hasil panen terdekat, dan ringkasan platform. |
| `/explore` | `ExplorePage` | Publik | Pasar 2 Mode (Etalase Panen & Tender Bidding) dilengkapi filter Kategori, Jarak, Harga, dan Opsi Kirim. |
| `/etalase/:id` | `DetailEtalasePage` | Publik | Rincian komoditas panen, profil kebun petani, jadwal panen, dan kalkulator kuota pasti (10–20+ kg). |
| `/tender/:id` | `TenderDetailPage` | Publik | Rincian spesifikasi kebutuhan bahan baku UMKM untuk diajukan bidding harga oleh petani. |
| `/login` | `LoginPage` | Publik | Form masuk akun untuk peran Petani Mitra maupun Pembeli UMKM. |
| `/register` | `RegisterPage` | Publik | Pendaftaran akun baru dengan pemilihan peran (Petani / Pembeli). |
| `/etalase/create` | `CreateEtalasePage` | **Terlindungi** | Formulir bagi Petani untuk membuka jadwal panen pre-order (unggah foto & deteksi GPS kebun). |
| `/tender/create` | `CreateTenderPage` | **Terlindungi** | Formulir bagi Pembeli UMKM untuk mempublikasikan tender pengadaan bahan baku dapur. |
| `/tender/pembeli/:id` | `DetailTenderPembeliPage` | **Terlindungi** | Panel pembeli untuk meninjau penawaran harga masuk dari petani dan memilih pemenang. |
| `/escrow` | `CheckoutEscrowPage` | **Terlindungi** | Formulir kesepakatan fixed, simulasi pembayaran sandbox QRIS/VA, dan kartu kesiapan H-1. |
| `/handover` | `HandoverPage` | **Terlindungi** | Antarmuka serah-terima kamera in-app, stempel waktu & geotag GPS, timbangan aktual, serta konfirmasi dua pihak. |
| `/completed` | `CompletedPage` | **Terlindungi** | Rincian pencairan dana escrow bersih ke petani, pemotongan komisi platform, dan ulasan pembeli. |
| `/dashboard/farmer` | `FarmerDashboardPage` | **Terlindungi** | Dasbor operasional petani, ringkasan saldo, pesanan aktif, dan form pengaturan delivery mandiri. |
| `/dashboard/buyer` | `BuyerDashboardPage` | **Terlindungi** | Dasbor pengadaan bahan baku pembeli UMKM dan pelacakan status tender berjalan. |
| `/admin/disputes` | `AdminDisputeDashboardPage`| **Terlindungi** | Panel mediasi sengketa transaksi escrow bagi admin jika barang cacat atau timbangan kurang. |
| `/profile` | `ProfilePage` | **Terlindungi** | Pengaturan profil pengguna, penarikan saldo kas aktif (`activeBalance`), dan riwayat seluruh transaksi. |

---

## 5. Kontak & Pemeliharaan

- **Desain UI Acuan:** `PatraTani.pen` (42 frames Desktop, Tablet, & Mobile)
- **Spesifikasi Dokumen Alur:** `Alur PatraTani.pdf`
- **Frontend Lead:** Tim Frontend Engineer PatraTani
