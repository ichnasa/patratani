"use client";

import { useRouter } from "next/navigation";
import Navigate from "@/components/Navigate";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import Chip from "@/components/Chip";
import EtalaseCard from "@/components/EtalaseCard";
import TenderCard from "@/components/TenderCard";
import {
  mockCommodities,
  mockTenders,
  mockUserProfile,
} from "@/data/mockData";
import {
  ShoppingBag,
  FileText,
  ArrowRight,
  ChevronRight,
  Camera,
  Search,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const { currentUser, activeTransaction, commodities, tenders } = useApp();

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeTab, setActiveTab] = useState("ETALASE");
  const [quickSearch, setQuickSearch] = useState("");

  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin");

  if (isAdmin) {
    return <Navigate replace to="/admin/disputes" />;
  }

  const isFarmer = !isAdmin && (roleLower ? (roleLower.includes("petani") || roleLower.includes("mitra")) : true);
  const isBuyer = !isAdmin && (roleLower ? (roleLower.includes("pembeli") || roleLower.includes("umkm")) : false);

  const categories = [
    "Semua",
    "Sayuran Buah",
    "Cabai & Bumbu",
    "Sayuran Daun",
    "Buah-buahan",
    "Bumbu Dapur",
  ];

  const commodityList = commodities && commodities.length > 0 ? commodities : mockCommodities;
  const tenderList = tenders && tenders.length > 0 ? tenders : mockTenders;

  const filteredCommodities = commodityList
    .filter((item) => selectedCategory === "Semua" || item.category === selectedCategory)
    .filter((item) => !quickSearch || item.name.toLowerCase().includes(quickSearch.toLowerCase()))
    .slice(0, 4);

  const filteredTenders = tenderList
    .filter((item) => selectedCategory === "Semua" || item.category === selectedCategory)
    .filter((item) => !quickSearch || item.title.toLowerCase().includes(quickSearch.toLowerCase()))
    .slice(0, 4);

  // Determine if there is an active actionable order
  const pendingActionOrder = activeTransaction || {
    id: "TRX-2026-089",
    tenderId: "TND-2026-005",
    title: "Pre-order Bawang Merah Brebes 25 Kg",
    status: "HANDOVER",
    partnerName: isFarmer ? "Dapur Sunda Asli (Bu Lina)" : "Sentra Tani Baros (Pak Solihin)",
    actionLabel: isFarmer ? "Lakukan Serah Terima" : "Periksa & Konfirmasi Barang",
    actionRoute: "/handover",
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 space-y-10">

        {/* 1. Level 1: Greeting & Urgent Action Banner */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider block">
                {isFarmer ? "Portal Petani Mitra" : "Portal Pembeli UMKM"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">
                Selamat datang, {currentUser?.name?.split(" ")[0] || mockUserProfile.name.split(" ")[0]}
              </h1>
              <p className="text-sm text-ink-secondary mt-1">
                {isFarmer
                  ? "Kelola jadwal panen dan penuhi permintaan bahan baku dari usaha kuliner terdekat."
                  : "Pasokan sayur dan bumbu segar langsung dari kebun lokal dengan kuota pasti dan rekening bersama."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isFarmer ? (
                <Button
                  variant="primary"
                  icon={ShoppingBag}
                  onClick={() => navigate("/etalase/create")}
                >
                  Buka Etalase Panen
                </Button>
              ) : (
                <Button
                  variant="primary"
                  icon={FileText}
                  onClick={() => navigate("/tender/create")}
                >
                  Buka Tender Baru
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate(isFarmer ? "/dashboard/farmer" : "/dashboard/buyer")}
              >
                Dasbor Operasional
              </Button>
            </div>
          </div>

          {/* Actionable Transaction Card */}
          {pendingActionOrder && (
            <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span className="text-xs font-bold text-[#2563EB]">
                    Perlu Perhatian Anda
                  </span>
                  <span className="text-xs text-ink-muted">•</span>
                  <StatusBadge status={pendingActionOrder.status} size="sm" showIcon />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-ink">
                  {pendingActionOrder.title}
                </h3>
                <p className="text-xs text-ink-secondary">
                  Mitra: {pendingActionOrder.partnerName}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  icon={Camera}
                  onClick={() => navigate(pendingActionOrder.actionRoute || "/handover")}
                >
                  {pendingActionOrder.actionLabel}
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* 2. Level 2: Fast Market Discovery */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("ETALASE")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "ETALASE"
                    ? "bg-primary text-[#E6E4DA]"
                    : "bg-surface text-ink-secondary hover:text-ink border border-border"
                }`}
              >
                Hasil Panen Tersedia
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("TENDER")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "TENDER"
                    ? "bg-primary text-[#E6E4DA]"
                    : "bg-surface text-ink-secondary hover:text-ink border border-border"
                }`}
              >
                Permintaan Tender Masuk
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder={activeTab === "ETALASE" ? "Cari komoditas..." : "Cari tender pengadaan..."}
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface text-xs text-ink border border-border rounded-xl focus:outline-none focus:border-primary transition-all"
              />
            </form>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="sm"
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>

          {/* Cards Grid */}
          {activeTab === "ETALASE" ? (
            filteredCommodities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredCommodities.map((commodity) => (
                  <EtalaseCard key={commodity.id} commodity={commodity} />
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-2xl p-8 text-center border border-border space-y-2">
                <p className="text-sm font-medium text-ink">Tidak ada komoditas pada kategori ini.</p>
                <p className="text-xs text-ink-muted">Pilih kategori lain atau jelajahi pasar lengkap.</p>
              </div>
            )
          ) : (
            filteredTenders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredTenders.map((tender) => (
                  <TenderCard key={tender.id} tender={tender} />
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-2xl p-8 text-center border border-border space-y-2">
                <p className="text-sm font-medium text-ink">Tidak ada tender pada kategori ini.</p>
                <p className="text-xs text-ink-muted">Pilih kategori lain atau periksa kembali nanti.</p>
              </div>
            )
          )}

          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate("/explore")}
            >
              Lihat Seluruh Pasar PatraTani
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
