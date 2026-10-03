export const SAR = "ر.س";

export function fmt(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function money(n: number, decimals = 0): string {
  return `${fmt(n, decimals)} ${SAR}`;
}

export function pct(n: number, decimals = 1): string {
  return `${fmt(n, decimals)}%`;
}

export function months(n: number): string {
  if (n === 1) return "شهر واحد";
  if (n === 2) return "شهران";
  if (n >= 3 && n <= 10) return `${fmt(n)} أشهر`;
  return `${fmt(n)} شهر`;
}

export function txId(prefix = "TX"): string {
  const chars = "0123456789ABCDEF";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function nowLabel(): string {
  const d = new Date();
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()} · ${time}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "صباح الخير";
  if (h < 17) return "طاب يومك";
  return "مساء الخير";
}

export const riskLabel: Record<string, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

export const assetTypeLabel: Record<string, string> = {
  sukuk: "صكوك",
  realestate: "عقاري",
  corporate: "تمويل شركات",
};

/**
 * تقدير تجريبي لعائد المشتري السنوي.
 * = العائد الأصلي + (نسبة الخصم مُسنوَنة على المدة المتبقية × معامل توقيت التدفقات).
 * معادلة مبسطة لأغراض العرض التجريبي فقط ولا تمثل حسابًا فعليًا لعائد الاستحقاق.
 */
const CASHFLOW_TIMING_FACTOR = 0.95;

export function estimateBuyerReturn(
  faceValue: number,
  askingPrice: number,
  baseReturn: number,
  remainingMonths: number,
): number {
  if (faceValue <= 0 || askingPrice <= 0 || remainingMonths <= 0) return baseReturn;
  const discountPct = ((faceValue - askingPrice) / faceValue) * 100;
  const annualized = (discountPct * 12) / remainingMonths;
  const value = baseReturn + annualized * CASHFLOW_TIMING_FACTOR;
  return Math.max(0, Math.round(value * 10) / 10);
}

export function discountPct(faceValue: number, askingPrice: number): number {
  if (faceValue <= 0) return 0;
  return Math.round(((faceValue - askingPrice) / faceValue) * 1000) / 10;
}

/* ------------------------- تقييم المركز وسعر العرض ------------------------- */

const DAY_MS = 86_400_000;

/** تاريخ اليوم (منتصف الليل UTC) — يُستخدم تاريخًا للتقييم */
export function todayISO(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
}

export interface Valuation {
  termDays: number;
  elapsedDays: number;
  totalProfit: number;
  accruedProfit: number;
  /** القيمة في تاريخ التقييم */
  value: number;
  /** الحد الأدنى لسعر العرض */
  lower: number;
  /** الحد الأعلى لسعر العرض */
  upper: number;
  /** القيمة عند الاستحقاق */
  maturityValue: number;
}

/**
 * القيمة في تاريخ التقييم ونطاق سعر العرض:
 * 1. المدة الكلية بالأيام = تاريخ الاستحقاق − تاريخ البدء
 * 2. الأيام المنقضية = تاريخ التقييم − تاريخ البدء
 * 3. إذا كان معدل الربح سنويًا: إجمالي الربح = الأصل × (المعدل ÷ 100) × (المدة الكلية ÷ 365)
 * 4. إذا كان المعدل يغطي كامل المدة: إجمالي الربح = الأصل × (المعدل ÷ 100)
 * 5. الربح المستحق = إجمالي الربح × (الأيام المنقضية ÷ المدة الكلية)
 * 6. القيمة في تاريخ التقييم = الأصل + الربح المستحق
 * 7. الحد الأدنى = القيمة في تاريخ التقييم × 0.90
 * 8. الحد الأعلى = القيمة في تاريخ التقييم × 1.10
 * 9. القيمة عند الاستحقاق = الأصل + إجمالي الربح
 */
export function valuation(
  principal: number,
  rate: number,
  rateBasis: "annual" | "term",
  startDate: string,
  maturityDate: string,
  valuationDate: string = todayISO(),
): Valuation {
  const start = Date.parse(startDate);
  const termDays = Math.round((Date.parse(maturityDate) - start) / DAY_MS);
  const elapsedDays = Math.min(termDays, Math.max(0, Math.round((Date.parse(valuationDate) - start) / DAY_MS)));
  const totalProfit =
    rateBasis === "annual"
      ? principal * (rate / 100) * (termDays / 365)
      : principal * (rate / 100);
  const accruedProfit = termDays > 0 ? totalProfit * (elapsedDays / termDays) : 0;
  const value = principal + accruedProfit;
  return {
    termDays,
    elapsedDays,
    totalProfit,
    accruedProfit,
    value,
    lower: value * 0.9,
    upper: value * 1.1,
    maturityValue: principal + totalProfit,
  };
}

/** القيمة الاسمية الافتراضية للوحدة لمركز جديد */
export function defaultUnitPrice(principal: number): number {
  for (const u of [1000, 500, 50]) if (principal % u === 0) return u;
  return 1;
}

/** «12 صكًا» / «5 أوراق مالية» */
export function unitsLabel(n: number, assetType: string): string {
  const sukuk = assetType === "sukuk";
  if (n === 1) return sukuk ? "صك واحد" : "ورقة مالية واحدة";
  if (n === 2) return sukuk ? "صكّان" : "ورقتان ماليتان";
  const mod = n % 100;
  if (mod >= 3 && mod <= 10) return `${fmt(n)} ${sukuk ? "صكوك" : "أوراق مالية"}`;
  if (mod >= 11) return `${fmt(n)} ${sukuk ? "صكًا" : "ورقة مالية"}`;
  return `${fmt(n)} ${sukuk ? "صك" : "ورقة مالية"}`;
}

/** اسم الوحدة بصيغة الجمع: «الصكوك» / «الأوراق المالية» */
export function unitsNoun(assetType: string): string {
  return assetType === "sukuk" ? "الصكوك" : "الأوراق المالية";
}

/** العائد السنوي التقديري للمشتري = (القيمة عند الاستحقاق − السعر) ÷ السعر، مُسنوَنًا على الأيام المتبقية */
export function buyerReturnFromValuation(v: Valuation, price: number): number {
  const remainingDays = v.termDays - v.elapsedDays;
  if (price <= 0 || remainingDays <= 0) return 0;
  const value = ((v.maturityValue - price) / price) * (365 / remainingDays) * 100;
  return Math.round(value * 10) / 10;
}
