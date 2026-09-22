"use client";

import { useMemo } from "react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { getCountryTableColumns } from "../config/country.columns";
import { useCountryDialogs } from "../hooks/use-country-table-dialogs";
import { useCountryTableFilters } from "../hooks/use-country-table-filters";
import { CountryTableView } from "./CountryTableView";

export function CountryTable({ data, pagination }) {
  const { can } = usePermission();
  const dialogState = useCountryDialogs();

  const { isPending, filters, paginationState, sortConfig, handlers } =
    useCountryTableFilters(pagination);

  const columns = useMemo(
    () => getCountryTableColumns(dialogState.handleEdit, dialogState.handleDelete, can),
    [can, dialogState.handleEdit, dialogState.handleDelete]
  );

  return (
    <CountryTableView
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
