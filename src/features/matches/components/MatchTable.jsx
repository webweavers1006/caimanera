"use client";

import { useMatchDialogs } from "../hooks/use-match-table-dialogs";
import { useMatchTableFilters } from "../hooks/use-match-table-filters";
import { MatchTableView } from "./MatchTableView";

export function MatchTable({ data, pagination }) {
  const dialogState = useMatchDialogs();
  const { isPending, filters, paginationState, handlers } = useMatchTableFilters(pagination);

  return (
    <MatchTableView
      items={data}
      isPending={isPending}
      pagination={paginationState}
      filters={filters}
      handlers={handlers}
      dialogState={dialogState}
    />
  );
}
