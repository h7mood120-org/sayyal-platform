"use client";

import React from "react";
import type { Distribution } from "@/lib/types";
import { money } from "@/lib/format";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CashflowTimeline({ items }: { items: Distribution[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-6 text-center text-[12.5px] text-mute-400">
        جدول التوزيعات يُحدَّث من منصة الإصدار بعد اكتمال نقل الملكية.
      </p>
    );
  }
  /* آخر توزيعة تشمل رد أصل المبلغ، لذا تُقاس على محور منفصل حتى تبقى
     توزيعات الأرباح مقروءة بدل أن تنضغط إلى خط أفقي. */
  const coupons = items.slice(0, -1);
  const couponMax = Math.max(1, ...coupons.map((i) => i.amount));

  return (
    <div>
      <div className="flex items-stretch gap-1.5 sm:gap-2" style={{ height: 118 }}>
        {items.map((d, i) => {
          const isFinal = i === items.length - 1;
          const h = isFinal ? 100 : Math.max(16, (d.amount / couponMax) * 54);
          const paid = d.status === "paid";
          return (
            <div key={d.id} className="group/bar relative flex h-full flex-1 flex-col items-center justify-end">
              <span className="pointer-events-none absolute -top-1 z-20 -translate-y-full whitespace-nowrap rounded-lg border border-white/10 bg-[#141A1D] px-2 py-1 text-[10.5px] font-semibold text-white opacity-0 shadow-lift transition group-hover/bar:opacity-100">
                <span className="num">{money(d.amount)}</span> · {d.date}
                {isFinal && " · تشمل رد أصل المبلغ"}
              </span>
              <div
                style={{ height: `${h}%`, animationDelay: `${i * 40}ms` }}
                className={cn(
                  "w-full animate-fade-up rounded-t-[5px] transition-all duration-300",
                  paid
                    ? "bg-white/[0.11] group-hover/bar:bg-white/[0.16]"
                    : isFinal
                    ? "bg-gradient-to-t from-brand-700/80 via-brand-500 to-teal-400"
                    : "bg-gradient-to-t from-brand-600/70 to-brand-400 group-hover/bar:from-brand-500",
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {items.map((d) => (
          <div key={d.id} className="flex-1 text-center">
            <p className="truncate text-[9.5px] leading-tight text-mute-500">{d.date.split(" ")[0]}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/[0.05] pt-3.5 text-[11.5px]">
        <span className="inline-flex items-center gap-1.5 text-mute-400">
          <span className="size-2.5 rounded-[3px] bg-white/[0.12]" />
          <Check className="size-3" /> توزيعات مصروفة
        </span>
        <span className="inline-flex items-center gap-1.5 text-mute-400">
          <span className="size-2.5 rounded-[3px] bg-brand-400" />
          توزيعات مستحقة مستقبلًا
        </span>
        <span className="inline-flex items-center gap-1.5 text-mute-400">
          <span className="size-2.5 rounded-[3px] bg-gradient-to-t from-brand-700 to-teal-400" />
          الدفعة الأخيرة تشمل رد أصل المبلغ
        </span>
      </div>
    </div>
  );
}
