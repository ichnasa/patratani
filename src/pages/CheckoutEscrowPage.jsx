import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  CreditCard,
  Wallet,
  Truck,
  Store,
  Sprout,
  Calendar,
  Lock,
  ChevronRight,
} from "lucide-react";

export default function CheckoutEscrowPage({
  onBack,
  onPaymentSuccess,
}) {
  const navigate = useNavigate();
  const { activeTransaction, payEscrow } = useApp();
  const [selectedMethod, setSelectedMethod] = useState("QRIS");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("DELIVERY");
  const [isPaidSuccess, setIsPaidSuccess] = useState(
    activeTransaction?.status === "PAID_HELD" || false
  );
  const [isH1Confirmed, setIsH1Confirmed] = useState(true);

  const dealData = activeTransaction || {
    tenderId: "TND-2026-004",
    title: "Stok Pisang Kepok Kuning Tua 40 Kg",
    commodityName: "Pisang Kepok Kuning Super",
    category: "Buah-buahan",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    grade: "Grade Super",
    quantityKg: 40,
    pricePerKg: 14000,
    subtotal: 560000,
    fulfillmentMethod: "FARMER_DELIVERY",
    deliveryFee: 25000,
    totalPayment: 585000,
    deliveryDate: "2026-10-28",
    farmer: {
      name: "Pak Wayan Sudirga",
      farmName: "Tani Buah Barokah",
      location: "Tagogapu, Padalarang, Bandung Barat",
      distanceKm: 11.5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      rating: 4.7,
      verified: true,
    },
    buyer: {
      businessName: "Pisang Crispy Juara",
      contactPerson: "Bapak Hendra Gunawan",
      businessType: "UMKM Camilan & Gorengan",
      deliveryAddress: "Jl. Setiabudi No. 120, Sukasari, Kota Bandung",
      phone: "+62 812-3456-7890",
    },
  };

  const steps = [
    { key: "AWARDED", label: "Pemenang Ditunjuk", isDone: true },
    { key: "PAID_HELD", label: "Setor Escrow", isActive: !isPaidSuccess, isDone: isPaidSuccess },
    { key: "HANDOVER", label: "Serah Terima", isPending: !isPaidSuccess, isActive: isPaidSuccess },
    { key: "COMPLETED", label: "Pencairan Selesai", isPending: true },
  ];

  const paymentMethods = [
    {
      id: "QRIS",
      name: "QRIS Instan Sandbox",
      subtitle: "Bebas biaya admin • Verifikasi otomatis",
      icon: QrCode,
      tag: "Paling Populer",
    },
    {
      id: "VA_BCA",
      name: "BCA Virtual Account",
      subtitle: "Nomor VA simulasi: 8801-9283-7718-2901",
      icon: CreditCard,
      tag: "Otomatis 24 Jam",
    },
    {
      id: "VA_MANDIRI",
      name: "Mandiri Virtual Account",
      subtitle: "Nomor VA simulasi: 8902-1144-8890-5512",
      icon: CreditCard,
      tag: "Otomatis 24 Jam",
    },
    {
      id: "WALLET",
      name: "Saldo Dompet Usaha Patra",
      subtitle: "Saldo akun simulasi: Rp 2.450.000",
      icon: Wallet,
      tag: "Saldo Cukup",
    },
  ];

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaidSuccess(true);
      if (payEscrow) {
        payEscrow();
      }
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="transaksi" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div>
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-primary transition-colors cursor-pointer select-none mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Detail Kesepakatan</span>
            </button>

            <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
                <div>
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                    Alur Pembayaran Aman • {dealData.tenderId}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight mt-0.5">
                    Setor Dana ke Rekening Bersama Escrow
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={isPaidSuccess ? "PAID_HELD" : "AWARDED"}
                    size="md"
                    showIcon
                    showDot
                  />
                </div>
              </div>

              <div className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {steps.map((st, idx) => (
                    <div
                      key={st.key}
                      onClick={() => {
                        if (st.key === "HANDOVER") navigate("/handover");
                        else if (st.key === "COMPLETED") navigate("/completed");
                      }}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between min-h-[85px] cursor-pointer hover:scale-[1.01] ${
                        st.isActive
                          ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/30"
                          : st.isDone
                          ? "bg-[#DCFCE7] border-[#BBF7D0]"
                          : "bg-[#E6E4DA]/50 border-border opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${st.isActive ? "text-white/80" : "text-ink-muted"}`}>
                          0{idx + 1}
                        </span>
                        {st.isDone && (
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                        )}
                        {st.isActive && (
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                      </div>

                      <div>
                        <p
                          className={`text-xs font-bold ${
                            st.isActive
                              ? "text-white"
                              : st.isDone
                              ? "text-[#166534]"
                              : "text-ink-secondary"
                          }`}
                        >
                          {st.label}
                        </p>
                        <span className={`text-[10px] ${st.isActive ? "text-white/80" : "text-ink-muted"}`}>
                          {st.isDone
                            ? "Selesai"
                            : st.isActive
                            ? "Tahap Ini"
                            : "Berikutnya"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {isPaidSuccess ? (
            <section className="bg-surface rounded-2xl p-8 sm:p-10 border border-[#BBF7D0] bg-[#DCFCE7]/30 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-[#166534] uppercase tracking-wider bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#BBF7D0]">
                  Status Escrow: PAID_HELD
                </span>
                <h2 className="text-2xl font-bold text-ink">
                  Dana Berhasil Diamankan di Rekening Escrow!
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Pembayaran sebesar <strong>Rp {(dealData.totalPayment || 585000).toLocaleString("id-ID")}</strong> telah masuk ke rekening penampung simulasi Patra Tani (ID Escrow: <code className="font-mono font-bold text-ink">{dealData.escrowId || "ESC-20261027-8891"}</code>).
                </p>
              </div>

              <div className="p-5 max-w-lg mx-auto rounded-xl bg-[#EFEEE7] border border-border text-left space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <Truck className="w-4 h-4" />
                  <span>Petani Segera Memulai Pengiriman</span>
                </div>
                <p className="text-ink-secondary leading-relaxed">
                  {dealData.farmer?.name || "Petani"} telah menerima notifikasi bahwa dana telah aman di escrow. Komoditas siap diantar pada jadwal: <strong>{dealData.deliveryDate || "2026-10-28"}</strong>.
                </p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-ink font-medium">
                  <span>Penerima:</span>
                  <span>{dealData.buyer?.businessName} ({dealData.buyer?.contactPerson})</span>
                </div>
              </div>

              <div className="p-5 max-w-xl mx-auto rounded-2xl bg-surface border border-border text-left space-y-4 text-xs shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2 font-bold text-ink text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Langkah Selanjutnya: Serah-Terima (HANDOVER)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-green text-primary border border-primary/20">
                    Prosedur Resmi
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#FEF3C7]/60 border border-[#FDE68A] space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          1
                        </span>
                        <span className="font-bold text-ink">
                          Konfirmasi Kesiapan Panen (H-1)
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isH1Confirmed
                          ? "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]"
                          : "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                      }`}>
                        {isH1Confirmed ? "Petik Subuh Siap (Dikonfirmasi)" : "Menunggu Konfirmasi"}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary leading-relaxed pl-7">
                      Petani ({dealData.farmer?.name || "Kang Rizal"}) mengonfirmasi kesiapan petik subuh melalui sistem pada H-1 pengiriman ({dealData.deliveryDate || "28 Okt 2026"}, 18:00 WIB).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#EFEEE7] border border-border space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-ink-muted text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        2
                      </span>
                      <span className="font-bold text-ink">
                        Verifikasi Kamera In-App saat Tiba di Lokasi
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary leading-relaxed pl-7">
                      Buka kamera web Patra Tani untuk merekam bukti foto hasil panen dan kesesuaian timbangan. Sistem otomatis menyematkan koordinat GPS &amp; stempel waktu sah.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#EFEEE7] border border-border space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-ink-muted text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        3
                      </span>
                      <span className="font-bold text-ink">
                        Pencairan Dana Escrow Otomatis
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary leading-relaxed pl-7">
                      Dana Rp {(dealData.totalPayment || 585000).toLocaleString("id-ID")} hanya cair ke rekening dompet petani setelah pembeli menyetujui hasil foto dan timbangan di aplikasi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ChevronRight}
                  iconPosition="right"
                  onClick={() => navigate("/handover")}
                >
                  Lanjutkan ke Serah-Terima (Handover)
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate("/")}
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </section>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-primary" />
                      <h2 className="text-base font-bold text-ink">
                        Ringkasan Kesepakatan Panen
                      </h2>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      Pemenang Ditunjuk
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <img
                      src={dealData.image || "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80"}
                      alt={dealData.commodityName}
                      className="w-full sm:w-28 h-28 rounded-xl object-cover border border-border shrink-0"
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1A1A1A] text-[#E6E4DA]">
                          {dealData.grade || "Grade Super"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-green text-primary border border-primary/20">
                          {dealData.category || "Komoditas Segar"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-ink leading-tight">
                        {dealData.commodityName}
                      </h3>
                      <p className="text-xs text-ink-secondary">
                        Tender / Pesanan: {dealData.title}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-ink">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>Serah Terima: <strong>{dealData.deliveryDate || "2026-10-28"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-ink">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          <span>Metode: <strong>{fulfillmentMethod === "PICKUP" ? "Ambil Sendiri di Kebun" : "Diantar Petani"}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/80 space-y-2">
                    <label className="text-xs font-bold text-ink block">
                      Metode Pengambilan / Kirim
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setFulfillmentMethod("PICKUP")}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          fulfillmentMethod === "PICKUP"
                            ? "border-primary bg-surface-green/60 ring-1 ring-primary/20 shadow-xs"
                            : "border-border bg-[#EFEEE7]/60 hover:bg-[#E6E4DA]/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="checkoutFulfillment"
                            value="PICKUP"
                            checked={fulfillmentMethod === "PICKUP"}
                            onChange={() => setFulfillmentMethod("PICKUP")}
                            className="text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-ink">
                            Ambil Sendiri di Kebun
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary">Rp 0</span>
                      </label>

                      <label
                        onClick={() => setFulfillmentMethod("DELIVERY")}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          fulfillmentMethod === "DELIVERY"
                            ? "border-primary bg-surface-green/60 ring-1 ring-primary/20 shadow-xs"
                            : "border-border bg-[#EFEEE7]/60 hover:bg-[#E6E4DA]/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="checkoutFulfillment"
                            value="DELIVERY"
                            checked={fulfillmentMethod === "DELIVERY"}
                            onChange={() => setFulfillmentMethod("DELIVERY")}
                            className="text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-ink">
                            Diantar Petani
                          </span>
                        </div>
                        <span className="text-xs font-bold text-ink">
                          + Rp {(Number(dealData.deliveryFee) || 15000).toLocaleString("id-ID")}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/80">
                    <div className="p-3.5 rounded-xl bg-[#EFEEE7] border border-border space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                        Pihak Petani Pemenang
                      </span>
                      <div className="flex items-center gap-3">
                        <img
                          src={dealData.farmer?.avatar}
                          alt={dealData.farmer?.name}
                          className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                        <div>
                          <p className="text-xs font-bold text-ink leading-tight">
                            {dealData.farmer?.name}
                          </p>
                          <p className="text-[10px] text-ink-muted">
                            {dealData.farmer?.farmName} • {dealData.farmer?.distanceKm || 4.2} km
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-secondary">
                        {dealData.farmer?.location}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#EFEEE7] border border-border space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                        Alamat Dapur UMKM Penerima
                      </span>
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-ink leading-tight">
                            {dealData.buyer?.businessName}
                          </p>
                          <p className="text-[10px] text-ink-muted">
                            PIC: {dealData.buyer?.contactPerson} ({dealData.buyer?.phone})
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-secondary">
                        {dealData.buyer?.deliveryAddress || dealData.buyer?.address}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      <h2 className="text-base font-bold text-ink">
                        Pilih Metode Pembayaran Escrow (Sandbox)
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-bidding/20 text-status-bidding">
                      Simulasi Aktif
                    </span>
                  </div>

                  <p className="text-xs text-ink-secondary">
                    Pilih salah satu metode simulasi di bawah ini untuk mendanai rekening penampung bersama:
                  </p>

                  <div className="space-y-3">
                    {paymentMethods.map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = selectedMethod === pm.id;

                      return (
                        <div
                          key={pm.id}
                          onClick={() => setSelectedMethod(pm.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-surface-green/70 border-primary ring-2 ring-primary/20 shadow-xs"
                              : "bg-[#EFEEE7] border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-primary text-[#E6E4DA]"
                                  : "bg-surface text-ink-secondary border border-border"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-ink">
                                  {pm.name}
                                </span>
                                <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-surface border border-border/60 text-ink-secondary">
                                  {pm.tag}
                                </span>
                              </div>
                              <p className="text-[11px] text-ink-secondary">
                                {pm.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-border bg-surface"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#E6E4DA]" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-border/80">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-ink">
                      Rincian Pembayaran Escrow
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-ink-secondary">
                      <span>Subtotal Panen ({dealData.quantityKg} Kg × Rp {(dealData.pricePerKg || 14000).toLocaleString("id-ID")}):</span>
                      <span className="font-semibold text-ink">
                        Rp {(dealData.subtotal || 560000).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-ink-secondary">
                      <div className="flex items-center gap-1">
                        <span>Ongkos Kirim Kurir Petani:</span>
                      </div>
                      <span className="font-semibold text-ink">
                        Rp {(dealData.deliveryFee || 0).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="text-[10px] text-ink-muted pl-1 border-l-2 border-primary/40 leading-relaxed">
                      100% ongkir masuk penuh ke petani. Tidak dipotong komisi platform.
                    </div>

                    <div className="flex items-center justify-between text-ink-secondary">
                      <span>Biaya Penanganan Escrow:</span>
                      <span className="font-semibold text-[#16A34A]">
                        Rp 0 (Simulasi Bebas Biaya)
                      </span>
                    </div>

                    <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-ink block">
                          Total yang Harus Disetor
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          Diamankan di rekening sandbox
                        </span>
                      </div>
                      <strong className="text-xl font-bold text-primary">
                        Rp {(dealData.totalPayment || 585000).toLocaleString("id-ID")}
                      </strong>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={Lock}
                    isLoading={isProcessing}
                    onClick={handlePay}
                  >
                    Bayar &amp; Amankan ke Escrow
                  </Button>

                  <div className="p-4 rounded-xl bg-[#DDE0D4] border border-primary/20 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Perlindungan Tanpa Gudang</span>
                    </div>
                    <p className="text-[11px] text-ink-secondary leading-relaxed">
                      Dana Anda 100% aman tertahan di rekening bersama (escrow). Petani hanya dapat mencairkan dana setelah komoditas tiba di dapur dan diverifikasi dengan foto kamera + geotag.
                    </p>
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-5 border border-border space-y-3">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Jaminan Transaksi Patra Tani
                  </h4>
                  <ul className="space-y-2 text-xs text-ink-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>Dana tertahan hingga penimbangan dan pengecekan fisik selesai.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>Jika komoditas rusak atau kuota kurang, pembeli dapat mengajukan sengketa (dispute).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>Petani langsung menerima pencairan otomatis setelah verifikasi disetujui.</span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
