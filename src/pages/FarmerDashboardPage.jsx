import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Camera,
  ChevronRight,
  Plus,
  ArrowUpRight,
  PackageCheck,
  MapPin,
  Calendar,
  Wallet,
  Settings,
  UserCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

export default function FarmerDashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [activeMenu, setActiveMenu] = useState("RINGKASAN");

  const farmerOrders = [
    {
      id: "#PT-2026-0842",
      commodity: "Tomat Merah (20 kg)",
      buyerName: "Warung Sederhana Bu Lina",
      schedule: "29 Okt 2026, 07:00 WIB",
      deliveryType: "Diantar Petani",
      status: "HANDOVER",
      netPayment: 257200,
      actionText: "Buka Kamera Geotag",
      actionRoute: "/handover",
    },
    {
      id: "#PT-2026-0839",
      commodity: "Cabai Rawit Merah (15 kg)",
      buyerName: "Cafe Kopi Lembang",
      schedule: "30 Okt 2026, 06:30 WIB",
      deliveryType: "Self-Pickup",
      status: "PAID_HELD",
      netPayment: 436500,
      actionText: "Siapkan Panen",
      actionRoute: "/escrow",
    },
    {
      id: "#PT-2026-0831",
      commodity: "Bayam Hijau Organik (25 kg)",
      buyerName: "Resto Sunda Nikmat",
      schedule: "26 Okt 2026, 08:00 WIB",
      deliveryType: "Diantar Petani",
      status: "COMPLETED",
      netPayment: 194000,
      actionText: "Lihat Bukti Escrow",
      actionRoute: "/completed",
    },
  ];

  const sidebarMenuItems = [
    { id: "RINGKASAN", label: "Ringkasan Kinerja", icon: TrendingUp },
    { id: "ORDERS", label: "Pesanan & Escrow", icon: PackageCheck, badge: "4" },
    { id: "ETALASE", label: "Etalase Saya", icon: ShoppingBag },
    { id: "FINANCE", label: "Pendapatan & Saldo", icon: Wallet },
    { id: "DELIVERY", label: "Pengaturan Delivery", icon: Settings },
    { id: "PROFILE", label: "Profil & Kebun", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="akun" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      currentUser?.avatar ||
                      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
                    }
                    alt={currentUser?.name || "Petani"}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                  <div>
                    <h2 className="text-sm font-bold text-ink">
                      {currentUser?.name || "Kang Rizal"}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-surface-green border border-primary/20 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Petani Terverifikasi
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  {sidebarMenuItems.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === "ETALASE") navigate("/explore");
                          else if (item.id === "PROFILE") navigate("/profile");
                          else setActiveMenu(item.id);
                        }}
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
                  Status Pengantaran Mandiri
                </span>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  Tarif tetap Rp 5.000/trip aktif. 100% ongkir otomatis ditransfer ke saldo dompet Anda saat serah-terima terverifikasi.
                </p>
              </div>
            </aside>

            <div className="lg:col-span-9 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                    Ringkasan Kinerja Kebun &amp; Escrow
                  </h1>
                  <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                    Kelompok Tani Subur • Desa Pasirjambu, Ciwidey • Saldo Siap Tarik:{" "}
                    <span className="font-bold text-primary">
                      Rp {(currentUser?.activeBalance || 4250000).toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>

                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => navigate("/etalase/create")}
                  className="font-bold shrink-0"
                >
                  Buka Etalase Panen
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-ink-muted">
                    <span className="text-xs font-semibold">Pendapatan Bulan Ini</span>
                    <div className="w-8 h-8 rounded-lg bg-surface-green text-primary flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-ink">
                    Rp 8.420.000
                  </p>
                  <span className="text-[11px] font-semibold text-primary block">
                    +18.4% dari bulan lalu
                  </span>
                </div>

                <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-ink-muted">
                    <span className="text-xs font-semibold">Kuota Terjual / Siap</span>
                    <div className="w-8 h-8 rounded-lg bg-[#E6E4DA] text-ink flex items-center justify-center">
                      <Sprout className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-ink">
                    340 / 400 kg
                  </p>
                  <span className="text-[11px] text-ink-secondary block">
                    85% teralokasi pre-order
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
                    Rp {(currentUser?.escrowBalance || 1585000).toLocaleString("id-ID")}
                  </p>
                  <span className="text-[11px] text-ink-secondary block">
                    Menunggu serah-terima selesai
                  </span>
                </div>

                <div className="bg-surface rounded-2xl p-5 border border-border shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-ink-muted">
                    <span className="text-xs font-semibold">Transaksi Sukses</span>
                    <div className="w-8 h-8 rounded-lg bg-surface-green text-primary flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-ink">
                    64 Pesanan
                  </p>
                  <span className="text-[11px] text-primary font-semibold block">
                    100% tanpa sengketa
                  </span>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-ink">
                      Pesanan Aktif &amp; Serah-Terima Kebun
                    </h2>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Status real-time dana escrow dan verifikasi penyerahan hasil panen
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-ink-muted text-[11px] uppercase tracking-wider">
                        <th className="pb-3 font-semibold">ID Transaksi</th>
                        <th className="pb-3 font-semibold">Komoditas &amp; Pembeli</th>
                        <th className="pb-3 font-semibold">Jadwal &amp; Pengiriman</th>
                        <th className="pb-3 font-semibold">Status Escrow</th>
                        <th className="pb-3 font-semibold">Total Bersih</th>
                        <th className="pb-3 font-semibold text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {farmerOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#E6E4DA]/20 transition-colors">
                          <td className="py-4 font-bold text-primary whitespace-nowrap">
                            {order.id}
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <span className="font-bold text-ink block">
                              {order.commodity}
                            </span>
                            <span className="text-[11px] text-ink-secondary">
                              {order.buyerName}
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
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                                HANDOVER
                              </span>
                            )}
                            {order.status === "PAID_HELD" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-50 text-primary">
                                PAID_HELD
                              </span>
                            )}
                            {order.status === "COMPLETED" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-green text-primary">
                                COMPLETED
                              </span>
                            )}
                          </td>
                          <td className="py-4 font-bold text-ink whitespace-nowrap">
                            Rp {order.netPayment.toLocaleString("id-ID")}
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
                      ))}
                    </tbody>
                  </table>
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