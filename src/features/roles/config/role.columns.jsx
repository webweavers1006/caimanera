"use client";

import { Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLE_CONFIG } from "./role.constants";
import { createActionsColumn } from "@/components/shared/TableUtils";

export const getRoleTableColumns = (onEdit, onDelete, can = () => true, isPending = false) => {
  const { PERMISSIONS, UI } = ROLE_CONFIG;
  const { LABELS } = UI;

  return [
    {
      header: LABELS.TABLE.NAME,
      accessorKey: "name",
      width: "180",
      sortable: true,
      noTruncate: true,
      cell: (item) => (
        <div className="flex items-center gap-2 min-w-0" title={item.name || ""}>
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium truncate">{item.name}</span>
        </div>
      ),
    },
    {
      header: LABELS.TABLE.DESCRIPTION,
      accessorKey: "description",
      width: "250",
      sortable: false,
      cell: (item) => (
        <span className="text-muted-foreground/70 truncate block" title={item.description}>
          {item.description || "-"}
        </span>
      ),
    },
    {
      header: LABELS.TABLE.USERS,
      accessorKey: "usersCount",
      width: "80",
      sortable: true,
      noTruncate: true,
      cell: (item) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{item.usersCount}</span>
        </div>
      ),
    },
    {
      header: LABELS.TABLE.PERMISSIONS,
      accessorKey: "permissions",
      width: "300",
      sortable: false,
      noTruncate: true,
      cell: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.permissions?.slice(0, UI.MAX_VISIBLE_PERMISSIONS).map((p) => (
            <Badge key={p.id} variant="outline" className="text-[10px]">
              {p.slug}
            </Badge>
          ))}
          {item.permissions?.length > UI.MAX_VISIBLE_PERMISSIONS && (
            <Badge variant="secondary" className="text-[10px]">
              +{item.permissions.length - UI.MAX_VISIBLE_PERMISSIONS}
            </Badge>
          )}
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
