"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
LayoutGrid, Wallet, Store, ScrollText, ArrowLeftRight, UserRound,
Bell, Check, RotateCcw, ChevronLeft, Info, Menu, X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SayyalLogo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui";
const NAV = [
{ href: "/", label: "الرئيسية", icon: LayoutGrid },
{ href: "/portfolio", label: "محفظتي", icon: Wallet },
{ href: "/market", label: "سوق سيّال", icon: Store },
{ href: "/orders", label: "أوامري", icon: ScrollText },
{ href: "/transactions", label: "المعاملات", icon: ArrowLeftRight },
{ href: "/account", label: "الحساب", icon: UserRound },
];
function NotificationBell() {
const { notifications, persona, dispatch } = useStore();
const [open, setOpen] = useState(false);
const mine = useMemo(
() => notifications.filter((n) => n.userId === persona || n.userId === "all").slice(0, 8),
[notifications, persona],
);
const unread = mine.filter((n) => !n.read).length;
return (
<div className="relative">
<button
onClick={() => {
setOpen((o) => !o);
if (!open) dispatch({ type: "READ_NOTIFICATIONS", userId: persona });
}}
aria-label="الإشعارات"
className="relative grid size-9 place-items-center rounded-xl border border-line bg-white text-mute-300 transition-colors hover:border-[#C2CBD7] hover:text-ink"
>
<Bell className="size-[17px]" />
{unread > 0 && (
<>
<span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-white" />
</>
)}
</button>
{open && (
<>
<div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
<div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[320px] overflow-hidden rounded-2xl border border-[#D5DCE5] bg-white shadow-lift">
<div className="border-b border-line px-4 py-3 text-[13px] font-bold text-ink">
الإشعارات
</div>
<div className="max-h-[320px] overflow-y-auto">
{mine.length === 0 && (
<p className="px-4 py-8 text-center text-[12.5px] text-mute-400">لا توجد إشعارات</p>
)}
{mine.map((n) => (
<div key={n.id} className="flex gap-3 border-b border-line px-4 py-3 last:border-0">
<span
className={cn(
"mt-1 grid size-6 shrink-0 place-items-center rounded-lg",
n.tone === "success" ? "bg-brand-50 text-brand-700" : "bg-ink/[0.05] text-mute-300",
)}
>
{n.tone === "success" ? <Check className="size-3.5" /> : <Info className="size-3.5" />}
</span>
<div className="min-w-0">
<p className="text-[12.5px] font-semibold text-mute-100">{n.titleAr}</p>
<p className="mt-0.5 text-[12px] leading-relaxed text-mute-400">{n.bodyAr}</p>
<p className="mt-1 text-[10.5px] text-mute-500">{n.at}</p>
</div>
</div>
))}
</div>
</div>
</>
)}
</div>
);
}
export function Shell({ children }: { children: React.ReactNode }) {
const pathname = usePathname();
const { me, reset, toast } = useStore();
const [confirmReset, setConfirmReset] = useState(false);
const [mobileNav, setMobileNav] = useState(false);
const nav = (
<nav className="flex flex-col gap-1">
{NAV.map((item) => {
const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
const Icon = item.icon;
return (
<Link
key={item.href}
href={item.href}
onClick={() => setMobileNav(false)}
className={cn(
"group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors",
active
? "bg-brand-50 font-semibold text-brand-800"
: "text-mute-300 hover:bg-canvas hover:text-ink",
)}
>
{active && (
<span className="absolute -right-4 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-l bg-brand-600" />
)}
<Icon
className={cn(
"size-[18px] transition",
active ? "text-brand-700" : "text-mute-400 group-hover:text-mute-200",
)}
/>
{item.label}
</Link>
);
})}
</nav>
);
return (
<div className="flex min-h-screen">
<aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-l border-line bg-white px-4 py-5 lg:flex">
<Link href="/" className="mb-8 px-1">
<SayyalLogo />
</Link>
{nav}
<div className="mt-auto space-y-3">
<button
onClick={() => setConfirmReset(true)}
className="btn-quiet w-full justify-start gap-2 px-3 py-2 text-[12.5px]"
>
<RotateCcw className="size-4" />
إعادة ضبط العرض التجريبي
</button>
</div>
</aside>
{mobileNav && (
<div className="fixed inset-0 z-[90] lg:hidden">
<div className="absolute inset-0 bg-ink/40" onClick={() => setMobileNav(false)} />
<aside className="absolute right-0 top-0 h-full w-[262px] border-l border-line bg-white px-4 py-5">
<div className="mb-7 flex items-center justify-between">
<SayyalLogo />
<button onClick={() => setMobileNav(false)} className="btn-quiet p-2" aria-label="إغلاق">
<X className="size-4" />
</button>
</div>
{nav}
</aside>
</div>
)}
<div className="flex min-w-0 flex-1 flex-col">
<header className="sticky top-0 z-50 border-b border-line bg-white">
<div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3 px-4 sm:px-6">
<button
onClick={() => setMobileNav(true)}
className="btn-quiet p-2 lg:hidden"
aria-label="القائمة"
>
<Menu className="size-5" />
</button>
<div className="lg:hidden">
<SayyalLogo compact />
</div>
<div className="mr-auto flex items-center gap-2.5">
<span className="hidden items-center rounded-md border border-[#F5D48A] bg-[#FFF8E6] px-2 py-1 text-[11px] font-semibold text-[#8A5A00] sm:inline-flex">
نسخة تجريبية
</span>
<NotificationBell />
<div className="flex items-center gap-2.5 py-1 pl-1 pr-1">
<span
className="grid size-8 place-items-center rounded-full text-[11.5px] font-bold text-white"
style={{ background: me.accent }}
>
{me.initials}
</span>
<div className="hidden leading-tight sm:block">
<p className="text-[12.5px] font-semibold text-ink">{me.nameAr}</p>
</div>
</div>
</div>
</div>
</header>
<main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
{children}
</main>
<footer className="border-t border-line px-4 py-5 sm:px-6">
<div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3">
<p className="text-[11px] leading-relaxed text-mute-500">
جميع
البيانات والأسماء والأرقام المعروضة تجريبية بالكامل.
</p>
<Link href="/summary" className="btn-quiet gap-1.5 px-2.5 py-1.5 text-[12px]">
ملخص العرض
<ChevronLeft className="size-3.5" />
</Link>
</div>
</footer>
</div>
<Modal open={confirmReset} onClose={() => setConfirmReset(false)} className="max-w-md">
<div className="p-7">
<h3 className="text-[17px] font-bold text-ink">إعادة ضبط العرض التجريبي</h3>
<p className="mt-2 text-[13.5px] leading-relaxed text-mute-300">
سيعود كل شيء إلى حالته الأولى: المحافظ، العروض، الأرصدة والمعاملات.
</p>
<div className="mt-6 flex gap-2.5">
<button
className="btn-primary flex-1 py-2.5"
onClick={() => {
reset();
setConfirmReset(false);
toast({ title: "تمت إعادة الضبط", body: "العرض التجريبي جاهز من جديد.", tone: "success" });
}}
>
إعادة الضبط
</button>
<button className="btn-ghost flex-1 py-2.5" onClick={() => setConfirmReset(false)}>
إلغاء
</button>
</div>
</div>
</Modal>
</div>
);
}
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
return (
<nav aria-label="مسار التنقل" className="mb-5 flex items-center gap-1.5 text-[12.5px]">
{items.map((it, i) => (
<React.Fragment key={i}>
{i > 0 && <ChevronLeft className="size-3.5 text-mute-500" />}
{it.href ? (
<Link href={it.href} className="text-mute-400 transition hover:text-ink">
{it.label}
</Link>
) : (
<span className="text-mute-200">{it.label}</span>
)}
</React.Fragment>
))}
</nav>
);
}
