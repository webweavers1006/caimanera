"use client";

import { useCallback } from "react";
import { DataTable } from "@/components/shared/table/DataTable";
import { UserToolbar } from "./UserToolbar";
import { UserTableDialogs } from "./UserTableDialogs";
import { useUserSelection } from "../hooks/use-user-selection";
import { USER_CONFIG } from "../config/user.constants";

export function UserTableView({
  users,
  isPending,
  pagination,
  filters,
  sortConfig,
  handlers,
  dialogState,
  columns,
  onSendAll,
  onSendSelected,
  onDownloadPdf,
  onDownloadPdfSelected,
  isDownloadingPdf,
  onDownloadExcel,
  onDownloadExcelSelected,
  isDownloadingExcel,
}) {
  const { UI: { LABELS: { TABLE } } } = USER_CONFIG;

  const {
    open,
    onOpenChange,
    editingUser,
    deletingUser,
    setDeletingUser,
    handleCreate,
    handleSuccess
  } = dialogState;

  const selection = useUserSelection(users || []);

  const handleSendSelected = useCallback(() => {
    onSendSelected?.([...selection.selectedIds]);
  }, [selection.selectedIds, onSendSelected]);

  const handleDownloadSelected = useCallback(() => {
    onDownloadPdfSelected?.([...selection.selectedIds]);
  }, [selection.selectedIds, onDownloadPdfSelected]);

  const handleDownloadExcelSelected = useCallback(() => {
    onDownloadExcelSelected?.([...selection.selectedIds]);
  }, [selection.selectedIds, onDownloadExcelSelected]);

  return (
    <div className="space-y-4">
      <UserToolbar
        searchTerm={filters?.searchTerm || ""}
        onSearchChange={handlers.handleSearchChange}
        filters={filters}
        handlers={handlers}
        onReset={handlers.handleReset}
        onCreate={handleCreate}
        onSendCredentials={onSendAll}
        selectedCount={selection.selectedIds.size}
        onSendSelected={handleSendSelected}
        onDownloadPdf={onDownloadPdf}
        onDownloadPdfSelected={handleDownloadSelected}
        isDownloadingPdf={isDownloadingPdf}
        onDownloadExcel={onDownloadExcel}
        onDownloadExcelSelected={handleDownloadExcelSelected}
        isDownloadingExcel={isDownloadingExcel}
      />

      <DataTable
        data={users || []}
        columns={columns}
        selection={selection}
        sortConfig={sortConfig}
        onSort={handlers.handleSortChange}
        emptyMessage={(filters?.searchTerm || "") ? TABLE.EMPTY_SEARCH : TABLE.EMPTY_DATA}
        isLoading={isPending}
        pagination={{
          currentPage: pagination?.currentPage || 1,
          totalPages: pagination?.totalPages || 1,
          onPageChange: handlers.handlePageChange,
          currentCount: (users || []).length,
          totalCount: pagination?.totalCount || 0,
          entityName: TABLE.ENTITY_NAME,
        }}
      />

      <UserTableDialogs
        open={open}
        onOpenChange={onOpenChange}
        editingUser={editingUser}
        deletingUser={deletingUser}
        setDeletingUser={setDeletingUser}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

