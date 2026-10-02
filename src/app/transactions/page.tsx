"use client";
import React, { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Receipt, Copy, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Panel, SectionTitle, EmptyState, Pill, Skeleton, useBriefLoading } from "@/components/ui";
import { PlatformChip } from "@/components/PlatformChip";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TxKind } from "@/lib/types";
const KIND_LABEL: Record<TxKind, string> = {
list: "عرض تخارج",
buy: "شراء",
sell: "تخارج",
settlement: "تسوية",
};
const FILTERS: { id: "all" | TxKind; label: string }[] = [
{ id: "all", label: "الكل" },
{ id: "buy", label: "المشتريات" },
{ id: "sell", label: "التخارجات" },
{ id: "list", label: "العروض" },
];
export default function TransactionsPage() {
const { transactions, persona, ready } = useStore();
const loading = useBriefLoading(320) || !ready;
const [filter, setFilter] = useState<"all" | TxKind>("all");
const [copied, setCopied] = useState<string | null>(null);
const mine = useMemo(() => transactions.filter((t) => t.userId === persona), [transactions, persona]);
const shown = useMemo(
() => (filter === "all" ? mine : mine.filter((t) => t.kind === filter)),
[mine, filter],
);
const totals = useMemo(() => {
const inflow = mine.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
const outflow = mine.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);
return { inflow, outflow };
}, [mine]);
const copy = (id: string) => {
try {
navigator.clipboard?.writeText(id);
setCopied(id);
window.setTimeout(() => setCopied(null), 1600);
} catch {
}
};
return (
<div className="space-y-8">
<div className="">
<h1 className="text-[28px] font-bold text-ink sm:text-[32px]">المعاملات</h1>
<p className="mt-2 text-[14.5px] text-mute-300">سجل كامل لعملياتك داخل سيّال.</p>
</div>
<div className="grid gap-4 sm:grid-cols-3">
{[
{ k: "إجمالي الوارد", v: totals.inflow, tone: "brand" as const, icon: <ArrowDownLeft className="size-[17px]" /> },
{ k: "إجمالي الصادر", v: totals.outflow, tone: "plain" as const, icon: <ArrowUpRight className="size-[17px]" /> },
{ k: "عدد العمليات", v: mine.length, tone: "plain" as const, icon: <ArrowLeftRight className="size-[17px]" />, raw: true },
].map((s, i) => (
<Panel key={s.k} className="p-5">
<div className="flex items-start justify-between">
<p className="label">{s.k}</p>
<span
className={cn(
"grid size-8 place-items-center rounded-xl border",
s.tone === "brand"
? "border-brand-200 bg-brand-50 text-brand-700"
: "border-line bg-canvas text-mute-300",
)}
>
{s.icon}
</span>
</div>
<p
className={cn(
"num mt-3 text-[24px] font-bold",
s.tone === "brand" ? "text-brand-700" : "text-ink",
)}
>
{s.raw ? s.v : money(s.v)}
</p>
</Panel>
))}
</div>
<section>
<SectionTitle
title="السجل"
action={
<div className="flex flex-wrap gap-1.5">
{FILTERS.map((f) => (
<button
key={f.id}
onClick={() => setFilter(f.id)}
className={cn(
"rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition",
filter === f.id
? "border-[#C2CBD7] bg-ink/[0.05] text-ink"
: "border-line text-mute-300 hover:text-ink",
)}
>
{f.label}
</button>
))}
</div>
}
/>
{loading ? (
<div className="space-y-2.5">
{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[76px]" />)}
</div>
) : shown.length === 0 ? (
<EmptyState
icon={<Receipt className="size-5" />}
title="لا توجد معاملات"
body="ستظهر هنا عمليات البيع والشراء والتسوية."
/>
) : (
<Panel className="divide-y divide-line overflow-hidden">
{shown.map((t) => (
<div
key={t.id}
className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-canvas"
>
<span
className={cn(
"grid size-9 shrink-0 place-items-center rounded-xl border",
t.direction === "in"
? "border-brand-200 bg-brand-50 text-brand-700"
: t.direction === "out"
? "border-line bg-canvas text-mute-200"
: "border-[#F5D48A] bg-[#FFF6E5] text-warn",
)}
>
{t.direction === "in" ? (
<ArrowDownLeft className="size-[17px]" />
) : t.direction === "out" ? (
<ArrowUpRight className="size-[17px]" />
) : (
<ArrowLeftRight className="size-[17px]" />
)}
</span>
<div className="min-w-[200px] flex-1">
<p className="text-[13.5px] font-semibold text-ink">{t.titleAr}</p>
<p className="mt-0.5 text-[11.5px] text-mute-400">{t.subtitleAr}</p>
</div>
{t.platform && <PlatformChip id={t.platform} size="sm" />}
<span className="chip">{KIND_LABEL[t.kind]}</span>
<button
onClick={() => copy(t.id)}
title="نسخ رقم العملية"
className="chip gap-1.5 transition hover:border-[#C2CBD7] hover:text-ink"
>
{copied === t.id ? <Check className="size-3 text-brand-600" /> : <Copy className="size-3" />}
<span className="ltr">{t.id}</span>
</button>
<div className="mr-auto text-left">
<p
className={cn(
"num text-[15px] font-bold",
t.direction === "in" ? "text-brand-700" : "text-ink",
)}
>
{t.direction === "in" ? "+" : t.direction === "out" ? "−" : ""}
{money(t.amount)}
</p>
<p className="mt-0.5 text-[11px] text-mute-500">{t.at}</p>
</div>
<Pill tone={t.status === "completed" ? "brand" : "warn"}>
{t.status === "completed" ? "مكتملة" : "قيد التنفيذ"}
</Pill>
</div>
))}
</Panel>
)}
</section>
</div>
);
}
