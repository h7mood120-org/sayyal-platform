export type PlatformId = "sukuk" | "aseel" | "jiad";
export type RiskLevel = "low" | "medium" | "high";
export type AssetType = "sukuk" | "realestate" | "corporate";
export type PersonaId = "mohammed" | "sara";

export interface Platform {
  id: PlatformId;
  nameAr: string;
  nameEn: string;
  logo: string;
  /** brand-neutral accent used for the placeholder logo card */
  accent: string;
  monogram: string;
  descriptorAr: string;
}

export interface User {
  id: PersonaId;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  initials: string;
  /** سيّال wallet balance */
  wallet: number;
  /** linked bank available balance (mock open banking) */
  bankBalance: number;
  bankAccountId: string | null;
  memberSince: string;
  accent: string;
}

export interface Distribution {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "due";
}

export interface Investment {
  id: string;
  issuer: string;
  issuerSub: string;
  platform: PlatformId;
  assetType: AssetType;
  principal: number;
  expectedReturn: number;
  maturityDate: string;
  maturityLabel: string;
  remainingMonths: number;
  totalMonths: number;
  risk: RiskLevel;
  status: "active" | "listed" | "exited";
  ownerId: PersonaId;
  recovered: number;
  remainingPayments: number;
  distributions: Distribution[];
  lockedReason?: string;
  sellable: boolean;
  acquiredVia?: "sayyal" | "platform";
  acquiredAt?: string;
}

export interface Listing {
  id: string;
  investmentId: string;
  sellerId: PersonaId | "anon";
  sellerLabel: string;
  issuer: string;
  issuerSub: string;
  platform: PlatformId;
  assetType: AssetType;
  faceValue: number;
  askingPrice: number;
  sellPortion: number;
  discount: number;
  estimatedBuyerReturn: number;
  remainingMonths: number;
  remainingPayments: number;
  maturityLabel: string;
  risk: RiskLevel;
  listedAt: string;
  status: "open" | "sold" | "cancelled";
  isNew?: boolean;
  buyerId?: PersonaId;
}

export type TxKind = "list" | "buy" | "sell" | "settlement" | "funding" | "distribution";

export interface Transaction {
  id: string;
  kind: TxKind;
  titleAr: string;
  subtitleAr: string;
  amount: number;
  direction: "in" | "out" | "neutral";
  at: string;
  userId: PersonaId;
  platform?: PlatformId;
  status: "completed" | "pending";
  listingId?: string;
}

export interface BankAccount {
  id: string;
  nameAr: string;
  nameEn: string;
  monogram: string;
  accent: string;
  mask: string;
  available: number;
}

export interface AppNotification {
  id: string;
  titleAr: string;
  bodyAr: string;
  at: string;
  userId: PersonaId | "all";
  read: boolean;
  tone: "info" | "success";
}
