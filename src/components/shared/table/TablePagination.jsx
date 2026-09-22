"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Generic table pagination.
 * @param {Object} props
 * @param {number} props.currentPage - Current page (1-based).
 * @param {number} props.totalPages - Total pages.
 * @param {Function} props.onPageChange - Page change callback.
 * @param {number} props.currentCount - Number of items currently displayed.
 * @param {number} props.totalCount - Total filtered item count.
 * @param {string} [props.entityName="registros"] - Entity plural name for display text.
 * @param {boolean} [props.isLoading=false] - Loading state.
 */
export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  currentCount,
  totalCount,
  entityName = "registros",
  isLoading = false,
}) {
  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className={`text-sm text-muted-foreground transition-opacity ${isLoading ? "animate-pulse opacity-70" : "opacity-100"}`}>
        Mostrando {currentCount} de {totalCount} {entityName}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0 || isLoading}
        >
          <span>Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
