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
