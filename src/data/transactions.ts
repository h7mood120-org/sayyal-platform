import type { Transaction, AppNotification } from "@/lib/types";

export const seedTransactions: Transaction[] = [];

export const seedNotifications: AppNotification[] = [
  { id: "n-3", titleAr: "مرحبًا بك في سيّال", bodyAr: "استثماراتك من عدة منصات في مكان واحد.", at: "قبل شهر", userId: "all", read: true, tone: "info" },
];
