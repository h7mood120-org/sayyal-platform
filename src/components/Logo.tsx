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
      <defs>
        <linearGradient id="sy-g" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2ECB95" />
          <stop offset="1" stopColor="#1FB8B5" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#0B1012" stroke="url(#sy-g)" strokeOpacity="0.45" strokeWidth="1.2" />
      <path
        d="M11 25.5c2.6 0 3.4-2.4 4.6-5.2 1.3-3 2.3-5.8 4.9-5.8s3.6 2.8 4.9 5.8c1.2 2.8 2 5.2 4.6 5.2"
        stroke="url(#sy-g)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="29" cy="25.5" r="2.4" fill="#2ECB95" />
    </svg>
  );
}

export function SayyalLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <SayyalMark size={30} />
      {!compact && (
        <div className="leading-none">
          <div className="text-[17px] font-extrabold tracking-tight text-white">سيّال</div>
          <div className="mt-[3px] text-[9.5px] font-semibold tracking-[0.22em] text-mute-400">
            SAYYAL
          </div>
        </div>
      )}
    </div>
  );
}
