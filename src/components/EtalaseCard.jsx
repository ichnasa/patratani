"use client";
import { useRouter } from "next/navigation";
import Navigate from "./Navigate";
import React from "react";
import { useApp } from "../context/AppContext";
import Button from "./Button";
import { MapPin, Calendar } from "lucide-react";

export default function EtalaseCard({ commodity, onOrder }) {
  const router = useRouter();
  const navigate = (to, opts) => (to === -1 ? router.back() : (opts?.replace ? router.replace(to) : router.push(to)));
  const { startTransactionFromCommodity, currentUser } = useApp();

  if (!commodity) return null;

  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin");
  const isBuyer = !isAdmin && (roleLower.includes("pembeli") || roleLower.includes("umkm"));

  const handleOrder = (e) => {
    e.stopPropagation();
    if (onOrder) {
      onOrder(commodity);
    } else {
      if (startTransactionFromCommodity) {
        startTransactionFromCommodity(commodity);
      }
      navigate(`/etalase/${commodity.id}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/etalase/${commodity.id}`);
  };

  const deliveryFee =
    commodity.logistics?.farmerDelivery?.fixedFee !== undefined
      ? commodity.logistics.farmerDelivery.fixedFee
      : 15000;

  const priceFormatted =
    commodity.pricePerKg !== undefined && commodity.pricePerKg !== null
      ? Number(commodity.pricePerKg).toLocaleString("id-ID")
      : "0";

  return (
    <article
      onClick={handleCardClick}
      className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md cursor-pointer"
    >
      <div>
        <div className="relative h-40 sm:h-44 w-full bg-[#E6E4DA] overflow-hidden">
          <img
            src={commodity.image}
            alt={commodity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {commodity.category && (
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-green/90 backdrop-blur-sm text-primary border border-primary/20">
                {commodity.category}
              </span>
            </div>
          )}
        </div>

        <div className="p-3.5 sm:p-4 space-y-2">
          <div>
            {commodity.harvestDate && (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-primary mb-0.5">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>Panen: {commodity.harvestDate}</span>
              </div>
            )}
            <h3 className="text-sm sm:text-base font-bold text-ink leading-snug group-hover:text-primary transition-colors line-clamp-1">
              {commodity.name}
            </h3>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold text-primary tracking-tight">
                Rp {priceFormatted}
              </span>
              <span className="text-[11px] font-medium text-ink-muted">
                /kg
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={
                  commodity.farmer?.avatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                }
                alt={commodity.farmer?.name || "Petani"}
                className="w-5 h-5 rounded-full object-cover border border-border shrink-0"
              />
              <span className="font-medium text-ink-secondary text-[11px] truncate">
                {commodity.farmer?.name || "Petani Mitra"}
              </span>
            </div>

            <span className="text-[11px] text-ink-muted flex items-center gap-0.5 shrink-0">
              <MapPin className="w-3 h-3 text-primary" />
              {commodity.farmer?.distanceKm ?? 2.5} km
            </span>
          </div>

          <div className="space-y-1 text-[11px] sm:text-xs text-ink-secondary pt-1.5 border-t border-border/60">
            <div className="flex items-center justify-between">
              <span>Tersedia:</span>
              <strong className="text-ink font-semibold">
                {commodity.quotaKg || 0} Kg
                {commodity.minOrderKg ? ` (Min. ${commodity.minOrderKg} Kg)` : ""}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Logistik:</span>
              <span className="text-ink font-medium">
                Ambil Rp0 • Kirim Rp {deliveryFee.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 pt-0">
        {isBuyer ? (
          <Button
            variant="primary"
            fullWidth
            size="sm"
            onClick={handleOrder}
          >
            Pesan Langsung
          </Button>
        ) : (
          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={handleCardClick}
          >
            Lihat Detail Panen
          </Button>
        )}
      </div>
    </article>
  );
}
