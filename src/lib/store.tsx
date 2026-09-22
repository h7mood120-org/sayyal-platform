"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useReducer,
  useEffect,
  useState,
} from "react";
import type {
  Investment,
  Listing,
  Transaction,
  User,
  PersonaId,
  AppNotification,
} from "@/lib/types";
import { seedInvestments } from "@/data/investments";
import { seedListings } from "@/data/listings";
import { seedTransactions, seedNotifications } from "@/data/transactions";
import { users as seedUsers } from "@/data/users";
import { txId, nowLabel, estimateBuyerReturn, discountPct } from "@/lib/format";

/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone: "success" | "info" | "error";
}

interface State {
  persona: PersonaId;
  users: Record<string, User>;
  investments: Investment[];
  listings: Listing[];
  transactions: Transaction[];
  notifications: AppNotification[];
  toasts: Toast[];
  /** آخر صفقة مكتملة — تُستخدم في شاشة ملخص العرض */
  lastDeal: {
    listingId: string;
    issuer: string;
    faceValue: number;
    price: number;
    discount: number;
    buyerReturn: number;
    remainingMonths: number;
    sellerId: PersonaId;
    buyerId: PersonaId;
    txRef: string;
    at: string;
  } | null;
}

const initialState: State = {
  persona: "mohammed",
  users: JSON.parse(JSON.stringify(seedUsers)),
  investments: JSON.parse(JSON.stringify(seedInvestments)),
  listings: JSON.parse(JSON.stringify(seedListings)),
  transactions: JSON.parse(JSON.stringify(seedTransactions)),
  notifications: JSON.parse(JSON.stringify(seedNotifications)),
  toasts: [],
  lastDeal: null,
};

type Action =
  | { type: "SET_PERSONA"; persona: PersonaId }
  | { type: "CREATE_LISTING"; investmentId: string; askingPrice: number; portion: number }
  | { type: "CANCEL_LISTING"; listingId: string }
  | { type: "LINK_BANK"; userId: PersonaId; bankAccountId: string; available: number }
  | { type: "COMPLETE_PURCHASE"; listingId: string; buyerId: PersonaId }
  | { type: "PUSH_TOAST"; toast: Toast }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "READ_NOTIFICATIONS"; userId: PersonaId }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: State };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...action.state, toasts: [] };

    case "RESET":
      return { ...JSON.parse(JSON.stringify(initialState)), persona: state.persona };

    case "SET_PERSONA":
      return { ...state, persona: action.persona };

    case "PUSH_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };

    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case "READ_NOTIFICATIONS":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.userId === action.userId || n.userId === "all" ? { ...n, read: true } : n,
        ),
      };

    case "LINK_BANK": {
      const u = state.users[action.userId];
      return {
        ...state,
        users: {
          ...state.users,
          [action.userId]: { ...u, bankAccountId: action.bankAccountId, bankBalance: action.available },
        },
      };
    }

    case "CREATE_LISTING": {
      const inv = state.investments.find((i) => i.id === action.investmentId);
      if (!inv) return state;
      const face = Math.round((inv.principal * action.portion) / 100);
      const disc = discountPct(face, action.askingPrice);
      const listing: Listing = {
        id: `lst-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        investmentId: inv.id,
        sellerId: inv.ownerId,
        sellerLabel: "مستثمر فرد",
        issuer: inv.issuer,
        issuerSub: inv.issuerSub,
        platform: inv.platform,
        assetType: inv.assetType,
        faceValue: face,
        askingPrice: action.askingPrice,
        sellPortion: action.portion,
        discount: disc,
        estimatedBuyerReturn: estimateBuyerReturn(
          face,
          action.askingPrice,
          inv.expectedReturn,
          inv.remainingMonths,
        ),
        remainingMonths: inv.remainingMonths,
        remainingPayments: inv.remainingPayments,
        maturityLabel: inv.maturityLabel,
        risk: inv.risk,
        listedAt: "الآن",
        status: "open",
        isNew: true,
      };
      const tx: Transaction = {
        id: txId("OR"),
        kind: "list",
        titleAr: `نشر عرض تخارج — ${inv.issuer}`,
        subtitleAr: `سعر العرض ${action.askingPrice.toLocaleString("en-US")} ر.س · خصم ${disc}%`,
        amount: action.askingPrice,
        direction: "neutral",
        at: nowLabel(),
        userId: inv.ownerId,
        platform: inv.platform,
        status: "pending",
        listingId: listing.id,
      };
      return {
        ...state,
        listings: [listing, ...state.listings],
        investments: state.investments.map((i) =>
          i.id === inv.id ? { ...i, status: "listed" } : i,
        ),
        transactions: [tx, ...state.transactions],
        notifications: [
          {
            id: `n-${Math.random().toString(36).slice(2, 7)}`,
            titleAr: "فرصة جديدة في سوق سيّال",
            bodyAr: `${inv.issuer} — متاحة الآن بسعر ${action.askingPrice.toLocaleString("en-US")} ر.س`,
            at: "الآن",
            userId: "sara",
            read: false,
            tone: "info",
          },
          ...state.notifications,
        ],
      };
    }

    case "CANCEL_LISTING": {
      const listing = state.listings.find((l) => l.id === action.listingId);
      if (!listing) return state;
      return {
        ...state,
        listings: state.listings.filter((l) => l.id !== action.listingId),
        transactions: state.transactions.filter(
          (t) => !(t.listingId === action.listingId && t.status === "pending"),
        ),
        investments: state.investments.map((i) =>
          i.id === listing.investmentId ? { ...i, status: "active" } : i,
        ),
      };
    }

    case "COMPLETE_PURCHASE": {
      const listing = state.listings.find((l) => l.id === action.listingId);
      if (!listing || listing.status !== "open") return state;

      const price = listing.askingPrice;
      const buyer = state.users[action.buyerId];
      const at = nowLabel();
      const ref = txId("SET");

      /* المشتري: يُخصم من محفظة سيّال أولًا ثم من الحساب البنكي المرتبط */
      const fromWallet = Math.min(buyer.wallet, price);
      const fromBank = price - fromWallet;
      const nextBuyer: User = {
        ...buyer,
        wallet: buyer.wallet - fromWallet,
        bankBalance: buyer.bankBalance - fromBank,
      };

      const nextUsers = { ...state.users, [action.buyerId]: nextBuyer };

      /* البائع: تُضاف حصيلة التخارج إلى محفظته */
      let sellerName = listing.sellerLabel;
      if (listing.sellerId !== "anon") {
        const seller = state.users[listing.sellerId];
        sellerName = seller.nameAr;
        nextUsers[listing.sellerId] = { ...seller, wallet: seller.wallet + price };
      }

      /* نقل الأصل */
      let investments = state.investments;
      const source = state.investments.find((i) => i.id === listing.investmentId);
      if (source) {
        investments = state.investments.map((i) =>
          i.id === source.id ? { ...i, status: "exited" as const } : i,
        );
        investments = [
          {
            ...source,
            id: `${source.id}-${action.buyerId}`,
            ownerId: action.buyerId,
            principal: listing.faceValue,
            status: "active",
            recovered: 0,
            sellable: true,
            lockedReason: undefined,
            acquiredVia: "sayyal",
            acquiredAt: at,
          },
          ...investments,
        ];
      } else {
        /* عرض من مستثمر خارج النموذج — يُنشأ مركز جديد للمشتري */
        investments = [
          {
            id: `${listing.investmentId}-${action.buyerId}`,
            issuer: listing.issuer,
            issuerSub: listing.issuerSub,
            platform: listing.platform,
            assetType: listing.assetType,
            principal: listing.faceValue,
            expectedReturn: listing.estimatedBuyerReturn,
            maturityDate: "",
            maturityLabel: listing.maturityLabel,
            remainingMonths: listing.remainingMonths,
            totalMonths: listing.remainingMonths + 6,
            risk: listing.risk,
            status: "active",
            ownerId: action.buyerId,
            recovered: 0,
            remainingPayments: listing.remainingPayments,
            distributions: [],
            sellable: true,
            acquiredVia: "sayyal",
            acquiredAt: at,
          },
          ...state.investments,
        ];
      }

      const buyTx: Transaction = {
        id: ref,
        kind: "buy",
        titleAr: `شراء مركز استثماري — ${listing.issuer}`,
        subtitleAr: `عبر سوق سيّال · تسوية عبر الجهة المرخصة`,
        amount: price,
        direction: "out",
        at,
        userId: action.buyerId,
        platform: listing.platform,
        status: "completed",
      };

      const txs: Transaction[] = [buyTx];
      if (listing.sellerId !== "anon") {
        txs.push({
          id: txId("SET"),
          kind: "sell",
          titleAr: `تخارج مبكر — ${listing.issuer}`,
          subtitleAr: "تمت التسوية ونقل الملكية عبر الجهة المرخصة",
          amount: price,
          direction: "in",
          at,
          userId: listing.sellerId as PersonaId,
          platform: listing.platform,
          status: "completed",
        });
      }

      const notes: AppNotification[] = [
        {
          id: `n-${Math.random().toString(36).slice(2, 7)}`,
          titleAr: "تمت الصفقة",
          bodyAr: `أصبح ${listing.issuer} ضمن محفظتك.`,
          at: "الآن",
          userId: action.buyerId,
          read: false,
          tone: "success",
        },
      ];
      if (listing.sellerId !== "anon") {
        notes.unshift({
          id: `n-${Math.random().toString(36).slice(2, 7)}`,
          titleAr: "تم بيع عرضك",
          bodyAr: `تمت تسوية ${price.toLocaleString("en-US")} ر.س في محفظتك.`,
          at: "الآن",
          userId: listing.sellerId as PersonaId,
          read: false,
          tone: "success",
        });
      }

      /* أمر البيع المعلّق يصبح مكتملًا بعد التسوية */
      const settledExisting = state.transactions.map((t) =>
        t.listingId === listing.id && t.status === "pending"
          ? { ...t, status: "completed" as const, subtitleAr: `${t.subtitleAr} · تمت المطابقة والتسوية` }
          : t,
      );

      return {
        ...state,
        users: nextUsers,
        investments,
        listings: state.listings.map((l) =>
          l.id === listing.id ? { ...l, status: "sold" as const, buyerId: action.buyerId } : l,
        ),
        transactions: [...txs, ...settledExisting],
        notifications: [...notes, ...state.notifications],
        lastDeal: {
          listingId: listing.id,
          issuer: listing.issuer,
          faceValue: listing.faceValue,
          price,
          discount: listing.discount,
          buyerReturn: listing.estimatedBuyerReturn,
          remainingMonths: listing.remainingMonths,
          sellerId: (listing.sellerId === "anon" ? "mohammed" : listing.sellerId) as PersonaId,
          buyerId: action.buyerId,
          txRef: ref,
          at,
        },
      };
    }

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */

interface Ctx extends State {
  me: User;
  dispatch: React.Dispatch<Action>;
  setPersona: (p: PersonaId) => void;
  toast: (t: Omit<Toast, "id">) => void;
  reset: () => void;
  myInvestments: Investment[];
  openListings: Listing[];
  ready: boolean;
}

const StoreContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "sayyal-demo-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.investments && parsed.listings) {
          dispatch({ type: "HYDRATE", state: parsed });
        }
      }
    } catch {
      /* التخزين غير متاح — نكمل بالحالة الافتراضية */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const { toasts: _toasts, ...persisted } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      /* تجاهل */
    }
  }, [state, ready]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    dispatch({ type: "PUSH_TOAST", toast: { ...t, id } });
    window.setTimeout(() => dispatch({ type: "DISMISS_TOAST", id }), 4200);
  }, []);

  const setPersona = useCallback((p: PersonaId) => dispatch({ type: "SET_PERSONA", persona: p }), []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* تجاهل */
    }
    dispatch({ type: "RESET" });
  }, []);

  const value = useMemo<Ctx>(() => {
    const me = state.users[state.persona];
    return {
      ...state,
      me,
      dispatch,
      setPersona,
      toast,
      reset,
      ready,
      myInvestments: state.investments.filter((i) => i.ownerId === state.persona),
      openListings: state.listings.filter((l) => l.status === "open"),
    };
  }, [state, setPersona, toast, reset, ready]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
