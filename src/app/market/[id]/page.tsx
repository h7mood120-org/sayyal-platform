"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldAlert, TrendingUp, Clock3, CalendarDays, Receipt, Info, ShieldCheck,
  FileCheck2, Wallet, ArrowLeftRight, Landmark, PackageCheck, User2, ArrowUpRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Breadcrumb } from "@/components/Shell";
import { Panel, RiskBadge, Pill, SectionTitle, EmptyState, Tooltip } from "@/components/ui";
import { PlatformChip, PlatformOriginLine } from "@/components/PlatformChip";
import { BuyFlow } from "@/components/BuyFlow";
import { money, pct, months, assetTypeLabel } from "@/lib/format";
import { platforms } from "@/data/platforms";
import { cn } from "@/lib/utils";

const DEAL_STEPS = [
  { t: "تقديم أمر شراء", s: "تسجيل رغبتك في الفرصة", icon: FileCheck2 },
  { t: "حجز المبلغ", s: "حجز مبلغ التسوية لصالح الصفقة", icon: Wallet },
  { t: "التحقق من أهلية الطرفين", s: "فحص أهلية البائع والمشتري", icon: ShieldCheck },
  { t: "إرسال طلب نقل الملكية للجهة المرخصة", s: "سيّال لا تنقل الملكية بنفسها", icon: Landmark },
  { t: "التسوية", s: "تحويل المبلغ إلى محفظة البائع", icon: ArrowLeftRight },
  { t: "ظهور الأصل في محفظتك", s: "تحديث سجل الملكية", icon: PackageCheck },
];

function CashflowBars({ payments, amount }: { payments: number; amount: number }) {
  const bars = Array.from({ length: payments }, (_, i) => i);
  const per = amount / payments;
  return (
    <div>
      <div className="flex items-stretch gap-2" style={{ height: 112 }}>
        {bars.map((i) => {
          const isLast = i === payments - 1;
          const h = isLast ? 100 : 26 + (i / Math.max(1, payments - 1)) * 10;
          return (
            <div key={i} className="group/b relative flex h-full flex-1 flex-col items-center justify-end">
              <span className="pointer-events-none absolute -top-1 z-20 -translate-y-full whitespace-nowrap rounded-lg border border-white/10 bg-[#141A1D] px-2 py-1 text-[10.5px] font-semibold text-white opacity-0 shadow-lift transition group-hover/b:opacity-100">
                توزيعة {i + 1}
              </span>
              <div
                style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                className="w-full animate-fade-up rounded-t-[5px] bg-gradient-to-t from-brand-600/60 to-brand-400 transition group-hover/b:from-brand-500"
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-mute-500">
        <span>اليوم</span>
        <span>
          <span className="num">{payments}</span> توزيعة متبقية · آخرها تشمل رد أصل المبلغ
        </span>
        <span>الاستحقاق</span>
      </div>
      <p className="sr-only">قيمة تقريبية لكل توزيعة {Math.round(per)} ريال</p>
    </div>
  );
}

export default function OpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const { listings, persona, me, toast } = useStore();
  const [buyOpen, setBuyOpen] = useState(false);

  const listing = listings.find((l) => l.id === id);

  const totals = useMemo(() => {
    if (!listing) return null;
    const saving = listing.faceValue - listing.askingPrice;
    return { saving };
  }, [listing]);

  if (!listing) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-5" />}
        title="الفرصة غير متاحة"
        body="قد يكون العرض قد بيع أو تمت إعادة ضبط العرض التجريبي."
        action={<Link href="/market" className="btn-primary px-4 py-2.5">العودة للسوق</Link>}
      />
    );
  }

  const isMine = listing.sellerId === persona;
  const sold = listing.status === "sold";

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "سوق سيّال", href: "/market" },
          { label: listing.issuer },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        {/* Main */}
        <div className="space-y-5">
          <Panel className="relative animate-fade-up overflow-hidden p-6 sm:p-7">
            <div className="pointer-events-none absolute -left-24 -top-28 size-72 rounded-full bg-brand-500/[0.07] blur-[80px]" />

            <div className="relative mb-4 flex flex-wrap items-center gap-2">
              <Pill tone="brand">
                <TrendingUp className="size-3.5" />
                فرصة تخارج مبكر
              </Pill>
              {assetTypeLabel[listing.assetType] !== platforms[listing.platform].nameAr && (
                <Pill>{assetTypeLabel[listing.assetType]}</Pill>
              )}
              <RiskBadge risk={listing.risk} />
              {sold && <Pill tone="warn">تم البيع</Pill>}
            </div>

            <h1 className="relative text-[28px] font-extrabold tracking-tight text-white sm:text-[34px]">
              {listing.issuer}
            </h1>
            <p className="relative mt-2 text-[13.5px] text-mute-300">{listing.issuerSub}</p>

            <div className="relative mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.014] p-4">
              <PlatformOriginLine id={listing.platform} />
              <p className="mt-3 border-t border-white/[0.05] pt-3 text-[11.5px] leading-relaxed text-mute-400">
                الأصل صادر عبر منصة الإصدار الأصلية ومحتفظ به لديها. سيّال طبقة سوق ثانوي فقط.
              </p>
            </div>

            <div className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { k: "القيمة الاسمية", v: money(listing.faceValue), icon: <Receipt className="size-4" /> },
                { k: "سعر العرض", v: money(listing.askingPrice), icon: <Wallet className="size-4" />, big: true },
                { k: "الخصم", v: `${money(totals!.saving)}`, sub: pct(listing.discount), icon: <TrendingUp className="size-4" />, teal: true },
                { k: "العائد التقديري", v: pct(listing.estimatedBuyerReturn), icon: <TrendingUp className="size-4" />, brand: true, hint: "تقدير تجريبي = العائد الأصلي + أثر الخصم موزّعًا على المدة المتبقية." },
                { k: "التوزيعات المتبقية", v: String(listing.remainingPayments), icon: <Receipt className="size-4" /> },
                { k: "الاستحقاق", v: listing.maturityLabel, icon: <CalendarDays className="size-4" /> },
              ].map((m) => (
                <div key={m.k} className="rounded-2xl border border-white/[0.06] bg-white/[0.014] p-4">
                  <div className="flex items-center justify-between">
                    <p className="label inline-flex items-center gap-1.5">
                      {m.k}
                      {m.hint && <Tooltip text={m.hint} />}
                    </p>
                    <span className="text-mute-500">{m.icon}</span>
                  </div>
                  <p
                    className={cn(
                      "mt-2 font-extrabold tracking-tight",
                      m.big ? "text-[24px]" : "text-[20px]",
                      m.brand ? "text-brand-300" : m.teal ? "text-teal-400" : "text-white",
                    )}
                  >
                    <span className="num">{m.v}</span>
                  </p>
                  {m.sub && (
                    <p className="mt-0.5 text-[11.5px] text-mute-400">
                      خصم <span className="num">{m.sub}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="animate-fade-up p-6">
            <SectionTitle
              title="التدفقات النقدية المتوقعة"
              subtitle={`${listing.remainingPayments} توزيعة على مدى ${months(listing.remainingMonths)}`}
            />
            <CashflowBars payments={listing.remainingPayments} amount={listing.faceValue} />
          </Panel>

          <Panel className="animate-fade-up p-6">
            <SectionTitle title="لماذا يعرض المستثمر هذا الأصل؟" />
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.014] p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-mute-300">
                <User2 className="size-[18px]" />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-white">المستثمر الحالي يرغب في توفير سيولة.</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-mute-400">
                  لا تُعرض أي بيانات شخصية عن البائع. تتم مطابقة الأطراف والتحقق من أهليتها عبر الجهة
                  المرخصة قبل التسوية.
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="animate-fade-up p-6">
            <SectionTitle title="كيف تتم الصفقة؟" subtitle="ست خطوات — تُنفَّذ التسوية عبر الجهة المرخصة" />
            <div className="grid gap-3 sm:grid-cols-2">
              {DEAL_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.t}
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.012] p-4 transition hover:border-white/[0.12]"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-brand-500/20 bg-brand-500/[0.08] text-[12px] font-bold text-brand-300">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                        <Icon className="size-3.5 text-mute-400" />
                        {s.t}
                      </p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-mute-400">{s.s}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Sticky buy panel */}
        <div className="space-y-5 lg:sticky lg:top-[86px]">
          <Panel className="relative animate-fade-up overflow-hidden p-6">
            <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-brand-500/[0.11] blur-3xl" />

            <div className="relative flex items-center justify-between">
              <PlatformChip id={listing.platform} size="sm" />
              <span className="text-[11px] text-mute-500">{listing.listedAt}</span>
            </div>

            <div className="relative mt-5">
              <p className="label">سعر العرض</p>
              <p className="mt-1.5 text-[38px] font-extrabold leading-none tracking-tight text-white">
                <span className="num">{money(listing.askingPrice)}</span>
              </p>
              <p className="mt-2.5 text-[12.5px] text-mute-400">
                بدلًا من{" "}
                <span className="num text-mute-200 line-through decoration-mute-500/60">
                  {money(listing.faceValue)}
                </span>{" "}
                — توفير <span className="num font-semibold text-teal-400">{money(totals!.saving)}</span>
              </p>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-brand-500/25 bg-brand-500/[0.07] p-3">
                <p className="label">العائد التقديري</p>
                <p className="num mt-1 text-[19px] font-extrabold text-brand-300">
                  {pct(listing.estimatedBuyerReturn)}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <p className="label">المدة المتبقية</p>
                <p className="num mt-1 text-[19px] font-extrabold text-white">
                  {listing.remainingMonths} شهر
                </p>
              </div>
            </div>

            <div className="relative mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-[12px] text-mute-400">
                <Clock3 className="size-3.5" />
                رصيد محفظتك
              </span>
              <span className="num text-[13px] font-bold text-white">{money(me.wallet)}</span>
            </div>

            {sold ? (
              <div className="relative mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-center text-[13px] font-semibold text-mute-300">
                تم بيع هذه الفرصة
              </div>
            ) : isMine ? (
              <div className="relative mt-5 space-y-2">
                <div className="rounded-xl border border-warn/25 bg-warn/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-warn">
                  هذا عرضك أنت. انتقل إلى حساب <strong>سارة</strong> من مبدّل وضع العرض في الأعلى
                  لتجربة الشراء.
                </div>
                <Link href="/orders" className="btn-ghost w-full py-3">
                  إدارة أوامري
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setBuyOpen(true);
                  toast({ title: "تم فتح أمر الشراء", body: "اختر طريقة الدفع لإتمام الصفقة.", tone: "info" });
                }}
                className="btn-primary relative mt-5 w-full py-4 text-[16px]"
              >
                شراء بـ <span className="num">{money(listing.askingPrice)}</span>
                <ArrowUpRight className="size-[18px]" />
              </button>
            )}

            <p className="relative mt-3.5 text-center text-[11px] leading-relaxed text-mute-500">
              يتم التحقق والتسوية ونقل الملكية عبر الجهة المرخصة المشغّلة للإصدار.
            </p>
          </Panel>

          <Panel className="animate-fade-up p-5">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-mute-400" />
              <p className="text-[11.5px] leading-relaxed text-mute-400">
                نموذج تجريبي لأغراض VentureX — لا تمثل المنصات الظاهرة شراكات فعلية مع سيّال. جميع
                الأرقام والأسماء بيانات تجريبية.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <BuyFlow listing={listing} open={buyOpen} onClose={() => setBuyOpen(false)} />
    </div>
  );
}
