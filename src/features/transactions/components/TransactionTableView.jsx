"use client";

import { DataTable } from "@/components/shared/table/DataTable";
import { TransactionToolbar } from "./TransactionToolbar";
import { TRANSACTION_CONFIG } from "../config/transaction.constants";

const { LABELS } = TRANSACTION_CONFIG.UI;

export function TransactionTableView({
  items,
  isPending,
  pagination,
  filters,
  sortConfig,
  handlers,
  columns,
}) {
  return (
    <div className="space-y-4">
      <TransactionToolbar
        searchTerm={filters.searchTerm}
        onSearchChange={handlers.handleSearchChange}
        onReset={handlers.handleReset}
      />

      <DataTable
        data={items || []}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handlers.handleSortChange}
        emptyMessage={
          filters.searchTerm ? LABELS.TABLE.EMPTY_SEARCH : LABELS.TABLE.EMPTY
        }
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
