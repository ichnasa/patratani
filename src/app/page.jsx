"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigate from "@/components/Navigate";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import {
  mockCommodities,
  mockTenders,
} from "@/data/mockData";
import {
  Camera,
  MapPin,
  Clock,
  Plus,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const { currentUser, activeTransaction, commodities, tenders } = useApp();

  const [inventoryCategory, setInventoryCategory] = useState("Semua");
  const [inventorySearch, setInventorySearch] = useState("");

  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin");

  if (isAdmin) {
    return <Navigate replace to="/admin/disputes" />;
  }

  const isBuyer = roleLower.includes("pembeli") || roleLower.includes("umkm");
  const isFarmer = !isBuyer; // Default is farmer if not buyer

  const commodityList = commodities && commodities.length > 0 ? commodities : mockCommodities;
  const tenderList = tenders && tenders.length > 0 ? tenders : mockTenders;

  // Active delivery task (handover)
  const rawHandover = activeTransaction || {
    id: "TRX-2026-089",
    tenderId: "TND-2026-005",
    title: "Stok Pisang Kepok Kuning Tua 40 Kg",
    status: "HANDOVER",
    farmerName: "Kang Rizal (Sentra Tani Baros)",
    buyerName: "Resto Dapur Sunda Asli (Bu Lina)",
    deliveryAddress: "Jl. Terusan Buahbatu No. 42, Bandung",
    schedule: "Hari ini • 07:00 - 09:00 WIB",
    amount: 800000,
  };

  const pendingHandover = {
    ...rawHandover,
    title: rawHandover.title || "Stok Pisang Kepok Kuning Tua 40 Kg",
    status: rawHandover.status || "HANDOVER",
    amount: Number(rawHandover.amount || rawHandover.escrowAmount || rawHandover.totalPayment || 800000),
    buyerName: rawHandover.buyerName || rawHandover.buyer?.businessName || rawHandover.buyer?.name || "Resto Dapur Sunda Asli (Bu Lina)",
    farmerName: rawHandover.farmerName || rawHandover.farmer?.name || "Kang Rizal",
    deliveryAddress: rawHandover.deliveryAddress || rawHandover.buyer?.address || "Jl. Terusan Buahbatu No. 42, Bandung",
    schedule: rawHandover.schedule || rawHandover.deliveryDate || "Hari ini • 07:00 - 09:00 WIB",
  };

  // Filtered harvest inventory for farmer
  const filteredInventory = commodityList.filter((item) => {
    const matchesCat = inventoryCategory === "Semua" || item.category === inventoryCategory;
    const matchesSearch = !inventorySearch || item.name.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ==========================================
  // FARMER DASHBOARD VIEW (Agricultural SaaS)
  // ==========================================
  if (isFarmer) {
    return (
      <div className="w-full flex-1 flex flex-col bg-background">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* 1. Page Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
                <span className="text-primary font-semibold">Kebun Binaan Pasirjambu, Ciwidey</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-ink-muted">Mitra ID: FRM-001</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                Portal Kebun &amp; Panen
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary">
                Kelola pasokan panen siap jual, pantau jadwal kirim, dan penuhi pesanan kuliner lokal.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => navigate("/etalase/create")}
              >
                Pasang Panen Baru
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/dashboard/farmer")}
              >
                Kelola Pesanan
              </Button>
            </div>
          </header>

          {/* 2. Priority Operational Task: Delivery Handover */}
          {pendingHandover && (
            <section
              aria-labelledby="priority-delivery-heading"
              className="bg-surface rounded-xl border border-border/90 shadow-xs overflow-hidden"
            >
              <div className="border-l-4 border-l-blue-600 p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        Tugas Jadwal Kirim Hari Ini
                      </span>
                      <span className="text-xs text-ink-muted">•</span>
                      <StatusBadge status="HANDOVER" size="sm" />
                      <span className="text-xs text-ink-muted">•</span>
                      <span className="text-[11px] font-mono text-ink-muted">{pendingHandover.tenderId}</span>
                    </div>

                    <div>
                      <h2 id="priority-delivery-heading" className="text-base sm:text-lg font-bold text-ink tracking-tight">
                        {pendingHandover.title}
                      </h2>
                    </div>

                    {/* Compact Context Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[11px] text-ink-muted block">Tujuan Pengantaran</span>
                          <span className="font-semibold text-ink block truncate">{pendingHandover.buyerName}</span>
                          <span className="text-[11px] text-ink-secondary block truncate">{pendingHandover.deliveryAddress}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] text-ink-muted block">Jadwal Tiba</span>
                          <span className="font-semibold text-ink block">{pendingHandover.schedule}</span>
                          <span className="text-[11px] text-blue-700 font-medium">Perlu serah terima di tempat</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] text-ink-muted block">Dana di Rekening Bersama</span>
                          <span className="font-bold text-primary block text-sm">Rp {pendingHandover.amount.toLocaleString("id-ID")}</span>
                          <span className="text-[11px] text-emerald-700 font-medium">Otomatis cair ke saldo Anda</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <div className="lg:pl-6 lg:border-l lg:border-border/60 shrink-0 flex flex-col justify-center">
                    <Button
                      variant="primary"
                      size="md"
                      icon={Camera}
                      onClick={() => navigate("/handover")}
                      className="w-full sm:w-auto shadow-sm"
                    >
                      Timbang &amp; Foto Barang
                    </Button>
                    <span className="text-[11px] text-ink-muted text-center mt-1.5 block">
                      Arahkan kamera ke barang &amp; timbangan
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 3. Business Summary Metrics (Compact 4-Column Grid) */}
          <section aria-labelledby="metrics-heading" className="space-y-2">
            <h2 id="metrics-heading" className="sr-only">
              Ringkasan Kinerja Kebun
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Metric 1 */}
              <div className="bg-surface rounded-xl p-4 border border-border/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-medium text-ink-muted block">Sayur Siap Petik</span>
                  <p className="text-2xl font-bold tracking-tight text-ink mt-1">2 Komoditas</p>
                </div>
                <p className="text-[11px] text-ink-secondary mt-2.5 pt-2 border-t border-border/60">
                  Tomat Mawar &amp; Pisang Kepok
                </p>
              </div>

              {/* Metric 2 */}
              <div className="bg-surface rounded-xl p-4 border border-border/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-medium text-ink-muted block">Sisa Kuota Belum Dipesan</span>
                  <p className="text-2xl font-bold tracking-tight text-ink mt-1">75 Kg</p>
                </div>
                <p className="text-[11px] text-primary font-medium mt-2.5 pt-2 border-t border-border/60">
                  Tersedia untuk pesanan resto
                </p>
              </div>

              {/* Metric 3: Delivery Focus */}
              <div className="bg-surface rounded-xl p-4 border border-blue-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-bl" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-900 block">Jadwal Kirim Hari Ini</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-blue-700 mt-1">1 Pengantaran</p>
                </div>
                <Link
                  href="/handover"
                  className="text-[11px] text-blue-700 hover:underline font-semibold mt-2.5 pt-2 border-t border-blue-100 block"
                >
                  Buka Serah Terima →
                </Link>
              </div>

              {/* Metric 4: Available Balance */}
              <div className="bg-surface rounded-xl p-4 border border-border/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-medium text-ink-muted block">Saldo Kas Siap Tarik</span>
                  <p className="text-2xl font-bold tracking-tight text-emerald-700 mt-1">
                    Rp 1.450.000
                  </p>
                </div>
                <Link
                  href="/profile"
                  className="text-[11px] text-emerald-800 hover:underline font-semibold mt-2.5 pt-2 border-t border-border/60 block"
                >
                  Tarik ke Rekening Bank →
                </Link>
              </div>
            </div>
          </section>

          {/* 4. Harvest Inventory Table ("Daftar Panen Kebun Saya") */}
          <section aria-labelledby="inventory-heading" className="bg-surface rounded-xl border border-border/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 id="inventory-heading" className="text-base font-bold text-ink">
                  Daftar Panen Kebun Saya
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Pantau stok sayur, tanggal panen, dan status ketersediaan kuota pre-order.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-44 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari komoditas..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-background text-xs text-ink border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <Link
                  href="/dashboard/farmer"
                  className="text-xs font-semibold text-primary hover:underline whitespace-nowrap pl-2"
                >
                  Kelola Semua →
                </Link>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-4 py-2 bg-[#E6E4DA]/30 border-b border-border/60 flex items-center gap-1.5 overflow-x-auto text-xs">
              {["Semua", "Sayuran Buah", "Cabai & Bumbu", "Sayuran Daun", "Buah-buahan"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setInventoryCategory(cat)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    inventoryCategory === cat
                      ? "bg-primary text-[#E6E4DA] font-semibold"
                      : "text-ink-secondary hover:text-ink hover:bg-black/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Clean Structured Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E6E4DA]/40 border-b border-border text-ink-muted font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4 w-[35%]">Komoditas</th>
                    <th scope="col" className="py-3 px-4 w-[15%]">Kategori</th>
                    <th scope="col" className="py-3 px-4 w-[15%]">Tanggal Panen</th>
                    <th scope="col" className="py-3 px-4 text-right w-[15%]">Harga / Kg</th>
                    <th scope="col" className="py-3 px-4 text-right w-[10%]">Sisa Kuota</th>
                    <th scope="col" className="py-3 px-4 text-right w-[10%]">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.slice(0, 4).map((item) => {
                      const total = item.totalQuotaKg || item.quotaKg || 50;
                      const available = item.availableQuotaKg || item.quotaKg || 35;
                      const isLowStock = available <= total * 0.3;

                      return (
                        <tr key={item.id} className="hover:bg-black/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-11 h-11 rounded-lg object-cover border border-border shrink-0 bg-[#E6E4DA]"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-ink text-sm block leading-snug truncate">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-ink-muted font-normal block truncate">
                                  {item.farmer?.farmName || "Kebun Pasirjambu"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-ink-secondary">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-black/5 text-[11px] font-medium text-ink-secondary">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-ink font-medium">
                            {item.harvestDate}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-ink text-sm block">
                              Rp {item.pricePerKg.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] text-ink-muted">per kg</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              <span className="font-bold text-ink text-sm">
                                {available} <span className="font-normal text-xs text-ink-muted">/ {total} kg</span>
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 ${
                                  isLowStock
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {isLowStock ? "Sisa Sedikit" : "Tersedia"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/etalase/${item.id}`)}
                            >
                              Lihat Etalase
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted">
                        Tidak ada komoditas panen yang cocok dengan pencarian Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Restaurant Tenders (Demand Opportunities for Farmers) */}
          <section aria-labelledby="tenders-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="tenders-heading" className="text-base font-bold text-ink">
                  Permintaan Sayur dari Warung &amp; Resto
                </h2>
                <p className="text-xs text-ink-secondary">
                  Dapur kuliner sekitar sedang mencari pasokan sayur segar. Silakan tawarkan harga terbaik Anda.
                </p>
              </div>
              <Link href="/explore" className="text-xs font-semibold text-primary hover:underline">
                Lihat Semua Permintaan →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tenderList.slice(0, 4).map((tender) => (
                <div
                  key={tender.id}
                  className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs flex flex-col justify-between gap-3 hover:border-primary/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary font-semibold">{tender.category}</span>
                      <span className="text-ink-muted text-[11px]">Batas: {tender.deadlineDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-ink leading-snug">{tender.title}</h3>
                    <p className="text-xs text-ink-secondary">
                      Pemesan: <strong className="text-ink">{tender.buyer?.businessName}</strong> • Radius {tender.buyer?.distanceKm || 3} km
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-ink-muted text-[10px] block">Maksimal Anggaran</span>
                      <span className="font-bold text-primary text-sm">
                        Rp {tender.targetPricePerKg.toLocaleString("id-ID")} <span className="font-normal text-xs text-ink-muted">/ kg</span>
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/tender/${tender.id}`)}
                    >
                      Tawarkan Harga
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    );
  }

  // ==========================================
  // BUYER DASHBOARD VIEW (Kitchen Procurement)
  // ==========================================
  return (
    <div className="w-full flex-1 flex flex-col bg-background">
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. Buyer Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-900">
              <span className="font-semibold">Warung Sederhana Bu Lina • Bandung</span>
              <span>•</span>
              <span className="text-ink-secondary">Akun UMKM Kuliner</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Dapur &amp; Belanja Sayur
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary">
              Pesan sayur dan bumbu segar langsung dari kebun petani sekitar, timbangan pas dan uang aman.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => navigate("/tender/create")}
            >
              Cari Pasokan Baru
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate("/explore")}
            >
              Lihat Pasar Sayur
            </Button>
          </div>
        </header>

        {/* 2. Priority Operational Task for Buyer */}
        {pendingHandover && (
          <section
            aria-labelledby="buyer-delivery-heading"
            className="bg-surface rounded-xl border border-emerald-200/90 shadow-xs overflow-hidden"
          >
            <div className="border-l-4 border-l-emerald-600 p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      Petani Sudah Sampai di Tempat Anda
                    </span>
                    <span className="text-xs text-ink-muted">•</span>
                    <StatusBadge status="HANDOVER" size="sm" />
                    <span className="text-xs text-ink-muted">•</span>
                    <span className="text-[11px] font-mono text-ink-muted">{pendingHandover.tenderId}</span>
                  </div>

                  <div>
                    <h2 id="buyer-delivery-heading" className="text-base sm:text-lg font-bold text-ink tracking-tight">
                      {pendingHandover.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-ink-muted block">Petani Pengirim</span>
                        <span className="font-semibold text-ink block truncate">{pendingHandover.farmerName}</span>
                        <span className="text-[11px] text-ink-secondary block truncate">{pendingHandover.deliveryAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-ink-muted block">Jadwal Tiba</span>
                        <span className="font-semibold text-ink block">{pendingHandover.schedule}</span>
                        <span className="text-[11px] text-blue-700 font-medium">Siap diperiksa &amp; timbang</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-ink-muted block">Total Tagihan</span>
                        <span className="font-bold text-primary block text-sm">Rp {pendingHandover.amount.toLocaleString("id-ID")}</span>
                        <span className="text-[11px] text-emerald-700 font-medium">Aman di rekening bersama</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:pl-6 lg:border-l lg:border-border/60 shrink-0 flex flex-col justify-center">
                  <Button
                    variant="primary"
                    size="md"
                    icon={Camera}
                    onClick={() => navigate("/handover")}
                    className="w-full sm:w-auto shadow-sm"
                  >
                    Timbang &amp; Terima Barang
                  </Button>
                  <span className="text-[11px] text-ink-muted text-center mt-1.5 block">
                    Cek fisik &amp; timbangan di dapur Anda
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Buyer Summary Metrics */}
        <section aria-labelledby="buyer-metrics-heading" className="space-y-2">
          <h2 id="buyer-metrics-heading" className="sr-only">
            Ringkasan Pengadaan Dapur
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-surface rounded-xl p-4 border border-border/80 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-ink-muted block">Kebutuhan Dapur</span>
                <p className="text-2xl font-bold tracking-tight text-ink mt-1">2 Permintaan</p>
              </div>
              <p className="text-[11px] text-amber-800 font-medium mt-2.5 pt-2 border-t border-border/60">
                3 Petani menawarkan pasokan
              </p>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-blue-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-bl" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-900 block">Barang Sedang Diantar</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-blue-700 mt-1">1 Pesanan</p>
              </div>
              <Link
                href="/handover"
                className="text-[11px] text-blue-700 hover:underline font-semibold mt-2.5 pt-2 border-t border-blue-100 block"
              >
                Cek Kedatangan Kurir →
              </Link>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-border/80 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-ink-muted block">Dana di Rekening Bersama</span>
                <p className="text-2xl font-bold tracking-tight text-primary mt-1">Rp 1.585.000</p>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium mt-2.5 pt-2 border-t border-border/60">
                Aman hingga barang sesuai
              </p>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-border/80 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-ink-muted block">Total Belanja Bulan Ini</span>
                <p className="text-2xl font-bold tracking-tight text-ink mt-1">Rp 4.820.000</p>
              </div>
              <p className="text-[11px] text-ink-secondary mt-2.5 pt-2 border-t border-border/60">
                18 transaksi selesai
              </p>
            </div>
          </div>
        </section>

        {/* 4. Buyer's Active Tenders */}
        <section aria-labelledby="buyer-tenders-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="buyer-tenders-heading" className="text-base font-bold text-ink">
                Daftar Sayur yang Sedang Anda Cari
              </h2>
              <p className="text-xs text-ink-secondary">
                Kebutuhan dapur yang Anda pasang, beserta penawaran harga dari petani mitra.
              </p>
            </div>
            <Link href="/dashboard/buyer" className="text-xs font-semibold text-primary hover:underline">
              Kelola di Dasbor →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary font-semibold">Sayur Buah</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                    3 Penawaran Masuk
                  </span>
                </div>
                <h3 className="text-sm font-bold text-ink leading-snug">Kebutuhan Tomat Merah Segar (20 kg)</h3>
                <p className="text-xs text-ink-secondary">
                  Anggaran: Rp 14.000 / kg • Batas Bidding: 28 Okt 2026
                </p>
              </div>

              <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-primary">Penawaran terendah: Rp 12.000/kg</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/tender/pembeli/TND-8821")}
                >
                  Pilih Petani
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary font-semibold">Cabai &amp; Bumbu</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                    Pemenang Terpilih
                  </span>
                </div>
                <h3 className="text-sm font-bold text-ink leading-snug">Cabai Rawit Merah Kualitas Super (15 kg)</h3>
                <p className="text-xs text-ink-secondary">
                  Pemenang: Pak Wayan • Pengantaran Dijadwalkan 29 Okt
                </p>
              </div>

              <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-ink-muted">Escrow: Rp 690.000</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/escrow")}
                >
                  Lihat Status Escrow
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Fresh Produce Direct from Nearby Farms */}
        <section aria-labelledby="nearby-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="nearby-heading" className="text-base font-bold text-ink">
                Sayur Segar dari Kebun Sekitar (&lt; 10 km)
              </h2>
              <p className="text-xs text-ink-secondary">
                Beli langsung hasil panen dari kebun terdekat tanpa perantara gudang.
              </p>
            </div>
            <Link href="/explore" className="text-xs font-semibold text-primary hover:underline">
              Lihat Semua Sayur →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {commodityList.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/etalase/${item.id}`)}
                className="bg-surface border border-border/80 rounded-xl overflow-hidden hover:border-primary/60 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="relative h-36 w-full bg-[#E6E4DA] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-black/75 text-white backdrop-blur-xs">
                      {item.farmer?.distanceKm || 3.5} km dari dapur
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <span className="text-[11px] text-primary font-medium block">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-ink line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-ink-muted line-clamp-1">
                      Kebun: {item.farmer?.name}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-0 flex items-center justify-between border-t border-border/60 mt-2">
                  <div>
                    <span className="text-[10px] text-ink-muted block">Harga Bersih</span>
                    <span className="text-sm font-bold text-primary">
                      Rp {item.pricePerKg.toLocaleString("id-ID")}<span className="text-xs font-normal text-ink-muted">/kg</span>
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-primary group-hover:underline">
                    Pesan Sekarang →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
