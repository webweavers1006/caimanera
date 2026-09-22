"use client";

import { useMemo } from "react";
import { usePermissionTableFilters } from "../hooks/use-permission-table-filters";
import { usePermissionTableDialogs } from "../hooks/use-permission-table-dialogs";
import { getPermissionTableColumns } from "../config/permission.columns";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { PermissionTableView } from "./PermissionTableView";

export function PermissionTable({ data, pagination }) {
  const { can } = usePermission();

  const { isPending, filters, paginationState, sortConfig, handlers } =
    usePermissionTableFilters(pagination);

  const dialogState = usePermissionTableDialogs();

  const columns = useMemo(
    () =>
      getPermissionTableColumns(
        dialogState.handleEdit,
        dialogState.handleDelete,
        can,
        dialogState.isFetching
      ),
    [dialogState.handleEdit, dialogState.handleDelete, can, dialogState.isFetching]
  );

  return (
    <PermissionTableView
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
