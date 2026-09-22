import type { Platform } from "@/lib/types";

/**
 * ملاحظة: الشعارات الرسمية للمنصات غير متوفرة داخل هذا النموذج التجريبي.
 * لذلك نستخدم بطاقة نصية أنيقة تحمل اسم المنصة كعنصر مؤقت — ولا يُدّعى أنها الشعار الرسمي.
 */
export const platforms: Record<string, Platform> = {
  sukuk: {
    id: "sukuk",
    nameAr: "صكوك",
    nameEn: "Sukuk",
    logo: "/platforms/sukuk.svg",
    accent: "#2ECB95",
    monogram: "ص",
    descriptorAr: "منصة تمويل جماعي بالدين",
  },
  aseel: {
    id: "aseel",
    nameAr: "أصيل",
    nameEn: "Aseel",
    logo: "/platforms/aseel.svg",
    accent: "#3FD3D0",
    monogram: "أ",
    descriptorAr: "منصة استثمار عقاري",
  },
  jiad: {
    id: "jiad",
    nameAr: "جياد",
    nameEn: "Jiad",
    logo: "/platforms/jiad.svg",
    accent: "#8B9CF7",
    monogram: "ج",
    descriptorAr: "منصة تمويل منشآت",
  },
};

export const platformList = Object.values(platforms);
