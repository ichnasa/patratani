import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Sprout,
  Search,
  Bell,
  Home,
  Compass,
  ClipboardList,
  User,
  Scale,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Navbar({
  searchValue,
  onSearchChange,
  notificationCount = 2,
}) {
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

  const [internalSearch, setInternalSearch] = useState(searchValue || "");

  useEffect(() => {
    if (searchValue !== undefined && searchValue !== null) {
      setInternalSearch(searchValue);
    }
  }, [searchValue]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInternalSearch(val);
    if (onSearchChange) {
      onSearchChange(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(`/explore?search=${encodeURIComponent(internalSearch)}`);
    }
  };

  const isNavActive = (path) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const activeSearchVal =
    onSearchChange && searchValue !== undefined ? searchValue : internalSearch;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-border transition-colors">
        <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-16 flex items-center justify-between gap-2 sm:gap-4">
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
            <div className="hidden lg:flex items-center w-60 rounded-md border border-border px-3 py-2 gap-2 bg-[#E6E4DA]/40 transition-colors focus-within:border-primary focus-within:bg-surface">
              <Search className="w-4 h-4 text-ink-muted shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari panen atau tender..."
                value={activeSearchVal}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>

            {isTransactionalUser && (
              <Link
                to="/handover"
                aria-label="Pemberitahuan Transaksi"
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-green/60 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-disputed" />
                )}
              </Link>
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

        <div className="px-4 sm:px-6 pb-3 lg:hidden">
          <div className="flex items-center w-full rounded-md border border-border px-3 py-2 gap-2 bg-[#E6E4DA]/40 focus-within:border-primary focus-within:bg-surface transition-colors">
            <Search className="w-4 h-4 text-ink-muted shrink-0 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari panen atau tender..."
              value={activeSearchVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
            />
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
            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
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
