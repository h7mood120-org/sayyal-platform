"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Zap, TrendingUp, Info, ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import { Breadcrumb } from "@/components/Shell";
import { Panel, Modal, Tooltip, RiskBadge, EmptyState, AnimatedNumber } from "@/components/ui";
import { PlatformChip } from "@/components/PlatformChip";
import { money, pct, months, SAR, discountPct, fmt } from "@/lib/format";
import { suggestPrice, buyerYield, priceZone, bookValue } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export default function SellOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { investments, persona, dispatch, toast, listings } = useStore();
  const inv = investments.find((i) => i.id === id);

  const [portion, setPortion] = useState(100);
  const [price, setPrice] = useState<number>(() => (inv ? suggestPrice(inv).price : 0));
  const [priceText, setPriceText] = useState<string>(() => (inv ? fmt(suggestPrice(inv).price) : ""));
  const [showBasis, setShowBasis] = useState(false);
  const [done, setDone] = useState(false);
  const [newListingId, setNewListingId] = useState<string | null>(null);

  const face = useMemo(() => (inv ? Math.round((inv.principal * portion) / 100) : 0), [inv, portion]);

  const suggestion = useMemo(() => (inv ? suggestPrice(inv, portion) : null), [inv, portion]);

  const derived = useMemo(() => {
    if (!inv || !suggestion) return null;
    const book = bookValue(inv, portion);
    const disc = discountPct(book, price);
    const buyerReturn = buyerYield(price, suggestion.cashflows);
    const vsSuggested = ((price - suggestion.price) / suggestion.price) * 100;
    return { book, disc, buyerReturn, vsSuggested, zone: priceZone(price, suggestion.price), fees: 0, net: price };
  }, [inv, portion, price, suggestion]);

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

  const { price: suggestedPrice, minPrice, maxPrice } = suggestion!;
  const zoneInfo = {
    fast: { label: "بيع سريع متوقع", cls: "text-teal-400 border-teal-400/30 bg-teal-400/[0.08]" },
    fair: { label: "البيع ممكن لكنه أبطأ", cls: "text-amber-300 border-amber-300/30 bg-amber-300/[0.08]" },
    slow: { label: "البيع غير مرجّح بهذا السعر", cls: "text-rose-300 border-rose-300/30 bg-rose-300/[0.08]" },
  }[derived!.zone];

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
                { k: "صرف العائد", v: inv.payout === "maturity" ? "عند الاستحقاق" : "ربع سنوي" },
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
                const next = suggestPrice(inv, v);
                const ratio = price / suggestedPrice || 1;
                const clamped = Math.max(next.minPrice, Math.min(next.maxPrice, Math.round(next.price * ratio)));
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
              اقترحنا لك سعرًا مبدئيًا بناءً على الدفعات المتبقية والمخاطر. يمكنك خفضه أو رفعه.
            </p>

            <div className="mt-5 rounded-2xl border border-brand-500/25 bg-brand-500/[0.06] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] text-mute-400">السعر المقترح</p>
                  <p className="mt-1 text-[20px] font-extrabold tracking-tight text-white">
                    <span className="num">{money(suggestedPrice)}</span>
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-[12px] text-mute-400">عائد المشتري عنده</p>
                  <p className="num mt-1 text-[16px] font-bold text-brand-300">{pct(suggestion!.requiredYield)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowBasis((v) => !v)}
                className="mt-3 text-[12px] font-semibold text-brand-300 hover:text-brand-200"
              >
                {showBasis ? "إخفاء طريقة الحساب" : "كيف حُسب هذا السعر؟"}
              </button>
              {showBasis && (
                <div className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-3 text-[12px]">
                  {suggestion!.components.map((c) => (
                    <div key={c.label} className="flex justify-between text-mute-300">
                      <span>{c.label}</span>
                      <span className="num">+{pct(c.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-white">
                    <span>العائد المطلوب من المشتري</span>
                    <span className="num">{pct(suggestion!.requiredYield)}</span>
                  </div>
                  <p className="pt-1.5 leading-relaxed text-mute-500">
                    السعر المقترح هو القيمة الحالية للدفعات المتبقية (
                    {suggestion!.cashflows.length === 1 ? (
                      "دفعة واحدة"
                    ) : (
                      <>
                        <span className="num">{suggestion!.cashflows.length}</span> دفعات
                      </>
                    )}{" "}
                    بمجموع{" "}
                    <span className="num">
                      {money(Math.round(suggestion!.cashflows.reduce((s, c) => s + c.amount, 0)))}
                    </span>
                    ) مخصومة بهذا العائد. السعر استرشادي وليس تقييمًا أو توصية.
                  </p>
                  {inv.payout === "maturity" && (
                    <p className="leading-relaxed text-mute-500">
                      العائد المعلن <span className="num">{pct(inv.expectedReturn)}</span> عائد بسيط يُصرف
                      كاملًا عند الاستحقاق، ويعادل <span className="num">{pct(suggestion!.components[0].value)}</span>{" "}
                      سنويًا بعد احتساب التوقيت. لذلك يُبنى السعر على العائد الفعلي.
                    </p>
                  )}
                </div>
              )}
            </div>

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
              <span className="inline-flex items-center gap-1.5 font-semibold text-teal-400">
                <Zap className="size-3.5" />
                بيع أسرع
              </span>
              <span dir="rtl" className={cn("rounded-full border px-2.5 py-1 font-semibold", zoneInfo.cls)}>
                {zoneInfo.label}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-brand-300">
                سعر أعلى
                <TrendingUp className="size-3.5" />
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[-5, -2, 0, 2].map((d) => {
                const target = Math.max(minPrice, Math.min(maxPrice, Math.round(suggestedPrice * (1 + d / 100))));
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
                    {d === 0 ? "المقترح" : <span className="num">{d > 0 ? `+${d}` : d}%</span>}
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
                  k: "مقارنة بالسعر المقترح",
                  v: (
                    <span className="num">
                      {derived!.vsSuggested > 0 ? "+" : ""}
                      {pct(derived!.vsSuggested)}
                    </span>
                  ),
                },
                {
                  k: "الخصم عن القيمة الدفترية",
                  v: <span className="num text-teal-400">{pct(derived!.disc)}</span>,
                  hint: `القيمة الدفترية ${money(derived!.book)} = الأصل + الربح المستحق الذي لم يُصرف بعد.`,
                },
                ...(inv.payout === "maturity"
                  ? [
                      {
                        k: "ربحك من الاستثمار",
                        v: (
                          <span className={cn("num", price >= face ? "text-teal-400" : "text-rose-300")}>
                            {money(price - face)}
                          </span>
                        ),
                        hint: "الفرق بين سعر البيع والمبلغ الذي استثمرته في الحصة المعروضة.",
                      },
                    ]
                  : []),
                {
                  k: "العائد التقديري للمشتري",
                  v: <span className="num text-brand-300">{pct(derived!.buyerReturn)}</span>,
                  hint: "العائد السنوي حتى الاستحقاق للمشتري عند هذا السعر، محسوبًا من الدفعات المتبقية.",
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
