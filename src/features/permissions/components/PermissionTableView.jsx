"use client";

import { DataTable } from "@/components/shared/table/DataTable";
import { PermissionToolbar } from "./PermissionToolbar";
import { PermissionTableDialogs } from "./PermissionTableDialogs";
import { PERMISSION_CONFIG } from "../config/permission.constants";

export function PermissionTableView({
  data,
  isPending,
  filters,
  pagination,
  sortConfig,
  handlers,
  dialogState,
  columns,
}) {
  const { UI } = PERMISSION_CONFIG;

  return (
    <div className="space-y-4">
      <PermissionToolbar
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
          entityName: "permisos",
        }}
      />

      <PermissionTableDialogs
        open={dialogState.open}
        onOpenChange={dialogState.onOpenChange}
        editingPermission={dialogState.editingPermission}
        deletingPermission={dialogState.deletingPermission}
        setDeletingPermission={dialogState.setDeletingPermission}
        onSuccess={dialogState.handleSuccess}
      />
    </div>
  );
}
