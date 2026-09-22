"use client";

import React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Clock3, Droplets, TrendingUp, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { Panel, EmptyState, AnimatedNumber } from "@/components/ui";
import { SayyalMark } from "@/components/Logo";
import { money, pct, months, SAR } from "@/lib/format";
import { PlatformChip } from "@/components/PlatformChip";

export default function SummaryPage() {
  const { lastDeal, users } = useStore();

  if (!lastDeal) {
    return (
      <div className="pt-10">
        <EmptyState
          icon={<Sparkles className="size-5" />}
          title="لم تكتمل أي صفقة بعد"
          body="نفّذ رحلة العرض: اعرض استثمارًا للتخارج من حساب محمد، ثم انتقل إلى سارة واشترِ العرض من سوق سيّال."
          action={
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link href="/portfolio" className="btn-primary px-4 py-2.5">ابدأ من محفظة محمد</Link>
              <Link href="/market" className="btn-ghost px-4 py-2.5">سوق سيّال</Link>
            </div>
          }
        />
      </div>
    );
  }

  const seller = users[lastDeal.sellerId];
  const buyer = users[lastDeal.buyerId];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-1/2 top-[-120px] size-[560px] -translate-x-1/2 rounded-full bg-brand-500/[0.07] blur-[110px]" />

      <div className="relative mx-auto max-w-[1080px] py-6">
        <div className="mb-10 text-center animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/25 bg-brand-500/[0.09] px-2.5 py-1 text-[11px] font-semibold text-brand-300">
            <Sparkles className="size-3.5" />
            ملخص العرض التجريبي
          </span>
          <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-white sm:text-[30px]">
            صفقة واحدة. طرفان مستفيدان.
          </h1>
          <p className="mt-2 text-[13.5px] text-mute-400">
            <span className="ltr">{lastDeal.txRef}</span> · {lastDeal.at}
          </p>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
          {/* Seller */}
          <Panel className="relative animate-fade-up overflow-hidden p-7">
            <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-brand-500/[0.09] blur-3xl" />
            <div className="relative flex items-center gap-3">
              <span
                className="grid size-11 place-items-center rounded-xl text-[15px] font-extrabold text-[#04120C]"
                style={{ background: seller.accent }}
              >
                {seller.initials}
              </span>
              <div>
                <p className="text-[16px] font-extrabold tracking-tight text-white">
                  {seller.nameAr.split(" ")[0]}
                </p>
                <p className="text-[11.5px] text-mute-400">البائع</p>
              </div>
            </div>

            <div className="relative mt-7">
              <p className="text-[12.5px] text-mute-400">كان لديه استثمار بقيمة</p>
              <p className="mt-2 text-[40px] font-extrabold leading-none tracking-tight text-mute-200">
                <AnimatedNumber value={lastDeal.faceValue} />
                <span className="mr-2 text-[15px] font-semibold text-mute-500">{SAR}</span>
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-mute-300">
                <Clock3 className="size-3.5" />
                متبقٍ له <span className="num font-semibold text-white">{months(lastDeal.remainingMonths)}</span>
              </p>
            </div>

            <div className="relative my-6 flex justify-center">
              <span className="grid size-9 place-items-center rounded-full border border-brand-500/30 bg-brand-500/[0.1]">
                <ArrowDown className="size-4 text-brand-400" />
              </span>
            </div>

            <div className="relative rounded-2xl border border-brand-500/25 bg-brand-500/[0.07] p-5">
              <p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-200">
                <Droplets className="size-3.5" />
                حصل على
              </p>
              <p className="mt-2 text-[42px] font-extrabold leading-none tracking-tight text-white">
                <AnimatedNumber value={lastDeal.price} />
                <span className="mr-2 text-[15px] font-semibold text-mute-300">{SAR}</span>
              </p>
              <p className="mt-2.5 text-[13.5px] font-semibold text-brand-300">سيولة اليوم</p>
              <p className="mt-1 text-[11.5px] text-mute-400">
                بدل انتظار <span className="num">{months(lastDeal.remainingMonths)}</span> حتى الاستحقاق
              </p>
            </div>
          </Panel>

          {/* Center brand */}
          <div className="flex animate-fade-up flex-col items-center justify-center gap-4 py-2 lg:w-[180px]">
            <div className="hidden h-full w-px bg-gradient-to-b from-transparent via-white/[0.09] to-transparent lg:block" />
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/[0.08] bg-[#0B0F11] px-7 py-8 shadow-lift">
              <SayyalMark size={44} />
              <p className="text-[20px] font-extrabold tracking-tight text-white">سيّال</p>
              <p className="text-[9.5px] font-semibold tracking-[0.24em] text-mute-500">SAYYAL</p>
              <div className="mt-1 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-1">
                <p className="num text-[11px] font-semibold text-mute-300">
                  {pct(lastDeal.discount)} خصم
                </p>
              </div>
            </div>
            <div className="hidden h-full w-px bg-gradient-to-b from-transparent via-white/[0.09] to-transparent lg:block" />
          </div>

          {/* Buyer */}
          <Panel className="relative animate-fade-up overflow-hidden p-7">
            <div className="pointer-events-none absolute -left-16 -top-16 size-44 rounded-full bg-teal-500/[0.09] blur-3xl" />
            <div className="relative flex items-center gap-3">
              <span
                className="grid size-11 place-items-center rounded-xl text-[15px] font-extrabold text-[#04120C]"
                style={{ background: buyer.accent }}
              >
                {buyer.initials}
              </span>
              <div>
                <p className="text-[16px] font-extrabold tracking-tight text-white">
                  {buyer.nameAr.split(" ")[0]}
                </p>
                <p className="text-[11.5px] text-mute-400">المشترية</p>
              </div>
            </div>

            <div className="relative mt-7">
              <p className="text-[12.5px] text-mute-400">حصلت على فرصة استثمارية قائمة</p>
              <p className="mt-3 text-[19px] font-extrabold tracking-tight text-white">{lastDeal.issuer}</p>
              <p className="mt-2 text-[12px] text-mute-400">
                دخلت بسعر <span className="num font-semibold text-white">{money(lastDeal.price)}</span> على
                قيمة اسمية <span className="num font-semibold text-white">{money(lastDeal.faceValue)}</span>
              </p>
            </div>

            <div className="relative my-6 flex justify-center">
              <span className="grid size-9 place-items-center rounded-full border border-teal-500/30 bg-teal-500/[0.1]">
                <ArrowDown className="size-4 text-teal-400" />
              </span>
            </div>

            <div className="relative rounded-2xl border border-teal-500/25 bg-teal-500/[0.07] p-5">
              <p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-teal-300">
                <TrendingUp className="size-3.5" />
                بعائد تقديري أعلى
              </p>
              <p className="mt-2 text-[42px] font-extrabold leading-none tracking-tight text-white">
                <AnimatedNumber value={lastDeal.buyerReturn} decimals={1} />
                <span className="mr-1 text-[20px] font-bold text-mute-300">%</span>
              </p>
              <p className="mt-2.5 text-[13.5px] font-semibold text-teal-300">
                دون انتظار الإصدار القادم
              </p>
              <p className="mt-1 text-[11.5px] text-mute-400">
                توزيعات تبدأ من الدورة القادمة — <span className="num">{months(lastDeal.remainingMonths)}</span> حتى الاستحقاق
              </p>
            </div>
          </Panel>
        </div>

        {/* Statement */}
        <div className="relative mt-12 animate-fade-up text-center">
          <h2 className="text-[34px] font-extrabold leading-tight tracking-tight text-white sm:text-[46px]">
            رأس المال لا يتوقف. ينتقل.
          </h2>
          <p className="mt-4 text-[15px] text-mute-300 sm:text-[17px]">
            طبقة سيولة للاستثمارات غير المدرجة.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/market" className="btn-primary px-5 py-3">
              العودة إلى السوق
              <ArrowUpRight className="size-4" />
            </Link>
            <Link href="/portfolio" className="btn-ghost px-5 py-3">
              عرض المحافظ
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-[11.5px] text-mute-500">تكامل مع منصات الإصدار:</span>
            <PlatformChip id="sukuk" size="sm" />
            <PlatformChip id="aseel" size="sm" />
            <PlatformChip id="jiad" size="sm" />
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
