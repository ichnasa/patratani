import React from "react";
import clsx from "clsx";
import { X } from "lucide-react";

export default function Chip({
  label,
  children,
  active = false,
  icon: Icon,
  count,
  removable = false,
  onRemove,
  onClick,
  disabled = false,
  size = "md",
  className = "",
  ...props
}) {
  const isInteractive = Boolean(onClick) && !disabled;
  const content = label || children;

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1 rounded-lg gap-1.5",
    md: "text-xs font-medium px-3.5 py-1.5 rounded-xl gap-2",
  };

  const activeClasses = active
    ? "bg-primary text-[#E6E4DA] border-primary shadow-sm hover:bg-primary-hover"
    : "bg-[#EFEEE7] text-ink-secondary hover:text-ink hover:bg-[#E5E3D8] border border-border";

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const IconComp = Icon;
    return <IconComp className="w-3.5 h-3.5 shrink-0" />;
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    if (onRemove && !disabled) {
      onRemove();
    }
  };

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={clsx(
        "inline-flex items-center transition-all duration-150 select-none",
        sizeClasses[size] || sizeClasses.md,
        activeClasses,
        isInteractive && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {renderIcon()}

      <span>{content}</span>

      {count !== undefined && count !== null && (
        <span
          className={clsx(
            "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
            active
              ? "bg-[#E6E4DA] text-primary"
              : "bg-border text-ink"
          )}
        >
          {count}
        </span>
      )}

      {removable && (
        <button
          type="button"
          onClick={handleRemoveClick}
          aria-label="Hapus filter"
          className={clsx(
            "rounded-full p-0.5 transition-colors focus:outline-none",
            active
              ? "hover:bg-[#E6E4DA]/20 text-[#E6E4DA]"
              : "hover:bg-border text-ink-muted hover:text-ink"
          )}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
