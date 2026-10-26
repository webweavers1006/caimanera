import { EntityPageContainer } from "@/components/shared/EntityPageContainer";
import { fetchTransactionsList } from "../services/transaction.read.service";
import { TransactionTable } from "./TransactionTable";
import { TRANSACTION_CONFIG } from "../config/transaction.constants";

export async function TransactionPageContainer({ searchParams }) {
  return (
    <EntityPageContainer
      config={TRANSACTION_CONFIG}
      searchParams={searchParams}
      fetchData={fetchTransactionsList}
      defaultSort={{ key: "createdAt", direction: "desc" }}
      renderTable={({ data, pagination }) => (
        <TransactionTable data={data} pagination={pagination} />
      )}
    />
  );
}
