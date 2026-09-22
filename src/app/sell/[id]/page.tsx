"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Zap, TrendingUp, Info, ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import { Breadcrumb } from "@/components/Shell";
import { Panel, Modal, Tooltip, RiskBadge, EmptyState, AnimatedNumber } from "@/components/ui";
import { PlatformChip } from "@/components/PlatformChip";
import { money, pct, months, SAR, estimateBuyerReturn, discountPct, fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SellOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { investments, persona, dispatch, toast, listings } = useStore();
  const inv = investments.find((i) => i.id === id);

  const [portion, setPortion] = useState(100);
  const [price, setPrice] = useState<number>(() => (inv ? Math.round(inv.principal * 0.97) : 0));
  const [priceText, setPriceText] = useState<string>(() =>
    inv ? fmt(Math.round(inv.principal * 0.97)) : "",
  );
  const [done, setDone] = useState(false);
  const [newListingId, setNewListingId] = useState<string | null>(null);

  const face = useMemo(() => (inv ? Math.round((inv.principal * portion) / 100) : 0), [inv, portion]);

  const derived = useMemo(() => {
    if (!inv) return null;
    const disc = discountPct(face, price);
    const buyerReturn = estimateBuyerReturn(face, price, inv.expectedReturn, inv.remainingMonths);
    return { disc, buyerReturn, fees: 0, net: price };
  }, [inv, face, price]);

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

  const minPrice = Math.round(face * 0.85);
  const maxPrice = face;
  const speedPct = maxPrice === minPrice ? 0 : ((maxPrice - price) / (maxPrice - minPrice)) * 100;

  const setPriceSafe = (v: number) => {
    const clamped = Math.max(minPrice, Math.min(maxPrice, Math.round(v)));
    setPrice(clamped);
    setPriceText(fmt(clamped));
  };

  const publish = () => {
    dispatch({ type: "CREATE_LISTING", investmentId: inv.id, askingPrice: price, portion });
    setDone(true);
  };

  /* بعد النشر: التقط أحدث عرض للمستثمر الحالي */
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

      <div className="mb-7 animate-fade-up">
        <h1 className="text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">
          إنشاء عرض تخارج
        </h1>
        <p className="mt-2 text-[14.5px] text-mute-300">
          حدد سعر التخارج ودع السوق يقوم بالباقي.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.82fr_1fr] lg:items-start">
        {/* Summary side */}
        <div className="space-y-5 lg:sticky lg:top-[86px]">
          <Panel className="animate-fade-up p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-[17px] font-bold tracking-tight text-white">{inv.issuer}</h3>
                <p className="mt-1 text-[12px] text-mute-400">{inv.issuerSub}</p>
              </div>
              <PlatformChip id={inv.platform} size="sm" />
            </div>

            <div className="space-y-0.5">
              {[
                { k: "القيمة الاسمية", v: money(inv.principal) },
                { k: "المتبقي حتى الاستحقاق", v: months(inv.remainingMonths) },
                { k: "العائد", v: pct(inv.expectedReturn) },
                { k: "الدفعات المتبقية", v: String(inv.remainingPayments) },
              ].map((r) => (
                <div
                  key={r.k}
                  className="flex items-center justify-between border-b border-white/[0.045] py-2.5 last:border-0"
                >
                  <span className="text-[12.5px] text-mute-400">{r.k}</span>
                  <span className="num text-[13.5px] font-bold text-white">{r.v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="text-[12.5px] text-mute-400">مستوى المخاطر</span>
                <RiskBadge risk={inv.risk} />
              </div>
            </div>
          </Panel>

          <Panel className="animate-fade-up p-5">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-mute-400" />
              <p className="text-[12px] leading-relaxed text-mute-400">
                سيّال لا تحتفظ بالأصل ولا تنقل الملكية بنفسها. عند قبول العرض يُرسل طلب نقل الملكية
                إلى الجهة المرخصة المشغّلة للإصدار، وتتم التسوية من خلالها.
              </p>
            </div>
          </Panel>
        </div>
        {/* Form */}
        <div className="space-y-5">
          {/* Portion */}
          <Panel className="animate-fade-up p-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-white">كم تريد أن تبيع؟</h2>
                <p className="mt-1 text-[12.5px] text-mute-400">
                  يمكنك التخارج من المركز كاملًا أو من جزء منه.
                </p>
              </div>
              <div className="text-left">
                <p className="text-[24px] font-extrabold leading-none tracking-tight text-white">
                  <span className="num">{fmt(portion)}%</span>
                </p>
                <p className="mt-1.5 text-[12.5px] text-mute-400">
                  <span className="num">{money(face)}</span>
                </p>
              </div>
            </div>

            <input
              type="range"
              min={25}
              max={100}
              step={5}
              value={portion}
              aria-label="نسبة البيع"
              onChange={(e) => {
                const v = Number(e.target.value);
                setPortion(v);
                const newFace = Math.round((inv.principal * v) / 100);
                const ratio = price / face || 0.97;
                const next = Math.round(newFace * ratio);
                const clamped = Math.max(Math.round(newFace * 0.85), Math.min(newFace, next));
                setPrice(clamped);
                setPriceText(fmt(clamped));
              }}
              style={{ backgroundSize: `${((portion - 25) / 75) * 100}% 100%` }}
              className="range mt-5 w-full"
            />
            <div dir="ltr" className="mt-2 flex justify-between text-[11px] text-mute-500">
              <span className="num">25%</span>
              <span className="num">100%</span>
            </div>
          </Panel>

          {/* Price */}
          <Panel className="animate-fade-up p-6">
            <h2 className="text-[16px] font-bold text-white">سعر العرض</h2>
            <p className="mt-1 text-[12.5px] text-mute-400">
              السعر الذي ترغب في التخارج به اليوم. كلما زاد الخصم، زادت سرعة البيع.
            </p>

            <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-white/[0.09] bg-[#0A0D0F] px-4 py-3.5 transition focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/15">
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
                className="num w-full bg-transparent text-[30px] font-extrabold tracking-tight text-white outline-none"
              />
              <span className="shrink-0 text-[15px] font-semibold text-mute-400">{SAR}</span>
            </div>

            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={50}
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
              <span className="inline-flex items-center gap-1.5 font-semibold text-teal-400">
                <Zap className="size-3.5" />
                بيع أسرع
              </span>
              <span dir="rtl" className="text-mute-500">
                <span className="num">{speedPct.toFixed(0)}%</span> نحو سرعة البيع
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-brand-300">
                سعر أعلى
                <TrendingUp className="size-3.5" />
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[0, 2, 3, 5, 8].map((d) => {
                const target = Math.round(face * (1 - d / 100));
                const active = price === target;
                return (
                  <button
                    key={d}
                    onClick={() => setPriceSafe(target)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition",
                      active
                        ? "border-brand-500/45 bg-brand-500/[0.13] text-brand-200"
                        : "border-white/[0.08] bg-white/[0.02] text-mute-300 hover:border-white/20 hover:text-white",
                    )}
                  >
                    خصم <span className="num">{d}%</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Breakdown */}
          <Panel className="animate-fade-up p-6">
            <h2 className="mb-4 text-[16px] font-bold text-white">ملخص العرض</h2>
            <div className="space-y-0.5">
              {[
                {
                  k: "الخصم عن القيمة الاسمية",
                  v: <span className="num text-teal-400">{pct(derived!.disc)}</span>,
                },
                {
                  k: "العائد التقديري للمشتري",
                  v: <span className="num text-brand-300">{pct(derived!.buyerReturn)}</span>,
                  hint: "تقدير تجريبي = العائد الأصلي + أثر الخصم موزّعًا على المدة المتبقية.",
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
                  className="flex items-center justify-between border-b border-white/[0.045] py-3 last:border-0"
                >
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-mute-300">
                    {row.k}
                    {row.hint && <Tooltip text={row.hint} />}
                  </span>
                  <span className="text-[14.5px] font-bold text-white">{row.v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-brand-500/25 bg-brand-500/[0.07] px-4 py-3.5">
              <span className="text-[13.5px] font-semibold text-brand-200">صافي التسوية</span>
              <span className="text-[22px] font-extrabold tracking-tight text-white">
                <AnimatedNumber value={price} /> <span className="text-[14px] text-mute-300">{SAR}</span>
              </span>
            </div>

            <button onClick={publish} className="btn-primary mt-5 w-full py-3.5 text-[15px]">
              نشر العرض في سوق سيّال
              <ArrowUpRight className="size-4" />
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-mute-500">
              بالنشر، يصبح المركز معروضًا للمستثمرين المؤهلين. تتم التسوية ونقل الملكية عبر الجهة
              المرخصة بعد قبول العرض.
            </p>
          </Panel>
        </div>
      </div>

      {/* Confirmation */}
      <Modal open={done} onClose={() => router.push("/orders")} dismissable={false} className="max-w-md">
        <div className="p-8 text-center">
          <div className="relative mx-auto mb-5 grid size-16 place-items-center">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/25" />
            <span className="relative grid size-16 place-items-center rounded-full border border-brand-500/30 bg-brand-500/[0.12]">
              <CheckCircle2 className="size-8 text-brand-400" />
            </span>
          </div>
          <h3 className="text-[22px] font-extrabold tracking-tight text-white">تم نشر عرضك</h3>
          <p className="mt-2.5 text-[14px] leading-relaxed text-mute-300">
            أصبح استثمارك متاحًا للمستثمرين في سوق سيّال.
          </p>

          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 text-right">
            {[
              { k: "الأصل", v: inv.issuer },
              { k: "سعر العرض", v: money(price) },
              { k: "الخصم", v: pct(derived!.disc) },
              { k: "العائد التقديري للمشتري", v: pct(derived!.buyerReturn) },
            ].map((r) => (
              <div
                key={r.k}
                className="flex items-center justify-between border-b border-white/[0.04] py-2 last:border-0"
              >
                <span className="text-[12px] text-mute-400">{r.k}</span>
                <span className="text-[13px] font-bold text-white">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              className="btn-primary w-full py-3"
              onClick={() => {
                toast({
                  title: "عرضك منشور في السوق",
                  body: "انتقل إلى حساب سارة لرؤيته من جانب المشتري.",
                  tone: "success",
                });
                router.push(newListingId ? `/market/${newListingId}` : "/market");
              }}
            >
              مشاهدة العرض
              <ArrowUpRight className="size-4" />
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
