"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useState, useRef } from "react";
import {
  ChevronRight,
  Upload,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Camera,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { mockCommodities } from "@/data/mockData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";

function CreateEtalasePage() {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const { showToast, currentUser, addCommodity } = useApp();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [isLocating, setIsLocating] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [formData, setFormData] = useState({
    name: "Tomat Mawar Segar",
    category: "Sayur Buah",
    harvestDate: "2026-10-30",
    totalQuotaKg: 50,
    pricePerKg: 12000,
    farmAddress: "Kp. Sukatani RT 02/04, Desa Pasirjambu, Ciwidey, Bandung",
    geotag: "-7.0984, 107.4921",
    gpsAccuracy: "8m",
    deliveryFee: 5000,
    notes:
      "Dipetik langsung pagi hari sebelum serah-terima. Harap siapkan keranjang sendiri jika memilih opsi ambil di kebun.",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    fileName: "tomat_segar_panen30okt.jpg",
  });

  const categories = [
    "Sayur Buah",
    "Sayur Daun",
    "Bumbu & Rempah",
    "Buah-buahan",
    "Umbi-umbian",
    "Padi & Palawija",
  ];

  const numericPrice = Number(formData.pricePerKg) || 0;
  const numericQuota = Number(formData.totalQuotaKg) || 0;
  const estimatedValue = numericQuota * numericPrice;
  const platformFee = Math.round(estimatedValue * 0.03);
  const netEarnings = estimatedValue - platformFee;

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

  const handlePriceChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      pricePerKg: rawDigits === "" ? "" : Number(rawDigits),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        if (showToast) {
          showToast("Format berkas harus JPG, PNG, atau PDF.", "warning");
        }
        return;
      }
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80";
      setFormData((prev) => ({
        ...prev,
        image: previewUrl,
        fileName: file.name,
      }));
      if (showToast) {
        showToast(`Berkas ${file.name} berhasil dimuat.`, "info");
      }
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          const acc = `${Math.round(position.coords.accuracy)}m`;
          setFormData((prev) => ({
            ...prev,
            geotag: `${lat}, ${lng}`,
            gpsAccuracy: acc,
          }));
          setIsLocating(false);
          if (showToast) {
            showToast("Koordinat GPS kebun berhasil diperbarui secara akurat.", "success");
          }
        },
        () => {
          setIsLocating(false);
          if (showToast) {
            showToast("Akses lokasi ditolak atau tidak tersedia. Menggunakan koordinat tersimpan.", "warning");
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

  const handlePublish = (e) => {
    e.preventDefault();
    const priceNum = Number(formData.pricePerKg);
    if (!priceNum || priceNum < 100) {
      if (showToast) {
        showToast("Harga per kg harus diisi minimal Rp 100.", "warning");
      }
      return;
    }
    const quotaNum = Number(formData.totalQuotaKg);
    if (!quotaNum || quotaNum < 1) {
      if (showToast) {
        showToast("Total kuota panen harus diisi.", "warning");
      }
      return;
    }
    const newCommodity = {
      id: `CMD-${Date.now().toString().slice(-6)}`,
      name: formData.name.trim(),
      category: formData.category,
      farmer: {
        id: currentUser?.id || "FARM-01",
        name: currentUser?.name || "Rizal Firmansyah",
        farmName: currentUser?.farmName || "Kebun Mitra Patra Tani",
        location: formData.farmAddress || currentUser?.location || "Ciwidey, Bandung Barat",
        distanceKm: 2.5,
        avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        rating: currentUser?.rating || 4.9,
        totalTransactions: currentUser?.reviewCount || 45,
        verified: true,
      },
      quotaKg: quotaNum,
      totalQuotaKg: quotaNum,
      availableQuotaKg: quotaNum,
      pricePerKg: priceNum,
      harvestDate: formData.harvestDate || "2026-10-30",
      image: formData.image || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
      description: formData.notes || "Komoditas segar hasil panen langsung dari kebun mitra terverifikasi.",
      grade: "Grade Super",
      logistics: {
        selfPickup: {
          available: deliveryMethod === "pickup" || deliveryMethod === "both",
          fee: 0,
          address: formData.farmAddress || "Kp. Sukatani RT 02/04, Desa Pasirjambu, Ciwidey, Bandung",
          notes: "Pengambilan langsung di lokasi kebun saat jam panen.",
        },
        farmerDelivery: {
          available: deliveryMethod === "delivery" || deliveryMethod === "both",
          fixedFee: Number(formData.deliveryFee) || 5000,
          coverageArea: "Maksimal radius 15 km dari titik kebun",
          estimatedTime: "Hari panen pukul 08.00 - 12.00 WIB",
        },
      },
      platformCommissionPercent: 3.0,
      status: "READY",
    };

    if (addCommodity) {
      addCommodity(newCommodity);
    } else {
      mockCommodities.unshift(newCommodity);
    }

    if (showToast) {
      showToast("Etalase Panen berhasil dipublikasikan!", "success");
    }
    navigate("/explore");
  };



  return (
    <div className="min-h-screen bg-background text-ink flex flex-col selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="pasar" />

      <main className="w-full flex-1 flex-grow">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div className="space-y-3">
            <nav className="flex items-center gap-2 text-xs text-ink-muted">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/explore" className="hover:text-primary transition-colors">
                Etalase Saya
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-primary">
                Buka Etalase Panen
              </span>
            </nav>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                Buka Etalase Panen (Pre-Order)
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-3xl leading-relaxed">
                Publikasikan jadwal panen dan kuota komoditas Anda agar UMKM lokal
                dapat memesan lebih awal tanpa perantara.
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
                    Informasi Hasil Panen
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Nama Komoditas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={80}
                      required
                      placeholder="Contoh: Tomat Mawar Segar"
                      className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
                        Kategori <span className="text-red-500">*</span>
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
                        Perkiraan Tanggal Panen <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="harvestDate"
                          value={formData.harvestDate}
                          onChange={handleChange}
                          required
                          className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg, image/png, application/pdf"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={cameraInputRef}
                      accept="image/jpeg, image/png"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Foto / Dokumen Hasil Panen <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-border hover:border-primary/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#E6E4DA]/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-surface-green flex items-center justify-center text-primary mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-ink">
                        Unggah Foto atau Dokumen Hasil Panen
                      </p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        Mendukung format: JPG, PNG, atau PDF (maks. 5MB)
                      </p>
                      {formData.fileName && (
                        <div className="mt-2 px-3 py-1 rounded-full bg-surface-green text-primary text-[11px] font-bold border border-primary/20">
                          Berkas Aktif: {formData.fileName}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          className="px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-ink hover:text-primary hover:border-primary transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>Pilih Berkas (JPG/PNG/PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
                          className="px-3.5 py-2 rounded-xl bg-primary text-[#E6E4DA] text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Buka Kamera Langsung</span>
                        </button>
                      </div>
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
                    Kuota &amp; Penentuan Harga (Fixed Quota &amp; Nominal)
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
                        Total Kuota Panen (kg) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="totalQuotaKg"
                          value={formData.totalQuotaKg}
                          onChange={handleChange}
                          min={10}
                          required
                          className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors pr-10"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-ink-muted">
                          kg
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted mt-1">
                        Kapasitas tetap yang dapat dipesan UMKM
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
                        Harga Tetap per kg <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-ink-muted pointer-events-none select-none">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          name="pricePerKg"
                          value={formData.pricePerKg === "" ? "" : Number(formData.pricePerKg).toLocaleString("id-ID")}
                          onChange={handlePriceChange}
                          placeholder="0"
                          required
                          className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-ink-muted mt-1">
                        Harga jual bersih sebelum komisi platform
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
                    Lokasi Kebun &amp; Opsi Pengiriman
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Alamat Titik Kebun / Titik Ambil <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        name="farmAddress"
                        value={formData.farmAddress}
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
                          Titik Geotag Kebun: {formData.geotag}
                        </span>
                        <span className="text-[11px] text-ink-secondary">
                          Akurasi GPS {formData.gpsAccuracy} • Terverifikasi Otomatis
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

                  <div className="space-y-3 pt-2">
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${deliveryMethod === "pickup" ? "border-primary bg-primary-50/40" : "border-border bg-[#E6E4DA]/20 hover:bg-[#E6E4DA]/40"}`}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={deliveryMethod === "pickup"}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-4 h-4 mt-0.5 text-primary focus:ring-primary accent-primary"
                      />
                      <div>
                        <span className="text-xs font-bold text-ink block">
                          Ambil Sendiri di Kebun (Self-Pickup) — Rp 0
                        </span>
                        <span className="text-[11px] text-ink-secondary leading-relaxed block mt-0.5">
                          Pembeli mengambil langsung ke lokasi kebun Anda saat jam panen.
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${deliveryMethod === "delivery" ? "border-primary bg-primary-50/40" : "border-border bg-[#E6E4DA]/20 hover:bg-[#E6E4DA]/40"}`}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="delivery"
                        checked={deliveryMethod === "delivery"}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-4 h-4 mt-0.5 text-primary focus:ring-primary accent-primary"
                      />
                      <div>
                        <span className="text-xs font-bold text-ink block">
                          Opsi Diantar Petani (Tarif Tetap Rp {formData.deliveryFee.toLocaleString("id-ID")})
                        </span>
                        <span className="text-[11px] text-ink-secondary leading-relaxed block mt-0.5">
                          100% ongkos kirim disalurkan penuh ke Anda. Kapasitas angkut maks. 25 kg per trip.
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
                    Catatan untuk Pembeli
                  </h2>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    maxLength={500}
                    className="w-full bg-[#E6E4DA]/40 border border-border rounded-xl p-3.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                  />

                  <div className="p-3 rounded-xl bg-status-confirmed/15 border border-status-confirmed/30 flex items-center gap-2.5 text-primary">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium">
                      Semua data wajib telah terisi lengkap dan valid sesuai standar agritech.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end border-t border-border">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Publikasikan Etalase
                </Button>
              </div>
            </form>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Pratinjau Tampilan Pembeli
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    Live Preview
                  </span>
                </div>

                <div className="rounded-xl border border-border overflow-hidden bg-background">
                  <div className="relative h-36 w-full overflow-hidden bg-[#E6E4DA]">
                    <img
                      src={formData.image}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary text-[#E6E4DA]">
                        Pre-Order
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase">
                        {formData.category}
                      </span>
                      <h4 className="text-sm font-bold text-ink leading-tight">
                        {formData.name || "Nama Komoditas"}
                      </h4>
                    </div>

                    <p className="text-[11px] text-ink-secondary">
                      {currentUser?.name || "Rizal"} • Ciwidey (Titik Geotag Terverifikasi)
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-ink-muted block">Harga Tetap</span>
                        <span className="text-xs font-bold text-primary">
                          Rp {(Number(formData.pricePerKg) || 0).toLocaleString("id-ID")}/kg
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-ink-muted block">Total Kuota</span>
                        <span className="text-xs font-bold text-ink">
                          {formData.totalQuotaKg} kg
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#E6E4DA]/40 text-[10px] text-ink-secondary flex items-center justify-between">
                      <span>
                        {deliveryMethod === "pickup"
                          ? "Opsi: Ambil Sendiri (Rp 0)"
                          : `Opsi: Diantar Petani (Rp ${formData.deliveryFee.toLocaleString("id-ID")})`}
                      </span>
                      <span className="text-[10px] font-semibold text-primary">
                        {deliveryMethod === "pickup" ? "Self-Pickup" : "Delivery"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Simulasi Finansial Panen
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-ink-secondary">
                    <span>Estimasi Nilai Panen ({formData.totalQuotaKg} kg)</span>
                    <span className="font-semibold text-ink">
                      Rp {estimatedValue.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-ink-secondary">
                    <span>Komisi Platform (3% panen saja)</span>
                    <span className="font-semibold text-status-disputed">
                      - Rp {platformFee.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-ink-secondary">
                    <span>Biaya Pengiriman Petani</span>
                    <span className="font-bold text-primary">
                      100% Milik Anda
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-ink">Estimasi Pendapatan Bersih</span>
                    <span className="font-bold text-primary text-sm">
                      Rp {netEarnings.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-green/40 border border-border flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-ink-secondary leading-relaxed">
                    Pembayaran pembeli diamankan 100% di rekening Escrow hingga serah-terima foto geotag valid.
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

export default function WrappedCreateEtalasePage(props) {
  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <CreateEtalasePage {...props} />
    </ProtectedRoute>
  );
}
