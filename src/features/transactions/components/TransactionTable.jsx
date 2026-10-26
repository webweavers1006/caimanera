"use client";

import { useMemo } from "react";
import { useTransactionTableFilters } from "../hooks/use-transaction-table-filters";
import { getTransactionTableColumns } from "../config/transaction.columns";
import { TransactionTableView } from "./TransactionTableView";

export function TransactionTable({ data, pagination }) {
  const { isPending, filters, paginationState, sortConfig, handlers } =
    useTransactionTableFilters(pagination);

  const columns = useMemo(() => getTransactionTableColumns(), []);

  return (
    <TransactionTableView
      items={data}
      isPending={isPending}
      pagination={paginationState}
      filters={filters}
      sortConfig={sortConfig}
      handlers={handlers}
      columns={columns}
    />
  );
}
