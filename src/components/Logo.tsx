import React from "react";
import { cn } from "@/lib/utils";
export function SayyalMark({ size = 30, className }: { size?: number; className?: string }) {
return (
<svg
width={size}
height={size}
viewBox="0 0 40 40"
fill="none"
aria-hidden
className={cn("shrink-0", className)}
>
<rect width="40" height="40" rx="9" fill="#0B1F33" />
<path
d="M10 25.5c2.8 0 3.7-2.5 5-5.4 1.4-3.1 2.4-6 5-6s3.6 2.9 5 6c1.3 2.9 2.2 5.4 5 5.4"
stroke="#10B77F"
strokeWidth="2.6"
strokeLinecap="round"
/>
</svg>
);
}
export function SayyalLogo({ compact = false }: { compact?: boolean }) {
return (
<div className="flex items-center gap-2.5">
<SayyalMark size={32} />
{!compact && (
<div className="leading-none">
<div className="text-[18px] font-bold text-ink">سيّال</div>
<div className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-mute-400">SAYYAL</div>
</div>
)}
</div>
);
}
