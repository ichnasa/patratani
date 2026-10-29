"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigate from "@/components/Navigate";
import React from "react";
import { useApp } from "@/context/AppContext";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import {
  mockCommodities,
  mockTenders,
} from "@/data/mockData";
import {
  ShoppingBag,
  FileText,
  ArrowRight,
  ChevronRight,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Plus,
  Coins,
  Store,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const { currentUser, activeTransaction, commodities, tenders } = useApp();

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
    title: "Bawang Merah Brebes 25 Kg",
    status: "HANDOVER",
    farmerName: "Kang Rizal (Sentra Tani Baros)",
    buyerName: "Resto Dapur Sunda Asli (Bu Lina)",
    deliveryAddress: "Jl. Terusan Buahbatu No. 42, Bandung",
    schedule: "Hari ini • 07:00 - 09:00 WIB",
    amount: 800000,
  };

  const pendingHandover = {
    ...rawHandover,
    title: rawHandover.title || "Bawang Merah Brebes 25 Kg",
    status: rawHandover.status || "HANDOVER",
    amount: Number(rawHandover.amount || rawHandover.escrowAmount || rawHandover.totalPayment || 800000),
    buyerName: rawHandover.buyerName || rawHandover.buyer?.businessName || rawHandover.buyer?.name || "Resto Dapur Sunda Asli",
    farmerName: rawHandover.farmerName || rawHandover.farmer?.name || "Kang Rizal",
    deliveryAddress: rawHandover.deliveryAddress || rawHandover.buyer?.address || "Jl. Terusan Buahbatu No. 42, Bandung",
    schedule: rawHandover.schedule || rawHandover.deliveryDate || "Hari ini • 07:00 - 09:00 WIB",
  };

  if (isFarmer) {
    return (
      <div className="w-full flex-1 flex flex-col">
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-16 py-8 space-y-10">

          {/* 1. Farmer Hub Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                <span>Kebun Binaan Pasirjambu, Ciwidey</span>
                <span>•</span>
                <span className="text-ink-secondary">Mitra ID: FRM-001</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">
                Portal Kebun &amp; Panen
              </h1>
              <p className="text-sm text-ink-secondary mt-1">
                Kelola pasokan siap panen dan penuhi tender bahan baku usaha kuliner lokal.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => navigate("/etalase/create")}
              >
                Buka Etalase Panen
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/dashboard/farmer")}
              >
                Dasbor Operasional
              </Button>
            </div>
          </div>

          {/* 2. Farmer Key Numbers (Tabular Strip, No Cluttered Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-surface border border-border">
            <div>
              <span className="text-xs text-ink-muted block">Panen Siap Jual</span>
              <span className="text-xl font-bold text-ink mt-0.5 block">2 Komoditas</span>
              <span className="text-[11px] text-ink-secondary">Tomat &amp; Cabai</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted block">Sisa Kuota Belum Dipesan</span>
              <span className="text-xl font-bold text-ink mt-0.5 block">50 Kg</span>
              <span className="text-[11px] text-primary font-medium">Bisa dipesan resto</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted block">Pengantaran Hari Ini</span>
              <span className="text-xl font-bold text-blue-600 mt-0.5 block">1 Jadwal</span>
              <span className="text-[11px] text-blue-700 font-medium">Perlu serah terima</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted block">Saldo Kas Siap Tarik</span>
              <span className="text-xl font-bold text-[#16A34A] mt-0.5 block">Rp 1.450.000</span>
              <Link href="/profile" className="text-[11px] text-primary hover:underline font-semibold block">
                Tarik ke Rekening →
              </Link>
            </div>
          </div>

          {/* 3. Actionable Task: Today's Delivery (Handover) */}
          {pendingHandover && (
            <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-xs font-bold text-blue-700">Tugas Pengantaran Hari Ini</span>
                  <span className="text-xs text-ink-muted">•</span>
                  <StatusBadge status="HANDOVER" size="sm" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-ink">
                  {pendingHandover.title}
                </h3>
                <p className="text-xs text-ink-secondary">
                  Tujuan: <strong>{pendingHandover.buyerName}</strong> ({pendingHandover.deliveryAddress})
                </p>
                <div className="flex items-center gap-3 text-xs text-ink-muted pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {pendingHandover.schedule}
                  </span>
                  <span>•</span>
                  <span>Escrow: Rp {pendingHandover.amount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  icon={Camera}
                  onClick={() => navigate("/handover")}
                >
                  Buka Kamera Serah Terima
                </Button>
              </div>
            </div>
          )}

          {/* 4. Farmer's Active Listings Table / Manifest */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Hasil Panen Kebun Saya</h2>
                <p className="text-xs text-ink-secondary">Jadwal panen dan sisa kuota yang dibuka untuk pre-order pembeli.</p>
              </div>
              <Link href="/dashboard/farmer" className="text-xs font-semibold text-primary hover:underline">
                Kelola Semua Panen →
              </Link>
            </div>

            <div className="border border-border rounded-xl bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#E6E4DA]/50 border-b border-border text-ink-muted font-semibold">
                    <tr>
                      <th className="py-3 px-4">Komoditas</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Harga / Kg</th>
                      <th className="py-3 px-4">Tanggal Panen</th>
                      <th className="py-3 px-4">Sisa Kuota</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {commodityList.slice(0, 3).map((item) => (
                      <tr key={item.id} className="hover:bg-black/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-ink flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                          />
                          <div>
                            <span className="block">{item.name}</span>
                            <span className="text-[11px] text-ink-muted font-normal">{item.farmer?.farmName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-ink-secondary">{item.category}</td>
                        <td className="py-3 px-4 font-semibold text-primary">
                          Rp {item.pricePerKg.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-ink">{item.harvestDate}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink">{item.availableQuotaKg || item.quotaKg}</span> / {item.totalQuotaKg || item.quotaKg} kg
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/etalase/${item.id}`}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Lihat Etalase
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 5. Tenders Looking for Produce (Demand Matching for Farmers) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Permintaan Tender Restoran Terbuka</h2>
                <p className="text-xs text-ink-secondary">Dapur kuliner lokal sedang mencari pasokan rutin. Ajukan harga penawaran Anda.</p>
              </div>
              <Link href="/explore" className="text-xs font-semibold text-primary hover:underline">
                Lihat Semua Tender →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenderList.slice(0, 4).map((tender) => (
                <div key={tender.id} className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary font-semibold">{tender.category}</span>
                      <span className="text-ink-muted">Batas: {tender.deadlineDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-ink">{tender.title}</h3>
                    <p className="text-xs text-ink-secondary">
                      Pemesan: {tender.buyer?.businessName} • Radius {tender.buyer?.distanceKm || 3} km
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="text-ink-muted text-[11px] block">Anggaran Maksimal</span>
                      <span className="font-bold text-primary text-sm">
                        Rp {tender.targetPricePerKg.toLocaleString("id-ID")} / kg
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/tender/${tender.id}`)}
                    >
                      Ajukan Bidding
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
  // BUYER HOME VIEW (Kitchen Procurement Hub)
  // ==========================================
  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-16 py-8 space-y-10">

        {/* 1. Buyer Hub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold">
              <span>Warung Sederhana Bu Lina • Bandung</span>
              <span>•</span>
              <span className="text-ink-secondary">Akun UMKM Kuliner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">
              Portal Pengadaan Dapur
            </h1>
            <p className="text-sm text-ink-secondary mt-1">
              Pesan bahan baku segar langsung dari petani lokal dengan rekening bersama tanpa perantara.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => navigate("/tender/create")}
            >
              Buka Tender Baru
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate("/explore")}
            >
              Belanja Panen Kebun
            </Button>
          </div>
        </div>

        {/* 2. Buyer Key Numbers (Tabular Strip, No Cluttered Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-surface border border-border">
          <div>
            <span className="text-xs text-ink-muted block">Tender Dapur Aktif</span>
            <span className="text-xl font-bold text-ink mt-0.5 block">2 Tender</span>
            <span className="text-[11px] text-amber-800 font-medium">3 Penawaran masuk</span>
          </div>
          <div>
            <span className="text-xs text-ink-muted block">Pesanan Menuju Dapur</span>
            <span className="text-xl font-bold text-blue-600 mt-0.5 block">1 Pengantaran</span>
            <span className="text-[11px] text-blue-700 font-medium">Siap diperiksa hari ini</span>
          </div>
          <div>
            <span className="text-xs text-ink-muted block">Dana Tersimpan di Escrow</span>
            <span className="text-xl font-bold text-primary mt-0.5 block">Rp 1.585.000</span>
            <span className="text-[11px] text-primary font-medium">Aman di rekening bersama</span>
          </div>
          <div>
            <span className="text-xs text-ink-muted block">Total Belanja Bulan Ini</span>
            <span className="text-xl font-bold text-ink mt-0.5 block">Rp 4.820.000</span>
            <span className="text-[11px] text-ink-secondary">18 transaksi tuntas</span>
          </div>
        </div>

        {/* 3. Actionable Task: Incoming Shipment for Buyer (Handover) */}
        {pendingHandover && (
          <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-bold text-emerald-800">Kurir Petani Telah Tiba di Dapur</span>
                <span className="text-xs text-ink-muted">•</span>
                <StatusBadge status="HANDOVER" size="sm" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-ink">
                {pendingHandover.title}
              </h3>
              <p className="text-xs text-ink-secondary">
                Petani Pengirim: <strong>{pendingHandover.farmerName}</strong>
              </p>
              <div className="flex items-center gap-3 text-xs text-ink-muted pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Alamat Dapur: {pendingHandover.deliveryAddress}
                </span>
                <span>•</span>
                <span>Nilai: Rp {pendingHandover.amount.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                variant="primary"
                size="md"
                icon={Camera}
                onClick={() => navigate("/handover")}
              >
                Periksa Timbangan &amp; Terima
              </Button>
            </div>
          </div>
        )}

        {/* 4. Active Kitchen Tenders for Buyer */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Tender Pengadaan Dapur Saya</h2>
              <p className="text-xs text-ink-secondary">Permintaan pasokan yang Anda buka dan penawaran harga masuk dari petani.</p>
            </div>
            <Link href="/dashboard/buyer" className="text-xs font-semibold text-primary hover:underline">
              Kelola di Dasbor →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary font-semibold">Sayur Buah</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                    3 Penawaran Masuk
                  </span>
                </div>
                <h3 className="text-sm font-bold text-ink">Kebutuhan Tomat Merah Segar (20 kg)</h3>
                <p className="text-xs text-ink-secondary">
                  Anggaran: Rp 14.000 / kg • Batas Bidding: 28 Okt 2026
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">Penawaran terendah: Rp 12.000/kg</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/tender/pembeli/TND-8821")}
                >
                  Tinjau &amp; Pilih Petani
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary font-semibold">Cabai &amp; Bumbu</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                    Pemenang Terpilih
                  </span>
                </div>
                <h3 className="text-sm font-bold text-ink">Cabai Rawit Merah Kualitas Super (15 kg)</h3>
                <p className="text-xs text-ink-secondary">
                  Pemenang: Pak Wayan • Pengantaran Dijadwalkan 29 Okt
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs text-ink-muted">Escrow: Rp 690.000</span>
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Hasil Panen Segar Terdekat (&lt; 10 km)</h2>
              <p className="text-xs text-ink-secondary">Beli langsung kuota panen segar dari kebun mitra tanpa perantara gudang.</p>
            </div>
            <Link href="/explore" className="text-xs font-semibold text-primary hover:underline">
              Jelajahi Semua Panen →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {commodityList.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/etalase/${item.id}`)}
                className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/60 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 w-full bg-[#E6E4DA]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/70 text-white backdrop-blur-xs">
                      {item.farmer?.distanceKm || 3.5} km dari dapur
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <span className="text-[11px] text-primary font-medium block">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-ink line-clamp-1">
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
                  <span className="text-xs font-semibold text-primary hover:underline">
                    Pesan Kuota →
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
