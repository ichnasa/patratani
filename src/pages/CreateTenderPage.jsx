import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Store,
  MapPin,
  ShieldCheck,
  Clock,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { mockTenders } from "../data/mockData";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

const ENABLE_QUALITY_DOCUMENT = false;

export default function CreateTenderPage() {
  const navigate = useNavigate();
  const { showToast, currentUser, addTender } = useApp();
  const specFileInputRef = useRef(null);

  const [isLocating, setIsLocating] = useState(false);
  const [specFileName, setSpecFileName] = useState("");
  const [formData, setFormData] = useState({
    title: "Cabai Rawit Merah Segar",
    category: "Bumbu & Rempah",
    requiredQuantityKg: 15,
    maxBudgetPerKg: 48000,
    requiredDate: "2026-10-29T07:00",
    kitchenAddress:
      "Warung Sederhana Bu Lina, Jl. Terusan Buahbatu No. 42, Bandung",
    geotag: "-6.9452, 107.6321",
    deliveryFee: 5000,
    allowDelivery: true,
    qualitySpecs:
      "Cabai rawit merah petik segar tanpa tangkai busuk, tingkat kekeringan baik. Dibutuhkan untuk sambal harian resto.",
  });

  const categories = [
    "Bumbu & Rempah",
    "Sayur Buah",
    "Sayur Daun",
    "Buah-buahan",
    "Umbi-umbian",
    "Padi & Palawija",
  ];

  const numericBudget = Number(formData.maxBudgetPerKg) || 0;
  const numericQuantity = Number(formData.requiredQuantityKg) || 0;
  const maxMaterialBudget = numericQuantity * numericBudget;
  const platformFee = 0;
  const totalEscrowDeposit =
    maxMaterialBudget + (formData.allowDelivery ? (Number(formData.deliveryFee) || 0) : 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    if (type === "checkbox") {
      finalValue = checked;
    } else if (type === "number") {
      finalValue = value === "" ? "" : Number(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleQuantityChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      requiredQuantityKg: rawDigits === "" ? "" : parseInt(rawDigits, 10),
    }));
  };

  const handleBudgetChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      maxBudgetPerKg: rawDigits === "" ? "" : Number(rawDigits),
    }));
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setFormData((prev) => ({
            ...prev,
            geotag: `${lat}, ${lng}`,
          }));
          setIsLocating(false);
          if (showToast) {
            showToast("Titik GPS dapur usaha berhasil diperbarui secara akurat.", "success");
          }
        },
        () => {
          setIsLocating(false);
          if (showToast) {
            showToast("Izin lokasi dibatasi atau tidak tersedia. Menggunakan koordinat dapur tersimpan.", "warning");
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      if (showToast) {
        showToast("Geolocation tidak didukung oleh peramban ini.", "warning");
      }
    }
  };

  const handleSpecFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        if (showToast) {
          showToast("Format berkas harus JPG, PNG, atau PDF.", "warning");
        }
        return;
      }
      setSpecFileName(file.name);
      if (showToast) {
        showToast(`Lampiran ${file.name} berhasil dimuat.`, "info");
      }
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    const budgetNum = Number(formData.maxBudgetPerKg);
    if (!budgetNum || budgetNum < 100) {
      if (showToast) {
        showToast("Anggaran per kg harus diisi minimal Rp 100.", "warning");
      }
      return;
    }
    const quantityNum = Number(formData.requiredQuantityKg);
    if (!quantityNum || quantityNum < 1) {
      if (showToast) {
        showToast("Jumlah kebutuhan harus diisi.", "warning");
      }
      return;
    }

    const totalBudget = quantityNum * budgetNum;
    const formattedDate = formData.requiredDate
      ? formData.requiredDate.split("T")[0]
      : "2026-10-30";

    const newTender = {
      id: `TND-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      title: formData.title.trim(),
      commodityName: formData.title.trim(),
      category: formData.category,
      requiredQuantityKg: quantityNum,
      targetPricePerKg: budgetNum,
      maxBudgetPerKg: budgetNum,
      totalBudget: totalBudget,
      deadlineDate: formattedDate,
      deliveryDate: formattedDate,
      status: "OPEN",
      buyer: {
        id: currentUser?.id || "BUYER-01",
        businessName: currentUser?.farmName || currentUser?.name || "Warung Sederhana Bu Lina",
        contactPerson: currentUser?.name || "Ibu Lina Marlina",
        businessType: "Warung Makan / Kuliner Lokal",
        address: formData.kitchenAddress || currentUser?.location || "Jl. Terusan Buahbatu No. 42, Bandung",
        distanceKm: 2.5,
        verified: true,
        rating: currentUser?.rating || 4.9,
      },
      fulfillmentMethod: formData.allowDelivery ? "FARMER_DELIVERY" : "SELF_PICKUP",
      deliveryFee: formData.allowDelivery ? (Number(formData.deliveryFee) || 5000) : 0,
      specifications: formData.qualitySpecs || "Bahan baku segar sesuai spesifikasi standar mutu dapur usaha.",
      bidsCount: 0,
      bids: [],
      escrow: {
        status: "UNPAID",
        amountHeld: 0,
        feePlatform: 0,
        netFarmerPayment: 0,
      },
    };

    if (addTender) {
      addTender(newTender);
    } else {
      mockTenders.unshift(newTender);
    }

    if (showToast) {
      showToast("Tender Permintaan berhasil dipublikasikan!", "success");
    }
    navigate("/explore");
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="pasar" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div className="space-y-3">
            <nav className="flex items-center gap-2 text-xs text-ink-muted">
              <Link to="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/explore" className="hover:text-primary transition-colors">
                Tender Saya
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-primary">
                Buat Tender Permintaan
              </span>
            </nav>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                Buat Tender Permintaan (Bidding)
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-3xl leading-relaxed">
                Ajukan kebutuhan bahan baku usaha kuliner Anda. Petani lokal sekitar
                akan mengajukan penawaran harga terbaik.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handlePublish}
              className="lg:col-span-8 space-y-8 bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-base font-bold text-ink">
                    Spesifikasi Bahan Baku
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Nama Item Kebutuhan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      maxLength={80}
                      required
                      placeholder="Contoh: Cabai Rawit Merah Segar"
                      className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
                        Kategori Komoditas <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
                        Jumlah Kebutuhan (kg) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="requiredQuantityKg"
                          value={formData.requiredQuantityKg}
                          onChange={handleQuantityChange}
                          placeholder="Contoh: 15"
                          required
                          className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors pr-10"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-ink-muted">
                          kg
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted mt-1">
                        Masukkan jumlah kebutuhan bahan baku dalam satuan kilogram bulat
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-base font-bold text-ink">
                    Anggaran Maksimal &amp; Batas Waktu
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
                        Anggaran Maksimal per kg <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-ink-muted pointer-events-none select-none">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          name="maxBudgetPerKg"
                          value={formData.maxBudgetPerKg === "" ? "" : Number(formData.maxBudgetPerKg).toLocaleString("id-ID")}
                          onChange={handleBudgetChange}
                          placeholder="0"
                          required
                          className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-ink-muted mt-1">
                        Petani menawar di bawah atau sesuai batas ini
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
                        Waktu Dibutuhkan di Dapur <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="requiredDate"
                        value={formData.requiredDate}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                      />
                      <p className="text-[11px] text-ink-muted mt-1">
                        Batas akhir penawaran otomatis H-1
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h2 className="text-base font-bold text-ink">
                    Titik Pengantaran &amp; Opsi Kirim
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Alamat Dapur Usaha / Resto <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        name="kitchenAddress"
                        value={formData.kitchenAddress}
                        onChange={handleChange}
                        maxLength={150}
                        required
                        className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#E6E4DA]/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-[#E6E4DA] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink block">
                          Titik Geotag Lokasi: {formData.geotag}
                        </span>
                        <span className="text-[11px] text-ink-secondary">
                          Dapur Usaha Pembeli • Akurasi GPS Presisi Tinggi
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-ink hover:text-primary hover:border-primary transition-colors disabled:opacity-60 cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-primary" : ""}`} />
                      <span>{isLocating ? "Mencari GPS..." : "Deteksi Lokasi GPS"}</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-[#E6E4DA]/20 hover:bg-[#E6E4DA]/40 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        name="allowDelivery"
                        checked={formData.allowDelivery}
                        onChange={handleChange}
                        className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-xs font-bold text-ink block">
                          Diantar Petani ke Lokasi Dapur (Tarif Tetap Rp {formData.deliveryFee.toLocaleString("id-ID")})
                        </span>
                        <span className="text-[11px] text-ink-secondary leading-relaxed block mt-0.5">
                          100% ongkir dibayarkan langsung ke petani pengantar. Bebas biaya komisi platform.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h2 className="text-base font-bold text-ink">
                    Spesifikasi Standar Kualitas Dapur
                  </h2>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={3}
                    name="qualitySpecs"
                    value={formData.qualitySpecs}
                    onChange={handleChange}
                    maxLength={500}
                    className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl p-3.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                  />

                  {ENABLE_QUALITY_DOCUMENT && (
                    <div>
                      <input
                        type="file"
                        ref={specFileInputRef}
                      accept="image/jpeg, image/png, application/pdf"
                      onChange={handleSpecFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => specFileInputRef.current && specFileInputRef.current.click()}
                      className="p-3.5 rounded-xl border border-dashed border-border hover:border-primary/80 bg-[#E6E4DA]/20 flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Upload className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <span className="font-semibold text-ink block">
                            {specFileName ? `Lampiran Aktif: ${specFileName}` : "Unggah Berkas Standar Mutu Dapur (Opsional)"}
                          </span>
                          <span className="text-[10px] text-ink-muted">
                            Mendukung JPG, PNG, atau PDF (maks. 5MB)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-surface border border-border text-ink-secondary shrink-0 shadow-xs">
                        Pilih Berkas
                      </span>
                    </div>
                  </div>
                )}
              </div>
              </div>

              <div className="pt-4 flex items-center justify-end border-t border-border">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Publikasikan Tender
                </Button>
              </div>
            </form>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Pratinjau Tender yang Dilihat Petani
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-confirmed/15 text-primary font-bold">
                    Dibuka
                  </span>
                </div>

                <div className="rounded-xl border border-border p-4 bg-background space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-ink-muted">
                    <span className="font-bold text-primary uppercase">
                      {formData.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-ink-muted" />
                      Batas: 28 Okt, 18:00
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-ink leading-tight">
                    {formData.requiredQuantityKg} kg {formData.title || "Kebutuhan Bahan"}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-ink-secondary">
                    <Store className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    <span className="truncate">
                      {formData.kitchenAddress.split(",")[0]}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-ink-muted">Batas Anggaran:</span>
                    <span className="text-xs font-bold text-primary">
                      Rp {(Number(formData.maxBudgetPerKg) || 0).toLocaleString("id-ID")}/kg
                    </span>
                  </div>

                  <p className="text-[10px] text-ink-muted italic">
                    Petani sekitar akan bersaing mengajukan penawaran terbaik.
                  </p>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Simulasi Deposit Escrow (Aman)
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-ink-secondary">
                    <span>Maks. Nilai Bahan ({formData.requiredQuantityKg} kg)</span>
                    <span className="font-semibold text-ink">
                      Rp {maxMaterialBudget.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-ink-secondary">
                    <span>Biaya Pengantaran Petani</span>
                    <span className="font-semibold text-ink">
                      Rp {(formData.allowDelivery ? formData.deliveryFee : 0).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-ink-secondary">
                    <span>Komisi Platform (0% bagi pembeli)</span>
                    <span className="font-bold text-primary">
                      Rp 0
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-ink">Total Maks. Dana Ditahan Escrow</span>
                    <span className="font-bold text-primary text-sm">
                      Rp {totalEscrowDeposit.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-green/40 border border-border flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-ink-secondary leading-relaxed">
                    Dana hanya dicairkan ke petani setelah Anda memverifikasi foto serah-terima geotag di dapur usaha Anda.
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