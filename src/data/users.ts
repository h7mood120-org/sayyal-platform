import type { User } from "@/lib/types";

export const users: Record<string, User> = {
  mohammed: {
    id: "mohammed",
    nameAr: "محمد العتيبي",
    nameEn: "Mohammed Alotaibi",
    roleAr: "بائع — يبحث عن سيولة",
    initials: "مع",
    wallet: 0,
    bankBalance: 18400,
    bankAccountId: null,
    memberSince: "يناير 2024",
    accent: "#2ECB95",
  },
  sara: {
    id: "sara",
    nameAr: "سارة القحطاني",
    nameEn: "Sara Alqahtani",
    roleAr: "مشترية — تبحث عن فرصة",
    initials: "سق",
    wallet: 2450,
    bankBalance: 34650,
    bankAccountId: null,
    memberSince: "مارس 2025",
    accent: "#3FD3D0",
  },
};

export const personaOrder: Array<"mohammed" | "sara"> = ["mohammed", "sara"];
