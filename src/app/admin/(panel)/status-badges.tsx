import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/utils";

type Tone = "green" | "red" | "amber" | "grey" | "blue";

const orderTones: Record<string, Tone> = {
  pending: "amber",
  confirmed: "blue",
  preparing: "blue",
  ready_for_pickup: "blue",
  out_for_delivery: "blue",
  completed: "green",
  cancelled: "red",
};

const paymentTones: Record<string, Tone> = {
  pending: "amber",
  paid: "green",
  failed: "red",
  refunded: "red",
  cash_on_delivery: "grey",
};

const prescriptionTones: Record<string, Tone> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
  clarification_requested: "blue",
};

export const PRESCRIPTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  clarification_requested: "Clarification Requested",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={orderTones[status] ?? "grey"}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={paymentTones[status] ?? "grey"}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PrescriptionStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={prescriptionTones[status] ?? "grey"}>
      {PRESCRIPTION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
