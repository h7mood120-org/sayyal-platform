"use client";
import React from "react";
import { platforms } from "@/data/platforms";
import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";
export function PlatformMark({
id,
size = 28,
className,
}: {
id: PlatformId;
size?: number;
className?: string;
}) {
const p = platforms[id];
const wide = id === "sukuk";
return (
<span
style={{ width: size, height: size, padding: wide ? size * 0.08 : size * 0.16 }}
className={cn(
"grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white",
className,
)}
>
<img src={p.mark} alt={p.nameAr} className="max-h-full max-w-full object-contain" draggable={false} />
</span>
);
}
export function PlatformLogo({
id,
height = 28,
className,
}: {
id: PlatformId;
height?: number;
className?: string;
}) {
const p = platforms[id];
return (
<img
src={p.logo}
alt={`${p.nameAr} — ${p.nameEn}`}
style={{ height }}
className={cn("w-auto shrink-0 object-contain", className)}
draggable={false}
/>
);
}
export function PlatformChip({
id,
size = "md",
showLabel = true,
className,
}: {
id: PlatformId;
size?: "sm" | "md";
showLabel?: boolean;
className?: string;
}) {
const p = platforms[id];
const mark = size === "sm" ? 22 : 26;
if (!showLabel) {
return (
<span title={`${p.nameAr} — ${p.descriptorAr}`} className={className}>
<PlatformMark id={id} size={size === "sm" ? 34 : 38} />
</span>
);
}
if (id === "sukuk") {
return (
<span
title={`${p.nameAr} — ${p.descriptorAr}`}
style={{ height: mark + 8 }}
className={cn(
"inline-flex shrink-0 items-center rounded-lg border border-line bg-white px-2.5",
className,
)}
>
<img src={p.mark} alt={p.nameAr} style={{ height: size === "sm" ? 13 : 15 }} className="w-auto" draggable={false} />
</span>
);
}
return (
<span
title={`${p.nameAr} — ${p.descriptorAr}`}
style={{ height: mark + 8 }}
className={cn(
"inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white pl-2.5 pr-[3px]",
className,
)}
>
<PlatformMark id={id} size={mark} className="border-0" />
<span
className={cn(
"font-semibold leading-none text-mute-100",
size === "sm" ? "text-[11.5px]" : "text-[12.5px]",
)}
>
{p.nameAr}
</span>
</span>
);
}
export function PlatformOriginLine({ id }: { id: PlatformId }) {
const p = platforms[id];
return (
<div className="flex items-center gap-3">
<span className="grid h-11 shrink-0 place-items-center rounded-lg border border-line bg-white px-2.5">
<PlatformLogo id={id} height={id === "jiad" ? 24 : 26} />
</span>
<div className="leading-tight">
<p className="text-[11px] text-mute-400">منصة الإصدار</p>
<p className="mt-0.5 text-[13.5px] font-semibold text-ink">{p.nameAr}</p>
</div>
</div>
);
}
