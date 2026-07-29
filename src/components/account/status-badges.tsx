import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/utils";
import type { OrderStatus, PaymentStatus, PrescriptionStatus } from "@/lib/types";

type Tone = "green" | "red" | "amber" | "grey" | "blue";

const ORDER_TONES: Record<OrderStatus, Tone> = {
  pending: "amber",
  confirmed: "blue",
  preparing: "blue",
  ready_for_pickup: "green",
  out_for_delivery: "blue",
  completed: "green",
  cancelled: "red",
};

const PAYMENT_TONES: Record<PaymentStatus, Tone> = {
  pending: "amber",
  paid: "green",
  failed: "red",
  refunded: "grey",
  cash_on_delivery: "blue",
};

const PRESCRIPTION_LABELS: Record<PrescriptionStatus, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  clarification_requested: "Clarification Needed",
};

const PRESCRIPTION_TONES: Record<PrescriptionStatus, Tone> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
  clarification_requested: "blue",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_TONES[status]}>{ORDER_STATUS_LABELS[status] ?? status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_TONES[status]}>{PAYMENT_STATUS_LABELS[status] ?? status}</Badge>;
}

export function PrescriptionStatusBadge({ status }: { status: PrescriptionStatus }) {
  return <Badge tone={PRESCRIPTION_TONES[status]}>{PRESCRIPTION_LABELS[status]}</Badge>;
}
