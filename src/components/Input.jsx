"use client";
import React from "react";
import clsx from "clsx";

export default function Input({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  iconLeft: IconLeft,
  iconRight: IconRight,
  helperText,
  error = false,
  disabled = false,
  required = false,
  className = "",
  inputClassName = "",
  ...props
}) {
  const generatedId = React.useId();
  const inputId = id || name || generatedId;
  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : null;
  const displayHelperText = errorMessage || helperText;

  const renderIcon = (Icon, position) => {
    if (!Icon) return null;
    const positionClass = position === "left" ? "left-3" : "right-3";

    if (React.isValidElement(Icon)) {
      return (
        <span
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted",
            hasError && "text-status-disputed",
            positionClass
          )}
        >
          {Icon}
        </span>
      );
    }

    const IconComp = Icon;
    return (
      <span
        className={clsx(
          "absolute top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted",
          hasError && "text-status-disputed",
          positionClass
        )}
      >
        <IconComp className="w-4 h-4" />
      </span>
    );
  };

  return (
    <div className={clsx("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-status-disputed ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {renderIcon(IconLeft, "left")}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={clsx(
            "w-full rounded-xl px-3.5 py-2.5 text-sm font-normal text-ink transition-all duration-150",
            "bg-[#EFEEE7] placeholder:text-ink-muted/70",
            hasError
              ? "border border-status-disputed focus:border-status-disputed focus:ring-2 focus:ring-status-disputed/20 focus:outline-none"
              : "border border-border hover:border-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            IconLeft ? "pl-10" : "pl-3.5",
            IconRight ? "pr-10" : "pr-3.5",
            disabled && "opacity-60 bg-[#E6E4DA] cursor-not-allowed",
            inputClassName
          )}
          {...props}
        />

        {renderIcon(IconRight, "right")}
      </div>

      {displayHelperText && (
        <p
          className={clsx(
            "text-xs transition-colors duration-150",
            hasError ? "text-status-disputed font-medium" : "text-ink-muted"
          )}
        >
          {displayHelperText}
        </p>
      )}
    </div>
  );
}
