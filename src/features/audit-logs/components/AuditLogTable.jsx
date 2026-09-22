"use client";

import { useMemo } from "react";
import { getAuditLogTableColumns } from "../config/audit-log.columns";
import { useAuditLogTableFilters } from "../hooks/use-audit-log-table-filters";
import { AuditLogTableView } from "./AuditLogTableView";

export function AuditLogTable({ data, pagination }) {
  const { isPending, filters, paginationState, sortConfig, handlers } =
    useAuditLogTableFilters(pagination);

  const columns = useMemo(() => getAuditLogTableColumns(), []);

  return (
    <AuditLogTableView
      items={data}
      isPending={isPending}
      pagination={paginationState}
      filters={filters}
      sortConfig={sortConfig}
      handlers={handlers}
      columns={columns}
    />
  );
}
