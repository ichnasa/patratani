import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Chip from "../components/Chip";
import { mockCommodities } from "../data/mockCommodities";
import { mockTenders } from "../data/mockTenders";
import {
  Sprout,
  ShoppingBag,
  FileText,
  ShieldCheck,
  Camera,
  Truck,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Store,
  Layers,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

export default function HomePage() {
  const [role, setRole] = useState("PEMBELI");
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-28 md:pb-14">
        <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-green text-primary text-xs font-semibold border border-primary/10">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Agritech Terdesentralisasi • Tanpa Gudang
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink">
                Halo, <span className="text-primary">Rizal!</span> 👋
              </h1>

              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
                {role === "PEMBELI"
                  ? "Dapatkan pasokan sayur & buah segar langsung dari kebun petani lokal dengan kuota pasti, harga adil, dan tanpa gudang penumpukan."
                  : "Kelola kuota panen Anda, terima tender pasokan langsung dari warung dan restoran lokal, dengan jaminan pembayaran di escrow."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  icon={role === "PEMBELI" ? FileText : ShoppingBag}
                >
                  {role === "PEMBELI" ? "Buat Tender Permintaan" : "Unggah Hasil Panen"}
                </Button>
                <Button
                  variant="outline"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Lihat Riwayat Pesanan
                </Button>
              </div>
            </div>

            <div className="bg-[#E6E4DA] p-4 sm:p-5 rounded-2xl border border-border flex flex-col items-center sm:items-start min-w-[280px]">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2.5">
                Beralih Mode Tampilan
              </span>

              <div className="bg-surface p-1 rounded-xl border border-border flex items-center w-full">
                <button
                  type="button"
                  onClick={() => setRole("PEMBELI")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                    role === "PEMBELI"
                      ? "bg-primary text-[#E6E4DA] shadow-xs"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Pembeli UMKM</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("PETANI")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                    role === "PETANI"
                      ? "bg-primary text-[#E6E4DA] shadow-xs"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Petani Kecil</span>
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  {role === "PEMBELI"
                    ? "Mode aktif: Pengadaan UMKM & HoReCa"
                    : "Mode aktif: Penawaran Petani Mitra"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-surface rounded-3xl p-6 border border-border hover:border-primary/40 transition-all duration-200 group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-surface-green text-primary flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  Direct Pre-Order
                </span>
              </div>

              <h2 className="text-xl font-bold text-ink">Etalase Panen</h2>

              <p className="text-sm text-ink-secondary leading-relaxed">
                Pesan komoditas segar langsung dari petani lokal yang siap panen hari ini. Kuota timbangan pasti, tanpa perantara gudang, dan self-pickup Rp 0.
              </p>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-border/60 mt-4">
              <span className="text-xs font-semibold text-primary">
                {mockCommodities.length} Komoditas Tersedia
              </span>
              <button
                type="button"
                onClick={() => setFeedTab("KOMODITAS")}
                className="text-xs font-bold text-ink hover:text-primary flex items-center gap-1 transition-colors"
              >
                <span>Buka Etalase</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-6 border border-border hover:border-primary/40 transition-all duration-200 group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#D97706]">
                  Demand-Tender
                </span>
              </div>

              <h2 className="text-xl font-bold text-ink">Tender Permintaan</h2>

              <p className="text-sm text-ink-secondary leading-relaxed">
                Ajukan daftar kebutuhan sayur atau bumbu untuk operasional dapur UMKM (10–20+ kg). Petani sekitar akan memberikan penawaran harga terbaik.
              </p>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-border/60 mt-4">
              <span className="text-xs font-semibold text-[#D97706]">
                {mockTenders.length} Tender Sedang Berjalan
              </span>
              <button
                type="button"
                onClick={() => setFeedTab("TENDER")}
                className="text-xs font-bold text-ink hover:text-primary flex items-center gap-1 transition-colors"
              >
                <span>Buka Tender</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-ink-muted">Transaksi Aktif</span>
              <Clock className="w-4 h-4 text-ink-muted" />
            </div>
            <p className="text-2xl font-bold text-ink">4</p>
            <p className="text-[11px] text-ink-secondary mt-1">2 Bidding • 1 Handover</p>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-ink-muted">Dana di Escrow</span>
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
            </div>
            <p className="text-2xl font-bold text-primary">Rp 1.585.000</p>
            <p className="text-[11px] text-[#0D9488] font-medium mt-1">Aman dalam sandbox</p>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-ink-muted">Serah Terima</span>
              <Camera className="w-4 h-4 text-[#2563EB]" />
            </div>
            <p className="text-2xl font-bold text-ink">1 Menunggu</p>
            <p className="text-[11px] text-[#2563EB] font-medium mt-1">Verifikasi kamera geotag</p>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-ink-muted">Total Transaksi</span>
              <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            </div>
            <p className="text-2xl font-bold text-ink">18 Selesai</p>
            <p className="text-[11px] text-ink-secondary mt-1">Akumulasi Rp 4.820.000</p>
          </div>
        </section>

        <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Pelacak Status Pesanan Aktif
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  ID: TND-2026-005
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink">
                Pre-order Bawang Merah Brebes 25 Kg
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Mitra: Pak H. Solihin (Sentra Tani Baros) ↔ Resto Dapur Sunda Asli
              </p>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status="HANDOVER" showIcon showDot />
              <Button variant="primary" size="sm" icon={Camera}>
                Verifikasi Kamera
              </Button>
            </div>
          </div>

          <div className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {transactionSteps.map((step) => {
                const isCompleted = step.completed;
                const isCurrent = step.current;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-2xl border transition-all duration-150 flex flex-col justify-between min-h-[90px] ${
                      isCurrent
                        ? "bg-[#DBEAFE] border-[#BFDBFE] ring-2 ring-[#2563EB]/20"
                        : isCompleted
                        ? "bg-[#DCFCE7]/60 border-[#BBF7D0]"
                        : "bg-[#E6E4DA]/40 border-border opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        Step 0{step.step}
                      </span>
                      {isCompleted && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                      )}
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                      )}
                    </div>

                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isCurrent
                            ? "text-[#1E40AF]"
                            : isCompleted
                            ? "text-[#166534]"
                            : "text-ink-secondary"
                        }`}
                      >
                        {step.label}
                      </p>
                      <span className="text-[10px] text-ink-muted">
                        {isCurrent
                          ? "Kamera aktif"
                          : isCompleted
                          ? "Tuntas"
                          : "Menunggu"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-[#E6E4DA] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-ink">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Metode: <strong className="font-semibold">Self-Pickup (Rp 0)</strong> • Lokasi: Soreang, Kab. Bandung
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Escrow Tertahan: <strong className="text-ink font-semibold">Rp 800.000</strong>
                </span>
                <span className="text-primary font-semibold hover:underline cursor-pointer">
                  Detail Faktur
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">
                Etalase &amp; Tender Terdekat
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Komoditas pertanian siap panen dan permintaan pasokan lokal sekitar Bandung Raya
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-surface p-1 rounded-xl border border-border flex items-center">
                <button
                  type="button"
                  onClick={() => setFeedTab("KOMODITAS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    feedTab === "KOMODITAS"
                      ? "bg-primary text-[#E6E4DA]"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  Etalase Panen ({mockCommodities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFeedTab("TENDER")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    feedTab === "TENDER"
                      ? "bg-primary text-[#E6E4DA]"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  Tender UMKM ({mockTenders.length})
                </button>
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCommodities.map((item) => (
                <article
                  key={item.id}
                  className="bg-surface rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-[#E6E4DA] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1A1A1A]/80 backdrop-blur-md text-[#E6E4DA]">
                          {item.grade}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-green text-primary border border-primary/20">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-primary text-[#E6E4DA] shadow-xs">
                          Rp {item.pricePerKg.toLocaleString("id-ID")}/kg
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-ink leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-ink-secondary line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#E6E4DA] border border-border/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.farmer.avatar}
                            alt={item.farmer.name}
                            className="w-7 h-7 rounded-full object-cover border border-border"
                          />
                          <div>
                            <p className="font-semibold text-ink leading-tight">
                              {item.farmer.name}
                            </p>
                            <p className="text-[10px] text-ink-muted">
                              {item.farmer.farmName}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-medium text-ink flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            {item.farmer.distanceKm} km
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-ink-secondary pt-1">
                        <div className="flex items-center justify-between">
                          <span>Sisa Kuota Panen:</span>
                          <strong className="text-ink font-semibold">
                            {item.quotaKg} Kg
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pengiriman:</span>
                          <span className="text-ink font-medium">
                            Self-pickup Rp0 • Kurir Rp {item.logistics.farmerDelivery.fixedFee.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Button variant="primary" fullWidth size="md">
                      Pesan Langsung
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTenders.map((tender) => (
                <article
                  key={tender.id}
                  className="bg-surface rounded-3xl p-6 border border-border hover:border-primary/50 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">
                            {tender.category}
                          </span>
                          <span className="text-xs text-ink-muted">•</span>
                          <span className="text-xs text-ink-muted">
                            Kebutuhan {tender.requiredQuantityKg} Kg
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-ink">
                          {tender.title}
                        </h3>
                      </div>

                      <StatusBadge status={tender.status} size="sm" showIcon />
                    </div>

                    <p className="text-xs text-ink-secondary leading-relaxed bg-[#E6E4DA] p-3 rounded-xl border border-border/80">
                      "{tender.specifications}"
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-surface border border-border/60">
                        <span className="text-[10px] text-ink-muted block uppercase font-medium">
                          Target Harga
                        </span>
                        <strong className="text-sm font-bold text-primary mt-0.5 block">
                          Rp {tender.targetPricePerKg.toLocaleString("id-ID")}/kg
                        </strong>
                        <span className="text-[10px] text-ink-muted">
                          Total Rp {tender.totalBudget.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface border border-border/60">
                        <span className="text-[10px] text-ink-muted block uppercase font-medium">
                          Pemohon UMKM
                        </span>
                        <strong className="text-xs font-semibold text-ink mt-0.5 block truncate">
                          {tender.buyer.businessName}
                        </strong>
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          {tender.buyer.distanceKm} km
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-border/80 flex items-center justify-between gap-3">
                    <div className="text-xs text-ink-muted">
                      Batas waktu: <strong className="text-ink">{tender.deadlineDate}</strong>
                    </div>

                    <Button variant="primary" size="sm">
                      Ajukan Penawaran
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
