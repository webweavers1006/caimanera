import { CalendarClock, CreditCard, Hash, ReceiptText } from "lucide-react";
import { formatDate } from "@/features/shared/lib/date-format";
import { formatPrice, formatVes } from "@/features/shared/lib/format";
import {
  PAYMENT_CONFIG,
  getPaymentMethodLabel,
  getPaymentTypeLabel,
} from "../../config/payment.constants";

const { PLAYER } = PAYMENT_CONFIG.UI;

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        PAYMENT_CONFIG.STATUS_BADGES[status] || "bg-muted text-muted-foreground"
      }`}
    >
      {PAYMENT_CONFIG.STATUS[status] || status}
    </span>
  );
}

function PaymentItem({ payment }) {
  const ves = Number(payment.amountVes) || null;

  return (
    <article className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ReceiptText className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{payment.concept}</p>
              <p className="text-[11px] text-muted-foreground">
                {getPaymentTypeLabel(payment.type)}
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold">
            {formatPrice(payment.amount, { currency: payment.currency || "USD" })}
          </p>
          {ves ? (
            <p className="text-[10px] text-muted-foreground">{formatVes(ves)}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5" />
          {formatDate(payment.createdAt, "dd/MM/yyyy HH:mm")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CreditCard className="size-3.5" />
          {getPaymentMethodLabel(payment.method)}
        </span>
        {payment.reference && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Hash className="size-3.5 shrink-0" />
            <span className="truncate">{payment.reference}</span>
          </span>
        )}
        <span className="ml-auto">
          <StatusBadge status={payment.status} />
        </span>
      </div>
    </article>
  );
}

export function PlayerPaymentsView({ payments = [] }) {
  const hasPending = payments.some((payment) => payment.status === "PENDING");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {PLAYER.EYEBROW}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{PLAYER.TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{PLAYER.SUBTITLE}</p>
      </header>

      {hasPending && (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200">
          {PLAYER.PENDING_NOTE}
        </p>
      )}

      {payments.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-12 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ReceiptText className="size-6" />
          </span>
          <h2 className="text-lg font-semibold">{PLAYER.EMPTY_TITLE}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {PLAYER.EMPTY_DESCRIPTION}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {payments.map((payment) => (
            <PaymentItem key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}
