"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "@/context/AppContext";
import {
  Sprout,
  Scale,
  Store,
  Truck,
  FileText,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Check,
  PackageCheck,
  Compass,
  Home,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function Navbar() {
  const { currentUser, login, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin") || pathname.startsWith("/admin");
  const isBuyer = !isAdmin && (roleLower.includes("pembeli") || roleLower.includes("umkm"));
  const isFarmer = !isAdmin && !isBuyer; // default to farmer if not buyer or admin

  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isNavActive = (path) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleSwitchToFarmer = () => {
    login({
      email: "petani@patratani.com",
      role: "Petani Mitra",
      name: "Pak Mulyono",
    });
    setShowProfileMenu(false);
    router.push("/");
  };

  const handleSwitchToBuyer = () => {
    login({
      email: "pembeli@patratani.com",
      role: "Pembeli UMKM",
      name: "Ibu Lina Marlina",
    });
    setShowProfileMenu(false);
    router.push("/");
  };

  const farmerNotifications = [
    {
      id: "fn-1",
      title: "Pesanan Siap Diantar",
      description: "Pesanan Bawang Merah 25 Kg ke Dapur Bu Lina siap untuk serah terima.",
      time: "15 mnt lalu",
      link: "/handover",
      unread: true,
    },
    {
      id: "fn-2",
      title: "Tender Restoran Baru",
      description: "Resto Dapur Sunda membuka tender Tomat Merah 20 Kg (anggaran Rp 14.000/kg).",
      time: "1 jam lalu",
      link: "/tender/TND-2026-002",
      unread: true,
    },
  ];

  const buyerNotifications = [
    {
      id: "bn-1",
      title: "Penawaran Masuk dari Petani",
      description: "Kang Rizal mengajukan penawaran Rp 12.000/kg untuk tender Tomat Merah Anda.",
      time: "20 mnt lalu",
      link: "/tender/pembeli/TND-8821",
      unread: true,
    },
    {
      id: "bn-2",
      title: "Kurir Petani Telah Tiba",
      description: "Pak Solihin telah tiba membawa pesanan Bawang Merah 25 Kg untuk ditimbang.",
      time: "45 mnt lalu",
      link: "/handover",
      unread: true,
    },
  ];

  const activeNotifs = isFarmer ? farmerNotifications : buyerNotifications;
  const unreadCount = activeNotifs.filter((n) => n.unread).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-border">
        <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-16 flex items-center justify-between gap-4">

          {/* Logo & Role Identity Badge */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 select-none group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-[#E5E5DB]">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">
                PatraTani
              </span>
            </Link>

            {/* Distinct Role Chip */}
            {isAdmin ? (
              <span className="text-[11px] font-semibold text-red-900 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-md">
                Admin Escrow
              </span>
            ) : isFarmer ? (
              <span className="text-[11px] font-semibold text-primary bg-surface-green border border-primary/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <span>🌱</span>
                <span>Petani Mitra</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <span>🍳</span>
                <span>Dapur UMKM</span>
              </span>
            )}
          </div>

          {/* Role-Specific Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {isAdmin ? (
              <Link
                href="/admin/disputes"
                className={clsx(
                  "py-1 border-b-2 transition-colors",
                  isNavActive("/admin")
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-ink-secondary hover:text-ink",
                )}
              >
                Bantuan &amp; Sengketa
              </Link>
            ) : isFarmer ? (
              <>
                <Link
                  href="/"
                  className={clsx(
                    "py-1 border-b-2 transition-colors",
                    pathname === "/"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  Kebun Saya
                </Link>
                <Link
                  href="/dashboard/farmer"
                  className={clsx(
                    "py-1 border-b-2 transition-colors",
                    isNavActive("/dashboard/farmer")
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  Kelola Pesanan
                </Link>
                <Link
                  href="/explore"
                  className={clsx(
                    "py-1 border-b-2 transition-colors",
                    isNavActive("/explore")
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  Cari Pembeli
                </Link>
                <Link
                  href="/handover"
                  className={clsx(
                    "py-1 border-b-2 transition-colors flex items-center gap-1.5",
                    isNavActive("/handover")
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  <span>Serah Terima</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={clsx(
                    "py-1 border-b-2 transition-colors",
                    pathname === "/"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  Dapur Saya
                </Link>
                <Link
                  href="/explore"
                  className={clsx(
                    "py-1 border-b-2 transition-colors",
                    isNavActive("/explore")
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  Pasar Sayur
                </Link>
                <Link
                  href="/dashboard/buyer"
                  className={clsx(
                    "py-1 border-b-2 transition-colors",
                    isNavActive("/dashboard/buyer")
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  Kebutuhan Dapur
                </Link>
                <Link
                  href="/escrow"
                  className={clsx(
                    "py-1 border-b-2 transition-colors",
                    isNavActive("/escrow")
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  Rekening Bersama
                </Link>
              </>
            )}
          </nav>

          {/* Right Area: Actions, Notifications & User Switcher */}
          <div className="flex items-center gap-3">

            {/* Quick Action Button */}
            {!isAdmin && (
              isFarmer ? (
                <Link
                  href="/etalase/create"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-[#E5E5DB] hover:bg-primary-hover transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Pasang Panen</span>
                </Link>
              ) : (
                <Link
                  href="/tender/create"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-[#E5E5DB] hover:bg-primary-hover transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Cari Pasokan</span>
                </Link>
              )
            )}

            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotif((prev) => !prev)}
                className="relative p-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-black/5 transition-colors cursor-pointer"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-surface" />
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 border-b border-border flex items-center justify-between bg-[#E5E5DB]/40">
                    <span className="text-xs font-bold text-ink">
                      Pemberitahuan ({isFarmer ? "Petani" : "Pembeli"})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNotif(false)}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
                    {activeNotifs.map((item) => (
                      <Link
                        key={item.id}
                        href={item.link}
                        onClick={() => setShowNotif(false)}
                        className="p-3 block hover:bg-black/5 transition-colors text-left"
                      >
                        <p className="text-xs font-bold text-ink">{item.title}</p>
                        <p className="text-[11px] text-ink-secondary mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                        <span className="text-[10px] text-ink-muted mt-1 block">
                          {item.time}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer select-none"
              >
                <img
                  src={
                    currentUser?.avatar ||
                    (isFarmer
                      ? "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80")
                  }
                  alt={currentUser?.name || "Profil"}
                  className="w-7 h-7 rounded-full object-cover border border-border"
                />
                <span className="text-xs font-semibold text-ink hidden sm:inline max-w-[120px] truncate">
                  {currentUser?.name || (isFarmer ? "Kang Rizal" : "Bu Lina")}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border shadow-xl z-50 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 border-b border-border/80">
                    <p className="text-xs font-bold text-ink truncate">
                      {currentUser?.name || (isFarmer ? "Pak Mulyono" : "Ibu Lina")}
                    </p>
                    <p className="text-[11px] text-primary font-medium mt-0.5">
                      {currentUser?.role || (isFarmer ? "Petani Mitra" : "Pembeli UMKM")}
                    </p>
                  </div>

                  {/* Switch Role Feature */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-ink-muted px-2 block">
                      Ganti Akun Peran:
                    </span>
                    <button
                      type="button"
                      onClick={handleSwitchToFarmer}
                      className={clsx(
                        "w-full px-2.5 py-1.5 text-xs rounded-lg text-left flex items-center justify-between cursor-pointer transition-colors",
                        isFarmer ? "bg-surface-green text-primary font-bold" : "hover:bg-black/5 text-ink-secondary",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🌱</span>
                        <span>Petani Mitra</span>
                      </span>
                      {isFarmer && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleSwitchToBuyer}
                      className={clsx(
                        "w-full px-2.5 py-1.5 text-xs rounded-lg text-left flex items-center justify-between cursor-pointer transition-colors",
                        isBuyer ? "bg-amber-100 text-amber-900 font-bold" : "hover:bg-black/5 text-ink-secondary",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🍳</span>
                        <span>Pembeli UMKM</span>
                      </span>
                      {isBuyer && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="pt-1 border-t border-border/80 space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg text-ink-secondary hover:text-ink hover:bg-black/5 flex items-center gap-2 transition-colors block"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profil &amp; Rekening Kas</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        router.push("/login");
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Role-Specific Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-3 py-2 flex items-center justify-around md:hidden shadow-lg">
        {isAdmin ? (
          <Link
            href="/admin/disputes"
            className={clsx(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs",
              isNavActive("/admin") ? "text-primary font-bold" : "text-ink-muted",
            )}
          >
            <Scale className="w-5 h-5" />
            <span className="text-[10px]">Sengketa</span>
          </Link>
        ) : isFarmer ? (
          <>
            <Link
              href="/"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                pathname === "/" ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Kebun</span>
            </Link>
            <Link
              href="/dashboard/farmer"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                isNavActive("/dashboard/farmer") ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <Sprout className="w-5 h-5" />
              <span className="text-[10px]">Operasional</span>
            </Link>
            <Link
              href="/explore"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                isNavActive("/explore") ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px]">Tender Masuk</span>
            </Link>
            <Link
              href="/handover"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                isNavActive("/handover") ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <Truck className="w-5 h-5" />
              <span className="text-[10px]">Serah Terima</span>
            </Link>
            <Link
              href="/profile"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                isNavActive("/profile") ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Akun</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                pathname === "/" ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Dapur</span>
            </Link>
            <Link
              href="/explore"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                isNavActive("/explore") ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px]">Pasar Panen</span>
            </Link>
            <Link
              href="/dashboard/buyer"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                isNavActive("/dashboard/buyer") ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px]">Tender Saya</span>
            </Link>
            <Link
              href="/escrow"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                isNavActive("/escrow") ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px]">Escrow</span>
            </Link>
            <Link
              href="/profile"
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-2 text-xs",
                isNavActive("/profile") ? "text-primary font-bold" : "text-ink-muted",
              )}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Akun</span>
            </Link>
          </>
        )}
      </nav>
    </>
  );
}
