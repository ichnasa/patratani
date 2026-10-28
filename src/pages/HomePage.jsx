import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Chip from "../components/Chip";
import EtalaseCard from "../components/EtalaseCard";
import TenderCard from "../components/TenderCard";
import {
  mockCommodities,
  mockTenders,
  mockUserProfile,
} from "../data/mockData";
import {
  ShoppingBag,
  FileText,
  ShieldCheck,
  Camera,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin");

  if (isAdmin) {
    return <Navigate replace to="/admin/disputes" />;
  }
  const isFarmer = !isAdmin && (roleLower ? (roleLower.includes("petani") || roleLower.includes("mitra")) : true);
  const isBuyer = !isAdmin && (roleLower ? (roleLower.includes("pembeli") || roleLower.includes("umkm")) : false);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [feedTab, setFeedTab] = useState("KOMODITAS");

  const categories = [
    "Semua",
    "Sayuran Buah",
    "Cabai & Bumbu",
    "Sayuran Daun",
    "Buah-buahan",
    "Bumbu Dapur",
  ];

  const filteredCommodities =
    selectedCategory === "Semua"
      ? mockCommodities
      : mockCommodities.filter((item) => item.category === selectedCategory);

  const filteredTenders =
    selectedCategory === "Semua"
      ? mockTenders
      : mockTenders.filter((item) => item.category === selectedCategory);

  const transactionSteps = [
    { key: "OPEN", label: "Tender Terbuka", step: 1, completed: true },
    { key: "BIDDING", label: "Penawaran", step: 2, completed: true },
    { key: "AWARDED", label: "Pemenang", step: 3, completed: true },
    { key: "PAID_HELD", label: "Dana Escrow", step: 4, completed: true },
    { key: "HANDOVER", label: "Serah Terima", step: 5, current: true },
    { key: "COMPLETED", label: "Selesai", step: 6 },
  ];

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full">
          <section className="py-8 md:py-10 px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
            <div className="flex flex-col gap-4 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-green text-primary text-xs font-semibold border border-primary/20">
                  Agritech Terdesentralisasi • Tanpa Gudang
                </span>
              </div>

              <h1 className="text-3xl lg:text-[32px] font-bold text-ink leading-tight">
                Halo, {mockUserProfile.name.split(" ")[0]}! 🌾
              </h1>

              <p className="text-base text-ink-secondary leading-relaxed">
                {isFarmer
                  ? "Jual panen segar langsung ke pembeli lokal, tanpa gudang."
                  : "Dapatkan pasokan segar langsung dari kebun petani lokal dengan harga panen adil dan tanpa perantara gudang."}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {!isAdmin && (
                  <Button
                    variant="primary"
                    icon={isFarmer ? ShoppingBag : FileText}
                    onClick={() =>
                      navigate(
                        isFarmer ? "/etalase/create" : "/tender/create"
                      )
                    }
                  >
                    {isFarmer ? "Pasang Hasil Panen" : "Buka Tender Baru"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate(isAdmin ? "/admin/disputes" : "/dashboard")}
                >
                  {isAdmin ? "Portal Sengketa Admin" : "Lihat Riwayat Pesanan"}
                </Button>
              </div>
            </div>

            <div className="w-full lg:w-[400px] h-[200px] rounded-2xl overflow-hidden border border-border shadow-xs relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"
                alt="Panen Segar Patra Tani"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-xs font-bold text-[#E6E4DA]">
                  Dari Kebun Langsung ke Dapur Usaha
                </span>
                <span className="text-[11px] text-white/80">
                  Timbangan pasti • Ongkir 100% hak petani
                </span>
              </div>
            </div>
          </section>

          <div className="px-6 lg:px-16 pt-6 pb-16 space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-2xl p-6 border border-border flex flex-col justify-between gap-4 transition-all hover:border-primary/40 hover:shadow-sm">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-surface-green text-primary flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      Direct Pre-Order
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-ink">Etalase Panen</h2>

                  <p className="text-sm text-ink-secondary leading-relaxed">
                    Beli langsung komoditas segar siap panen dari petani terdekat. Kuota pasti &amp; harga per kg tetap tanpa perantara gudang.
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">
                    {mockCommodities.length} Komoditas Siap Panen
                  </span>
                  {isFarmer && (
                    <button
                      type="button"
                      onClick={() => navigate("/etalase/create")}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-[#E6E4DA] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Buka Etalase</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {!isFarmer && !isAdmin && (
                    <button
                      type="button"
                      onClick={() => navigate("/explore")}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Jelajahi Panen</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-surface rounded-2xl p-6 border border-border flex flex-col justify-between gap-4 transition-all hover:border-primary/40 hover:shadow-sm">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#D97706]">
                      Demand-Driven
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-ink">Tender Permintaan</h2>

                  <p className="text-sm text-ink-secondary leading-relaxed">
                    Ajukan daftar kebutuhan sayur atau bumbu untuk operasional dapur UMKM (10–20+ kg). Petani sekitar akan memberikan penawaran terbaik.
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#D97706]">
                    {mockTenders.length} Tender Terbuka
                  </span>
                  {isBuyer && (
                    <button
                      type="button"
                      onClick={() => navigate("/tender/create")}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-[#E6E4DA] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Buka Tender</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {!isBuyer && !isAdmin && (
                    <button
                      type="button"
                      onClick={() => navigate("/explore")}
                      className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Semua Tender</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </section>

            {!isAdmin && (
              <>
                <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-ink">Ringkasan Usaha</h3>
                  <span className="text-xs text-ink-muted">Pembaruan Real-Time</span>
                </div>
  
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-ink-muted">Transaksi Aktif</span>
                      <Clock className="w-4 h-4 text-ink-muted" />
                    </div>
                    <p className="text-2xl font-bold text-ink">4</p>
                    <p className="text-[11px] text-ink-secondary mt-1">2 Bidding • 1 Handover</p>
                  </div>
  
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-ink-muted">Dana di Escrow</span>
                      <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                    </div>
                    <p className="text-2xl font-bold text-primary">Rp 1.585.000</p>
                    <p className="text-[11px] text-[#0D9488] font-medium mt-1">Aman dalam sandbox</p>
                  </div>
  
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-ink-muted">Menunggu Serah-Terima</span>
                      <Camera className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <p className="text-2xl font-bold text-ink">1 Pesanan</p>
                    <p className="text-[11px] text-[#2563EB] font-medium mt-1">Verifikasi kamera geotag</p>
                  </div>
  
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-ink-muted">Pendapatan Bulan Ini</span>
                      <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <p className="text-2xl font-bold text-ink">Rp 4.820.000</p>
                    <p className="text-[11px] text-ink-secondary mt-1">18 transaksi tuntas</p>
                  </div>
                </div>
              </section>
  
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-ink">Pesanan Aktif Berjalan</h3>
                  <span className="text-xs text-ink-muted">ID: TND-2026-005</span>
                </div>
  
                <div className="bg-surface rounded-2xl p-6 border border-border space-y-5 hover:border-primary/40 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <h4 className="text-base font-bold text-ink">
                        Pre-order Bawang Merah Brebes 25 Kg
                      </h4>
                      <p className="text-xs text-ink-secondary mt-0.5">
                        Mitra: Pak H. Solihin (Sentra Tani Baros) ↔ Resto Dapur Sunda Asli
                      </p>
                    </div>
  
                    <div className="flex items-center gap-2">
                      <StatusBadge status="HANDOVER" showIcon />
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Camera}
                        onClick={() => navigate("/handover")}
                      >
                        Verifikasi Kamera
                      </Button>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {transactionSteps.map((step) => {
                      const isCompleted = step.completed;
                      const isCurrent = step.current;
  
                      return (
                        <div
                          key={step.key}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between min-h-[90px] ${
                            isCurrent
                              ? "bg-[#DBEAFE] border-[#93C5FD]"
                              : isCompleted
                              ? "bg-[#DCFCE7] border-[#BBF7D0]"
                              : "bg-[#F1F5F9] border-[#E2E8F0]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isCurrent
                                  ? "text-[#1E40AF]"
                                  : isCompleted
                                  ? "text-[#15803D]"
                                  : "text-[#94A3B8]"
                              }`}
                            >
                              0{step.step}
                            </span>
                            {isCompleted && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                            )}
                          </div>
  
                          <div>
                            <p
                              className={`text-xs font-bold leading-tight ${
                                isCurrent
                                  ? "text-[#1E40AF]"
                                  : isCompleted
                                  ? "text-[#166534]"
                                  : "text-[#64748B]"
                              }`}
                            >
                              {step.label}
                            </p>
                            <span
                              className={`text-[10px] font-medium block mt-0.5 ${
                                isCurrent
                                  ? "text-[#2563EB]"
                                  : isCompleted
                                  ? "text-[#15803D]"
                                  : "text-[#94A3B8]"
                              }`}
                            >
                              {isCurrent
                                ? "Tahap Ini"
                                : isCompleted
                                ? "Tuntas"
                                : "Menunggu"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
  
                  <div className="p-3.5 rounded-xl bg-[#E6E4DA] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-ink">
                      <Truck className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        Metode: <strong className="font-semibold">Self-Pickup (Rp 0)</strong> • Lokasi: Soreang, Kab. Bandung
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-ink-muted">
                        Escrow: <strong className="text-ink font-semibold">Rp 800.000</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate("/escrow")}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        Detail Escrow
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              </>
            )}

            <section className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    Etalase &amp; Tender Terdekat
                  </h3>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Pilihan komoditas segar langsung dari petani dan permintaan pasokan UMKM
                  </p>
                </div>

                <div className="bg-surface p-1 rounded-xl border border-border flex items-center">
                  <button
                    type="button"
                    onClick={() => setFeedTab("KOMODITAS")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      feedTab === "KOMODITAS"
                        ? "bg-primary text-[#E6E4DA]"
                        : "text-ink-secondary hover:text-ink hover:bg-black/5"
                    }`}
                  >
                    Etalase Panen ({mockCommodities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedTab("TENDER")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      feedTab === "TENDER"
                        ? "bg-primary text-[#E6E4DA]"
                        : "text-ink-secondary hover:text-ink hover:bg-black/5"
                    }`}
                  >
                    Tender UMKM ({mockTenders.length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-semibold text-ink-muted shrink-0 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Kategori:
                </span>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  />
                ))}
              </div>

              {feedTab === "KOMODITAS" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCommodities.map((item) => (
                    <EtalaseCard key={item.id} commodity={item} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredTenders.map((tender) => (
                    <TenderCard key={tender.id} tender={tender} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
