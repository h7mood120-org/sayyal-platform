"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Lock, CalendarDays, Clock3, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import type { Investment, Listing } from "@/lib/types";
import { PlatformChip } from "@/components/PlatformChip";
import { Panel, RiskBadge, Pill } from "@/components/ui";
import { money, pct, months, assetTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/* -------------------------- Investment card -------------------------- */

export function InvestmentCard({ inv }: { inv: Investment }) {
  const progress = Math.max(
    4,
    Math.min(100, ((inv.totalMonths - inv.remainingMonths) / inv.totalMonths) * 100),
  );
  const exited = inv.status === "exited";
  const listed = inv.status === "listed";

  return (
    <Panel
      hover
      className={cn(
        "group relative flex flex-col overflow-hidden p-5 transition-transform duration-300",
        !exited && "hover:-translate-y-[3px]",
        exited && "opacity-60",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/investment/${inv.id}`}
            className="block truncate text-[15.5px] font-bold tracking-tight text-white transition group-hover:text-brand-200"
          >
            {inv.issuer}
          </Link>
          <p className="mt-1 truncate text-[12px] text-mute-400">{inv.issuerSub}</p>
        </div>
        <PlatformChip id={inv.platform} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-3 border-y border-white/[0.055] py-4">
        <div>
          <p className="label">القيمة</p>
          <p className="mt-1 text-[16px] font-bold text-white">
            <span className="num">{money(inv.principal)}</span>
          </p>
        </div>
        <div>
          <p className="label">العائد</p>
          <p className="mt-1 text-[16px] font-bold text-brand-300">
            <span className="num">{pct(inv.expectedReturn)}</span>
          </p>
        </div>
        <div>
          <p className="label">المتبقي</p>
          <p className="mt-1 text-[16px] font-bold text-white">
            <span className="num">{months(inv.remainingMonths)}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-[11.5px] text-mute-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            الاستحقاق {inv.maturityLabel}
          </span>
          <RiskBadge risk={inv.risk} />
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-l from-brand-500 to-teal-400 transition-[width] duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {exited ? (
          <Pill tone="brand" className="w-full justify-center py-2">
            <CheckCircle2 className="size-3.5" /> تم التخارج
          </Pill>
        ) : listed ? (
          <Link href="/orders" className="btn-ghost flex-1 py-2.5 text-[13px]">
            <Sparkles className="size-4 text-brand-400" />
            معروض في السوق
          </Link>
        ) : inv.sellable ? (
          <Link href={`/sell/${inv.id}`} className="btn-primary flex-1 py-2.5 text-[13px]">
            عرض للتخارج
            <ArrowUpRight className="size-4" />
          </Link>
        ) : (
          <div
            title={inv.lockedReason}
            className="btn-ghost flex-1 cursor-not-allowed py-2.5 text-[12.5px] opacity-70"
          >
            <Lock className="size-3.5" />
            غير قابل للتخارج حاليًا
          </div>
        )}
        <Link
          href={`/investment/${inv.id}`}
          className="btn-ghost shrink-0 px-3 py-2.5 text-[13px]"
          aria-label="التفاصيل"
        >
          التفاصيل
        </Link>
      </div>
    </Panel>
  );
}

/* ---------------------------- Listing card --------------------------- */

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const sold = listing.status === "sold";
  return (
    <Panel
      hover
      className={cn(
        "group relative flex animate-fade-up flex-col overflow-hidden p-5 transition-all duration-300",
        !sold && "hover:-translate-y-[3px] hover:shadow-glow",
        sold && "opacity-55",
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      {listing.isNew && !sold && (
        <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/[0.12] px-2 py-[3px] text-[10.5px] font-bold text-brand-300">
          <span className="size-1.5 rounded-full bg-brand-400" />
          عرض جديد
        </span>
      )}
      {sold && (
        <span className="absolute left-5 top-5 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-[3px] text-[10.5px] font-bold text-mute-300">
          تم البيع
        </span>
      )}

      <div className="mb-4 flex items-start gap-3">
        <PlatformChip id={listing.platform} size="sm" showLabel={false} />
        <div className="min-w-0 flex-1 pl-16">
          <h3 className="truncate text-[15.5px] font-bold tracking-tight text-white transition group-hover:text-brand-200">
            {listing.issuer}
          </h3>
          <p className="mt-0.5 truncate text-[11.5px] text-mute-400">{listing.issuerSub}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 rounded-xl border border-white/[0.055] bg-white/[0.012] p-3.5">
        <div>
          <p className="label">القيمة الاسمية</p>
          <p className="mt-0.5 text-[14px] font-semibold text-mute-200 line-through decoration-mute-500/60">
            <span className="num">{money(listing.faceValue)}</span>
          </p>
        </div>
        <div>
          <p className="label">سعر العرض</p>
          <p className="mt-0.5 text-[17px] font-extrabold tracking-tight text-white">
            <span className="num">{money(listing.askingPrice)}</span>
          </p>
        </div>
        <div>
          <p className="label">الخصم</p>
          <p className="mt-0.5 text-[14px] font-bold text-teal-400">
            <span className="num">{pct(listing.discount)}</span>
          </p>
        </div>
        <div>
          <p className="label">العائد التقديري</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[17px] font-extrabold tracking-tight text-brand-300">
            <TrendingUp className="size-3.5" />
            <span className="num">{pct(listing.estimatedBuyerReturn)}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="chip">
          <Clock3 className="size-3.5 text-mute-400" />
          <span className="num">{months(listing.remainingMonths)}</span>
        </span>
        <span className="chip">{assetTypeLabel[listing.assetType]}</span>
        <RiskBadge risk={listing.risk} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.055] pt-4">
        <span className="text-[11px] text-mute-500">{listing.listedAt}</span>
        {sold ? (
          <span className="text-[12.5px] font-semibold text-mute-400">غير متاح</span>
        ) : (
          <Link href={`/market/${listing.id}`} className="btn-primary px-4 py-2 text-[13px]">
            عرض الفرصة
            <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>
    </Panel>
  );
}
