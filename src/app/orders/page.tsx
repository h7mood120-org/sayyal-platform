"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ScrollText, Trash2, ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Panel, SectionTitle, EmptyState, Modal, Pill, RiskBadge } from "@/components/ui";
import { PlatformChip } from "@/components/PlatformChip";
import { money, pct, months } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const { listings, persona, dispatch, toast, transactions } = useStore();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const mySell = useMemo(() => listings.filter((l) => l.sellerId === persona), [listings, persona]);
  const myBuy = useMemo(() => listings.filter((l) => l.buyerId === persona), [listings, persona]);
  const pendingCount = mySell.filter((l) => l.status === "open").length;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">أوامري</h1>
        <p className="mt-2 text-[14.5px] text-mute-300">
          أوامر البيع والشراء الخاصة بك في سوق سيّال.
        </p>
      </div>

      <section>
        <SectionTitle
          title="أوامر البيع"
          subtitle="عروض التخارج التي نشرتها"
          action={<Pill tone={pendingCount ? "brand" : "neutral"}>{pendingCount} عرض مفتوح</Pill>}
        />

        {mySell.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="size-5" />}
            title="لا توجد أوامر بيع"
            body="اختر استثمارًا من محفظتك واعرضه للتخارج بالسعر الذي يناسبك."
            action={<Link href="/portfolio" className="btn-primary px-4 py-2.5">اذهب إلى محفظتي</Link>}
          />
        ) : (
          <div className="space-y-3">
            {mySell.map((l) => (
              <Panel key={l.id} hover className="animate-fade-up p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <PlatformChip id={l.platform} size="sm" showLabel={false} />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-white">{l.issuer}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11.5px] text-mute-400">
                        <span>نُشر {l.listedAt}</span>
                        <span className="text-mute-600">·</span>
                        <span><span className="num">{months(l.remainingMonths)}</span> متبقية</span>
                        <span className="text-mute-600">·</span>
                        <span>رقم العرض <span className="ltr">{l.id}</span></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
                    <div>
                      <p className="label">القيمة الاسمية</p>
                      <p className="num mt-0.5 text-[14px] font-bold text-mute-200">{money(l.faceValue)}</p>
                    </div>
                    <div>
                      <p className="label">سعر العرض</p>
                      <p className="num mt-0.5 text-[16px] font-extrabold text-white">{money(l.askingPrice)}</p>
                    </div>
                    <div>
                      <p className="label">الخصم</p>
                      <p className="num mt-0.5 text-[14px] font-bold text-teal-400">{pct(l.discount)}</p>
                    </div>
                    <div>
                      <p className="label">الحالة</p>
                      <div className="mt-1">
                        {l.status === "open" ? (
                          <Pill tone="brand"><Clock3 className="size-3.5" /> مفتوح</Pill>
                        ) : l.status === "sold" ? (
                          <Pill tone="brand"><CheckCircle2 className="size-3.5" /> تم البيع</Pill>
                        ) : (
                          <Pill>ملغى</Pill>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/market/${l.id}`} className="btn-ghost px-3 py-2 text-[12.5px]">
                        عرض
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                      {l.status === "open" && (
                        <button
                          onClick={() => setCancelId(l.id)}
                          aria-label="إلغاء العرض"
                          className="btn-ghost px-3 py-2 text-[12.5px] hover:border-danger/40 hover:text-danger"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle title="أوامر الشراء" subtitle="الفرص التي اشتريتها عبر السوق" />
        {myBuy.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="size-5" />}
            title="لا توجد أوامر شراء"
            body="تصفّح سوق سيّال وادخل في فرصة قائمة بالفعل."
            action={<Link href="/market" className="btn-primary px-4 py-2.5">سوق سيّال</Link>}
          />
        ) : (
          <div className="space-y-3">
            {myBuy.map((l) => (
              <Panel key={l.id} className="animate-fade-up p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <PlatformChip id={l.platform} size="sm" showLabel={false} />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-white">{l.issuer}</p>
                      <p className="mt-0.5 text-[11.5px] text-mute-400">تمت التسوية عبر الجهة المرخصة</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
                    <div>
                      <p className="label">المدفوع</p>
                      <p className="num mt-0.5 text-[16px] font-extrabold text-white">{money(l.askingPrice)}</p>
                    </div>
                    <div>
                      <p className="label">العائد التقديري</p>
                      <p className="num mt-0.5 text-[15px] font-bold text-brand-300">{pct(l.estimatedBuyerReturn)}</p>
                    </div>
                    <RiskBadge risk={l.risk} />
                    <Pill tone="brand"><CheckCircle2 className="size-3.5" /> مكتمل</Pill>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </section>

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} className="max-w-md">
        <div className="p-7">
          <h3 className="text-[17px] font-bold text-white">إلغاء عرض التخارج</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mute-300">
            سيُزال العرض من سوق سيّال ويعود المركز إلى محفظتك كاستثمار نشط.
          </p>
          <div className="mt-6 flex gap-2.5">
            <button
              className="btn-primary flex-1 py-2.5"
              onClick={() => {
                if (cancelId) dispatch({ type: "CANCEL_LISTING", listingId: cancelId });
                setCancelId(null);
                toast({ title: "تم إلغاء العرض", body: "عاد المركز إلى محفظتك.", tone: "info" });
              }}
            >
              تأكيد الإلغاء
            </button>
            <button className="btn-ghost flex-1 py-2.5" onClick={() => setCancelId(null)}>
              تراجع
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
