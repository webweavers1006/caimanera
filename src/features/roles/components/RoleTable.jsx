"use client";

import { useMemo } from "react";
import { useRoleTableFilters } from "../hooks/use-role-table-filters";
import { useRoleTableDialogs } from "../hooks/use-role-table-dialogs";
import { getRoleTableColumns } from "../config/role.columns";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { RoleTableView } from "./RoleTableView";

export function RoleTable({ data, pagination }) {
  const { can } = usePermission();
  
  // Sincronización con URL para filtros, paginación y ordenamiento
  const { isPending, filters, paginationState, sortConfig, handlers } = 
    useRoleTableFilters(pagination);

  const dialogState = useRoleTableDialogs();

  const columns = useMemo(
    () => getRoleTableColumns(dialogState.handleEdit, dialogState.handleDelete, can, dialogState.isFetching),
    [dialogState.handleEdit, dialogState.handleDelete, can, dialogState.isFetching]
  );

  return (
    <RoleTableView
      data={data}
      isPending={isPending}
      filters={filters}
      pagination={paginationState}
      sortConfig={sortConfig}
      handlers={handlers}
      dialogState={dialogState}
      columns={columns}
    />
  );
}
