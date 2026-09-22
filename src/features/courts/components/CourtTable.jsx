"use client";

import { useMemo } from "react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { getCourtTableColumns } from "../config/court.columns";
import { useCourtDialogs } from "../hooks/use-court-table-dialogs";
import { useCourtTableFilters } from "../hooks/use-court-table-filters";
import { CourtTableView } from "./CourtTableView";

export function CourtTable({ data, pagination }) {
  const { can } = usePermission();
  const dialogState = useCourtDialogs();

  const { isPending, filters, paginationState, sortConfig, handlers } =
    useCourtTableFilters(pagination);

  const columns = useMemo(
    () => getCourtTableColumns(dialogState.handleEdit, dialogState.handleDelete, can),
    [can, dialogState.handleEdit, dialogState.handleDelete]
  );

  return (
    <CourtTableView
      items={data}
      isPending={isPending}
      pagination={paginationState}
      filters={filters}
      sortConfig={sortConfig}
      handlers={handlers}
      dialogState={dialogState}
      columns={columns}
    />
  );
}
