import type { Platform } from "@/lib/types";
export const platforms: Record<string, Platform> = {
sukuk: {
id: "sukuk",
nameAr: "صكوك",
nameEn: "Sukuk Capital",
logo: "/platforms/sukuk.png",
mark: "/platforms/sukuk-mark.png",
accent: "#1C8FB3",
monogram: "ص",
descriptorAr: "منصة تمويل جماعي بالدين",
},
aseel: {
id: "aseel",
nameAr: "أصيل",
nameEn: "Aseel",
logo: "/platforms/aseel.svg",
mark: "/platforms/aseel-mark.svg",
accent: "#0366FF",
monogram: "أ",
descriptorAr: "منصة استثمار عقاري",
},
jiad: {
id: "jiad",
nameAr: "جياد",
nameEn: "Jiad",
logo: "/platforms/jiad.svg",
mark: "/platforms/jiad.svg",
accent: "#224F56",
monogram: "ج",
descriptorAr: "منصة تمويل منشآت",
},
};
export const platformList = Object.values(platforms);
