import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Chip from "../components/Chip";
import { mockTenders } from "../data/mockData";
import {
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
  Building2,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";

export default function ProfilePage({ onBack, onLogout }) {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, logout } = useApp();
  const [activeMenu, setActiveMenu] = useState("TRANSAKSI");
  const [transactionFilter, setTransactionFilter] = useState("SEMUA");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: currentUser?.name || "Rizal Firmansyah",
    phone: currentUser?.phone || "+62 812-9988-7711",
    location: currentUser?.location || "Lembang, Bandung Barat",
  });

  if (!currentUser) return null;

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
      id: "DASHBOARD",
      label: "Dashboard Operasional",
      icon: LayoutDashboard,
      isDashboardLink: true,
    },
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

  const handleSaveProfile = () => {
    updateUserProfile(editForm);
    setIsEditProfileOpen(false);
  };

  const handleConfirmWithdraw = () => {
    updateUserProfile({
      activeBalance: 0,
    });
    alert("Simulasi penarikan saldo berhasil diproses!");
    setIsWithdrawModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="akun" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/80">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary shadow-sm"
                  />
                  <span className="absolute bottom-1 right-1 p-1 rounded-full bg-primary text-[#E6E4DA] border-2 border-surface">
                    <BadgeCheck className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-ink">
                      {currentUser.name}
                    </h1>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-green text-primary border border-primary/20">
                      Akun Terverifikasi
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-primary">
                    {currentUser.role}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-ink-secondary pt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-ink">
                      <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                      {currentUser.rating}
                      <span className="text-ink-muted font-normal">
                        ({currentUser.reviewCount} ulasan)
                      </span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {currentUser.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  icon={LayoutDashboard}
                  onClick={() => {
                    const roleLower = (currentUser.role || "").toLowerCase();
                    if (roleLower.includes("pembeli") || roleLower.includes("umkm")) {
                      navigate("/dashboard/buyer");
                    } else {
                      navigate("/dashboard/farmer");
                    }
                  }}
                >
                  Lihat Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={Edit3}
                  onClick={() => {
                    setEditForm({
                      name: currentUser.name,
                      phone: currentUser.phone,
                      location: currentUser.location,
                    });
                    setIsEditProfileOpen(true);
                  }}
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
              <div className="p-5 rounded-xl bg-surface-green/40 border border-primary/20 flex flex-col justify-between space-y-4">
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
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    Rp {currentUser.activeBalance.toLocaleString("id-ID")}
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

              <div className="p-5 rounded-xl bg-[#FEF3C7]/40 border border-[#FDE68A] flex flex-col justify-between space-y-4">
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
                  <p className="text-2xl sm:text-3xl font-bold text-[#D97706]">
                    Rp {currentUser.escrowBalance.toLocaleString("id-ID")}
                  </p>

                  <span className="text-xs text-ink-muted">
                    Transaksi Escrow Aktif
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="lg:col-span-4 space-y-4">
              <div className="bg-surface rounded-2xl p-3 border border-border shadow-xs space-y-1">
                {menuItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.isDashboardLink) {
                          const roleLower = (
                            currentUser.role || ""
                          ).toLowerCase();
                          if (
                            roleLower.includes("pembeli") ||
                            roleLower.includes("umkm")
                          ) {
                            navigate("/dashboard/buyer");
                          } else {
                            navigate("/dashboard/farmer");
                          }
                        } else {
                          setActiveMenu(item.id);
                        }
                      }}
                      className={`w-full p-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
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

              <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border text-xs space-y-2">
                <span className="font-bold text-ink block">Info Kontak Akun:</span>
                <p className="text-ink-secondary flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>{currentUser.email}</span>
                </p>
                <p className="text-ink-secondary flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>{currentUser.phone}</span>
                </p>
                <p className="text-ink-secondary flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Rekening: {currentUser.bankName} ({currentUser.accountNumber})</span>
                </p>
              </div>
            </aside>

            <section className="lg:col-span-8 space-y-6">
              {activeMenu === "TRANSAKSI" && (
                <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
                    <div>
                      <h2 className="text-base font-bold text-ink">
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
                        onClick={() => {
                          if (tender.status === "HANDOVER") navigate("/handover");
                          else if (tender.status === "COMPLETED") navigate("/completed");
                          else if (tender.status === "AWARDED" || tender.status === "PAID_HELD") navigate("/escrow");
                          else navigate(`/tender/${tender.id}`);
                        }}
                        className="p-4 sm:p-5 rounded-xl bg-[#E6E4DA] border border-border hover:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-xs hover:shadow-sm"
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

                          <h3 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
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
                          <span className="text-[11px] text-ink-muted flex items-center gap-1 group-hover:text-primary transition-colors">
                            <span>Detail Transaksi</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === "TENDER_SAYA" && (
                <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <h2 className="text-base font-bold text-ink">
                      Daftar Tender Permintaan Dibuat
                    </h2>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate("/explore")}
                    >
                      Buat Tender Baru
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {mockTenders.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/tender/${item.id}`)}
                        className="p-4 rounded-xl bg-[#E6E4DA] border border-border hover:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={item.status} size="sm" />
                            <span className="text-xs font-bold text-ink group-hover:text-primary transition-colors">
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
                <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-6">
                  <div className="pb-3 border-b border-border/80">
                    <h2 className="text-base font-bold text-ink">
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
                        className="p-4 rounded-xl bg-[#E6E4DA] border border-border space-y-1.5"
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
                <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-6">
                  <div className="pb-3 border-b border-border/80">
                    <h2 className="text-base font-bold text-ink">
                      Keamanan Akun &amp; Rekening Bank
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Kelola kredensial keamanan penarikan dana hasil panen
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">
                          Autentikasi Dua Langkah (2FA)
                        </span>
                        <span className="text-ink-muted">
                          Wajib untuk konfirmasi penarikan saldo di atas Rp 2.000.000
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-surface-green text-primary font-bold text-[10px]">
                        Aktif
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">
                          Kata Sandi Akun
                        </span>
                        <span className="text-ink-muted">
                          Terakhir diperbarui 14 hari yang lalu
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Ubah Sandi
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">
                          Rekening Bank Pencairan Utama
                        </span>
                        <span className="text-ink-muted">
                          {currentUser.bankName} • {currentUser.accountNumber} ({currentUser.accountHolder})
                        </span>
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
                  Tarik Saldo Kas Hasil Panen
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

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#E6E4DA] border border-border">
                <span className="text-[10px] uppercase font-bold text-ink-muted block">
                  Rekening Tujuan Pencairan
                </span>
                <p className="font-bold text-ink mt-0.5">
                  {currentUser.bankName} - {currentUser.accountNumber}
                </p>
                <p className="text-ink-secondary">a.n. {currentUser.accountHolder}</p>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">
                  Nominal Penarikan (Rp)
                </label>
                <input
                  type="text"
                  defaultValue={currentUser.activeBalance.toLocaleString("id-ID")}
                  className="w-full rounded-xl px-4 py-2.5 text-base font-bold text-primary bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">
                  Bebas biaya transfer antar-bank sandbox
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
                onClick={handleConfirmWithdraw}
              >
                Konfirmasi Tarik Dana
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
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-xl px-3.5 py-2 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full rounded-xl px-3.5 py-2 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Lokasi Domisili / Kebun</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
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
                onClick={handleSaveProfile}
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
                  }
                  logout();
                  navigate("/login");
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
