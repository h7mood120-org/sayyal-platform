"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Zap, TrendingUp, Info, ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import { Breadcrumb } from "@/components/Shell";
import { Panel, Modal, Tooltip, RiskBadge, EmptyState, AnimatedNumber } from "@/components/ui";
import { PlatformChip } from "@/components/PlatformChip";
import {
money, pct, months, SAR, discountPct, fmt, positionValuation, todayISO, unitsLabel, unitsNoun, buyerReturnFromValuation,
} from "@/lib/format";
import { cn } from "@/lib/utils";
export default function SellOrderPage() {
const { id } = useParams<{ id: string }>();
const router = useRouter();
const { investments, persona, dispatch, toast, listings } = useStore();
const inv = investments.find((i) => i.id === id);
const totalUnits = inv ? Math.round(inv.principal / inv.unitPrice) : 0;
const [valuationDate] = useState(todayISO);
const valueOf = (u: number) => (inv ? positionValuation(inv, u, valuationDate) : null);
const [units, setUnits] = useState(totalUnits);
const [price, setPrice] = useState<number>(() => Math.round(valueOf(totalUnits)?.value ?? 0));
const [priceText, setPriceText] = useState<string>(() => fmt(Math.round(valueOf(totalUnits)?.value ?? 0)));
const [done, setDone] = useState(false);
const [newListingId, setNewListingId] = useState<string | null>(null);
const face = inv ? units * inv.unitPrice : 0;
const val = valueOf(units);
const derived = useMemo(() => {
if (!inv) return null;
const disc = discountPct(face, price);
const buyerReturn = buyerReturnFromValuation(val!, price);
return { disc, buyerReturn, fees: 0, net: price };
}, [inv, face, price, val]);
if (!inv) {
return (
<EmptyState
icon={<ShieldAlert className="size-5" />}
title="الاستثمار غير متاح"
body="ربما تمت إعادة ضبط العرض التجريبي."
action={<Link href="/portfolio" className="btn-primary px-4 py-2.5">العودة للمحفظة</Link>}
/>
);
}
const minPrice = Math.ceil(val!.lower);
const maxPrice = Math.floor(val!.upper);
const fairPrice = Math.round(val!.value);
const speedPct = maxPrice === minPrice ? 0 : ((maxPrice - price) / (maxPrice - minPrice)) * 100;
const setPriceSafe = (v: number) => {
const clamped = Math.max(minPrice, Math.min(maxPrice, Math.round(v)));
setPrice(clamped);
setPriceText(fmt(clamped));
};
const publish = () => {
dispatch({ type: "CREATE_LISTING", investmentId: inv.id, askingPrice: price, units });
setDone(true);
};
const justListed = useMemo(
() => listings.find((l) => l.investmentId === inv.id && l.status === "open"),
[listings, inv.id],
);
if (done && justListed && newListingId !== justListed.id) setNewListingId(justListed.id);
return (
<div>
<Breadcrumb
items={[
{ label: "الرئيسية", href: "/" },
{ label: "محفظتي", href: "/portfolio" },
{ label: inv.issuer, href: `/investment/${inv.id}` },
{ label: "إنشاء عرض تخارج" },
]}
/>
<div className="mb-7">
<h1 className="text-[28px] font-bold text-ink sm:text-[32px]">
إنشاء عرض تخارج
</h1>
<p className="mt-2 text-[14.5px] text-mute-300">
حدد سعر التخارج ودع السوق يقوم بالباقي.
</p>
</div>
<div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.82fr_1fr] lg:items-start">
<div className="space-y-5 lg:sticky lg:top-[86px]">
<Panel className="p-6">
<div className="mb-4 flex items-start justify-between gap-3">
<div className="min-w-0">
<h3 className="truncate text-[17px] font-bold text-ink">{inv.issuer}</h3>
<p className="mt-1 text-[12px] text-mute-400">{inv.issuerSub}</p>
</div>
<PlatformChip id={inv.platform} size="sm" />
</div>
<div className="space-y-0.5">
{[
{ k: "القيمة الاسمية", v: money(inv.principal) },
{ k: `عدد ${unitsNoun(inv.assetType)}`, v: unitsLabel(totalUnits, inv.assetType) },
{ k: "القيمة الاسمية للوحدة", v: money(inv.unitPrice) },
{ k: "المتبقي حتى الاستحقاق", v: months(inv.remainingMonths) },
{ k: "العائد", v: pct(inv.expectedReturn) },
{ k: "الدفعات المتبقية", v: String(inv.remainingPayments) },
].map((r) => (
<div
key={r.k}
className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
>
<span className="text-[12.5px] text-mute-400">{r.k}</span>
<span className="num text-[13.5px] font-bold text-ink">{r.v}</span>
</div>
))}
<div className="flex items-center justify-between pt-3">
<span className="text-[12.5px] text-mute-400">مستوى المخاطر</span>
<RiskBadge risk={inv.risk} />
</div>
</div>
</Panel>
<Panel className="p-5">
<div className="flex items-start gap-2.5">
<Info className="mt-0.5 size-4 shrink-0 text-mute-400" />
<p className="text-[12px] leading-relaxed text-mute-400">
سيّال لا تحتفظ بالأصل ولا تنقل الملكية بنفسها. عند قبول العرض يُرسل طلب نقل الملكية
إلى الجهة المرخصة المشغّلة للإصدار، وتتم التسوية من خلالها.
</p>
</div>
</Panel>
</div>
<div className="space-y-5">
<Panel className="p-6">
<div className="flex items-end justify-between">
<div>
<h2 className="text-[16px] font-bold text-ink">كم تريد أن تبيع؟</h2>
<p className="mt-1 text-[12.5px] text-mute-400">
اختر عدد {unitsNoun(inv.assetType)} التي تريد بيعها من أصل {unitsLabel(totalUnits, inv.assetType)}.
</p>
</div>
<div className="text-left">
<p className="text-[24px] font-bold leading-none text-ink">
<span className="num">{unitsLabel(units, inv.assetType)}</span>
</p>
<p className="mt-1.5 text-[12.5px] text-mute-400">
<span className="num">{money(face)}</span>
</p>
</div>
</div>
<input
type="range"
min={1}
max={totalUnits}
step={1}
value={units}
aria-label={`عدد ${unitsNoun(inv.assetType)}`}
disabled={totalUnits <= 1}
onChange={(e) => {
const v = Number(e.target.value);
setUnits(v);
const next = valueOf(v)!;
const ratio = price / val!.value || 1;
const clamped = Math.max(Math.ceil(next.lower), Math.min(Math.floor(next.upper), Math.round(next.value * ratio)));
setPrice(clamped);
setPriceText(fmt(clamped));
}}
style={{ backgroundSize: `${totalUnits <= 1 ? 100 : ((units - 1) / (totalUnits - 1)) * 100}% 100%` }}
className="range mt-5 w-full"
/>
<div dir="ltr" className="mt-2 flex justify-between text-[11px] text-mute-500">
<span className="num">1</span>
<span className="num">{fmt(totalUnits)}</span>
</div>
</Panel>
<Panel className="p-6">
<h2 className="text-[16px] font-bold text-ink">سعر العرض</h2>
<p className="mt-1 text-[12.5px] text-mute-400">
السعر الذي ترغب في التخارج به اليوم، ضمن ±10% من قيمة {unitsNoun(inv.assetType)} في تاريخ التقييم.
كلما انخفض السعر، زادت سرعة البيع.
</p>
<div className="mt-4 space-y-0.5 rounded-2xl border border-line bg-canvas px-4 py-2">
{[
{ k: "الأيام المنقضية", v: <><span className="num">{fmt(val!.elapsedDays)}</span> من <span className="num">{fmt(val!.termDays)}</span> يومًا</> },
{ k: "الربح المستحق منذ البدء", v: <span className="num">{money(Math.round(val!.grossAccruedProfit))}</span> },
{ k: "الأرباح الموزعة سابقًا", v: <span className="num">− {money(Math.round(val!.paidProfit))}</span> },
{ k: "القيمة في تاريخ التقييم", v: <span className="num">{money(fairPrice)}</span> },
{ k: "نطاق سعر العرض", v: <span className="num">{money(minPrice)} – {money(maxPrice)}</span> },
{ k: "الأصل والأرباح المتبقية حتى الاستحقاق", v: <span className="num">{money(Math.round(val!.remainingPayout))}</span> },
].map((r) => (
<div key={r.k} className="flex items-center justify-between border-b border-line py-2 last:border-0">
<span className="text-[12px] text-mute-400">{r.k}</span>
<span className="text-[13px] font-bold text-ink">{r.v}</span>
</div>
))}
</div>
<div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-line bg-white px-4 py-3.5 transition focus-within:border-brand-200 focus-within:ring-2 focus-within:ring-brand-500/15">
<input
value={priceText}
inputMode="numeric"
aria-label="سعر العرض"
onChange={(e) => {
const raw = e.target.value.replace(/[^\d]/g, "");
setPriceText(raw ? fmt(Number(raw)) : "");
if (raw) setPrice(Math.max(minPrice, Math.min(maxPrice, Number(raw))));
}}
onBlur={() => setPriceSafe(Number(priceText.replace(/[^\d]/g, "") || price))}
className="num w-full bg-transparent text-[30px] font-bold text-ink outline-none"
/>
<span className="shrink-0 text-[15px] font-semibold text-mute-400">{SAR}</span>
</div>
<input
type="range"
min={minPrice}
max={maxPrice}
step={1}
value={price}
aria-label="شريط سعر العرض"
onChange={(e) => setPriceSafe(Number(e.target.value))}
style={{
backgroundSize: `${
maxPrice === minPrice ? 100 : ((price - minPrice) / (maxPrice - minPrice)) * 100
}% 100%`,
}}
className="range mt-5 w-full"
/>
<div dir="ltr" className="mt-3 flex items-center justify-between text-[11.5px]">
<span className="inline-flex items-center gap-1.5 font-semibold text-navy-400">
<Zap className="size-3.5" />
بيع أسرع
</span>
<span dir="rtl" className="text-mute-500">
<span className="num">{speedPct.toFixed(0)}%</span> نحو سرعة البيع
</span>
<span className="inline-flex items-center gap-1.5 font-semibold text-brand-700">
سعر أعلى
<TrendingUp className="size-3.5" />
</span>
</div>
<div className="mt-4 flex flex-wrap gap-2">
{[-10, -5, 0, 5, 10].map((d) => {
const target = Math.min(maxPrice, Math.max(minPrice, Math.round(fairPrice * (1 + d / 100))));
const active = price === target;
return (
<button
key={d}
onClick={() => setPriceSafe(target)}
className={cn(
"rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition",
active
? "border-brand-200 bg-brand-50 text-brand-700"
: "border-line bg-canvas text-mute-300 hover:border-[#C2CBD7] hover:text-ink",
)}
>
{d === 0 ? "القيمة الحالية" : <>{d < 0 ? "خصم" : "علاوة"} <span className="num">{Math.abs(d)}%</span></>}
</button>
);
})}
</div>
</Panel>
<Panel className="p-6">
<h2 className="mb-4 text-[16px] font-bold text-ink">ملخص العرض</h2>
<div className="space-y-0.5">
{[
{
k: derived!.disc < 0 ? "العلاوة على القيمة الاسمية" : "الخصم عن القيمة الاسمية",
v: <span className="num text-navy-400">{pct(Math.abs(derived!.disc))}</span>,
},
{
k: "العائد التقديري للمشتري",
v: <span className="num text-brand-700">{pct(derived!.buyerReturn)}</span>,
hint: "تقدير = (الأصل والأرباح المتبقية حتى الاستحقاق − سعر العرض) ÷ سعر العرض، مُسنوَنًا على المدة المتبقية.",
},
{
k: "المبلغ الذي ستحصل عليه",
v: <span className="num">{money(price)}</span>,
},
{
k: "رسوم المنصة",
v: <span className="num text-mute-300">0 {SAR}</span>,
hint: "لا تُحتسب رسوم داخل النموذج التجريبي.",
},
].map((row) => (
<div
key={row.k}
className="flex items-center justify-between border-b border-line py-3 last:border-0"
>
<span className="inline-flex items-center gap-1.5 text-[13px] text-mute-300">
{row.k}
{row.hint && <Tooltip text={row.hint} />}
</span>
<span className="text-[14.5px] font-bold text-ink">{row.v}</span>
</div>
))}
</div>
<div className="mt-4 flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3.5">
<span className="text-[13.5px] font-semibold text-brand-700">صافي التسوية</span>
<span className="text-[22px] font-bold text-ink">
<AnimatedNumber value={price} /> <span className="text-[14px] text-mute-300">{SAR}</span>
</span>
</div>
<button onClick={publish} className="btn-primary mt-5 w-full py-3.5 text-[15px]">
نشر العرض في سوق سيّال
</button>
<p className="mt-3 text-center text-[11px] leading-relaxed text-mute-500">
بالنشر، يصبح المركز معروضًا للمستثمرين المؤهلين. تتم التسوية ونقل الملكية عبر الجهة
المرخصة بعد قبول العرض.
</p>
</Panel>
</div>
</div>
<Modal open={done} onClose={() => router.push("/orders")} dismissable={false} className="max-w-md">
<div className="p-8 text-center">
<div className="relative mx-auto mb-5 grid size-16 place-items-center">
<span className="relative grid size-16 place-items-center rounded-full border border-brand-200 bg-brand-50">
<CheckCircle2 className="size-8 text-brand-600" />
</span>
</div>
<h3 className="text-[22px] font-bold text-ink">تم نشر عرضك</h3>
<p className="mt-2.5 text-[14px] leading-relaxed text-mute-300">
أصبح استثمارك متاحًا للمستثمرين في سوق سيّال.
</p>
<div className="mt-6 rounded-2xl border border-line bg-canvas p-4 text-right">
{[
{ k: "الأصل", v: inv.issuer },
{ k: "سعر العرض", v: money(price) },
{ k: `عدد ${unitsNoun(inv.assetType)}`, v: unitsLabel(units, inv.assetType) },
{ k: derived!.disc < 0 ? "العلاوة" : "الخصم", v: pct(Math.abs(derived!.disc)) },
{ k: "العائد التقديري للمشتري", v: pct(derived!.buyerReturn) },
].map((r) => (
<div
key={r.k}
className="flex items-center justify-between border-b border-line py-2 last:border-0"
>
<span className="text-[12px] text-mute-400">{r.k}</span>
<span className="text-[13px] font-bold text-ink">{r.v}</span>
</div>
))}
</div>
<div className="mt-6 flex flex-col gap-2.5">
<button
className="btn-primary w-full py-3"
onClick={() => {
toast({
title: "عرضك منشور في السوق",
body: "أصبح عرضك متاحًا للمستثمرين في سوق سيّال.",
tone: "success",
});
router.push(newListingId ? `/market/${newListingId}` : "/market");
}}
>
مشاهدة العرض
</button>
<button className="btn-ghost w-full py-3" onClick={() => router.push("/orders")}>
إدارة أوامري
</button>
</div>
</div>
</Modal>
</div>
);
}
