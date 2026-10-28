import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Sprout,
  Bell,
  Home,
  Compass,
  ClipboardList,
  User,
  Scale,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { currentUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdmin =
    roleLower.includes("admin") || currentPath.startsWith("/admin");
  const isBuyer = roleLower.includes("pembeli") || roleLower.includes("umkm");
  const isFarmer = roleLower.includes("petani") || roleLower.includes("mitra");
  const showUserDashboard = Boolean(
    currentUser && !isAdmin && (isFarmer || isBuyer),
  );
  const isTransactionalUser = Boolean(
    currentUser && !isAdmin && (isFarmer || isBuyer),
  );
  const dashboardRoute = isBuyer ? "/dashboard/buyer" : "/dashboard/farmer";

  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    if (showNotif) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotif]);

  const notifications = [
    {
      id: "notif-1",
      title: "Dana Escrow Diamankan",
      description:
        "Dana Rp 1.585.000 untuk transaksi Tomat Mawar telah diamankan di rekening escrow.",
      time: "10 mnt lalu",
      link: "/escrow",
      unread: true,
    },
    {
      id: "notif-2",
      title: "Penawaran Tender Masuk",
      description:
        "Pak Wayan mengajukan penawaran Rp 46.000/kg untuk Tender Cabai Rawit.",
      time: "1 jam lalu",
      link: "/tender",
      unread: true,
    },
    {
      id: "notif-3",
      title: "Verifikasi Serah-Terima Kebun",
      description:
        "Pesanan Bawang Merah siap diperiksa dengan foto kamera geotag lokasi.",
      time: "3 jam lalu",
      link: "/handover",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const isNavActive = (path) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-border transition-colors">
        <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 select-none group transition-transform duration-150 hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-[#E6E4DA] transition-colors group-hover:bg-primary-hover">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary transition-colors group-hover:text-primary-hover">
                PatraTani
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={clsx(
                  "text-sm font-medium transition-colors duration-150 py-1",
                  isNavActive("/")
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-ink-secondary hover:text-primary",
                )}
              >
                Beranda
              </Link>
              {showUserDashboard && (
                <Link
                  to={dashboardRoute}
                  className={clsx(
                    "text-sm font-medium transition-colors duration-150 py-1",
                    isNavActive("/dashboard")
                      ? "text-primary font-bold border-b-2 border-primary"
                      : "text-ink-secondary hover:text-primary",
                  )}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/explore"
                className={clsx(
                  "text-sm font-medium transition-colors duration-150 py-1",
                  isNavActive("/explore")
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-ink-secondary hover:text-primary",
                )}
              >
                Jelajahi
              </Link>
              {isTransactionalUser && (
                <Link
                  to="/handover"
                  className={clsx(
                    "text-sm font-medium transition-colors duration-150 py-1 relative",
                    isNavActive("/handover") ||
                      isNavActive("/tender") ||
                      isNavActive("/escrow") ||
                      isNavActive("/completed")
                      ? "text-primary font-bold border-b-2 border-primary"
                      : "text-ink-secondary hover:text-primary",
                  )}
                >
                  <span>Transaksi</span>
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-[#E6E4DA]">
                    1
                  </span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/disputes"
                  className={clsx(
                    "text-sm font-medium transition-colors duration-150 py-1 flex items-center gap-1.5",
                    isNavActive("/admin")
                      ? "text-primary font-bold border-b-2 border-primary"
                      : "text-amber-700 hover:text-amber-800 font-semibold",
                  )}
                >
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>Portal Admin</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isTransactionalUser && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotif((prev) => !prev)}
                  aria-label="Pemberitahuan Notifikasi"
                  className={clsx(
                    "relative w-10 h-10 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-green/60 transition-colors cursor-pointer",
                    showNotif && "bg-surface-green/60 text-primary",
                  )}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-status-disputed text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface rounded-2xl border border-border shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-[#E6E4DA]/20">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">
                          Notifikasi
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                          {unreadCount} Baru
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNotif(false)}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>

                    <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowNotif(false);
                            navigate(item.link);
                          }}
                          className={clsx(
                            "p-3.5 hover:bg-surface-green/30 transition-colors cursor-pointer flex items-start gap-3 text-left",
                            item.unread && "bg-[#E6E4DA]/10",
                          )}
                        >
                          <div className="w-8 h-8 rounded-xl bg-surface-green text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-ink truncate">
                                {item.title}
                              </p>
                              <span className="text-[10px] text-ink-muted shrink-0">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-secondary leading-snug line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 border-t border-border bg-[#E6E4DA]/20 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNotif(false);
                          navigate("/handover");
                        }}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Lihat Semua Transaksi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentUser ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 select-none py-1 px-2 rounded-xl transition-colors hover:bg-surface-green/40 group"
              >
                <img
                  src={
                    currentUser.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  }
                  alt={currentUser.name || "Profil"}
                  className="w-8 h-8 rounded-full object-cover border border-border group-hover:border-primary transition-colors"
                />
                <span className="text-[13px] font-medium text-ink group-hover:text-primary transition-colors hidden sm:inline">
                  {currentUser.role || currentUser.name?.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-[#E6E4DA] hover:bg-primary-hover transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-6 py-2.5 flex items-center justify-around md:hidden shadow-lg">
        <Link
          to="/"
          className={clsx(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1 px-2 rounded-lg",
            isNavActive("/")
              ? "text-primary font-bold"
              : "text-ink-secondary hover:text-ink",
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </Link>

        <Link
          to="/explore"
          className={clsx(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1 px-2 rounded-lg",
            isNavActive("/explore")
              ? "text-primary font-bold"
              : "text-ink-secondary hover:text-ink",
          )}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Jelajahi</span>
        </Link>

        {isTransactionalUser && (
          <Link
            to="/handover"
            className={clsx(
              "flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1 px-2 rounded-lg relative",
              isNavActive("/handover") ||
                isNavActive("/tender") ||
                isNavActive("/escrow") ||
                isNavActive("/completed")
                ? "text-primary font-bold"
                : "text-ink-secondary hover:text-ink",
            )}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px]">Transaksi</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary text-[#E6E4DA]">
              1
            </span>
          </Link>
        )}

        {isAdmin && (
          <Link
            to="/admin/disputes"
            className={clsx(
              "flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1 px-2 rounded-lg",
              isNavActive("/admin")
                ? "text-primary font-bold"
                : "text-amber-700 hover:text-amber-800",
            )}
          >
            <Scale className="w-5 h-5 text-amber-600" />
            <span className="text-[10px] font-semibold">Admin</span>
          </Link>
        )}

        <Link
          to={currentUser ? "/profile" : "/login"}
          className={clsx(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1 px-2 rounded-lg",
            isNavActive("/profile") || isNavActive("/login")
              ? "text-primary font-bold"
              : "text-ink-secondary hover:text-ink",
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{currentUser ? "Akun" : "Masuk"}</span>
        </Link>
      </nav>
    </>
  );
}
