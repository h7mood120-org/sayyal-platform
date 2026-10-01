import type { Investment, RiskLevel } from "@/lib/types";

/**
 * محرك التسعير المقترح لأدوات التمويل بالدين.
 * السعر = القيمة الحالية للدفعات المتبقية مخصومة بالعائد المطلوب من المشتري.
 * العوائد هنا اسمية سنوية بتركيب ربع سنوي، والأساس هو العائد الفعلي المستخرج
 * من جدول الدفعات الأصلي — لا العائد المعلن، لأن العائد المعلن للصكوك التي
 * تُصرف عند الاستحقاق عائد بسيط يبالغ في العائد الحقيقي.
 */

/** علاوة السيولة: ثابتة مبدئيًا، تُعاير لاحقًا من صفقات سيّال */
export const LIQUIDITY_PREMIUM = 1.5;

/** علاوة المخاطر حسب تقييم المنصة المُصدِرة */
export const RISK_PREMIUM: Record<RiskLevel, number> = { low: 0, medium: 0.5, high: 1.5 };

/** علاوة تركّز السداد في دفعة واحدة عند الاستحقاق */
export const SINGLE_PAYMENT_PREMIUM = 0.75;

/** أقل عائد مسموح للمشتري — يحدد السقف الأعلى للسعر */
export const MIN_BUYER_YIELD = 3;

/** نطاق تعديل البائع حول السعر المقترح */
export const MAX_DISCOUNT_FROM_SUGGESTED = 0.15;
export const MAX_PREMIUM_OVER_SUGGESTED = 0.05;

const PERIOD_MONTHS = 3;

export interface Cashflow {
  /** بعد كم شهر من نقطة البداية */
  months: number;
  amount: number;
}

/** مبالغ الدفعات بالترتيب؛ وإن غاب الجدول يُبنى جدول ربع سنوي من بيانات الفرصة */
function scheduleAmounts(inv: Investment): { amount: number; due: boolean }[] {
  if (inv.distributions.length > 0) {
    return inv.distributions.map((d) => ({ amount: d.amount, due: d.status === "due" }));
  }
  const per = (inv.principal * inv.expectedReturn) / 400;
  return Array.from({ length: inv.remainingPayments }, (_, i) => ({
    amount: i === inv.remainingPayments - 1 ? per + inv.principal : per,
    due: true,
  }));
}

/** الدفعات المتبقية من اليوم (الأصل مع آخر دفعة) للحصة المعروضة */
export function remainingCashflows(inv: Investment, portion = 100): Cashflow[] {
  const due = scheduleAmounts(inv).filter((d) => d.due);
  const n = due.length;
  return due.map((d, i) => ({
    months: inv.remainingMonths - (n - 1 - i) * PERIOD_MONTHS,
    amount: (d.amount * portion) / 100,
  }));
}

/** جدول الدفعات الأصلي من تاريخ الإصدار */
function originalCashflows(inv: Investment): Cashflow[] {
  const all = scheduleAmounts(inv);
  const n = all.length;
  return all.map((d, i) => ({ months: inv.totalMonths - (n - 1 - i) * PERIOD_MONTHS, amount: d.amount }));
}

export function presentValue(yieldPct: number, cfs: Cashflow[]): number {
  const q = yieldPct / 100 / 4;
  return cfs.reduce((s, cf) => s + cf.amount / Math.pow(1 + q, cf.months / PERIOD_MONTHS), 0);
}

function irr(price: number, cfs: Cashflow[]): number {
  let lo = -50;
  let hi = 200;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (presentValue(mid, cfs) > price) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** عائد المشتري الفعلي (عائد حتى الاستحقاق) عند الشراء بسعر معيّن */
export function buyerYield(price: number, cfs: Cashflow[]): number {
  if (price <= 0 || cfs.length === 0) return 0;
  return Math.round(irr(price, cfs) * 10) / 10;
}

/** العائد الفعلي للفرصة من جدولها الأصلي (يساوي المعلن في الصكوك الدورية) */
export function effectiveReturn(inv: Investment): number {
  if (inv.distributions.length === 0) return inv.expectedReturn;
  return Math.round(irr(inv.principal, originalCashflows(inv)) * 100) / 100;
}

/** القيمة الدفترية = الأصل + الربح المستحق الذي لم يُصرف بعد */
export function bookValue(inv: Investment, portion = 100): number {
  const next = remainingCashflows(inv, 100)[0];
  if (!next) return Math.round((inv.principal * portion) / 100);
  const periodMonths = inv.payout === "maturity" ? inv.totalMonths : PERIOD_MONTHS;
  const accruedMonths = Math.max(0, periodMonths - next.months);
  const accrued = (inv.principal * inv.expectedReturn * accruedMonths) / 1200;
  return Math.round(((inv.principal + accrued) * portion) / 100);
}

export interface PriceComponent {
  label: string;
  value: number;
}

export interface PriceSuggestion {
  price: number;
  requiredYield: number;
  minPrice: number;
  maxPrice: number;
  components: PriceComponent[];
  cashflows: Cashflow[];
}

export function suggestPrice(inv: Investment, portion = 100): PriceSuggestion {
  const cashflows = remainingCashflows(inv, portion);
  const components: PriceComponent[] = [
    { label: "العائد الفعلي للفرصة", value: effectiveReturn(inv) },
    { label: "علاوة السيولة", value: LIQUIDITY_PREMIUM },
    { label: "علاوة المخاطر", value: RISK_PREMIUM[inv.risk] },
  ];
  if (inv.payout === "maturity") {
    components.push({ label: "علاوة الدفعة الواحدة", value: SINGLE_PAYMENT_PREMIUM });
  }
  const requiredYield = components.reduce((s, c) => s + c.value, 0);
  const price = Math.round(presentValue(requiredYield, cashflows));
  const cap = Math.floor(presentValue(MIN_BUYER_YIELD, cashflows));
  return {
    price,
    requiredYield,
    minPrice: Math.round(price * (1 - MAX_DISCOUNT_FROM_SUGGESTED)),
    maxPrice: Math.min(cap, Math.round(price * (1 + MAX_PREMIUM_OVER_SUGGESTED))),
    components,
    cashflows,
  };
}

export type PriceZone = "fast" | "fair" | "slow";

/** منطقة احتمال البيع حسب بُعد السعر عن المقترح */
export function priceZone(price: number, suggested: number): PriceZone {
  if (price <= suggested) return "fast";
  if (price <= suggested * 1.03) return "fair";
  return "slow";
}
