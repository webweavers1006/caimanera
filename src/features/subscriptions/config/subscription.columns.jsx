"use client";

import { createActionsColumn } from "@/components/shared/TableUtils";
import { BadgeCheck, Check, X } from "lucide-react";
import { SUBSCRIPTION_CONFIG } from "./subscription.constants";

export const getSubscriptionTableColumns = (onEdit, onDelete, can, isPending) => {
  const { LABELS } = SUBSCRIPTION_CONFIG.UI;
  const { TIER } = SUBSCRIPTION_CONFIG;

  const renderBoolean = (value) =>
    value ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/40" />
    );

  const renderTier = (value) => (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TIER.BADGES[value] || "bg-slate-100 text-slate-700"}`}
    >
      {TIER.LABELS[value] || value}
    </span>
  );

  return [
    {
      accessorKey: "name",
      header: LABELS.TABLE.NAME,
      width: "180",
      noTruncate: true,
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0" title={row.name || ""}>
          <BadgeCheck className="h-4 w-4 text-primary/70 shrink-0" />
          <span className="font-medium text-foreground truncate">{row.name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      accessorKey: "tier",
      header: LABELS.TABLE.TIER,
      width: "120",
      cell: (row) => renderTier(row.tier),
      sortable: true,
    },
    {
      accessorKey: "price",
      header: LABELS.TABLE.PRICE,
      width: "90",
      cell: (row) =>
        row.price != null ? (
          <span className="font-mono text-xs">{Number(row.price).toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortable: true,
    },
    {
      accessorKey: "matchesIncluded",
      header: LABELS.TABLE.MATCHES_INCLUDED,
      width: "130",
      cell: (row) =>
        row.matchesIncluded != null ? row.matchesIncluded : <span className="text-muted-foreground">—</span>,
      sortable: true,
    },
    {
      accessorKey: "priorityBooking",
      header: LABELS.TABLE.PRIORITY_BOOKING,
      width: "130",
      cell: (row) => renderBoolean(row.priorityBooking),
      sortable: true,
    },
    createActionsColumn({
      onEdit,
      onDelete,
      can,
      permissions: SUBSCRIPTION_CONFIG.PERMISSIONS,
      isFetching: isPending,
      labels: { ACTIONS: LABELS.TABLE.ACTIONS }
    }),
  ];
};
