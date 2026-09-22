"use client";

import { DataTable } from "@/components/shared/table/DataTable";
import { AuditLogToolbar } from "./AuditLogToolbar";
import { AUDIT_LOG_CONFIG } from "../config/audit-log.constants";

export function AuditLogTableView({
  items,
  isPending,
  pagination,
  filters,
  sortConfig,
  handlers,
  columns,
}) {
  const { LABELS } = AUDIT_LOG_CONFIG.UI;

  return (
    <div className="space-y-4">
      <AuditLogToolbar
        searchTerm={filters.searchTerm}
        onSearchChange={handlers.handleSearchChange}
        onReset={handlers.handleReset}
      />

      <DataTable
        data={items || []}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handlers.handleSortChange}
        emptyMessage={filters.searchTerm ? LABELS.TABLE.EMPTY_SEARCH : LABELS.TABLE.EMPTY}
        isLoading={isPending}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: handlers.handlePageChange,
          currentCount: (items || []).length,
          totalCount: pagination.totalCount,
          entityName: LABELS.TABLE.NAME.toLowerCase(),
        }}
      />
    </div>
  );
}
