"use client";

import { ClipboardList } from "lucide-react";
import { AUDIT_LOG_CONFIG } from "./audit-log.constants";
import { formatDate } from "@/features/shared/lib/date-utils";

export const getAuditLogTableColumns = () => {
  const { LABELS } = AUDIT_LOG_CONFIG.UI;

  return [
    {
      accessorKey: "date",
      header: LABELS.TABLE.DATE,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.date)}</span>
      ),
      sortable: true,
    },
    {
      accessorKey: "time",
      header: LABELS.TABLE.TIME,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.time || "—"}</span>
      ),
      sortable: false,
    },
    {
      accessorKey: "userName",
      header: LABELS.TABLE.USER,
      cell: (row) => (
        <span className="text-sm">{row.userName || "Sistema"}</span>
      ),
      sortable: false,
    },
    {
      accessorKey: "action",
      header: LABELS.TABLE.ACTION,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary/70 shrink-0" />
          <span className="text-sm whitespace-pre-wrap">{row.action}</span>
        </div>
      ),
      sortable: false,
    },
  ];
};
