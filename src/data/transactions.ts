import type { Transaction, AppNotification } from "@/lib/types";

export const seedTransactions: Transaction[] = [
  { id: "TX-8F31A0", kind: "distribution", titleAr: "توزيعة أرباح — شركة مدار اللوجستية", subtitleAr: "صكوك · توزيعة ربع سنوية", amount: 280, direction: "in", at: "12 سبتمبر 2026 · 09:14", userId: "mohammed", platform: "sukuk", status: "completed" },
  { id: "TX-7C09D4", kind: "distribution", titleAr: "توزيعة أرباح — صندوق واجهة الرياض العقاري", subtitleAr: "أصيل · توزيعة ربع سنوية", amount: 606, direction: "in", at: "2 سبتمبر 2026 · 11:40", userId: "mohammed", platform: "aseel", status: "completed" },
  { id: "TX-5B22E7", kind: "distribution", titleAr: "توزيعة أرباح — شركة أفق للتجزئة", subtitleAr: "جياد · توزيعة ربع سنوية", amount: 655, direction: "in", at: "28 أغسطس 2026 · 08:05", userId: "mohammed", platform: "jiad", status: "completed" },
  { id: "TX-4A18B2", kind: "funding", titleAr: "تحويل إلى محفظة سيّال", subtitleAr: "مصرف الراجحي · •••• 8421", amount: 2450, direction: "in", at: "19 سبتمبر 2026 · 16:22", userId: "sara", status: "completed" },
  { id: "TX-3D77C1", kind: "distribution", titleAr: "توزيعة أرباح — شركة واحة الخليج للتقنية", subtitleAr: "جياد · توزيعة ربع سنوية", amount: 665, direction: "in", at: "10 سبتمبر 2026 · 10:02", userId: "sara", platform: "jiad", status: "completed" },
];

export const seedNotifications: AppNotification[] = [
  { id: "n-1", titleAr: "توزيعة جديدة", bodyAr: "تم إيداع 280 ر.س من شركة مدار اللوجستية.", at: "قبل 10 أيام", userId: "mohammed", read: false, tone: "success" },
  { id: "n-2", titleAr: "فرص جديدة في السوق", bodyAr: "٣ عروض تخارج جديدة تطابق اهتماماتك.", at: "قبل 3 ساعات", userId: "sara", read: false, tone: "info" },
  { id: "n-3", titleAr: "مرحبًا بك في سيّال", bodyAr: "استثماراتك من عدة منصات في مكان واحد.", at: "قبل شهر", userId: "all", read: true, tone: "info" },
];
