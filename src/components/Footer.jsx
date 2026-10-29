"use client";
import Link from "next/link";
import React from "react";
import { Sprout, ShieldCheck, CheckCircle2, Camera, Truck } from "lucide-react";

export default function Footer() {
  const linksNavigasi = [
    { label: "Beranda Utama", href: "/" },
    { label: "Jelajahi Komoditas", href: "/explore" },
    { label: "Serah Terima & Bukti", href: "/handover" },
    { label: "Portal Admin Escrow", href: "/admin/disputes" },
  ];

  const linksEkosistem = [
    { label: "Dashboard Petani Mitra", href: "/dashboard/farmer" },
    { label: "Dashboard Pembeli UMKM", href: "/dashboard/buyer" },
    { label: "Verifikasi Geotag & Kamera", href: "/handover" },
    { label: "Aturan Komisi 3–5%", href: "/escrow" },
  ];

  return (
    <footer className="w-full bg-[#1A1A1A] text-[#E6E4DA] border-t border-border/20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-[#E6E4DA]">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Patra<span className="text-[#D5D8CC]">Tani</span>
                </span>
              </div>

              <p className="text-sm font-medium text-white/90 leading-relaxed">
                Dari Kebun ke Dapur Usaha Lokal, Lebih Dekat &amp; Tanpa Gudang.
              </p>

              <p className="text-xs text-white/60 leading-relaxed">
                Platform demand-tender dan pre-order agritech yang menghubungkan
                kelompok tani kecil secara langsung dengan pelaku UMKM kuliner
                dan jaringan HoReCa lokal.
              </p>
            </div>

            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-white/5 text-[#D5D8CC] border border-white/10">
                Sistem Terdesentralisasi Tanpa Gudang Perantara
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3.5">
                Navigasi
              </h4>
              <ul className="space-y-2.5">
                {linksNavigasi.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3.5">
                Ekosistem
              </h4>
              <ul className="space-y-2.5">
                {linksEkosistem.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/40 text-[#D5D8CC]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      Pembayaran Aman Escrow
                    </h4>
                    <span className="text-[10px] text-white/60">
                      Simulasi Rekening Bersama Patra Tani
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/60 text-[#E6E4DA] border border-primary-light/20 shrink-0">
                  Sandbox Aktif
                </span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed mb-4">
                Dana pembeli UMKM tertahan aman di sistem escrow simulasi hingga
                komoditas diterima dan lolos verifikasi kamera geotag di lokasi.
              </p>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-completed shrink-0" />
                  <span>
                    Self-pickup Rp 0 &amp; 100% ongkir masuk ke petani
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Camera className="w-3.5 h-3.5 text-status-handover shrink-0" />
                  <span>
                    Verifikasi serah terima kamera + geotag + timestamp
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Truck className="w-3.5 h-3.5 text-status-bidding shrink-0" />
                  <span>Komisi platform hanya 3–5% dari harga panen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2026 Patra Tani Indonesia. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="hover:text-white transition-colors">
              Peta Lokasi Panen
            </Link>
            <span>•</span>
            <Link href="/dashboard/farmer" className="hover:text-white transition-colors">
              Mitra Kelompok Tani
            </Link>
            <span>•</span>
            <Link href="/admin/disputes" className="hover:text-white transition-colors">
              Status Layanan &amp; Escrow
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
