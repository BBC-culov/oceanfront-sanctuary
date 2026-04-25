// Centralized booking status configuration
import { Clock, CheckCircle2, XCircle, ShieldCheck, BadgeCheck, AlertCircle } from "lucide-react";

export type BookingStatus =
  | "pending"
  | "incomplete"
  | "awaiting_verification"
  | "confirmed"
  | "paid"
  | "cancelled";

export interface StatusConfig {
  label: string;
  description: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
  /** Tailwind color used for solid notification dots */
  dot: string;
  /** Whether this status counts as "needs admin attention" in notifications */
  needsAttention: boolean;
}

export const BOOKING_STATUS: Record<BookingStatus, StatusConfig> = {
  pending: {
    label: "In attesa",
    description: "Prenotazione creata, in attesa di pagamento",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    needsAttention: true,
  },
  incomplete: {
    label: "Non conclusa",
    description: "Pagamento iniziato dal cliente ma non completato",
    icon: AlertCircle,
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    needsAttention: true,
  },
  awaiting_verification: {
    label: "Da verificare",
    description: "Pagamento ricevuto, in attesa di conferma manuale dell'admin",
    icon: ShieldCheck,
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
    needsAttention: true,
  },
  confirmed: {
    label: "Confermata",
    description: "Confermata manualmente dall'admin",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    needsAttention: false,
  },
  paid: {
    label: "Saldata",
    description: "Pagamento completo registrato",
    icon: BadgeCheck,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",
    dot: "bg-green-600",
    needsAttention: false,
  },
  cancelled: {
    label: "Cancellata",
    description: "Prenotazione annullata",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
    needsAttention: false,
  },
};

export const getStatusConfig = (status: string): StatusConfig =>
  BOOKING_STATUS[status as BookingStatus] ?? BOOKING_STATUS.pending;

/** Statuses that require admin attention (used for notification badges) */
export const ATTENTION_STATUSES: BookingStatus[] = (
  Object.entries(BOOKING_STATUS) as [BookingStatus, StatusConfig][]
)
  .filter(([, cfg]) => cfg.needsAttention)
  .map(([k]) => k);

export const PAYMENT_METHODS = [
  { value: "cash", label: "Contanti" },
  { value: "on_arrival", label: "Pagamento all'arrivo" },
  { value: "bank_transfer", label: "Bonifico bancario" },
  { value: "other", label: "Altro" },
] as const;

export const getPaymentMethodLabel = (method: string, customMethod?: string | null): string => {
  if (method === "other" && customMethod) return customMethod;
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
};
