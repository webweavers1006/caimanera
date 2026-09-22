"use client";

import { DataTable } from "@/components/shared/table/DataTable";
import { RoleToolbar } from "./RoleToolbar";
import { RoleTableDialogs } from "./RoleTableDialogs";
import { ROLE_CONFIG } from "../config/role.constants";

export function RoleTableView({
  data,
  isPending,
  filters,
  pagination,
  sortConfig,
  handlers,
  dialogState,
  columns,
}) {
  const { UI } = ROLE_CONFIG;

  return (
    <div className="space-y-4">
      <RoleToolbar
        searchTerm={filters.searchTerm}
        onSearchChange={handlers.handleSearchChange}
        onReset={handlers.handleReset}
        onCreate={dialogState.handleCreate}
      />

      <DataTable
        data={data}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handlers.handleSortChange}
        emptyMessage={filters.searchTerm ? UI.LABELS.TABLE.EMPTY_SEARCH : UI.LABELS.TABLE.EMPTY}
        isLoading={isPending}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: pagination.handlePageChange || handlers.handlePageChange,
          currentCount: data.length,
          totalCount: pagination.totalCount,
          entityName: "roles",
        }}
      />
      
      <RoleTableDialogs
        open={dialogState.open}
        onOpenChange={dialogState.onOpenChange}
        editingRole={dialogState.editingRole}
        deletingRole={dialogState.deletingRole}
        setDeletingRole={dialogState.setDeletingRole}
        onSuccess={dialogState.handleSuccess}
      />
    </div>
  );
}
