"use client";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { mockDefaultCompletedTransaction } from "@/data/mockData";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import Chip from "@/components/Chip";
import {
  CheckCircle2,
  Star,
  Camera,
  MapPin,
  Clock,
  Scale,
  Receipt,
  ArrowLeft,
  Send,
  Check,
  FileCheck,
  ChevronRight,
} from "lucide-react";

function CompletedPage({ onBack, onExploreMore }) {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const { activeTransaction } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([
    "Panen Sangat Segar",
    "Timbangan Pas & Jujur",
  ]);
  const [reviewText, setReviewText] = useState(
    "Hasil panen sangat segar dan berkualitas tinggi, tekstur padat tanpa ada yang cacat. Pengantaran kurir tepat waktu dan timbangan akurat."
  );
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  const transactionData =
    activeTransaction || mockDefaultCompletedTransaction;

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
    <div className="w-full flex-1 flex flex-col">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div>
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate("/"))}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-primary transition-colors cursor-pointer select-none mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>

            <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-[#BBF7D0] bg-[#DCFCE7]/20 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/80">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                        Transaksi Selesai • Escrow Dicairkan
                      </span>
                      <span className="text-xs text-ink-muted">•</span>
                      <span className="text-xs font-mono text-ink-muted">
                        {transactionData.tenderId}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                      Transaksi Selesai, Pembayaran Sudah Diteruskan
                    </h1>

                    <p className="text-xs sm:text-sm text-ink-secondary">
                      Serah-terima fisik komoditas telah diverifikasi secara sah via geotag &amp; timbangan langsung di lokasi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status="COMPLETED" size="md" showIcon showDot />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
                <div className="p-4 rounded-xl bg-[#EFEEE7] border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">
                    Nomor Transaksi
                  </span>
                  <p className="font-mono font-bold text-ink">{transactionData.escrowId || "ESC-20261027-8891"}</p>
                  <p className="text-[10px] text-ink-secondary">Rekening Bersama Patra Tani</p>
                </div>

                <div className="p-4 rounded-xl bg-[#EFEEE7] border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">
                    Uang Diterima Petani
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-[#166534]">
                    Rp {(transactionData.netFarmerPayment || 187800).toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-[#166534]">Sudah diteruskan ke rekening</p>
                </div>

                <div className="p-4 rounded-xl bg-[#EFEEE7] border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">
                    Waktu Pembayaran Diteruskan
                  </span>
                  <p className="font-bold text-ink">{transactionData.releaseTime || transactionData.timestamp}</p>
                  <p className="text-[10px] text-ink-secondary">Otomatisasi smart escrow</p>
                </div>

                <div className="p-4 rounded-xl bg-[#EFEEE7] border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">
                    Cara Pengiriman
                  </span>
                  <p className="font-bold text-ink">
                    {transactionData.fulfillmentMethod === "SELF_PICKUP" ? "Ambil Sendiri di Kebun" : "Kurir Petani Mandiri"}
                  </p>
                  <p className="text-[10px] text-primary font-medium">100% ongkir hak petani</p>
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-bold text-ink">
                      Ringkasan Finansial &amp; Pencairan Dana Escrow
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-green text-primary border border-primary/20">
                    Transparansi 100%
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-ink-secondary">
                    <span>Nilai Komoditas Panen ({transactionData.quantityKg || 15} Kg × Rp {(transactionData.pricePerKg || 12000).toLocaleString("id-ID")}):</span>
                    <span className="font-semibold text-ink">
                      Rp {(transactionData.harvestSubtotal || transactionData.subtotal || 180000).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#DC2626]">
                    <div className="flex items-center gap-1.5">
                      <span>Potongan Komisi Platform ({transactionData.platformFeeRate || 3.5}%):</span>
                    </div>
                    <span className="font-semibold">
                      - Rp {(transactionData.platformFee || 7200).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="text-[10px] text-ink-muted pl-2 border-l-2 border-primary/30 leading-relaxed">
                    Komisi platform digunakan untuk biaya operasional platform &amp; keamanan escrow tanpa gudang.
                  </div>

                  <div className="flex items-center justify-between text-ink-secondary">
                    <span>Hasil Bersih Komoditas Petani:</span>
                    <span className="font-semibold text-ink">
                      Rp {((transactionData.harvestSubtotal || transactionData.subtotal || 180000) - (transactionData.platformFee || 7200)).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-ink-secondary">
                    <div className="flex items-center gap-1">
                      <span>Ongkos Kirim Kurir Petani (Utuh 100%):</span>
                    </div>
                    <span className="font-semibold text-primary">
                      + Rp {(transactionData.deliveryFee || 0).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-ink block">
                        Total Bersih Diterima Petani
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        Dikirim ke rekening: {transactionData.farmer?.bankAccount || "BRI • Rekening Petani"}
                      </span>
                    </div>
                    <strong className="text-3xl sm:text-4xl font-extrabold text-[#16A34A]">
                      Rp {(transactionData.netFarmerPayment || 187800).toLocaleString("id-ID")}
                    </strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#EFEEE7] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={transactionData.farmer?.avatar}
                      alt={transactionData.farmer?.name}
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                    <div>
                      <p className="font-bold text-ink leading-tight">
                        {transactionData.farmer?.name}
                      </p>
                      <p className="text-[10px] text-ink-muted">
                        {transactionData.farmer?.farmName}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#166534] font-bold text-[10px] border border-[#BBF7D0]">
                    Pencairan Berhasil (Settled)
                  </span>
                </div>
              </section>

              <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#F59E0B]" />
                    <h3 className="text-base font-bold text-ink">
                      Penilaian &amp; Ulasan Pembeli
                    </h3>
                  </div>
                  <span className="text-xs text-ink-muted">
                    Bantu Petani Mendapat Reputasi Terbaik
                  </span>
                </div>

                {isReviewSubmitted ? (
                  <div className="p-6 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-[#166534]">
                      Terima Kasih atas Penilaian Anda!
                    </h4>
                    <p className="text-xs text-[#166534] max-w-md mx-auto leading-relaxed">
                      Ulasan bintang {rating}.0 Anda telah dicatat ke profil publik {transactionData.farmer?.name} untuk memperkuat kepercayaan rantai pasok agrikultur lokal.
                    </p>
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsReviewSubmitted(false)}
                      >
                        Ubah Penilaian
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div className="space-y-2 text-center sm:text-left">
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink block">
                        Tingkat Kepuasan Mutu Panen
                      </label>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= (hoverRating || rating)
                                  ? "text-[#F59E0B] fill-[#F59E0B]"
                                  : "text-border"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-bold text-ink">
                          {hoverRating || rating}.0 / 5.0
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink block">
                        Pilih Penilaian Cepat
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tagOptions.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              type="button"
                              key={tag}
                              onClick={() => handleToggleTag(tag)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-surface-green text-primary border-primary font-bold shadow-xs"
                                  : "bg-[#EFEEE7] text-ink-secondary border-border hover:border-primary/50"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink block">
                        Ulasan Pengalaman Transaksi
                      </label>
                      <textarea
                        rows="3"
                        required
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Bagaimana kesegaran komoditas, ketepatan waktu pengiriman, dan timbangan hasil panen?"
                        className="w-full rounded-xl p-3.5 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        icon={Send}
                      >
                        Kirim Ulasan &amp; Rating
                      </Button>
                    </div>
                  </form>
                )}
              </section>
            </div>

            <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <section className="bg-surface rounded-2xl p-6 border border-border shadow-xs space-y-5">
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

                <div className="relative rounded-xl overflow-hidden border border-border bg-[#1A1A1A]">
                  <img
                    src={transactionData.photoUrl || transactionData.samplePhoto || transactionData.image || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"}
                    alt="Bukti Serah Terima Sah"
                    className="w-full h-48 object-cover"
                  />

                  <div className="absolute top-3 left-3 bg-[#1A1A1A]/85 backdrop-blur-md rounded-lg px-2.5 py-1 border border-white/20 text-[10px] text-[#E6E4DA] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-completed" />
                    <span>TERVERIFIKASI SISTEM ESCROW</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md rounded-xl p-2.5 border border-white/15 text-[10px] text-white/90 space-y-1">
                    <div className="flex items-center justify-between text-white/60 font-mono text-[9px]">
                      <span>{transactionData.handoverTime || transactionData.timestamp}</span>
                      <span>{transactionData.verificationHash || transactionData.hash || "HASH-VERIFIED-9912"}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-white/90">
                      <MapPin className="w-3 h-3 text-status-handover shrink-0" />
                      <span className="truncate">{transactionData.geotag?.coordinates || "-6.8791° S, 107.5824° E"} ({transactionData.geotag?.accuracy || "Presisi Tinggi"})</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-ink">
                    <span className="text-ink-secondary flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-primary" />
                      Berat Timbangan Aktual:
                    </span>
                    <strong className="text-sm font-bold text-[#166534]">
                      {transactionData.actualWeightKg || transactionData.quantityKg || 15} Kg (Target: {transactionData.quantityKg || 15} Kg)
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-ink border-t border-border/80 pt-2">
                    <span className="text-ink-secondary flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      Waktu Serah Terima:
                    </span>
                    <span className="font-medium text-ink">
                      {transactionData.handoverTime || transactionData.timestamp}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-ink border-t border-border/80 pt-2">
                    <span className="text-ink-secondary flex items-center gap-1.5 shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                      Lokasi Fisik:
                    </span>
                    <span className="text-right text-[11px] text-ink max-w-[200px]">
                      {transactionData.geotag?.address || "Bandung, Jawa Barat"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[11px] text-[#166534] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 shrink-0" />
                  <span>Dokumen ini sah secara digital dan dilindungi sistem keamanan Patra Tani.</span>
                </div>
              </section>

              <div className="bg-surface rounded-2xl p-5 border border-border space-y-3">
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
                  icon={ChevronRight}
                  iconPosition="right"
                  onClick={() => (onExploreMore ? onExploreMore() : navigate("/explore"))}
                >
                  Jelajahi Komoditas Lainnya
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>
  );
}

export default function WrappedCompletedPage(props) {
  return (
    <ProtectedRoute allowedRoles={[]}>
      <CompletedPage {...props} />
    </ProtectedRoute>
  );
}
