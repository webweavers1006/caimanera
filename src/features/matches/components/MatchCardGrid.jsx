"use client";

import { MatchCard } from "./MatchCard";
import { TablePagination } from "@/components/shared/table/TablePagination";
import { MATCH_CONFIG } from "../config/match.constants";

/**
 * Responsive grid of match cards with pagination.
 */
export function MatchCardGrid({ items, isPending, pagination, filters, handlers }) {
  const { LABELS } = MATCH_CONFIG.UI;

  if ((!items || items.length === 0) && !isPending) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        {filters.searchTerm ? LABELS.TABLE.EMPTY_SEARCH : LABELS.TABLE.EMPTY}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
          isPending ? "opacity-70" : "opacity-100"
        }`}
      >
        {items?.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      <TablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlers.handlePageChange}
        currentCount={(items || []).length}
        totalCount={pagination.totalCount}
        entityName={LABELS.TABLE.NAME.toLowerCase()}
        isLoading={isPending}
      />
    </div>
  );
}
