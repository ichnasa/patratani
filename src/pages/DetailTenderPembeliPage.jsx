import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  Star,
  CheckCircle2,
  MapPin,
  Clock,
  Award,
  Sparkles,
  Truck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

export default function DetailTenderPembeliPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setActiveTransaction, showToast } = useApp();

  const tenderInfo = {
    id: id || "TND-8821",
    title: "Kebutuhan Tomat Merah Segar (20 kg)",
    commodityName: "Tomat Merah Segar",
    category: "Sayur Buah",
    requiredQuantityKg: 20,
    maxBudgetPerKg: 14000,
    totalBudget: 280000,
    deadline: "28 Okt 2026, 17:00 WIB",
    deliveryAddress:
      "Warung Sederhana Bu Lina, Jl. Terusan Buahbatu No. 42, Bandung",
    status: "BIDDING",
  };

  const bids = [
    {
      id: "BID-01",
      farmer: {
        id: "FRM-01",
        name: "Kang Rizal",
        farmName: "Kebun Pasirjambu, Ciwidey",
        distanceKm: 3.2,
        rating: 4.9,
        reviewsCount: 42,
        verified: true,
        avatar:
          "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        phone: "+62 812-9988-7711",
      },
      bidPricePerKg: 13000,
      suppliedQuantityKg: 20,
      isFullQuota: true,
      subtotal: 260000,
      deliveryMethod: "FARMER_DELIVERY",
      deliveryFee: 5000,
      totalPayment: 265000,
      savingsAmount: 20000,
      savingsPercent: 7.1,
      readyTime: "29 Okt 2026, 06:30 WIB",
      notes:
        "Tomat mawar petik segar subuh hari H, sortir ukuran sedang-besar mulus.",
      isBestOffer: true,
    },
    {
      id: "BID-02",
      farmer: {
        id: "FRM-02",
        name: "Kelompok Tani Subur",
        farmName: "Cimahi Tengah",
        distanceKm: 4.2,
        rating: 4.7,
        reviewsCount: 19,
        verified: false,
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        phone: "+62 813-7722-9901",
      },
      bidPricePerKg: 12800,
      suppliedQuantityKg: 15,
      isFullQuota: false,
      subtotal: 192000,
      deliveryMethod: "SELF_PICKUP",
      deliveryFee: 0,
      totalPayment: 192000,
      savingsAmount: 88000,
      savingsPercent: 31.4,
      readyTime: "29 Okt 2026, 08:00 WIB",
      notes:
        "Hanya sanggup 15 kg karena sebagian sudah dibooking warung lain.",
      isBestOffer: false,
    },
    {
      id: "BID-03",
      farmer: {
        id: "FRM-03",
        name: "Pak Hendra",
        farmName: "Lembang",
        distanceKm: 7.1,
        rating: 4.8,
        reviewsCount: 28,
        verified: true,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        phone: "+62 812-3344-5566",
      },
      bidPricePerKg: 13500,
      suppliedQuantityKg: 20,
      isFullQuota: true,
      subtotal: 270000,
      deliveryMethod: "SELF_PICKUP",
      deliveryFee: 0,
      totalPayment: 270000,
      savingsAmount: 10000,
      savingsPercent: 3.5,
      readyTime: "29 Okt 2026, 08:00 WIB",
      notes: "Kondisi tomat matang pohon 85%, tahan simpan 4-5 hari.",
      isBestOffer: false,
    },
    {
      id: "BID-04",
      farmer: {
        id: "FRM-04",
        name: "Ibu Siti",
        farmName: "Soreang",
        distanceKm: 8.5,
        rating: 4.6,
        reviewsCount: 15,
        verified: false,
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        phone: "+62 813-2211-4455",
      },
      bidPricePerKg: 14000,
      suppliedQuantityKg: 20,
      isFullQuota: true,
      subtotal: 280000,
      deliveryMethod: "FARMER_DELIVERY",
      deliveryFee: 6000,
      totalPayment: 286000,
      savingsAmount: 0,
      savingsPercent: 0,
      readyTime: "29 Okt 2026, 07:00 WIB",
      notes:
        "Siap antar langsung ke warung menggunakan bronjong tertutup.",
      isBestOffer: false,
    },
  ];

  const handleSelectBid = (bid) => {
    const transactionData = {
      tenderId: tenderInfo.id,
      title: tenderInfo.title,
      commodityName: tenderInfo.commodityName,
      category: tenderInfo.category,
      grade: "Grade Super",
      quantityKg: bid.suppliedQuantityKg,
      targetQuantityKg: tenderInfo.requiredQuantityKg,
      actualWeightKg: bid.suppliedQuantityKg,
      pricePerKg: bid.bidPricePerKg,
      agreedPricePerKg: bid.bidPricePerKg,
      subtotal: bid.subtotal,
      fulfillmentMethod: bid.deliveryMethod,
      deliveryFee: bid.deliveryFee,
      totalPayment: bid.totalPayment,
      escrowAmount: bid.totalPayment,
      deliveryDate: "2026-10-29",
      status: "AWARDED",
      escrowId: `ESC-20261027-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: "27 Okt 2026, 14:30 WIB",
      farmer: {
        id: bid.farmer.id,
        name: bid.farmer.name,
        farmName: bid.farmer.farmName,
        location: bid.farmer.farmName,
        distanceKm: bid.farmer.distanceKm,
        avatar: bid.farmer.avatar,
        rating: bid.farmer.rating,
        phone: bid.farmer.phone,
        verified: bid.farmer.verified,
        status: "CONFIRMED",
      },
      buyer: {
        name: "Warung Sederhana Bu Lina",
        phone: "+62 812-3456-7890",
        address: tenderInfo.deliveryAddress,
      },
    };

    if (setActiveTransaction) {
      setActiveTransaction(transactionData);
    }

    if (showToast) {
      showToast(
        `Penawaran dari ${bid.farmer.name} dipilih! Menuju pembayaran Escrow.`,
        "success"
      );
    }

    navigate("/escrow");
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="transaksi" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <nav className="flex items-center gap-2 text-xs text-ink-muted flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                to="/dashboard/buyer"
                className="hover:text-primary transition-colors"
              >
                Tender Saya
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-primary">
                Tender #{tenderInfo.id} ({bids.length} Penawaran)
              </span>
            </nav>

            <button
              type="button"
              onClick={() => navigate("/dashboard/buyer")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tender Saya</span>
            </button>
          </div>

          <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                    {tenderInfo.category}
                  </span>
                  <span className="text-xs text-ink-muted">#{tenderInfo.id}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-ink">
                  {tenderInfo.title}
                </h1>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Batas Akhir: {tenderInfo.deadline} • Anggaran Maksimal: Rp{" "}
                  {tenderInfo.maxBudgetPerKg.toLocaleString("id-ID")}/kg (Total Rp{" "}
                  {tenderInfo.totalBudget.toLocaleString("id-ID")})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary bg-surface-green px-3.5 py-2 rounded-xl border border-primary/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. OPEN</span>
                </div>
                <span className="text-border font-bold">→</span>
                <div className="flex items-center gap-2 text-xs font-bold text-[#E6E4DA] bg-primary px-3.5 py-2 rounded-xl shadow-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>2. BIDDING ({bids.length})</span>
                </div>
                <span className="text-border font-bold">→</span>
                <div className="flex items-center gap-2 text-xs font-bold text-ink-muted bg-[#E6E4DA]/40 px-3.5 py-2 rounded-xl border border-border">
                  <span>3. AWARDED</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink">
                    Penawaran Masuk dari Petani Sekitar ({bids.length} Penawaran)
                  </h2>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Pilih penawaran terbaik untuk mengunci kuota pasokan dan lanjut ke pembayaran deposit Escrow.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className={`bg-background rounded-2xl p-5 sm:p-6 border transition-all ${
                      bid.isBestOffer
                        ? "border-primary ring-1 ring-primary/20 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={bid.farmer.avatar}
                              alt={bid.farmer.name}
                              className="w-11 h-11 rounded-full object-cover border border-border"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-ink">
                                  {bid.farmer.name}
                                </h3>
                                {bid.farmer.verified && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary px-2 py-0.2 rounded-full bg-primary/10">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Terverifikasi
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-ink-secondary mt-0.5">
                                <span className="flex items-center gap-1 font-semibold text-ink">
                                  <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                                  {bid.farmer.rating} ({bid.farmer.reviewsCount})
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-ink-muted" />
                                  {bid.farmer.farmName} ({bid.farmer.distanceKm} km)
                                </span>
                              </div>
                            </div>
                          </div>

                          {bid.isBestOffer && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary px-3 py-1 rounded-full bg-surface-green border border-primary/20 self-start sm:self-auto">
                              <Award className="w-3.5 h-3.5" />
                              Penawaran Terbaik
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-baseline gap-2 pt-1">
                          <span className="text-lg font-bold text-primary">
                            Rp {bid.bidPricePerKg.toLocaleString("id-ID")}
                          </span>
                          <span className="text-xs text-ink-muted">/ kg</span>
                          <span className="text-xs font-semibold text-ink-secondary">
                            (Total: Rp {bid.subtotal.toLocaleString("id-ID")})
                          </span>

                          {bid.savingsAmount > 0 && (
                            <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary-50">
                              Hemat Rp {bid.savingsAmount.toLocaleString("id-ID")} ({bid.savingsPercent}%)
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
                          <span className="font-semibold text-ink">
                            Kuota: {bid.suppliedQuantityKg} kg {bid.isFullQuota ? "(Penuh)" : "(Sebagian kuota)"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-ink-muted" />
                            {bid.deliveryMethod === "FARMER_DELIVERY"
                              ? `Diantar Petani (+ Rp ${bid.deliveryFee.toLocaleString("id-ID")})`
                              : "Ambil Sendiri ke Kebun (Rp 0)"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-ink-muted" />
                            Siap: {bid.readyTime}
                          </span>
                        </div>

                        <p className="text-xs text-ink-secondary italic bg-[#E6E4DA]/40 p-2.5 rounded-xl border border-border/60">
                          "{bid.notes}"
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col sm:items-end justify-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-ink-muted block">
                            Total Estimasi Escrow
                          </span>
                          <span className="text-base font-bold text-ink">
                            Rp {bid.totalPayment.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <Button
                          variant={bid.isBestOffer ? "primary" : "outline"}
                          size="md"
                          onClick={() => handleSelectBid(bid)}
                          className="w-full sm:w-auto font-bold"
                        >
                          Pilih Penawaran &amp; Lanjut Escrow
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}