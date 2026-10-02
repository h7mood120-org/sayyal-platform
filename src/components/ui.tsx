"use client";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { fmt, riskLabel } from "@/lib/format";
import { X, Info } from "lucide-react";
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
export function AnimatedNumber({
value,
decimals = 0,
className,
}: {
value: number;
decimals?: number;
duration?: number;
className?: string;
}) {
return <span className={cn("num", className)}>{fmt(value, decimals)}</span>;
}
export function RiskBadge({ risk, className }: { risk: string; className?: string }) {
const map: Record<string, string> = {
low: "text-brand-800 bg-brand-50 border-brand-200",
medium: "text-warn bg-[#FFF6E5] border-[#F5D48A]",
high: "text-danger bg-[#FEF1F0] border-[#F7C6C1]",
};
return (
<span
className={cn(
"inline-flex items-center gap-1.5 rounded-md border px-2 py-[3px] text-[11.5px] font-semibold",
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
neutral: "border-line bg-canvas text-mute-200",
brand: "border-brand-200 bg-brand-50 text-brand-800",
warn: "border-[#F5D48A] bg-[#FFF6E5] text-warn",
danger: "border-[#F7C6C1] bg-[#FEF1F0] text-danger",
} as const;
return (
<span
className={cn(
"inline-flex items-center gap-1.5 rounded-md border px-2 py-[3px] text-[11.5px] font-medium",
map[tone],
className,
)}
>
{children}
</span>
);
}
export function Tooltip({ text, children }: { text: string; children?: React.ReactNode }) {
return (
<span className="group/tt relative inline-flex items-center align-middle">
{children ?? <Info className="size-3.5 text-mute-400 hover:text-mute-200 transition" />}
<span
role="tooltip"
className="pointer-events-none absolute bottom-[calc(100%+8px)] right-1/2 z-50 w-max max-w-[240px]
translate-x-1/2 rounded-lg border border-[#D5DCE5] bg-white px-2.5 py-1.5 text-[11.5px]
leading-relaxed text-mute-100 shadow-lift hidden
group-hover/tt:block group-focus-within/tt:block"
>
{text}
</span>
</span>
);
}
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
className="absolute inset-0 bg-ink/40"
onClick={() => dismissable && onClose()}
/>
<div
role="dialog"
aria-modal="true"
aria-labelledby={labelledBy}
className={cn(
"relative w-full max-w-lg rounded-2xl border border-line bg-white shadow-lift",
"max-h-[92vh] overflow-y-auto animate-fade-in",
className,
)}
>
{dismissable && (
<button
onClick={onClose}
aria-label="إغلاق"
className="absolute left-4 top-4 z-10 rounded-lg p-1.5 text-mute-400 transition hover:bg-ink/[0.05] hover:text-ink"
>
<X className="size-4" />
</button>
)}
{children}
</div>
</div>
);
}
export function Skeleton({ className }: { className?: string }) {
return <div className={cn("skeleton rounded-xl", className)} />;
}
export function useBriefLoading(_ms = 0) {
return false;
}
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
<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D5DCE5] bg-white px-6 py-16 text-center">
<div className="mb-4 grid size-11 place-items-center rounded-xl border border-line bg-canvas text-mute-300">
{icon}
</div>
<p className="text-[15px] font-semibold text-mute-100">{title}</p>
<p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-mute-400">{body}</p>
{action && <div className="mt-5">{action}</div>}
</div>
);
}
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
<h2 className="text-[17px] font-bold text-ink">{title}</h2>
{subtitle && <p className="mt-1 text-[13px] text-mute-400">{subtitle}</p>}
</div>
{action}
</div>
);
}
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
"mt-1.5 text-[22px] font-bold",
tone === "brand" ? "text-brand-700" : "text-ink",
)}
>
{value}
</p>
{sub && <p className="mt-1 text-[12px] text-mute-400">{sub}</p>}
</div>
);
}
