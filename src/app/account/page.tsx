"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck, Landmark, BellRing, FileText, ChevronLeft, BadgeCheck, Info, RotateCcw,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Panel, SectionTitle, Pill } from "@/components/ui";
import { bankAccounts } from "@/data/bankAccounts";
import { money } from "@/lib/format";
import { platformList } from "@/data/platforms";
import { PlatformMark } from "@/components/PlatformChip";

export default function AccountPage() {
  const { me, persona, transactions, myInvestments } = useStore();
  const bank = bankAccounts.find((b) => b.id === me.bankAccountId);
  const myTx = transactions.filter((t) => t.userId === persona);

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">الحساب</h1>
        <p className="mt-2 text-[14.5px] text-mute-300">بياناتك وربط المنصات والحسابات البنكية.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <Panel className="animate-fade-up p-6">
            <div className="flex items-center gap-4">
              <span
                className="grid size-14 place-items-center rounded-2xl text-[19px] font-extrabold text-[#04120C]"
                style={{ background: me.accent }}
              >
                {me.initials}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] font-extrabold tracking-tight text-white">{me.nameAr}</h2>
                  <BadgeCheck className="size-4 text-brand-400" />
                </div>
                <p className="mt-1 text-[12.5px] text-mute-400">{me.roleAr}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { k: "رصيد المحفظة", v: money(me.wallet) },
                { k: "عدد المراكز", v: String(myInvestments.filter((i) => i.status !== "exited").length) },
                { k: "عدد العمليات", v: String(myTx.length) },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/[0.06] bg-white/[0.014] p-4">
                  <p className="label">{s.k}</p>
                  <p className="num mt-1.5 text-[18px] font-extrabold text-white">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5">
              {[
                { k: "الهوية الوطنية", v: "تم التحقق", ok: true },
                { k: "تصنيف المستثمر", v: "مستثمر فرد", ok: true },
                { k: "عضو منذ", v: me.memberSince, ok: false },
              ].map((r) => (
                <div
                  key={r.k}
                  className="flex items-center justify-between rounded-xl border border-white/[0.055] bg-white/[0.012] px-4 py-3"
                >
                  <span className="inline-flex items-center gap-2 text-[12.5px] text-mute-300">
                    <ShieldCheck className="size-4 text-mute-500" />
                    {r.k}
                  </span>
                  {r.ok ? <Pill tone="brand">{r.v}</Pill> : <span className="text-[13px] font-semibold text-white">{r.v}</span>}
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="animate-fade-up p-6">
            <SectionTitle title="المنصات المرتبطة" subtitle="مصادر استثماراتك المعروضة في سيّال" />
            <div className="space-y-2.5">
              {platformList.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.055] bg-white/[0.012] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <PlatformMark id={p.id} size={30} />
                    <div>
                      <p className="text-[13.5px] font-semibold text-white">{p.nameAr}</p>
                      <p className="text-[11px] text-mute-400">{p.descriptorAr}</p>
                    </div>
                  </div>
                  <Pill>عرض تجريبي</Pill>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-white/[0.05] pt-3.5 text-[11px] leading-relaxed text-mute-500">
              أسماء المنصات مستخدمة كأمثلة توضيحية داخل النموذج التجريبي فقط. لا يوجد تكامل فعلي ولا
              شراكة قائمة، ولا تُنسب إلى أي منها دعم السوق الثانوي.
            </p>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel className="animate-fade-up p-6">
            <SectionTitle title="الحساب البنكي" subtitle="عبر المصرفية المفتوحة (محاكاة)" />
            {bank ? (
              <div className="rounded-2xl border border-brand-500/25 bg-brand-500/[0.06] p-4">
                <div className="flex items-center gap-3">
                  <span
                    style={{ background: `${bank.accent}1A`, color: bank.accent, borderColor: `${bank.accent}33` }}
                    className="grid size-10 place-items-center rounded-xl border text-[15px] font-bold"
                  >
                    {bank.monogram}
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-white">{bank.nameAr}</p>
                    <p className="num text-[11.5px] text-mute-400">{bank.mask}</p>
                  </div>
                  <Pill tone="brand" className="mr-auto">مرتبط</Pill>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-[12px] text-mute-400">الرصيد المتاح</span>
                  <span className="num text-[16px] font-extrabold text-brand-300">{money(me.bankBalance)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.09] p-6 text-center">
                <Landmark className="mx-auto mb-3 size-6 text-mute-400" />
                <p className="text-[13.5px] font-semibold text-mute-100">لا يوجد حساب بنكي مرتبط</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-mute-400">
                  يتم الربط تلقائيًا عند أول عملية شراء من سوق سيّال.
                </p>
                <Link href="/market" className="btn-ghost mt-4 px-4 py-2.5 text-[13px]">
                  تصفّح السوق
                </Link>
              </div>
            )}
          </Panel>

          <Panel className="animate-fade-up p-6">
            <SectionTitle title="التفضيلات" />
            <div className="space-y-2.5">
              {[
                { k: "إشعارات الفرص الجديدة", icon: <BellRing className="size-4" />, on: true },
                { k: "إشعارات التوزيعات", icon: <BellRing className="size-4" />, on: true },
                { k: "التقارير الشهرية", icon: <FileText className="size-4" />, on: false },
              ].map((r) => (
                <div
                  key={r.k}
                  className="flex items-center justify-between rounded-xl border border-white/[0.055] bg-white/[0.012] px-4 py-3"
                >
                  <span className="inline-flex items-center gap-2.5 text-[12.5px] text-mute-200">
                    <span className="text-mute-500">{r.icon}</span>
                    {r.k}
                  </span>
                  <span
                    className={`relative h-5 w-9 rounded-full transition ${
                      r.on ? "bg-brand-500" : "bg-white/[0.09]"
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] size-3.5 rounded-full bg-white transition-all ${
                        r.on ? "right-[3px]" : "right-[19px]"
                      }`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="animate-fade-up p-5">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-mute-400" />
              <p className="text-[11.5px] leading-relaxed text-mute-400">
                نموذج تجريبي لأغراض VentureX — لا تمثل المنصات الظاهرة شراكات فعلية مع سيّال. لا يوجد
                تسجيل دخول حقيقي ولا ربط بنكي فعلي، وجميع البيانات تجريبية.
              </p>
            </div>
            <Link href="/summary" className="btn-ghost mt-4 w-full py-2.5 text-[13px]">
              ملخص العرض التجريبي
              <ChevronLeft className="size-3.5" />
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}
