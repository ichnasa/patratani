import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { mockProfileFaqs } from "../data/mockData";
import {
  Star,
  Edit3,
  Wallet,
  ShieldCheck,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  ArrowDownToLine,
  MapPin,
  Phone,
  Mail,
  X,
  Building2,
  Camera,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage({ onLogout }) {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, logout, showToast } = useApp();
  const avatarInputRef = useRef(null);

  const [activeMenu, setActiveMenu] = useState("EDIT_PROFIL");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: currentUser?.name || "Rizal Firmansyah",
    phone: currentUser?.phone || "+62 812-9988-7711",
    location: currentUser?.location || "Lembang, Bandung Barat",
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        if (showToast) {
          showToast("Format berkas harus berupa JPG atau PNG.", "warning");
        }
        return;
      }
      const newAvatarUrl = URL.createObjectURL(file);
      updateUserProfile({ avatar: newAvatarUrl });
      if (showToast) {
        showToast("Foto profil berhasil diperbarui!", "success");
      }
    }
  };

  if (!currentUser) return null;

  const faqs = mockProfileFaqs;

  const menuItems = [
    {
      id: "EDIT_PROFIL",
      label: "Edit Informasi Profil",
      icon: Edit3,
    },
    {
      id: "KEAMANAN",
      label: "Pengaturan Akun & Keamanan",
      icon: Shield,
    },
    {
      id: "BANTUAN",
      label: "Pusat Bantuan & Edukasi Escrow",
      icon: HelpCircle,
    },
  ];

  const handleSaveProfile = () => {
    updateUserProfile(editForm);
    setIsEditProfileOpen(false);
    if (showToast) {
      showToast("Informasi profil berhasil diperbarui!", "success");
    }
  };

  const handleInlineSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(editForm);
    if (showToast) {
      showToast("Informasi profil berhasil disimpan!", "success");
    }
  };

  const handleConfirmWithdraw = () => {
    updateUserProfile({
      activeBalance: 0,
    });
    if (showToast) {
      showToast("Simulasi penarikan saldo berhasil diproses!", "success");
    } else {
      alert("Simulasi penarikan saldo berhasil diproses!");
    }
    setIsWithdrawModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col selection:bg-primary-50 selection:text-primary">
      <Navbar />

      <main className="w-full flex-1 flex-grow">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/80">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                  title="Klik untuk mengubah foto profil"
                >
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/jpeg, image/png"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary shadow-sm group-hover:brightness-75 transition-all"
                  />
                  <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-[9px] font-bold mt-0.5">Ubah Foto</span>
                  </div>
                  <span className="absolute bottom-1 right-1 p-1 rounded-full bg-primary text-[#E6E4DA] border-2 border-surface shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
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

            {currentUser.role !== "admin" && !currentUser.role?.toLowerCase().includes("admin") && (
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
                          Pencairan instan ke rekening terdaftar
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-confirmed/20 text-primary">
                      Terverifikasi
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <p className="text-3xl sm:text-4xl font-bold text-primary">
                      Rp {currentUser.activeBalance.toLocaleString("id-ID")}
                    </p>

                    <Button
                      variant="outline"
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
                      <div className="p-2 rounded-xl bg-[#D97706] text-[#E6E4DA]">
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
                    <p className="text-3xl sm:text-4xl font-bold text-[#D97706]">
                      Rp {currentUser.escrowBalance.toLocaleString("id-ID")}
                    </p>

                    <span className="text-xs text-ink-muted">
                      Transaksi Escrow Aktif
                    </span>
                  </div>
                </div>
              </div>
            )}
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
                      onClick={() => setActiveMenu(item.id)}
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

                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full p-3.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all flex items-center justify-between cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Keluar / Logout</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
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
              {activeMenu === "EDIT_PROFIL" && (
                <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-6">
                  <div className="pb-4 border-b border-border/80">
                    <h2 className="text-base font-bold text-ink">
                      Informasi Profil Pengguna
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Kelola identitas akun, nomor kontak WhatsApp, dan lokasi domisili usaha Anda
                    </p>
                  </div>

                  <form onSubmit={handleInlineSaveProfile} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold text-ink block">Nama Lengkap</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full rounded-xl px-3.5 py-2.5 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-ink block">Nomor Telepon / WhatsApp</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="w-full rounded-xl px-3.5 py-2.5 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-ink block">Lokasi Domisili / Kebun / Usaha</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        className="w-full rounded-xl px-3.5 py-2.5 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-3.5 rounded-xl bg-[#E6E4DA]/50 border border-border space-y-1">
                        <span className="text-[10px] font-bold text-ink-muted uppercase">Email Terdaftar</span>
                        <p className="font-semibold text-ink">{currentUser.email}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#E6E4DA]/50 border border-border space-y-1">
                        <span className="text-[10px] font-bold text-ink-muted uppercase">Peran Akun</span>
                        <p className="font-semibold text-ink">{currentUser.role}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
                          <ShieldCheck className="w-3 h-3" /> Status Aktif
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/80 flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                      >
                        Simpan Perubahan Profil
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeMenu === "KEAMANAN" && (
                <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-6">
                  <div className="pb-3 border-b border-border/80">
                    <h2 className="text-base font-bold text-ink">
                      Keamanan Akun &amp; Rekening Bank
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Kelola kredensial keamanan penarikan dana dan rekening pencairan hasil transaksi
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert("Tautan ubah sandi telah dikirimkan ke email terdaftar Anda.")}
                      >
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert("Silakan hubungi tim dukungan untuk verifikasi perubahan rekening bank.")}
                      >
                        Ganti Rekening
                      </Button>
                    </div>
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
