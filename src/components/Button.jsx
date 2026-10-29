"use client";
import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 select-none";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
    md: "text-sm px-4 py-2.5 rounded-xl gap-2",
    lg: "text-base px-6 py-3 rounded-xl gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-primary text-[#E6E4DA] hover:bg-primary-hover active:bg-[#07190f] shadow-sm",
    secondary:
      "bg-surface-green text-ink hover:bg-[#cfd3c3] active:bg-[#c2c7b5] border border-border/60",
    outline:
      "bg-transparent text-ink border border-border hover:bg-surface hover:border-ink/40 active:bg-surface-green/40",
    ghost:
      "bg-transparent text-ink hover:bg-surface/80 active:bg-surface-green/50",
    destructive:
      "bg-status-disputed text-white hover:bg-[#b91c1c] active:bg-[#991b1b] shadow-sm focus:ring-status-disputed",
  };

  const stateClasses =
    disabled || isLoading
      ? "opacity-50 cursor-not-allowed pointer-events-none shadow-none"
      : "cursor-pointer";

  const iconSizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const renderIcon = () => {
    if (isLoading) {
      return (
        <svg
          className={clsx("animate-spin", iconSizeClasses[size] || "w-4 h-4")}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }

    if (!Icon) return null;

    if (React.isValidElement(Icon)) {
      return Icon;
    }

    const IconComponent = Icon;
    return <IconComponent className={iconSizeClasses[size] || "w-4 h-4"} />;
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={clsx(
        baseClasses,
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.primary,
        stateClasses,
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {iconPosition === "left" && renderIcon()}
      {children && <span>{children}</span>}
      {iconPosition === "right" && renderIcon()}
    </button>
  );
}
