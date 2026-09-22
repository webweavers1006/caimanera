"use client";

import { MatchToolbar } from "./MatchToolbar";
import { MatchCardGrid } from "./MatchCardGrid";
import { MatchTableDialogs } from "./MatchTableDialogs";

export function MatchTableView({
  items,
  isPending,
  pagination,
  filters,
  handlers,
  dialogState,
}) {
  return (
    <div className="space-y-4">
      <MatchToolbar
        searchTerm={filters.searchTerm}
        onSearchChange={handlers.handleSearchChange}
        onReset={handlers.handleReset}
        onCreate={dialogState.handleCreate}
      />

      <MatchCardGrid
        items={items}
        isPending={isPending}
        pagination={pagination}
        filters={filters}
        handlers={handlers}
      />

      <MatchTableDialogs
        open={dialogState.open}
        onOpenChange={dialogState.onOpenChange}
        editingItem={dialogState.editingItem}
        deletingItem={dialogState.deletingItem}
        setDeletingItem={dialogState.setDeletingItem}
        onSuccess={dialogState.handleSuccess}
      />
    </div>
  );
}
