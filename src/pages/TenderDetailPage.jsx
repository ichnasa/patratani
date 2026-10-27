import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Input from "../components/Input";
import StatusBadge from "../components/StatusBadge";
import { mockTenders } from "../data/mockTenders";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Store,
  Coins,
  Send,
  Building2,
  FileText,
  BadgeCheck,
} from "lucide-react";

export default function TenderDetailPage({
  tenderId = "TND-2026-002",
  onBack,
}) {
  const tender =
    mockTenders.find((t) => t.id === tenderId) || mockTenders[1];

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

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="transaksi" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28 md:pb-14">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-primary transition-colors cursor-pointer select-none mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Tender</span>
          </button>

          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border space-y-6">
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

                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {tender.title}
                </h1>

                <p className="text-sm text-ink-secondary leading-relaxed">
                  "{tender.specifications}"
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <StatusBadge status={tender.status} size="lg" showIcon showDot />
                <span className="text-xs text-ink-muted">
                  Batas Tender: <strong className="text-ink">{tender.deadlineDate}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                  Kebutuhan Pasokan
                </span>
                <p className="text-lg sm:text-xl font-extrabold text-ink mt-0.5">
                  {tender.requiredQuantityKg} Kg
                </p>
                <span className="text-[11px] text-ink-secondary">Timbangan Pas</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                  Target Anggaran
                </span>
                <p className="text-lg sm:text-xl font-extrabold text-primary mt-0.5">
                  Rp {tender.targetPricePerKg.toLocaleString("id-ID")}/kg
                </p>
                <span className="text-[11px] text-ink-secondary">
                  Maks. Rp {tender.totalBudget.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                  Metode Serah Terima
                </span>
                <p className="text-sm sm:text-base font-bold text-ink mt-1 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {tender.fulfillmentMethod === "SELF_PICKUP"
                      ? "Ambil Sendiri"
                      : "Diantar Petani"}
                  </span>
                </p>
                <span className="text-[11px] text-ink-secondary">
                  {tender.fulfillmentMethod === "SELF_PICKUP"
                    ? "Ongkir Rp 0"
                    : `Tarif Rp ${tender.deliveryFee.toLocaleString("id-ID")}`}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#E6E4DA] border border-border">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                  Jadwal Diterima
                </span>
                <p className="text-sm sm:text-base font-bold text-ink mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{tender.deliveryDate}</span>
                </p>
                <span className="text-[11px] text-ink-secondary">
                  Pagi hari dapur buka
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-green text-primary flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-ink">
                      {tender.buyer.businessName}
                    </p>
                    {tender.buyer.verified && (
                      <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-ink-secondary">
                    {tender.buyer.businessType} • Kontak: {tender.buyer.contactPerson}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-ink-secondary">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{tender.buyer.address} ({tender.buyer.distanceKm} km)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-ink">
                    Formulir Pengajuan Penawaran Petani
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  Petani Mitra
                </span>
              </div>

              {isSubmitted ? (
                <div className="p-6 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#166534]">
                    Penawaran Berhasil Diajukan!
                  </h3>
                  <p className="text-xs text-[#166534] max-w-md mx-auto leading-relaxed">
                    Tawaran Anda sebesar Rp {parsedPrice.toLocaleString("id-ID")}/kg untuk kuota {parsedQuantity} kg telah terkirim ke {tender.buyer.businessName}. Anda akan mendapatkan notifikasi jika penawaran Anda ditunjuk sebagai pemenang (*AWARDED*).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Ajukan Revisi Penawaran
                  </Button>
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
                      label="Tarif Pengantaran Petani (Rp)"
                      type="number"
                      value={farmerDeliveryFee}
                      onChange={(e) => setFarmerDeliveryFee(e.target.value)}
                      helperText="Tarif tetap pengantaran armada motor/mobil boks petani"
                    />
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink block">
                      Catatan Penawaran Petani
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm font-normal text-ink bg-[#EFEEE7] border border-border hover:border-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      placeholder="Jelaskan kondisi kualitas, tingkat kematangan, dan jam panen..."
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      icon={Send}
                      disabled={parsedPrice <= 0 || parsedQuantity <= 0}
                    >
                      Kirimkan Penawaran Resmi
                    </Button>
                  </div>
                </form>
              )}
            </section>

            <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <h3 className="text-base font-bold text-ink">
                  Daftar Penawaran Petani yang Masuk ({tender.bids.length})
                </h3>
                <span className="text-xs text-ink-muted">Proses Seleksi</span>
              </div>

              {tender.bids.length > 0 ? (
                <div className="space-y-3">
                  {tender.bids.map((bid) => (
                    <div
                      key={bid.bidId}
                      className="p-4 rounded-2xl bg-[#E6E4DA] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink">
                            {bid.farmerName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface text-ink-muted">
                            {bid.bidId}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary">
                          "{bid.notes}"
                        </p>
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Diajukan {bid.bidDate}
                        </span>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-base font-extrabold text-primary block">
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
                <div className="p-8 text-center bg-[#E6E4DA] rounded-2xl border border-border text-xs text-ink-muted">
                  Belum ada penawaran yang diajukan untuk tender ini. Jadilah penawar pertama!
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border/80">
                <Coins className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-ink">
                  Simulasi Finansial &amp; Transparansi
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
                  <strong className="text-lg font-extrabold text-primary">
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

              <div className="p-4 rounded-2xl bg-[#DDE0D4] border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Jaminan Escrow Patra Tani</span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  Setelah tender disepakati, pembeli wajib menyetor Rp {totalBuyerPayment.toLocaleString("id-ID")} ke rekening escrow simulasi. Petani dijamin menerima dana penuh saat serah terima diverifikasi via kamera geotag.
                </p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border space-y-3">
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
      </main>

      <Footer />
    </div>
  );
}
