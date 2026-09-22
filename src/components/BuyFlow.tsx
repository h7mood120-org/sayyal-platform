"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Check, Loader2, Lock, ShieldCheck, Wallet, ArrowUpRight, CheckCircle2, CreditCard,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Modal, AnimatedNumber } from "@/components/ui";
import { bankAccounts } from "@/data/bankAccounts";
import { money, SAR, pct, txId } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/types";

type Stage = "method" | "verifying" | "verified" | "settling" | "done";

const VERIFY_STEPS = [
  "الاتصال بمزود المصرفية المفتوحة…",
  "تم التحقق من ملكية الحساب",
  "الحساب مؤهل",
  "الرصيد متاح",
];

const SETTLE_STEPS = [
  { t: "تم إنشاء أمر الشراء", s: "تسجيل الأمر في دفتر سيّال" },
  { t: "تم حجز المبلغ", s: "حجز مبلغ التسوية لصالح الصفقة" },
  { t: "تم التحقق من الطرفين", s: "التحقق من أهلية البائع والمشتري" },
  { t: "طلب نقل الملكية", s: "يتم التنفيذ عبر الجهة المرخصة" },
  { t: "التسوية", s: "تحويل المبلغ إلى محفظة البائع" },
  { t: "نقل الاستثمار للمشتري", s: "تحديث سجل الملكية" },
];

export function BuyFlow({
  listing,
  open,
  onClose,
}: {
  listing: Listing;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { me, dispatch, toast, persona } = useStore();

  const [stage, setStage] = useState<Stage>("method");
  const [bankId, setBankId] = useState<string | null>(null);
  const [verifyStep, setVerifyStep] = useState(-1);
  const [settleStep, setSettleStep] = useState(-1);
  const [ref] = useState(() => txId("SET"));

  const price = listing.askingPrice;
  const bank = bankAccounts.find((b) => b.id === bankId) ?? null;

  const fromWallet = Math.min(me.wallet, price);
  const fromBank = price - fromWallet;
  const enough = bank ? bank.available >= fromBank : me.wallet >= price;

  useEffect(() => {
    if (!open) {
      setStage("method");
      setBankId(null);
      setVerifyStep(-1);
      setSettleStep(-1);
    }
  }, [open]);

  /* ------------------------- open banking mock ------------------------ */
  useEffect(() => {
    if (stage !== "verifying") return;
    setVerifyStep(0);
    const timers: number[] = [];
    VERIFY_STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setVerifyStep(i), 520 + i * 620));
    });
    timers.push(
      window.setTimeout(() => {
        setStage("verified");
        if (bank) {
          dispatch({
            type: "LINK_BANK",
            userId: persona,
            bankAccountId: bank.id,
            available: bank.available,
          });
        }
      }, 520 + VERIFY_STEPS.length * 620),
    );
    return () => timers.forEach(clearTimeout);
  }, [stage, bank, dispatch, persona]);

  /* --------------------------- settlement ---------------------------- */
  useEffect(() => {
    if (stage !== "settling") return;
    const timers: number[] = [];
    /* الخطوة الرابعة (نقل الملكية) تأخذ وقتًا أطول لأنها تمر عبر الجهة المرخصة */
    const durations = SETTLE_STEPS.map((_, i) => (i === 3 ? 1600 : 700));
    let t = 350;
    durations.forEach((d, i) => {
      const startAt = t;
      timers.push(window.setTimeout(() => setSettleStep(i), startAt));
      timers.push(window.setTimeout(() => setSettleStep(i + 0.5), startAt + d));
      t = startAt + d + 160;
    });
    timers.push(
      window.setTimeout(() => {
        dispatch({ type: "COMPLETE_PURCHASE", listingId: listing.id, buyerId: persona });
        setStage("done");
      }, t + 450),
    );
    return () => timers.forEach(clearTimeout);
  }, [stage, dispatch, listing.id, persona]);

  /* ------------------------------ render ----------------------------- */

  const dismissable = stage === "method" || stage === "verified";

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissable={dismissable}
      className={cn(stage === "settling" || stage === "done" ? "max-w-xl" : "max-w-lg")}
    >
      {/* ---------------------------- method --------------------------- */}
      {(stage === "method" || stage === "verifying" || stage === "verified") && (
        <div className="p-7">
          <h3 className="text-[20px] font-extrabold tracking-tight text-white">طريقة الدفع</h3>
          <p className="mt-1.5 text-[13px] text-mute-400">
            شراء {listing.issuer} بمبلغ <span className="num font-semibold text-white">{money(price)}</span>
          </p>

          {/* wallet */}
          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
                  <Wallet className="size-[18px]" />
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-white">رصيد سيّال</p>
                  <p className="text-[11.5px] text-mute-400">متاح للاستخدام فورًا</p>
                </div>
              </div>
              <p className="text-[16px] font-bold text-white">
                <span className="num">{money(me.wallet)}</span>
              </p>
            </div>
            {fromBank > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-warn/20 bg-warn/[0.07] px-3 py-2">
                <Lock className="size-3.5 shrink-0 text-warn" />
                <p className="text-[11.5px] leading-relaxed text-warn">
                  الرصيد لا يغطي المبلغ. يلزم تمويل{" "}
                  <span className="num font-bold">{money(fromBank)}</span> من حساب بنكي مرتبط.
                </p>
              </div>
            )}
          </div>

          {/* bank picker */}
          <p className="mb-2.5 mt-5 text-[13px] font-semibold text-white">ربط حساب بنكي</p>
          <div className="grid grid-cols-2 gap-2.5">
            {bankAccounts.map((b) => {
              const active = bankId === b.id;
              return (
                <button
                  key={b.id}
                  disabled={stage !== "method"}
                  onClick={() => setBankId(b.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-3 text-right transition disabled:opacity-60",
                    active
                      ? "border-brand-500/45 bg-brand-500/[0.09]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20",
                  )}
                >
                  <span
                    style={{ background: `${b.accent}1A`, color: b.accent, borderColor: `${b.accent}33` }}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border text-[13px] font-bold"
                  >
                    {b.monogram}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-semibold text-white">{b.nameAr}</span>
                    <span className="num block text-[10.5px] text-mute-400">{b.mask}</span>
                  </span>
                  {active && <Check className="mr-auto size-4 shrink-0 text-brand-400" />}
                </button>
              );
            })}
          </div>

          {/* verification */}
          {stage !== "method" && bank && (
            <div className="mt-5 animate-fade-up rounded-2xl border border-white/[0.08] bg-white/[0.015] p-4">
              <div className="flex items-center gap-2.5 border-b border-white/[0.05] pb-3">
                {stage === "verifying" ? (
                  <Loader2 className="size-4 animate-spin text-brand-400" />
                ) : (
                  <ShieldCheck className="size-4 text-brand-400" />
                )}
                <p className="text-[13px] font-semibold text-white">
                  {stage === "verifying" ? "جاري التحقق عبر المصرفية المفتوحة…" : "تم ربط الحساب بنجاح"}
                </p>
              </div>

              <div className="mt-3 space-y-2">
                {VERIFY_STEPS.slice(1).map((s, i) => {
                  const idx = i + 1;
                  const reached = verifyStep >= idx || stage === "verified";
                  return (
                    <div
                      key={s}
                      className={cn(
                        "flex items-center gap-2 text-[12.5px] transition-all duration-500",
                        reached ? "text-mute-100 opacity-100" : "text-mute-500 opacity-40",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-[18px] shrink-0 place-items-center rounded-full border transition",
                          reached
                            ? "border-brand-500/40 bg-brand-500/15 text-brand-300"
                            : "border-white/10 text-transparent",
                        )}
                      >
                        <Check className="size-3" />
                      </span>
                      {s}
                    </div>
                  );
                })}
              </div>

              {stage === "verified" && (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-3">
                  <div>
                    <p className="label">رقم الحساب</p>
                    <p className="num mt-1 text-[14px] font-bold text-white">{bank.mask}</p>
                  </div>
                  <div>
                    <p className="label">الرصيد المتاح</p>
                    <p className="num mt-1 text-[14px] font-bold text-brand-300">{money(bank.available)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* breakdown + CTA */}
          {stage === "verified" && (
            <div className="mt-5 animate-fade-up space-y-1 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[12.5px] text-mute-400">من محفظة سيّال</span>
                <span className="num text-[13px] font-bold text-white">{money(fromWallet)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.05] py-1.5">
                <span className="text-[12.5px] text-mute-400">من {bank?.nameAr}</span>
                <span className="num text-[13px] font-bold text-white">{money(fromBank)}</span>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-[13px] font-semibold text-white">إجمالي التسوية</span>
                <span className="num text-[18px] font-extrabold text-brand-300">{money(price)}</span>
              </div>
            </div>
          )}

          <div className="mt-6">
            {stage === "method" && (
              <button
                disabled={!bankId}
                onClick={() => setStage("verifying")}
                className="btn-primary w-full py-3.5 text-[15px]"
              >
                <CreditCard className="size-4" />
                التحقق من الحساب البنكي
              </button>
            )}
            {stage === "verifying" && (
              <button disabled className="btn-ghost w-full py-3.5">
                <Loader2 className="size-4 animate-spin" />
                جاري التحقق…
              </button>
            )}
            {stage === "verified" && (
              <button
                disabled={!enough}
                onClick={() => setStage("settling")}
                className="btn-primary w-full py-3.5 text-[15px]"
              >
                تأكيد شراء <span className="num">{money(price)}</span>
              </button>
            )}
          </div>

          <p className="mt-3.5 text-center text-[10.5px] leading-relaxed text-mute-500">
            محاكاة للمصرفية المفتوحة داخل النموذج التجريبي — لا يوجد أي ربط فعلي بأي بنك.
          </p>
        </div>
      )}

      {/* --------------------------- settlement -------------------------- */}
      {stage === "settling" && (
        <div className="p-7">
          <div className="flex items-center gap-2.5">
            <Loader2 className="size-4 animate-spin text-brand-400" />
            <h3 className="text-[20px] font-extrabold tracking-tight text-white">جاري تنفيذ الصفقة</h3>
          </div>
          <p className="mt-1.5 text-[12.5px] text-mute-400">
            رقم المرجع <span className="ltr text-mute-200">{ref}</span>
          </p>

          <div className="mt-6 space-y-0">
            {SETTLE_STEPS.map((s, i) => {
              const state = settleStep >= i + 0.5 ? "done" : settleStep >= i ? "active" : "idle";
              const last = i === SETTLE_STEPS.length - 1;
              return (
                <div key={s.t} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "relative grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-500",
                        state === "done" && "border-brand-500/45 bg-brand-500/15 text-brand-300",
                        state === "active" && "border-brand-500/45 bg-brand-500/10 text-brand-300",
                        state === "idle" && "border-white/[0.09] bg-white/[0.02] text-mute-600",
                      )}
                    >
                      {state === "active" && (
                        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/30" />
                      )}
                      {state === "done" ? (
                        <Check className="size-3.5" />
                      ) : state === "active" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    {!last && (
                      <span
                        className={cn(
                          "my-1 w-px flex-1 transition-colors duration-500",
                          state === "done" ? "bg-brand-500/35" : "bg-white/[0.07]",
                        )}
                      />
                    )}
                  </div>
                  <div className={cn("pb-5 transition-all duration-500", state === "idle" && "opacity-40")}>
                    <p className="text-[13.5px] font-semibold text-white">{s.t}</p>
                    <p className="mt-0.5 text-[11.5px] text-mute-400">{s.s}</p>
                    {i === 3 && state !== "idle" && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-teal-500/25 bg-teal-500/[0.08] px-2 py-1 text-[10.5px] font-semibold text-teal-400">
                        <ShieldCheck className="size-3" />
                        يتم التنفيذ عبر الجهة المرخصة
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------ done ----------------------------- */}
      {stage === "done" && (
        <div className="p-8 text-center">
          <div className="relative mx-auto mb-6 grid size-[72px] place-items-center">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/25" />
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/20 [animation-delay:.4s]" />
            <span className="relative grid size-[72px] place-items-center rounded-full border border-brand-500/35 bg-brand-500/[0.14]">
              <CheckCircle2 className="size-9 text-brand-400" />
            </span>
          </div>

          <h3 className="text-[24px] font-extrabold tracking-tight text-white">تمت الصفقة بنجاح</h3>

          <p className="mt-5 text-[38px] font-extrabold leading-none tracking-tight text-white">
            <AnimatedNumber value={price} />
            <span className="mr-2 text-[16px] font-semibold text-mute-400">{SAR}</span>
          </p>
          <p className="mt-2 text-[13px] text-brand-300">تمت تسويتها</p>

          <p className="mt-5 text-[14px] leading-relaxed text-mute-300">
            أصبح الاستثمار الآن ضمن محفظتك.
          </p>

          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 text-right">
            {[
              { k: "الأصل", v: listing.issuer as React.ReactNode },
              { k: "القيمة الاسمية", v: money(listing.faceValue) },
              { k: "العائد التقديري", v: pct(listing.estimatedBuyerReturn) },
              { k: "رقم العملية", v: <span className="ltr">{ref}</span> },
            ].map((r) => (
              <div
                key={r.k}
                className="flex items-center justify-between border-b border-white/[0.04] py-2 last:border-0"
              >
                <span className="text-[12px] text-mute-400">{r.k}</span>
                <span className="num text-[13px] font-bold text-white">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              className="btn-primary w-full py-3.5 text-[15px]"
              onClick={() => {
                onClose();
                toast({ title: "تم نقل الأصل إلى محفظتك", tone: "success" });
                router.push("/portfolio");
              }}
            >
              عرض محفظتي
              <ArrowUpRight className="size-4" />
            </button>
            <button
              className="btn-ghost w-full py-3"
              onClick={() => {
                onClose();
                router.push("/summary");
              }}
            >
              <Building2 className="size-4" />
              ملخص العرض التجريبي
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
