import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Chip from "../components/Chip";
import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Camera,
  MapPin,
  Clock,
  Scale,
  Receipt,
  Truck,
  ArrowLeft,
  Download,
  Share2,
  Send,
  Store,
  Sprout,
  Check,
  FileCheck,
} from "lucide-react";

export default function CompletedPage({ onBack, onExploreMore }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([
    "Panen Sangat Segar",
    "Timbangan Pas & Jujur",
  ]);
  const [reviewText, setReviewText] = useState(
    "Tomat mawar sangat segar dan merah merata, tekstur padat tanpa ada yang bonyok. Pengantaran kurir petani tepat waktu sebelum jam buka warung."
  );
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  const transactionData = {
    tenderId: "TND-2026-006",
    title: "Suplai Tomat & Sayur Sop Harian 15 Kg",
    commodityName: "Tomat Mawar Segar (Grade A)",
    quantityKg: 15,
    actualWeightKg: 15.2,
    pricePerKg: 12000,
    harvestSubtotal: 180000,
    platformFeeRate: 4.0,
    platformFee: 7200,
    netHarvestValue: 172800,
    deliveryFee: 15000,
    netFarmerPayment: 187800,
    escrowId: "ESC-20261024-1102",
    releaseTime: "26 Okt 2026, 11:30:45 WIB",
    handoverTime: "26 Okt 2026, 10:45:12 WIB",
    geotag: {
      coordinates: "-6.8791° S, 107.5824° E",
      accuracy: "8 meter (Akurasi Tinggi)",
      address: "Warteg Barokah Bahari, Jl. Surya Sumantri No. 12, Bandung",
    },
    verificationHash: "VERIFY-GEO-20261026-9014",
    photoUrl:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    farmer: {
      name: "Pak Mulyono",
      farmName: "Kebun Berkah Lembang",
      bankAccount: "BRI • 4410-01-xxxxxx-53",
      avatar:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    },
    buyer: {
      businessName: "Warteg Barokah Bahari",
      contactPerson: "Pak Slamet Riyadi",
      businessType: "Warung Tegal Harian",
    },
  };

  const tagOptions = [
    "Panen Sangat Segar",
    "Timbangan Pas & Jujur",
    "Tepat Waktu",
    "Komunikasi Ramah",
    "Kemasan Bersih & Rapi",
    "Harga Adil Langsung Petani",
  ];

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setIsReviewSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="transaksi" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28 md:pb-14">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-primary transition-colors cursor-pointer select-none mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Riwayat Transaksi</span>
          </button>

          <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-[#BBF7D0] bg-[#DCFCE7]/25 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A] text-white uppercase tracking-wider">
                      Transaksi Tuntas
                    </span>
                    <span className="text-xs font-mono font-medium text-ink-muted">
                      ID: {transactionData.tenderId}
                    </span>
                    <span className="text-xs text-ink-muted">•</span>
                    <span className="text-xs text-ink-secondary">
                      Escrow Ref: {transactionData.escrowId}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                    Transaksi Sukses! Dana Telah Dicairkan
                  </h1>

                  <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
                    Serah terima komoditas telah lolos verifikasi fisik kamera geotag. Dana escrow sebesar <strong>Rp {transactionData.netFarmerPayment.toLocaleString("id-ID")}</strong> berhasil dicairkan otomatis ke kas {transactionData.farmer.name}.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <StatusBadge status="COMPLETED" size="lg" showIcon showDot />
                <span className="text-xs text-ink-muted">
                  Waktu Cair: <strong className="text-ink">{transactionData.releaseTime}</strong>
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#BBF7D0]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-primary" />
                  Petani: <strong className="text-ink">{transactionData.farmer.name}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-primary" />
                  Pembeli: <strong className="text-ink">{transactionData.buyer.businessName}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-surface border border-border text-ink text-xs font-medium hover:bg-surface-green/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Unduh Faktur Sah</span>
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-surface border border-border text-ink text-xs font-medium hover:bg-surface-green/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Bagikan Bukti</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-ink">
                    Rincian Pencairan Dana Escrow
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-green text-primary">
                  Otomatis Cair ke Petani
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between text-ink-secondary">
                  <span>Nilai Pokok Panen ({transactionData.quantityKg} Kg × Rp {transactionData.pricePerKg.toLocaleString("id-ID")}):</span>
                  <span className="font-semibold text-ink">
                    Rp {transactionData.harvestSubtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#DC2626]">
                  <div className="space-y-0.5">
                    <span>Komisi Platform Patra Tani ({transactionData.platformFeeRate}%):</span>
                    <span className="text-[10px] text-ink-muted block">
                      * Dihitung hanya dari harga panen, tanpa memotong ongkir
                    </span>
                  </div>
                  <span className="font-semibold">
                    - Rp {transactionData.platformFee.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-ink-secondary pt-1 border-t border-border/40">
                  <span>Subtotal Hasil Panen Petani:</span>
                  <span className="font-semibold text-ink">
                    Rp {transactionData.netHarvestValue.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-ink-secondary">
                  <div className="space-y-0.5">
                    <span>Ongkos Kirim Kurir Petani (100% Utuh):</span>
                    <span className="text-[10px] text-[#16A34A] block">
                      * 100% hak kurir petani, bebas komisi platform
                    </span>
                  </div>
                  <span className="font-semibold text-[#16A34A]">
                    + Rp {transactionData.deliveryFee.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-green/50 border border-primary/20 flex items-center justify-between text-ink mt-2">
                  <div>
                    <span className="text-xs font-bold block">
                      Total Bersih Diterima Petani
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      Ditransfer ke {transactionData.farmer.bankAccount}
                    </span>
                  </div>
                  <strong className="text-xl font-extrabold text-primary">
                    Rp {transactionData.netFarmerPayment.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-ink-secondary">Status Rekening Escrow:</span>
                </div>
                <span className="font-bold text-[#16A34A] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Dilepaskan &amp; Tuntas (RELEASED)
                </span>
              </div>
            </section>

            <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#D97706]" />
                  <h3 className="text-base font-bold text-ink">
                    Penilaian &amp; Ulasan Pembeli
                  </h3>
                </div>
                <span className="text-xs text-ink-muted">Membangun Reputasi Petani</span>
              </div>

              {isReviewSubmitted ? (
                <div className="p-5 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-4 h-4 fill-[#D97706] text-[#D97706]"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#166534]">
                      Ulasan Terverifikasi
                    </span>
                  </div>

                  <p className="text-xs text-ink leading-relaxed italic">
                    "{reviewText}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-[#166534] border border-[#BBF7D0]"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#166534]">
                    <span>Diberikan oleh {transactionData.buyer.businessName}</span>
                    <button
                      type="button"
                      onClick={() => setIsReviewSubmitted(false)}
                      className="hover:underline font-semibold"
                    >
                      Ubah Ulasan
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-2">
                      Beri Bintang Kepuasan Transaksi
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((starIndex) => (
                        <button
                          key={starIndex}
                          type="button"
                          onClick={() => setRating(starIndex)}
                          onMouseEnter={() => setHoverRating(starIndex)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-ink-muted hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              (hoverRating || rating) >= starIndex
                                ? "fill-[#D97706] text-[#D97706]"
                                : "text-border"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-bold text-ink">
                        {rating}.0 / 5.0
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-2">
                      Poin Penilaian Cepat (Tag Pengalaman)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tagOptions.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <Chip
                            key={tag}
                            label={tag}
                            active={isSelected}
                            onClick={() => handleToggleTag(tag)}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Tulis Ulasan untuk {transactionData.farmer.name}
                    </label>
                    <textarea
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Bagikan pengalaman kesegaran komoditas dan ketepatan serah terima..."
                      className="w-full rounded-xl px-3.5 py-2.5 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      icon={Send}
                      fullWidth
                    >
                      Kirimkan Penilaian &amp; Ulasan
                    </Button>
                  </div>
                </form>
              )}
            </section>
          </div>

          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <section className="bg-surface rounded-3xl p-6 border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-ink">
                    Bukti Sah Serah-Terima (Geotag)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A] text-white">
                  STAMP VERIFIED
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-border bg-[#1A1A1A]">
                <img
                  src={transactionData.photoUrl}
                  alt="Bukti Serah Terima Sah"
                  className="w-full h-48 object-cover"
                />

                <div className="absolute top-3 left-3 bg-[#1A1A1A]/85 backdrop-blur-md rounded-lg px-2.5 py-1 border border-white/20 text-[10px] text-[#E6E4DA] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-completed" />
                  <span>TERVERIFIKASI SISTEM ESCROW</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md rounded-xl p-2.5 border border-white/15 text-[10px] text-white/90 space-y-1">
                  <div className="flex items-center justify-between text-white/60 font-mono text-[9px]">
                    <span>{transactionData.handoverTime}</span>
                    <span>{transactionData.verificationHash}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-white/90">
                    <MapPin className="w-3 h-3 text-status-handover shrink-0" />
                    <span className="truncate">{transactionData.geotag.coordinates} ({transactionData.geotag.accuracy})</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-ink">
                  <span className="text-ink-secondary flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-primary" />
                    Berat Timbangan Aktual:
                  </span>
                  <strong className="text-sm font-bold text-[#166534]">
                    {transactionData.actualWeightKg} Kg (Target: {transactionData.quantityKg} Kg)
                  </strong>
                </div>

                <div className="flex items-center justify-between text-ink border-t border-border/80 pt-2">
                  <span className="text-ink-secondary flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    Waktu Serah Terima:
                  </span>
                  <span className="font-medium text-ink">
                    {transactionData.handoverTime}
                  </span>
                </div>

                <div className="flex items-start justify-between text-ink border-t border-border/80 pt-2">
                  <span className="text-ink-secondary flex items-center gap-1.5 shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                    Lokasi Fisik:
                  </span>
                  <span className="text-right text-[11px] text-ink max-w-[200px]">
                    {transactionData.geotag.address}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[11px] text-[#166534] flex items-center gap-2">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>Dokumen ini sah secara digital dan dilindungi enkripsi sandbox Patra Tani.</span>
              </div>
            </section>

            <div className="bg-surface rounded-3xl p-5 border border-border space-y-3">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                Langkah Berikutnya
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Anda dapat memesan kembali kebutuhan harian lainnya dari petani sekitar tanpa perantara gudang.
              </p>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={onExploreMore || onBack}
              >
                Jelajahi Komoditas Lainnya
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
