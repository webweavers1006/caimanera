"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/**
 * Sortable column header for DataTable.
 * Supports both external (onSort callback) and internal (TanStack) sorting.
 *
 * @param {Object} props
 * @param {Object} props.column - TanStack column or config object
 * @param {Object} [props.sortConfig] - External sort state { key, direction }
 * @param {Function} [props.onSort] - External sort handler (key, direction)
 * @param {boolean} [props.sortable=true] - Whether the column is sortable
 * @param {string} [props.sortKey] - Override sort key (defaults to accessorKey)
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Header label
 */
export function SortableHeader({
  column,
  sortConfig,
  onSort,
  sortable = true,
  sortKey,
  className = "",
  children,
}) {
  if (!sortable) return <div className={className}>{children}</div>;

  if (onSort) {
    const key = sortKey || column.id;
    const dir = sortConfig?.key === key ? sortConfig.direction : null;
    return (
      <div
        className={`flex items-center cursor-pointer hover:text-foreground transition-colors ${className}`}
        onClick={() => onSort(key, dir === "asc" ? "desc" : "asc")}
      >
        {children}
        {dir === "asc" && <ArrowUp className="ml-2 h-4 w-4 text-primary font-bold" />}
        {dir === "desc" && <ArrowDown className="ml-2 h-4 w-4 text-primary font-bold" />}
        {!dir && <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/30" />}
      </div>
    );
  }

  const isSorted = column.getIsSorted?.();
  return (
    <div
      className={`flex items-center cursor-pointer hover:text-foreground transition-colors ${className}`}
      onClick={() => column.toggleSorting?.(isSorted === "asc")}
    >
      {children}
      {isSorted === "asc" && <ArrowUp className="ml-2 h-4 w-4 text-primary" />}
      {isSorted === "desc" && <ArrowDown className="ml-2 h-4 w-4 text-primary" />}
      {!isSorted && <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />}
    </div>
  );
}
