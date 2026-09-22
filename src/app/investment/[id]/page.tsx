"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowUpRight, CalendarDays, Clock3, Coins, Receipt, ShieldAlert, Lock, Building2, Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Breadcrumb } from "@/components/Shell";
import { Panel, RiskBadge, Pill, SectionTitle, Tooltip, EmptyState } from "@/components/ui";
import { PlatformChip, PlatformOriginLine } from "@/components/PlatformChip";
import { CashflowTimeline } from "@/components/CashflowTimeline";
import { money, pct, months, assetTypeLabel } from "@/lib/format";
import { platforms } from "@/data/platforms";

function Metric({
  label, value, sub, icon, tone, hint,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  tone?: "brand";
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.014] p-4">
      <div className="flex items-center justify-between">
        <p className="label inline-flex items-center gap-1.5">
          {label}
          {hint && <Tooltip text={hint} />}
        </p>
        <span className="text-mute-500">{icon}</span>
      </div>
      <p
        className={`mt-2 text-[21px] font-extrabold tracking-tight ${
          tone === "brand" ? "text-brand-300" : "text-white"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-[11.5px] text-mute-400">{sub}</p>}
    </div>
  );
}

export default function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { investments, persona } = useStore();
  const inv = investments.find((i) => i.id === id);

  if (!inv) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-5" />}
        title="الاستثمار غير موجود"
        body="ربما تمت إعادة ضبط العرض التجريبي أو انتقل الأصل إلى محفظة أخرى."
        action={<Link href="/portfolio" className="btn-primary px-4 py-2.5">العودة للمحفظة</Link>}
      />
    );
  }

  const p = platforms[inv.platform];
  const mine = inv.ownerId === persona;
  const paid = inv.distributions.filter((d) => d.status === "paid").length;
  const progress = Math.min(100, ((inv.totalMonths - inv.remainingMonths) / inv.totalMonths) * 100);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "محفظتي", href: "/portfolio" },
          { label: inv.issuer },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        {/* Main */}
        <div className="space-y-5">
          <Panel className="animate-fade-up overflow-hidden p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <PlatformChip id={inv.platform} />
                  {assetTypeLabel[inv.assetType] !== p.nameAr && (
                    <Pill>{assetTypeLabel[inv.assetType]}</Pill>
                  )}
                  <RiskBadge risk={inv.risk} />
                  {inv.status === "listed" && (
                    <Pill tone="brand">
                      <Sparkles className="size-3.5" /> معروض في السوق
                    </Pill>
                  )}
                  {inv.acquiredVia === "sayyal" && (
                    <Pill tone="brand">تم اقتناؤه عبر سيّال</Pill>
                  )}
                </div>
                <h1 className="text-[27px] font-extrabold tracking-tight text-white sm:text-[30px]">
                  {inv.issuer}
                </h1>
                <p className="mt-2 text-[13.5px] text-mute-300">{inv.issuerSub}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Metric
                label="قيمة الاستثمار"
                value={<span className="num">{money(inv.principal)}</span>}
                icon={<Coins className="size-4" />}
                sub="القيمة الاسمية للمركز"
              />
              <Metric
                label="العائد السنوي"
                value={<span className="num">{pct(inv.expectedReturn)}</span>}
                tone="brand"
                icon={<ArrowUpRight className="size-4" />}
                sub="حسب شروط الإصدار"
              />
              <Metric
                label="القيمة المستردة حتى الآن"
                value={<span className="num">{money(inv.recovered)}</span>}
                icon={<Receipt className="size-4" />}
                sub={`${paid} توزيعة مصروفة`}
              />
              <Metric
                label="الدفعات المتبقية"
                value={<span className="num">{inv.remainingPayments}</span>}
                icon={<Receipt className="size-4" />}
                sub="توزيعات ربع سنوية"
              />
              <Metric
                label="الاستحقاق"
                value={<span className="text-[18px]">{inv.maturityLabel}</span>}
                icon={<CalendarDays className="size-4" />}
              />
              <Metric
                label="المتبقي"
                value={<span className="num">{months(inv.remainingMonths)}</span>}
                icon={<Clock3 className="size-4" />}
                sub="حتى تاريخ الاستحقاق"
              />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-[11.5px] text-mute-400">
                <span>تقدّم مدة الاستثمار</span>
                <span className="num">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-brand-500 to-teal-400 transition-[width] duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </Panel>

          <Panel className="animate-fade-up p-6">
            <SectionTitle
              title="جدول التوزيعات"
              subtitle="تدفقات نقدية تجريبية — ربع سنوية حتى الاستحقاق"
            />
            <CashflowTimeline items={inv.distributions} />
          </Panel>

          <Panel className="animate-fade-up p-6">
            <SectionTitle title="عن الإصدار" subtitle="بيانات تجريبية لأغراض العرض" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { k: "الجهة المصدرة", v: inv.issuer, icon: <Building2 className="size-4" /> },
                { k: "منصة الإصدار", v: p.nameAr, icon: null },
                { k: "نوع الأصل", v: assetTypeLabel[inv.assetType], icon: null },
                { k: "مستوى المخاطر", v: <RiskBadge risk={inv.risk} />, icon: null },
                { k: "تاريخ الدخول", v: inv.acquiredAt ?? "—", icon: null },
                { k: "مدة الإصدار", v: months(inv.totalMonths), icon: null },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.012] px-4 py-3"
                >
                  <span className="text-[12.5px] text-mute-400">{row.k}</span>
                  <span className="text-[13px] font-semibold text-white">{row.v}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Side CTA */}
        <div className="space-y-5 lg:sticky lg:top-[86px]">
          <Panel className="relative animate-fade-up overflow-hidden p-6">
            <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-brand-500/[0.1] blur-3xl" />
            <PlatformOriginLine id={inv.platform} />

            <div className="relative mt-6">
              <h3 className="text-[20px] font-extrabold leading-snug tracking-tight text-white">
                تحتاج السيولة قبل الاستحقاق؟
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-mute-300">
                يمكنك تحديد السعر الذي يناسبك وسيتم عرضه للمستثمرين في سوق سيّال.
              </p>
            </div>

            <div className="relative mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-mute-400">القيمة الاسمية</span>
                <span className="text-[14px] font-bold text-white">
                  <span className="num">{money(inv.principal)}</span>
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[12px] text-mute-400">المتبقي حتى الاستحقاق</span>
                <span className="text-[14px] font-bold text-white">
                  <span className="num">{months(inv.remainingMonths)}</span>
                </span>
              </div>
            </div>

            {!mine ? (
              <div className="relative mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[12.5px] text-mute-300">
                هذا المركز ضمن محفظة مستثمر آخر في العرض التجريبي.
              </div>
            ) : inv.status === "exited" ? (
              <div className="relative mt-5 rounded-xl border border-brand-500/25 bg-brand-500/[0.08] px-4 py-3 text-[12.5px] text-brand-200">
                تم التخارج من هذا المركز وتسويته بنجاح.
              </div>
            ) : inv.status === "listed" ? (
              <Link href="/orders" className="btn-ghost relative mt-5 w-full py-3">
                <Sparkles className="size-4 text-brand-400" />
                عرضك منشور — إدارة الأمر
              </Link>
            ) : inv.sellable ? (
              <button
                onClick={() => router.push(`/sell/${inv.id}`)}
                className="btn-primary relative mt-5 w-full py-3.5 text-[15px]"
              >
                عرض الاستثمار للبيع
                <ArrowUpRight className="size-4" />
              </button>
            ) : (
              <div className="relative mt-5 space-y-2">
                <div className="btn-ghost w-full cursor-not-allowed py-3 opacity-70">
                  <Lock className="size-4" />
                  غير قابل للتخارج حاليًا
                </div>
                <p className="text-center text-[11.5px] text-mute-400">{inv.lockedReason}</p>
              </div>
            )}

            <p className="relative mt-4 text-center text-[11px] leading-relaxed text-mute-500">
              سيّال طبقة سوق ثانوي. يتم التحقق ونقل الملكية والتسوية عبر الجهة المرخصة.
            </p>
          </Panel>

          <Panel className="animate-fade-up p-5">
            <p className="text-[12.5px] font-bold text-white">مؤشر المخاطر</p>
            <div className="mt-3 flex items-center gap-2">
              {["low", "medium", "high"].map((lvl, i) => {
                const order = { low: 0, medium: 1, high: 2 } as Record<string, number>;
                const on = order[inv.risk] >= i;
                return (
                  <div
                    key={lvl}
                    className={`h-1.5 flex-1 rounded-full transition ${
                      on
                        ? i === 0
                          ? "bg-brand-400"
                          : i === 1
                          ? "bg-warn"
                          : "bg-danger"
                        : "bg-white/[0.07]"
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <RiskBadge risk={inv.risk} />
              <span className="text-[11.5px] text-mute-400">تقييم تجريبي</span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
