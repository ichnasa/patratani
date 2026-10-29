"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import StatusBadge from "@/components/StatusBadge";
import { mockTenders } from "@/data/mockData";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Store,
  Coins,
  Send,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";

export default function TenderDetailPage({
  tenderId = "TND-2026-002",
  onBack,
}) {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const { id } = useParams();
  const { activeTransaction, startTransactionFromTender, tenders, currentUser } = useApp();
  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin");
  const isFarmer = !isAdmin && (roleLower.includes("petani") || roleLower.includes("mitra"));
  const isBuyer = !isAdmin && (roleLower.includes("pembeli") || roleLower.includes("umkm"));
  const activeId = id || activeTransaction?.tenderId || tenderId;

  const tenderList = tenders && tenders.length > 0 ? tenders : mockTenders;
  const tender =
    tenderList.find((t) => t.id === activeId) ||
    mockTenders.find((t) => t.id === activeId) ||
    mockTenders[1];

  const hasBids = Boolean(tender.bids && tender.bids.length > 0);
  const hasWinner = Boolean(
    tender.winner ||
    tender.awardedFarmer ||
    tender.status === "AWARDED" ||
    tender.status === "PAID_HELD" ||
    tender.status === "HANDOVER" ||
    tender.status === "COMPLETED"
  );
  const canDepositEscrow = isBuyer && hasBids && hasWinner;



  const [offeredPrice, setOfferedPrice] = useState(tender.targetPricePerKg);
  const [offeredQuantity, setOfferedQuantity] = useState(
    tender.requiredQuantityKg
  );
  const [harvestDate, setHarvestDate] = useState("2026-10-30");
  const [deliveryMethod, setDeliveryMethod] = useState(
    tender.fulfillmentMethod || "SELF_PICKUP"
  );
  const [farmerDeliveryFee, setFarmerDeliveryFee] = useState(15000);
  const [notes, setNotes] = useState(
    "Hasil petik segar pagi hari dari kebun sendiri, sortasi bebas cacat/busuk."
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const parsedPrice = Number(offeredPrice) || 0;
  const parsedQuantity = Number(offeredQuantity) || 0;
  const activeDeliveryFee =
    deliveryMethod === "FARMER_DELIVERY" ? Number(farmerDeliveryFee) || 0 : 0;

  const harvestSubtotal = parsedPrice * parsedQuantity;
  const platformCommission = Math.round(harvestSubtotal * 0.03);
  const netHarvestEarning = harvestSubtotal - platformCommission;
  const netFarmerTotal = netHarvestEarning + activeDeliveryFee;
  const totalBuyerPayment = harvestSubtotal + activeDeliveryFee;

  const handleApplyOffer = () => {
    startTransactionFromTender(tender, {
      offeredPrice: parsedPrice,
      offeredQuantity: parsedQuantity,
      harvestDate,
      deliveryMethod,
      deliveryFee: activeDeliveryFee,
      notes,
    });
  };

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    handleApplyOffer();
    setIsSubmitted(true);
  };

  const handleProceedToEscrow = () => {
    handleApplyOffer();
    navigate("/escrow");
  };

  return (
    <div className="w-full flex-1 flex flex-col">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div>
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-primary transition-colors cursor-pointer select-none mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Tender</span>
            </button>

            <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-border/80">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-green border border-primary/20">
                      {tender.category}
                    </span>
                    <span className="text-xs text-ink-muted">•</span>
                    <span className="text-xs font-mono font-medium text-ink-muted">
                      {tender.id}
                    </span>
                    <span className="text-xs text-ink-muted">•</span>
                    <span className="text-xs text-ink-secondary">
                      Diterbitkan oleh {tender.buyer.businessName}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                    {tender.title}
                  </h1>

                  <p className="text-sm text-ink-secondary leading-relaxed">
                    "{tender.specifications}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={tender.status} size="md" showIcon showDot />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border/70 space-y-1">
                  <span className="text-[11px] font-medium text-ink-muted flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Batas Penawaran
                  </span>
                  <p className="text-base font-bold text-ink">{tender.deadlineDate}</p>
                  <p className="text-[11px] text-[#D97706] font-medium">
                    Sisa {tender.daysRemaining || 3} hari lagi
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border/70 space-y-1">
                  <span className="text-[11px] font-medium text-ink-muted flex items-center gap-1.5 uppercase tracking-wider">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    Anggaran Maksimal
                  </span>
                  <p className="text-base font-bold text-primary">
                    Rp {tender.targetPricePerKg.toLocaleString("id-ID")}/kg
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Total Rp {tender.totalBudget.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border/70 space-y-1">
                  <span className="text-[11px] font-medium text-ink-muted flex items-center gap-1.5 uppercase tracking-wider">
                    <Truck className="w-3.5 h-3.5 text-primary" />
                    Metode Serah-Terima
                  </span>
                  <p className="text-base font-bold text-ink">
                    {tender.fulfillmentMethod === "SELF_PICKUP"
                      ? "Ambil Sendiri"
                      : "Kurir Petani"}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {tender.fulfillmentMethod === "SELF_PICKUP"
                      ? "Diambil UMKM (Rp 0)"
                      : `Ongkir Rp ${(tender.deliveryFee || 15000).toLocaleString("id-ID")}`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#E6E4DA] border border-border/70 space-y-1">
                  <span className="text-[11px] font-medium text-ink-muted flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Lokasi Pemesan
                  </span>
                  <p className="text-base font-bold text-ink truncate">
                    {tender.buyer.businessName}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {tender.buyer.distanceKm} km dari radius Anda
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#EFEEE7] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-green text-primary flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-ink">{tender.buyer.businessName}</span>
                      <span className="px-1.5 py-0.2 bg-primary/10 text-primary text-[10px] font-semibold rounded">
                        {tender.buyer.businessType}
                      </span>
                    </div>
                    <p className="text-ink-secondary text-[11px]">
                      Alamat Kirim: {tender.buyer.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-ink-secondary text-right">
                  <div>
                    <span className="block text-ink-muted text-[10px]">Kontak PIC</span>
                    <span className="font-semibold text-ink">{tender.buyer.contactPerson}</span>
                  </div>
                  <div>
                    <span className="block text-ink-muted text-[10px]">Tingkat Keberhasilan</span>
                    <span className="font-semibold text-primary">100% Selesai (9 Transaksi)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-bold text-ink">
                      Formulir Pengajuan Penawaran Petani
                    </h2>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    Petani Mitra
                  </span>
                </div>

                {isFarmer ? (
                  isSubmitted ? (
                  <div className="p-6 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#166534]">
                        Penawaran Berhasil Diajukan!
                      </h3>
                      <p className="text-xs text-[#166534] max-w-md mx-auto leading-relaxed">
                        Tawaran Anda sebesar Rp {parsedPrice.toLocaleString("id-ID")}/kg untuk kuota {parsedQuantity} kg telah tersimpan di transaksi aktif dan terkirim ke {tender.buyer.businessName}.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        icon={ChevronRight}
                        iconPosition="right"
                        onClick={handleProceedToEscrow}
                      >
                        Lanjutkan ke Setor Escrow
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Revisi Penawaran
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOffer} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Harga Penawaran per Kg (Rp)"
                        type="number"
                        value={offeredPrice}
                        onChange={(e) => setOfferedPrice(e.target.value)}
                        placeholder="Contoh: 46000"
                        required
                        helperText={`Target pembeli: Rp ${tender.targetPricePerKg.toLocaleString("id-ID")}/kg`}
                      />

                      <Input
                        label="Kuota yang Disanggupi (Kg)"
                        type="number"
                        value={offeredQuantity}
                        onChange={(e) => setOfferedQuantity(e.target.value)}
                        placeholder="Contoh: 15"
                        required
                        helperText={`Permintaan: ${tender.requiredQuantityKg} kg`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Rencana Tanggal Panen"
                        type="date"
                        value={harvestDate}
                        onChange={(e) => setHarvestDate(e.target.value)}
                        required
                        helperText="Jadwal pemetikan di kebun petani"
                      />

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-ink block">
                          Opsi Pengiriman
                        </label>
                        <select
                          value={deliveryMethod}
                          onChange={(e) => setDeliveryMethod(e.target.value)}
                          className="w-full rounded-xl px-3.5 py-2.5 text-sm font-normal text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="SELF_PICKUP">
                            Ambil Sendiri di Kebun (Rp 0)
                          </option>
                          <option value="FARMER_DELIVERY">
                            Diantar Kurir Petani (Tarif Tetap)
                          </option>
                        </select>
                        <p className="text-xs text-ink-muted">
                          100% ongkos kirim langsung ke kas petani
                        </p>
                      </div>
                    </div>

                    {deliveryMethod === "FARMER_DELIVERY" && (
                      <Input
                        label="Tarif Pengiriman Kurir Petani (Rp)"
                        type="number"
                        value={farmerDeliveryFee}
                        onChange={(e) => setFarmerDeliveryFee(e.target.value)}
                        placeholder="15000"
                        required
                        helperText="Biaya penuh tanpa potongan komisi, dibayar oleh pembeli"
                      />
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink block">
                        Catatan Mutu &amp; Kondisi Panen
                      </label>
                      <textarea
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tuliskan spesifikasi bibit, metode sortasi, dan jaminan kesegaran..."
                        className="w-full rounded-xl p-3.5 text-sm text-ink bg-[#EFEEE7] border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        icon={Send}
                      >
                        Kirim Penawaran ke Pembeli
                      </Button>
                    </div>
                  </form>
                )) : (
                  <div className="p-6 rounded-xl bg-[#E6E4DA]/30 border border-border text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-surface-green text-primary flex items-center justify-center mx-auto">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-ink">
                        Aksi Penawaran Khusus Petani Mitra
                      </h3>
                      <p className="text-xs text-ink-secondary max-w-sm mx-auto leading-relaxed">
                        Pengajuan penawaran bahan baku hanya dapat dilakukan oleh akun Mitra Petani terverifikasi.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-ink">
                      Daftar Penawaran Petani yang Masuk
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E6E4DA] text-ink-secondary">
                    {(tender.bids || []).length} Tawaran
                  </span>
                </div>

                {tender.bids && tender.bids.length > 0 ? (
                  <div className="space-y-3">
                    {tender.bids.map((bid) => (
                      <div
                        key={bid.bidId || bid.id}
                        className="p-4 rounded-xl border border-border/80 bg-[#EFEEE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink text-sm">
                              {bid.farmerName}
                            </span>
                            <span className="text-xs text-ink-muted">•</span>
                            <span className="text-xs text-ink-secondary">
                              {bid.farmLocation || "Bandung"}
                            </span>
                          </div>
                          <span className="text-[11px] text-ink-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Diajukan {bid.bidDate}
                          </span>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <span className="text-base font-bold text-primary block">
                            Rp {bid.offeredPricePerKg.toLocaleString("id-ID")}/kg
                          </span>
                          <span className="text-xs text-ink-secondary">
                            Kuota {bid.offeredQuantityKg} Kg (Total Rp {(bid.offeredPricePerKg * bid.offeredQuantityKg).toLocaleString("id-ID")})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#E6E4DA] rounded-xl border border-border text-xs text-ink-muted">
                    Belum ada penawaran yang diajukan untuk tender ini. Jadilah penawar pertama!
                  </div>
                )}
              </section>
            </div>

            <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-border/80">
                  <Coins className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-ink">
                    Rincian Finansial &amp; Transparansi
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-ink-secondary">
                    <span>Subtotal Panen ({parsedQuantity} Kg × Rp {parsedPrice.toLocaleString("id-ID")}):</span>
                    <span className="font-semibold text-ink">
                      Rp {harvestSubtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#DC2626]">
                    <div className="flex items-center gap-1">
                      <span>Komisi Platform (3% dari hasil panen):</span>
                    </div>
                    <span className="font-semibold">
                      - Rp {platformCommission.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-ink-secondary">
                    <span>Ongkos Kirim Kurir Petani:</span>
                    <span className="font-semibold text-ink">
                      {activeDeliveryFee > 0
                        ? `+ Rp ${activeDeliveryFee.toLocaleString("id-ID")}`
                        : "Rp 0 (Self-pickup)"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-ink block">
                        Estimasi Pendapatan Bersih Petani
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        100% ongkos kirim diterima petani
                      </span>
                    </div>
                    <strong className="text-lg font-bold text-primary">
                      Rp {netFarmerTotal.toLocaleString("id-ID")}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-[#E6E4DA] border border-border/80 flex items-center justify-between text-xs mt-2">
                    <span className="text-ink-secondary">
                      Total Dana Dibayar Pembeli UMKM:
                    </span>
                    <span className="font-bold text-ink">
                      Rp {totalBuyerPayment.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {canDepositEscrow && (
                  <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    icon={ShieldCheck}
                    onClick={handleProceedToEscrow}
                  >
                    Setor Dana ke Escrow
                  </Button>
                )}

                <div className="p-4 rounded-xl bg-[#DDE0D4] border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Jaminan Escrow Patra Tani</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary leading-relaxed">
                    Setelah tender disepakati, pembeli wajib menyetor Rp {totalBuyerPayment.toLocaleString("id-ID")} ke rekening bersama (escrow). Petani dijamin menerima dana penuh saat serah terima diverifikasi via kamera geotag.
                  </p>
                </div>
              </div>

              <div className="bg-surface rounded-2xl p-5 border border-border space-y-3">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Ketentuan Transaksi Tender
                </h4>
                <ul className="space-y-2 text-xs text-ink-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Petani wajib menjamin kuota timbangan akurat sesuai penawaran.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Pengambilan mandiri (self-pickup) tidak dikenakan biaya pengiriman (Rp 0).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Verifikasi kamera in-app dengan geotag dan timestamp wajib dilakukan di lokasi penyerahan.</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
  );
}
