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
  funding: "تمويل محفظة",
  distribution: "توزيعة",
};

const FILTERS: { id: "all" | TxKind; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "distribution", label: "التوزيعات" },
  { id: "buy", label: "المشتريات" },
  { id: "sell", label: "التخارجات" },
  { id: "list", label: "العروض" },
  { id: "funding", label: "التمويل" },
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
      /* تجاهل */
    }
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">المعاملات</h1>
        <p className="mt-2 text-[14.5px] text-mute-300">سجل كامل لحركة محفظتك داخل سيّال.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: "إجمالي الوارد", v: totals.inflow, tone: "brand" as const, icon: <ArrowDownLeft className="size-[17px]" /> },
          { k: "إجمالي الصادر", v: totals.outflow, tone: "plain" as const, icon: <ArrowUpRight className="size-[17px]" /> },
          { k: "عدد العمليات", v: mine.length, tone: "plain" as const, icon: <ArrowLeftRight className="size-[17px]" />, raw: true },
        ].map((s, i) => (
          <Panel key={s.k} className="animate-fade-up p-5" style={{ animationDelay: `${i * 55}ms` }}>
            <div className="flex items-start justify-between">
              <p className="label">{s.k}</p>
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-xl border",
                  s.tone === "brand"
                    ? "border-brand-500/25 bg-brand-500/10 text-brand-300"
                    : "border-white/[0.07] bg-white/[0.03] text-mute-300",
                )}
              >
                {s.icon}
              </span>
            </div>
            <p
              className={cn(
                "num mt-3 text-[24px] font-extrabold tracking-tight",
                s.tone === "brand" ? "text-brand-300" : "text-white",
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
                      ? "border-white/25 bg-white/[0.07] text-white"
                      : "border-white/[0.08] text-mute-300 hover:text-white",
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
            body="ستظهر هنا التوزيعات وعمليات البيع والشراء والتسوية."
          />
        ) : (
          <Panel className="animate-fade-up divide-y divide-white/[0.05] overflow-hidden">
            {shown.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-white/[0.015]"
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl border",
                    t.direction === "in"
                      ? "border-brand-500/25 bg-brand-500/10 text-brand-300"
                      : t.direction === "out"
                      ? "border-white/[0.08] bg-white/[0.03] text-mute-200"
                      : "border-warn/25 bg-warn/[0.08] text-warn",
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
                  <p className="text-[13.5px] font-semibold text-white">{t.titleAr}</p>
                  <p className="mt-0.5 text-[11.5px] text-mute-400">{t.subtitleAr}</p>
                </div>

                {t.platform && <PlatformChip id={t.platform} size="sm" />}

                <span className="chip">{KIND_LABEL[t.kind]}</span>

                <button
                  onClick={() => copy(t.id)}
                  title="نسخ رقم العملية"
                  className="chip gap-1.5 transition hover:border-white/20 hover:text-white"
                >
                  {copied === t.id ? <Check className="size-3 text-brand-400" /> : <Copy className="size-3" />}
                  <span className="ltr">{t.id}</span>
                </button>

                <div className="mr-auto text-left">
                  <p
                    className={cn(
                      "num text-[15px] font-extrabold",
                      t.direction === "in" ? "text-brand-300" : "text-white",
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
