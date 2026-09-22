import type { BankAccount } from "@/lib/types";

/** بنوك تجريبية داخل النموذج — لا يوجد أي ربط API حقيقي. */
export const bankAccounts: BankAccount[] = [
  { id: "rajhi", nameAr: "مصرف الراجحي", nameEn: "Al Rajhi", monogram: "ر", accent: "#2ECB95", mask: "•••• 8421", available: 34650 },
  { id: "snb", nameAr: "البنك الأهلي السعودي", nameEn: "SNB", monogram: "أ", accent: "#3FD3D0", mask: "•••• 5507", available: 21300 },
  { id: "alinma", nameAr: "مصرف الإنماء", nameEn: "Alinma", monogram: "ن", accent: "#8B9CF7", mask: "•••• 3192", available: 15980 },
  { id: "riyad", nameAr: "بنك الرياض", nameEn: "Riyad Bank", monogram: "ض", accent: "#E8A33D", mask: "•••• 7734", available: 46120 },
];
