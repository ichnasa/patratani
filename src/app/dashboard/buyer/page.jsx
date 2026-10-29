"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useState } from "react";
import {
  Store,
  FileText,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  PackageCheck,
  Building2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { mockBuyerTenders, mockBuyerOrders } from "@/data/mockData";
import Button from "@/components/Button";

function BuyerDashboardPage() {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const pathname = usePathname();
  const location = { pathname, state: {} };
  const { currentUser, tenders } = useApp();
  const [activeTab, setActiveTab] = useState(
    (location.state?.tab || location.state?.menu || "ringkasan").toLowerCase()
  );

  const allTenders = [
    ...(tenders || []),
    ...mockBuyerTenders.filter((bt) => !(tenders || []).some((t) => t.id === bt.id)),
  ];

  const buyerTenders = allTenders.filter((tender) => {
    if (tender.authorId && currentUser?.id && tender.authorId === currentUser.id) {
      return true;
    }
    if (tender.buyerId && currentUser?.id && tender.buyerId === currentUser.id) {
      return true;
    }
    if (tender.buyer?.id && currentUser?.id && tender.buyer.id === currentUser.id) {
      return true;
    }
    if (
      (currentUser?.id === "USR-003" || !currentUser?.id || currentUser?.name?.toLowerCase().includes("lina")) &&
      (tender.buyer?.id === "BUYER-01" || tender.id === "TND-8821" || tender.id === "TND-8825" || tender.buyer?.contactPerson?.toLowerCase().includes("lina") || tender.buyer?.businessName?.toLowerCase().includes("lina"))
    ) {
      return true;
    }
    if (
      currentUser?.name &&
      (tender.buyer?.contactPerson?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
       tender.buyer?.businessName?.toLowerCase().includes(currentUser.name.toLowerCase()))
    ) {
      return true;
    }
    return false;
  });

  const buyerOrders = mockBuyerOrders;

  const sidebarMenuItems = [
    { id: "ringkasan", label: "Ringkasan", icon: Building2 },
    { id: "tender", label: "Tender Permintaan", icon: FileText, badge: "2" },
    { id: "pesanan", label: "Pesanan & Escrow", icon: PackageCheck, badge: "1" },
    { id: "profil", label: "Profil Dapur Usaha", icon: Store },
  ];

  const renderOrdersTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-ink-muted text-[11px] uppercase tracking-wider">
            <th className="pb-3 font-semibold">ID Transaksi</th>
            <th className="pb-3 font-semibold">Komoditas &amp; Petani</th>
            <th className="pb-3 font-semibold">Jadwal &amp; Metode</th>
            <th className="pb-3 font-semibold">Status Escrow</th>
            <th className="pb-3 font-semibold">Total Deposit</th>
            <th className="pb-3 font-semibold text-right">Tindakan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {buyerOrders.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-ink-muted">
                Belum ada pesanan aktif atau deposit escrow saat ini.
              </td>
            </tr>
          ) : (
            buyerOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#E6E4DA]/20 transition-colors">
                <td className="py-4 font-bold text-primary whitespace-nowrap">
                  {order.id}
                </td>
                <td className="py-4 whitespace-nowrap">
                  <span className="font-bold text-ink block">
                    {order.commodity}
                  </span>
                  <span className="text-[11px] text-ink-secondary">
                    {order.farmerName}
                  </span>
                </td>
                <td className="py-4 whitespace-nowrap">
                  <span className="text-ink block">
                    {order.schedule}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {order.deliveryType}
                  </span>
                </td>
                <td className="py-4 whitespace-nowrap">
                  {order.status === "HANDOVER" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#B45309] text-white shadow-xs">
                      Serah Terima
                    </span>
                  )}
                  {order.status === "PAID_HELD" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1E40AF] text-white shadow-xs">
                      Dana Tertahan
                    </span>
                  )}
                  {order.status === "COMPLETED" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#15803D] text-white shadow-xs">
                      Selesai
                    </span>
                  )}
                </td>
                <td className="py-4 font-bold text-ink whitespace-nowrap">
                  Rp {order.depositAmount.toLocaleString("id-ID")}
                </td>
                <td className="py-4 text-right whitespace-nowrap">
                  <Button
                    variant={order.status === "HANDOVER" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => navigate(order.actionRoute)}
                  >
                    {order.actionText}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTendersGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {buyerTenders.length === 0 ? (
        <div className="col-span-full py-8 text-center text-ink-muted bg-surface rounded-2xl border border-border">
          Belum ada tender permintaan yang dibuat.
        </div>
      ) : (
        buyerTenders.map((tender) => (
          <div
            key={tender.id}
            className="bg-surface rounded-2xl p-5 border border-border shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted">
                  Tender #{tender.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    tender.isBidding
                      ? "bg-primary text-[#E6E4DA]"
                      : "bg-[#FEF3C7] text-[#D97706]"
                  }`}
                >
                  {tender.badge || "OPEN"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-ink leading-tight">
                {tender.title}
              </h3>

              <p className="text-xs text-ink-secondary leading-relaxed">
                {tender.meta || `${tender.requiredKg || 20} kg • Target: Rp ${(tender.targetPricePerKg || tender.budget || 25000).toLocaleString("id-ID")}/kg`}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-ink-muted italic">
                {tender.note || "Kebutuhan rutin mingguan dapur"}
              </span>
              <Button
                variant={tender.isBidding ? "primary" : "outline"}
                size="sm"
                onClick={() => navigate(tender.actionRoute || `/tender/${tender.id}`)}
                className="shrink-0"
              >
                {tender.actionText || "Lihat Penawaran"}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col selection:bg-primary-50 selection:text-primary">
      <main className="w-full flex-1 flex-grow">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14 min-h-[85vh] flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"
                    alt="Bu Lina"
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                  <div>
                    <h2 className="text-sm font-bold text-ink">
                      {currentUser?.name || "Bu Lina (Warung Sederhana)"}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-surface-green border border-primary/20 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      UMKM Terverifikasi
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  {sidebarMenuItems.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? "bg-primary text-[#E6E4DA] shadow-xs"
                            : "text-ink-secondary hover:text-ink hover:bg-surface-green/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              isActive
                                ? "bg-[#E6E4DA] text-primary"
                                : "bg-border text-ink"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-green/30 border border-primary/20 space-y-2 text-xs">
                <span className="font-bold text-primary block">
                  Perlindungan Dana 100%
                </span>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  Deposit escrow Anda tetap aman di penampungan bersama. Petani baru menerima dana saat Anda mengonfirmasi verifikasi serah-terima.
                </p>
              </div>
            </aside>

            <div className="lg:col-span-9 space-y-8">
              {activeTab === "ringkasan" && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                        Ringkasan Pembelian &amp; Pasokan Dapur
                      </h1>
                      <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                        Warung Sederhana Bu Lina • Kuliner Lokal • Dana Aman di Rekening Escrow:{" "}
                        <span className="font-bold text-[#D97706]">Rp 265.000</span>
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => navigate("/tender/create")}
                      className="font-bold shrink-0"
                    >
                      Buat Tender Permintaan
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-ink-muted">
                        <span className="text-xs font-semibold">Pengeluaran Bulan Ini</span>
                        <div className="w-8 h-8 rounded-lg bg-surface-green text-primary flex items-center justify-center">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-ink">
                        Rp 4.650.000
                      </p>
                      <span className="text-[11px] font-semibold text-primary block">
                        Hemat 22.4% vs tengkulak
                      </span>
                    </div>

                    <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-ink-muted">
                        <span className="text-xs font-semibold">Tender Permintaan Aktif</span>
                        <div className="w-8 h-8 rounded-lg bg-[#E6E4DA] text-ink flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-ink">
                        2 Tender
                      </p>
                      <span className="text-[11px] text-ink-secondary block">
                        1 tender menerima 4 penawaran
                      </span>
                    </div>

                    <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-ink-muted">
                        <span className="text-xs font-semibold">Dana di Escrow</span>
                        <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-[#D97706]">
                        Rp 265.000
                      </p>
                      <span className="text-[11px] text-ink-secondary block">
                        Aman hingga serah-terima selesai
                      </span>
                    </div>

                    <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-ink-muted">
                        <span className="text-xs font-semibold">Menunggu Serah-Terima</span>
                        <div className="w-8 h-8 rounded-lg bg-surface-green text-primary flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-ink">
                        1 Pesanan
                      </p>
                      <span className="text-[11px] text-primary font-semibold block">
                        Jadwal hari ini pkl 07:00
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-ink">
                        Kelola Tender Permintaan Bahan Baku
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab("tender")}
                        className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                      >
                        <span>Lihat Semua Tender</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {renderTendersGrid()}
                  </div>

                  <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs space-y-4 p-6">
                    <div>
                      <h2 className="text-base font-bold text-ink">
                        Pesanan Berjalan &amp; Status Escrow Pembeli
                      </h2>
                      <p className="text-xs text-ink-secondary mt-0.5">
                        Dana 100% Terlindungi oleh Sistem Escrow
                      </p>
                    </div>

                    {renderOrdersTable()}
                  </div>
                </>
              )}

              {activeTab === "pesanan" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                        Pesanan &amp; Escrow
                      </h1>
                      <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                        Status real-time dana escrow dan verifikasi penyerahan pesanan bahan baku dapur
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => navigate("/tender/create")}
                      className="font-bold shrink-0"
                    >
                      Buat Tender Permintaan
                    </Button>
                  </div>

                  <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs space-y-4 p-6">
                    <div>
                      <h2 className="text-base font-bold text-ink">
                        Daftar Pesanan Berjalan
                      </h2>
                      <p className="text-xs text-ink-secondary mt-0.5">
                        Dana 100% Terlindungi oleh Sistem Escrow
                      </p>
                    </div>

                    {renderOrdersTable()}
                  </div>
                </div>
              )}

              {activeTab === "tender" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                        Tender Permintaan
                      </h1>
                      <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                        Kelola seluruh daftar tender pengadaan sayur dan bumbu untuk kebutuhan dapur usaha Anda
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => navigate("/tender/create")}
                      className="font-bold shrink-0"
                    >
                      Buka Tender Baru
                    </Button>
                  </div>

                  {renderTendersGrid()}
                </div>
              )}

              {activeTab === "profil" && (
                <div className="bg-surface rounded-2xl border border-border p-8 shadow-xs text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-green text-primary mx-auto flex items-center justify-center">
                    <Store className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl font-bold text-ink">Profil Dapur Usaha</h1>
                  <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto">
                    Kelola informasi usaha kuliner, titik penerimaan komoditas panen, dan pengaturan operasional.
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" onClick={() => navigate("/profile")}>
                      Buka Manajemen Profil Lengkap
                    </Button>
                  </div>
                </div>
              )}

              {!["ringkasan", "tender", "pesanan", "profil"].includes(activeTab) && (
                <div className="bg-surface rounded-2xl border border-border p-8 shadow-xs text-center space-y-3">
                  <h1 className="text-lg font-bold text-ink capitalize">{activeTab}</h1>
                  <p className="text-xs text-ink-secondary">Fitur sedang dalam pengembangan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      </div>
  );
}


export default function WrappedBuyerDashboardPage(props) {
  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <BuyerDashboardPage {...props} />
    </ProtectedRoute>
  );
}
