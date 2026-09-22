"use client";

import { Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PERMISSION_CONFIG } from "./permission.constants";
import { createActionsColumn } from "@/components/shared/TableUtils";

export const getPermissionTableColumns = (onEdit, onDelete, can = () => true, isPending = false) => {
  const { PERMISSIONS, UI } = PERMISSION_CONFIG;
  const { LABELS } = UI;

  return [
    {
      header: LABELS.TABLE.SLUG,
      accessorKey: "slug",
      width: "200",
      sortable: true,
      noTruncate: true,
      cell: (item) => (
        <div className="flex items-center gap-2 min-w-0" title={item.slug || ""}>
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded truncate">{item.slug}</code>
        </div>
      ),
    },
    {
      header: LABELS.TABLE.DESCRIPTION,
      accessorKey: "description",
      width: "300",
      sortable: false,
      cell: (item) => (
        <span
          className="text-muted-foreground/70 truncate block"
          title={item.description}
        >
          {item.description || "-"}
        </span>
      ),
    },
    {
      header: LABELS.TABLE.ROLES,
      accessorKey: "rolesCount",
      width: "80",
      sortable: true,
      noTruncate: true,
      cell: (item) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{item.rolesCount ?? 0}</span>
        </div>
      ),
    },
    createActionsColumn({
      onEdit,
      onDelete,
      can,
      permissions: PERMISSIONS,
      isFetching: isPending,
      labels: { ACTIONS: LABELS.TABLE.ACTIONS },
    }),
  ].filter(Boolean);
};
