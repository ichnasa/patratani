"use client";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useState } from "react";
import {
  ShieldAlert,
  Scale,
  Lock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Camera,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  FileText,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { mockDisputesList } from "@/data/mockData";
import Button from "@/components/Button";

function AdminDisputeDashboardPage() {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedDispute, setSelectedDispute] = useState(mockDisputesList[0]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState(
    selectedDispute?.defaultDecision?.adminNotes || ""
  );
  const [farmerAmount, setFarmerAmount] = useState(
    selectedDispute?.defaultDecision?.farmerSplitAmount || 200000
  );
  const [buyerAmount, setBuyerAmount] = useState(
    selectedDispute?.defaultDecision?.buyerRefundAmount || 65000
  );
  const [isResolved, setIsResolved] = useState(false);

  const isDisputeResolved = (dispute) => {
    if (isResolved && dispute.id === selectedDispute?.id) return true;
    const status = String(dispute.status || "").toLowerCase();
    const badge = String(dispute.badge || "").toLowerCase();
    return (
      status === "resolved" ||
      status === "selesai" ||
      badge.includes("resolved") ||
      badge.includes("selesai")
    );
  };

  const filteredDisputes = mockDisputesList.filter((dispute) => {
    const resolved = isDisputeResolved(dispute);
    if (activeTab === "RESOLVED") {
      return resolved;
    }
    return !resolved;
  });

  const pendingCount = mockDisputesList.filter((dispute) => !isDisputeResolved(dispute)).length;
  const resolvedCount = mockDisputesList.filter((dispute) => isDisputeResolved(dispute)).length;

  const handleSelectDispute = (dispute) => {
    setSelectedDispute(dispute);
    setAdminNotes(dispute.defaultDecision?.adminNotes || "");
    setFarmerAmount(dispute.defaultDecision?.farmerSplitAmount || 0);
    setBuyerAmount(dispute.defaultDecision?.buyerRefundAmount || 0);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const list = mockDisputesList.filter((dispute) => {
      const resolved = isDisputeResolved(dispute);
      return tab === "RESOLVED" ? resolved : !resolved;
    });
    if (list.length > 0 && !list.some((d) => d.id === selectedDispute?.id)) {
      handleSelectDispute(list[0]);
    }
  };

  const handle100Farmer = () => {
    setFarmerAmount(selectedDispute.escrowAmount);
    setBuyerAmount(0);
    setAdminNotes(
      "Setelah verifikasi penuh, komoditas dan timbangan dinilai sesuai kontrak. Dana 100% dicairkan ke petani."
    );
  };

  const handle100Buyer = () => {
    setFarmerAmount(0);
    setBuyerAmount(selectedDispute.escrowAmount);
    setAdminNotes(
      "Setelah verifikasi penuh, komoditas dinilai rusak parah / tidak layak konsumsi. Dana 100% dikembalikan ke pembeli."
    );
  };

  const handleExecuteResolution = () => {
    setIsConfirmModalOpen(false);
    setIsResolved(true);
    if (showToast) {
      showToast(
        "Keputusan mediasi sengketa berhasil dieksekusi! Dana escrow telah didistribusikan.",
        "success"
      );
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block">
                Portal Admin &amp; Pengawas Escrow
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink">
                Pusat Resolusi Sengketa (DISPUTED)
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-bold border border-[#FDE68A]">
              <Scale className="w-4 h-4" />
              <span>Mediasi &amp; Pengawasan Escrow</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink">
                    Daftar Sengketa Berjalan
                  </h2>
                  <span className="text-xs text-ink-muted">
                    Total {mockDisputesList.length} Kasus
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#E5E5DB]/40 p-1 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => handleTabChange("PENDING")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "PENDING"
                        ? "bg-surface text-ink shadow-xs"
                        : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    Perlu Mediasi ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("RESOLVED")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "RESOLVED"
                        ? "bg-surface text-ink shadow-xs"
                        : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    Selesai ({resolvedCount})
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {filteredDisputes.length === 0 ? (
                    <div className="p-8 text-center text-xs text-ink-muted bg-[#E5E5DB]/20 rounded-xl border border-dashed border-border">
                      {activeTab === "RESOLVED"
                        ? "Tidak ada riwayat sengketa yang selesai"
                        : "Tidak ada sengketa yang perlu mediasi"}
                    </div>
                  ) : (
                    filteredDisputes.map((dispute) => {
                      const isSelected = selectedDispute?.id === dispute.id;
                      const disputeIsResolved = isDisputeResolved(dispute);
                      return (
                        <div
                          key={dispute.id}
                          onClick={() => handleSelectDispute(dispute)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                            isSelected
                              ? "bg-background border-primary ring-1 ring-primary/20 shadow-xs"
                              : "bg-surface hover:bg-[#E5E5DB]/30 border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">
                              Sengketa #{dispute.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                disputeIsResolved
                                  ? "bg-surface-green text-primary"
                                  : "bg-status-disputed/15 text-status-disputed"
                              }`}
                            >
                              {isResolved && dispute.id === selectedDispute?.id
                                ? "RESOLVED (Bagi Sebagian)"
                                : dispute.badge || dispute.status}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-ink leading-tight">
                            {dispute.orderId} • {dispute.commodity}
                          </p>

                          <p className="text-[11px] text-ink-secondary line-clamp-2">
                            {dispute.claimText}
                          </p>

                          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#D97706]">
                              Escrow: Rp {dispute.escrowAmount.toLocaleString("id-ID")}
                            </span>
                            <span className="text-ink-muted">
                              {dispute.reportedAt}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-ink">
                      Investigasi Bukti: Sengketa #{selectedDispute.id}
                    </h2>
                    <p className="text-xs text-ink-secondary">
                      Pesanan {selectedDispute.orderId} • Komoditas: {selectedDispute.commodity} (Target Kuota {selectedDispute.targetQuantityKg || 20} kg)
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-status-disputed/10 text-status-disputed text-xs font-bold border border-status-disputed/20 self-start sm:self-auto">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Dana Rp {selectedDispute.escrowAmount.toLocaleString("id-ID")} Dibekukan</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#E5E5DB]/30 border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary">
                        Petani: {selectedDispute.farmerName}
                      </span>
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Klaim: {selectedDispute.farmerClaimKg || 20.2} kg
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed italic bg-surface p-3 rounded-lg border border-border/60">
                      "{selectedDispute.farmerStatement || "Timbangan kebun sudah pas saat subuh keberangkatan."}"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#E5E5DB]/30 border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#D97706]">
                        Pembeli: {selectedDispute.buyerName}
                      </span>
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Klaim: {selectedDispute.buyerClaimKg || 14.7} kg Bagus
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed italic bg-surface p-3 rounded-lg border border-border/60">
                      "{selectedDispute.buyerStatement || "Saat tiba, ada tomat rusak berair di lapisan bawah keranjang."}"
                    </p>
                  </div>
                </div>

                {selectedDispute.geotagProof && (
                  <div className="p-5 rounded-2xl bg-[#E5E5DB]/40 border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-primary" />
                        Verifikasi Geotag &amp; Bukti Foto Lapangan
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-green text-primary border border-primary/20">
                        Foto Sah Browser
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="relative w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-border">
                        <img
                          src={selectedDispute.geotagProof.image}
                          alt="Foto Bukti Lapangan"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/70 rounded text-[9px] text-white truncate font-mono">
                          {selectedDispute.geotagProof.coordinates}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs flex-1">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{selectedDispute.geotagProof.radiusMatch}</span>
                        </div>
                        <div className="flex items-center gap-2 text-ink-secondary">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                          <span>Timestamp: {selectedDispute.geotagProof.timestamp}</span>
                        </div>
                        <p className="p-2.5 rounded-lg bg-surface border border-border text-[11px] text-ink-secondary leading-relaxed">
                          {selectedDispute.geotagProof.findings}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h2 className="text-base font-bold text-ink">
                    Keputusan Mediasi &amp; Tindakan Pencairan Dana
                  </h2>
                  <span className="text-xs font-semibold text-primary">
                    Total Escrow: Rp {selectedDispute.escrowAmount.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Catatan Resmi Keputusan Admin (Wajib Diisi):
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full bg-[#E5E5DB]/40 border border-border rounded-xl p-3.5 text-xs text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-[#E5E5DB]/20 space-y-2">
                      <label className="block text-xs font-bold text-primary">
                        Alokasi Pencairan ke Petani:
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-ink-muted">
                          Rp
                        </span>
                        <input
                          type="number"
                          value={farmerAmount}
                          onChange={(e) => setFarmerAmount(Number(e.target.value))}
                          className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-ink focus:outline-none focus:border-primary"
                        />
                      </div>
                      <span className="text-[10px] text-ink-muted block">
                        Kompensasi hasil panen layak + ongkos kirim
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-[#E5E5DB]/20 space-y-2">
                      <label className="block text-xs font-bold text-[#D97706]">
                        Alokasi Refund ke Pembeli:
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-ink-muted">
                          Rp
                        </span>
                        <input
                          type="number"
                          value={buyerAmount}
                          onChange={(e) => setBuyerAmount(Number(e.target.value))}
                          className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-ink focus:outline-none focus:border-primary"
                        />
                      </div>
                      <span className="text-[10px] text-ink-muted block">
                        Pengembalian saldo atas komoditas rusak
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handle100Farmer}
                      >
                        Cairkan 100% ke Petani
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handle100Buyer}
                      >
                        Refund 100% ke Pembeli
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => setIsConfirmModalOpen(true)}
                      className="font-bold"
                    >
                      Eksekusi Pembagian Dana Escrow
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">
                  Konfirmasi Eksekusi Mediasi Escrow
                </h3>
                <p className="text-xs text-ink-muted">
                  Sengketa #{selectedDispute.id} • Tindakan tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-ink-secondary">
                <span>Pencairan ke Petani ({selectedDispute.farmerName}):</span>
                <span className="font-bold text-primary">
                  Rp {farmerAmount.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between items-center text-ink-secondary">
                <span>Refund ke Pembeli ({selectedDispute.buyerName}):</span>
                <span className="font-bold text-[#D97706]">
                  Rp {buyerAmount.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-center text-ink">
                <span className="font-bold">Total Dana Escrow Dituntaskan:</span>
                <span className="font-bold text-sm">
                  Rp {(farmerAmount + buyerAmount).toLocaleString("id-ID")} (Lunas)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-status-disputed/10 border border-status-disputed/20 flex items-start gap-2 text-xs text-status-disputed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Kedua pihak akan menerima notifikasi resmi dan pembaruan saldo akun seketika.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Batal / Tinjau Ulang
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteResolution}
                className="font-bold"
              >
                Konfirmasi &amp; Lepaskan Dana
              </Button>
            </div>
          </div>
        </div>
      )}

      </div>
  );
}

export default function WrappedAdminDisputeDashboardPage(props) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDisputeDashboardPage {...props} />
    </ProtectedRoute>
  );
}
