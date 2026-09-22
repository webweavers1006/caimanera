"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { cn } from "@/features/shared";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TablePagination } from "./TablePagination";
import { SortableHeader } from "./SortableHeader";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic reusable table component based on TanStack Table.
 *
 * @param {Object[]} data - Data to display.
 * @param {Object[]} columns - Column configuration.
 * @param {Object} selection - Selection config { selectedIds, onSelectRow, onSelectAll, isAllSelected, isIndeterminate }.
 * @param {Object} pagination - Pagination config { currentPage, totalPages, onPageChange, currentCount, totalCount, entityName }.
 * @param {Object} sortConfig - External sort config { key, direction }.
 * @param {Function} onSort - External sort change handler.
 * @param {string} emptyMessage - Message to show when no data.
 * @param {boolean} isLoading - Loading state for skeleton display.
 * @param {Function} [onRowClick] - Called with (rowData) when a row is clicked.
 * @param {Function} [getRowClassName] - Called with (rowData) to add classes per row.
 */
export function DataTable({
  data = [],
  columns,
  selection,
  pagination,
  sortConfig,
  onSort,
  emptyMessage = "No results found.",
  isLoading = false,
  onRowClick,
  getRowClassName,
}) {
  const [sorting, setSorting] = useState([]);

  // Adapt received columns to TanStack Table format
  const tableColumns = useMemo(() => {
    const cols = [];

    // Selection column
    if (selection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={selection.isAllSelected}
            onCheckedChange={selection.onSelectAll}
            className={selection.isIndeterminate ? "opacity-50" : ""}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selection.selectedIds.has(row.original.id)}
            onCheckedChange={(checked) => selection.onSelectRow(row.original.id, checked)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 50,
      });
    }

    // Dynamic columns — filter out null/undefined entries from conditional spreads
    const dynamicCols = columns.filter(Boolean).map((col) => ({
      accessorKey: col.accessorKey,
      id: col.id || col.accessorKey,
      sticky: col.sticky,
      header: ({ column }) => (
        <SortableHeader
          column={column}
          sortConfig={sortConfig}
          onSort={onSort}
          sortable={col.sortable}
          sortKey={col.sortKey || col.accessorKey}
          className={col.className}
        >
          {col.header}
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const content = col.cell ? col.cell(row.original) : row.getValue(col.accessorKey);

        // Columns with complex layouts (badges, icons, flex) opt out of auto-truncation
        if (col.noTruncate) {
          return <div className={col.cellClassName}>{content}</div>;
        }

        // Auto-truncation for text-based columns — prevents layout overflow
        const textContent = typeof content === "string" || typeof content === "number" ? String(content) : "";
        return (
          <div className={`max-w-[200px] truncate ${col.cellClassName || ""}`} title={textContent || undefined}>
            {content}
          </div>
        );
      },
      enableSorting: col.sortable,
      size: col.width ? parseInt(col.width) : undefined,
    }));

    return [...cols, ...dynamicCols];
  }, [columns, selection, onSort, sortConfig]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader className="data-table-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSticky = header.column.columnDef.sticky;
                  return (
                  <TableHead 
                    key={header.id}
                    className={cn(
                      header.column.columnDef.headerClassName,
                      isSticky ? "sticky right-0 z-10 bg-card border-l border-border" : ""
                    )}
                    style={{
                      width: header.column.columnDef.size,
                      minWidth: header.column.columnDef.size,
                      maxWidth: header.column.columnDef.size,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <React.Fragment>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={selection?.selectedIds?.has(row.original.id) && "selected"}
                    className={
                      cn(
                        isLoading
                          ? "opacity-40 pointer-events-none select-none transition-opacity duration-500"
                          : "data-table-row",
                        onRowClick && "cursor-pointer hover:bg-muted/50",
                        getRowClassName?.(row.original)
                      )
                    }
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isSticky = cell.column.columnDef.sticky;
                      return (
                      <TableCell 
                        key={cell.id}
                        className={isSticky ? "sticky right-0 z-10 bg-card border-l border-border" : ""}
                        style={{
                          width: cell.column.columnDef.size,
                          minWidth: cell.column.columnDef.size,
                          maxWidth: cell.column.columnDef.size,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </React.Fragment>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {tableColumns.map((col, j) => (
                    <TableCell key={`cell-skeleton-${j}`} className={col.sticky ? "sticky right-0 z-10 bg-card border-l border-border" : ""}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-32 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <TablePagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          currentCount={pagination.currentCount}
          totalCount={pagination.totalCount}
          entityName={pagination.entityName}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
