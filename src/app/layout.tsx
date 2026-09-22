import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-arabic/arabic-300.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-400.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-500.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-600.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-700.css";
import "@fontsource/ibm-plex-sans-arabic/latin-300.css";
import "@fontsource/ibm-plex-sans-arabic/latin-400.css";
import "@fontsource/ibm-plex-sans-arabic/latin-500.css";
import "@fontsource/ibm-plex-sans-arabic/latin-600.css";
import "@fontsource/ibm-plex-sans-arabic/latin-700.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  title: "سيّال | Sayyal — طبقة سيولة للاستثمارات غير المدرجة",
  description:
    "سوق ثانوي للاستثمارات غير السائلة. استثماراتك من عدة منصات في مكان واحد، وسيولة عندما تحتاجها.",
};

export const viewport: Viewport = {
  themeColor: "#07090A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">
        <StoreProvider>
          <Shell>{children}</Shell>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
