"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { fmt, riskLabel } from "@/lib/format";
import { X, Info } from "lucide-react";

/* ------------------------------ Panel ------------------------------ */

export function Panel({
  className,
  children,
  hover,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div className={cn("panel shadow-card", hover && "panel-hover", className)} {...rest}>
      {children}
    </div>
  );
}

/* -------------------------- AnimatedNumber ------------------------- */

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 900,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = to;
    };
  }, [value, duration]);

  return <span className={cn("num", className)}>{fmt(display, decimals)}</span>;
}

/* ------------------------------ Badges ----------------------------- */

export function RiskBadge({ risk, className }: { risk: string; className?: string }) {
  const map: Record<string, string> = {
    low: "text-brand-300 bg-brand-500/10 border-brand-500/25",
    medium: "text-warn bg-warn/10 border-warn/25",
    high: "text-danger bg-danger/10 border-danger/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-[3px] text-[11.5px] font-semibold",
        map[risk] ?? map.medium,
        className,
      )}
    >
      <span className="size-[5px] rounded-full bg-current" />
      {riskLabel[risk] ?? risk}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "warn" | "danger";
  className?: string;
}) {
  const map = {
    neutral: "border-white/[0.09] bg-white/[0.03] text-mute-200",
    brand: "border-brand-500/30 bg-brand-500/10 text-brand-300",
    warn: "border-warn/30 bg-warn/10 text-warn",
    danger: "border-danger/30 bg-danger/10 text-danger",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-[3px] text-[11.5px] font-medium",
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------- Tooltip ----------------------------- */

export function Tooltip({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <span className="group/tt relative inline-flex items-center align-middle">
      {children ?? <Info className="size-3.5 text-mute-400 hover:text-mute-200 transition" />}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] right-1/2 z-50 w-max max-w-[240px]
          translate-x-1/2 rounded-lg border border-white/10 bg-[#141A1D] px-2.5 py-1.5 text-[11.5px]
          leading-relaxed text-mute-100 opacity-0 shadow-lift transition-all duration-150
          group-hover/tt:opacity-100 group-focus-within/tt:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

/* ------------------------------ Modal ------------------------------ */

export function Modal({
  open,
  onClose,
  children,
  className,
  dismissable = true,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  dismissable?: boolean;
  labelledBy?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-[3px] animate-[fade-up_.2s_ease-out]"
        onClick={() => dismissable && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0D1113] shadow-lift",
          "animate-fade-up max-h-[92vh] overflow-y-auto",
          className,
        )}
      >
        {dismissable && (
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute left-4 top-4 z-10 rounded-lg p-1.5 text-mute-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------------------------- Skeleton ----------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function useBriefLoading(ms = 420) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return loading;
}

/* --------------------------- Empty state --------------------------- */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.012] px-6 py-16 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-mute-300">
        {icon}
      </div>
      <p className="text-[15px] font-semibold text-mute-100">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-mute-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ----------------------------- Section ----------------------------- */

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[17px] font-bold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] text-mute-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* --------------------------- Stat display -------------------------- */

export function Stat({
  label,
  value,
  sub,
  className,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  tone?: "brand";
}) {
  return (
    <div className={cn("", className)}>
      <p className="label">{label}</p>
      <p
        className={cn(
          "mt-1.5 text-[22px] font-bold tracking-tight",
          tone === "brand" ? "text-brand-300" : "text-white",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-[12px] text-mute-400">{sub}</p>}
    </div>
  );
}
