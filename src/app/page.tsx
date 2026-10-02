"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import {
Wallet, ArrowUpRight, Droplets, TrendingUp, Layers, Store, Sparkles, ShieldCheck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Panel, AnimatedNumber, SectionTitle, Skeleton, useBriefLoading, EmptyState, Tooltip } from "@/components/ui";
import { InvestmentCard } from "@/components/cards";
import { SAR, greeting, money, pct } from "@/lib/format";
import { platformList } from "@/data/platforms";
import { PlatformMark } from "@/components/PlatformChip";
import { cn } from "@/lib/utils";
function StatCard({
label, value, suffix, decimals = 0, icon, accent, hint, sub, delay = 0,
}: {
label: string;
value: number;
suffix?: string;
decimals?: number;
icon: React.ReactNode;
accent?: boolean;
hint?: string;
sub?: string;
delay?: number;
}) {
return (
<Panel
hover
className="p-4 sm:p-5"
>
<div className="flex items-start justify-between">
<p className="label inline-flex items-center gap-1.5">
{label}
{hint && <Tooltip text={hint} />}
</p>
<span className={cn("grid size-8 place-items-center rounded-lg", accent ? "bg-brand-50 text-brand-700" : "bg-canvas text-mute-400")}>
{icon}
</span>
</div>
<p
className={cn(
"mt-4 text-[20px] font-bold leading-none sm:text-[26px]",
accent ? "text-brand-700" : "text-ink",
)}
>
<AnimatedNumber value={value} decimals={decimals} />
{suffix && <span className="mr-1.5 text-[14px] font-semibold text-mute-400">{suffix}</span>}
</p>
{sub && <p className="mt-2 text-[11.5px] text-mute-400">{sub}</p>}
</Panel>
);
}
export default function DashboardPage() {
const { me, persona, myInvestments, openListings, ready } = useStore();
const loading = useBriefLoading(380) || !ready;
const active = useMemo(
() => myInvestments.filter((i) => i.status !== "exited"),
[myInvestments],
);
const totals = useMemo(() => {
const total = active.reduce((s, i) => s + i.principal, 0);
const available = active.filter((i) => i.sellable && i.status === "active").reduce((s, i) => s + i.principal, 0);
const weighted = total > 0 ? active.reduce((s, i) => s + i.principal * i.expectedReturn, 0) / total : 0;
return { total, available, weighted, count: active.length };
}, [active]);
const byPlatform = useMemo(() => {
return platformList.map((p) => ({
...p,
value: active.filter((i) => i.platform === p.id).reduce((s, i) => s + i.principal, 0),
}));
}, [active]);
const platformTotal = byPlatform.reduce((s, p) => s + p.value, 0) || 1;
const firstName = me.nameAr.split(" ")[0];
return (
<div className="space-y-9">
<section>
<div className="flex flex-wrap items-end justify-between gap-5">
<div>
<h1 className="text-[30px] font-bold text-ink sm:text-[34px]">
{greeting()}، {firstName}
</h1>
<p className="mt-2 max-w-xl text-[15px] leading-relaxed text-mute-300">
كل استثماراتك. وسيولة عندما تحتاجها.
</p>
</div>
<div className="flex flex-wrap gap-2.5">
<Link href="/market" className="btn-ghost px-4 py-2.5">
<Store className="size-4 text-brand-600" />
سوق سيّال
</Link>
<Link href="/portfolio" className="btn-primary px-4 py-2.5">
محفظتي
</Link>
</div>
</div>
</section>
<section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
{loading ? (
Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[142px]" />)
) : (
<>
<StatCard
label="إجمالي المحفظة"
value={totals.total}
suffix={SAR}
icon={<Wallet className="size-[17px]" />}
sub={`عبر ${platformList.length} منصات استثمارية`}
delay={0}
/>
<StatCard
label="القيمة المتاحة للتخارج"
value={totals.available}
suffix={SAR}
accent
icon={<Droplets className="size-[17px]" />}
hint="مراكز يمكن عرضها للبيع في سوق سيّال اليوم — بعد انتهاء فترة الحظر وصرف أول توزيعة."
sub="قابلة للعرض في السوق الآن"
delay={60}
/>
<StatCard
label="العائد السنوي المتوقع"
value={totals.weighted}
suffix="%"
decimals={1}
icon={<TrendingUp className="size-[17px]" />}
sub="متوسط مرجّح بقيمة المراكز"
delay={120}
/>
<StatCard
label="الاستثمارات النشطة"
value={totals.count}
icon={<Layers className="size-[17px]" />}
sub={`${openListings.length} عرض مفتوح في السوق`}
delay={180}
/>
</>
)}
</section>
<section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
<Panel className="p-6">
<SectionTitle title="التوزيع حسب المنصة" subtitle="مراكزك موزعة على منصات الإصدار الأصلية" />
<div className="space-y-4">
{byPlatform.map((p) => {
const share = (p.value / platformTotal) * 100;
return (
<div key={p.id}>
<div className="mb-2 flex items-center justify-between">
<div className="flex items-center gap-2.5">
<PlatformMark id={p.id} size={32} />
<span className="text-[13.5px] font-semibold text-mute-100">{p.nameAr}</span>
<span className="text-[11.5px] text-mute-500">{p.descriptorAr}</span>
</div>
<div className="flex items-baseline gap-2">
<span className="whitespace-nowrap text-[13.5px] font-bold text-ink">
<span className="num">{money(p.value)}</span>
</span>
<span className="text-[11.5px] text-mute-400">
<span className="num">{share.toFixed(0)}%</span>
</span>
</div>
</div>
<div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.05]">
<div
className="h-full rounded-full transition-[width] duration-700"
style={{ width: `${share}%`, background: p.accent }}
/>
</div>
</div>
);
})}
</div>
<p className="mt-5 border-t border-line pt-4 text-[11px] leading-relaxed text-mute-500">
سيّال طبقة تقنية وسوق ثانوي. لا تحتفظ بالأصل ولا تنفّذ نقل الملكية بنفسها — بل تتكامل مع
الجهات المرخصة التي تُصدر الأصل وتحتفظ به.
</p>
</Panel>
<div className="flex flex-col rounded-2xl bg-ink p-6 text-white">
<p className="text-[12px] font-semibold text-brand-300">سيولة مبكرة</p>
<h3 className="mt-2 text-[20px] font-bold leading-snug">
استثمر طويلًا، دون أن تفقد مرونتك.
</h3>
<p className="mt-2.5 text-[13.5px] leading-relaxed text-white/70">
{persona === "mohammed"
? "اعرض أي مركز للتخارج قبل تاريخ الاستحقاق، وحدّد السعر الذي يناسبك."
: "ادخل في فرص قائمة بالفعل، بدل انتظار الإصدار القادم."}
</p>
<ol className="mt-5 space-y-3 border-t border-white/10 pt-5">
{[
"حدّد سعر التخارج بنفسك",
"يظهر عرضك أمام مستثمرين جاهزين",
"التسوية ونقل الملكية عبر الجهة المرخصة",
].map((t, i) => (
<li key={t} className="flex items-center gap-3">
<span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/20 text-[11.5px] font-semibold">
<span className="num">{i + 1}</span>
</span>
<span className="text-[13px] text-white/85">{t}</span>
</li>
))}
</ol>
<div className="mt-auto pt-6">
<Link
href={persona === "mohammed" ? "/portfolio" : "/market"}
className="btn w-full bg-brand-500 py-3 text-white hover:bg-brand-600"
>
{persona === "mohammed" ? "اختر استثمارًا للتخارج" : "تصفّح سوق سيّال"}
</Link>
</div>
</div>
</section>
<section>
<SectionTitle
title="استثماراتك"
subtitle="من منصات متعددة — في مكان واحد"
action={
<Link href="/portfolio" className="btn-quiet px-2.5 py-1.5 text-[12.5px]">
عرض الكل
</Link>
}
/>
{loading ? (
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[278px]" />)}
</div>
) : active.length === 0 ? (
<EmptyState
icon={<Layers className="size-5" />}
title="لا توجد استثمارات نشطة"
body="ابدأ بتصفّح سوق سيّال والدخول في فرصة قائمة بالفعل."
action={<Link href="/market" className="btn-primary px-4 py-2.5">سوق سيّال</Link>}
/>
) : (
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
{active.slice(0, 6).map((inv) => (
<InvestmentCard key={inv.id} inv={inv} />
))}
</div>
)}
</section>
</div>
);
}
