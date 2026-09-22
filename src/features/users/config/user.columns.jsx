"use client";

import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { USER_CONFIG } from "./user.constants";
import { createActionsColumn } from "@/components/shared/TableUtils";
import { formatDate } from "@/features/shared/lib/date-format";

export const getUserTableColumns = (onEdit, onDelete, can = () => false, isPending = false) => {
  const { PERMISSIONS, UI } = USER_CONFIG;
  const { LABELS } = UI;

  return [
    {
      header: LABELS.TABLE.NAME,
      accessorKey: "firstName",
      sortable: true,
      width: "250",
      noTruncate: true,
      cell: (user) => {
        const fullName = `${user.firstName} ${user.lastName}`;
        return (
        <div className="flex items-center gap-2 min-w-0" title={fullName}>
          <User className="h-4 w-4 text-primary/70 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{fullName}</span>
            <span className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{user.email}</span>
          </div>
        </div>
        );
      },
    },
    {
      header: LABELS.TABLE.ROLE,
      accessorKey: "role",
      width: "150",
      sortable: true,
      noTruncate: true,
      cell: (user) => (
        <Badge variant="outline" className="text-[10px] font-medium">
          {user.role?.name || UI.LABELS.NO_ROLE}
        </Badge>
      ),
    },
    {
      header: LABELS.TABLE.STATUS,
      accessorKey: "deletedAt",
      width: "100",
      sortable: true,
      noTruncate: true,
      cell: (user) => (
        <Badge variant={user.deletedAt ? UI.BADGE_VARIANTS.INACTIVE : UI.BADGE_VARIANTS.ACTIVE} className="text-[10px]">
          {user.deletedAt ? UI.LABELS.INACTIVE : UI.LABELS.ACTIVE}
        </Badge>
      ),
    },
    {
      header: LABELS.TABLE.UPDATED_AT,
      accessorKey: "updatedAt",
      sortable: true,
      width: "160",
      noTruncate: true,
      cell: (user) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(user.updatedAt, "dd/MM/yyyy HH:mm")}
        </span>
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
