"use client";
import React from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeftRight, Clock3, Droplets, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { Panel, EmptyState, AnimatedNumber } from "@/components/ui";
import { SayyalMark } from "@/components/Logo";
import { money, pct, months, SAR } from "@/lib/format";
import { PlatformLogo } from "@/components/PlatformChip";
export default function SummaryPage() {
const { lastDeal, users } = useStore();
if (!lastDeal) {
return (
<div className="pt-10">
<EmptyState
icon={<ArrowLeftRight className="size-5" />}
title="لم تكتمل أي صفقة بعد"
body="اعرض أحد استثماراتك للتخارج من محفظتك، أو اشترِ فرصة قائمة من سوق سيّال."
action={
<div className="flex flex-wrap justify-center gap-2.5">
<Link href="/portfolio" className="btn-primary px-4 py-2.5">ابدأ من محفظتك</Link>
<Link href="/market" className="btn-ghost px-4 py-2.5">سوق سيّال</Link>
</div>
}
/>
</div>
);
}
const sellerUser = lastDeal.sellerId !== "anon" ? users[lastDeal.sellerId] : undefined;
const seller = sellerUser
? { name: sellerUser.nameAr.split(" ")[0], initials: sellerUser.initials, accent: sellerUser.accent }
: { name: lastDeal.sellerLabel ?? "مستثمر فرد", initials: "م", accent: "#64748B" };
const buyer = users[lastDeal.buyerId];
return (
<div className="relative">
<div className="relative mx-auto max-w-[1080px] py-6">
<div className="mb-10 text-center">
<p className="text-[12.5px] font-semibold text-brand-700">ملخص العرض التجريبي</p>
<h1 className="mt-2 text-[26px] font-bold text-ink sm:text-[30px]">
صفقة واحدة. طرفان مستفيدان.
</h1>
<p className="mt-2 text-[13.5px] text-mute-400">
<span className="ltr">{lastDeal.txRef}</span> · {lastDeal.at}
</p>
</div>
<div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
<Panel className="relative overflow-hidden p-7">
<div className="relative flex items-center gap-3">
<span
className="grid size-11 place-items-center rounded-xl text-[15px] font-bold text-white"
style={{ background: seller.accent }}
>
{seller.initials}
</span>
<div>
<p className="text-[16px] font-bold text-ink">
{seller.name}
</p>
<p className="text-[11.5px] text-mute-400">البائع</p>
</div>
</div>
<div className="relative mt-7">
<p className="text-[12.5px] text-mute-400">كان لديه استثمار بقيمة</p>
<p className="mt-2 text-[40px] font-bold leading-none text-mute-200">
<AnimatedNumber value={lastDeal.faceValue} />
<span className="mr-2 text-[15px] font-semibold text-mute-500">{SAR}</span>
</p>
<p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[12px] text-mute-300">
<Clock3 className="size-3.5" />
متبقٍ له <span className="num font-semibold text-ink">{months(lastDeal.remainingMonths)}</span>
</p>
</div>
<div className="relative my-6 flex justify-center">
<span className="grid size-9 place-items-center rounded-full border border-brand-200 bg-brand-50">
<ArrowDown className="size-4 text-brand-600" />
</span>
</div>
<div className="relative rounded-xl border border-brand-200 bg-brand-50 p-5">
<p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-700">
<Droplets className="size-3.5" />
حصل على
</p>
<p className="mt-2 text-[42px] font-bold leading-none text-ink">
<AnimatedNumber value={lastDeal.price} />
<span className="mr-2 text-[15px] font-semibold text-mute-300">{SAR}</span>
</p>
<p className="mt-2.5 text-[13.5px] font-semibold text-brand-700">سيولة اليوم</p>
<p className="mt-1 text-[11.5px] text-mute-400">
بدل انتظار <span className="num">{months(lastDeal.remainingMonths)}</span> حتى الاستحقاق
</p>
</div>
</Panel>
<div className="flex flex-col items-center justify-center gap-4 py-2 lg:w-[180px]">
<div className="hidden h-full w-px bg-line lg:block" />
<div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-7 py-8">
<SayyalMark size={44} />
<p className="text-[20px] font-bold text-ink">سيّال</p>
<p className="text-[9.5px] font-semibold tracking-[0.2em] text-mute-500">SAYYAL</p>
<div className="mt-1 rounded-lg border border-line bg-canvas px-2.5 py-1">
<p className="num text-[11px] font-semibold text-mute-300">
{pct(lastDeal.discount)} خصم
</p>
</div>
</div>
<div className="hidden h-full w-px bg-line lg:block" />
</div>
<Panel className="relative overflow-hidden p-7">
<div className="relative flex items-center gap-3">
<span
className="grid size-11 place-items-center rounded-xl text-[15px] font-bold text-white"
style={{ background: buyer.accent }}
>
{buyer.initials}
</span>
<div>
<p className="text-[16px] font-bold text-ink">
{buyer.nameAr.split(" ")[0]}
</p>
<p className="text-[11.5px] text-mute-400">المشتري</p>
</div>
</div>
<div className="relative mt-7">
<p className="text-[12.5px] text-mute-400">حصل على فرصة استثمارية قائمة</p>
<p className="mt-3 text-[19px] font-bold text-ink">{lastDeal.issuer}</p>
<p className="mt-2 text-[12px] text-mute-400">
دخل بسعر <span className="num font-semibold text-ink">{money(lastDeal.price)}</span> على
قيمة اسمية <span className="num font-semibold text-ink">{money(lastDeal.faceValue)}</span>
</p>
</div>
<div className="relative my-6 flex justify-center">
<span className="grid size-9 place-items-center rounded-full border border-[#C9D8EA] bg-[#EEF4FB]">
<ArrowDown className="size-4 text-navy-400" />
</span>
</div>
<div className="relative rounded-xl border border-[#C9D8EA] bg-[#EEF4FB] p-5">
<p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-navy-400">
<TrendingUp className="size-3.5" />
بعائد تقديري أعلى
</p>
<p className="mt-2 text-[42px] font-bold leading-none text-ink">
<AnimatedNumber value={lastDeal.buyerReturn} decimals={1} />
<span className="mr-1 text-[20px] font-bold text-mute-300">%</span>
</p>
<p className="mt-2.5 text-[13.5px] font-semibold text-navy-400">
دون انتظار الإصدار القادم
</p>
<p className="mt-1 text-[11.5px] text-mute-400">
توزيعات تبدأ من الدورة القادمة — <span className="num">{months(lastDeal.remainingMonths)}</span> حتى الاستحقاق
</p>
</div>
</Panel>
</div>
<div className="relative mt-12 text-center">
<h2 className="text-[34px] font-bold leading-tight text-ink sm:text-[46px]">
رأس المال لا يتوقف. ينتقل.
</h2>
<p className="mt-4 text-[15px] text-mute-300 sm:text-[17px]">
طبقة سيولة للاستثمارات غير المدرجة.
</p>
<div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
<Link href="/market" className="btn-primary px-5 py-3">
العودة إلى السوق
</Link>
<Link href="/portfolio" className="btn-ghost px-5 py-3">
عرض المحافظ
</Link>
</div>
<div className="mt-10 border-t border-line pt-7">
<p className="text-[12px] text-mute-400">تكامل مع منصات الإصدار</p>
<div className="mt-4 flex flex-wrap items-center justify-center gap-10">
<PlatformLogo id="sukuk" height={40} />
<PlatformLogo id="aseel" height={36} />
<span className="inline-flex items-center gap-2">
<PlatformLogo id="jiad" height={34} />
<span className="text-[17px] font-bold text-[#224F56]">جياد</span>
</span>
</div>
</div>
<p className="mx-auto mt-6 max-w-lg text-[10.5px] leading-relaxed text-mute-500">
نموذج تجريبي لأغراض VentureX — لا تمثل المنصات الظاهرة شراكات فعلية مع سيّال. سيّال طبقة
تقنية وسوق ثانوي تتكامل مع الجهات المرخصة، ولا تحتفظ بالأصل ولا تنقل الملكية بنفسها.
</p>
</div>
</div>
</div>
);
}
