"use client";

import { ReceiptText, UserRound } from "lucide-react";
import { formatDate } from "@/features/shared/lib/date-format";
import { formatPrice } from "@/features/shared/lib/format";
import {
  PAYMENT_CONFIG,
  getPaymentMethodLabel,
  getPaymentTypeLabel,
} from "@/features/payments/config/payment.constants";
import { TRANSACTION_CONFIG } from "./transaction.constants";
import { TransactionConfirmButton } from "../components/TransactionConfirmButton";

const { LABELS } = TRANSACTION_CONFIG.UI;

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        PAYMENT_CONFIG.STATUS_BADGES[status] || "bg-muted text-muted-foreground"
      }`}
    >
      {PAYMENT_CONFIG.STATUS[status] || status}
    </span>
  );
}

export const getTransactionTableColumns = () => [
  {
    accessorKey: "userName",
    header: LABELS.TABLE.USER,
    width: "180",
    noTruncate: true,
    cell: (row) => (
      <div className="flex items-center gap-2 min-w-0" title={row.userName || ""}>
        <UserRound className="h-4 w-4 shrink-0 text-primary/70" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.userName || "—"}</p>
          {row.userEmail && (
            <p className="truncate text-[11px] text-muted-foreground">{row.userEmail}</p>
          )}
        </div>
      </div>
    ),
    sortable: false,
  },
  {
    accessorKey: "concept",
    header: LABELS.TABLE.CONCEPT,
    width: "220",
    noTruncate: true,
    cell: (row) => (
      <div className="flex items-center gap-2 min-w-0">
        <ReceiptText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm">{row.concept}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {getPaymentTypeLabel(row.type)}
          </p>
        </div>
      </div>
    ),
    sortable: false,
  },
  {
    accessorKey: "amount",
    header: LABELS.TABLE.AMOUNT,
    width: "100",
    cell: (row) => (
      <span className="text-sm font-semibold">
        {formatPrice(row.amount, { currency: row.currency || "USD" })}
      </span>
    ),
    sortable: true,
  },
  {
    accessorKey: "method",
    header: LABELS.TABLE.METHOD,
    width: "160",
    cell: (row) => (
      <span className="text-xs text-muted-foreground">
        {getPaymentMethodLabel(row.method)}
      </span>
    ),
    sortable: false,
  },
  {
    accessorKey: "status",
    header: LABELS.TABLE.STATUS,
    width: "110",
    cell: (row) => <StatusBadge status={row.status} />,
    sortable: true,
  },
  {
    accessorKey: "createdAt",
    header: LABELS.TABLE.DATE,
    width: "140",
    cell: (row) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(row.createdAt, "dd/MM/yyyy HH:mm")}
      </span>
    ),
    sortable: true,
  },
  {
    id: "actions",
    header: LABELS.TABLE.ACTIONS,
    width: "120",
    noTruncate: true,
    cell: (row) =>
      row.status === "PENDING" ? (
        <TransactionConfirmButton transactionId={row.id} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];
