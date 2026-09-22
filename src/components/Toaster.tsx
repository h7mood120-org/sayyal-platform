"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dispatch } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[200] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5">
      {toasts.map((t) => {
        const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? AlertTriangle : Info;
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex animate-fade-up items-start gap-3 rounded-2xl border border-white/10 bg-[#101517]/95 p-3.5 shadow-lift backdrop-blur-xl"
          >
            <span
              className={cn(
                "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg",
                t.tone === "success" && "bg-brand-500/12 text-brand-300",
                t.tone === "info" && "bg-white/[0.06] text-mute-200",
                t.tone === "error" && "bg-danger/12 text-danger",
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[12px] leading-relaxed text-mute-300">{t.body}</p>}
            </div>
            <button
              onClick={() => dispatch({ type: "DISMISS_TOAST", id: t.id })}
              aria-label="إغلاق"
              className="rounded-md p-1 text-mute-500 transition hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
