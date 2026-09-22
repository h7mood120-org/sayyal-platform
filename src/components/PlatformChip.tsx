"use client";

import React from "react";
import { platforms } from "@/data/platforms";
import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * بطاقة نصية أنيقة تمثل "المنصة الأصلية للاستثمار".
 * الشعارات الرسمية غير متوفرة داخل النموذج التجريبي، لذلك تُستخدم هذه البطاقة كعنصر نائب
 * ولا يُدّعى أنها الشعار الرسمي لأي منصة.
 */
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
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${p.accent}22, ${p.accent}0A)`,
        borderColor: `${p.accent}38`,
        color: p.accent,
        fontSize: size * 0.46,
      }}
      className={cn(
        "grid shrink-0 place-items-center rounded-[9px] border font-bold leading-none",
        className,
      )}
    >
      {p.monogram}
    </span>
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
  const mark = size === "sm" ? 18 : 22;
  return (
    <span
      title={`${p.nameAr} — ${p.descriptorAr} (عنصر نائب تجريبي، ليس الشعار الرسمي)`}
      style={{ borderColor: `${p.accent}2E`, background: `${p.accent}0E` }}
      className={cn(
        "inline-flex items-center gap-2 rounded-[10px] border py-1 pl-2.5 pr-1.5",
        className,
      )}
    >
      <PlatformMark id={id} size={mark} />
      {showLabel && (
        <span
          style={{ color: p.accent }}
          className={cn("font-semibold leading-none", size === "sm" ? "text-[11.5px]" : "text-[12.5px]")}
        >
          {p.nameAr}
        </span>
      )}
    </span>
  );
}

export function PlatformOriginLine({ id }: { id: PlatformId }) {
  const p = platforms[id];
  return (
    <div className="flex items-center gap-2.5">
      <PlatformMark id={id} size={34} />
      <div className="leading-tight">
        <p className="text-[10.5px] text-mute-400">منصة الإصدار</p>
        <p className="text-[13.5px] font-semibold text-white">{p.nameAr}</p>
      </div>
    </div>
  );
}
