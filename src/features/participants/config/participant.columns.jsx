"use client";

import { createActionsColumn } from "@/components/shared/TableUtils";
import { UserRoundCheck } from "lucide-react";
import { PARTICIPANT_CONFIG } from "./participant.constants";

export const getParticipantTableColumns = (onEdit, onDelete, can, isPending) => {
  const { LABELS } = PARTICIPANT_CONFIG.UI;
  const { STATUS, PAYMENT_TYPE } = PARTICIPANT_CONFIG;

  const renderBadge = (value, catalog) => (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${catalog.BADGES[value] || "bg-slate-100 text-slate-700"}`}
    >
      {catalog.LABELS[value] || value}
    </span>
  );

  return [
    {
      accessorKey: "userName",
      header: LABELS.TABLE.USER,
      width: "200",
      noTruncate: true,
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0" title={row.userName || ""}>
          <UserRoundCheck className="h-4 w-4 text-primary/70 shrink-0" />
          <span className="font-medium text-foreground truncate">{row.userName || "—"}</span>
        </div>
      ),
      sortable: false,
    },
    {
      accessorKey: "matchTitle",
      header: LABELS.TABLE.MATCH,
      width: "220",
      cell: (row) => row.matchTitle || <span className="text-muted-foreground">—</span>,
      sortable: false,
    },
    {
      accessorKey: "position",
      header: LABELS.TABLE.POSITION,
      width: "140",
      cell: (row) => row.position || <span className="text-muted-foreground">—</span>,
      sortable: false,
    },
    {
      accessorKey: "status",
      header: LABELS.TABLE.STATUS,
      width: "120",
      cell: (row) => renderBadge(row.status, STATUS),
      sortable: true,
    },
    {
      accessorKey: "paymentType",
      header: LABELS.TABLE.PAYMENT_TYPE,
      width: "140",
      cell: (row) => renderBadge(row.paymentType, PAYMENT_TYPE),
      sortable: true,
    },
    createActionsColumn({
      onEdit,
      onDelete,
      can,
      isPending,
    }),
  ];
};
