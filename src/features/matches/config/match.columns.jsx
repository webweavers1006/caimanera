"use client";

import { createActionsColumn } from "@/components/shared/TableUtils";
import { Trophy, Eye } from "lucide-react";
import { MATCH_CONFIG } from "./match.constants";

export const getMatchTableColumns = (onEdit, onDelete, can, isPending, onView) => {
  const { LABELS } = MATCH_CONFIG.UI;
  const { STATUS } = MATCH_CONFIG;

  const renderStatus = (value) => (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS.BADGES[value] || "bg-slate-100 text-slate-700"}`}
    >
      {STATUS.LABELS[value] || value}
    </span>
  );

  return [
    {
      accessorKey: "title",
      header: LABELS.TABLE.TITLE,
      width: "220",
      noTruncate: true,
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0" title={row.title || ""}>
          <Trophy className="h-4 w-4 text-primary/70 shrink-0" />
          <span className="font-medium text-foreground truncate">{row.title}</span>
        </div>
      ),
      sortable: true,
    },
    {
      accessorKey: "sport",
      header: LABELS.TABLE.SPORT,
      width: "110",
      cell: (row) => row.sport || <span className="text-muted-foreground">—</span>,
      sortable: true,
    },
    {
      accessorKey: "scheduledAt",
      header: LABELS.TABLE.SCHEDULED_AT,
      width: "140",
      cell: (row) =>
        row.scheduledAtDisplay || <span className="text-muted-foreground">—</span>,
      sortable: true,
    },
    {
      accessorKey: "hostName",
      header: LABELS.TABLE.HOST,
      width: "160",
      cell: (row) => row.hostName || <span className="text-muted-foreground">—</span>,
      sortable: false,
    },
    {
      accessorKey: "courtName",
      header: LABELS.TABLE.COURT,
      width: "160",
      cell: (row) => row.courtName || <span className="text-muted-foreground">—</span>,
      sortable: false,
    },
    {
      accessorKey: "status",
      header: LABELS.TABLE.STATUS,
      width: "110",
      cell: (row) => renderStatus(row.status),
      sortable: true,
    },
    {
      accessorKey: "capacity",
      header: LABELS.TABLE.CAPACITY,
      width: "70",
      cell: (row) =>
        row.capacity != null ? row.capacity : <span className="text-muted-foreground">—</span>,
      sortable: true,
    },
    createActionsColumn({
      onEdit,
      onDelete,
      can,
      permissions: MATCH_CONFIG.PERMISSIONS,
      isFetching: isPending,
      labels: { ACTIONS: LABELS.TABLE.ACTIONS },
      extraActions: [
        {
          label: LABELS.TABLE.VIEW,
          icon: Eye,
          onClick: onView,
          show: () => true,
        },
      ],
    }),
  ];
};
