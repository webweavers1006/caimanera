"use client";

import { createActionsColumn } from "@/components/shared/TableUtils";
import { Globe } from "lucide-react";
import { COUNTRY_CONFIG } from "./country.constants";

export const getCountryTableColumns = (onEdit, onDelete, can, isPending) => {
  const { LABELS } = COUNTRY_CONFIG.UI;

  return [
    {
      accessorKey: "name",
      header: LABELS.TABLE.NAME,
      width: "200",
      noTruncate: true,
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0" title={row.name || ""}>
          <Globe className="h-4 w-4 text-primary/70 shrink-0" />
          <span className="font-medium text-foreground truncate">{row.name}</span>
        </div>
      ),
      sortable: true,
    },
    createActionsColumn({
      onEdit,
      onDelete,
      can,
      permissions: COUNTRY_CONFIG.PERMISSIONS,
      isFetching: isPending,
      labels: { ACTIONS: LABELS.TABLE.ACTIONS }
    }),
  ];
};
