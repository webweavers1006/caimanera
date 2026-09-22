"use client";

import { useMemo } from "react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { getSubscriptionTableColumns } from "../config/subscription.columns";
import { useSubscriptionDialogs } from "../hooks/use-subscription-table-dialogs";
import { useSubscriptionTableFilters } from "../hooks/use-subscription-table-filters";
import { SubscriptionTableView } from "./SubscriptionTableView";

export function SubscriptionTable({ data, pagination }) {
  const { can } = usePermission();
  const dialogState = useSubscriptionDialogs();

  const { isPending, filters, paginationState, sortConfig, handlers } =
    useSubscriptionTableFilters(pagination);

  const columns = useMemo(
    () => getSubscriptionTableColumns(dialogState.handleEdit, dialogState.handleDelete, can),
    [can, dialogState.handleEdit, dialogState.handleDelete]
  );

  return (
    <SubscriptionTableView
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
