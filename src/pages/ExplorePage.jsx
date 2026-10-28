import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Chip from "../components/Chip";
import EtalaseCard from "../components/EtalaseCard";
import TenderCard from "../components/TenderCard";
import { mockCommodities, mockTenders } from "../data/mockData";
import { useApp } from "../context/AppContext";
import {
  Search,
  SlidersHorizontal,
  Store,
  Sprout,
  X,
  RotateCcw,
  Check,
  Sparkles,
  Plus,
} from "lucide-react";

export default function ExplorePage() {
  const navigate = useNavigate();
  const { commodities } = useApp();
  const commodityList = commodities && commodities.length > 0 ? commodities : mockCommodities;
  const [activeTab, setActiveTab] = useState("ETALASE");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [maxDistance, setMaxDistance] = useState(20);
  const [maxPrice, setMaxPrice] = useState(80000);
  const [deliveryOption, setDeliveryOption] = useState("SEMUA");
  const [sortBy, setSortBy] = useState("TERDEKAT");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categories = [
    "Semua",
    "Sayuran Buah",
    "Cabai & Bumbu",
    "Sayuran Daun",
    "Buah-buahan",
    "Bumbu Dapur",
  ];

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Semua");
    setMaxDistance(20);
    setMaxPrice(80000);
    setDeliveryOption("SEMUA");
    setSortBy("TERDEKAT");
  };

  const filteredCommodities = useMemo(() => {
    let result = commodityList.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmer.farmName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Semua" || item.category === selectedCategory;

      const matchesDistance = item.farmer.distanceKm <= maxDistance;

      const matchesPrice = item.pricePerKg <= maxPrice;

      const matchesDelivery =
        deliveryOption === "SEMUA" ||
        (deliveryOption === "SELF_PICKUP" && item.logistics.selfPickup.available) ||
        (deliveryOption === "FARMER_DELIVERY" &&
          item.logistics.farmerDelivery.available);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDistance &&
        matchesPrice &&
        matchesDelivery
      );
    });

    if (sortBy === "TERDEKAT") {
      result.sort((a, b) => a.farmer.distanceKm - b.farmer.distanceKm);
    } else if (sortBy === "HARGA_TERENDAH") {
      result.sort((a, b) => a.pricePerKg - b.pricePerKg);
    } else if (sortBy === "KUOTA_TERBANYAK") {
      result.sort((a, b) => b.quotaKg - a.quotaKg);
    }

    return result;
  }, [commodityList, searchQuery, selectedCategory, maxDistance, maxPrice, deliveryOption, sortBy]);

  const filteredTenders = useMemo(() => {
    let result = mockTenders.filter((tender) => {
      const matchesSearch =
        searchQuery === "" ||
        tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.commodityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.buyer.businessName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Semua" || tender.category === selectedCategory;

      const matchesDistance = tender.buyer.distanceKm <= maxDistance;

      const tenderPrice = tender.targetPricePerKg || tender.maxBudgetPerKg || 0;
      const matchesPrice = tenderPrice <= maxPrice;

      const matchesDelivery =
        deliveryOption === "SEMUA" ||
        (deliveryOption === "SELF_PICKUP" &&
          tender.fulfillmentMethod === "SELF_PICKUP") ||
        (deliveryOption === "FARMER_DELIVERY" &&
          tender.fulfillmentMethod === "FARMER_DELIVERY");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDistance &&
        matchesPrice &&
        matchesDelivery
      );
    });

    if (sortBy === "TERDEKAT") {
      result.sort((a, b) => a.buyer.distanceKm - b.buyer.distanceKm);
    } else if (sortBy === "HARGA_TERENDAH") {
      result.sort((a, b) => a.targetPricePerKg - b.targetPricePerKg);
    } else if (sortBy === "KUOTA_TERBANYAK") {
      result.sort((a, b) => b.requiredQuantityKg - a.requiredQuantityKg);
    }

    return result;
  }, [searchQuery, selectedCategory, maxDistance, maxPrice, deliveryOption, sortBy]);

  const renderFilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-ink">Filter Pasar</h3>
        </div>
        <button
          type="button"
          onClick={handleResetFilters}
          className="text-xs text-ink-muted hover:text-primary flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-bold text-ink uppercase tracking-wider block">
          Kategori Komoditas
        </label>
        <div className="flex flex-wrap gap-1.5">
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
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-ink uppercase tracking-wider block">
            Jarak Maksimal
          </label>
          <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-surface-green">
            {maxDistance} km
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="30"
          step="1"
          value={maxDistance}
          onChange={(e) => setMaxDistance(Number(e.target.value))}
          className="w-full accent-primary h-1.5 bg-[#CFCDC2] rounded-lg cursor-pointer"
        />
        <div className="flex items-center justify-between text-[10px] text-ink-muted">
          <span>2 km</span>
          <span>15 km</span>
          <span>30 km</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-ink uppercase tracking-wider block">
            Batas Harga Maksimal
          </label>
          <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-surface-green">
            ≤ Rp {maxPrice.toLocaleString("id-ID")}/kg
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max="80000"
          step="2500"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary h-1.5 bg-[#CFCDC2] rounded-lg cursor-pointer"
        />
        <div className="flex items-center justify-between text-[10px] text-ink-muted">
          <span>Rp 5.000</span>
          <span>Rp 40.000</span>
          <span>Rp 80.000</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-bold text-ink uppercase tracking-wider block">
          Opsi Pengiriman
        </label>
        <div className="space-y-1.5">
          {[
            { id: "SEMUA", label: "Semua Metode" },
            { id: "SELF_PICKUP", label: "Ambil Sendiri (Rp 0)" },
            { id: "FARMER_DELIVERY", label: "Diantar Petani (Tarif Tetap)" },
          ].map((opt) => (
            <label
              key={opt.id}
              onClick={() => setDeliveryOption(opt.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                deliveryOption === opt.id
                  ? "bg-surface-green border-primary text-primary font-semibold"
                  : "bg-surface border-border text-ink-secondary hover:bg-surface/80"
              }`}
            >
              <span>{opt.label}</span>
              {deliveryOption === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-bold text-ink uppercase tracking-wider block">
          Urutkan Berdasarkan
        </label>
        <div className="space-y-1.5">
          {[
            { id: "TERDEKAT", label: "Jarak Terdekat (Radius Kebun)" },
            { id: "HARGA_TERENDAH", label: "Harga Termurah per Kg" },
            { id: "KUOTA_TERBANYAK", label: "Ketersediaan Kuota Terbesar" },
          ].map((sort) => (
            <label
              key={sort.id}
              onClick={() => setSortBy(sort.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                sortBy === sort.id
                  ? "bg-surface-green border-primary text-primary font-semibold"
                  : "bg-surface border-border text-ink-secondary hover:bg-surface/80"
              }`}
            >
              <span>{sort.label}</span>
              {sortBy === sort.id && <Check className="w-3.5 h-3.5 text-primary" />}
            </label>
          ))}
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#E6E4DA] border border-border/80 space-y-1.5 text-xs text-ink-secondary">
        <div className="flex items-center gap-1.5 font-bold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tanpa Gudang Sentral</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Semua produk dipetik segar sesuai jadwal pre-order &amp; dikirim langsung dari kebun terdekat tanpa transit berhari-hari.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="pasar" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Pasar Agrikultur Lokal
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">
                Jelajahi Panen &amp; Permintaan UMKM
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                Temukan hasil bumi segar dari petani binaan atau respon tender pengadaan dapur resto lokal.
              </p>
            </div>

            <div className="inline-flex bg-surface p-1 rounded-xl border border-border shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("ETALASE")}
                className={`py-2 px-4 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                  activeTab === "ETALASE"
                    ? "bg-primary text-[#E6E4DA] shadow-xs"
                    : "text-ink-secondary hover:text-ink hover:bg-black/5"
                }`}
              >
                <Sprout className="w-4 h-4" />
                <span>Etalase Panen ({filteredCommodities.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("TENDER")}
                className={`py-2 px-4 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                  activeTab === "TENDER"
                    ? "bg-primary text-[#E6E4DA] shadow-xs"
                    : "text-ink-secondary hover:text-ink hover:bg-black/5"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Tender UMKM ({filteredTenders.length})</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === "ETALASE"
                    ? "Cari nama sayuran, buah, cabai, atau nama petani..."
                    : "Cari kebutuhan pengadaan, jenis komoditas, atau UMKM..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-ink text-xs sm:text-sm placeholder:text-ink-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    activeTab === "ETALASE"
                      ? "/etalase/create"
                      : "/tender/create"
                  )
                }
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-[#E6E4DA] text-xs font-semibold hover:bg-primary-hover transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {activeTab === "ETALASE" ? "Pasang Panen" : "Buat Tender"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-semibold text-ink hover:border-primary transition-colors cursor-pointer w-full sm:w-auto justify-center"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Filter &amp; Urutan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="hidden lg:block lg:col-span-3 bg-surface rounded-2xl p-6 border border-border sticky top-24">
              {renderFilterPanel()}
            </aside>

            <section className="lg:col-span-9 space-y-6">
              {activeTab === "ETALASE" ? (
                filteredCommodities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredCommodities.map((item) => (
                      <EtalaseCard key={item.id} commodity={item} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface rounded-2xl p-12 text-center border border-border space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#E6E4DA] text-ink-muted flex items-center justify-center mx-auto">
                      <Sprout className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink">
                        Tidak Ada Komoditas yang Sesuai Filter
                      </h3>
                      <p className="text-xs text-ink-muted mt-1 max-w-md mx-auto">
                        Coba perluas jarak jangkauan kilometer atau ubah kata kunci pencarian Anda.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleResetFilters}>
                      Reset Seluruh Filter
                    </Button>
                  </div>
                )
              ) : filteredTenders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredTenders.map((tender) => (
                    <TenderCard key={tender.id} tender={tender} />
                  ))}
                </div>
              ) : (
                <div className="bg-surface rounded-2xl p-12 text-center border border-border space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#E6E4DA] text-ink-muted flex items-center justify-center mx-auto">
                    <Store className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink">
                      Tidak Ada Tender yang Sesuai Kriteria
                    </h3>
                    <p className="text-xs text-ink-muted mt-1 max-w-md mx-auto">
                      Belum ada pengadaan UMKM dengan filter yang dipilih saat ini.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Reset Seluruh Filter
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative bg-surface rounded-t-3xl p-6 border-t border-border max-h-[85vh] overflow-y-auto space-y-6 z-10 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-ink">Filter &amp; Urutan</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderFilterPanel()}

            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Terapkan Filter
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
