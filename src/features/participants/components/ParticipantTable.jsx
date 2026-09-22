"use client";

import { useMemo } from "react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { getParticipantTableColumns } from "../config/participant.columns";
import { useParticipantDialogs } from "../hooks/use-participant-table-dialogs";
import { useParticipantTableFilters } from "../hooks/use-participant-table-filters";
import { ParticipantTableView } from "./ParticipantTableView";

export function ParticipantTable({ data, pagination }) {
  const { can } = usePermission();
  const dialogState = useParticipantDialogs();

  const { isPending, filters, paginationState, sortConfig, handlers } =
    useParticipantTableFilters(pagination);

  const columns = useMemo(
    () => getParticipantTableColumns(dialogState.handleEdit, dialogState.handleDelete, can),
    [can, dialogState.handleEdit, dialogState.handleDelete]
  );

  return (
    <ParticipantTableView
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
