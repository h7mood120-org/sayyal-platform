"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, Layers, CheckCircle2, Sparkles, Store } from "lucide-react";
import { useStore } from "@/lib/store";
import { Panel, SectionTitle, Skeleton, useBriefLoading, EmptyState, AnimatedNumber, Pill } from "@/components/ui";
import { InvestmentCard } from "@/components/cards";
import { SAR, money, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "active", label: "نشط" },
  { id: "listed", label: "معروض للبيع" },
  { id: "exited", label: "تم التخارج" },
] as const;

export default function PortfolioPage() {
  const { me, myInvestments, ready, persona } = useStore();
  const loading = useBriefLoading(380) || !ready;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const active = useMemo(() => myInvestments.filter((i) => i.status !== "exited"), [myInvestments]);
  const exited = useMemo(() => myInvestments.filter((i) => i.status === "exited"), [myInvestments]);

  const totals = useMemo(() => {
    const total = active.reduce((s, i) => s + i.principal, 0);
    const recovered = myInvestments.reduce((s, i) => s + i.recovered, 0);
    const weighted = total > 0 ? active.reduce((s, i) => s + i.principal * i.expectedReturn, 0) / total : 0;
    return { total, recovered, weighted };
  }, [active, myInvestments]);

  const shown = useMemo(() => {
    if (filter === "all") return myInvestments;
    return myInvestments.filter((i) => i.status === filter);
  }, [myInvestments, filter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">محفظتي</h1>
          <p className="mt-2 text-[14.5px] text-mute-300">
            {persona === "mohammed"
              ? "استثماراتك لا يجب أن تتوقف حتى تاريخ الاستحقاق."
              : "مراكزك الاستثمارية — من المنصات ومن سوق سيّال."}
          </p>
        </div>
        <Link href="/market" className="btn-ghost px-4 py-2.5">
          <Store className="size-4 text-brand-400" />
          سوق سيّال
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[118px]" />)
          : [
              { k: "رصيد محفظة سيّال", v: me.wallet, suffix: SAR, accent: true, icon: <Wallet className="size-[17px]" /> },
              { k: "قيمة المراكز النشطة", v: totals.total, suffix: SAR, icon: <Layers className="size-[17px]" /> },
              { k: "العائد المرجّح", v: totals.weighted, suffix: "%", decimals: 1, icon: <Sparkles className="size-[17px]" /> },
              { k: "إجمالي المسترد", v: totals.recovered, suffix: SAR, icon: <CheckCircle2 className="size-[17px]" /> },
            ].map((s, i) => (
              <Panel key={s.k} hover className="animate-fade-up p-5" style={{ animationDelay: `${i * 55}ms` }}>
                <div className="flex items-start justify-between">
                  <p className="label">{s.k}</p>
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-xl border",
                      s.accent
                        ? "border-brand-500/25 bg-brand-500/10 text-brand-300"
                        : "border-white/[0.07] bg-white/[0.03] text-mute-300",
                    )}
                  >
                    {s.icon}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-3 text-[26px] font-extrabold leading-none tracking-tight",
                    s.accent ? "text-brand-300" : "text-white",
                  )}
                >
                  <AnimatedNumber value={s.v} decimals={s.decimals ?? 0} />
                  <span className="mr-1.5 text-[13px] font-semibold text-mute-400">{s.suffix}</span>
                </p>
              </Panel>
            ))}
      </div>

      <section>
        <SectionTitle
          title="المراكز الاستثمارية"
          subtitle={`${active.length} نشط · ${exited.length} تم التخارج منه`}
          action={
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const count =
                  f.id === "all" ? myInvestments.length : myInvestments.filter((i) => i.status === f.id).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition",
                      filter === f.id
                        ? "border-white/25 bg-white/[0.07] text-white"
                        : "border-white/[0.08] text-mute-300 hover:text-white",
                    )}
                  >
                    {f.label}
                    <span className="num mr-1.5 text-[10.5px] text-mute-400">{count}</span>
                  </button>
                );
              })}
            </div>
          }
        />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[278px]" />)}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={<Layers className="size-5" />}
            title="لا توجد مراكز في هذا التصنيف"
            body="جرّب تصنيفًا آخر، أو ادخل في فرصة قائمة من سوق سيّال."
            action={<Link href="/market" className="btn-primary px-4 py-2.5">تصفّح السوق</Link>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((inv) => <InvestmentCard key={inv.id} inv={inv} />)}
          </div>
        )}
      </section>
    </div>
  );
}
