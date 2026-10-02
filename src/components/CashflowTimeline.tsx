"use client";
import React from "react";
import type { Distribution } from "@/lib/types";
import { money } from "@/lib/format";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
export function CashflowTimeline({ items }: { items: Distribution[] }) {
if (items.length === 0) {
return (
<p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[12.5px] text-mute-400">
جدول التوزيعات يُحدَّث من منصة الإصدار بعد اكتمال نقل الملكية.
</p>
);
}
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
<div key={d.id} className="group/bar relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
<span className="pointer-events-none absolute -top-1 z-20 -translate-y-full whitespace-nowrap rounded-lg border border-[#D5DCE5] bg-white px-2 py-1 text-[10.5px] font-semibold text-ink hidden shadow-lift group-hover/bar:block">
<span className="num">{money(d.amount)}</span> · {d.date}
{isFinal && " · تشمل رد أصل المبلغ"}
</span>
<div
style={{ height: `${h}%` }}
className={cn(
"w-full rounded-t-[3px] transition-colors",
paid
? "bg-ink/[0.10] group-hover/bar:bg-ink/[0.10]"
: isFinal
? "bg-ink"
: "bg-brand-500 group-hover/bar:bg-brand-600",
)}
/>
</div>
);
})}
</div>
<div className="mt-2 flex gap-1.5 sm:gap-2">
{items.map((d) => (
<div key={d.id} className="min-w-0 flex-1 text-center">
<p className="truncate text-[9.5px] leading-tight text-mute-500">{d.date.split(" ")[0]}</p>
</div>
))}
</div>
<div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3.5 text-[11.5px]">
<span className="inline-flex items-center gap-1.5 text-mute-400">
<span className="size-2.5 rounded-[3px] bg-ink/[0.10]" />
<Check className="size-3" /> توزيعات مصروفة
</span>
<span className="inline-flex items-center gap-1.5 text-mute-400">
<span className="size-2.5 rounded-[3px] bg-brand-500" />
توزيعات مستحقة مستقبلًا
</span>
<span className="inline-flex items-center gap-1.5 text-mute-400">
<span className="size-2.5 rounded-[3px] bg-ink" />
الدفعة الأخيرة تشمل رد أصل المبلغ
</span>
</div>
</div>
);
}
