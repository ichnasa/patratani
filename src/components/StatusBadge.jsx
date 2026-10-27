import React from "react";
import clsx from "clsx";
import {
  Clock,
  TrendingUp,
  Award,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const TRANSACTION_STATUS_MAP = {
  OPEN: {
    label: "Terbuka",
    textColor: "text-[#64748B]",
    bgColor: "bg-[#F3F4F6]",
    borderColor: "border-[#E2E8F0]",
    dotColor: "bg-[#64748B]",
    icon: Clock,
    description: "Tender terbuka untuk penawaran petani",
  },
  BIDDING: {
    label: "Penawaran Masuk",
    textColor: "text-[#D97706]",
    bgColor: "bg-[#FEF3C7]",
    borderColor: "border-[#FDE68A]",
    dotColor: "bg-[#D97706]",
    icon: TrendingUp,
    description: "Penawaran petani sedang dievaluasi",
  },
  AWARDED: {
    label: "Pemenang Ditunjuk",
    textColor: "text-[#0D9488]",
    bgColor: "bg-[#CCFBF1]",
    borderColor: "border-[#99F6E4]",
    dotColor: "bg-[#0D9488]",
    icon: Award,
    description: "Petani pemenang telah disepakati",
  },
  PAID_HELD: {
    label: "Dana di Escrow",
    textColor: "text-[#D97706]",
    bgColor: "bg-[#FEF3C7]",
    borderColor: "border-[#FDE68A]",
    dotColor: "bg-[#D97706]",
    icon: ShieldCheck,
    description: "Pembayaran diamankan di escrow simulasi",
  },
  HANDOVER: {
    label: "Serah Terima",
    textColor: "text-[#2563EB]",
    bgColor: "bg-[#DBEAFE]",
    borderColor: "border-[#BFDBFE]",
    dotColor: "bg-[#2563EB]",
    icon: Truck,
    description: "Verifikasi serah terima kamera + geotag",
  },
  COMPLETED: {
    label: "Selesai",
    textColor: "text-[#16A34A]",
    bgColor: "bg-[#DCFCE7]",
    borderColor: "border-[#BBF7D0]",
    dotColor: "bg-[#16A34A]",
    icon: CheckCircle2,
    description: "Serah terima sukses, dana dicairkan",
  },
  DISPUTED: {
    label: "Sengketa",
    textColor: "text-[#DC2626]",
    bgColor: "bg-[#FEE2E2]",
    borderColor: "border-[#FECACA]",
    dotColor: "bg-[#DC2626]",
    icon: AlertTriangle,
    description: "Ketidaksesuaian ditangani admin",
  },
};

const normalizeStatusKey = (status) => {
  if (!status) return "OPEN";
  return status.toUpperCase().replace(/[-\s]/g, "_");
};

export default function StatusBadge({
  status = "OPEN",
  size = "md",
  showDot = true,
  showIcon = false,
  customLabel,
  className = "",
}) {
  const normalizedKey = normalizeStatusKey(status);
  const config =
    TRANSACTION_STATUS_MAP[normalizedKey] || TRANSACTION_STATUS_MAP.OPEN;

  const IconComp = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1 rounded-md",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5 rounded-lg",
    lg: "px-3 py-1.5 text-sm font-medium gap-2 rounded-xl",
  };

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center border font-medium select-none transition-colors duration-150",
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      title={config.description}
    >
      {showDot && (
        <span
          className={clsx(
            "rounded-full shrink-0",
            config.dotColor,
            dotSizeClasses[size] || dotSizeClasses.md
          )}
        />
      )}

      {showIcon && IconComp && (
        <IconComp
          className={clsx("shrink-0", iconSizeClasses[size] || iconSizeClasses.md)}
        />
      )}

      <span>{customLabel || config.label}</span>
    </span>
  );
}
