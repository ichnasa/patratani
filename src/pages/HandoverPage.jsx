import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Check,
  ArrowLeft,
  Store,
  X,
  FileCheck2,
} from "lucide-react";

export default function HandoverPage({ onBack, onComplete }) {
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [actualWeight, setActualWeight] = useState("25.2");
  const [checklist, setChecklist] = useState({
    freshness: true,
    aroma: true,
    sorting: true,
    packaging: true,
  });
  const [isReleasing, setIsReleasing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputed, setIsDisputed] = useState(false);

  const handoverData = {
    tenderId: "TND-2026-005",
    title: "Pre-order Bawang Merah Brebes 25 Kg",
    commodityName: "Bawang Merah Brebes Super",
    targetQuantityKg: 25.0,
    agreedPricePerKg: 32000,
    escrowAmount: 800000,
    netFarmerPayment: 772000,
    platformFee: 28000,
    samplePhoto:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
    geotag: {
      latitude: "-6.860451° S",
      longitude: "107.589923° E",
      accuracy: "4 meter (Presisi Tinggi)",
      address: "Jl. Gegerkalong Girang No. 34, Sukasari, Kota Bandung",
    },
    timestamp: "27 Okt 2026, 12:00:37 WIB",
    hash: "GEO-VERIFY-882194",
    farmer: {
      name: "Pak H. Solihin",
      farmName: "Sentra Tani Baros",
      phone: "+62 813-9821-4451",
      avatar:
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      status: "CONFIRMED",
      confirmedTime: "11:45 WIB",
    },
    buyer: {
      businessName: "Resto Dapur Sunda Asli",
      contactPerson: "Kang Asep Kurnia",
      businessType: "Restoran Tradisional Sunda",
      address: "Jl. Gegerkalong Girang No. 34, Bandung",
      status: "CHECKING",
    },
  };

  const parsedActualWeight = parseFloat(actualWeight) || 0;
  const weightDiff = (parsedActualWeight - handoverData.targetQuantityKg).toFixed(1);
  const isWeightValid = parsedActualWeight >= handoverData.targetQuantityKg;

  const allChecklistPassed =
    checklist.freshness &&
    checklist.aroma &&
    checklist.sorting &&
    checklist.packaging &&
    isWeightValid;

  const toggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCapturePhoto = () => {
    setIsPhotoCaptured((prev) => !prev);
  };

  const handleReleaseFunds = () => {
    setIsReleasing(true);
    setTimeout(() => {
      setIsReleasing(false);
      setIsCompleted(true);
      if (onComplete) {
        onComplete();
      }
    }, 1200);
  };

  const handleReportDispute = (e) => {
    e.preventDefault();
    setIsDisputeModalOpen(false);
    setIsDisputed(true);
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="transaksi" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-primary transition-colors cursor-pointer select-none mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Riwayat Transaksi</span>
            </button>

            <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
                <div>
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                    Verifikasi Fisik di Lokasi • {handoverData.tenderId}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight mt-0.5">
                    Serah Terima &amp; Verifikasi Kamera Geotag
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={
                      isCompleted
                        ? "COMPLETED"
                        : isDisputed
                        ? "DISPUTED"
                        : "HANDOVER"
                    }
                    size="md"
                    showIcon
                    showDot
                  />
                </div>
              </div>

              <p className="text-xs text-ink-secondary mt-3 leading-relaxed">
                Pemeriksaan fisik dilakukan bersama antara pembeli dan petani. Dana escrow sebesar <strong>Rp {handoverData.escrowAmount.toLocaleString("id-ID")}</strong> baru akan dilepaskan ke petani setelah foto bukti berstempel geotag diambil dan checklist mutu disetujui.
              </p>
            </section>
          </div>

          {isCompleted ? (
            <section className="bg-surface rounded-2xl p-8 sm:p-10 border border-[#BBF7D0] bg-[#DCFCE7]/30 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-[#166534] uppercase tracking-wider bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#BBF7D0]">
                  Status Transaksi: COMPLETED
                </span>
                <h2 className="text-2xl font-bold text-ink">
                  Serah Terima Berhasil &amp; Dana Telah Dicairkan!
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Verifikasi geotag dan timbangan dinyatakan sah. Dana sebesar <strong>Rp {handoverData.netFarmerPayment.toLocaleString("id-ID")}</strong> telah diteruskan ke rekening {handoverData.farmer.name} (setelah potongan komisi platform 3,5% sebesar Rp {handoverData.platformFee.toLocaleString("id-ID")}).
                </p>
              </div>

              <div className="p-5 max-w-lg mx-auto rounded-xl bg-[#EFEEE7] border border-border text-left space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>Waktu Penyelesaian:</span>
                  <span className="font-bold">{handoverData.timestamp}</span>
                </div>
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>Lokasi Terverifikasi:</span>
                  <span>{handoverData.geotag.address}</span>
                </div>
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>Kode Verifikasi Digital:</span>
                  <span className="font-mono text-primary font-bold">{handoverData.hash}</span>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button variant="primary" size="lg" onClick={onBack}>
                  Kembali ke Beranda
                </Button>
              </div>
            </section>
          ) : isDisputed ? (
            <section className="bg-surface rounded-2xl p-8 sm:p-10 border border-[#FECACA] bg-[#FEE2E2]/30 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#DC2626] text-white flex items-center justify-center mx-auto shadow-md">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-[#991B1B] uppercase tracking-wider bg-[#FEE2E2] px-3 py-1 rounded-full border border-[#FECACA]">
                  Status: DISPUTED (Sengketa Aktif)
                </span>
                <h2 className="text-2xl font-bold text-ink">
                  Laporan Ketidaksesuaian Diterima Admin
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Pencairan dana escrow ditahan sementara oleh sistem. Tim admin Patra Tani akan meninjau bukti foto dan koordinat geotag dalam waktu 1x24 jam untuk mediasi penyesuaian kuota atau penggantian komoditas.
                </p>
              </div>

              <div className="p-4 max-w-md mx-auto rounded-xl bg-[#EFEEE7] border border-border text-left text-xs space-y-1">
                <span className="font-bold text-ink block">Alasan Sengketa yang Dilaporkan:</span>
                <p className="text-ink-secondary italic">"{disputeReason || "Kualitas komoditas atau timbangan tidak memenuhi standar kesepakatan awal."}"</p>
              </div>

              <div className="flex justify-center pt-2">
                <Button variant="outline" size="md" onClick={() => setIsDisputed(false)}>
                  Batal &amp; Coba Verifikasi Ulang
                </Button>
              </div>
            </section>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <section className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-border/40 shadow-lg text-[#E6E4DA] relative">
                  <div className="p-4 bg-black/40 backdrop-blur-md flex items-center justify-between border-b border-white/10 z-10 relative">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
                      <span className="text-xs font-bold tracking-wider uppercase text-white">
                        Live Camera Viewfinder
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#D5D8CC]">
                        1080p • 60 FPS
                      </span>
                    </div>
                  </div>

                  <div className="relative aspect-4/3 w-full bg-neutral-900 overflow-hidden flex items-center justify-center select-none">
                    <img
                      src={handoverData.samplePhoto}
                      alt="Komoditas Timbangan"
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isPhotoCaptured ? "scale-100 brightness-100" : "scale-105 brightness-95"
                      }`}
                    />

                    <div className="absolute inset-6 pointer-events-none border border-white/20 rounded-xl flex flex-col justify-between p-3">
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-t-2 border-l-2 border-[#E6E4DA]" />
                        <div className="w-6 h-6 border-t-2 border-r-2 border-[#E6E4DA]" />
                      </div>
                      <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-b-2 border-l-2 border-[#E6E4DA]" />
                        <div className="w-6 h-6 border-b-2 border-r-2 border-[#E6E4DA]" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md rounded-xl p-3 border border-white/15 text-[11px] space-y-1.5 text-white/90">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1">
                        <span className="flex items-center gap-1 text-[#D5D8CC] font-mono">
                          <Clock className="w-3 h-3" />
                          {handoverData.timestamp}
                        </span>
                        <span className="text-[10px] font-mono text-white/60">
                          {handoverData.hash}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-white/80">
                          <MapPin className="w-3 h-3 text-status-handover" />
                          {handoverData.geotag.latitude}, {handoverData.geotag.longitude}
                        </span>
                        <span className="text-status-completed font-semibold">
                          {handoverData.geotag.accuracy}
                        </span>
                      </div>

                      <p className="text-[10px] text-white/60 truncate">
                        {handoverData.geotag.address}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-black/60 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-4">
                    <div className="text-xs text-white/70">
                      {isPhotoCaptured ? (
                        <span className="flex items-center gap-1.5 text-status-completed font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          Foto Bukti Berhasil Direkam
                        </span>
                      ) : (
                        <span>Arahkan kamera ke komoditas di atas timbangan</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-[#E6E4DA] text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isPhotoCaptured ? "Foto Ulang" : "Bidik Foto Bukti"}</span>
                    </button>
                  </div>
                </section>

                <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-primary" />
                      <h2 className="text-base font-bold text-ink">
                        Konfirmasi Persetujuan Dua Pihak
                      </h2>
                    </div>
                    <span className="text-xs text-ink-muted">Tatap Muka Langsung</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#166534] tracking-wider">
                          Pihak Petani
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A] text-white">
                          Sudah Menyerahkan
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <img
                          src={handoverData.farmer.avatar}
                          alt={handoverData.farmer.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#BBF7D0]"
                        />
                        <div>
                          <p className="text-xs font-bold text-ink leading-tight">
                            {handoverData.farmer.name}
                          </p>
                          <p className="text-[10px] text-ink-muted">
                            {handoverData.farmer.farmName}
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#166534] pt-1">
                        Konfirmasi tuntas pada {handoverData.farmer.confirmedTime} di lokasi.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-green/40 border border-primary/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                          Pihak Pembeli UMKM
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-[#E6E4DA]">
                          Sedang Memeriksa
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink leading-tight">
                            {handoverData.buyer.contactPerson}
                          </p>
                          <p className="text-[10px] text-ink-muted">
                            {handoverData.buyer.businessName}
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] text-ink-secondary pt-1">
                        Periksa timbangan &amp; mutu sebelum menyetujui pencairan dana.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <section className="bg-surface rounded-2xl p-6 border border-border shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-bold text-ink">
                        Pemeriksaan Fisik &amp; Timbangan
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-green">
                      Kuota: {handoverData.targetQuantityKg} Kg
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-secondary">Target Kuota Kesepakatan:</span>
                      <strong className="text-ink font-bold">
                        {handoverData.targetQuantityKg.toFixed(1)} Kg
                      </strong>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                        Timbangan Aktual di Lokasi (Kg)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={actualWeight}
                          onChange={(e) => setActualWeight(e.target.value)}
                          className="w-full rounded-xl px-3.5 py-2 text-sm font-bold text-ink bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                        <span className="text-xs font-bold text-ink-secondary px-2">
                          Kg
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                        isWeightValid
                          ? "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]"
                          : "bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]"
                      }`}
                    >
                      <span>Selisih Timbangan:</span>
                      <span>
                        {weightDiff >= 0 ? `+${weightDiff}` : weightDiff} Kg{" "}
                        {isWeightValid ? "(Memenuhi Kuota)" : "(Kurang dari Target)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Checklist Kesegaran &amp; Mutu Panen
                    </span>

                    {[
                      {
                        id: "freshness",
                        label: "Tekstur umbi padat, kering, bebas bonyok lembek",
                      },
                      {
                        id: "aroma",
                        label: "Aroma tajam segar khas panen baru (bebas bau busuk)",
                      },
                      {
                        id: "sorting",
                        label: "Sortasi Grade A bersih tanpa jamur hitam atau ulat",
                      },
                      {
                        id: "packaging",
                        label: "Penimbangan disaksikan langsung oleh kedua pihak",
                      },
                    ].map((item) => (
                      <label
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          checklist[item.id]
                            ? "bg-surface-green/60 border-primary/40 text-ink"
                            : "bg-surface border-border text-ink-muted hover:bg-surface/80"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            checklist[item.id]
                              ? "bg-primary border-primary text-[#E6E4DA]"
                              : "border-border bg-surface"
                          }`}
                        >
                          {checklist[item.id] && <Check className="w-3 h-3" />}
                        </div>
                        <span className="leading-tight">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2 space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      icon={ShieldCheck}
                      isLoading={isReleasing}
                      disabled={!allChecklistPassed || !isPhotoCaptured}
                      onClick={handleReleaseFunds}
                    >
                      Verifikasi &amp; Lepaskan Dana Escrow
                    </Button>

                    {!isPhotoCaptured && (
                      <p className="text-[11px] text-[#D97706] text-center font-medium">
                        * Silakan ambil foto bukti melalui kamera di sebelah kiri terlebih dahulu.
                      </p>
                    )}

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsDisputeModalOpen(true)}
                        className="text-xs font-semibold text-[#DC2626] hover:text-[#991B1B] hover:underline flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Laporkan Sengketa (Komoditas Bermasalah)</span>
                      </button>
                    </div>
                  </div>
                </section>

                <div className="bg-surface rounded-2xl p-5 border border-border space-y-3 text-xs text-ink-secondary">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Kebijakan Pencairan Dana Otomatis</span>
                  </div>
                  <p className="leading-relaxed">
                    Ketika Anda menekan tombol "Verifikasi &amp; Lepaskan Dana", simulasi smart contract escrow akan otomatis mentransfer Rp {handoverData.netFarmerPayment.toLocaleString("id-ID")} ke dompet petani tanpa penundaan.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setIsDisputeModalOpen(false)}
          />

          <div className="relative bg-surface rounded-3xl p-6 sm:p-7 border border-border max-w-lg w-full space-y-5 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-ink">
                  Ajukan Laporan Sengketa Transaksi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDisputeModalOpen(false)}
                className="p-1 rounded-full text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              Jika komoditas yang diserahkan busuk, cacat, atau berat timbangan kurang tanpa kompensasi dari petani, dana escrow akan ditahan hingga mediasi admin selesai.
            </p>

            <form onSubmit={handleReportDispute} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Uraikan Kendala / Kerusakan Komoditas
                </label>
                <textarea
                  rows={4}
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Contoh: Ditemukan 4 kg bawang merah berjamur dan basah saat diperiksa, tidak sesuai standar Grade A yang disepakati..."
                  className="w-full rounded-xl px-3.5 py-2.5 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[11px] text-[#991B1B] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Admin akan memeriksa foto geotag kamera dan menghubungi kedua belah pihak via telepon terdaftar.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                >
                  Batal
                </Button>
                <Button variant="destructive" size="md" type="submit">
                  Kirim Laporan Sengketa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
