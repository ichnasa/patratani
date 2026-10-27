import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Chip from "../components/Chip";
import { mockTenders } from "../data/mockTenders";
import {
  User,
  Star,
  Edit3,
  Wallet,
  ShieldCheck,
  FileText,
  History,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  ArrowDownToLine,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  BadgeCheck,
  X,
  CreditCard,
  Building2,
  Lock,
} from "lucide-react";

export default function ProfilePage({ onBack, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("TRANSAKSI");
  const [transactionFilter, setTransactionFilter] = useState("SEMUA");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: "Rizal Firmansyah",
    role: "Petani Kecil & Pembeli UMKM",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    email: "rizal.firmansyah@patratani.id",
    phone: "+62 812-9988-7711",
    location: "Lembang, Bandung Barat",
    rating: 4.9,
    reviewCount: 148,
    activeBalance: 4250000,
    escrowBalance: 1585000,
    bankName: "Bank BRI",
    accountNumber: "4410-01-028471-53-2",
    accountHolder: "Rizal Firmansyah",
  });

  const filterTabs = [
    { id: "SEMUA", label: "Semua" },
    { id: "MENUNGGU", label: "Menunggu" },
    { id: "DIKIRIM", label: "Dikirim / Serah Terima" },
    { id: "SELESAI", label: "Selesai" },
    { id: "SENGKETA", label: "Sengketa" },
  ];

  const filteredTenders = mockTenders.filter((item) => {
    if (transactionFilter === "SEMUA") return true;
    if (transactionFilter === "MENUNGGU")
      return ["OPEN", "BIDDING", "AWARDED", "PAID_HELD"].includes(item.status);
    if (transactionFilter === "DIKIRIM") return item.status === "HANDOVER";
    if (transactionFilter === "SELESAI") return item.status === "COMPLETED";
    if (transactionFilter === "SENGKETA") return item.status === "DISPUTED";
    return true;
  });

  const faqs = [
    {
      q: "Bagaimana cara kerja rekening escrow simulasi Patra Tani?",
      a: "Setelah pembeli menyetujui pemenang tender, dana ditahan di rekening penampung. Dana baru dicairkan ke petani setelah kedua pihak memverifikasi foto komoditas dengan kamera berstempel geotag.",
    },
    {
      q: "Berapa potongan komisi untuk petani?",
      a: "Komisi platform hanya 3% hingga 5% dari harga panen komoditas saja. Biaya pengiriman kurir petani 100% diterima penuh oleh petani tanpa potongan apa pun.",
    },
    {
      q: "Apakah pengambilan mandiri (self-pickup) dikenakan biaya?",
      a: "Tidak. Pengambilan mandiri langsung ke kebun atau gudang panen petani adalah gratis (Rp 0).",
    },
    {
      q: "Apa yang terjadi jika komoditas yang diterima rusak atau timbangan kurang?",
      a: "Pembeli dapat menekan tombol 'Laporkan Sengketa' di halaman serah-terima. Dana escrow akan ditahan secara otomatis sementara admin melakukan mediasi berdasarkan bukti foto kamera geotag.",
    },
  ];

  const menuItems = [
    {
      id: "TRANSAKSI",
      label: "Riwayat Transaksi",
      icon: History,
      badge: mockTenders.length,
    },
    {
      id: "TENDER_SAYA",
      label: "Daftar Tender Saya",
      icon: FileText,
      badge: 2,
    },
    {
      id: "BANTUAN",
      label: "Pusat Bantuan & Edukasi Escrow",
      icon: HelpCircle,
    },
    {
      id: "KEAMANAN",
      label: "Pengaturan Keamanan & Akun",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="akun" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28 md:pb-14">
        <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/80">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary shadow-sm"
                />
                <span className="absolute bottom-1 right-1 p-1 rounded-full bg-primary text-[#E6E4DA] border-2 border-surface">
                  <BadgeCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-ink">
                    {profile.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-green text-primary border border-primary/20">
                    Akun Terverifikasi
                  </span>
                </div>

                <p className="text-xs font-semibold text-primary">
                  {profile.role}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-ink-secondary pt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-ink">
                    <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                    {profile.rating}
                    <span className="text-ink-muted font-normal">
                      ({profile.reviewCount} ulasan)
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {profile.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2.5">
              <Button
                variant="outline"
                size="md"
                icon={Edit3}
                onClick={() => setIsEditProfileOpen(true)}
              >
                Edit Profil
              </Button>
              <Button
                variant="destructive"
                size="md"
                icon={LogOut}
                onClick={() => setIsLogoutModalOpen(true)}
              >
                Keluar
              </Button>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-surface-green/40 border border-primary/20 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary text-[#E6E4DA]">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink block">
                      Saldo Kas Aktif (Bisa Ditarik)
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      Hasil panen tuntas &amp; ongkir 100% utuh
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Siap Cair
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary">
                  Rp {profile.activeBalance.toLocaleString("id-ID")}
                </p>

                <Button
                  variant="primary"
                  size="sm"
                  icon={ArrowDownToLine}
                  onClick={() => setIsWithdrawModalOpen(true)}
                >
                  Tarik Saldo
                </Button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FEF3C7]/40 border border-[#FDE68A] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#D97706] text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink block">
                      Dana Tertahan di Escrow
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      Aman di rekening penampung sandbox
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D97706]/10 text-[#D97706]">
                  Sedang Bertransaksi
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#D97706]">
                  Rp {profile.escrowBalance.toLocaleString("id-ID")}
                </p>

                <span className="text-xs text-ink-muted">
                  3 Transaksi Berjalan
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 space-y-3">
            <div className="bg-surface rounded-3xl p-3 border border-border shadow-xs space-y-1">
              {menuItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? "bg-primary text-[#E6E4DA] shadow-xs"
                        : "text-ink-secondary hover:text-ink hover:bg-surface-green/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            isActive
                              ? "bg-[#E6E4DA] text-primary"
                              : "bg-border text-ink"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-3xl bg-[#E6E4DA] border border-border text-xs space-y-2">
              <span className="font-bold text-ink block">Info Kontak Akun:</span>
              <p className="text-ink-secondary flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>{profile.email}</span>
              </p>
              <p className="text-ink-secondary flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>{profile.phone}</span>
              </p>
              <p className="text-ink-secondary flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>Rekening: {profile.bankName} ({profile.accountNumber})</span>
              </p>
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-6">
            {activeMenu === "TRANSAKSI" && (
              <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-border space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
                  <div>
                    <h2 className="text-lg font-bold text-ink">
                      Riwayat Seluruh Transaksi
                    </h2>
                    <p className="text-xs text-ink-muted">
                      Pantau transaksi aktif, serah-terima kamera, hingga pesanan tuntas
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-green text-primary self-start sm:self-auto">
                    {filteredTenders.length} Transaksi Ditemukan
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {filterTabs.map((tab) => (
                    <Chip
                      key={tab.id}
                      label={tab.label}
                      size="sm"
                      active={transactionFilter === tab.id}
                      onClick={() => setTransactionFilter(tab.id)}
                    />
                  ))}
                </div>

                <div className="space-y-3.5">
                  {filteredTenders.map((tender) => (
                    <div
                      key={tender.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#E6E4DA] border border-border hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">
                            {tender.category}
                          </span>
                          <span className="text-xs text-ink-muted">•</span>
                          <span className="text-xs font-mono text-ink-muted">
                            {tender.id}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-ink">
                          {tender.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-secondary">
                          <span>
                            Target: <strong className="text-ink">{tender.requiredQuantityKg} Kg</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Total: <strong className="text-primary">Rp {tender.totalBudget.toLocaleString("id-ID")}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Mitra: {tender.buyer.businessName}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/80">
                        <StatusBadge status={tender.status} size="sm" showIcon />
                        <span className="text-[11px] text-ink-muted">
                          Jadwal: {tender.deliveryDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeMenu === "TENDER_SAYA" && (
              <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-border space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <h2 className="text-lg font-bold text-ink">
                    Daftar Tender Permintaan Dibuat
                  </h2>
                  <Button variant="primary" size="sm">
                    Buat Tender Baru
                  </Button>
                </div>

                <div className="space-y-3">
                  {mockTenders.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#E6E4DA] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={item.status} size="sm" />
                          <span className="text-xs font-bold text-ink">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary">
                          Spesifikasi: "{item.specifications}"
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-primary block">
                          Rp {item.targetPricePerKg.toLocaleString("id-ID")}/kg
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          Batas: {item.deadlineDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeMenu === "BANTUAN" && (
              <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-border space-y-6">
                <div className="pb-3 border-b border-border/80">
                  <h2 className="text-lg font-bold text-ink">
                    Pusat Bantuan &amp; Panduan Escrow
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Pertanyaan umum seputar perlindungan transaksi tanpa gudang
                  </p>
                </div>

                <div className="space-y-3.5">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#E6E4DA] border border-border space-y-1.5"
                    >
                      <h3 className="text-xs font-bold text-ink">
                        {faq.q}
                      </h3>
                      <p className="text-xs text-ink-secondary leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeMenu === "KEAMANAN" && (
              <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-border space-y-6">
                <div className="pb-3 border-b border-border/80">
                  <h2 className="text-lg font-bold text-ink">
                    Pengaturan Keamanan &amp; Akun
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Kelola otentikasi transaksi dan rekening pencairan
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">
                        PIN Transaksi Escrow
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        Digunakan untuk menyetujui pencairan dana dan penarikan saldo
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ubah PIN
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">
                        Verifikasi Kamera &amp; Izin Geotag
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        Status izin kamera browser: Aktif (Diizinkan)
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Terverifikasi
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">
                        Rekening Bank Pencairan
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        {profile.bankName} • {profile.accountNumber} ({profile.accountHolder})
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ganti Rekening
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setIsWithdrawModalOpen(false)}
          />

          <div className="relative bg-surface rounded-3xl p-6 sm:p-7 border border-border max-w-md w-full space-y-5 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-ink">
                  Tarik Saldo Kas ke Rekening Bank
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 rounded-full text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-green/40 border border-primary/20 text-xs space-y-1">
              <span className="text-ink-muted block">Saldo yang dapat ditarik:</span>
              <p className="text-xl font-extrabold text-primary">
                Rp {profile.activeBalance.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#E6E4DA] border border-border space-y-1">
                <span className="text-ink-muted block text-[10px] uppercase font-bold">
                  Rekening Tujuan Pencairan
                </span>
                <p className="font-bold text-ink">{profile.bankName} - {profile.accountNumber}</p>
                <p className="text-ink-muted">a.n. {profile.accountHolder}</p>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">
                  Nominal Penarikan (Rp)
                </label>
                <input
                  type="number"
                  defaultValue="4000000"
                  className="w-full rounded-xl px-3.5 py-2 text-sm font-bold text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">
                  Bebas biaya transfer antar bank mitra
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsWithdrawModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  alert("Permintaan penarikan dana berhasil diproses ke rekening BRI!");
                  setIsWithdrawModalOpen(false);
                }}
              >
                Konfirmasi Penarikan
              </Button>
            </div>
          </div>
        </div>
      )}

      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setIsEditProfileOpen(false)}
          />

          <div className="relative bg-surface rounded-3xl p-6 sm:p-7 border border-border max-w-md w-full space-y-4 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-ink">
                Edit Profil Pengguna
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-full text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full rounded-xl px-3.5 py-2 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="w-full rounded-xl px-3.5 py-2 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Lokasi Domisili / Kebun</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="w-full rounded-xl px-3.5 py-2 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsEditProfileOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsEditProfileOpen(false)}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setIsLogoutModalOpen(false)}
          />

          <div className="relative bg-surface rounded-3xl p-6 sm:p-7 border border-border max-w-sm w-full space-y-4 z-10 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink">
                Keluar dari Akun Patra Tani?
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Anda perlu masuk kembali untuk mengakses transaksi berjalan dan saldo escrow Anda.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="md"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else if (onBack) {
                    onBack();
                  }
                }}
              >
                Ya, Keluar
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
