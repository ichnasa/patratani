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
  ChevronDown,
} from "lucide-react";

export default function Navbar({
  activeNav = "beranda",
  onNavChange,
  searchValue = "",
  onSearchChange,
  notificationCount = 2,
  user = {
    name: "Ibu Lina Marlina",
    role: "Pembeli UMKM",
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
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "jelajahi", label: "Jelajahi", icon: Compass },
    { id: "transaksi", label: "Transaksi", icon: ClipboardList, badge: 3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleNavClick("beranda")}
              onKeyDown={(e) => e.key === "Enter" && handleNavClick("beranda")}
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-[#E6E4DA] shadow-sm">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-ink leading-tight">
                  Patra<span className="text-primary">Tani</span>
                </span>
                <span className="text-[10px] font-medium text-ink-muted leading-none">
                  Pasar Tani Mandiri
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = currentNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={clsx(
                      "px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-2 relative",
                      isActive
                        ? "bg-surface-green text-primary font-semibold shadow-xs"
                        : "text-ink-secondary hover:text-ink hover:bg-surface-green/50"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-[#E6E4DA]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari komoditas atau tender..."
                value={searchValue}
                onChange={onSearchChange}
                className="w-full bg-[#E6E4DA] border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs font-normal text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Pemberitahuan"
                className="relative p-2.5 rounded-xl text-ink hover:bg-surface-green/60 active:bg-surface-green transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Bell className="w-5 h-5 text-ink" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-disputed ring-2 ring-surface" />
                )}
              </button>

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleNavClick("akun")}
                onKeyDown={(e) => e.key === "Enter" && handleNavClick("akun")}
                className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-surface-green/50 cursor-pointer transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-ink leading-tight line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-ink-muted leading-none">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-ink-muted hidden sm:block" />
              </div>
            </div>
          </div>

          <div className="pb-3 lg:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari komoditas atau tender..."
                value={searchValue}
                onChange={onSearchChange}
                className="w-full bg-[#E6E4DA] border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs font-normal text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              />
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-4 py-2 flex items-center justify-around md:hidden">
        <button
          type="button"
          onClick={() => handleNavClick("beranda")}
          className={clsx(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors",
            currentNav === "beranda" ? "text-primary" : "text-ink-secondary"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick("jelajahi")}
          className={clsx(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors",
            currentNav === "jelajahi" ? "text-primary" : "text-ink-secondary"
          )}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Jelajahi</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick("transaksi")}
          className={clsx(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors relative",
            currentNav === "transaksi" ? "text-primary" : "text-ink-secondary"
          )}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">Transaksi</span>
          <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-status-bidding" />
        </button>

        <button
          type="button"
          onClick={() => handleNavClick("akun")}
          className={clsx(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors",
            currentNav === "akun" ? "text-primary" : "text-ink-secondary"
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Akun</span>
        </button>
      </nav>
    </>
  );
}
