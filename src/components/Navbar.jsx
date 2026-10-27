import React, { useState } from "react";
import clsx from "clsx";
import {
  Sprout,
  Search,
  Bell,
  Home,
  Compass,
  ClipboardList,
  User,
} from "lucide-react";

export default function Navbar({
  activeNav = "beranda",
  onNavChange,
  searchValue = "",
  onSearchChange,
  notificationCount = 2,
  user = {
    name: "Rizal",
    role: "Petani",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80",
  },
}) {
  const [internalNav, setInternalNav] = useState(activeNav);

  const currentNav = onNavChange ? activeNav : internalNav;

  const handleNavClick = (navId) => {
    if (onNavChange) {
      onNavChange(navId);
    } else {
      setInternalNav(navId);
    }
  };

  const navLinks = [
    { id: "beranda", label: "Beranda" },
    { id: "jelajahi", label: "Jelajahi" },
    { id: "transaksi", label: "Transaksi" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-border">
        <div className="max-w-[1440px] mx-auto h-16 px-6 lg:px-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 shrink-0">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleNavClick("beranda")}
              onKeyDown={(e) => e.key === "Enter" && handleNavClick("beranda")}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-[#E6E4DA]">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">
                PatraTani
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((item) => {
                const isActive = currentNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={clsx(
                      "text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-ink-secondary hover:text-ink"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center w-60 rounded-md border border-border px-3 py-2 gap-2 bg-[#E6E4DA]/40">
              <Search className="w-4 h-4 text-ink-muted shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari panen atau tender..."
                value={searchValue}
                onChange={onSearchChange}
                className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>

            <button
              type="button"
              aria-label="Pemberitahuan"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-green/40 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-disputed" />
              )}
            </button>

            <div
              role="button"
              tabIndex={0}
              onClick={() => handleNavClick("akun")}
              onKeyDown={(e) => e.key === "Enter" && handleNavClick("akun")}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <span className="text-[13px] font-medium text-ink hidden sm:inline">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-3 lg:hidden">
          <div className="flex items-center w-full rounded-md border border-border px-3 py-2 gap-2 bg-[#E6E4DA]/40">
            <Search className="w-4 h-4 text-ink-muted shrink-0 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari panen atau tender..."
              value={searchValue}
              onChange={onSearchChange}
              className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
            />
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-6 py-2.5 flex items-center justify-around md:hidden">
        <button
          type="button"
          onClick={() => handleNavClick("beranda")}
          className={clsx(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors",
            currentNav === "beranda" ? "text-primary font-bold" : "text-ink-secondary"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick("jelajahi")}
          className={clsx(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors",
            currentNav === "jelajahi" ? "text-primary font-bold" : "text-ink-secondary"
          )}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Jelajahi</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick("transaksi")}
          className={clsx(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors relative",
            currentNav === "transaksi" ? "text-primary font-bold" : "text-ink-secondary"
          )}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">Transaksi</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick("akun")}
          className={clsx(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors",
            currentNav === "akun" ? "text-primary font-bold" : "text-ink-secondary"
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Akun</span>
        </button>
      </nav>
    </>
  );
}
