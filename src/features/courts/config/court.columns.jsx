"use client";

import { createActionsColumn } from "@/components/shared/TableUtils";
import { Warehouse, Check, X } from "lucide-react";
import { COURT_CONFIG } from "./court.constants";

export const getCourtTableColumns = (onEdit, onDelete, can, isPending) => {
  const { LABELS } = COURT_CONFIG.UI;

  const renderBoolean = (value) =>
    value ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/40" />
    );

  return [
    {
      accessorKey: "name",
      header: LABELS.TABLE.NAME,
      width: "180",
      noTruncate: true,
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0" title={row.name || ""}>
          <Warehouse className="h-4 w-4 text-primary/70 shrink-0" />
          <span className="font-medium text-foreground truncate">{row.name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      accessorKey: "sport",
      header: LABELS.TABLE.SPORT,
      width: "120",
      cell: (row) => row.sport || <span className="text-muted-foreground">—</span>,
      sortable: true,
    },
    {
      accessorKey: "managerName",
      header: LABELS.TABLE.MANAGER,
      width: "160",
      cell: (row) => row.managerName || <span className="text-muted-foreground">—</span>,
      sortable: false,
    },
    {
      accessorKey: "hourlyRate",
      header: LABELS.TABLE.HOURLY_RATE,
      width: "90",
      cell: (row) =>
        row.hourlyRate != null ? (
          <span className="font-mono text-xs">{Number(row.hourlyRate).toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortable: false,
    },
    {
      accessorKey: "isActive",
      header: LABELS.TABLE.IS_ACTIVE,
      width: "80",
      cell: (row) => renderBoolean(row.isActive),
      sortable: true,
    },
    createActionsColumn({
      onEdit,
      onDelete,
      can,
      permissions: COURT_CONFIG.PERMISSIONS,
      isFetching: isPending,
      labels: { ACTIONS: LABELS.TABLE.ACTIONS }
    }),
  ];
};
