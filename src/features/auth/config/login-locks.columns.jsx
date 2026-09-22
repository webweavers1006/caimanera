"use client";

import { Loader2, Unlock } from "lucide-react";
import { createActionsColumn } from "@/components/shared/TableUtils";
import { AUTH_CONFIG } from "./auth.constants";

/**
 * Table columns for the login-locks admin panel.
 *
 * Uses the standard createActionsColumn with a single custom action
 * (unlock) via extraActions — no edit/delete in this diagnostic panel.
 */
export const getLoginLocksTableColumns = ({ onUnlock, isPending = false }) => {
  const { UI } = AUTH_CONFIG.LOGIN_LOCKS;
  const { LABELS } = UI;

  return [
    {
      header: LABELS.TABLE_IP,
      accessorKey: "ip",
      width: "220",
      sortable: true,
      noTruncate: true,
      cell: (item) => <span className="font-mono text-sm">{item.ip}</span>,
    },
    {
      header: LABELS.TABLE_ATTEMPTS,
      accessorKey: "attempts",
      width: "100",
      sortable: true,
      cell: (item) => <span>{item.attempts}</span>,
    },
    {
      header: LABELS.TABLE_RESETS_AT,
      accessorKey: "resetTimeLabel",
      sortable: false,
      cell: (item) => (
        <span className="text-muted-foreground">{item.resetTimeLabel}</span>
      ),
    },
    createActionsColumn({
      can: () => false,
      permissions: {},
      labels: { ACTIONS: LABELS.TABLE_ACTIONS },
      extraActions: [
        {
          label: LABELS.UNLOCK,
          icon: isPending ? Loader2 : Unlock,
          onClick: (item) => onUnlock(item),
          className: isPending ? "animate-spin" : "",
        },
      ],
    }),
  ];
};
