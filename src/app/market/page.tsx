"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Store, X, ArrowUpDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { Panel, SectionTitle, Skeleton, useBriefLoading, EmptyState, Pill } from "@/components/ui";
import { ListingCard } from "@/components/cards";
import { platformList, platforms } from "@/data/platforms";
import { PlatformMark } from "@/components/PlatformChip";
import { money, pct, assetTypeLabel, riskLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AssetType, PlatformId, RiskLevel } from "@/lib/types";
const TABS: { id: "all" | AssetType; label: string }[] = [
{ id: "all", label: "الكل" },
{ id: "sukuk", label: "صكوك" },
{ id: "realestate", label: "عقاري" },
{ id: "corporate", label: "تمويل شركات" },
];
const SORTS = [
{ id: "return", label: "الأعلى عائدًا" },
{ id: "discount", label: "الأعلى خصمًا" },
{ id: "shortest", label: "الأقصر مدة" },
{ id: "price", label: "الأقل سعرًا" },
{ id: "newest", label: "الأحدث" },
] as const;
export default function MarketPage() {
const { listings, ready } = useStore();
const loading = useBriefLoading(420) || !ready;
const [q, setQ] = useState("");
const [tab, setTab] = useState<"all" | AssetType>("all");
const [platform, setPlatform] = useState<PlatformId | "all">("all");
const [risk, setRisk] = useState<RiskLevel | "all">("all");
const [minReturn, setMinReturn] = useState(0);
const [maxMonths, setMaxMonths] = useState(36);
const [maxPrice, setMaxPrice] = useState(50000);
const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("newest");
const [showFilters, setShowFilters] = useState(true);
const open = useMemo(() => listings.filter((l) => l.status === "open"), [listings]);
const filtered = useMemo(() => {
let out = open.filter((l) => {
if (tab !== "all" && l.assetType !== tab) return false;
if (platform !== "all" && l.platform !== platform) return false;
if (risk !== "all" && l.risk !== risk) return false;
if (l.estimatedBuyerReturn < minReturn) return false;
if (l.remainingMonths > maxMonths) return false;
if (l.askingPrice > maxPrice) return false;
if (q.trim()) {
const needle = q.trim();
if (!l.issuer.includes(needle) && !l.issuerSub.includes(needle) && !platforms[l.platform].nameAr.includes(needle))
return false;
}
return true;
});
out = [...out].sort((a, b) => {
switch (sort) {
case "return": return b.estimatedBuyerReturn - a.estimatedBuyerReturn;
case "discount": return b.discount - a.discount;
case "shortest": return a.remainingMonths - b.remainingMonths;
case "price": return a.askingPrice - b.askingPrice;
default: return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
}
});
return out;
}, [open, tab, platform, risk, minReturn, maxMonths, maxPrice, q, sort]);
const stats = useMemo(() => {
const vol = open.reduce((s, l) => s + l.askingPrice, 0);
const avg = open.length ? open.reduce((s, l) => s + l.estimatedBuyerReturn, 0) / open.length : 0;
const avgDisc = open.length ? open.reduce((s, l) => s + l.discount, 0) / open.length : 0;
return { vol, avg, avgDisc, count: open.length };
}, [open]);
const activeFilters =
(platform !== "all" ? 1 : 0) + (risk !== "all" ? 1 : 0) + (minReturn > 0 ? 1 : 0) +
(maxMonths < 36 ? 1 : 0) + (maxPrice < 50000 ? 1 : 0);
const clearAll = () => {
setPlatform("all"); setRisk("all"); setMinReturn(0); setMaxMonths(36); setMaxPrice(50000); setQ("");
};
return (
<div className="space-y-7">
<section className="space-y-5">
<div>
<h1 className="text-[28px] font-bold text-ink">سوق سيّال</h1>
<p className="mt-1.5 text-[14.5px] leading-relaxed text-mute-300">
فرص استثمارية من مستثمرين يرغبون في التخارج قبل الاستحقاق — ادخل في فرص قائمة بدل انتظار
الإصدار القادم.
</p>
</div>
<div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-4">
{[
{ k: "عروض مفتوحة", v: String(stats.count) },
{ k: "حجم معروض", v: money(stats.vol) },
{ k: "متوسط العائد", v: pct(stats.avg) },
{ k: "متوسط الخصم", v: pct(stats.avgDisc) },
].map((s, i) => (
<div
key={s.k}
className={cn(
"px-5 py-4",
i % 2 === 1 && "border-r border-line",
i >= 2 && "border-t border-line sm:border-t-0",
i === 2 && "sm:border-r",
)}
>
<p className="label">{s.k}</p>
<p className="mt-1 text-[19px] font-bold text-ink">
<span className="num">{s.v}</span>
</p>
</div>
))}
</div>
</section>
<section className="space-y-3">
<div className="flex flex-wrap items-center gap-2.5">
<div className="relative min-w-[220px] flex-1">
<Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-400" />
<input
value={q}
onChange={(e) => setQ(e.target.value)}
placeholder="ابحث عن أصل أو جهة مصدرة أو منصة…"
aria-label="بحث"
className="field pr-10 py-2.5 text-[13.5px]"
/>
{q && (
<button
onClick={() => setQ("")}
aria-label="مسح البحث"
className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-400 hover:text-ink"
>
<X className="size-4" />
</button>
)}
</div>
<div className="relative">
<ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-mute-400" />
<select
value={sort}
onChange={(e) => setSort(e.target.value as typeof sort)}
aria-label="الترتيب"
className="field appearance-none py-2.5 pr-9 text-[13px] [background:#fff]"
>
{SORTS.map((s) => (
<option key={s.id} value={s.id}>{s.label}</option>
))}
</select>
</div>
<button
onClick={() => setShowFilters((f) => !f)}
className={cn("btn-ghost px-3.5 py-2.5 text-[13px]", showFilters && "border-[#C2CBD7] bg-ink/[0.05]")}
>
<SlidersHorizontal className="size-4" />
الفلاتر
{activeFilters > 0 && (
<span className="grid size-5 place-items-center rounded-md bg-brand-500 text-[11px] font-bold text-white">
{activeFilters}
</span>
)}
</button>
</div>
<div className="flex flex-wrap gap-2 border-b border-line pb-0">
{TABS.map((t) => {
const active = tab === t.id;
const count = t.id === "all" ? open.length : open.filter((l) => l.assetType === t.id).length;
return (
<button
key={t.id}
onClick={() => setTab(t.id)}
className={cn(
"relative -mb-px flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-[13.5px] font-semibold transition",
active
? "border-brand-300 text-ink"
: "border-transparent text-mute-400 hover:text-mute-100",
)}
>
{t.label}
<span
className={cn(
"num rounded-md px-1.5 py-[1px] text-[10.5px]",
active ? "bg-brand-50 text-brand-700" : "bg-ink/[0.05] text-mute-400",
)}
>
{count}
</span>
</button>
);
})}
</div>
{showFilters && (
<Panel className="p-5">
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
<div>
<p className="label mb-2.5">المنصة</p>
<div className="flex flex-wrap gap-1.5">
<button
onClick={() => setPlatform("all")}
className={cn(
"rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition",
platform === "all"
? "border-[#C2CBD7] bg-ink/[0.05] text-ink"
: "border-line text-mute-300 hover:text-ink",
)}
>
الكل
</button>
{platformList.map((p) => (
<button
key={p.id}
onClick={() => setPlatform(p.id)}
className={cn(
"inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[12px] font-medium transition",
platform === p.id
? "border-[#C2CBD7] bg-ink/[0.05] text-ink"
: "border-line text-mute-300 hover:text-ink",
)}
>
<PlatformMark id={p.id} size={20} className="border-0 !p-0" />
{p.nameAr}
</button>
))}
</div>
</div>
<div>
<p className="label mb-2.5">مستوى المخاطر</p>
<div className="flex flex-wrap gap-1.5">
{(["all", "low", "medium", "high"] as const).map((r) => (
<button
key={r}
onClick={() => setRisk(r)}
className={cn(
"rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition",
risk === r
? "border-[#C2CBD7] bg-ink/[0.05] text-ink"
: "border-line text-mute-300 hover:text-ink",
)}
>
{r === "all" ? "الكل" : riskLabel[r]}
</button>
))}
</div>
</div>
<div>
<p className="label mb-2.5">
الحد الأدنى للعائد · <span className="num text-brand-700">{pct(minReturn)}</span>
</p>
<input
type="range" min={0} max={16} step={0.5} value={minReturn}
onChange={(e) => setMinReturn(Number(e.target.value))}
style={{ backgroundSize: `${(minReturn / 16) * 100}% 100%` }}
className="range w-full"
aria-label="الحد الأدنى للعائد"
/>
</div>
<div>
<p className="label mb-2.5">
أقصى مدة متبقية · <span className="text-ink"><span className="num">{maxMonths}</span> شهر</span>
</p>
<input
type="range" min={6} max={36} step={1} value={maxMonths}
onChange={(e) => setMaxMonths(Number(e.target.value))}
style={{ backgroundSize: `${((maxMonths - 6) / 30) * 100}% 100%` }}
className="range w-full"
aria-label="أقصى مدة متبقية"
/>
</div>
<div>
<p className="label mb-2.5">
أقصى سعر · <span className="num text-ink">{money(maxPrice)}</span>
</p>
<input
type="range" min={5000} max={50000} step={500} value={maxPrice}
onChange={(e) => setMaxPrice(Number(e.target.value))}
style={{ backgroundSize: `${((maxPrice - 5000) / 45000) * 100}% 100%` }}
className="range w-full"
aria-label="أقصى سعر"
/>
</div>
</div>
{activeFilters > 0 && (
<div className="mt-5 flex items-center justify-between border-t border-line pt-4">
<span className="text-[12px] text-mute-400">
<span className="num">{filtered.length}</span> فرصة مطابقة
</span>
<button onClick={clearAll} className="btn-quiet px-2.5 py-1.5 text-[12.5px]">
<X className="size-3.5" />
مسح الفلاتر
</button>
</div>
)}
</Panel>
)}
</section>
<section>
<SectionTitle
title="الفرص المتاحة"
subtitle="سوق واحد. فرص من منصات متعددة."
action={<Pill tone="brand"><span className="num">{filtered.length}</span> فرصة</Pill>}
/>
{loading ? (
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[330px]" />)}
</div>
) : filtered.length === 0 ? (
<EmptyState
icon={<Search className="size-5" />}
title="لا توجد فرص مطابقة"
body="جرّب توسيع نطاق الفلاتر أو البحث باسم آخر."
action={<button onClick={clearAll} className="btn-ghost px-4 py-2.5">مسح الفلاتر</button>}
/>
) : (
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
{filtered.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
</div>
)}
</section>
<p className="pt-2 text-center text-[11px] text-mute-500">
جميع الفرص والأسماء والأرقام المعروضة بيانات تجريبية داخل نموذج VentureX.
</p>
</div>
);
}
