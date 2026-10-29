import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import { MapPin } from "lucide-react";

export default function TenderCard({ tender, onBid }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  if (!tender) return null;

  const roleLower = (currentUser?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin");
  const isFarmer = !isAdmin && (roleLower.includes("petani") || roleLower.includes("mitra"));

  const handleCardClick = () => {
    navigate(`/tender/${tender.id}`);
  };

  const handleBidClick = (e) => {
    e.stopPropagation();
    if (onBid) {
      onBid(tender);
    } else {
      navigate(`/tender/${tender.id}`);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="bg-surface rounded-2xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">
                {tender.category}
              </span>
              <span className="text-xs text-ink-muted">•</span>
              <span className="text-xs text-ink-muted">
                Target {tender.requiredQuantityKg} Kg
              </span>
            </div>
            <h3 className="text-base font-bold text-ink leading-tight group-hover:text-primary transition-colors">
              {tender.title}
            </h3>
          </div>

          <StatusBadge status={tender.status} size="sm" showIcon />
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed bg-[#E6E4DA] p-3 rounded-xl border border-border/80">
          "{tender.specifications}"
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-ink-muted block uppercase font-medium">
              Target Anggaran
            </span>
            <strong className="text-sm font-bold text-primary mt-0.5 block">
              Rp {tender.targetPricePerKg.toLocaleString("id-ID")}/kg
            </strong>
            <span className="text-[10px] text-ink-muted">
              Total Rp {tender.totalBudget.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-ink-muted block uppercase font-medium">
              Pemohon UMKM
            </span>
            <strong className="text-xs font-semibold text-ink mt-0.5 block truncate">
              {tender.buyer.businessName}
            </strong>
            <span className="text-[10px] text-ink-muted flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              {tender.buyer.distanceKm} km ({tender.buyer.businessType})
            </span>
          </div>
        </div>

        <div className="space-y-1 text-xs text-ink-secondary">
          <div className="flex items-center justify-between">
            <span>Metode Serah Terima:</span>
            <span className="font-semibold text-ink">
              {tender.fulfillmentMethod === "SELF_PICKUP"
                ? "Ambil Sendiri (Rp0)"
                : `Kurir Petani (Rp ${(tender.deliveryFee || 0).toLocaleString("id-ID")})`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Batas Penawaran:</span>
            <span className="font-semibold text-ink">
              {tender.deadlineDate}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-border/80 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-muted">
          Penawaran masuk: <strong className="text-ink">{tender.bidsCount || 0} Petani</strong>
        </span>

        {isFarmer ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleBidClick}
          >
            Beri Penawaran
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCardClick}
          >
            Lihat Rincian
          </Button>
        )}
      </div>
    </article>
  );
}
