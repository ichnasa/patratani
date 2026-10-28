import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  MapPin,
  Truck,
  Star,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Minus,
  Share2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { mockCommodities } from "../data/mockData";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

export default function DetailEtalasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, startTransactionFromCommodity, showToast, commodities } = useApp();

  const commodityList = commodities && commodities.length > 0 ? commodities : mockCommodities;
  const foundItem =
    commodityList.find((item) => String(item.id) === String(id)) ||
    mockCommodities.find((item) => String(item.id) === String(id));

  const fallbackCommodity = {
    id: "CMD-001",
    name: "Tomat Mawar Organik Segar",
    category: "Sayuran Buah",
    pricePerKg: 12000,
    quotaKg: 50,
    totalQuotaKg: 50,
    availableQuotaKg: 35,
    minOrderKg: 10,
    maxOrderKg: 35,
    harvestDate: "2026-10-30",
    description:
      "Tomat mawar pilihan hasil budidaya kebun organik Pasirjambu Ciwidey. Ditanam tanpa pestisida kimia sintetis, bertekstur padat renyah dengan rasa asam-segar seimbang. Sangat cocok untuk kebutuhan sambal, saus, dan sup di warung makan, cafe, atau resto katering.",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546470427-e26264be0b11?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1561136594-7f68413baa99?w=800&auto=format&fit=crop&q=80",
    ],
    farmer: {
      name: "Kang Rizal",
      avatar:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewCount: 42,
      totalTransactions: 64,
      successfulTransactions: 64,
      distanceKm: 3.2,
      location: "Kebun Tomat Pasirjambu, Ciwidey",
      locationName: "Kebun Tomat Pasirjambu, Ciwidey",
      coordinates: "-7.0984, 107.4921",
    },
    logistics: {
      selfPickup: {
        available: true,
        fee: 0,
        notes: "Ambil langsung ke kebun saat panen. Tanpa biaya kirim.",
      },
      farmerDelivery: {
        available: true,
        fixedFee: 5000,
        coverageArea: "Diantar langsung oleh petani menggunakan armada kebun.",
      },
    },
  };

  const commodity = foundItem || fallbackCommodity;

  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdminRole = roleLower.includes("admin");
  const isFarmerRole = roleLower.includes("petani");
  const isOwnCommodity = Boolean(
    currentUser?.name &&
      commodity.farmer?.name &&
      currentUser.name.trim().toLowerCase() === commodity.farmer.name.trim().toLowerCase()
  );
  const isSelfPurchaseBlocked = isFarmerRole || isOwnCommodity || isAdminRole;

  const galleryImages =
    Array.isArray(commodity.images) && commodity.images.length > 0
      ? commodity.images
      : [commodity.image || fallbackCommodity.image].filter(Boolean);

  const [selectedPhoto, setSelectedPhoto] = useState(
    galleryImages[0] || commodity.image || fallbackCommodity.image
  );

  const minKg = commodity.minOrderKg || 10;
  const totalQuota = commodity.totalQuotaKg || commodity.quotaKg || 50;
  const maxKg = commodity.availableQuotaKg || commodity.quotaKg || totalQuota;

  const [orderQuantity, setOrderQuantity] = useState(minKg);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("DELIVERY");

  const unitPrice = commodity.pricePerKg || 12000;

  const deliveryFeeFixed =
    commodity.logistics?.farmerDelivery?.fixedFee ??
    commodity.deliveryOptions?.farmerDelivery?.fee ??
    5000;

  const deliveryFee = fulfillmentMethod === "DELIVERY" ? deliveryFeeFixed : 0;

  const pickupDescription =
    commodity.logistics?.selfPickup?.notes ||
    commodity.logistics?.selfPickup?.address ||
    commodity.deliveryOptions?.selfPickup?.description ||
    "Ambil langsung di kebun saat jam panen. Bebas biaya kirim.";

  const deliveryDescription =
    commodity.logistics?.farmerDelivery?.coverageArea ||
    commodity.logistics?.farmerDelivery?.estimatedTime ||
    commodity.deliveryOptions?.farmerDelivery?.description ||
    "Diantar langsung oleh petani dengan armada pengantaran mandiri.";

  const farmerLocationText =
    commodity.farmer?.locationName ||
    commodity.farmer?.location ||
    "Lembang, Jawa Barat";

  const farmerCoordText = commodity.farmer?.coordinates
    ? ` (${commodity.farmer.coordinates})`
    : "";

  const farmerReviews =
    commodity.farmer?.reviewCount ??
    Math.max(16, (commodity.farmer?.totalTransactions || 25) - 3);

  const farmerTransactions =
    commodity.farmer?.successfulTransactions ??
    commodity.farmer?.totalTransactions ??
    38;

  const subtotal = orderQuantity * unitPrice;
  const totalEscrow = subtotal + deliveryFee;

  const handleDecrease = () => {
    if (orderQuantity > minKg) {
      setOrderQuantity((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (orderQuantity < maxKg) {
      setOrderQuantity((prev) => prev + 1);
    }
  };

  const handleProceedEscrow = () => {
    if (isAdminRole) {
      if (showToast) {
        showToast("Akun Admin Pengawas tidak dapat melakukan transaksi pemesanan.", "warning");
      }
      return;
    }
    if (isSelfPurchaseBlocked) {
      if (showToast) {
        showToast("Akun Petani tidak dapat membeli komoditas. Masuk sebagai Pembeli UMKM untuk melakukan checkout.", "warning");
      }
      return;
    }
    const payload = {
      ...commodity,
      quantityKg: orderQuantity,
      orderQuantityKg: orderQuantity,
      fulfillmentMethod:
        fulfillmentMethod === "DELIVERY" ? "FARMER_DELIVERY" : "SELF_PICKUP",
      deliveryFee,
      subtotal,
      totalPayment: totalEscrow,
      escrowAmount: totalEscrow,
    };

    if (startTransactionFromCommodity) {
      startTransactionFromCommodity(payload);
    }
    navigate("/escrow");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      if (showToast) {
        showToast("Tautan etalase panen disalin ke papan klip!", "info");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="pasar" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-16 py-6 md:py-8 space-y-6 pb-28 md:pb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <nav className="flex items-center gap-2 text-xs text-ink-muted flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/explore" className="hover:text-primary transition-colors">
                Etalase Panen
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-primary truncate max-w-[200px] sm:max-w-none">
                {commodity.name}
              </span>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors px-3 py-1.5 rounded-lg border border-border bg-surface"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/explore")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Pasar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
                <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-[#E6E4DA]">
                  <img
                    src={selectedPhoto}
                    alt={commodity.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-[#E6E4DA] shadow-xs">
                      Siap Panen
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-surface/90 text-primary backdrop-blur-xs shadow-xs border border-border/60">
                      {commodity.category}
                    </span>
                  </div>
                </div>

                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhoto(img)}
                        className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedPhoto === img
                            ? "border-primary ring-2 ring-primary/20 scale-[0.98]"
                            : "border-border hover:border-primary/50 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Foto thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                      {commodity.category} • Panen {commodity.harvestDate}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">
                      {commodity.name}
                    </h1>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-xs text-ink-muted block">Harga Bersih Panen</span>
                    <span className="text-2xl font-bold text-primary">
                      Rp {unitPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-ink-muted"> / kg</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#E6E4DA]/30 border border-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ink-secondary font-medium">
                      Sisa Kuota Pre-Order:
                    </span>
                    <span className="font-bold text-primary">
                      Tersedia {maxKg} kg dari {totalQuota} kg kuota panen
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round((maxKg / totalQuota) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <h3 className="text-sm font-bold text-ink">
                    Deskripsi Hasil Panen
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    {commodity.description}
                  </p>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-ink">
                  Opsi Pengambilan &amp; Pengiriman
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border bg-[#E6E4DA]/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary border border-border shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">
                        Ambil Sendiri di Kebun (Self-Pickup) — Rp 0
                      </h4>
                      <p className="text-[11px] text-ink-secondary leading-relaxed mt-0.5">
                        {pickupDescription}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-[#E6E4DA]/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary border border-border shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">
                        Diantar Petani — Rp {deliveryFeeFixed.toLocaleString("id-ID")} (Tarif Tetap)
                      </h4>
                      <p className="text-[11px] text-ink-secondary leading-relaxed mt-0.5">
                        {deliveryDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        commodity.farmer?.avatar ||
                        fallbackCommodity.farmer.avatar
                      }
                      alt={commodity.farmer?.name || "Petani"}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-ink">
                          {commodity.farmer?.name || "Mitra Petani"}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                          <CheckCircle2 className="w-3 h-3" />
                          Petani Terverifikasi
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-secondary mt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-ink">
                          <Star className="w-3.5 h-3.5 fill-status-pending text-status-pending" />
                          {commodity.farmer?.rating || 4.9} ({farmerReviews} ulasan)
                        </span>
                        <span>•</span>
                        <span>{farmerTransactions} Transaksi Sukses</span>
                        <span>•</span>
                        <span>{commodity.farmer?.distanceKm || 3.5} km dari Anda</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#E6E4DA]/40 border border-border flex items-center gap-2.5 text-xs text-ink-secondary">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {farmerLocationText}{farmerCoordText}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-5">
                <h3 className="text-base font-bold text-ink pb-3 border-b border-border">
                  Atur Pesanan Pre-Order
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-ink">Jumlah Pesanan</span>
                    <span className="text-[11px] text-ink-muted">
                      Min. {minKg} kg • Maks. {maxKg} kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between border border-border rounded-xl p-1 bg-[#E6E4DA]/30">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={orderQuantity <= minKg}
                      className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-ink hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-border/60"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="text-base font-bold text-ink">
                        {orderQuantity}
                      </span>
                      <span className="text-xs font-semibold text-ink-muted">
                        kg
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={orderQuantity >= maxKg}
                      className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-ink hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-border/60"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-ink block">
                    Metode Pengambilan / Kirim
                  </label>

                  <div className="space-y-2">
                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        fulfillmentMethod === "PICKUP"
                          ? "border-primary bg-primary-50/30"
                          : "border-border bg-surface hover:bg-[#E6E4DA]/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="fulfillment"
                          value="PICKUP"
                          checked={fulfillmentMethod === "PICKUP"}
                          onChange={() => setFulfillmentMethod("PICKUP")}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-medium text-ink">
                          Ambil Sendiri di Kebun
                        </span>
                      </div>
                      <span className="text-xs font-bold text-primary">Rp 0</span>
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        fulfillmentMethod === "DELIVERY"
                          ? "border-primary bg-primary-50/30"
                          : "border-border bg-surface hover:bg-[#E6E4DA]/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="fulfillment"
                          value="DELIVERY"
                          checked={fulfillmentMethod === "DELIVERY"}
                          onChange={() => setFulfillmentMethod("DELIVERY")}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-medium text-ink">
                          Diantar Petani
                        </span>
                      </div>
                      <span className="text-xs font-bold text-ink">
                        + Rp {deliveryFeeFixed.toLocaleString("id-ID")}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between items-center text-ink-secondary">
                    <span>
                      Harga {commodity.name} ({orderQuantity} kg × Rp {unitPrice.toLocaleString("id-ID")})
                    </span>
                    <span className="font-semibold text-ink">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-ink-secondary">
                    <span>Ongkos Kirim Petani</span>
                    <span className="font-semibold text-ink">
                      {deliveryFee === 0 ? "Gratis" : `Rp ${deliveryFee.toLocaleString("id-ID")}`}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-ink">Total Deposit Escrow:</span>
                    <span className="font-bold text-primary text-base">
                      Rp {totalEscrow.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {isSelfPurchaseBlocked ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      fullWidth
                      size="lg"
                      disabled
                      className="font-bold opacity-60 cursor-not-allowed bg-[#EFEEE7] text-ink-muted border-border"
                    >
                      Beli / Pesan Dinonaktifkan
                    </Button>
                    <p className="text-[11px] text-center text-[#DC2626] font-medium">
                      {isAdminRole
                        ? "Akun Admin Pengawas tidak dapat melakukan transaksi pemesanan komoditas."
                        : isOwnCommodity
                        ? "Anda tidak dapat membeli komoditas milik sendiri."
                        : "Akun Mitra Petani tidak dapat membeli komoditas. Masuk sebagai Pembeli UMKM untuk checkout."}
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleProceedEscrow}
                    className="font-bold"
                  >
                    Lanjut ke Pembayaran Escrow
                  </Button>
                )}

                <div className="p-3 rounded-xl bg-surface-green/40 border border-border flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-ink-secondary leading-relaxed">
                    Pembayaran Anda ditahan aman di rekening Escrow (simulasi). Dana hanya dilepas ke petani setelah Anda memverifikasi foto serah-terima di aplikasi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
