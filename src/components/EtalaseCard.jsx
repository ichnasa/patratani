import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Button from "./Button";
import { MapPin, Calendar } from "lucide-react";

export default function EtalaseCard({ commodity, onOrder }) {
  const navigate = useNavigate();
  const { startTransactionFromCommodity } = useApp();

  if (!commodity) return null;

  const handleOrder = (e) => {
    e.stopPropagation();
    if (onOrder) {
      onOrder(commodity);
    } else {
      if (startTransactionFromCommodity) {
        startTransactionFromCommodity(commodity);
      }
      navigate("/escrow");
    }
  };

  const handleCardClick = () => {
    if (startTransactionFromCommodity) {
      startTransactionFromCommodity(commodity);
    }
    navigate("/escrow");
  };

  const deliveryFee =
    commodity.logistics?.farmerDelivery?.fixedFee !== undefined
      ? commodity.logistics.farmerDelivery.fixedFee
      : 15000;

  return (
    <article
      onClick={handleCardClick}
      className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md cursor-pointer"
    >
      <div>
        <div className="relative h-44 w-full bg-[#E6E4DA] overflow-hidden">
          <img
            src={commodity.image}
            alt={commodity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {commodity.grade && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1A1A1A]/80 backdrop-blur-md text-[#E6E4DA]">
                {commodity.grade}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-green text-primary border border-primary/20">
              {commodity.category}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-primary text-[#E6E4DA] shadow-xs">
              Rp {commodity.pricePerKg.toLocaleString("id-ID")}/kg
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div>
            {commodity.harvestDate && (
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary mb-1">
                <Calendar className="w-3 h-3" />
                <span>Panen: {commodity.harvestDate}</span>
              </div>
            )}
            <h3 className="text-base font-bold text-ink leading-tight group-hover:text-primary transition-colors">
              {commodity.name}
            </h3>
            <p className="text-xs text-ink-secondary line-clamp-2 mt-1">
              {commodity.description}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#E6E4DA] border border-border/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <img
                src={commodity.farmer.avatar}
                alt={commodity.farmer.name}
                className="w-7 h-7 rounded-full object-cover border border-border"
              />
              <div>
                <p className="font-semibold text-ink leading-tight">
                  {commodity.farmer.name}
                </p>
                <p className="text-[10px] text-ink-muted">
                  {commodity.farmer.farmName}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-medium text-ink flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3 text-primary" />
              {commodity.farmer.distanceKm} km
            </span>
          </div>

          <div className="space-y-1 text-xs text-ink-secondary pt-1">
            <div className="flex items-center justify-between">
              <span>Tersedia:</span>
              <strong className="text-ink font-semibold">
                {commodity.quotaKg} Kg
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

      <div className="p-5 pt-0">
        <Button
          variant="primary"
          fullWidth
          size="md"
          onClick={handleOrder}
        >
          Pesan Langsung
        </Button>
      </div>
    </article>
  );
}
