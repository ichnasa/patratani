import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sprout,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Plus,
  PackageCheck,
  Settings,
  UserCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

export default function FarmerDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, showToast, commodities } = useApp();
  const [activeTab, setActiveTab] = useState(
    (location.state?.tab || location.state?.menu || "ringkasan").toLowerCase()
  );

  const farmerCommodities = (commodities || []).filter((item) => {
    if (item.authorId && currentUser?.id && item.authorId === currentUser.id) {
      return true;
    }
    if (item.farmerId && currentUser?.id && item.farmerId === currentUser.id) {
      return true;
    }
    if (item.farmer?.id && currentUser?.id && item.farmer.id === currentUser.id) {
      return true;
    }
    if (
      currentUser?.name &&
      item.farmer?.name &&
      (item.farmer.name.toLowerCase().includes(currentUser.name.toLowerCase()) ||
       currentUser.name.toLowerCase().includes(item.farmer.name.toLowerCase()))
    ) {
      return true;
    }
    if (
      (currentUser?.id === "USR-001" || currentUser?.id === "USR-002" || !currentUser?.id) &&
      (item.farmer?.id === "FARM-01" || item.farmer?.name?.toLowerCase().includes("mulyono") || item.farmer?.name?.toLowerCase().includes("rizal"))
    ) {
      return true;
    }
    return false;
  });

  const [deliverySettings, setDeliverySettings] = useState({
    isEnabled: true,
    maxCapacityKg: 50,
    fixedDeliveryFee: 5000,
    maxRadiusKm: 15,
    vehicleType: "Motor + Keranjang Bronjong",
    operatingHours: "06:00 - 10:00",
    operatingHoursStart: "06:00",
    operatingHoursEnd: "10:00",
  });

  const handleSaveDelivery = (e) => {
    e.preventDefault();
    if (showToast) {
      showToast("Pengaturan delivery mandiri berhasil disimpan!", "success");
    }
  };

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
    { id: "ringkasan", label: "Ringkasan Kinerja", icon: TrendingUp },
    { id: "pesanan", label: "Pesanan & Escrow", icon: PackageCheck, badge: "4" },
    { id: "etalase", label: "Etalase Saya", icon: ShoppingBag },
    { id: "delivery", label: "Pengaturan Delivery", icon: Settings },
    { id: "profil", label: "Profil & Kebun", icon: UserCheck },
  ];

  const renderOrdersTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-ink-muted text-[11px] uppercase tracking-wider">
            <th className="pb-3 font-semibold">ID Transaksi</th>
            <th className="pb-3 font-semibold">Komoditas &amp; Pembeli</th>
            <th className="pb-3 font-semibold">Jadwal &amp; Pengiriman</th>
            <th className="pb-3 font-semibold">Status Escrow</th>
            <th className="pb-3 font-semibold">Total Pendapatan Bersih</th>
            <th className="pb-3 font-semibold text-right">Tindakan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {farmerOrders.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-ink-muted">
                Belum ada pesanan aktif di kebun saat ini.
              </td>
            </tr>
          ) : (
            farmerOrders.map((order) => (
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
                      Serah Terima
                    </span>
                  )}
                  {order.status === "PAID_HELD" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-50 text-primary">
                      Dana Tertahan
                    </span>
                  )}
                  {order.status === "COMPLETED" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-green text-primary">
                      Selesai
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );

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
                  Status Pengantaran Mandiri
                </span>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  Tarif tetap Rp 5.000/trip aktif. 100% ongkir otomatis ditransfer ke saldo dompet Anda saat serah-terima terverifikasi.
                </p>
              </div>
            </aside>

            <div className="lg:col-span-9 space-y-8">
              {activeTab === "ringkasan" && (
                <>
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
                        Daftar lengkap seluruh pesanan aktif, pengiriman, dan verifikasi serah-terima hasil panen
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

                  <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-ink">
                          Daftar Pesanan Masuk
                        </h2>
                        <p className="text-xs text-ink-secondary mt-0.5">
                          Total {farmerOrders.length} pesanan berjalan
                        </p>
                      </div>
                    </div>

                    {renderOrdersTable()}
                  </div>
                </div>
              )}

              {activeTab === "delivery" && (
                <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-ink">
                        Pengaturan Delivery Mandiri
                      </h1>
                      <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-2xl">
                        Kelola armada pengantaran langsung ke dapur usaha pembeli. 100% ongkos kirim menjadi hak petani tanpa potongan komisi platform.
                      </p>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-green text-primary border border-primary/20 self-start sm:self-auto">
                      100% Ongkir Milik Petani
                    </span>
                  </div>

                  <form onSubmit={handleSaveDelivery} className="space-y-6">
                    <div className="p-4 rounded-xl bg-[#E6E4DA]/40 border border-border flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-ink block">
                          Status Layanan Pengantaran Mandiri
                        </span>
                        <span className="text-[11px] text-ink-secondary">
                          Aktifkan agar pembeli UMKM dapat memilih opsi pengiriman saat checkout pre-order
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deliverySettings.isEnabled}
                          onChange={(e) =>
                            setDeliverySettings((prev) => ({
                              ...prev,
                              isEnabled: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                          Kapasitas Maksimal Muatan (kg)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="5"
                            max="500"
                            value={deliverySettings.maxCapacityKg}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                maxCapacityKg: Number(e.target.value),
                              }))
                            }
                            className="w-full bg-[#E6E4DA]/30 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-ink focus:outline-none focus:border-primary"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs font-bold text-ink-muted">
                            kg
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted">
                          Batas muatan kendaraan per sekali jalan
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                          Tarif Tetap Antar (Rp / trip)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-bold text-ink-muted">
                            Rp
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={deliverySettings.fixedDeliveryFee}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                fixedDeliveryFee: Number(e.target.value),
                              }))
                            }
                            className="w-full bg-[#E6E4DA]/30 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-bold text-ink focus:outline-none focus:border-primary"
                          />
                        </div>
                        <p className="text-[11px] text-ink-muted">
                          Tarif flat transparan yang ditagihkan ke pembeli
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                          Jangkauan Radius Maksimal (km)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={deliverySettings.maxRadiusKm}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                maxRadiusKm: Number(e.target.value),
                              }))
                            }
                            className="w-full bg-[#E6E4DA]/30 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-ink focus:outline-none focus:border-primary"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs font-bold text-ink-muted">
                            km
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted">
                          Radius dari koordinat kebun Ciwidey
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                          Jenis Kendaraan &amp; Perlengkapan
                        </label>
                        <input
                          type="text"
                          value={deliverySettings.vehicleType}
                          onChange={(e) =>
                            setDeliverySettings((prev) => ({
                              ...prev,
                              vehicleType: e.target.value,
                            }))
                          }
                          className="w-full bg-[#E6E4DA]/30 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                          Jadwal / Jam Operasional Antar
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={deliverySettings.operatingHoursStart || "06:00"}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                operatingHoursStart: e.target.value,
                                operatingHours: `${e.target.value} - ${prev.operatingHoursEnd || "10:00"}`,
                              }))
                            }
                            className="w-full bg-[#E6E4DA]/30 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-primary"
                          />
                          <span className="text-xs text-ink-muted font-bold">s/d</span>
                          <input
                            type="time"
                            value={deliverySettings.operatingHoursEnd || "10:00"}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                operatingHoursEnd: e.target.value,
                                operatingHours: `${prev.operatingHoursStart || "06:00"} - ${e.target.value}`,
                              }))
                            }
                            className="w-full bg-[#E6E4DA]/30 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-green/40 border border-primary/20 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-primary">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Klausul Perlindungan Ongkos Kirim</span>
                      </div>
                      <p className="text-[11px] text-ink-secondary leading-relaxed">
                        Sistem Patra Tani tidak memotong komisi platform pada ongkos kirim. Dana ongkir Rp {deliverySettings.fixedDeliveryFee.toLocaleString("id-ID")} langsung diteruskan utuh ke rekening kas aktif petani saat foto serah-terima divalidasi.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => setActiveTab("ringkasan")}
                      >
                        Kembali ke Ringkasan
                      </Button>
                      <Button type="submit" variant="primary" size="md">
                        Simpan Pengaturan Delivery
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "etalase" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                        Etalase Saya
                      </h1>
                      <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                        Kelola komoditas panen segar yang sedang aktif ditawarkan ke pembeli UMKM
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => navigate("/etalase/create")}
                      className="font-bold shrink-0"
                    >
                      Buka Etalase Baru
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {farmerCommodities.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-ink-muted bg-surface rounded-2xl border border-border">
                        Belum ada komoditas hasil panen di etalase Anda.
                      </div>
                    ) : (
                      farmerCommodities.map((item) => (
                      <div
                        key={item.id}
                        className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
                      >
                        <div className="relative h-44 w-full overflow-hidden bg-black/10">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-[#E6E4DA]">
                            {item.category || "Sayuran"}
                          </span>
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-ink">{item.name}</h3>
                            <p className="text-xs text-ink-secondary mt-1">
                              Sisa Kuota: <span className="font-bold text-ink">{item.quotaKg || item.quota || 20} kg</span>
                            </p>
                          </div>
                          <div className="pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-sm font-bold text-primary">
                              Rp {(item.pricePerKg || item.price || 15000).toLocaleString("id-ID")}/kg
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/etalase/${item.id}`)}
                            >
                              Lihat
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "profil" && (
                <div className="bg-surface rounded-2xl border border-border p-8 shadow-xs text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-green text-primary mx-auto flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl font-bold text-ink">Profil &amp; Kebun Petani</h1>
                  <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto">
                    Kelola informasi identitas kebun, titik penjemputan hasil panen, dan nomor kontak operasional Anda.
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" onClick={() => navigate("/profile")}>
                      Buka Manajemen Profil Lengkap
                    </Button>
                  </div>
                </div>
              )}

              {!["ringkasan", "pesanan", "delivery", "etalase", "profil"].includes(activeTab) && (
                <div className="bg-surface rounded-2xl border border-border p-8 shadow-xs text-center space-y-3">
                  <h1 className="text-lg font-bold text-ink capitalize">{activeTab}</h1>
                  <p className="text-xs text-ink-secondary">Fitur sedang dalam pengembangan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
